/*
 * authService.ts
 * Auth Service implementing enterprise security & RBAC in TypeScript
 */

import jwt from "jsonwebtoken";
import crypto from "crypto";
import { hashPassword, verifyPassword } from "../utils/crypto.js";
import { UserModel } from "../models/userModel.js";
import { RefreshTokenModel } from "../models/refreshTokenModel.js";
import { PasswordResetTokenModel } from "../models/passwordResetTokenModel.js";
import { sendMail } from "../config/mailer.js";
import { env } from "../config/env.js";
import { UserRole } from "../types/user.types.js";
import { CaptchaUtil, type CaptchaChallenge } from "../utils/captcha.js";
import { userRepository } from "../repositories/userRepository.js";
import { auditService } from "./auditService.js";

const JWT_SECRET = process.env.JWT_SECRET || "fallback_secret";
// Access token is short-lived (15 minutes) for high security
const JWT_EXPIRES = (process.env.JWT_EXPIRES || "15m") as any;
const REFRESH_TOKEN_DAYS = parseInt(process.env.REFRESH_TOKEN_DAYS || "30", 10);

/**
 * Account Registration / Activation via Invitation Token
 * Public self-registration without token is disabled for COZIS enterprise system.
 */
export const registerService = async ({
  token,
  username,
  name,
  email,
  password,
  birth_date,
}: {
  token?: string;
  username?: string;
  name?: string;
  email?: string;
  password?: string;
  birth_date?: string | Date;
}): Promise<any> => {
  // If no invitation token is provided, reject public self-registration
  if (!token) {
    const error: any = new Error(
      "Pendaftaran mandiri publik dinonaktifkan. Akun COZIS harus didaftarkan oleh Administrator atau Manajemen melalui sistem undangan."
    );
    error.statusCode = 403;
    throw error;
  }

  if (!password || password.length < 6) {
    const error: any = new Error("Kata sandi baru minimal 6 karakter.");
    error.statusCode = 400;
    throw error;
  }

  // Verify invitation token
  const resetRecord = await PasswordResetTokenModel.findByToken(token);
  if (!resetRecord || resetRecord.used) {
    const error: any = new Error("Tautan aktivasi tidak valid atau telah digunakan. Silakan hubungi Manajemen untuk meminta tautan baru.");
    error.statusCode = 400;
    throw error;
  }

  const now = new Date();
  const expiresAt = new Date(resetRecord.expires_at || resetRecord.expiresAt);
  if (expiresAt < now) {
    const error: any = new Error("Tautan aktivasi telah kedaluwarsa (berlaku 48 jam). Silakan hubungi Manajemen untuk meminta tautan baru.");
    error.statusCode = 400;
    throw error;
  }

  const userId = resetRecord.user_id || resetRecord.userId;
  const user = await UserModel.findById(userId);
  if (!user) {
    const error: any = new Error("Data pengguna tidak ditemukan.");
    error.statusCode = 404;
    throw error;
  }

  const hashedPassword = await hashPassword(password);

  // Activate account, update password & optional birth_date
  await UserModel.updatePassword(userId, hashedPassword, birth_date);
  await PasswordResetTokenModel.markAsUsed(token);
  await RefreshTokenModel.revokeAllForUser(userId);

  // Record audit trail
  await auditService.logAction({
    userId: user.id,
    userRole: user.role,
    action: "AUTH_ACCOUNT_ACTIVATED",
    entityType: "USER",
    entityId: String(user.id),
    details: { username: user.username, email: user.email, activated_via: "INVITATION_TOKEN" },
  });

  return {
    id: user.id,
    username: user.username,
    name: user.name,
    email: user.email,
    role: user.role,
    is_active: true,
    message: "Akun Anda berhasil diaktivasi. Silakan login untuk memulai.",
  };
};

/**
 * Generate a fresh SVG Captcha challenge
 */
export const generateCaptchaService = (): CaptchaChallenge => {
  return CaptchaUtil.generate();
};

