/*
 * overpassWorker.ts
 *
 * BullMQ Worker Consumer for Overpass Pipeline in TypeScript
 * Executes the 11-stage Spatial ETL Pipeline with:
 * 1. Distributed Lock Ownership Lease & Periodic Heartbeat Renewal
 * 2. True CAS Concurrency Conflict Handling
 * 3. Safe Token-Based Lock Release
 * 4. Granular Job Status Auditing (COMPLETED, FAILED, CONCURRENCY_CONFLICT, LOCK_LOST)
 */

import { Worker } from "bullmq";
import { redisOptions } from "../config/redisConfig.js";
import {
  OVERPASS_QUEUE_NAME,
  JOB_TYPE_SYNC_ROADS,
  JOB_TYPE_SYNC_TOLL,
  JOB_TYPE_SYNC_POI,
  acquireSyncLock,
  SyncLockLease,
} from "../queues/overpassQueue.js";
import { spatialETLPipelineService } from "../services/spatial/SpatialETLPipelineService.js";
import { datasetSyncJobRepository } from "../repositories/datasetSyncJobRepository.js";
import { auditLogger } from "../utils/AuditLogger.js";
import { cronRepository } from "../repositories/cronRepository.js";

console.log("⚙️ [BULLMQ WORKER] Memulai Overpass Background Sync Worker...");

export const overpassWorker = new Worker(
  OVERPASS_QUEUE_NAME,
  async (job) => {
    console.log(`🚀 [BULLMQ WORKER] Memproses Job ID '${job.id}' (${job.name}) - Attempt ${job.attemptsMade + 1}...`);
    const startTime = Date.now();
    const datasetType = job.data?.datasetType || (job.name === JOB_TYPE_SYNC_POI ? "POI" : "TOLL_ROADS");

    let lockLease: SyncLockLease | null = null;
    let lockToken = job.data?.lockToken;

    // Acquire lock if not already provided by the enqueue trigger
    if (!lockToken) {
      const lockRes = await acquireSyncLock(datasetType);
      if (!lockRes.acquired || !lockRes.token) {
        const err: any = new Error(`Tidak dapat memperoleh distributed lock untuk dataset '${datasetType}'.`);
        err.code = "LOCK_ACQUIRE_FAILED";
        throw err;
      }
      lockToken = lockRes.token;
    }

    lockLease = new SyncLockLease(datasetType, lockToken);
    lockLease.startHeartbeat(() => {
      console.error(`🚨 [LOCK_LOST] Worker Job ID '${job.id}' kehilangan distributed lock untuk '${datasetType}'!`);
    });

    let result: any = null;

    try {
      if (job.name === JOB_TYPE_SYNC_POI) {
        result = await spatialETLPipelineService.syncPoisPipeline(
          job.id as string,
          job.data?.cityName,
          async (progress) => {
            await job.updateProgress(progress);
          },
          lockLease,
          job.data?.expectedActiveVersionId,
          job.data?.bbox
        );
      } else if (job.name === JOB_TYPE_SYNC_TOLL) {
        result = await spatialETLPipelineService.syncTollRoadsPipeline(
          job.id as string,
          async (progress) => {
            await job.updateProgress(progress);
          },
          lockLease,
          job.data?.expectedActiveVersionId,
          job.data?.cities,
          job.data?.bbox
        );
      } else if (job.name === JOB_TYPE_SYNC_ROADS) {
        result = await spatialETLPipelineService.syncProtocolRoadsPipeline(
          job.id as string,
          job.data?.cities,
          async (progress) => {
            await job.updateProgress(progress);
          },
          lockLease,
          job.data?.expectedActiveVersionId,
          job.data?.bbox
        );
      } else {
        throw new Error(`Job type '${job.name}' tidak dikenali.`);
      }

      const durationMs = Date.now() - startTime;
      return { ...result, durationMs };
    } finally {
      if (lockLease) {
        await lockLease.release();
      }
    }
  },
  {
    connection: redisOptions as any,
    concurrency: 1, // Single-threaded per worker to eliminate race conditions
  }
);

overpassWorker.on("completed", async (job, result) => {
  console.log(`✅ [BULLMQ WORKER] Job ID '${job.id}' (${job.name}) Selesai dalam ${result?.durationMs || 0}ms!`);

  await cronRepository.createLog({
    cron_key: job.name === JOB_TYPE_SYNC_POI ? "POI_SYNC" : "ROAD_SYNC",
    status: "SUCCESS",
    duration_ms: result?.durationMs || 0,
    message: `BullMQ Worker berhasil memproses job ID ${job.id}: Versi ${result?.version || "N/A"} ACTIVE`,
  });

  await auditLogger.logAction({
    action: "BULLMQ_JOB_COMPLETED",
    entityType: "BULLMQ",
    entityId: job.id,
    details: { job_name: job.name, job_id: job.id, result },
  });
});

overpassWorker.on("failed", async (job, err) => {
  console.error(`💥 [BULLMQ WORKER] Job ID '${job?.id}' (${job?.name}) Gagal: ${err.message}`);

  if (job) {
    let failureStatus: any = "FAILED";
    if (err.message.includes("OPTIMISTIC_CONCURRENCY_CONFLICT") || (err as any).code === "CONCURRENCY_CONFLICT") {
      failureStatus = "CONCURRENCY_CONFLICT";
      console.warn(`⚠️ [CONCURRENCY_CONFLICT] Job '${job.id}' dibatalkan karena versi baseline telah berubah.`);
    } else if (err.message.includes("DISTRIBUTED_LOCK_LOST") || (err as any).code === "LOCK_LOST") {
      failureStatus = "LOCK_LOST";
      console.warn(`🚨 [LOCK_LOST] Job '${job.id}' dibatalkan karena kehilangan hak kepemilikan lock.`);
    }

    await datasetSyncJobRepository.updateJob(job.id as string, {
      status: failureStatus,
      error_details: { code: (err as any).code || failureStatus, message: err.message, stack: err.stack },
      completed_at: new Date(),
    });

    await cronRepository.createLog({
      cron_key: job.name === JOB_TYPE_SYNC_POI ? "POI_SYNC" : "ROAD_SYNC",
      status: failureStatus,
      duration_ms: 0,
      message: `BullMQ Worker gagal memproses job ID ${job.id} (${failureStatus}): ${err.message}`,
    });

    await auditLogger.logAction({
      action: "BULLMQ_JOB_FAILED",
      entityType: "BULLMQ",
      entityId: job.id,
      details: { job_name: job.name, job_id: job.id, error: err.message, code: failureStatus },
      status: failureStatus,
    });
  }
});
