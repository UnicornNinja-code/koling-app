/*
 *   Copyright (c) 2026 
 *   All rights reserved.
 *   lbsController.js (HTTP Controller for Redis Geospatial Proximity & Radius Search)
 */

import { redisGeoService } from "../services/lbs/RedisGeoService.js";
import { lbsGeofenceService } from "../services/lbs/LbsGeofenceService.js";

/**
 * Track Live Rider GPS Location Ping (LBS Geofence + Proximity + DSS Compliance)
 * POST /api/lbs/track
 */
export const trackRiderLocation = async (req, res) => {
  try {
    const { rider_id, rider_name, lat, lon, speed, heading } = req.body;
    const riderId = rider_id || req.user?.id || req.user?.userId;

    if (!riderId || lat === undefined || lon === undefined) {
      return res.status(400).json({ msg: "Parameter 'rider_id', 'lat', dan 'lon' wajib diisi." });
    }

    const result = await lbsGeofenceService.processRiderGpsPing({
      riderId,
      riderName: rider_name || req.user?.name || "Rider Operasional",
      lat: parseFloat(lat),
      lon: parseFloat(lon),
      speed: speed ? parseFloat(speed) : 0,
      heading: heading ? parseFloat(heading) : 0,
    });

    return res.status(200).json({
      status: "success",
      data: result,
    });
  } catch (error) {
    const statusCode = error.statusCode || 500;
    return res.status(statusCode).json({ msg: error.message || "Internal server error" });
  }
};

/**
 * Proximity Radius Search: Fetch active Riders near specific GPS coordinates in Redis
 * GET /api/lbs/nearby?lon=112.7183&lat=-7.4478&radius=5&limit=50
 */
export const getNearbyRiders = async (req, res) => {
  try {
    const lon = req.query.lon !== undefined ? req.query.lon : req.query.longitude;
    const lat = req.query.lat !== undefined ? req.query.lat : req.query.latitude;
    const radius = req.query.radius !== undefined ? req.query.radius : (req.query.radiusKm || 5);
    const limit = req.query.limit || 50;

    if (lon === undefined || lat === undefined) {
      return res.status(400).json({ msg: "Parameter 'lon' (atau 'longitude') dan 'lat' (atau 'latitude') harus diisi." });
    }

    const startTime = Date.now();
    const result = await redisGeoService.getNearbyRiders({
      lon: parseFloat(lon),
      lat: parseFloat(lat),
      radiusKm: parseFloat(radius),
      limit: parseInt(limit, 10),
    });

    const executionMs = Date.now() - startTime;

    return res.status(200).json({
      status: "success",
      execution_ms: executionMs,
      ...result,
    });
  } catch (error) {
    const statusCode = error.statusCode || 500;
    return res.status(statusCode).json({ msg: error.message || "Internal server error" });
  }
};

/**
 * Get Single Rider Live Position from Redis
 * GET /api/lbs/riders/:riderId
 */
export const getRiderLocation = async (req, res) => {
  try {
    const { riderId } = req.params;
    const result = await redisGeoService.getRiderLocation(riderId);

    if (!result) {
      return res.status(404).json({ msg: `Posisi live untuk Rider ID '${riderId}' tidak ditemukan di Redis.` });
    }

    return res.status(200).json(result);
  } catch (error) {
    const statusCode = error.statusCode || 500;
    return res.status(statusCode).json({ msg: error.message || "Internal server error" });
  }
};

/**
 * Calculate Geodesic Distance between two Riders in Redis
 * GET /api/lbs/distance?rider1=ID1&rider2=ID2
 */
export const calculateRiderDistance = async (req, res) => {
  try {
    const { rider1, rider2 } = req.query;

    if (!rider1 || !rider2) {
      return res.status(400).json({ msg: "Parameter 'rider1' dan 'rider2' harus diisi." });
    }

    const result = await redisGeoService.calculateRiderDistance(rider1, rider2);

    if (!result) {
      return res.status(404).json({ msg: "Salah satu atau kedua Rider tidak memiliki data posisi di Redis." });
    }

    return res.status(200).json(result);
  } catch (error) {
    const statusCode = error.statusCode || 500;
    return res.status(statusCode).json({ msg: error.message || "Internal server error" });
  }
};