/**
 * Login user and issue Access Token + Refresh Token (with CAPTCHA verification)
 */
export const loginService = async ({
  identifier,
  password,
  captcha_id,
  captcha_answer,
  ip_address,
  user_agent,
}: {
  identifier: string;
  password?: string;
  captcha_id?: string;
  captcha_answer?: string;
  ip_address?: string;
  user_agent?: string;
}): Promise<any> => {
  if (!identifier || !password) {
    const error: any = new Error("Harap isi username/email dan kata sandi.");
    error.statusCode = 400;
    throw error;
  }

  // Verify CAPTCHA if provided
  if (captcha_id && captcha_answer) {
    const isValid = CaptchaUtil.verify(captcha_id, captcha_answer);
    if (!isValid) {
      const error: any = new Error("Kode CAPTCHA salah atau telah kadaluarsa. Silakan refresh CAPTCHA.");
      error.statusCode = 400;
      throw error;
    }
  }

  const user = await UserModel.findByEmailOrUsername(identifier);
  if (!user) {
    await auditService.logAction({
      action: "AUTH_LOGIN_FAILED",
      details: { identifier, reason: "USER_NOT_FOUND" },
      ipAddress: ip_address,
      userAgent: user_agent,
      status: "FAILED",
    });
    const error: any = new Error("Username/email atau kata sandi tidak valid.");
    error.statusCode = 400;
    throw error;
  }

  if (user.is_active === false) {
    await auditService.logAction({
      userId: user.id,
      userRole: user.role,
      action: "AUTH_LOGIN_FAILED",
      entityType: "USER",
      entityId: String(user.id),
      details: { identifier, reason: "ACCOUNT_INACTIVE_OR_PENDING_ACTIVATION" },
      ipAddress: ip_address,
      userAgent: user_agent,
      status: "FAILED",
    });
    const error: any = new Error("Akun Anda belum diaktivasi atau dinonaktifkan. Silakan periksa email aktivasi atau hubungi Manajemen.");
    error.statusCode = 403;
    throw error;
  }

  const isMatch = await verifyPassword(password, user.password || "");
  if (!isMatch) {
    await auditService.logAction({
      userId: user.id,
      userRole: user.role,
      action: "AUTH_LOGIN_FAILED",
      entityType: "USER",
      entityId: String(user.id),
      details: { identifier, reason: "INVALID_PASSWORD" },
      ipAddress: ip_address,
      userAgent: user_agent,
      status: "FAILED",
    });
    const error: any = new Error("Username/email atau kata sandi tidak valid.");
    error.statusCode = 400;
    throw error;
  }

  const payload = { id: user.id, role: user.role, name: user.name, email: user.email };
  const token = jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES });

  const refreshTokenString = crypto.randomBytes(64).toString("hex");
  const refreshId = crypto.randomUUID();
  const expiresAt = new Date(Date.now() + REFRESH_TOKEN_DAYS * 24 * 60 * 60 * 1000);

  await RefreshTokenModel.create({
    id: refreshId,
    token: refreshTokenString,
    userId: user.id,
    expiresAt,
  });

  await auditService.logAction({
    userId: user.id,
    userRole: user.role,
    action: "AUTH_LOGIN_SUCCESS",
    entityType: "USER",
    entityId: String(user.id),
    ipAddress: ip_address,
    userAgent: user_agent,
  });

  return {
    token,
    refreshToken: refreshTokenString,
    user: {
      id: user.id,
      username: user.username,
      email: user.email,
      name: user.name,
      role: user.role,
    },
  };
};

/**
 * Google OAuth 2.0 Sign-In Service (Corporate Pre-Provisioned Whitelist Match)
 */
