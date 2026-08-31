/*
 * userService.ts
 * User Profile & RBAC Service in TypeScript
 */

import bcrypt from "bcryptjs";
import { UserModel } from "../models/userModel.js";
import { RefreshTokenModel } from "../models/refreshTokenModel.js";
import { UserRole } from "../types/user.types.js";

/**
 * Get current user profile by user ID
 */
export const getProfileService = async (userId: number | string): Promise<any> => {
  const user = await UserModel.findById(userId);
  if (!user) {
    const error: any = new Error("User not found");
    error.statusCode = 404;
    throw error;
  }
  return user;
};

/**
 * Get all users
 */
export const getAllUsersService = async (): Promise<{ users: any[]; count: number }> => {
  const users = await UserModel.findAll();
  return { users, count: users.length };
};

/**
 * Get user by ID
 */
export const getUserByIdService = async (id: number | string): Promise<any> => {
  const user = await UserModel.findById(id);
  if (!user) {
    const error: any = new Error("User not found");
    error.statusCode = 404;
    throw error;
  }
  return user;
};

/**
 * Create a new user account with RBAC Hierarchy check
 */
export const createUserService = async (
  { username, name, email, password, role }: { username: string; name: string; email: string; password?: string; role: string },
  currentUser: any
): Promise<any> => {
  if (!username || !name || !email || !password || !role) {
    const error: any = new Error("Please provide all required fields: username, name, email, password, and role");
    error.statusCode = 400;
    throw error;
  }

  const validRoles = ["SUPERADMIN", "MANAGEMENT", "SUPERVISOR", "RIDER"];
  if (!validRoles.includes(role)) {
    const error: any = new Error("Invalid role specified");
    error.statusCode = 400;
    throw error;
  }

  if (currentUser.role === "SUPERADMIN") {
    // Superadmin can create any role
  } else if (currentUser.role === "MANAGEMENT") {
    if (role === "SUPERADMIN") {
      const error: any = new Error("Access forbidden: MANAGEMENT cannot create SUPERADMIN accounts");
      error.statusCode = 403;
      throw error;
    }
  } else {
    const error: any = new Error("Access forbidden: insufficient permissions to create user accounts");
    error.statusCode = 403;
    throw error;
  }

  const existingUser = await UserModel.findByEmailOrUsername(email);
  if (existingUser) {
    const error: any = new Error("Email is already registered");
    error.statusCode = 400;
    throw error;
  }

  const existingUsername = await UserModel.findByEmailOrUsername(username);
  if (existingUsername) {
    const error: any = new Error("Username is already taken");
    error.statusCode = 400;
    throw error;
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const newUser = await UserModel.create({
    username,
    name,
    email,
    role: role as UserRole,
    password: hashedPassword,
  });

  return newUser;
};

/**
 * Update user profile / role with IDOR protection & RBAC checks
 */
export const updateUserService = async (
  id: number | string,
  { name, email, role }: { name?: string; email?: string; role?: string },
  currentUser: any
): Promise<any> => {
  const targetUser = await UserModel.findById(id);
  if (!targetUser) {
    const error: any = new Error("User not found");
    error.statusCode = 404;
    throw error;
  }

  const isSelf = String(currentUser.id) === String(id);

  if (isSelf) {
    if (role && role !== targetUser.role && currentUser.role !== "SUPERADMIN") {
      const error: any = new Error("Only SUPERADMIN can change user role");
      error.statusCode = 403;
      throw error;
    }
  } else {
    if (currentUser.role === "SUPERADMIN") {
      // Allowed
    } else if (currentUser.role === "MANAGEMENT") {
      if (targetUser.role === "SUPERADMIN") {
        const error: any = new Error("Access forbidden: cannot modify SUPERADMIN accounts");
        error.statusCode = 403;
        throw error;
      }
      if (role === "SUPERADMIN") {
        const error: any = new Error("Access forbidden: cannot assign SUPERADMIN role");
        error.statusCode = 403;
        throw error;
      }
    } else {
      const error: any = new Error("Access forbidden: you can only update your own profile");
      error.statusCode = 403;
      throw error;
    }
  }

  if (email && email.toLowerCase() !== targetUser.email.toLowerCase()) {
    const existingEmail = await UserModel.findByEmailOrUsername(email);
    if (existingEmail && String(existingEmail.id) !== String(id)) {
      const error: any = new Error("Email is already registered");
      error.statusCode = 400;
      throw error;
    }
  }

  const updatedUser = await UserModel.update(id, { name, email, role: (role as UserRole) || undefined });
  return updatedUser;
};

/**
 * Activate or Deactivate user account with RBAC Hierarchy check
 */
export const setUserStatusService = async (id: number | string, isActive: boolean, currentUser: any): Promise<any> => {
  if (typeof isActive !== "boolean") {
    const error: any = new Error("Parameter 'is_active' boolean value is required");
    error.statusCode = 400;
    throw error;
  }

  if (String(id) === String(currentUser.id)) {
    const error: any = new Error("Cannot activate or deactivate your own account");
    error.statusCode = 400;
    throw error;
  }

  const targetUser = await UserModel.findById(id);
  if (!targetUser) {
    const error: any = new Error("User not found");
    error.statusCode = 404;
    throw error;
  }

  if (currentUser.role === "SUPERADMIN") {
    // Allowed
  } else if (currentUser.role === "MANAGEMENT") {
    if (targetUser.role === "SUPERADMIN") {
      const error: any = new Error("Access forbidden: cannot modify SUPERADMIN accounts");
      error.statusCode = 403;
      throw error;
    }
  } else {
    const error: any = new Error("Access forbidden: insufficient permissions to manage user status");
    error.statusCode = 403;
    throw error;
  }

  const updatedUser = await UserModel.updateStatus(id, isActive);

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
export const deleteUserService = async (id: number | string, currentUser: any): Promise<any> => {
  if (String(id) === String(currentUser.id)) {
    const error: any = new Error("Cannot delete your own account");
    error.statusCode = 400;
    throw error;
  }

  const targetUser = await UserModel.findById(id);
  if (!targetUser) {
    const error: any = new Error("User not found");
    error.statusCode = 404;
    throw error;
  }

  if (currentUser.role === "SUPERADMIN") {
    // Allowed
  } else if (currentUser.role === "MANAGEMENT") {
    if (targetUser.role === "SUPERADMIN") {
      const error: any = new Error("Access forbidden: cannot delete SUPERADMIN accounts");
      error.statusCode = 403;
      throw error;
    }
  } else {
    const error: any = new Error("Access forbidden: insufficient permissions to delete user accounts");
    error.statusCode = 403;
    throw error;
  }

  await RefreshTokenModel.revokeAllForUser(id);

  const deletedUser = await UserModel.delete(id);
  return { message: "User deleted successfully", user: deletedUser };
};

/**
 * Change user password with current password validation
 */
export const changePasswordService = async (
  userId: number | string,
  { currentPassword, newPassword }: { currentPassword?: string; newPassword?: string }
): Promise<any> => {
  if (!currentPassword || !newPassword) {
    const error: any = new Error("Kata sandi lama dan kata sandi baru wajib diisi.");
    error.statusCode = 400;
    throw error;
  }
  if (newPassword.length < 6) {
    const error: any = new Error("Kata sandi baru minimal 6 karakter.");
    error.statusCode = 400;
    throw error;
  }
  const user = await UserModel.findByIdWithPassword(userId);
  if (!user) {
    const error: any = new Error("User tidak ditemukan");
    error.statusCode = 404;
    throw error;
  }
  const isMatch = await bcrypt.compare(currentPassword, user.password || "");
  if (!isMatch) {
    const error: any = new Error("Kata sandi saat ini (lama) tidak sesuai.");
    error.statusCode = 400;
    throw error;
  }
  const hashedPassword = await bcrypt.hash(newPassword, 10);
  const updatedUser = await UserModel.updatePassword(userId, hashedPassword);
  return updatedUser;
};
