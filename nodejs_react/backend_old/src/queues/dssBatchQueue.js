/*
 * dssBatchQueue.js
 * BullMQ Job Queue for Asynchronous Batch DSS Evaluations & Scheduled Snapshot Persistence
 */

import { Queue } from "bullmq";
import { redisOptions } from "../config/redisConfig.js";

export const dssBatchQueue = new Queue("dss-batch-queue", {
  connection: redisOptions,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: "exponential",
      delay: 1000, // Initial delay 1s (1s, 2s, 4s)
    },
    removeOnComplete: 100, // Retain last 100 completed jobs
    removeOnFail: 200, // Retain last 200 failed jobs for audit
  },
});