export const googleLoginService = async ({
  email,
  name,
  google_id,
  avatar_url,
  ip_address,
  user_agent,
}: {
  email: string;
  name?: string;
  google_id?: string;
  avatar_url?: string;
  ip_address?: string;
  user_agent?: string;
}): Promise<any> => {
  if (!email) {
    const error: any = new Error("Email Google tidak valid.");
    error.statusCode = 400;
    throw error;
  }

  let user = await UserModel.findByEmailOrUsername(email);

  if (!user) {
    await auditService.logAction({
      action: "AUTH_LOGIN_FAILED",
      details: { email, provider: "GOOGLE", reason: "EMAIL_NOT_PRE_PROVISIONED" },
      ipAddress: ip_address,
      userAgent: user_agent,
      status: "FAILED",
    });
    const error: any = new Error(
      `Email Google [${email}] belum terdaftar dalam sistem COZIS. Silakan hubungi Manajemen untuk aktivasi akun internal.`
    );
    error.statusCode = 403;
    throw error;
  }

  if (user.is_active === false) {
    const error: any = new Error("Akun Anda belum diaktivasi atau sedang dinonaktifkan. Silakan hubungi Administrator.");
    error.statusCode = 403;
    throw error;
  }

  if (google_id) {
    await userRepository.updateGoogleInfo(user.id, google_id, avatar_url);
  }

  const payload = { id: user.id, role: user.role, name: user.name, email: user.email };
  const token = jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES });

  const refreshTokenString = crypto.randomBytes(64).toString("hex");
  const refreshId = crypto.randomUUID();
  const expiresAt = new Date(Date.now() + REFRESH_TOKEN_DAYS * 24 * 60 * 60 * 1000);

  await RefreshTokenModel.create({
    id: refreshId,
    token: refreshTokenString,
    userId: user.id,
    expiresAt,
  });

  await auditService.logAction({
    userId: user.id,
    userRole: user.role,
    action: "AUTH_LOGIN_SUCCESS",
    entityType: "USER",
    entityId: String(user.id),
    details: { provider: "GOOGLE" },
    ipAddress: ip_address,
    userAgent: user_agent,
  });

  return {
    token,
    refreshToken: refreshTokenString,
    user: {
      id: user.id,
      username: user.username,
      email: user.email,
      name: user.name,
      role: user.role,
      avatar_url: avatar_url || (user as any).avatar_url,
    },
  };
};

/**
 * Send password reset email via Nodemailer
 */
export const sendPasswordResetInstructionService = async (email: string, token: string): Promise<any> => {
  const resetUrl = `${env.FRONTEND_URL}/reset-password?token=${token}`;

  const html = `
    <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 24px; background: #131316; color: #f4f4f5; border-radius: 16px; border: 1px solid #272730;">
      <div style="text-align: center; margin-bottom: 20px;">
        <h1 style="color: #FF634A; margin: 0; font-size: 24px;">🔑 Pemulihan Kata Sandi</h1>
        <p style="color: #a1a1aa; font-size: 13px; margin-top: 4px;">MantaKopi COZIS Internal System</p>
      </div>
      <div style="background: #18181D; padding: 20px; border-radius: 12px; border: 1px solid #272730;">
        <p style="color: #d4d4d8; font-size: 14px; line-height: 1.6;">
          Anda menerima email ini karena adanya permintaan pemulihan kata sandi akun COZIS Anda.
        </p>
        <p style="color: #d4d4d8; font-size: 14px; line-height: 1.6;">
          Klik tombol di bawah untuk menetapkan kata sandi baru:
        </p>
        <div style="text-align: center; margin: 24px 0;">
          <a href="${resetUrl}" 
             style="display: inline-block; padding: 12px 32px; background: #FF634A; color: #09090B; text-decoration: none; border-radius: 12px; font-weight: bold; font-size: 14px; box-shadow: 0 4px 14px rgba(255, 99, 74, 0.4);">
            Atur Ulang Kata Sandi
          </a>
        </div>
        <p style="color: #a1a1aa; font-size: 12px; line-height: 1.5; border-top: 1px solid #272730; padding-top: 12px;">
          💡 Tautan berlaku selama <strong>1 jam</strong>. Jika Anda tidak meminta pemulihan ini, abaikan email ini secara aman.
        </p>
      </div>
    </div>
  `;

  try {
    const result = await sendMail({
      to: email,
      subject: "🔑 Pemulihan Kata Sandi — MantaKopi COZIS",
      html,
      text: `Reset kata sandi Anda di: ${resetUrl} (berlaku 1 jam)`,
    });

    console.log(`[AUTH SERVICE] Email reset password terkirim ke ${email} (ID: ${result.messageId})`);
    if (result.previewUrl) {
      console.log(`[AUTH SERVICE] Preview Ethereal: ${result.previewUrl}`);
    }

    return { sent: true, messageId: result.messageId, previewUrl: result.previewUrl };
  } catch (err: any) {
    console.error(`[AUTH SERVICE] Gagal mengirim email reset ke ${email}:`, err.message);
    return { sent: false, fallback: true };
  }
};

