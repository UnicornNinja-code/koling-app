/*
 * overpassQueue.ts
 *
 * BullMQ Queue Producer for Asynchronous Overpass Ingestion Pipeline in TypeScript
 * Features:
 * 1. Safe Redis Distributed Locking with Unique Ownership Tokens (UUID)
 * 2. Atomic Compare-and-Delete (Safe Release) via Lua Scripts
 * 3. Atomic Compare-and-Expire (Lease Renewal) via Lua Scripts
 * 4. Background Heartbeat & Lost Lock Handling (SyncLockLease)
 * 5. Structured Observability Logging (Safe, Non-Sensitive, Truncated Tokens)
 */

import { Queue } from "bullmq";
import { redisOptions } from "../config/redisConfig.js";
import { redisClient } from "../config/redis.js";
import { datasetSyncJobRepository } from "../repositories/datasetSyncJobRepository.js";
import { datasetVersionRepository } from "../repositories/datasetVersionRepository.js";
import crypto from "crypto";

export const OVERPASS_QUEUE_NAME = "overpassSyncQueue";
export const JOB_TYPE_SYNC_ROADS = "JOB_SYNC_ROADS";
export const JOB_TYPE_SYNC_TOLL = "JOB_SYNC_TOLL";
export const JOB_TYPE_SYNC_POI = "JOB_SYNC_POI";

// Configurable Locking Constants
export const SYNC_LOCK_TTL_MS = 60000; // 60 seconds TTL (Crash Recovery)
export const SYNC_LOCK_HEARTBEAT_INTERVAL_MS = 20000; // 20 seconds Heartbeat

export const overpassSyncQueue = new Queue(OVERPASS_QUEUE_NAME, {
  connection: redisOptions as any,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: "exponential",
      delay: 5000,
    },
    removeOnComplete: { age: 86400, count: 100 },
    removeOnFail: { age: 86400 * 7, count: 500 },
  },
});

/**
 * Acquire Redis distributed lock with Unique Ownership Token (UUID)
 */
export const acquireSyncLock = async (
  datasetType: string,
  ttlMs: number = SYNC_LOCK_TTL_MS
): Promise<{ acquired: boolean; token: string | null }> => {
  const lockKey = `lock:sync:${datasetType.toLowerCase()}`;
  const token = crypto.randomUUID();

  try {
    const result = await (redisClient as any).set(lockKey, token, {
      NX: true,
      PX: ttlMs,
    });

    if (result === "OK") {
      console.log(`🔒 [LOCK_ACQUIRED] Dataset: ${datasetType}, Token: ${token.slice(0, 8)}... (TTL: ${ttlMs}ms)`);
      return { acquired: true, token };
    } else {
      console.warn(`⏳ [LOCK_ACQUIRE_FAILED] Dataset: ${datasetType} sedang dikunci oleh proses lain.`);
      return { acquired: false, token: null };
    }
  } catch (err: any) {
    console.error(`💥 [LOCK_ACQUIRE_ERROR] Gagal acquire lock untuk ${datasetType}:`, err.message);
    return { acquired: false, token: null };
  }
};

/**
 * Atomic Compare-and-Delete: Release lock ONLY if the caller is the legitimate owner
 */
export const releaseSyncLock = async (datasetType: string, token: string): Promise<boolean> => {
  if (!token) return false;
  const lockKey = `lock:sync:${datasetType.toLowerCase()}`;

  // Atomic Lua script: compare and delete
  const luaDel = `
    if redis.call('GET', KEYS[1]) == ARGV[1] then
      return redis.call('DEL', KEYS[1])
    else
      return 0
    end
  `;

  try {
    const result = await (redisClient as any).eval(luaDel, {
      keys: [lockKey],
      arguments: [token],
    });

    const isReleased = result === 1;
    if (isReleased) {
      console.log(`🔓 [LOCK_RELEASED] Dataset: ${datasetType}, Token: ${token.slice(0, 8)}...`);
    } else {
      console.warn(`⚠️ [LOCK_RELEASE_IGNORED] Token ${token.slice(0, 8)}... tidak cocok dengan pemilik lock aktif.`);
    }
    return isReleased;
  } catch (err: any) {
    console.error(`💥 [LOCK_RELEASE_ERROR] Gagal release lock untuk ${datasetType}:`, err.message);
    return false;
  }
};

