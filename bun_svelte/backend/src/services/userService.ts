/*
 * userService.ts
 * User Profile & RBAC Service in TypeScript
 */

import { hashPassword, verifyPassword } from "../utils/crypto.js";
import { UserModel } from "../models/userModel.js";
import { RefreshTokenModel } from "../models/refreshTokenModel.js";
import { PasswordResetTokenModel } from "../models/passwordResetTokenModel.js";
import { sendMail } from "../config/mailer.js";
import { env } from "../config/env.js";
import crypto from "crypto";
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
 * Create a new user account with RBAC Hierarchy check and send email invitation
 */
export const createUserService = async (
  { username, name, email, password, role }: { username?: string; name: string; email: string; password?: string; role: string },
  currentUser: any
): Promise<any> => {
  if (!name || !email || !role) {
    const error: any = new Error("Harap lengkapi field wajib: Nama Lengkap, Alamat Email, dan Peran Akun.");
    error.statusCode = 400;
    throw error;
  }

  const validRoles = ["SUPERADMIN", "MANAGEMENT", "SUPERVISOR", "RIDER"];
  if (!validRoles.includes(role)) {
    const error: any = new Error("Peran pengguna tidak valid.");
    error.statusCode = 400;
    throw error;
  }

  if (currentUser.role === "SUPERADMIN") {
    // Superadmin can create any role
  } else if (currentUser.role === "MANAGEMENT") {
    if (role === "SUPERADMIN") {
      const error: any = new Error("Akses Ditolak: Manajemen tidak memiliki hak membuat akun Super Admin.");
      error.statusCode = 403;
      throw error;
    }
  } else {
    const error: any = new Error("Akses Ditolak: Anda tidak memiliki otoritas membuat akun pengguna.");
    error.statusCode = 403;
    throw error;
  }

  const existingUser = await UserModel.findByEmailOrUsername(email);
  if (existingUser) {
    const error: any = new Error(`Email [${email}] sudah terdaftar dalam sistem.`);
    error.statusCode = 400;
    throw error;
  }

  let finalUsername = username?.trim() || email.split("@")[0].toLowerCase().replace(/[^a-z0-9_]/g, "_");
  const existingUsername = await UserModel.findByEmailOrUsername(finalUsername);
  if (existingUsername) {
    finalUsername = `${finalUsername}_${Math.floor(100 + Math.random() * 900)}`;
  }

  const initialPassword = password || crypto.randomBytes(8).toString("hex") + "A1!";
  const hashedPassword = await hashPassword(initialPassword);

  const newUser = await UserModel.create({
    username: finalUsername,
    name: name.trim(),
    email: email.trim().toLowerCase(),
    role: role as UserRole,
    password: hashedPassword,
  });

  // 1. Generate secure 48-hour invitation token
  const invitationToken = crypto.randomBytes(32).toString("hex");
  const resetId = crypto.randomUUID();
  const expiresAt = new Date(Date.now() + 48 * 60 * 60 * 1000); // 48 jam

  await PasswordResetTokenModel.create({
    id: resetId,
    token: invitationToken,
    userId: newUser.id,
    expiresAt,
  });

  const activationUrl = `${env.FRONTEND_URL}/register?token=${invitationToken}&email=${encodeURIComponent(email)}`;

  // 2. Send Invitation Email via Nodemailer
  const roleLabel = role === "RIDER" ? "Rider Armada Kopi Keliling" : role === "SUPERVISOR" ? "Supervisor Operasional" : role;
  const html = `
    <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 520px; margin: 0 auto; padding: 24px; background: #131316; color: #f4f4f5; border-radius: 16px; border: 1px solid #272730;">
      <div style="text-align: center; margin-bottom: 20px;">
        <h1 style="color: #FF634A; margin: 0; font-size: 24px;">☕ MantaKopi COZIS</h1>
        <p style="color: #a1a1aa; font-size: 13px; margin-top: 4px;">Coffee Zone Intelligence & Spatial Decision Support System</p>
      </div>
      <div style="background: #18181D; padding: 20px; border-radius: 12px; border: 1px solid #272730;">
        <h2 style="color: #fff; font-size: 18px; margin-top: 0;">Halo, ${name}! 👋</h2>
        <p style="color: #d4d4d8; font-size: 14px; line-height: 1.6;">
          Akun Anda telah didaftarkan oleh Manajemen sebagai <strong>${roleLabel}</strong>.
        </p>
        <p style="color: #d4d4d8; font-size: 14px; line-height: 1.6;">
          Silakan lakukan verifikasi email dan aktivasi akun Anda untuk mulai bertugas:
        </p>
        <div style="text-align: center; margin: 24px 0;">
          <a href="${activationUrl}" 
             style="display: inline-block; padding: 12px 32px; background: #FF634A; color: #09090B; text-decoration: none; border-radius: 12px; font-weight: bold; font-size: 14px; box-shadow: 0 4px 14px rgba(255, 99, 74, 0.4);">
            Aktivasi Akun Sekarang
          </a>
        </div>
        <p style="color: #a1a1aa; font-size: 12px; line-height: 1.5; border-top: 1px solid #272730; padding-top: 12px;">
          💡 <strong>Petunjuk Aktivasi:</strong> Klik tombol di atas untuk memverifikasi tanggal lahir dan membuat kata sandi baru akun Anda.
        </p>
      </div>
      <p style="color: #71717a; font-size: 11px; text-align: center; margin-top: 20px;">
        © 2026 MantaKopi COZIS. Tautan berlaku selama 48 jam.
      </p>
    </div>
  `;

  let mailResult: any = { sent: false };
  try {
    mailResult = await sendMail({
      to: email,
      subject: `🚀 Undangan Bergabung & Aktivasi Akun ${roleLabel} — MantaKopi COZIS`,
      html,
      text: `Halo ${name}, Anda diundang bergabung sebagai ${roleLabel}. Buka link berikut untuk aktivasi akun: ${activationUrl}`,
    });
    console.log(`📧 Undangan email terkirim ke ${email} (ID: ${mailResult.messageId})`);
    if (mailResult?.previewUrl) {
      console.log(`🔗 Buka & Baca Email di Ethereal: ${mailResult.previewUrl}`);
    }
  } catch (err: any) {
    console.warn(`⚠️ Gagal mengirim email ke ${email}:`, err.message);
  }

  return {
    ...newUser,
    invitation_token: invitationToken,
    invitation_link: activationUrl,
    email_preview_url: mailResult?.previewUrl || null,
  };
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
  const isMatch = await verifyPassword(currentPassword, user.password || "");
  if (!isMatch) {
    const error: any = new Error("Kata sandi saat ini (lama) tidak sesuai.");
    error.statusCode = 400;
    throw error;
  }
  const hashedPassword = await hashPassword(newPassword);
  const updatedUser = await UserModel.updatePassword(userId, hashedPassword);
  return updatedUser;
};

