/*
 * userRoutes.ts
 * API Routes for User Management in TypeScript
 */

import express from "express";
import {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  setUserStatus,
  deleteUser,
  getProfile,
  changePassword,
  adminResetPassword,
} from "../controllers/userController.js";
import { authenticateToken } from "../middlewares/authMiddleware.js";
import { checkRole } from "../middlewares/roleMiddleware.js";

const router = express.Router();

router.use(authenticateToken);

router.get("/profile", getProfile);
router.put("/change-password", changePassword);

// Only Superadmin & Management can view all users
router.get("/", checkRole(["SUPERADMIN", "MANAGEMENT"]), getAllUsers);

// Create user account
router.post("/", checkRole(["SUPERADMIN", "MANAGEMENT"]), createUser);

// Only Superadmin & Management can view specific user details
router.get("/:id", checkRole(["SUPERADMIN", "MANAGEMENT"]), getUserById);

// Update user profile/role
router.put("/:id", updateUser);

// Administrative password reset
router.post("/:id/reset-password", checkRole(["SUPERADMIN", "MANAGEMENT"]), adminResetPassword);

// Activate / Deactivate user account
router.patch("/:id/status", checkRole(["SUPERADMIN", "MANAGEMENT"]), setUserStatus);

// Delete user
router.delete("/:id", checkRole(["SUPERADMIN", "MANAGEMENT"]), deleteUser);

export default router;
