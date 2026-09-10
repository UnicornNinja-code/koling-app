/*
 *   Copyright (c) 2026 
 *   All rights reserved.
 *   overpassQueue.js (BullMQ Queue Producer for Asynchronous Overpass POI & Road Sync)
 */

import { Queue } from "bullmq";
import { redisOptions } from "../config/redisConfig.js";

export const OVERPASS_QUEUE_NAME = "overpassSyncQueue";
export const JOB_TYPE_SYNC_ROADS = "JOB_SYNC_ROADS";
export const JOB_TYPE_SYNC_POI = "JOB_SYNC_POI";

export const overpassSyncQueue = new Queue(OVERPASS_QUEUE_NAME, {
  connection: redisOptions,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: "exponential",
      delay: 5000, // 5s, 10s, 20s backoff
    },
    removeOnComplete: { age: 86400, count: 100 },
    removeOnFail: { age: 86400 * 7, count: 500 },
  },
});

/**
 * Add Road Sync Job to BullMQ Queue
 */
export const addRoadSyncJob = async ({ cityName = "Sidoarjo", userId = null } = {}) => {
  const job = await overpassSyncQueue.add(JOB_TYPE_SYNC_ROADS, {
    type: JOB_TYPE_SYNC_ROADS,
    cityName,
    userId,
    triggeredAt: new Date().toISOString(),
  });
  console.log(`📥 [BULLMQ QUEUE] Job '${JOB_TYPE_SYNC_ROADS}' dimasukkan ke antrean (ID: ${job.id})`);
  return job;
};

/**
 * Add POI Scan Sync Job to BullMQ Queue
 */
export const addPoiSyncJob = async ({ cityName = "Sidoarjo", userId = null } = {}) => {
  const job = await overpassSyncQueue.add(JOB_TYPE_SYNC_POI, {
    type: JOB_TYPE_SYNC_POI,
    cityName,
    userId,
    triggeredAt: new Date().toISOString(),
  });
  console.log(`📥 [BULLMQ QUEUE] Job '${JOB_TYPE_SYNC_POI}' dimasukkan ke antrean (ID: ${job.id})`);
  return job;
};

/**
 * Fetch Job Status & State
 */
export const getJobStatus = async (jobId) => {
  const job = await overpassSyncQueue.getJob(jobId);
  if (!job) return null;

  const state = await job.getState();
  const progress = job.progress;
  const reason = job.failedReason;
  const returnvalue = job.returnvalue;

  return {
    id: job.id,
    name: job.name,
    data: job.data,
    state, // 'waiting' | 'active' | 'completed' | 'failed' | 'delayed'
    progress,
    result: returnvalue || null,
    error: reason || null,
    timestamp: job.timestamp,
    processedOn: job.processedOn,
    finishedOn: job.finishedOn,
  };
};
