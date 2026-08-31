/*
 * competitorRoutes.ts
 * API Routes for Competitor Field Survey Data Management in TypeScript
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

router.get(
  "/zone/:zone_id",
  authenticateToken,
  getCompetitorsByZone
);

router.post(
  "/",
  authenticateToken,
  checkRole(["SUPERADMIN", "SUPERVISOR"]),
  createCompetitor
);

router.delete(
  "/:id",
  authenticateToken,
  checkRole(["SUPERADMIN", "SUPERVISOR"]),
  deleteCompetitor
);

export default router;