/**
 * Atomic Compare-and-Expire: Renew lock lease ONLY if the caller is the legitimate owner
 */
export const renewSyncLock = async (
  datasetType: string,
  token: string,
  ttlMs: number = SYNC_LOCK_TTL_MS
): Promise<boolean> => {
  if (!token) return false;
  const lockKey = `lock:sync:${datasetType.toLowerCase()}`;

  // Atomic Lua script: compare and expire
  const luaRenew = `
    if redis.call('GET', KEYS[1]) == ARGV[1] then
      return redis.call('PEXPIRE', KEYS[1], ARGV[2])
    else
      return 0
    end
  `;

  try {
    const result = await (redisClient as any).eval(luaRenew, {
      keys: [lockKey],
      arguments: [token, String(ttlMs)],
    });

    const isRenewed = result === 1;
    if (isRenewed) {
      console.log(`💓 [LOCK_RENEWED] Dataset: ${datasetType}, Token: ${token.slice(0, 8)}... (New TTL: ${ttlMs}ms)`);
    } else {
      console.warn(`⚠️ [LOCK_RENEW_FAILED] Gagal renew: Token ${token.slice(0, 8)}... bukan pemilik lock di Redis.`);
    }
    return isRenewed;
  } catch (err: any) {
    console.error(`💥 [LOCK_RENEW_ERROR] Gagal renew lock untuk ${datasetType}:`, err.message);
    return false;
  }
};

/**
 * Verify if the caller still holds legitimate ownership of the lock
 */
export const verifySyncLock = async (datasetType: string, token: string): Promise<boolean> => {
  if (!token) return false;
  const lockKey = `lock:sync:${datasetType.toLowerCase()}`;
  try {
    const currentToken = await redisClient.get(lockKey);
    return currentToken === token;
  } catch {
    return false;
  }
};

/**
 * SyncLockLease
 * Manages background heartbeat, automatic lease renewal, and lost lock detection
 */
export class SyncLockLease {
  private timer: NodeJS.Timeout | null = null;
  private _isLost: boolean = false;

  constructor(
    public readonly datasetType: string,
    public readonly token: string,
    private ttlMs: number = SYNC_LOCK_TTL_MS,
    private intervalMs: number = SYNC_LOCK_HEARTBEAT_INTERVAL_MS
  ) {}

  /**
   * Start periodic heartbeat lease renewals
   */
  public startHeartbeat(onLost?: () => void): void {
    if (this.timer) return;

    this.timer = setInterval(async () => {
      if (this._isLost) return;

      const renewed = await renewSyncLock(this.datasetType, this.token, this.ttlMs);
      if (!renewed) {
        this._isLost = true;
        this.stopHeartbeat();
        console.error(`🚨 [LOCK_LOST] Worker kehilangan lock untuk dataset '${this.datasetType}'. Lease tidak dapat diperpanjang!`);
        onLost?.();
      }
    }, this.intervalMs);
  }

  /**
   * Stop heartbeat timer
   */
  public stopHeartbeat(): void {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }

  /**
   * Check if lock ownership was lost during execution
   */
  public isLost(): boolean {
    return this._isLost;
  }

  /**
   * Verify with Redis server whether current token is still active
   */
  public async verify(): Promise<boolean> {
    if (this._isLost) return false;
    const ok = await verifySyncLock(this.datasetType, this.token);
    if (!ok) {
      this._isLost = true;
      this.stopHeartbeat();
    }
    return ok;
  }

  /**
   * Release lock safely
   */
  public async release(): Promise<boolean> {
    this.stopHeartbeat();
    return await releaseSyncLock(this.datasetType, this.token);
  }
}

import { operationalContextService } from "../services/spatial/OperationalContextService.js";

