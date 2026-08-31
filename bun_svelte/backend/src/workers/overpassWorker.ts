/*
 * overpassWorker.ts
 * BullMQ Worker Consumer for Overpass POI & Road Sync Jobs in TypeScript
 */

import { Worker } from "bullmq";
import { redisOptions } from "../config/redisConfig.js";
import { OVERPASS_QUEUE_NAME, JOB_TYPE_SYNC_ROADS, JOB_TYPE_SYNC_POI } from "../queues/overpassQueue.js";
import { syncProtocolRoadsService } from "../services/roadService.js";
import { poiCronDetectionService } from "../services/poi/POICronDetectionService.js";
import { auditLogger } from "../utils/AuditLogger.js";
import { cronRepository } from "../repositories/cronRepository.js";

console.log("⚙️ [BULLMQ WORKER] Memulai Overpass Background Sync Worker...");

export const overpassWorker = new Worker(
  OVERPASS_QUEUE_NAME,
  async (job) => {
    console.log(`🚀 [BULLMQ WORKER] Memproses Job ID '${job.id}' (${job.name}) - Attempt ${job.attemptsMade + 1}...`);
    const startTime = Date.now();
    await job.updateProgress(10);

    let result: any = null;

    if (job.name === JOB_TYPE_SYNC_ROADS) {
      await job.updateProgress(30);
      result = await syncProtocolRoadsService();
      await job.updateProgress(100);
    } else if (job.name === JOB_TYPE_SYNC_POI) {
      await job.updateProgress(30);
      result = await poiCronDetectionService.detectNewPois();
      await job.updateProgress(100);
    } else {
      throw new Error(`Job type '${job.name}' tidak dikenali.`);
    }

    const durationMs = Date.now() - startTime;
    return { ...result, durationMs };
  },
  {
    connection: redisOptions as any,
    concurrency: 1,
  }
);

overpassWorker.on("completed", async (job, result) => {
  console.log(`✅ [BULLMQ WORKER] Job ID '${job.id}' (${job.name}) Selesai dalam ${result.durationMs}ms!`);

  await cronRepository.createLog({
    cron_key: job.name === JOB_TYPE_SYNC_ROADS ? "ROAD_SYNC" : "POI_SYNC",
    status: "SUCCESS",
    duration_ms: result.durationMs,
    message: `BullMQ Worker berhasil memproses job ID ${job.id}: ${result.message || "Done"}`,
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
    await cronRepository.createLog({
      cron_key: job.name === JOB_TYPE_SYNC_ROADS ? "ROAD_SYNC" : "POI_SYNC",
      status: "FAILED",
      duration_ms: 0,
      message: `BullMQ Worker gagal memproses job ID ${job.id} (Attempt ${job.attemptsMade}): ${err.message}`,
    });

    await auditLogger.logAction({
      action: "BULLMQ_JOB_FAILED",
      entityType: "BULLMQ",
      entityId: job.id,
      details: { job_name: job.name, job_id: job.id, error: err.message },
      status: "FAILED",
    });
  }
});
