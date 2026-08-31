/*
 * RedisGeoService.ts
 * Clean Architecture Singleton Service for Redis Geospatial Indexing in TypeScript
 */

import { redisClient } from "../../config/redis.js";

export class RedisGeoService {
  private static instance: RedisGeoService | null = null;
  private geoKey: string;

  constructor() {
    if (RedisGeoService.instance) {
      return RedisGeoService.instance;
    }
    this.geoKey = "RIDERS_GEO_INDEX";
    RedisGeoService.instance = this;
  }

  public static getInstance(): RedisGeoService {
    if (!RedisGeoService.instance) {
      RedisGeoService.instance = new RedisGeoService();
    }
    return RedisGeoService.instance;
  }

  /**
   * Update or Add Rider Location into Redis Geospatial Index Set
   */
  public async updateRiderLocation({
    riderId,
    riderName,
    lat,
    lon,
    speed = 0,
    heading = 0,
  }: {
    riderId: string | number;
    riderName?: string;
    lat: number | string;
    lon: number | string;
    speed?: number;
    heading?: number;
  }): Promise<any> {
    if (!riderId || lat === undefined || lon === undefined) {
      throw new Error("riderId, lat, dan lon harus diisi.");
    }

    const latitude = parseFloat(String(lat));
    const longitude = parseFloat(String(lon));

    try {
      if (typeof (redisClient as any).geoAdd === "function") {
        await (redisClient as any).geoAdd(this.geoKey, { longitude, latitude, member: String(riderId) });
      } else if (typeof (redisClient as any).geoadd === "function") {
        await (redisClient as any).geoadd(this.geoKey, longitude, latitude, String(riderId));
      }

      const metaKey = `RIDER_META:${riderId}`;
      const payload: Record<string, string> = {
        rider_id: String(riderId),
        rider_name: String(riderName || "Rider Operasional"),
        latitude: String(latitude),
        longitude: String(longitude),
        speed: String(parseFloat(String(speed))),
        heading: String(parseFloat(String(heading))),
        updated_at: new Date().toISOString(),
      };

      if (typeof (redisClient as any).hSet === "function") {
        await (redisClient as any).hSet(metaKey, payload);
      } else if (typeof (redisClient as any).hset === "function") {
        await (redisClient as any).hset(metaKey, payload);
      }

      if (typeof (redisClient as any).expire === "function") {
        await (redisClient as any).expire(metaKey, 86400);
      }
      return { riderId, latitude, longitude, speed, heading };
    } catch (err: any) {
      console.warn(`⚠️ [RedisGeoService] Error updating location for rider '${riderId}':`, err.message);
      return { riderId, latitude, longitude, speed, heading, degraded: true };
    }
  }

  /**
   * Fetch Nearby Active Riders within Radius X km
   */
  public async getNearbyRiders({
    lon,
    lat,
    radiusKm = 5,
    limit = 50,
  }: {
    lon: number | string;
    lat: number | string;
    radiusKm?: number;
    limit?: number;
  }): Promise<any> {
    if (lat === undefined || lon === undefined) {
      throw new Error("Koordinat lon dan lat harus diisi.");
    }

    const longitude = parseFloat(String(lon));
    const latitude = parseFloat(String(lat));
    const radius = parseFloat(String(radiusKm));

    try {
      let rawResults: any[] = [];
      let searchSuccess = false;

      if (typeof (redisClient as any).geoSearch === "function") {
        try {
          const res = await (redisClient as any).geoSearch(
            this.geoKey,
            { longitude, latitude },
            { radius, unit: "km" },
            { WITHDIST: true, WITHCOORD: true }
          );

          if (Array.isArray(res)) {
            rawResults = res.map((r) => {
              if (typeof r === "string") return [r, "0", ["0", "0"]];
              const memberStr = typeof r.member === "string" ? r.member : String(r.member);
              const distStr = r.distance !== undefined ? String(r.distance) : "0";
              const coords = r.coordinates
                ? [String(r.coordinates.longitude), String(r.coordinates.latitude)]
                : ["0", "0"];
              return [memberStr, distStr, coords];
            });
            searchSuccess = true;
          }
        } catch (e) {
          if (typeof (redisClient as any).geoRadius === "function") {
            try {
              const res = await (redisClient as any).geoRadius(
                this.geoKey,
                { longitude, latitude },
                radius,
                "km",
                { WITHDIST: true, WITHCOORD: true }
              );

              if (Array.isArray(res)) {
                rawResults = res.map((r) => {
                  if (typeof r === "string") return [r, "0", ["0", "0"]];
                  const memberStr = typeof r.member === "string" ? r.member : String(r.member);
                  const distStr = r.distance !== undefined ? String(r.distance) : "0";
                  const coords = r.coordinates
                    ? [String(r.coordinates.longitude), String(r.coordinates.latitude)]
                    : ["0", "0"];
                  return [memberStr, distStr, coords];
                });
                searchSuccess = true;
              }
            } catch (err) {}
          }
          if (!searchSuccess) {
            throw e;
          }
        }
      }

      if (!rawResults || rawResults.length === 0) {
        return {
          query_center: { latitude, longitude },
          radius_km: radius,
          total_riders_found: 0,
          riders: [],
        };
      }

      const riders = await Promise.all(
        rawResults.map(async (item) => {
          const [riderId, distStr, coords] = item;
          const metaKey = `RIDER_META:${riderId}`;

          let meta: any = null;
          try {
            if (typeof (redisClient as any).hGetAll === "function") {
              meta = await (redisClient as any).hGetAll(metaKey);
            } else if (typeof (redisClient as any).hgetall === "function") {
              meta = await (redisClient as any).hgetall(metaKey);
            }
          } catch (mErr) {}

          return {
            rider_id: riderId,
            rider_name: meta?.rider_name || "Rider Operasional",
            distance_km: parseFloat(distStr),
            distance_meters: Math.round(parseFloat(distStr) * 1000),
            location: {
              latitude: parseFloat(coords[1]),
              longitude: parseFloat(coords[0]),
            },
            telemetry: {
              speed: parseFloat(meta?.speed || 0),
              heading: parseFloat(meta?.heading || 0),
              updated_at: meta?.updated_at || null,
            },
          };
        })
      );

      return {
        query_center: { latitude, longitude },
        radius_km: radius,
        total_riders_found: riders.length,
        riders,
      };
    } catch (err: any) {
      console.warn("⚠️ [RedisGeoService] Error in getNearbyRiders:", err.message);
      return {
        query_center: { latitude, longitude },
        radius_km: radius,
        total_riders_found: 0,
        riders: [],
        degraded: true,
      };
    }
  }

