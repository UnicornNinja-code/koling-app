/*
 * authService.ts
 * Auth Service implementing business logic without Prisma in TypeScript
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

const JWT_SECRET = process.env.JWT_SECRET || "fallback_secret";
const JWT_EXPIRES = (process.env.JWT_EXPIRES || "1d") as any;
const REFRESH_TOKEN_DAYS = parseInt(process.env.REFRESH_TOKEN_DAYS || "30", 10);

const ALLOWED_PUBLIC_ROLES: UserRole[] = ["RIDER"];

/**
 * Register a new user
 */
export const registerService = async ({
  username,
  name,
  email,
  password,
}: {
  username: string;
  name: string;
  email: string;
  password?: string;
}): Promise<any> => {
  if (!username || !name || !email || !password) {
    const error: any = new Error("Please fill in all required fields");
    error.statusCode = 400;
    throw error;
  }

  const existingUser = await UserModel.findByEmail(email);
  if (existingUser) {
    const error: any = new Error("Email is already registered");
    error.statusCode = 400;
    throw error;
  }

  const hashedPassword = await hashPassword(password);

  const newUser = await UserModel.create({
    username,
    name,
    email,
    role: ALLOWED_PUBLIC_ROLES[0],
    password: hashedPassword,
  });

  return {
    id: newUser.id,
    username: newUser.username,
    name: newUser.name,
    email: newUser.email,
    role: newUser.role,
  };
};

