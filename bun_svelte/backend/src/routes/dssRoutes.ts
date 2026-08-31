/*
 * dssRoutes.ts
 * API Routes for DSS BWM Weight Engine & TOPSIS Recommendations in TypeScript
 */

import express from "express";
import {
  calculateBwmWeights,
  getActiveDssConfig,
  getZoneRawEvaluation,
  evaluateHybridBwmTopsis,
  getDssSnapshots,
  getDssSnapshotById,
  getTopsisRecommendations,
} from "../controllers/dssController.js";
import { authenticateToken } from "../middlewares/authMiddleware.js";
import { checkRole } from "../middlewares/roleMiddleware.js";

const router = express.Router();

router.post(
  "/bwm/calculate",
  authenticateToken,
  checkRole(["SUPERADMIN"]),
  calculateBwmWeights
);

router.get(
  "/bwm/active",
  authenticateToken,
  checkRole(["SUPERADMIN", "SUPERVISOR"]),
  getActiveDssConfig
);

router.get(
  "/zones/:id/raw-evaluation",
  authenticateToken,
  checkRole(["SUPERADMIN", "SUPERVISOR"]),
  getZoneRawEvaluation
);

router.post(
  "/evaluate",
  authenticateToken,
  checkRole(["SUPERADMIN", "SUPERVISOR"]),
  evaluateHybridBwmTopsis
);

router.get(
  "/snapshots",
  authenticateToken,
  checkRole(["SUPERADMIN", "SUPERVISOR"]),
  getDssSnapshots
);

router.get(
  "/snapshots/:id",
  authenticateToken,
  checkRole(["SUPERADMIN", "SUPERVISOR"]),
  getDssSnapshotById
);

router.get(
  "/recommendations",
  authenticateToken,
  getTopsisRecommendations
);

export default router;