  /**
   * Get Single Rider Live Position & Telemetry Metadata
   */
  public async getRiderLocation(riderId: string | number): Promise<any | null> {
    if (!riderId) throw new Error("riderId harus diisi.");

    try {
      let pos: any = null;
      if (typeof (redisClient as any).geoPos === "function") {
        pos = await (redisClient as any).geoPos(this.geoKey, String(riderId));
      } else if (typeof (redisClient as any).geopos === "function") {
        pos = await (redisClient as any).geopos(this.geoKey, String(riderId));
      }

      if (!pos || !pos[0]) {
        return null;
      }

      const coords = pos[0].longitude !== undefined ? [pos[0].longitude, pos[0].latitude] : pos[0];

      const metaKey = `RIDER_META:${riderId}`;
      let meta: any = null;
      if (typeof (redisClient as any).hGetAll === "function") {
        meta = await (redisClient as any).hGetAll(metaKey);
      } else if (typeof (redisClient as any).hgetall === "function") {
        meta = await (redisClient as any).hgetall(metaKey);
      }

      return {
        rider_id: riderId,
        rider_name: meta?.rider_name || "Rider Operasional",
        location: {
          latitude: parseFloat(coords[1]),
          longitude: parseFloat(coords[0]),
        },
        telemetry: {
          speed: parseFloat(meta?.speed || 0),
          heading: parseFloat(meta?.heading || 0),
          updated_at: meta?.updated_at || null,
        },
      };
    } catch (err: any) {
      console.warn(`⚠️ [RedisGeoService] Error in getRiderLocation for '${riderId}':`, err.message);
      return null;
    }
  }

  /**
   * Calculate Exact Geodesic Distance Between Two Active Riders in Redis (GEODIST)
   */
  public async calculateRiderDistance(riderId1: string | number, riderId2: string | number): Promise<any | null> {
    if (!riderId1 || !riderId2) {
      throw new Error("riderId1 dan riderId2 harus diisi.");
    }

    try {
      let distKmVal: any = null;
      if (typeof (redisClient as any).geoDist === "function") {
        distKmVal = await (redisClient as any).geoDist(this.geoKey, String(riderId1), String(riderId2), "km");
      } else if (typeof (redisClient as any).geodist === "function") {
        distKmVal = await (redisClient as any).geodist(this.geoKey, String(riderId1), String(riderId2), "km");
      }

      if (distKmVal === null || distKmVal === undefined) {
        return null;
      }

      const distKm = parseFloat(String(distKmVal));
      return {
        rider1_id: riderId1,
        rider2_id: riderId2,
        distance_km: distKm,
        distance_meters: Math.round(distKm * 1000),
      };
    } catch (err: any) {
      console.warn(`⚠️ [RedisGeoService] Error in calculateRiderDistance:`, err.message);
      return null;
    }
  }

  /**
   * Remove Rider Location from Redis Spatial Index Set
   */
  public async removeRiderLocation(riderId: string | number): Promise<boolean> {
    if (!riderId) return false;
    try {
      if (typeof (redisClient as any).zRem === "function") {
        await (redisClient as any).zRem(this.geoKey, String(riderId));
      } else if (typeof (redisClient as any).zrem === "function") {
        await (redisClient as any).zrem(this.geoKey, String(riderId));
      }
      if (typeof (redisClient as any).del === "function") {
        await (redisClient as any).del(`RIDER_META:${riderId}`);
      }
      return true;
    } catch (err: any) {
      console.warn(`⚠️ [RedisGeoService] Error removing rider '${riderId}':`, err.message);
      return false;
    }
  }
}

export const redisGeoService = RedisGeoService.getInstance();
