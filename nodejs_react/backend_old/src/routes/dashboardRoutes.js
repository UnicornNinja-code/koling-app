/*
 *   Copyright (c) 2026 
 *   All rights reserved.
 *   dashboardRoutes.js (API Routes for Dashboard Analytics & Reports)
 */

import express from "express";
import {
  getSummary,
  getSalesTrend,
  getZonePerformance,
  getProductPerformance,
} from "../controllers/dashboardController.js";
import { authenticateToken } from "../middlewares/authMiddleware.js";
import { checkRole } from "../middlewares/roleMiddleware.js";

const router = express.Router();

// 1. Unified Dashboard Summary (SUPERADMIN, MANAGEMENT, SUPERVISOR)
router.get(
  "/summary",
  authenticateToken,
  checkRole(["SUPERADMIN", "MANAGEMENT", "SUPERVISOR"]),
  getSummary
);

// 2. Sales Trend Time-Series (SUPERADMIN, MANAGEMENT, SUPERVISOR)
router.get(
  "/sales-trend",
  authenticateToken,
  checkRole(["SUPERADMIN", "MANAGEMENT", "SUPERVISOR"]),
  getSalesTrend
);

// 3. Zone Performance & Capacity Metrics (SUPERADMIN, MANAGEMENT, SUPERVISOR)
router.get(
  "/zone-performance",
  authenticateToken,
  checkRole(["SUPERADMIN", "MANAGEMENT", "SUPERVISOR"]),
  getZonePerformance
);

// 4. Product Performance & Menu Contribution (SUPERADMIN, MANAGEMENT ONLY)
router.get(
  "/product-performance",
  authenticateToken,
  checkRole(["SUPERADMIN", "MANAGEMENT"]),
  getProductPerformance
);

export default router;