/**
 * Enqueue Asynchronous POI Synchronization Pipeline
 */
export const enqueuePoiSyncJob = async ({
  cityName = null,
  userId = null,
  bbox = null,
}: {
  cityName?: string | null;
  userId?: string | number | null;
  bbox?: any;
} = {}) => {
  const datasetType = "POI";
  const { acquired, token } = await acquireSyncLock(datasetType);
  if (!acquired || !token) {
    const error: any = new Error("Sinkronisasi POI sedang berjalan oleh proses lain. Harap tunggu hingga selesai.");
    error.statusCode = 409;
    error.code = "SYNC_ALREADY_IN_PROGRESS";
    throw error;
  }

  try {
    let effectiveCity = cityName;
    let effectiveBbox = bbox;
    if (!effectiveCity) {
      const opContext = await operationalContextService.getOperationalContext();
      effectiveCity = opContext.hubCityName;
      if (!effectiveBbox) effectiveBbox = opContext.bbox;
    }

    const latestVersion = await datasetVersionRepository.getLatestVersionNumber(datasetType);
    const activeVersion = await datasetVersionRepository.findActiveVersion(datasetType);

    const job = await overpassSyncQueue.add(JOB_TYPE_SYNC_POI, {
      type: JOB_TYPE_SYNC_POI,
      datasetType,
      cityName: effectiveCity,
      userId,
      bbox: effectiveBbox,
      lockToken: token,
      expectedActiveVersionId: activeVersion?.id ?? null,
      triggeredAt: new Date().toISOString(),
    });

    await datasetSyncJobRepository.createJob({
      job_id: job.id as string,
      dataset_type: datasetType,
      triggered_by: userId ? String(userId) : null,
      target_version: latestVersion + 1,
      previous_version: activeVersion?.version || null,
    });

    console.log(`📥 [BULLMQ QUEUE] Job '${JOB_TYPE_SYNC_POI}' (${effectiveCity}) dimasukkan ke antrean (ID: ${job.id})`);
    return { jobId: job.id, datasetType, status: "PENDING", lockToken: token, cityName: effectiveCity };
  } catch (err) {
    await releaseSyncLock(datasetType, token);
    throw err;
  }
};

/**
 * Enqueue Asynchronous Toll Roads Synchronization Pipeline
 */
export const enqueueTollSyncJob = async ({
  userId = null,
  cities = null,
  bbox = null,
}: {
  userId?: string | number | null;
  cities?: string[] | null;
  bbox?: any;
} = {}) => {
  const datasetType = "TOLL_ROADS";
  const { acquired, token } = await acquireSyncLock(datasetType);
  if (!acquired || !token) {
    const error: any = new Error("Sinkronisasi Jalan Tol sedang berjalan oleh proses lain. Harap tunggu hingga selesai.");
    error.statusCode = 409;
    error.code = "SYNC_ALREADY_IN_PROGRESS";
    throw error;
  }

  try {
    let effectiveCities = cities;
    let effectiveBbox = bbox;
    if (!effectiveCities || effectiveCities.length === 0) {
      const opContext = await operationalContextService.getOperationalContext();
      effectiveCities = [opContext.hubCityName];
      if (!effectiveBbox) effectiveBbox = opContext.bbox;
    }

    const latestVersion = await datasetVersionRepository.getLatestVersionNumber(datasetType);
    const activeVersion = await datasetVersionRepository.findActiveVersion(datasetType);

    const job = await overpassSyncQueue.add(JOB_TYPE_SYNC_TOLL, {
      type: JOB_TYPE_SYNC_TOLL,
      datasetType,
      userId,
      cities: effectiveCities,
      bbox: effectiveBbox,
      lockToken: token,
      expectedActiveVersionId: activeVersion?.id ?? null,
      triggeredAt: new Date().toISOString(),
    });

    await datasetSyncJobRepository.createJob({
      job_id: job.id as string,
      dataset_type: datasetType,
      triggered_by: userId ? String(userId) : null,
      target_version: latestVersion + 1,
      previous_version: activeVersion?.version || null,
    });

    console.log(`📥 [BULLMQ QUEUE] Job '${JOB_TYPE_SYNC_TOLL}' (${effectiveCities.join(", ")}) dimasukkan ke antrean (ID: ${job.id})`);
    return { jobId: job.id, datasetType, status: "PENDING", lockToken: token, cities: effectiveCities };
  } catch (err) {
    await releaseSyncLock(datasetType, token);
    throw err;
  }
};

