/*
 *   Copyright (c) 2026 
 *   All rights reserved.
 *   notificationWorker.js (BullMQ Worker Consumer for Asynchronous Notification Dispatching)
 */

import { Worker } from "bullmq";
import { redisOptions } from "../config/redisConfig.js";
import {
  NOTIFICATION_QUEUE_NAME,
  NOTIF_TYPE_RIDER_ASSIGNED,
  NOTIF_TYPE_GEOFENCE_ALERT,
  NOTIF_TYPE_SYSTEM_BROADCAST,
} from "../queues/notificationQueue.js";
import { socketManager } from "../socket/socketManager.js";
import { sendRiderAssignmentNotification } from "../socket/armadaLockSocketHandler.js";
import { auditLogger } from "../utils/AuditLogger.js";

console.log("⚙️ [BULLMQ WORKER] Memulai Notification Background Worker...");

export const notificationWorker = new Worker(
  NOTIFICATION_QUEUE_NAME,
  async (job) => {
    console.log(`🔔 [NOTIF WORKER] Memproses Job ID '${job.id}' (${job.name})...`);
    const data = job.data;

    if (job.name === NOTIF_TYPE_RIDER_ASSIGNED) {
      sendRiderAssignmentNotification({
        assignmentId: data.assignmentId,
        riderId: data.riderId,
        zoneName: data.zoneName,
        topsisRank: data.topsisRank,
        assignmentType: data.assignmentType,
      });
    } else if (job.name === NOTIF_TYPE_GEOFENCE_ALERT) {
      socketManager.broadcastToSupervisors("supervisor:geofence_alert", data.warningPayload);
    } else if (job.name === NOTIF_TYPE_SYSTEM_BROADCAST) {
      socketManager.broadcastAll("system:announcement", {
        type: "SYSTEM_ANNOUNCEMENT",
        title: data.title,
        message: data.message,
        timestamp: new Date().toISOString(),
      });
    } else {
      throw new Error(`Notification job type '${job.name}' tidak dikenali.`);
    }

    return { delivered: true, type: job.name };
  },
  {
    connection: redisOptions,
    concurrency: 5,
    limiter: {
      max: 20,
      duration: 1000, // Maximum 20 notifications per second
    },
  }
);

notificationWorker.on("completed", async (job, result) => {
  console.log(`✅ [NOTIF WORKER COMPLETED] Notifikasi ID '${job.id}' (${job.name}) Berhasil Dikirim!`);

  await auditLogger.logAction({
    action: "NOTIFICATION_DELIVERED",
    entityType: "NOTIFICATION",
    entityId: job.id,
    details: { job_name: job.name, result },
  });
});

notificationWorker.on("failed", async (job, err) => {
  console.error(`💥 [NOTIF WORKER FAILED] Notifikasi ID '${job?.id}' Gagal: ${err.message}`);
});