import { CaptchaUtil, type CaptchaChallenge } from "../utils/captcha.js";
import { userRepository } from "../repositories/userRepository.js";

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
}: {
  identifier: string;
  password?: string;
  captcha_id?: string;
  captcha_answer?: string;
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
    const error: any = new Error("Username/email atau kata sandi tidak valid.");
    error.statusCode = 400;
    throw error;
  }

  if (user.is_active === false) {
    const error: any = new Error("Akun Anda sedang dinonaktifkan. Silakan hubungi Administrator.");
    error.statusCode = 403;
    throw error;
  }

  const isMatch = await verifyPassword(password, user.password || "");
  if (!isMatch) {
    const error: any = new Error("Username/email atau kata sandi tidak valid.");
    error.statusCode = 400;
    throw error;
  }

  const payload = { id: user.id, role: user.role };
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
}: {
  email: string;
  name?: string;
  google_id?: string;
  avatar_url?: string;
}): Promise<any> => {
  if (!email) {
    const error: any = new Error("Email Google tidak valid.");
    error.statusCode = 400;
    throw error;
  }

  // 1. Check if user already exists by email in corporate database
  let user = await UserModel.findByEmailOrUsername(email);

  if (!user) {
    // If corporate whitelist: reject unauthorized external emails
    const error: any = new Error(
      `Email Google [${email}] belum terdaftar dalam sistem COZIS. Silakan hubungi Management untuk aktivasi akun internal.`
    );
    error.statusCode = 403;
    throw error;
  }

  if (user.is_active === false) {
    const error: any = new Error("Akun Anda sedang dinonaktifkan. Silakan hubungi Administrator.");
    error.statusCode = 403;
    throw error;
  }

  // 2. Link Google ID & Avatar to user record
  if (google_id) {
    await userRepository.updateGoogleInfo(user.id, google_id, avatar_url);
  }

  // 3. Issue Session Tokens
  const payload = { id: user.id, role: user.role };
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
    <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 24px;">
      <h2 style="color: #1a1a2e;">🔑 Reset Password — MantaKopi DSS</h2>
      <p>Anda menerima email ini karena ada permintaan reset password untuk akun Anda.</p>
      <p>Klik tombol di bawah untuk mengatur password baru:</p>
      <a href="${resetUrl}" 
         style="display: inline-block; padding: 12px 28px; background: #6366f1; color: #fff; text-decoration: none; border-radius: 8px; font-weight: 600; margin: 16px 0;">
        Reset Password
      </a>
      <p style="color: #666; font-size: 13px;">Link ini berlaku selama <strong>1 jam</strong>. Jika Anda tidak meminta reset password, abaikan email ini.</p>
      <hr style="border: none; border-top: 1px solid #eee; margin: 24px 0;" />
      <p style="color: #999; font-size: 12px;">© 2026 MantaKopi DSS — Mobile Coffee Vendor Decision Support System</p>
    </div>
  `;

  try {
    const result = await sendMail({
      to: email,
      subject: "Reset Password — MantaKopi DSS",
      html,
      text: `Reset password Anda di: ${resetUrl} (berlaku 1 jam)`,
    });

    console.log(`[AUTH SERVICE] Email reset password terkirim ke ${email} (ID: ${result.messageId})`);
    if (result.previewUrl) {
      console.log(`[AUTH SERVICE] Preview Ethereal: ${result.previewUrl}`);
    }

    return { sent: true, messageId: result.messageId, previewUrl: result.previewUrl };
  } catch (err: any) {
    console.error(`[AUTH SERVICE] Gagal mengirim email reset ke ${email}:`, err.message);
    console.log(`[AUTH SERVICE] Fallback — Reset token untuk ${email}: ${token}`);
    return { sent: false, fallback: true };
  }
};

/**
 * Request password reset token
 */
export const forgotPasswordService = async (email: string): Promise<any> => {
  if (!email) {
    const error: any = new Error("Email is required");
    error.statusCode = 400;
    throw error;
  }

  let resetToken: string | null = null;
  const user = await UserModel.findByEmail(email);

  if (user) {
    resetToken = crypto.randomBytes(32).toString("hex");
    const resetId = crypto.randomUUID();
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

    await PasswordResetTokenModel.create({
      id: resetId,
      token: resetToken,
      userId: user.id,
      expiresAt,
    });

    await sendPasswordResetInstructionService(email, resetToken);
  }

  return {
    msg: "If the email is registered, a password reset link has been sent.",
    ...(resetToken && { resetToken }),
  };
};

/**
 * Reset password using token
 */
export const resetPasswordService = async ({
  token,
  password,
  birth_date,
}: {
  token: string;
  password?: string;
  birth_date?: string | Date;
}): Promise<any> => {
  if (!token || !password) {
    const error: any = new Error("Token dan kata sandi baru wajib diisi.");
    error.statusCode = 400;
    throw error;
  }

  const resetRecord = await PasswordResetTokenModel.findByToken(token);

  if (!resetRecord || resetRecord.used) {
    const error: any = new Error("Tautan aktivasi tidak valid atau telah digunakan.");
    error.statusCode = 400;
    throw error;
  }

  const now = new Date();
  const expiresAt = new Date(resetRecord.expires_at || resetRecord.expiresAt);
  if (expiresAt < now) {
    const error: any = new Error("Tautan aktivasi telah kedaluwarsa.");
    error.statusCode = 400;
    throw error;
  }

  const hashedPassword = await hashPassword(password);
  const userId = resetRecord.user_id || resetRecord.userId;

  await UserModel.updatePassword(userId, hashedPassword, birth_date);
  await PasswordResetTokenModel.markAsUsed(token);
  await RefreshTokenModel.revokeAllForUser(userId);

  return { msg: "Akun berhasil diaktifkan dan kata sandi telah diperbarui." };
};

/**
 * Verify if a password reset token is still valid
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
  };
};

/**
 * Refresh Access Token using Refresh Token
 */
export const refreshTokenService = async (token: string): Promise<any> => {
  if (!token) {
    const error: any = new Error("Refresh token required");
    error.statusCode = 400;
    throw error;
  }

  const stored = await RefreshTokenModel.findByToken(token);
  if (!stored || stored.revoked) {
    const error: any = new Error("Invalid refresh token");
    error.statusCode = 401;
    throw error;
  }

  const expiresAt = new Date(stored.expires_at || stored.expiresAt);
  if (expiresAt < new Date()) {
    const error: any = new Error("Refresh token expired");
    error.statusCode = 401;
    throw error;
  }

  const userId = stored.user_id || stored.userId;
  const user = await UserModel.findById(userId);

  if (!user) {
    const error: any = new Error("Invalid refresh token");
    error.statusCode = 401;
    throw error;
  }

  const newAccessToken = jwt.sign(
    { id: user.id, role: user.role },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES }
  );

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

  return { token: newAccessToken, refreshToken: newRefresh };
};

/**
 * Logout and revoke Refresh Token
 */
export const logoutService = async (token: string): Promise<any> => {
  if (!token) {
    return { msg: "Logged out" };
  }

  const stored = await RefreshTokenModel.findByToken(token);
  if (!stored) {
    return { msg: "Logged out" };
  }

  await RefreshTokenModel.revoke(token);
  return { msg: "Logged out" };
};