/**
 * Request password reset token with anti-account enumeration protection
 */
export const forgotPasswordService = async (email: string, ip_address?: string, user_agent?: string): Promise<any> => {
  if (!email) {
    const error: any = new Error("Alamat email wajib diisi.");
    error.statusCode = 400;
    throw error;
  }

  const cleanEmail = email.trim().toLowerCase();
  const user = await UserModel.findByEmail(cleanEmail);

  if (user) {
    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetId = crypto.randomUUID();
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 jam

    await PasswordResetTokenModel.create({
      id: resetId,
      token: resetToken,
      userId: user.id,
      expiresAt,
    });

    await sendPasswordResetInstructionService(cleanEmail, resetToken);

    await auditService.logAction({
      userId: user.id,
      userRole: user.role,
      action: "AUTH_PASSWORD_RESET_REQUEST",
      entityType: "USER",
      entityId: String(user.id),
      ipAddress: ip_address,
      userAgent: user_agent,
    });
  } else {
    // Log attempt on unknown email without exposing to user
    await auditService.logAction({
      action: "AUTH_PASSWORD_RESET_REQUEST_UNKNOWN",
      details: { requested_email: cleanEmail },
      ipAddress: ip_address,
      userAgent: user_agent,
    });
  }

  // Consistent response to prevent account enumeration
  return {
    msg: "Jika alamat email tersebut terdaftar dalam sistem, tautan instruksi pemulihan kata sandi telah dikirimkan.",
  };
};

/**
 * Reset password using token & invalidate all active sessions
 */
export const resetPasswordService = async ({
  token,
  password,
  birth_date,
  ip_address,
  user_agent,
}: {
  token: string;
  password?: string;
  birth_date?: string | Date;
  ip_address?: string;
  user_agent?: string;
}): Promise<any> => {
  if (!token || !password) {
    const error: any = new Error("Token dan kata sandi baru wajib diisi.");
    error.statusCode = 400;
    throw error;
  }

  if (password.length < 6) {
    const error: any = new Error("Kata sandi baru minimal 6 karakter.");
    error.statusCode = 400;
    throw error;
  }

  const resetRecord = await PasswordResetTokenModel.findByToken(token);

  if (!resetRecord || resetRecord.used) {
    const error: any = new Error("Tautan pemulihan tidak valid atau telah digunakan.");
    error.statusCode = 400;
    throw error;
  }

  const now = new Date();
  const expiresAt = new Date(resetRecord.expires_at || resetRecord.expiresAt);
  if (expiresAt < now) {
    const error: any = new Error("Tautan pemulihan telah kedaluwarsa.");
    error.statusCode = 400;
    throw error;
  }

  const hashedPassword = await hashPassword(password);
  const userId = resetRecord.user_id || resetRecord.userId;
  const user = await UserModel.findById(userId);

  await UserModel.updatePassword(userId, hashedPassword, birth_date);
  await PasswordResetTokenModel.markAsUsed(token);

  // Security Invariant: Revoke all active sessions on password change
  await RefreshTokenModel.revokeAllForUser(userId);

  await auditService.logAction({
    userId,
    userRole: user?.role,
    action: "AUTH_PASSWORD_RESET_SUCCESS",
    entityType: "USER",
    entityId: String(userId),
    ipAddress: ip_address,
    userAgent: user_agent,
  });

  return { msg: "Kata sandi Anda berhasil diperbarui. Silakan login kembali dengan kata sandi baru." };
};

