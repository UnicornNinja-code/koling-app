/*
 * armadaService.ts
 * REST API client for 3-Dimensional Fleet & Armada Management in TypeScript
 */

import { axiosInstance } from "../lib/axios";

export interface ArmadaItem {
  id: number | string;
  code: string;
  type: "GEROBAK" | "MOTOR_LISTRIK" | "LAINNYA" | string;
  status: "ACTIVE" | "MAINTENANCE" | "RETIRED" | string;
  fleet_status?: "ACTIVE" | "MAINTENANCE" | "RETIRED" | string;
  reservation_state?: "AVAILABLE" | "HELD";
  assignment_state?: "UNASSIGNED" | "IN_USE";
  current_rider_id?: number | string | null;
  current_rider_name?: string | null;
  reserved_by_rider_id?: number | string | null;
  reserved_by_rider_name?: string | null;
  reserved_until?: string | null;
  is_available_for_duty?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface FleetIssueItem {
  id: string;
  armada_id: string;
  armada_code: string;
  armada_type: string;
  rider_id: string;
  rider_name: string;
  rider_email?: string;
  severity: "MINOR" | "CRITICAL";
  issue_type: string;
  description: string;
  status: "REPORTED" | "IN_REVIEW" | "REPLACED" | "RESOLVED" | "SENT_TO_MAINTENANCE";
  resolution_notes?: string;
  reported_at: string;
  resolved_at?: string;
}

export const armadaService = {
  /**
   * Get all armadas with 3-dimensional computed states & optional filters
   */
  getAllArmadas: async (filters: { status?: string; type?: string; reservation_state?: string } = {}): Promise<ArmadaItem[]> => {
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
    force?: boolean;
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

  /**
   * Report an issue / damage on armada
   */
  reportIssue: async (armadaId: string | number, data: {
    severity?: string;
    issue_type: string;
    description: string;
  }): Promise<any> => {
    const res = await axiosInstance.post(`/armadas/${armadaId}/report-issue`, data);
    return res.data;
  },

  /**
   * Fetch all issue reports (Supervisor & Management)
   */
  getAllIssueReports: async (statusFilter?: string): Promise<FleetIssueItem[]> => {
    const res = await axiosInstance.get("/armadas/issues", { params: { status: statusFilter } });
    return res.data?.issues || [];
  },

  /**
   * Resolve an issue report (Send to Maintenance / Resolve)
   */
  resolveIssueReport: async (issueId: string | number, data: {
    status: string;
    resolution_notes?: string;
  }): Promise<any> => {
    const res = await axiosInstance.put(`/armadas/issues/${issueId}/resolve`, data);
    return res.data;
  },

  /**
   * Get assignment history of an armada
   */
  getArmadaHistory: async (armadaId: string | number): Promise<any[]> => {
    const res = await axiosInstance.get(`/armadas/${armadaId}/history`);
    return res.data?.history || [];
  },
};
