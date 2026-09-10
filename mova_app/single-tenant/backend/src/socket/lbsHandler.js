/*
 *   Copyright (c) 2026 
 *   All rights reserved.
 *   lbsHandler.js (Real-Time Location-Based Services & PostGIS Geofencing Socket Handler)
 */

import { socketManager } from "./socketManager.js";
import { redisClient } from "../config/redis.js";
import { redisGeoService } from "../services/lbs/RedisGeoService.js";
import { pool } from "../config/database.js";
import { auditLogger } from "../utils/AuditLogger.js";
import { eventPublisher } from "../events/eventPublisher.js";

export const registerLbsSocketHandlers = (io) => {
  io.on("connection", (socket) => {
    const user = socket.user;

    // Only Riders can emit location updates
    if (user.role === "RIDER") {
      socket.on("rider:location_update", async (data) => {
        try {
          const { lat, lon, speed = 0, heading = 0 } = data || {};
          if (lat === undefined || lon === undefined) return;

          const locationData = {
            rider_id: user.id,
            rider_name: user.name,
            latitude: parseFloat(lat),
            longitude: parseFloat(lon),
            speed: parseFloat(speed),
            heading: parseFloat(heading),
            updated_at: new Date().toISOString(),
          };

          // 1. Store Live Location in Redis Geospatial Index Set (GEOADD & HMSET)
          await redisGeoService.updateRiderLocation({
            riderId: user.id,
            riderName: user.name,
            lat,
            lon,
            speed,
            heading,
          });

          // 2. Real-Time Broadcast to Supervisors Room
          socketManager.broadcastToSupervisors("supervisor:rider_moved", locationData);

          // 3. PostGIS Geofence Spatial Boundary Validation
          const queryAssignedZone = `
            SELECT 
              za.id AS assignment_id,
              z.id AS zone_id,
              z.name AS zone_name,
              z.polygon
            FROM zone_assignments za
            JOIN zones z ON za.zone_id = z.id
            WHERE za.rider_id = $1
              AND za.status IN ('ASSIGNED', 'CHECKED_IN')
            ORDER BY za.created_at DESC
            LIMIT 1;
          `;

          const { rows } = await pool.query(queryAssignedZone, [user.id]);
          if (rows.length > 0) {
            const assignment = rows[0];
            let rawPoly = assignment.polygon;
            if (typeof rawPoly === "string") {
              try { rawPoly = JSON.parse(rawPoly); } catch (e) {}
            }

            let geoJsonObj = rawPoly;
            if (Array.isArray(geoJsonObj)) {
              const coords = Array.isArray(geoJsonObj[0][0]) ? geoJsonObj : [geoJsonObj];
              geoJsonObj = {
                type: "Polygon",
                coordinates: coords,
              };
            } else if (geoJsonObj && geoJsonObj.geometry) {
              geoJsonObj = geoJsonObj.geometry;
            }

            let isInside = true;
            try {
              const spatialCheckQuery = `
                SELECT ST_Contains(
                  ST_SetSRID(ST_GeomFromGeoJSON($1), 4326),
                  ST_SetSRID(ST_MakePoint($2, $3), 4326)
                ) AS is_inside;
              `;

              const { rows: spatialRows } = await pool.query(spatialCheckQuery, [
                JSON.stringify(geoJsonObj),
                parseFloat(lon),
                parseFloat(lat),
              ]);

              isInside = spatialRows[0]?.is_inside || false;
            } catch (spatialErr) {
              console.warn("⚠️ Warning: Socket geofence spatial check failed:", spatialErr.message);
              isInside = true; // Non-fatal default
            }

            if (!isInside) {
              const breachMessage = `⚠️ PERINGATAN GEOFENCE: Anda berada di luar batas operasional ${assignment.zone_name}! Harap kembali ke dalam zona tugas.`;

              // Emit via single canonical eventPublisher (10s sliding window deduplication)
              const warningEnvelope = eventPublisher.publishGeofenceBreach({
                riderId: user.id,
                riderName: user.name,
                zoneName: assignment.zone_name,
                lat,
                lon,
                message: breachMessage,
              });

              // Log audit event asynchronously
              await auditLogger.logAction({
                action: "GEOFENCE_BREACH_DETECTED",
                entityType: "RIDER_LBS",
                entityId: user.id,
                details: warningEnvelope,
              });
            }
          }
        } catch (error) {
          console.error(`💥 [LBS HANDLER ERROR] Error processing location update for Rider '${user.name}':`, error.message);
        }
      });
    }
  });
};
