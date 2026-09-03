/*
 * lbsController.ts
 * HTTP Controller for Redis Geospatial Proximity & Radius Search in TypeScript
 */

import type { Request, Response } from "express";
import { redisGeoService } from "../services/lbs/RedisGeoService.js";
import { lbsGeofenceService } from "../services/lbs/LbsGeofenceService.js";

/**
 * Track Live Rider GPS Location Ping
 */
export const trackRiderLocation = async (req: Request, res: Response): Promise<any> => {
  try {
    const { rider_id, rider_name, lat, latitude, lon, lng, longitude, speed, heading } = req.body;
    const riderId = rider_id || req.user?.id || (req.user as any)?.userId;
    const rawLat = lat ?? latitude;
    const rawLon = lon ?? lng ?? longitude;

    if (!riderId || rawLat === undefined || rawLon === undefined) {
      return res.status(400).json({ msg: "Parameter 'rider_id', 'lat', dan 'lon'/'lng' wajib diisi." });
    }

    const result = await lbsGeofenceService.processRiderGpsPing({
      riderId,
      riderName: rider_name || req.user?.name || "Rider Operasional",
      lat: parseFloat(String(rawLat)),
      lon: parseFloat(String(rawLon)),
      speed: speed ? parseFloat(String(speed)) : 0,
      heading: heading ? parseFloat(String(heading)) : 0,
    });

    return res.status(200).json({
      status: "success",
      data: result,
    });
  } catch (error: any) {
    const statusCode = error.statusCode || 500;
    return res.status(statusCode).json({ msg: error.message || "Internal server error" });
  }
};

/**
 * Proximity Radius Search
 */
export const getNearbyRiders = async (req: Request, res: Response): Promise<any> => {
  try {
    const rawLon = req.query.lon ?? req.query.lng ?? req.query.longitude;
    const rawLat = req.query.lat ?? req.query.latitude;
    const rawRadius = req.query.radiusKm ?? req.query.radius ?? 5;
    const limit = req.query.limit || 50;

    if (rawLon === undefined || rawLat === undefined || rawLon === "" || rawLat === "") {
      return res.status(400).json({ msg: "Parameter koordinat ('lat'/'latitude' dan 'lng'/'lon'/'longitude') harus diisi." });
    }

    let radiusKm = parseFloat(String(rawRadius));
    // Jika radius dikirim dalam satuan meter (misal > 1000 seperti 50000m = 50km), konversikan ke kilometer
    if (radiusKm > 1000) {
      radiusKm = radiusKm / 1000;
    }

    const startTime = Date.now();
    const result = await redisGeoService.getNearbyRiders({
      lon: parseFloat(String(rawLon)),
      lat: parseFloat(String(rawLat)),
      radiusKm,
      limit: parseInt(String(limit), 10),
    });

    const executionMs = Date.now() - startTime;

    return res.status(200).json({
      status: "success",
      execution_ms: executionMs,
      ...result,
    });
  } catch (error: any) {
    const statusCode = error.statusCode || 500;
    return res.status(statusCode).json({ msg: error.message || "Internal server error" });
  }
};

/**
 * Get Single Rider Live Position from Redis
 */
export const getRiderLocation = async (req: Request, res: Response): Promise<any> => {
  try {
    const riderId = req.params.riderId as string;
    const result = await redisGeoService.getRiderLocation(riderId);

    if (!result) {
      return res.status(404).json({ msg: `Posisi live untuk Rider ID '${riderId}' tidak ditemukan di Redis.` });
    }

    return res.status(200).json(result);
  } catch (error: any) {
    const statusCode = error.statusCode || 500;
    return res.status(statusCode).json({ msg: error.message || "Internal server error" });
  }
};

/**
 * Calculate Geodesic Distance between two Riders in Redis
 */
export const calculateRiderDistance = async (req: Request, res: Response): Promise<any> => {
  try {
    const { rider1, rider2 } = req.query as { rider1?: string; rider2?: string };

    if (!rider1 || !rider2) {
      return res.status(400).json({ msg: "Parameter 'rider1' dan 'rider2' harus diisi." });
    }

    const result = await redisGeoService.calculateRiderDistance(rider1, rider2);

    if (!result) {
      return res.status(404).json({ msg: "Salah satu atau kedua Rider tidak memiliki data posisi di Redis." });
    }

    return res.status(200).json(result);
  } catch (error: any) {
    const statusCode = error.statusCode || 500;
    return res.status(statusCode).json({ msg: error.message || "Internal server error" });
  }
};
