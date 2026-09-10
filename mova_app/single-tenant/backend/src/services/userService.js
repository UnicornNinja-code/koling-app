/*
 * COZIS (Coffee Operational Zone Intelligence System) — User Service
 * Domain: User Account Administration & Hierarchy Guard (4-Role RBAC)
 */

import bcrypt from "bcrypt";
import crypto from "crypto";
import { UserModel } from "../models/userModel.js";
import { RefreshTokenModel } from "../models/refreshTokenModel.js";
import { PasswordResetTokenModel } from "../models/passwordResetTokenModel.js";
import { env } from "../config/env.js";

/**
 * Get current user profile by user ID
 */
export const getProfileService = async (userId) => {
    const user = await UserModel.findById(userId);
    if (!user) {
        const error = new Error("Pengguna tidak ditemukan.");
        error.statusCode = 404;
        throw error;
    }
    return user;
};

/**
 * Get all users with Role-Scoped Filtering:
 * - SUPERADMIN & MANAGEMENT: Full view of users (supports ?role= filter)
 * - SUPERVISOR: Restricted to viewing RIDER accounts only (per SSOT fitur.md)
 */
export const getAllUsersService = async (currentUser, filters = {}) => {
    let users = await UserModel.findAll();

    // Supervisor view is strictly restricted to RIDER accounts
    if (currentUser.role === "SUPERVISOR") {
        users = users.filter((u) => u.role === "RIDER");
    } else if (filters.role) {
        users = users.filter((u) => u.role === filters.role.toUpperCase());
    }

    if (filters.search) {
        const searchKeyword = filters.search.toLowerCase();
        users = users.filter(
            (u) =>
                u.name?.toLowerCase().includes(searchKeyword) ||
                u.email?.toLowerCase().includes(searchKeyword) ||
                u.username?.toLowerCase().includes(searchKeyword)
        );
    }

    return { users, count: users.length };
};

/**
 * Get user by ID (SUPERADMIN & MANAGEMENT, or SUPERVISOR viewing a Rider)
 */
export const getUserByIdService = async (id, currentUser) => {
    const user = await UserModel.findById(id);
    if (!user) {
        const error = new Error("Pengguna tidak ditemukan.");
        error.statusCode = 404;
        throw error;
    }

    if (currentUser.role === "SUPERVISOR" && user.role !== "RIDER") {
        const error = new Error("Akses ditolak: Supervisor hanya dapat melihat profil Rider.");
        error.statusCode = 403;
        throw error;
    }

    return user;
};

/**
 * Create a new user account with strict RBAC Hierarchy Guard
 * Supports invitation workflow: if password is omitted, creates inactive account and issues invitation token
 */
