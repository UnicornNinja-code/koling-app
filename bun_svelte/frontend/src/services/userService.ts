/*
 * userService.ts
 * REST API client for User & Account Administration in TypeScript
 */

import { axiosInstance } from "../lib/axios";

export interface UserAccountItem {
  id: number | string;
  username: string;
  name: string;
  email: string;
  role: "SUPERADMIN" | "MANAGEMENT" | "SUPERVISOR" | "RIDER" | string;
  is_active: boolean;
  phone?: string;
  birth_date?: string;
  avatar?: string;
  last_login?: string;
  created_at?: string;
  updated_at?: string;
}

export interface UsersListResponse {
  users: UserAccountItem[];
  count: number;
}

export const userService = {
  /**
   * Get all users
   */
  getAllUsers: async (): Promise<UserAccountItem[]> => {
    const res = await axiosInstance.get("/users");
    return res.data?.users || [];
  },

  /**
   * Get user details by ID
   */
  getUserById: async (id: number | string): Promise<UserAccountItem> => {
    const res = await axiosInstance.get(`/users/${id}`);
    return res.data?.user || res.data;
  },

  /**
   * Create a new user account (Minimal Provisioning)
   */
  createUser: async (data: {
    name: string;
    email: string;
    role: string;
    username?: string;
    password?: string;
    birth_date?: string;
  }): Promise<any> => {
    const res = await axiosInstance.post("/users", data);
    return res.data;
  },

  /**
   * Update user account
   */
  updateUser: async (id: number | string, data: {
    name?: string;
    email?: string;
    role?: string;
  }): Promise<any> => {
    const res = await axiosInstance.put(`/users/${id}`, data);
    return res.data;
  },

  /**
   * Toggle user active status
   */
  toggleUserStatus: async (id: number | string, isActive: boolean): Promise<any> => {
    const res = await axiosInstance.patch(`/users/${id}/status`, { is_active: isActive });
    return res.data;
  },

  /**
   * Admin Reset User Password
   */
  resetPassword: async (id: number | string, newPassword: string): Promise<any> => {
    const res = await axiosInstance.post(`/users/${id}/reset-password`, { password: newPassword });
    return res.data;
  },

  /**
   * Delete user account
   */
  deleteUser: async (id: number | string): Promise<any> => {
    const res = await axiosInstance.delete(`/users/${id}`);
    return res.data;
  },
};
