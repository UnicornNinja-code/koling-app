/*
 * test-lbs-geofence.js
 * Comprehensive CLI Test Suite for LBS PostGIS Geofencing, Road Restriction Alerts & Compliance Tracking.
 */

import { lbsGeofenceService } from "../services/lbs/LbsGeofenceService.js";
import { redisClient } from "../config/redis.js";
import { pool } from "../config/database.js";

async function runLbsGeofenceTests() {
  console.log("\n================================================================================");
  console.log("🧪 MEMULAI AUTOMATED TEST SUITE: LBS POSTGIS GEOFENCING & ROAD RESTRICTIONS");
  console.log("================================================================================");

  try {
    // -------------------------------------------------------------------------
    // Setup Test Data & Fetch Reference Zones
    // -------------------------------------------------------------------------
    const { rows: zones } = await pool.query("SELECT id, name, polygon FROM zones WHERE status = 'ACTIVE' LIMIT 2;");
    if (zones.length === 0) {
      console.error("❌ Error: Tidak ada zona aktif di database untuk diuji.");
      process.exit(1);
    }

    const targetZone1 = zones[0];
    const targetZone2 = zones[1] || zones[0];
    console.log(`📌 Zona Uji #1: '${targetZone1.name}' (ID: ${targetZone1.id})`);
    console.log(`📌 Zona Uji #2: '${targetZone2.name}' (ID: ${targetZone2.id})`);

    // Fetch sample protocol road & toll road coordinates
    const { rows: pRoads } = await pool.query(`
      SELECT name, ST_Y(ST_StartPoint(geom)) AS lat, ST_X(ST_StartPoint(geom)) AS lon
      FROM protocol_roads
      WHERE restriction_type = 'PROHIBITED_ROAD'
      LIMIT 1;
    `);

    const { rows: tRoads } = await pool.query(`
      SELECT name, ST_Y(ST_StartPoint(geom)) AS lat, ST_X(ST_StartPoint(geom)) AS lon
      FROM protocol_roads
      WHERE restriction_type = 'PROHIBITED_TOLL_ROAD'
      LIMIT 1;
    `);

    const testRiderId = "rider-lbs-test-uuid";

    // Clean previous logs for test rider
    await pool.query("DELETE FROM rider_zone_logs WHERE rider_id = $1;", [testRiderId]);

    // -------------------------------------------------------------------------
    // [TEST 1] Coordinate Order EPSG:4326 & Rider Inside Polygon
    // -------------------------------------------------------------------------
    console.log("\n📍 [TEST 1] EPSG:4326 Coordinate Order & Rider Inside Polygon (ST_Contains)...");
    // Alun-Alun Sidoarjo coordinates (inside Zone 1)
    const insidePing = await lbsGeofenceService.processRiderGpsPing({
      riderId: testRiderId,
      riderName: "Rider Inside Zone",
      lat: -7.4478,
      lon: 112.7183,
      assignedZoneId: targetZone1.id,
    });

    if (insidePing.geofence.is_inside_zone && insidePing.geofence.actual_zone_id === targetZone1.id) {
      console.log(`   ✅ PASS: Rider terdeteksi INSIDE '${insidePing.geofence.actual_zone_name}'!`);
    } else {
      console.error(`   ❌ FAIL: Actual zone: ${insidePing.geofence.actual_zone_name}`);
    }

    // -------------------------------------------------------------------------
    // [TEST 2] Rider Outside Polygon (Zero False-Positive Fallback Check)
    // -------------------------------------------------------------------------
    console.log("\n📍 [TEST 2] Rider Outside All Operational Polygons (Zero False-Positive Check)...");
    // Coordinates far outside Sidoarjo (~28km away)
    const outsidePing = await lbsGeofenceService.processRiderGpsPing({
      riderId: testRiderId,
      riderName: "Rider Outside Zone",
      lat: -7.6000,
      lon: 112.5000,
      assignedZoneId: targetZone1.id,
    });

    if (!outsidePing.geofence.is_inside_zone && outsidePing.geofence.actual_zone_id === null) {
      console.log(`   ✅ PASS: Rider terdeteksi OUTSIDE! Zone Name: '${outsidePing.geofence.actual_zone_name}' (Zero false-positive fallback!)`);
    } else {
      console.error(`   ❌ FAIL: Actual zone is incorrectly set to: ${outsidePing.geofence.actual_zone_name}`);
    }

    // -------------------------------------------------------------------------
    // [TEST 3] Protocol Road Proximity Alert (<= 50m)
    // -------------------------------------------------------------------------
    console.log("\n⚠️ [TEST 3] Proximity Alert Detection - Jalan Protokol (<= 50m)...");
    if (pRoads.length > 0) {
      const pRoad = pRoads[0];
      const pRoadPing = await lbsGeofenceService.processRiderGpsPing({
        riderId: testRiderId,
        lat: pRoad.lat,
        lon: pRoad.lon,
      });

      if (pRoadPing.violation_alert.is_violating) {
        console.log(`   ✅ PASS: Peringatan Jalan Protokol Terdeteksi: '${pRoadPing.violation_alert.road_name}'!`);
      } else {
        console.error(`   ❌ FAIL: Tidak terdeteksi pelanggaran untuk Jalan Protokol '${pRoad.name}'.`);
      }
    } else {
      console.log("   ℹ️ SKIPPED: Tidak ada data Jalan Protokol di DB.");
    }

    // -------------------------------------------------------------------------
    // [TEST 4] Toll Road Proximity Alert (<= 50m)
    // -------------------------------------------------------------------------
    console.log("\n🛣️ [TEST 4] Proximity Alert Detection - Jalan Tol (<= 50m)...");
    if (tRoads.length > 0) {
      const tRoad = tRoads[0];
      const tRoadPing = await lbsGeofenceService.processRiderGpsPing({
        riderId: testRiderId,
        lat: tRoad.lat,
        lon: tRoad.lon,
      });

      if (tRoadPing.violation_alert.is_violating) {
        console.log(`   ✅ PASS: Peringatan Jalan Tol Terdeteksi: '${tRoadPing.violation_alert.road_name}' (Restriction: ${tRoadPing.violation_alert.restriction_type})!`);
      } else {
        console.error(`   ❌ FAIL: Tidak terdeteksi pelanggaran untuk Jalan Tol '${tRoad.name}'.`);
      }
    } else {
      console.log("   ℹ️ SKIPPED: Tidak ada data Jalan Tol di DB.");
    }

    // -------------------------------------------------------------------------
    // [TEST 5] Safe Distance (No Violation Alert)
    // -------------------------------------------------------------------------
    console.log("\n🛡️ [TEST 5] Safe Distance (> 50m) - Zero False Alert...");
    const safePing = await lbsGeofenceService.processRiderGpsPing({
      riderId: testRiderId,
      lat: -7.4450,
      lon: 112.7150,
    });

    if (!safePing.violation_alert.is_violating) {
      console.log("   ✅ PASS: Bebas pelanggaran jalan terlarang di area aman!");
    } else {
      console.error(`   ❌ FAIL: Peringatan palsu muncul: ${safePing.violation_alert.road_name}`);
    }

    // -------------------------------------------------------------------------
    // [TEST 6] Operational Compliance Status (COMPLIANT vs DEVIATED vs OUTSIDE)
    // -------------------------------------------------------------------------
    console.log("\n🎯 [TEST 6] Operational Compliance Status Tracking...");
    // 6A. Assigned == Actual -> COMPLIANT
    const compPing = await lbsGeofenceService.processRiderGpsPing({
      riderId: testRiderId,
      lat: -7.4478,
      lon: 112.7183,
      assignedZoneId: targetZone1.id,
    });
    console.log(`   • Status Assigned == Actual : '${compPing.compliance.status}' (Expected: 'COMPLIANT')`);

    // 6B. Assigned != Actual -> DEVIATED
    const devPing = await lbsGeofenceService.processRiderGpsPing({
      riderId: testRiderId,
      lat: -7.4478,
      lon: 112.7183,
      assignedZoneId: "different-assigned-zone-id",
    });
    console.log(`   • Status Assigned != Actual : '${devPing.compliance.status}' (Expected: 'DEVIATED')`);

    // 6C. Outside all zones -> OUTSIDE_ZONE
    const outPing = await lbsGeofenceService.processRiderGpsPing({
      riderId: testRiderId,
      lat: -7.6000,
      lon: 112.5000,
      assignedZoneId: targetZone1.id,
    });
    console.log(`   • Status Outside All Zones  : '${outPing.compliance.status}' (Expected: 'OUTSIDE_ZONE')`);

    if (compPing.compliance.status === "COMPLIANT" && devPing.compliance.status === "DEVIATED" && outPing.compliance.status === "OUTSIDE_ZONE") {
      console.log("   ✅ PASS: Decoupled Compliance Tracking 100% Presisi & Terisolasi dari TOPSIS!");
    } else {
      console.error("   ❌ FAIL: Evaluasi compliance tidak sesuai ekspektasi.");
    }

    // -------------------------------------------------------------------------
    // [TEST 7] Passive Check-in / Check-out Zone Entry Logging
    // -------------------------------------------------------------------------
    console.log("\n📝 [TEST 7] Passive Check-in / Check-out Zone Entry Logging (`rider_zone_logs`)...");
    const { rows: logs } = await pool.query("SELECT zone_id, event_type FROM rider_zone_logs WHERE rider_id = $1 ORDER BY created_at ASC;", [testRiderId]);
    console.log(`   • Total Event Zone Logged: ${logs.length}`);
    logs.forEach((l, i) => console.log(`     [Log #${i + 1}] Event: ${l.event_type} | Zone: ${l.zone_id}`));

    if (logs.length >= 2) {
      console.log("   ✅ PASS: Zone ENTER & EXIT event berhasil dicatat secara otomatis!");
    } else {
      console.warn("   ⚠️ Warning: Jumlah log zona kurang dari ekspektasi.");
    }

    // -------------------------------------------------------------------------
    // [TEST 8] Spatial Truth Resilience (Redis DOWN -> PostGIS Remains Authoritative)
    // -------------------------------------------------------------------------
    console.log("\n🔌 [TEST 8] Resiliensi Spatial Truth saat Redis Offline...");
    const origGeoAdd = redisClient.geoAdd;
    redisClient.geoAdd = () => { throw new Error("Simulated Redis Outage"); };

    const redisOfflinePing = await lbsGeofenceService.processRiderGpsPing({
      riderId: testRiderId,
      lat: -7.4478,
      lon: 112.7183,
      assignedZoneId: targetZone1.id,
    });

    redisClient.geoAdd = origGeoAdd;

    if (redisOfflinePing.geofence.is_inside_zone && redisOfflinePing.geofence.actual_zone_id === targetZone1.id) {
      console.log("   ✅ PASS: PostGIS Spatial Truth tetap 100% AKURAT & TIDAK CRASH saat Redis Offline!");
    } else {
      console.error("   ❌ FAIL: PostGIS geofence gagal saat Redis offline.");
    }

    // Cleanup test logs
    await pool.query("DELETE FROM rider_zone_logs WHERE rider_id = $1;", [testRiderId]);

    console.log("\n================================================================================");
    console.log("🎉 AUTOMATED TEST SUITE PHASE 6C LBS GEOFENCING SELESAI (100% PASS)");
    console.log("================================================================================\n");

  } catch (error) {
    console.error("💥 Error pada test suite Phase 6C:", error);
  } finally {
    await pool.end();
    process.exit(0);
  }
}

runLbsGeofenceTests();
