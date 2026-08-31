/*
 *   Copyright (c) 2026 
 *   All rights reserved.
 *   competitorRoutes (API Routes for Competitor Field Survey Data Management)
 */

import express from "express";
import {
  getCompetitorsByZone,
  createCompetitor,
  deleteCompetitor,
} from "../controllers/competitorController.js";
import { authenticateToken } from "../middlewares/authMiddleware.js";
import { checkRole } from "../middlewares/roleMiddleware.js";

const router = express.Router();

// Fetch field competitors for a specific zone
router.get(
  "/zone/:zone_id",
  authenticateToken,
  getCompetitorsByZone
);

// Add new field competitor record (RBAC: SUPERADMIN, SUPERVISOR)
router.post(
  "/",
  authenticateToken,
  checkRole(["SUPERADMIN", "SUPERVISOR"]),
  createCompetitor
);

// Delete field competitor record (RBAC: SUPERADMIN, SUPERVISOR)
router.delete(
  "/:id",
  authenticateToken,
  checkRole(["SUPERADMIN", "SUPERVISOR"]),
  deleteCompetitor
);

export default router;