/**
 * Enqueue Asynchronous Protocol Roads Synchronization Pipeline
 */
export const enqueueProtocolRoadsSyncJob = async ({
  userId = null,
  cities = null,
  bbox = null,
}: {
  userId?: string | number | null;
  cities?: string[] | null;
  bbox?: any;
} = {}) => {
  const datasetType = "PROTOCOL_ROADS";
  const { acquired, token } = await acquireSyncLock(datasetType);
  if (!acquired || !token) {
    const error: any = new Error("Sinkronisasi Jalan Protokol sedang berjalan oleh proses lain. Harap tunggu hingga selesai.");
    error.statusCode = 409;
    error.code = "SYNC_ALREADY_IN_PROGRESS";
    throw error;
  }

  try {
    let effectiveCities = cities;
    let effectiveBbox = bbox;
    if (!effectiveCities || effectiveCities.length === 0) {
      const opContext = await operationalContextService.getOperationalContext();
      effectiveCities = [opContext.hubCityName];
      if (!effectiveBbox) effectiveBbox = opContext.bbox;
    }

    const latestVersion = await datasetVersionRepository.getLatestVersionNumber(datasetType);
    const activeVersion = await datasetVersionRepository.findActiveVersion(datasetType);

    const job = await overpassSyncQueue.add(JOB_TYPE_SYNC_ROADS, {
      type: JOB_TYPE_SYNC_ROADS,
      datasetType,
      userId,
      cities,
      bbox,
      lockToken: token,
      expectedActiveVersionId: activeVersion?.id ?? null,
      triggeredAt: new Date().toISOString(),
    });

    await datasetSyncJobRepository.createJob({
      job_id: job.id as string,
      dataset_type: datasetType,
      triggered_by: userId ? String(userId) : null,
      target_version: latestVersion + 1,
      previous_version: activeVersion?.version || null,
    });

    console.log(`📥 [BULLMQ QUEUE] Job '${JOB_TYPE_SYNC_ROADS}' dimasukkan ke antrean (ID: ${job.id})`);
    return { jobId: job.id, datasetType, status: "PENDING", lockToken: token };
  } catch (err) {
    await releaseSyncLock(datasetType, token);
    throw err;
  }
};

export const addRoadSyncJob = enqueueProtocolRoadsSyncJob;
export const addPoiSyncJob = enqueuePoiSyncJob;

/**
 * Fetch Detailed Job Status from BullMQ and Audit DB
 */
export const getJobStatus = async (jobId: string) => {
  const jobAudit = await datasetSyncJobRepository.findByJobId(jobId);
  const job = await overpassSyncQueue.getJob(jobId);

  if (!job && !jobAudit) return null;

  const state = job ? await job.getState() : jobAudit?.status || "UNKNOWN";
  const progress = job ? job.progress : jobAudit?.progress || 0;

  return {
    id: jobId,
    name: job?.name || `JOB_${jobAudit?.dataset_type}`,
    dataset_type: jobAudit?.dataset_type,
    state,
    status: jobAudit?.status || state,
    progress,
    records_fetched: jobAudit?.records_fetched || 0,
    records_inserted: jobAudit?.records_inserted || 0,
    duplicates_count: jobAudit?.duplicates_count || 0,
    target_version: jobAudit?.target_version || null,
    previous_version: jobAudit?.previous_version || null,
    duration_ms: jobAudit?.duration_ms || null,
    error: job?.failedReason || jobAudit?.error_details || null,
    started_at: jobAudit?.started_at || null,
    completed_at: jobAudit?.completed_at || null,
  };
};
