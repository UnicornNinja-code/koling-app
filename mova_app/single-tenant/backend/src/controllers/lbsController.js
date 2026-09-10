/*
 * lbsController.js
 * HTTP Controller for Milestone B-11: Real-Time Location-Based Services (LBS) & Geofencing
 * Backed 100% by PostgreSQL / PostGIS as State Authority.
 */

import { lbsGeofenceService } from "../services/lbs/LbsGeofenceService.js";
import { operationalSessionRepository } from "../repositories/operationalSessionRepository.js";

/**
 * Ingest Rider Live GPS Telemetry Ping
 * POST /api/lbs/ping and POST /api/lbs/track
 */
export const pingRiderLocation = async (req, res) => {
  try {
    const { rider_id, rider_name, latitude, longitude, lat, lon, speed, heading, recorded_at } = req.body;
    // Strict IDOR guard: A RIDER role can only ingest telemetry for their own authenticated ID
    const isRider = req.user?.role === "RIDER";
    const riderId = isRider ? req.user.id : (rider_id || req.user?.id || req.user?.userId);
    const riderName = isRider ? (req.user?.name || "Rider Operasional") : (rider_name || req.user?.name || "Rider Operasional");

    const result = await lbsGeofenceService.processRiderGpsPing({
      riderId,
      riderName,
      latitude,
      longitude,
      lat,
      lon,
      speed,
      heading,
      recorded_at,
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
 * Fetch all Live Rider Positions
 * GET /api/lbs/riders/live
 */
export const getLiveRiders = async (req, res) => {
  try {
    const { zone_id, compliance } = req.query;
    const riders = await lbsGeofenceService.getLiveRiderPositions({
      zoneId: zone_id,
      compliance,
    });

    return res.status(200).json({
      status: "success",
      total_active: riders.length,
      data: riders,
    });
  } catch (error) {
    const statusCode = error.statusCode || 500;
    return res.status(statusCode).json({ msg: error.message || "Internal server error" });
  }
};

/**
 * Proximity Radius Search: Fetch active Riders near specific GPS coordinates
 * GET /api/lbs/nearby?lon=112.7183&lat=-7.4478&radius=5&limit=50
 */
export const getNearbyRiders = async (req, res) => {
  try {
    const lon = req.query.lon !== undefined ? req.query.lon : req.query.longitude;
    const lat = req.query.lat !== undefined ? req.query.lat : req.query.latitude;
    const radius = req.query.radius !== undefined ? req.query.radius : (req.query.radiusKm || 5);
    const limit = req.query.limit || 50;

    const startTime = Date.now();
    const result = await lbsGeofenceService.getNearbyRiders({
      lon,
      lat,
      radiusKm: radius,
      limit,
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
 * Get Single Rider Live Position
 * GET /api/lbs/riders/:riderId
 */
export const getRiderLocation = async (req, res) => {
  try {
    const { riderId } = req.params;
    const rows = await lbsGeofenceService.getLiveRiderPositions();
    const rider = rows.find((r) => r.rider_id === riderId);

    if (!rider) {
      return res.status(404).json({ msg: `Posisi live untuk Rider ID '${riderId}' tidak ditemukan.` });
    }

    return res.status(200).json({
      status: "success",
      data: rider,
    });
  } catch (error) {
    const statusCode = error.statusCode || 500;
    return res.status(statusCode).json({ msg: error.message || "Internal server error" });
  }
};

/**
 * Fetch Discrete Geofence Transition & Audit Logs
 * GET /api/lbs/zone-logs
 */
export const getZoneLogs = async (req, res) => {
  try {
    const { rider_id, zone_id, session_id, page, limit } = req.query;
    const result = await lbsGeofenceService.getZoneLogs({
      riderId: rider_id,
      zoneId: zone_id,
      sessionId: session_id,
      page,
      limit,
    });

    return res.status(200).json({
      status: "success",
      ...result,
    });
  } catch (error) {
    const statusCode = error.statusCode || 500;
    return res.status(statusCode).json({ msg: error.message || "Internal server error" });
  }
};

/**
 * Calculate Geodesic Distance between two Riders
 * GET /api/lbs/distance?rider1=ID1&rider2=ID2
 */
export const calculateRiderDistance = async (req, res) => {
  try {
    const { rider1, rider2 } = req.query;

    if (!rider1 || !rider2) {
      return res.status(400).json({ msg: "Parameter 'rider1' dan 'rider2' harus diisi." });
    }

    const rows = await lbsGeofenceService.getLiveRiderPositions();
    const pos1 = rows.find((r) => r.rider_id === rider1);
    const pos2 = rows.find((r) => r.rider_id === rider2);

    if (!pos1 || !pos2) {
      return res.status(404).json({ msg: "Salah satu atau kedua Rider tidak memiliki data posisi live." });
    }

    // Haversine geodesic calculation
    const R = 6371; // km
    const dLat = ((pos2.latitude - pos1.latitude) * Math.PI) / 180;
    const dLon = ((pos2.longitude - pos1.longitude) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((pos1.latitude * Math.PI) / 180) *
        Math.cos((pos2.latitude * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distanceKm = R * c;

    return res.status(200).json({
      status: "success",
      rider1: { id: rider1, name: pos1.rider_name, location: { lat: pos1.latitude, lon: pos1.longitude } },
      rider2: { id: rider2, name: pos2.rider_name, location: { lat: pos2.latitude, lon: pos2.longitude } },
      distance_km: parseFloat(distanceKm.toFixed(3)),
      distance_meters: parseFloat((distanceKm * 1000).toFixed(1)),
    });
  } catch (error) {
    const statusCode = error.statusCode || 500;
    return res.status(statusCode).json({ msg: error.message || "Internal server error" });
  }
};

/**
 * Get Fleet Multi-Rider Distance Summary to All Zones
 * GET /api/lbs/zones-distance-summary
 */
export const getZonesDistanceSummary = async (req, res) => {
  try {
    const summary = await lbsGeofenceService.getZonesDistanceSummary();
    return res.status(200).json({
      status: "success",
      data: summary,
    });
  } catch (error) {
    const statusCode = error.statusCode || 500;
    return res.status(statusCode).json({ msg: error.message || "Internal server error" });
  }
};

