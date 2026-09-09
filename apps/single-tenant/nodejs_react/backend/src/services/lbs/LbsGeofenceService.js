/*
 * LbsGeofenceService.js
 * Domain Service for Milestone B-11: Actual Field Execution & Real-Time LBS Monitoring Layer
 * Integrates:
 * - PostGIS ST_Covers Zone Geofencing
 * - Prohibited Protocol Road Proximity Alerting (50m ST_DWithin)
 * - SSOT Live Position Upsert (latest_rider_positions)
 * - Continuous Historical Telemetry Logging (rider_telemetry_logs)
 * - Discrete State Transition Event Detection (rider_zone_logs)
 * - Decoupled Socket.IO Real-Time Push Notification
 */

import { pool } from "../../config/database.js";
import { operationalSessionRepository } from "../../repositories/operationalSessionRepository.js";
import { eventPublisher } from "../../events/eventPublisher.js";

export class LbsGeofenceService {
  static instance = null;

  constructor(sessionRepo = operationalSessionRepository) {
    if (LbsGeofenceService.instance && sessionRepo === operationalSessionRepository) {
      return LbsGeofenceService.instance;
    }
    this.sessionRepo = sessionRepo;
    if (sessionRepo === operationalSessionRepository) {
      LbsGeofenceService.instance = this;
    }
  }

  static getInstance(sessionRepo = operationalSessionRepository) {
    if (!LbsGeofenceService.instance) {
      LbsGeofenceService.instance = new LbsGeofenceService(sessionRepo);
    }
    return LbsGeofenceService.instance;
  }

