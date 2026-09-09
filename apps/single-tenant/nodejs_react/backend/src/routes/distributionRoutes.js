/*
 *   Copyright (c) 2026 
 *   All rights reserved.
 *   distributionRoutes.js (API Routes for Rider Duty Queue & Distribution Engine)
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

// 1. Rider confirms availability duty for today (RIDER, SPV, SUPERADMIN)
router.post(
  "/duty-confirm",
  authenticateToken,
  confirmDuty
);

// 2. Fetch Distribution Overview: FIFO Queue + TOPSIS Ranks + Capacity (SPV, MANAGEMENT, SUPERADMIN)
router.get(
  "/overview",
  authenticateToken,
  checkRole(["SUPERADMIN", "MANAGEMENT", "SUPERVISOR"]),
  getDistributionOverview
);

// 3. Trigger Automatic Distribution (FIFO + TOPSIS Rank + Capacity) (SPV, SUPERADMIN)
router.post(
  "/auto",
  authenticateToken,
  checkRole(["SUPERADMIN", "SUPERVISOR"]),
  autoDistribute
);

// 4. Trigger Manual Distribution (Plotting single rider manually) (SPV, SUPERADMIN)
router.post(
  "/manual",
  authenticateToken,
  checkRole(["SUPERADMIN", "SUPERVISOR"]),
  manualDistribute
);

// 5. Fetch authenticated rider's personal duty & assignment history (Ownership-scoped)
router.get(
  "/my-history",
  authenticateToken,
  getMyDutyHistory
);

export default router;

