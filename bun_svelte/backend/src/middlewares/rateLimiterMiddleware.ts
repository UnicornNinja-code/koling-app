/*
 * rateLimiterMiddleware.ts
 * Redis-Backed Distributed Rate Limiter with Custom UI Toast Notices in TypeScript
 */

import rateLimit from "express-rate-limit";
import RedisStore from "rate-limit-redis";
import { redisClient } from "../config/redis.js";
import type { Request, Response } from "express";

/**
 * Helper to build RedisStore instance
 */
const createRedisStore = (prefix: string) => {
  return new RedisStore({
    sendCommand: (...args: string[]) => (redisClient as any).sendCommand(args),
    prefix: `RL:${prefix}:`,
  });
};

/**
 * Standardized 429 Too Many Requests JSON response builder with ui_notice toast metadata
 */
const build429Response = (title: string, message: string) => (req: Request, res: Response) => {
  return res.status(429).json({
    status: "error",
    statusCode: 429,
    msg: message,
    ui_notice: {
      type: "warning",
      title: title || "Batas Request Terlampaui",
      message,
    },
  });
};

/**
 * General API rate limiter
 */
export const apiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: process.env.NODE_ENV === "production" ? 1000 : 10000,
  standardHeaders: true,
  legacyHeaders: false,
  store: createRedisStore("GLOBAL_API"),
  handler: build429Response(
    "Trafik Terlalu Tinggi",
    "Batas penggunaan API tercapai. Harap tunggu beberapa saat sebelum mencoba lagi."
  ),
  skip: (req) => process.env.NODE_ENV === "test" || req.headers["x-test-suite"] === "true",
});

/**
 * Strict Rate Limiter for Login
 */
export const loginLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true,
  validate: { keyGeneratorIpFallback: false, ip: false },
  skip: () => process.env.NODE_ENV === "test",
  keyGenerator: (req) => {
    const clientIp = req.ip || req.socket.remoteAddress || "127.0.0.1";
    const identifier = req.body?.identifier || req.body?.email || "anonymous";
    return `${clientIp}:${identifier}`;
  },
  store: createRedisStore("AUTH_LOGIN"),
  handler: build429Response(
    "Batas Login Terlampaui",
    "Batas percobaan login gagal terlampaui. Harap tunggu 1 menit sebelum mencoba kembali."
  ),
});

/**
 * Rate Limiter for Password Reset
 */
export const forgotPasswordLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 3,
  standardHeaders: true,
  legacyHeaders: false,
  skip: () => process.env.NODE_ENV === "test",
  store: createRedisStore("AUTH_FORGOT"),
  handler: build429Response(
    "Batas Reset Password",
    "Batas pengajuan reset password tercapai. Harap coba lagi dalam 1 jam."
  ),
});

/**
 * Rate Limiter for User Registration
 */
export const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  skip: () => process.env.NODE_ENV === "test",
  store: createRedisStore("AUTH_REGISTER"),
  handler: build429Response(
    "Batas Pendaftaran Akun",
    "Batas pendaftaran akun baru terlampaui. Harap tunggu 1 jam."
  ),
});

/**
 * Rate Limiter for Overpass Road Sync
 */
export const overpassSyncLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 2,
  standardHeaders: true,
  legacyHeaders: false,
  skip: () => process.env.NODE_ENV === "test",
  store: createRedisStore("OVERPASS_ROAD"),
  handler: build429Response(
    "Batas Sinkronisasi Jalan",
    "Batas sinkronisasi jalan Overpass tercapai. Maksimal 2 request per menit."
  ),
});

/**
 * Rate Limiter for Full City POI Sync
 */
export const citySyncLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 1,
  standardHeaders: true,
  legacyHeaders: false,
  skip: () => process.env.NODE_ENV === "test",
  store: createRedisStore("OVERPASS_CITY"),
  handler: build429Response(
    "Batas Sinkronisasi POI Kota",
    "Batas sinkronisasi POI skala kota tercapai. Maksimal 1 kali request per 10 menit."
  ),
});