/**
 * Admin reset user password with RBAC check
 */
export const adminResetPasswordService = async (
  targetUserId: number | string,
  newPassword: string,
  currentUser: any
): Promise<any> => {
  if (!newPassword || newPassword.length < 6) {
    const error: any = new Error("Password baru minimal 6 karakter");
    error.statusCode = 400;
    throw error;
  }

  const targetUser = await UserModel.findById(targetUserId);
  if (!targetUser) {
    const error: any = new Error("User tidak ditemukan");
    error.statusCode = 404;
    throw error;
  }

  if (currentUser.role === "SUPERADMIN") {
    // Allowed
  } else if (currentUser.role === "MANAGEMENT") {
    if (targetUser.role === "SUPERADMIN") {
      const error: any = new Error("Access forbidden: MANAGEMENT cannot reset SUPERADMIN password");
      error.statusCode = 403;
      throw error;
    }
  } else {
    const error: any = new Error("Access forbidden: insufficient permissions to reset user password");
    error.statusCode = 403;
    throw error;
  }

  const hashedPassword = await hashPassword(newPassword);
  await UserModel.updatePassword(targetUserId, hashedPassword);
  await RefreshTokenModel.revokeAllForUser(targetUserId);

  return { message: `Password akun ${targetUser.username} berhasil direset.` };
};

