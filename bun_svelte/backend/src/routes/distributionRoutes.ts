/*
 * distributionRoutes.ts
 * API Routes for Rider Duty Queue & Distribution Engine in TypeScript
 */

import express from "express";
import {
  confirmDuty,
  getDistributionOverview,
  autoDistribute,
  manualDistribute,
  getMyDutyHistory,
} from "../controllers/distributionController.js";
import { authenticateToken } from "../middlewares/authMiddleware.js";
import { checkRole } from "../middlewares/roleMiddleware.js";

const router = express.Router();

router.post(
  "/duty-confirm",
  authenticateToken,
  confirmDuty
);

router.get(
  "/overview",
  authenticateToken,
  checkRole(["SUPERADMIN", "MANAGEMENT", "SUPERVISOR"]),
  getDistributionOverview
);

router.post(
  "/auto",
  authenticateToken,
  checkRole(["SUPERADMIN", "SUPERVISOR"]),
  autoDistribute
);

router.post(
  "/manual",
  authenticateToken,
  checkRole(["SUPERADMIN", "SUPERVISOR"]),
  manualDistribute
);

router.get(
  "/my-history",
  authenticateToken,
  getMyDutyHistory
);

export default router;
