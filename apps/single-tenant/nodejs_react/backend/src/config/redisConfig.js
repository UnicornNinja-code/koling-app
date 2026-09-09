/*
 *   Copyright (c) 2026 
 *   All rights reserved.
 *   redisConfig.js (Shared ioredis configuration for BullMQ Queues and Workers)
 */

import Redis from "ioredis";
import dotenv from "dotenv";

dotenv.config();

export const redisOptions = {
  host: process.env.REDIS_HOST || "127.0.0.1",
  port: parseInt(process.env.REDIS_PORT || "6379", 10),
  password: process.env.REDIS_PASSWORD || undefined,
  maxRetriesPerRequest: null, // Required by BullMQ
  enableReadyCheck: false,
  retryStrategy: (times) => Math.min(times * 50, 2000),
};

export const createRedisConnection = () => new Redis(redisOptions);

export const sharedRedisConnection = createRedisConnection();
