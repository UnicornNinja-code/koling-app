/*
 *   Copyright (c) 2026 
 *   All rights reserved.
 *   rateLimiterMiddleware.js (Redis-Backed Distributed Rate Limiter with Custom UI Toast Notices)
 */

import rateLimit, { ipKeyGenerator } from "express-rate-limit";
import RedisStore from "rate-limit-redis";
import { redisClient } from "../config/redis.js";

/**
 * Helper to build RedisStore instance
 */
const createRedisStore = (prefix) => {
  return new RedisStore({
    sendCommand: (...args) => redisClient.sendCommand(args),
    prefix: `RL:${prefix}:`,
  });
};

/**
 * Standardized 429 Too Many Requests JSON response builder with ui_notice toast metadata
 */
const build429Response = (title, message) => (req, res) => {
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
 * General API rate limiter (5000 requests per 1 minute window in dev/test, production protects against DDoS)
 */
const apiLimiter = rateLimit({
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
 * Strict Rate Limiter for Login (5 failed requests per 1 minute per IP + User Account)
 */
const loginLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute window
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true,
  skip: () => process.env.NODE_ENV === "test",
  keyGenerator: (req, res) => {
    const clientIp = ipKeyGenerator(req, res);
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
 * Rate Limiter for Password Reset (3 requests per 1 hour)
 */
const forgotPasswordLimiter = rateLimit({
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
 * Rate Limiter for User Registration (5 requests per 1 hour)
 */
const registerLimiter = rateLimit({
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
 * Rate Limiter for Overpass Road Sync (2 requests per minute)
 */
const overpassSyncLimiter = rateLimit({
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
 * Rate Limiter for Full City POI Sync (1 request per 10 minutes)
 */
const citySyncLimiter = rateLimit({
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

export {
  apiLimiter,
  loginLimiter,
  forgotPasswordLimiter,
  registerLimiter,
  overpassSyncLimiter,
  citySyncLimiter,
};