export const createUserService = async (
    { username, name, email, password, phone, role, birth_date },
    currentUser
) => {
    if (!name || !email || !role) {
        const error = new Error(
            "Semua field wajib diisi: nama lengkap, email, dan peran (role)."
        );
        error.statusCode = 400;
        throw error;
    }

    // Auto-generate username from email if not provided
    const resolvedUsername = (username || email.split("@")[0] + "_" + Date.now().toString().slice(-4))
        .toLowerCase()
        .trim();

    const validRoles = ["SUPERADMIN", "MANAGEMENT", "SUPERVISOR", "RIDER"];
    const targetRole = role.toUpperCase();
    if (!validRoles.includes(targetRole)) {
        const error = new Error(`Peran '${role}' tidak valid. Pilihan: ${validRoles.join(", ")}`);
        error.statusCode = 400;
        throw error;
    }

    // 🔒 RBAC Hierarchy Guard Enforcement
    if (currentUser.role === "SUPERADMIN") {
        // Superadmin is authorized to create any role
    } else if (currentUser.role === "MANAGEMENT") {
        // Management can create MANAGEMENT, SUPERVISOR, or RIDER (CANNOT create SUPERADMIN)
        if (targetRole === "SUPERADMIN") {
            const error = new Error(
                "Akses ditolak (Hierarchy Guard): Management dilarang membuat akun dengan peran SUPERADMIN."
            );
            error.statusCode = 403;
            throw error;
        }
    } else {
        const error = new Error(
            "Akses ditolak: Anda tidak memiliki wewenang untuk membuat akun pengguna."
        );
        error.statusCode = 403;
        throw error;
    }

    // Check unique constraints
    const existingEmail = await UserModel.findByEmailOrUsername(email);
    if (existingEmail) {
        const error = new Error("Email ini sudah terdaftar di sistem.");
        error.statusCode = 400;
        throw error;
    }

    const existingUsername = await UserModel.findByEmailOrUsername(resolvedUsername);
    if (existingUsername) {
        const error = new Error("Username ini sudah digunakan oleh akun lain.");
        error.statusCode = 400;
        throw error;
    }

    const isInvite = !password;
    const initialPassword = password || crypto.randomBytes(16).toString("hex");
    const hashedPassword = await bcrypt.hash(initialPassword, 10);

    const newUser = await UserModel.create({
        username: resolvedUsername,
        name: name.trim(),
        email: email.toLowerCase().trim(),
        phone: phone || null,
        role: targetRole,
        password: hashedPassword,
        is_active: !isInvite,
        first_login: false,
        birth_date: birth_date || null,
    });

    let invitation_token = null;
    let invitation_link = null;

    if (isInvite) {
        invitation_token = crypto.randomBytes(32).toString("hex");
        const resetId = crypto.randomUUID();
        const expiresAt = new Date(Date.now() + 48 * 60 * 60 * 1000); // 48 hours

        await PasswordResetTokenModel.create({
            id: resetId,
            token: invitation_token,
            userId: newUser.id,
            expiresAt,
        });

        const frontendBaseUrl = env.FRONTEND_URL || "http://localhost:5173";
        invitation_link = `${frontendBaseUrl}/activate?token=${invitation_token}&email=${encodeURIComponent(newUser.email)}`;
    }

    return {
        ...newUser,
        ...(isInvite && { invitation_token, invitation_link }),
    };
};

/**
 * Update user profile / role with IDOR protection & Hierarchy Guard
 */
export const updateUserService = async (id, { name, email, phone, role }, currentUser) => {
    const targetUser = await UserModel.findById(id);
    if (!targetUser) {
        const error = new Error("Pengguna tidak ditemukan.");
        error.statusCode = 404;
        throw error;
    }

    const isSelf = String(currentUser.id) === String(id);
    const targetRole = role ? role.toUpperCase() : undefined;

    if (isSelf) {
        // Self profile update: cannot escalate own role unless Superadmin
        if (targetRole && targetRole !== targetUser.role && currentUser.role !== "SUPERADMIN") {
            const error = new Error("Akses ditolak: Hanya SUPERADMIN yang dapat mengubah peran akun.");
            error.statusCode = 403;
            throw error;
        }
    } else {
        // Modifying another user account
        if (currentUser.role === "SUPERADMIN") {
            // Superadmin has full modification privileges
        } else if (currentUser.role === "MANAGEMENT") {
            // Management cannot modify SUPERADMIN accounts
            if (targetUser.role === "SUPERADMIN") {
                const error = new Error(
                    "Akses ditolak (Hierarchy Guard): Management tidak dapat mengubah akun SUPERADMIN."
                );
                error.statusCode = 403;
                throw error;
            }
            // Management cannot elevate any account to SUPERADMIN
            if (targetRole === "SUPERADMIN") {
                const error = new Error(
                    "Akses ditolak (Hierarchy Guard): Management tidak dapat menetapkan peran SUPERADMIN."
                );
                error.statusCode = 403;
                throw error;
            }
        } else {
            const error = new Error(
                "Akses ditolak: Anda hanya memiliki izin untuk memperbarui profil Anda sendiri."
            );
            error.statusCode = 403;
            throw error;
        }
    }

    // Email uniqueness check if changed
    if (email && email.toLowerCase() !== targetUser.email.toLowerCase()) {
        const existingEmail = await UserModel.findByEmailOrUsername(email);
        if (existingEmail && String(existingEmail.id) !== String(id)) {
            const error = new Error("Email baru sudah digunakan oleh akun lain.");
            error.statusCode = 400;
            throw error;
        }
    }

    const updatedUser = await UserModel.update(id, {
        name: name ? name.trim() : targetUser.name,
        email: email ? email.toLowerCase().trim() : targetUser.email,
        phone: phone !== undefined ? phone : targetUser.phone,
        role: targetRole || targetUser.role,
    });

    return updatedUser;
};

