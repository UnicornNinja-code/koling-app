/*
 * authService.ts
 * Authentication REST Service for Svelte 5 Frontend
 */

import { axiosInstance } from "../lib/axios";

export interface LoginCredentials {
  identifier: string;
  password: string;
}

export interface AuthUser {
  id: string;
  username: string;
  name: string;
  email: string;
  role: "SUPERADMIN" | "MANAGEMENT" | "SUPERVISOR" | "RIDER" | string;
  is_active?: boolean;
  phone?: string;
  created_at?: string;
}

export interface LoginResponse {
  msg?: string;
  message?: string;
  token: string;
  user: AuthUser;
}

export const authService = {
  /**
   * User login with username/email and password
   */
  login: async (credentials: LoginCredentials): Promise<LoginResponse> => {
    const payload = {
      identifier: credentials.identifier,
      password: credentials.password,
    };
    const res = await axiosInstance.post("/auth/login", payload);
    return res.data;
  },

  /**
   * Fetch currently authenticated user profile
   */
  getMe: async (): Promise<{ user: AuthUser }> => {
    const res = await axiosInstance.get("/auth/me");
    return res.data;
  },

  /**
   * Request password reset / activation link for a provisioned email
   */
  forgotPassword: async (email: string): Promise<{ msg?: string; message?: string }> => {
    const res = await axiosInstance.post("/auth/forgot-password", { email });
    return res.data;
  },

  /**
   * Complete password reset / activation with secure token
   */
  resetPassword: async (payload: { token: string; password: string }): Promise<{ msg?: string; message?: string }> => {
    const res = await axiosInstance.post("/auth/reset-password", payload);
    return res.data;
  },

  /**
   * Verify whether a password reset / activation token is valid
   */
  verifyResetToken: async (token: string): Promise<any> => {
    const res = await axiosInstance.get(`/auth/verify-reset-token/${token}`);
    return res.data;
  },

  /**
   * Refresh JWT authentication token
   */
  refreshToken: async (): Promise<{ token: string }> => {
    const res = await axiosInstance.post("/auth/refresh-token");
    return res.data;
  },

  /**
   * Logout current session
   */
  logout: async (): Promise<{ msg?: string }> => {
    const res = await axiosInstance.post("/auth/logout");
    return res.data;
  },
};