  /**
   * Process Rider Live GPS Telemetry Ping
   */
  async processRiderGpsPing({
    riderId,
    riderName = "Rider Operasional",
    latitude,
    longitude,
    lat,
    lon,
    speed = 0,
    heading = 0,
    recorded_at = null,
    recordedAt = null,
  }) {
    // 1. Minimum Input Validation
    const finalLat = latitude !== undefined ? parseFloat(latitude) : (lat !== undefined ? parseFloat(lat) : NaN);
    const finalLon = longitude !== undefined ? parseFloat(longitude) : (lon !== undefined ? parseFloat(lon) : NaN);

    if (!riderId) {
      const error = new Error("Parameter 'rider_id' wajib diisi.");
      error.statusCode = 400;
      throw error;
    }

    if (isNaN(finalLat) || finalLat < -90 || finalLat > 90) {
      const error = new Error("Parameter 'latitude' tidak valid (harus berada di antara -90 dan 90).");
      error.statusCode = 400;
      throw error;
    }

    if (isNaN(finalLon) || finalLon < -180 || finalLon > 180) {
      const error = new Error("Parameter 'longitude' tidak valid (harus berada di antara -180 dan 180).");
      error.statusCode = 400;
      throw error;
    }

    const finalSpeed = Math.max(0, parseFloat(speed) || 0);
    const rawHeading = parseFloat(heading) || 0;
    const finalHeading = ((rawHeading % 360) + 360) % 360;

    let timestamp = new Date();
    const rawTime = recorded_at || recordedAt;
    if (rawTime) {
      const parsed = new Date(rawTime);
      if (!isNaN(parsed.getTime())) {
        timestamp = parsed;
      }
    }

    // 2. Resolve Active Operational Session from PostgreSQL
    const activeSession = await this.sessionRepo.findActiveSessionByRiderId(riderId);
    if (!activeSession) {
      const error = new Error("Rider tidak memiliki sesi operasional aktif (harus memiliki penugasan dan klaim armada aktif).");
      error.statusCode = 403;
      throw error;
    }

    const sessionId = activeSession.session_id || activeSession.id;
    const assignedZoneId = activeSession.zone_id;
    const assignedZoneName = activeSession.zone_name;
    const resolvedRiderName = activeSession.rider_name || riderName;

    // 3. Evaluate Zone Spatial Coverage via PostGIS ST_Covers (Prioritizing assigned zone)
    const geofenceQuery = `
      SELECT id, name, status, ST_AsGeoJSON(geom) AS geom_geojson
      FROM zones
      WHERE ST_Covers(
        COALESCE(
          geom,
          ST_SetSRID(ST_GeomFromGeoJSON(
            CASE 
              WHEN polygon::text LIKE '{"type"%' THEN polygon::text
              ELSE concat('{"type":"Polygon","coordinates":[', polygon::text, ']}')
            END
          ), 4326)
        ),
        ST_SetSRID(ST_MakePoint($1, $2), 4326)
      )
      ORDER BY (CASE WHEN id = $3 THEN 0 ELSE 1 END) ASC
      LIMIT 1;
    `;

    let actualZone = null;
    try {
      const { rows } = await pool.query(geofenceQuery, [finalLon, finalLat, assignedZoneId]);
      actualZone = rows[0] || null;
    } catch (dbErr) {
      console.warn("⚠️ PostGIS ST_Covers query warning:", dbErr.message);
      actualZone = null;
    }

    const isInsideZone = actualZone !== null;
    const actualZoneId = actualZone ? actualZone.id : null;
    const actualZoneName = actualZone ? actualZone.name : "OUTSIDE_OPERATIONAL_ZONES";

    // 4. Determine Zone Compliance (COMPLIANT, DEVIATED, OUTSIDE_ZONE)
    let zoneCompliance = "OUTSIDE_ZONE";
    if (actualZoneId) {
      if (assignedZoneId) {
        zoneCompliance = (actualZoneId === assignedZoneId) ? "COMPLIANT" : "DEVIATED";
      } else {
        zoneCompliance = "COMPLIANT";
      }
    } else {
      zoneCompliance = "OUTSIDE_ZONE";
    }

    // 5. Evaluate Prohibited Road Restriction (50m Radius)
    const roadViolationQuery = `
      SELECT id, name, highway_type, restriction_type
      FROM protocol_roads
      WHERE restriction_type IS NOT NULL
        AND ST_DWithin(
          ST_SetSRID(geom, 4326)::geography,
          ST_SetSRID(ST_MakePoint($1, $2), 4326)::geography,
          50
        )
      LIMIT 1;
    `;

    let roadViolation = null;
    try {
      const { rows: roadRows } = await pool.query(roadViolationQuery, [finalLon, finalLat]);
      roadViolation = roadRows[0] || null;
    } catch (rErr) {
      // Non-fatal if protocol_roads is empty or spatial query errors
    }

    const roadCompliance = roadViolation ? "PROHIBITED_ROAD_ALERT" : "NO_ROAD_ALERT";

    // 6. Upsert SSOT Live Position into latest_rider_positions
    const latestPosition = await this.sessionRepo.upsertLatestPosition({
      riderId,
      sessionId,
      riderName: resolvedRiderName,
      latitude: finalLat,
      longitude: finalLon,
      speed: finalSpeed,
      heading: finalHeading,
      isInsideZone,
      actualZoneId,
      actualZoneName,
      zoneCompliance,
      roadCompliance,
      prohibitedRoadId: roadViolation?.id || null,
      prohibitedRoadName: roadViolation?.name || null,
      recordedAt: timestamp,
    });

    // 7. Insert Continuous Telemetry History Log
    await this.sessionRepo.insertTelemetryLog({
      sessionId,
      riderId,
      latitude: finalLat,
      longitude: finalLon,
      speed: finalSpeed,
      heading: finalHeading,
      actualZoneId,
      zoneCompliance,
      roadCompliance,
      recordedAt: timestamp,
    });

    // 8. Discrete Geofence State Transition Event Detection
    let discreteEvent = "NONE";
    try {
      const lastLog = await this.sessionRepo.getLatestZoneLog(riderId);

      // Transition condition: zone changed or compliance changed
      const isInitial = !lastLog;
      const zoneChanged = lastLog && lastLog.zone_id !== actualZoneId;
      const complianceChanged = lastLog && lastLog.zone_compliance !== zoneCompliance;

      if (isInitial || zoneChanged || complianceChanged) {
        if (isInsideZone) {
          discreteEvent = zoneCompliance === "COMPLIANT" ? "ENTER" : "DEVIATED_ENTER";
          await this.sessionRepo.insertZoneLog({
            sessionId,
            riderId,
            zoneId: actualZoneId,
            eventType: discreteEvent,
            zoneCompliance,
            latitude: finalLat,
            longitude: finalLon,
          });
        } else if (!isInsideZone && lastLog && lastLog.event_type !== "EXIT") {
          discreteEvent = "EXIT";
          await this.sessionRepo.insertZoneLog({
            sessionId,
            riderId,
            zoneId: lastLog.zone_id || assignedZoneId,
            eventType: "EXIT",
            zoneCompliance,
            latitude: finalLat,
            longitude: finalLon,
          });
        }
      }
    } catch (logErr) {
      console.warn("⚠️ Geofence discrete log warning:", logErr.message);
    }

    // 9. Non-blocking Socket.IO Event Push
    try {
      if (zoneCompliance !== "COMPLIANT" && isInsideZone === false) {
        eventPublisher.publishGeofenceBreach({
          riderId,
          riderName: resolvedRiderName,
          zoneName: assignedZoneName,
          lat: finalLat,
          lon: finalLon,
          message: `Peringatan: Rider ${resolvedRiderName} berada di luar zona tugas '${assignedZoneName}'.`,
        });
      }
    } catch (sockErr) {
      // Socket transport error must not fail business transaction
      console.warn("⚠️ Non-blocking Socket.IO error:", sockErr.message);
    }

    return {
      rider_id: riderId,
      rider_name: resolvedRiderName,
      session_id: sessionId,
      location: {
        latitude: finalLat,
        longitude: finalLon,
        speed: finalSpeed,
        heading: finalHeading,
      },
      geofence: {
        is_inside_zone: isInsideZone,
        actual_zone_id: actualZoneId,
        actual_zone_name: actualZoneName,
        event_type: discreteEvent,
      },
      compliance: {
        zone_compliance: zoneCompliance,
        road_compliance: roadCompliance,
        assigned_zone_id: assignedZoneId,
        assigned_zone_name: assignedZoneName,
      },
      road_violation: roadViolation ? {
        is_violating: true,
        road_id: roadViolation.id,
        road_name: roadViolation.name,
        highway_type: roadViolation.highway_type,
        restriction_type: roadViolation.restriction_type || "PROHIBITED_ROAD",
        message: `PERINGATAN: Rider berada dalam radius 50m dari jalan terlarang '${roadViolation.name}'.`,
      } : {
        is_violating: false,
      },
      recorded_at: timestamp.toISOString(),
      updated_at: latestPosition.updated_at,
    };
  }

  /**
   * Query all Live Rider Positions from PostgreSQL SSOT
   */
  async getLiveRiderPositions(filter = {}) {
    return await this.sessionRepo.getAllLiveRiderPositions(filter);
  }

  /**
   * Search Nearby Riders within Radius (in km)
   */
  async getNearbyRiders({ lon, lat, radiusKm = 5, limit = 50 }) {
    if (lon === undefined || lat === undefined) {
      const error = new Error("Parameter 'lon' dan 'lat' harus diisi.");
      error.statusCode = 400;
      throw error;
    }

    const riders = await this.sessionRepo.findNearbyRiders({
      lon: parseFloat(lon),
      lat: parseFloat(lat),
      radiusKm: parseFloat(radiusKm) || 5,
      limit: parseInt(limit, 10) || 50,
    });

    return {
      riders,
      total: riders.length,
      radius_km: parseFloat(radiusKm) || 5,
    };
  }

  /**
   * Get Geofence Transition Logs for Auditing
   */
  async getZoneLogs(query = {}) {
    return await this.sessionRepo.getZoneLogs(query);
  }
}

export const lbsGeofenceService = LbsGeofenceService.getInstance();
