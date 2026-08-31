/*
 *   Copyright (c) 2026 
 *   All rights reserved.
 *   CronManagerService.js (Clean Architecture Singleton Service for Cron Job Scheduler & Management)
 *   Integrates Dynamic Database Control, Performance Measurement, & Audit Trail.
 */

import crypto from "crypto";
import { cronRepository } from "../../repositories/cronRepository.js";
import { pool } from "../../config/database.js";
import { redisClient } from "../../config/redis.js";
import { poiWeatherService } from "../poi/POIWeatherService.js";
import { poiCronDetectionService } from "../poi/POICronDetectionService.js";
import { auditLogger } from "../../utils/AuditLogger.js";

export class CronManagerService {
  static instance = null;

  constructor(repo = cronRepository) {
    if (CronManagerService.instance && repo === cronRepository) {
      return CronManagerService.instance;
    }
    this.repo = repo;
    this.intervalHandles = {};
    if (repo === cronRepository) {
      CronManagerService.instance = this;
    }
  }

  static getInstance() {
    if (!CronManagerService.instance) {
      CronManagerService.instance = new CronManagerService();
    }
    return CronManagerService.instance;
  }

  /**
   * Fetch all cron configurations with status overview
   */
  async getCronConfigs() {
    const configs = await this.repo.getAllConfigs();
    return { configs, count: configs.length };
  }

  /**
   * Fetch execution logs
   */
  async getCronLogs({ cronKey, limit = 50 }) {
    const logs = await this.repo.getLogs({ cronKey, limit });
    return { logs, count: logs.length };
  }

  /**
   * Toggle cron job active state dynamically
   */
  async toggleCronActive(cronKey, isActive) {
    const config = await this.repo.getConfigByKey(cronKey);
    if (!config) {
      const error = new Error(`Cron configuration dengan key '${cronKey}' tidak ditemukan.`);
      error.statusCode = 404;
      throw error;
    }

    const updated = await this.repo.updateConfig(cronKey, { is_active: isActive });

    await auditLogger.logAction({
      action: "CRON_CONFIG_TOGGLED",
      entityType: "CRON",
      entityId: cronKey,
      details: { cron_key: cronKey, is_active: isActive },
    });

    console.log(`⚙️ [CRON MANAGER] Cron '${cronKey}' status diubah menjadi: ${isActive ? "ACTIVE ✅" : "INACTIVE 🛑"}`);
    return updated;
  }

  /**
   * Worker Task 1: Release expired ticket-booking armada holds (reserved_until < NOW())
   */
  async taskReleaseExpiredArmadaHolds() {
    const query = `
      UPDATE armadas
      SET 
        status = 'ACTIVE',
        reserved_by_rider_id = NULL,
        reserved_until = NULL,
        updated_at = CURRENT_TIMESTAMP
      WHERE status = 'RESERVED'
        AND reserved_until IS NOT NULL
        AND reserved_until < NOW()
      RETURNING id, code;
    `;
    const { rows } = await pool.query(query);
    if (rows.length > 0) {
      console.log(`⏰ [CRON WORKER: ARMADA_RELEASE] Otomatis melepaskan ${rows.length} armada yang kadaluarsa (> 5 min): ${rows.map((r) => r.code).join(", ")}`);
    }
    return { released_count: rows.length, released_units: rows };
  }

  /**
   * Worker Task 2: Batch Open-Meteo Weather Sync for active zone centroids
   */
  async taskWeatherSync() {
    const result = await poiWeatherService.syncAllZonesWeather();
    return { sync_result: result };
  }

  /**
   * Worker Task 3: Automated POI Scan & Detection
   */
  async taskPoiSync() {
    const result = await poiCronDetectionService.runCronPOIDetection();
    return { poi_result: result };
  }

  /**
   * Worker Task 4: Daily Session & Stale Queue Cleanup
   */
  async taskDailyCleanup() {
    // Close stale assignments older than 24 hours
    const query = `
      UPDATE zone_assignments
      SET status = 'CANCELLED'
      WHERE status IN ('ASSIGNED', 'CHECKED_IN')
        AND assignment_date < CURRENT_DATE
      RETURNING id;
    `;
    const { rows } = await pool.query(query);
    console.log(`🧹 [CRON WORKER: DAILY_CLEANUP] Otomatis menutup ${rows.length} sesi operasional kadaluarsa.`);
    return { cleaned_sessions_count: rows.length };
  }

