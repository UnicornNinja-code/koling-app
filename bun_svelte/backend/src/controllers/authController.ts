/*
 * authController.ts
 * Authentication HTTP Controller in TypeScript
 */

import type { Request, Response } from "express";
import {
  registerService,
  loginService,
  forgotPasswordService,
  resetPasswordService,
  verifyResetTokenService,
  refreshTokenService,
  logoutService,
  generateCaptchaService,
  googleLoginService,
} from "../services/authService.js";

const REFRESH_TOKEN_COOKIE_NAME = "refreshToken";
const REFRESH_TOKEN_DAYS = parseInt(process.env.REFRESH_TOKEN_DAYS || "30", 10);

const getRefreshCookieOptions = (): any => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "strict" as const,
  maxAge: REFRESH_TOKEN_DAYS * 24 * 60 * 60 * 1000,
  path: "/api/auth",
});

export const getCaptcha = async (_req: Request, res: Response): Promise<any> => {
  try {
    const challenge = generateCaptchaService();
    return res.status(200).json(challenge);
  } catch (error: any) {
    console.error("💥 Error in getCaptcha:", error);
    return res.status(500).json({ msg: "Gagal membuat CAPTCHA.", error: error.message });
  }
};

export const register = async (req: Request, res: Response): Promise<any> => {
  try {
    const { token, username, name, email, password, birth_date } = req.body;
    const result = await registerService({ token, username, name, email, password, birth_date });
    return res.status(200).json(result);
  } catch (error: any) {
    if (error.code === "23505") {
      return res.status(400).json({ msg: "Email atau username sudah terdaftar." });
    }
    const statusCode = error.statusCode || 500;
    return res.status(statusCode).json({ msg: error.message || "Gagal memproses pendaftaran/aktivasi." });
  }
};

export const login = async (req: Request, res: Response): Promise<any> => {
  try {
    const identifier = req.body.identifier || req.body.username || req.body.email;
    const password = req.body.password;
    const captcha_id = req.body.captcha_id;
    const captcha_answer = req.body.captcha_answer;
    const ip_address = (req.headers["x-forwarded-for"] as string) || req.socket.remoteAddress || "";
    const user_agent = req.headers["user-agent"] || "";

    const result = await loginService({
      identifier,
      password,
      captcha_id,
      captcha_answer,
      ip_address,
      user_agent,
    });

    res.cookie(REFRESH_TOKEN_COOKIE_NAME, result.refreshToken, getRefreshCookieOptions());

    return res.status(200).json({
      msg: "Login successful",
      token: result.token,
      user: result.user,
    });
  } catch (error: any) {
    const statusCode = error.statusCode || 500;
    return res.status(statusCode).json({ msg: error.message || "Gagal melakukan login." });
  }
};

export const googleLogin = async (req: Request, res: Response): Promise<any> => {
  try {
    const { email, name, google_id, avatar_url } = req.body;
    const ip_address = (req.headers["x-forwarded-for"] as string) || req.socket.remoteAddress || "";
    const user_agent = req.headers["user-agent"] || "";

    const result = await googleLoginService({
      email,
      name,
      google_id,
      avatar_url,
      ip_address,
      user_agent,
    });

    res.cookie(REFRESH_TOKEN_COOKIE_NAME, result.refreshToken, getRefreshCookieOptions());

    return res.status(200).json({
      msg: "Google Login successful",
      token: result.token,
      user: result.user,
    });
  } catch (error: any) {
    const statusCode = error.statusCode || 500;
    return res.status(statusCode).json({ msg: error.message || "Gagal melakukan login via Google." });
  }
};

export const forgotPassword = async (req: Request, res: Response): Promise<any> => {
  try {
    const { email } = req.body;
    const ip_address = (req.headers["x-forwarded-for"] as string) || req.socket.remoteAddress || "";
    const user_agent = req.headers["user-agent"] || "";

    const result = await forgotPasswordService(email, ip_address, user_agent);
    return res.status(200).json(result);
  } catch (error: any) {
    const statusCode = error.statusCode || 500;
    return res.status(statusCode).json({ msg: error.message || "Gagal memproses pemulihan kata sandi." });
  }
};

export const resetPassword = async (req: Request, res: Response): Promise<any> => {
  try {
    const { token, password, birth_date } = req.body;
    const ip_address = (req.headers["x-forwarded-for"] as string) || req.socket.remoteAddress || "";
    const user_agent = req.headers["user-agent"] || "";

    const result = await resetPasswordService({ token, password, birth_date, ip_address, user_agent });
    return res.status(200).json(result);
  } catch (error: any) {
    const statusCode = error.statusCode || 500;
    return res.status(statusCode).json({ msg: error.message || "Gagal mereset kata sandi." });
  }
};

export const verifyResetToken = async (req: Request, res: Response): Promise<any> => {
  try {
    const token = req.params.token as string;
    const result = await verifyResetTokenService(token);
    return res.status(200).json(result);
  } catch (error: any) {
    const statusCode = error.statusCode || 500;
    return res.status(statusCode).json({ msg: error.message || "Gagal memvalidasi token." });
  }
};

export const refreshToken = async (req: Request, res: Response): Promise<any> => {
  try {
    const token = req.cookies?.[REFRESH_TOKEN_COOKIE_NAME] || req.body?.token;
    const ip_address = (req.headers["x-forwarded-for"] as string) || req.socket.remoteAddress || "";
    const user_agent = req.headers["user-agent"] || "";

    const result = await refreshTokenService(token, ip_address, user_agent);

    res.cookie(REFRESH_TOKEN_COOKIE_NAME, result.refreshToken, getRefreshCookieOptions());

    return res.status(200).json({
      msg: "Token refreshed successfully",
      token: result.token,
    });
  } catch (error: any) {
    const statusCode = error.statusCode || 500;
    return res.status(statusCode).json({ msg: error.message || "Gagal memperbarui token sesi." });
  }
};

export const logout = async (req: Request, res: Response): Promise<any> => {
  try {
    const token = req.cookies?.[REFRESH_TOKEN_COOKIE_NAME] || req.body?.token;
    const userId = (req as any).user?.id;
    const userRole = (req as any).user?.role;

    const result = await logoutService(token, userId, userRole);

    res.clearCookie(REFRESH_TOKEN_COOKIE_NAME, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict" as const,
      path: "/api/auth",
    });

    return res.status(200).json(result);
  } catch (error: any) {
    const statusCode = error.statusCode || 500;
    return res.status(statusCode).json({ msg: error.message || "Gagal memproses logout." });
  }
};

export const getMe = async (req: Request, res: Response): Promise<any> => {
  if (!req.user) return res.status(401).json({ msg: "Unauthorized" });
  const { password, ...safeUser } = req.user;
  return res.status(200).json({ user: safeUser });
};
