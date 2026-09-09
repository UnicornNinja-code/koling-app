/*
 * dssBatchWorker.js
 * BullMQ Worker for Processing Asynchronous DSS Batch Jobs & Snapshot Generation
 */

import { Worker } from "bullmq";
import { redisOptions } from "../config/redisConfig.js";
import { hybridBwmTopsisService } from "../services/dss/HybridBwmTopsisService.js";

export const dssBatchWorker = new Worker(
  "dss-batch-queue",
  async (job) => {
    console.log(`⚙️ [BullMQ Worker] Processing Job ID '${job.id}' (${job.name})...`);

    const { zone_ids, time_slot, bwm_config_id, save_snapshot = true } = job.data;

    const result = await hybridBwmTopsisService.evaluateZonesHybrid({
      zone_ids: zone_ids || null,
      time_slot: time_slot || null,
      bwm_config_id: bwm_config_id || null,
      save_snapshot: save_snapshot,
    });

    console.log(`✅ [BullMQ Worker] Job '${job.id}' Finished. Snapshot ID: ${result.snapshot_id || "N/A"}`);
    return result;
  },
  {
    connection: redisOptions,
    concurrency: 5, // Concurrent worker processing
  }
);

dssBatchWorker.on("completed", (job, result) => {
  console.log(`🎉 [BullMQ Queue] Job '${job.id}' completed successfully.`);
});

dssBatchWorker.on("failed", (job, err) => {
  console.error(`❌ [BullMQ Queue] Job '${job?.id}' failed after ${job?.attemptsMade} attempts:`, err.message);
});
