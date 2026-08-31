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

export const register = async (req: Request, res: Response): Promise<any> => {
  try {
    const { username, name, email, password } = req.body;
    const user = await registerService({ username, name, email, password });
    return res.status(201).json({ msg: "User registered successfully", user });
  } catch (error: any) {
    if (error.code === "23505") {
      return res.status(400).json({ msg: "Email or username already exists" });
    }
    const statusCode = error.statusCode || 500;
    return res.status(statusCode).json({ msg: error.message || "Internal server error" });
  }
};

export const login = async (req: Request, res: Response): Promise<any> => {
  try {
    const identifier = req.body.identifier || req.body.username || req.body.email;
    const password = req.body.password;

    const result = await loginService({ identifier, password });

    res.cookie(REFRESH_TOKEN_COOKIE_NAME, result.refreshToken, getRefreshCookieOptions());

    return res.status(200).json({
      msg: "Login successful",
      token: result.token,
      user: result.user,
    });
  } catch (error: any) {
    const statusCode = error.statusCode || 500;
    return res.status(statusCode).json({ msg: error.message || "Internal server error" });
  }
};

export const forgotPassword = async (req: Request, res: Response): Promise<any> => {
  try {
    const { email } = req.body;
    const result = await forgotPasswordService(email);
    return res.status(200).json(result);
  } catch (error: any) {
    const statusCode = error.statusCode || 500;
    return res.status(statusCode).json({ msg: error.message || "Internal server error" });
  }
};

export const resetPassword = async (req: Request, res: Response): Promise<any> => {
  try {
    const { token, password } = req.body;
    const result = await resetPasswordService({ token, password });
    return res.status(200).json(result);
  } catch (error: any) {
    const statusCode = error.statusCode || 500;
    return res.status(statusCode).json({ msg: error.message || "Internal server error" });
  }
};

export const verifyResetToken = async (req: Request, res: Response): Promise<any> => {
  try {
    const token = req.params.token as string;
    const result = await verifyResetTokenService(token);
    return res.status(200).json(result);
  } catch (error: any) {
    const statusCode = error.statusCode || 500;
    return res.status(statusCode).json({ msg: error.message || "Internal server error" });
  }
};

export const refreshToken = async (req: Request, res: Response): Promise<any> => {
  try {
    const token = req.cookies?.[REFRESH_TOKEN_COOKIE_NAME] || req.body?.token;

    const result = await refreshTokenService(token);

    res.cookie(REFRESH_TOKEN_COOKIE_NAME, result.refreshToken, getRefreshCookieOptions());

    return res.status(200).json({
      msg: "Token refreshed successfully",
      token: result.token,
    });
  } catch (error: any) {
    const statusCode = error.statusCode || 500;
    return res.status(statusCode).json({ msg: error.message || "Internal server error" });
  }
};

export const logout = async (req: Request, res: Response): Promise<any> => {
  try {
    const token = req.cookies?.[REFRESH_TOKEN_COOKIE_NAME] || req.body?.token;

    const result = await logoutService(token);

    res.clearCookie(REFRESH_TOKEN_COOKIE_NAME, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict" as const,
      path: "/api/auth",
    });

    return res.status(200).json(result);
  } catch (error: any) {
    const statusCode = error.statusCode || 500;
    return res.status(statusCode).json({ msg: error.message || "Internal server error" });
  }
};

export const getMe = async (req: Request, res: Response): Promise<any> => {
  if (!req.user) return res.status(401).json({ msg: "Unauthorized" });
  const { password, ...safeUser } = req.user;
  return res.status(200).json({ user: safeUser });
};
