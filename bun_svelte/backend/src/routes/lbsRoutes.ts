/*
 * lbsRoutes.ts
 * API Routes for Redis Geospatial Proximity & Radius Search in TypeScript
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

router.post(
  "/track",
  authenticateToken,
  trackRiderLocation
);

router.get(
  "/nearby",
  authenticateToken,
  checkRole(["SUPERADMIN", "MANAGEMENT", "SUPERVISOR", "RIDER"]),
  getNearbyRiders
);

router.get(
  "/distance",
  authenticateToken,
  checkRole(["SUPERADMIN", "MANAGEMENT", "SUPERVISOR", "RIDER"]),
  calculateRiderDistance
);

router.get(
  "/riders/:riderId",
  authenticateToken,
  checkRole(["SUPERADMIN", "MANAGEMENT", "SUPERVISOR", "RIDER"]),
  getRiderLocation
);

export default router;
