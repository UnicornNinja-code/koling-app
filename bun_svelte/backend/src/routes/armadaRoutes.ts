/*
 * armadaRoutes.ts
 * API Routes for Armada Management in TypeScript
 */

import express from "express";
import {
  getAllArmadas,
  getArmadaById,
  createArmada,
  updateArmada,
  deleteArmada,
} from "../controllers/armadaController.js";
import { authenticateToken } from "../middlewares/authMiddleware.js";
import { checkRole } from "../middlewares/roleMiddleware.js";

const router = express.Router();

// Get all armadas & get by ID
router.get("/", authenticateToken, getAllArmadas);
router.get("/:id", authenticateToken, getArmadaById);

// Create, Update, & Delete armadas (RBAC: SUPERADMIN, MANAGEMENT)
router.post(
  "/",
  authenticateToken,
  checkRole(["SUPERADMIN", "MANAGEMENT"]),
  createArmada
);

router.put(
  "/:id",
  authenticateToken,
  checkRole(["SUPERADMIN", "MANAGEMENT"]),
  updateArmada
);

router.delete(
  "/:id",
  authenticateToken,
  checkRole(["SUPERADMIN", "MANAGEMENT"]),
  deleteArmada
);

export default router;