/**
 * Verify if a password reset / activation token is still valid
 */
export const verifyResetTokenService = async (token: string): Promise<any> => {
  if (!token) {
    return { valid: false, reason: "Token is required" };
  }

  const resetRecord = await PasswordResetTokenModel.findByToken(token);

  if (!resetRecord) {
    return { valid: false, reason: "Token not found" };
  }

  if (resetRecord.used) {
    return { valid: false, reason: "Token has already been used" };
  }

  const expiresAt = new Date(resetRecord.expires_at || resetRecord.expiresAt);
  if (expiresAt < new Date()) {
    return { valid: false, reason: "Token has expired" };
  }

  const user = await UserModel.findById(resetRecord.user_id || resetRecord.userId);

  return {
    valid: true,
    email: user?.email,
    name: user?.name,
    username: user?.username,
    role: user?.role,
    birth_date: user?.birth_date,
    is_active: user?.is_active,
  };
};

/**
 * Refresh Access Token using Refresh Token with token rotation
 */
export const refreshTokenService = async (token: string, ip_address?: string, user_agent?: string): Promise<any> => {
  if (!token) {
    const error: any = new Error("Sesi refresh token tidak ditemukan.");
    error.statusCode = 400;
    throw error;
  }

  const stored = await RefreshTokenModel.findByToken(token);
  if (!stored || stored.revoked) {
    const error: any = new Error("Sesi tidak valid atau telah dicabut.");
    error.statusCode = 401;
    throw error;
  }

  const expiresAt = new Date(stored.expires_at || stored.expiresAt);
  if (expiresAt < new Date()) {
    const error: any = new Error("Sesi telah kedaluwarsa.");
    error.statusCode = 401;
    throw error;
  }

  const userId = stored.user_id || stored.userId;
  const user = await UserModel.findById(userId);

  if (!user || user.is_active === false) {
    const error: any = new Error("Pengguna tidak aktif atau tidak ditemukan.");
    error.statusCode = 401;
    throw error;
  }

  const newAccessToken = jwt.sign(
    { id: user.id, role: user.role, name: user.name, email: user.email },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES }
  );

  // Refresh Token Rotation
  await RefreshTokenModel.revoke(token);

  const newRefresh = crypto.randomBytes(64).toString("hex");
  const newRefreshId = crypto.randomUUID();
  const newExpiresAt = new Date(Date.now() + REFRESH_TOKEN_DAYS * 24 * 60 * 60 * 1000);

  await RefreshTokenModel.create({
    id: newRefreshId,
    token: newRefresh,
    userId: user.id,
    expiresAt: newExpiresAt,
  });

  await auditService.logAction({
    userId: user.id,
    userRole: user.role,
    action: "AUTH_REFRESH",
    entityType: "USER",
    entityId: String(user.id),
    ipAddress: ip_address,
    userAgent: user_agent,
  });

  return { token: newAccessToken, refreshToken: newRefresh };
};

/**
 * Logout and revoke Refresh Token
 */
export const logoutService = async (token: string, userId?: string | number, userRole?: string): Promise<any> => {
  if (token) {
    await RefreshTokenModel.revoke(token);
  }

  if (userId) {
    await auditService.logAction({
      userId,
      userRole,
      action: "AUTH_LOGOUT",
      entityType: "USER",
      entityId: String(userId),
    });
  }

  return { msg: "Berhasil keluar dari sesi." };
};
