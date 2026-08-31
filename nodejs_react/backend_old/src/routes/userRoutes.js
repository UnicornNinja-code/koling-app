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
} from "../controllers/userController.js";
import { authenticateToken } from "../middlewares/authMiddleware.js";
import { checkRole } from "../middlewares/roleMiddleware.js";

const router = express.Router();

// All user routes require authentication
router.use(authenticateToken);

router.get("/profile", getProfile);
router.put("/change-password", changePassword);

// Only Superadmin & Management can view all users
router.get("/", checkRole(["SUPERADMIN", "MANAGEMENT"]), getAllUsers);

// Create user account (SUPERADMIN & MANAGEMENT only, hierarchy enforced in service)
router.post("/", checkRole(["SUPERADMIN", "MANAGEMENT"]), createUser);

// Only Superadmin & Management can view specific user details
router.get("/:id", checkRole(["SUPERADMIN", "MANAGEMENT"]), getUserById);

// Update user profile/role (Ownership & RBAC check enforced in service)
router.put("/:id", updateUser);

// Activate / Deactivate user account (SUPERADMIN & MANAGEMENT only, hierarchy enforced in service)
router.patch("/:id/status", checkRole(["SUPERADMIN", "MANAGEMENT"]), setUserStatus);

// Delete user (SUPERADMIN & MANAGEMENT, hierarchy enforced in service)
router.delete("/:id", checkRole(["SUPERADMIN", "MANAGEMENT"]), deleteUser);

export default router;
