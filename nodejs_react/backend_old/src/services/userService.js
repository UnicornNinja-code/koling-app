/*
 *   Copyright (c) 2026 
 *   All rights reserved.
 */

import bcrypt from "bcrypt";
import { UserModel } from "../models/userModel.js";
import { RefreshTokenModel } from "../models/refreshTokenModel.js";

const ROLE_HIERARCHY = {
    SUPERADMIN: 4,
    MANAGEMENT: 3,
    SUPERVISOR: 2,
    RIDER: 1,
};

/**
 * Get current user profile by user ID
 */
const getProfileService = async (userId) => {
    const user = await UserModel.findById(userId);
    if (!user) {
        const error = new Error("User not found");
        error.statusCode = 404;
        throw error;
    }
    return user;
};

/**
 * Get all users
 */
const getAllUsersService = async () => {
    const users = await UserModel.findAll();
    return { users, count: users.length };
};

/**
 * Get user by ID
 */
const getUserByIdService = async (id) => {
    const user = await UserModel.findById(id);
    if (!user) {
        const error = new Error("User not found");
        error.statusCode = 404;
        throw error;
    }
    return user;
};

/**
 * Create a new user account with RBAC Hierarchy check
 */
const createUserService = async ({ username, name, email, password, role }, currentUser) => {
    if (!username || !name || !email || !password || !role) {
        const error = new Error("Please provide all required fields: username, name, email, password, and role");
        error.statusCode = 400;
        throw error;
    }

    const validRoles = ["SUPERADMIN", "MANAGEMENT", "SUPERVISOR", "RIDER"];
    if (!validRoles.includes(role)) {
        const error = new Error("Invalid role specified");
        error.statusCode = 400;
        throw error;
    }

    // Role-based creation rules
    if (currentUser.role === "SUPERADMIN") {
        // Superadmin can create any role
    } else if (currentUser.role === "MANAGEMENT") {
        // Management can create MANAGEMENT, SUPERVISOR, RIDER (cannot create SUPERADMIN)
        if (role === "SUPERADMIN") {
            const error = new Error("Access forbidden: MANAGEMENT cannot create SUPERADMIN accounts");
            error.statusCode = 403;
            throw error;
        }
    } else {
        // SUPERVISOR, RIDER, etc. cannot create accounts
        const error = new Error("Access forbidden: insufficient permissions to create user accounts");
        error.statusCode = 403;
        throw error;
    }

    const existingUser = await UserModel.findByEmailOrUsername(email);
    if (existingUser) {
        const error = new Error("Email is already registered");
        error.statusCode = 400;
        throw error;
    }

    const existingUsername = await UserModel.findByEmailOrUsername(username);
    if (existingUsername) {
        const error = new Error("Username is already taken");
        error.statusCode = 400;
        throw error;
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await UserModel.create({
        username,
        name,
        email,
        role,
        password: hashedPassword,
    });

    return newUser;
};

/**
 * Update user profile / role with IDOR protection & RBAC checks
 */
const updateUserService = async (id, { name, email, role }, currentUser) => {
    const targetUser = await UserModel.findById(id);
    if (!targetUser) {
        const error = new Error("User not found");
        error.statusCode = 404;
        throw error;
    }

    const isSelf = String(currentUser.id) === String(id);

    if (isSelf) {
        // User can update their own name/email
        // If attempting to change role, only SUPERADMIN can do it
        if (role && role !== targetUser.role && currentUser.role !== "SUPERADMIN") {
            const error = new Error("Only SUPERADMIN can change user role");
            error.statusCode = 403;
            throw error;
        }
    } else {
        // Modifying another user's account
        if (currentUser.role === "SUPERADMIN") {
            // Superadmin can update any user and change role
        } else if (currentUser.role === "MANAGEMENT") {
            // Management cannot modify SUPERADMIN accounts
            if (targetUser.role === "SUPERADMIN") {
                const error = new Error("Access forbidden: cannot modify SUPERADMIN accounts");
                error.statusCode = 403;
                throw error;
            }
            // Management cannot elevate any user to SUPERADMIN
            if (role === "SUPERADMIN") {
                const error = new Error("Access forbidden: cannot assign SUPERADMIN role");
                error.statusCode = 403;
                throw error;
            }
        } else {
            // SUPERVISOR or RIDER cannot modify other users (prevents IDOR)
            const error = new Error("Access forbidden: you can only update your own profile");
            error.statusCode = 403;
            throw error;
        }
    }

    // If changing email, check uniqueness if different from current
    if (email && email.toLowerCase() !== targetUser.email.toLowerCase()) {
        const existingEmail = await UserModel.findByEmailOrUsername(email);
        if (existingEmail && String(existingEmail.id) !== String(id)) {
            const error = new Error("Email is already registered");
            error.statusCode = 400;
            throw error;
        }
    }

    const updatedUser = await UserModel.update(id, { name, email, role: role || undefined });
    return updatedUser;
};

/**
 * Activate or Deactivate user account with RBAC Hierarchy check
 */
const setUserStatusService = async (id, isActive, currentUser) => {
    if (typeof isActive !== "boolean") {
        const error = new Error("Parameter 'is_active' boolean value is required");
        error.statusCode = 400;
        throw error;
    }

    if (String(id) === String(currentUser.id)) {
        const error = new Error("Cannot activate or deactivate your own account");
        error.statusCode = 400;
        throw error;
    }

    const targetUser = await UserModel.findById(id);
    if (!targetUser) {
        const error = new Error("User not found");
        error.statusCode = 404;
        throw error;
    }

    if (currentUser.role === "SUPERADMIN") {
        // Allowed
    } else if (currentUser.role === "MANAGEMENT") {
        if (targetUser.role === "SUPERADMIN") {
            const error = new Error("Access forbidden: cannot modify SUPERADMIN accounts");
            error.statusCode = 403;
            throw error;
        }
    } else {
        const error = new Error("Access forbidden: insufficient permissions to manage user status");
        error.statusCode = 403;
        throw error;
    }

    const updatedUser = await UserModel.updateStatus(id, isActive);

    // Revoke all refresh tokens if account is deactivated
    if (isActive === false) {
        await RefreshTokenModel.revokeAllForUser(id);
    }

    return {
        user: updatedUser,
        message: `User account successfully ${isActive ? "activated" : "deactivated"}`,
    };
};

/**
 * Delete user by ID with RBAC Hierarchy check
 */
const deleteUserService = async (id, currentUser) => {
    if (String(id) === String(currentUser.id)) {
        const error = new Error("Cannot delete your own account");
        error.statusCode = 400;
        throw error;
    }

    const targetUser = await UserModel.findById(id);
    if (!targetUser) {
        const error = new Error("User not found");
        error.statusCode = 404;
        throw error;
    }

    if (currentUser.role === "SUPERADMIN") {
        // Allowed
    } else if (currentUser.role === "MANAGEMENT") {
        if (targetUser.role === "SUPERADMIN") {
            const error = new Error("Access forbidden: cannot delete SUPERADMIN accounts");
            error.statusCode = 403;
            throw error;
        }
    } else {
        const error = new Error("Access forbidden: insufficient permissions to delete user accounts");
        error.statusCode = 403;
        throw error;
    }

    // Revoke all refresh tokens for deleted user
    await RefreshTokenModel.revokeAllForUser(id);

    const deletedUser = await UserModel.delete(id);
    return { message: "User deleted successfully", user: deletedUser };
};

/**
 * Change user password with current password validation
 */
const changePasswordService = async (userId, { currentPassword, newPassword }) => {
    if (!currentPassword || !newPassword) {
        const error = new Error("Kata sandi lama dan kata sandi baru wajib diisi.");
        error.statusCode = 400;
        throw error;
    }
    if (newPassword.length < 6) {
        const error = new Error("Kata sandi baru minimal 6 karakter.");
        error.statusCode = 400;
        throw error;
    }
    const user = await UserModel.findByIdWithPassword(userId);
    if (!user) {
        const error = new Error("User tidak ditemukan");
        error.statusCode = 404;
        throw error;
    }
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
        const error = new Error("Kata sandi saat ini (lama) tidak sesuai.");
        error.statusCode = 400;
        throw error;
    }
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    const updatedUser = await UserModel.updatePassword(userId, hashedPassword);
    return updatedUser;
};

export {
    getProfileService,
    getAllUsersService,
    getUserByIdService,
    createUserService,
    updateUserService,
    setUserStatusService,
    deleteUserService,
    changePasswordService
};