  /**
   * Execute single cron task safely with performance measurement & logging
   */
  async executeCronTask(cronKey, isManual = false) {
    const config = await this.repo.getConfigByKey(cronKey);
    if (!config) {
      const error = new Error(`Cron configuration '${cronKey}' tidak ditemukan.`);
      error.statusCode = 404;
      throw error;
    }

    if (!config.is_active && !isManual) {
      console.log(`🛑 [CRON SKIPPED] Cron '${cronKey}' sedang NON-AKTIF.`);
      return { skipped: true, reason: "Cron is inactive" };
    }

    // Redis Distributed Lock to prevent multi-instance race condition / duplicate execution
    const lockKey = `lock:cron:${cronKey}`;
    const lockToken = crypto.randomUUID();
    const lockTtlMs = 60000; // 60s TTL
    let lockAcquired = false;

    if (redisClient && (redisClient.isOpen || redisClient.isReady)) {
      try {
        const lockRes = await redisClient.set(lockKey, lockToken, {
          NX: true,
          PX: lockTtlMs,
        });
        if (lockRes === "OK" || lockRes === true) {
          lockAcquired = true;
        }
      } catch (err) {
        console.warn(`⚠️ Warning: Gagal memproses Redis Lock untuk cron '${cronKey}':`, err.message);
      }
    } else {
      // Fallback if Redis is unavailable: proceed safely
      lockAcquired = true;
    }

    if (!lockAcquired && !isManual) {
      console.log(`🔒 [CRON LOCK SKIPPED] Task '${cronKey}' sedang dieksekusi oleh instance backend lain.`);
      return { skipped: true, reason: "Task locked by another backend instance" };
    }

    // Start Lock Auto-Renewal Heartbeat Timer (Renews TTL every 20s while task is actively running)
    let renewTimer = null;
    const renewIntervalMs = 20000;
    if (lockAcquired && redisClient && (redisClient.isOpen || redisClient.isReady)) {
      renewTimer = setInterval(async () => {
        try {
          const currentToken = await redisClient.get(lockKey);
          if (currentToken === lockToken) {
            await redisClient.expire(lockKey, Math.ceil(lockTtlMs / 1000));
          } else {
            clearInterval(renewTimer);
          }
        } catch (e) {
          console.warn(`⚠️ Warning renewing lock '${cronKey}':`, e.message);
        }
      }, renewIntervalMs);
    }

    const startTime = Date.now();
    let status = "SUCCESS";
    let message = "";
    let taskResult = null;

    try {
      console.log(`🚀 [CRON EXECUTING] Memulai tugas '${cronKey}' (${isManual ? "MANUAL ON-DEMAND" : "SCHEDULED"})...`);

      switch (cronKey) {
        case "ARMADA_RELEASE":
          taskResult = await this.taskReleaseExpiredArmadaHolds();
          message = `Berhasil melepaskan ${taskResult.released_count} unit armada kadaluarsa.`;
          break;
        case "WEATHER_SYNC":
          taskResult = await this.taskWeatherSync();
          message = "Berhasil memperbarui cache cuaca Open-Meteo batch.";
          break;
        case "POI_SYNC":
          taskResult = await this.taskPoiSync();
          message = "Berhasil memindai POI baru via Overpass API.";
          break;
        case "DAILY_CLEANUP":
          taskResult = await this.taskDailyCleanup();
          message = `Berhasil melepaskan ${taskResult.cleaned_sessions_count} sesi kadaluarsa.`;
          break;
        default:
          message = "Tugas cron umum dieksekusi.";
      }
    } catch (error) {
      status = "FAILED";
      message = error.message || "Unknown error during cron execution";
      console.error(`💥 [CRON FAILED] Tugas '${cronKey}' gagal:`, error);
    } finally {
      if (renewTimer) {
        clearInterval(renewTimer);
      }
      // Release lock safely if token ownership matches
      if (lockAcquired && redisClient && (redisClient.isOpen || redisClient.isReady)) {
        try {
          const currentToken = await redisClient.get(lockKey);
          if (currentToken === lockToken) {
            await redisClient.del(lockKey);
          }
        } catch (e) {}
      }
    }

    const durationMs = Date.now() - startTime;

    // Update config last_run_at timestamp & write execution log
    await this.repo.updateConfig(cronKey, { last_run_at: new Date() });
    const logEntry = await this.repo.createLog({
      cron_key: cronKey,
      status,
      duration_ms: durationMs,
      message,
    });

    await auditLogger.logAction({
      action: "CRON_EXECUTED",
      entityType: "CRON",
      entityId: cronKey,
      details: {
        cron_key: cronKey,
        status,
        duration_ms: durationMs,
        is_manual: isManual,
        message,
      },
      status,
    });

    console.log(`✅ [CRON COMPLETED] '${cronKey}' Selesai dalam ${durationMs}ms -> Status: ${status}`);

    return {
      cron_key: cronKey,
      status,
      duration_ms: durationMs,
      message,
      task_result: taskResult,
      log: logEntry,
    };
  }

  /**
   * Trigger Cron Job Manually On-Demand (Superadmin Action)
   */
  async triggerCronManually(cronKey) {
    return await this.executeCronTask(cronKey, true);
  }
}

export const cronManagerService = CronManagerService.getInstance();
