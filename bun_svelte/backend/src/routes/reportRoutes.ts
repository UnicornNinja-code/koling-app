/*
 * reportRoutes.ts
 * API Routes for Operational, DSS, Fleet, and Executive Reports
 */

import express from "express";
import {
  getRiderOperationalReport,
  getZoneEffectivenessReport,
  getFleetReport,
  getDssAccuracyReport,
  getExecutiveSummary,
} from "../controllers/reportController.js";
import { authenticateToken } from "../middlewares/authMiddleware.js";
import { checkRole } from "../middlewares/roleMiddleware.js";

const router = express.Router();

router.use(authenticateToken);
router.use(checkRole(["SUPERADMIN", "MANAGEMENT", "SUPERVISOR"]));

router.get("/riders", getRiderOperationalReport);
router.get("/zones/effectiveness", getZoneEffectivenessReport);
router.get("/fleet", getFleetReport);
router.get("/dss/accuracy", getDssAccuracyReport);
router.get("/executive-summary", getExecutiveSummary);

export default router;
