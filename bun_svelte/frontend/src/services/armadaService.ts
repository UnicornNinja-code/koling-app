/*
 * armadaService.ts
 * REST API client for Fleet & Armada Management in TypeScript
 */

import { axiosInstance } from "../lib/axios";

export interface ArmadaItem {
  id: number | string;
  code: string;
  type: "GEROBAK" | "MOTOR_LISTRIK" | "LAINNYA" | string;
  status: "ACTIVE" | "IN_USE" | "MAINTENANCE" | "RESERVED" | string;
  current_rider_id?: number | string | null;
  current_rider_name?: string | null;
  created_at?: string;
  updated_at?: string;
}

export const armadaService = {
  /**
   * Get all armadas with optional filters
   */
  getAllArmadas: async (filters: { status?: string; type?: string } = {}): Promise<ArmadaItem[]> => {
    const res = await axiosInstance.get("/armadas", { params: filters });
    return res.data?.armadas || res.data?.data || [];
  },

  /**
   * Get single armada by ID
   */
  getArmadaById: async (id: number | string): Promise<ArmadaItem> => {
    const res = await axiosInstance.get(`/armadas/${id}`);
    return res.data?.armada || res.data;
  },

  /**
   * Create a new armada unit
   */
  createArmada: async (data: {
    code: string;
    type: string;
    status?: string;
  }): Promise<any> => {
    const res = await axiosInstance.post("/armadas", data);
    return res.data;
  },

  /**
   * Update armada unit
   */
  updateArmada: async (id: number | string, data: {
    code?: string;
    type?: string;
    status?: string;
    current_rider_id?: number | string | null;
  }): Promise<any> => {
    const res = await axiosInstance.put(`/armadas/${id}`, data);
    return res.data;
  },

  /**
   * Delete armada unit
   */
  deleteArmada: async (id: number | string): Promise<any> => {
    const res = await axiosInstance.delete(`/armadas/${id}`);
    return res.data;
  },
};
