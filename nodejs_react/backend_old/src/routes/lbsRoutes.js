/*
 *   Copyright (c) 2026 
 *   All rights reserved.
 *   lbsRoutes.js (API Routes for Redis Geospatial Proximity & Radius Search)
 */

import express from "express";
import {
  getNearbyRiders,
  getRiderLocation,
  calculateRiderDistance,
  trackRiderLocation,
} from "../controllers/lbsController.js";
import { authenticateToken } from "../middlewares/authMiddleware.js";
import { checkRole } from "../middlewares/roleMiddleware.js";

const router = express.Router();

// 1. Live Rider GPS Tracking & LBS Geofence Compliance Check
router.post(
  "/track",
  authenticateToken,
  trackRiderLocation
);

// 2. Proximity Radius Search (RBAC: SUPERADMIN, MANAGEMENT, SUPERVISOR, RIDER)
router.get(
  "/nearby",
  authenticateToken,
  checkRole(["SUPERADMIN", "MANAGEMENT", "SUPERVISOR", "RIDER"]),
  getNearbyRiders
);

// 3. Calculate Distance Between Two Active Riders
router.get(
  "/distance",
  authenticateToken,
  checkRole(["SUPERADMIN", "MANAGEMENT", "SUPERVISOR", "RIDER"]),
  calculateRiderDistance
);

// 4. Single Rider Live Position Query
router.get(
  "/riders/:riderId",
  authenticateToken,
  checkRole(["SUPERADMIN", "MANAGEMENT", "SUPERVISOR", "RIDER"]),
  getRiderLocation
);

export default router;