/**
 * Toggle User Active Status with Hierarchy Guard
 */
export const setUserStatusService = async (id, isActive, currentUser) => {
    if (typeof isActive !== "boolean") {
        const error = new Error("Parameter 'is_active' bertipe boolean (true/false) diperlukan.");
        error.statusCode = 400;
        throw error;
    }

    if (String(id) === String(currentUser.id)) {
        const error = new Error("Anda tidak dapat menonaktifkan akun Anda sendiri.");
        error.statusCode = 400;
        throw error;
    }

    const targetUser = await UserModel.findById(id);
    if (!targetUser) {
        const error = new Error("Pengguna tidak ditemukan.");
        error.statusCode = 404;
        throw error;
    }

    if (currentUser.role === "SUPERADMIN") {
        // Allowed
    } else if (currentUser.role === "MANAGEMENT") {
        if (targetUser.role === "SUPERADMIN") {
            const error = new Error(
                "Akses ditolak (Hierarchy Guard): Management dilarang mengubah status akun SUPERADMIN."
            );
            error.statusCode = 403;
            throw error;
        }
    } else {
        const error = new Error("Akses ditolak: Anda tidak memiliki wewenang mengelola status pengguna.");
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
        message: `Akun pengguna berhasil ${isActive ? "diaktifkan" : "dinonaktifkan"}.`,
    };
};

/**
 * Delete User Account with Hierarchy Guard
 */
export const deleteUserService = async (id, currentUser) => {
    if (String(id) === String(currentUser.id)) {
        const error = new Error("Anda tidak dapat menghapus akun Anda sendiri.");
        error.statusCode = 400;
        throw error;
    }

    const targetUser = await UserModel.findById(id);
    if (!targetUser) {
        const error = new Error("Pengguna tidak ditemukan.");
        error.statusCode = 404;
        throw error;
    }

    if (currentUser.role === "SUPERADMIN") {
        // Allowed
    } else if (currentUser.role === "MANAGEMENT") {
        if (targetUser.role === "SUPERADMIN") {
            const error = new Error(
                "Akses ditolak (Hierarchy Guard): Management dilarang menghapus akun SUPERADMIN."
            );
            error.statusCode = 403;
            throw error;
        }
    } else {
        const error = new Error("Akses ditolak: Anda tidak memiliki wewenang menghapus akun pengguna.");
        error.statusCode = 403;
        throw error;
    }

    await RefreshTokenModel.revokeAllForUser(id);
    const deletedUser = await UserModel.delete(id);

    return { message: "Akun pengguna berhasil dihapus dari sistem.", user: deletedUser };
};

/**
 * Change user password with current password verification
 */
export const changePasswordService = async (userId, { currentPassword, newPassword }) => {
    if (!currentPassword || !newPassword) {
        const error = new Error("Kata sandi saat ini dan kata sandi baru wajib diisi.");
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
        const error = new Error("Pengguna tidak ditemukan.");
        error.statusCode = 404;
        throw error;
    }
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
        const error = new Error("Kata sandi saat ini tidak sesuai.");
        error.statusCode = 400;
        throw error;
    }
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    const updatedUser = await UserModel.updatePassword(userId, hashedPassword);
    return updatedUser;
};
