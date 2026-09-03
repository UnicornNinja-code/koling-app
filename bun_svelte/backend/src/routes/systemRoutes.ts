/*
 * systemRoutes.ts
 * API Routes for System Readiness & Foundation Configuration in TypeScript
 */

import express from "express";
import {
  getSystemReadiness,
  updateSystemSettings,
  getSetupStatus,
  saveSetupStep,
  applySystemSetup,
} from "../controllers/systemSettingController.js";
import { authenticateToken } from "../middlewares/authMiddleware.js";
import { checkRole } from "../middlewares/roleMiddleware.js";

const router = express.Router();

router.get(
  "/readiness",
  authenticateToken,
  getSystemReadiness
);

router.get(
  "/settings",
  authenticateToken,
  getSystemReadiness
);

router.put(
  "/settings",
  authenticateToken,
  checkRole(["SUPERADMIN", "MANAGEMENT"]),
  updateSystemSettings
);

// First-Run System Setup / Initial Configuration Wizard Gate
router.get(
  "/setup-status",
  authenticateToken,
  getSetupStatus
);

router.post(
  "/setup-step",
  authenticateToken,
  checkRole(["SUPERADMIN"]),
  saveSetupStep
);

router.post(
  "/apply-setup",
  authenticateToken,
  checkRole(["SUPERADMIN"]),
  applySystemSetup
);

export default router;
