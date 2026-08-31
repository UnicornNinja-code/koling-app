import { axiosInstance } from "../lib/axios.js";

/**
 * Sales Ledger & Reporting Service (Canonical Backend Phase 4/7)
 */
export const salesService = {
  getOverview: async (params = {}) => {
    const res = await axiosInstance.get("/sales/overview", { params });
    return res.data;
  },

  getHistory: async (params = {}) => {
    const res = await axiosInstance.get("/sales/history", { params });
    return res.data;
  },

  getByZone: async (zoneId, params = {}) => {
    const res = await axiosInstance.get(`/sales/zone/${zoneId}`, { params });
    return res.data;
  },

  getByRider: async (riderId, params = {}) => {
    const res = await axiosInstance.get(`/sales/rider/${riderId}`, { params });
    return res.data;
  },
};
