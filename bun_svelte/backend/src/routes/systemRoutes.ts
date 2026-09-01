/*
 * systemRoutes.ts
 * API Routes for System Readiness & Foundation Configuration in TypeScript
 */

import express from "express";
import { getSystemReadiness, updateSystemSettings } from "../controllers/systemSettingController.js";
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

export default router;
