/*
 *   Copyright (c) 2026 
 *   All rights reserved.
 *   dssRoutes.js (API Routes for DSS BWM Weight Engine & TOPSIS Recommendations)
 */

import express from "express";
import {
  calculateBwmWeights,
  previewBwmImpact,
  getActiveDssConfig,
  getAllBwmConfigs,
  activateBwmConfig,
  getZoneRawEvaluation,
  evaluateHybridBwmTopsis,
  getDssSnapshots,
  getDssSnapshotById,
  getTopsisRecommendations,
} from "../controllers/dssController.js";
import { authenticateToken } from "../middlewares/authMiddleware.js";
import { checkRole } from "../middlewares/roleMiddleware.js";

const router = express.Router();

// Calculate BWM Weights and Save Configuration (RBAC: SUPERADMIN ONLY)
router.post(
  "/bwm/calculate",
  authenticateToken,
  checkRole(["SUPERADMIN"]),
  calculateBwmWeights
);

// Preview / Simulate BWM Weight Impact on TOPSIS Zone Rankings without saving (RBAC: SUPERADMIN, SUPERVISOR, MANAGEMENT)
router.post(
  "/bwm/preview-impact",
  authenticateToken,
  checkRole(["SUPERADMIN", "SUPERVISOR", "MANAGEMENT"]),
  previewBwmImpact
);

// Fetch Active DSS Configuration (RBAC: SUPERADMIN, SUPERVISOR)
router.get(
  "/bwm/active",
  authenticateToken,
  checkRole(["SUPERADMIN", "SUPERVISOR"]),
  getActiveDssConfig
);

// Fetch All Saved BWM Configurations (RBAC: SUPERADMIN, SUPERVISOR)
router.get(
  "/bwm/configs",
  authenticateToken,
  checkRole(["SUPERADMIN", "SUPERVISOR"]),
  getAllBwmConfigs
);

// Activate a Specific BWM Configuration by ID (RBAC: SUPERADMIN ONLY)
router.post(
  "/bwm/:id/activate",
  authenticateToken,
  checkRole(["SUPERADMIN"]),
  activateBwmConfig
);

// Raw Criteria Evaluation for a Zone (DSS-CRITERIA-v1.0) (RBAC: SUPERADMIN, SUPERVISOR)
router.get(
  "/zones/:id/raw-evaluation",
  authenticateToken,
  checkRole(["SUPERADMIN", "SUPERVISOR"]),
  getZoneRawEvaluation
);

// Hybrid BWM-TOPSIS Evaluation for Selected Zones (RBAC: SUPERADMIN, SUPERVISOR)
router.post(
  "/evaluate",
  authenticateToken,
  checkRole(["SUPERADMIN", "SUPERVISOR"]),
  evaluateHybridBwmTopsis
);

// Evaluation Snapshot Audit Trails & Flashback History (RBAC: SUPERADMIN, SUPERVISOR)
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
  "/history",
  authenticateToken,
  checkRole(["SUPERADMIN", "SUPERVISOR"]),
  getDssSnapshots
);

router.get(
  "/history/:id",
  authenticateToken,
  checkRole(["SUPERADMIN", "SUPERVISOR"]),
  getDssSnapshotById
);

// TOPSIS DSS Zone Recommendations (All Authenticated Roles)
router.get(
  "/recommendations",
  authenticateToken,
  getTopsisRecommendations
);

export default router;


