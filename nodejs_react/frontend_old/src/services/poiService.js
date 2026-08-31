import { axiosInstance } from "../lib/axios.js";

export const poiService = {
  syncCityPois: async (payload = {}) => {
    const res = await axiosInstance.post("/pois/sync-city", payload);
    return res.data;
  },
  getPendingPois: async () => {
    const res = await axiosInstance.get("/pois/pending");
    return res.data;
  },
  approveOrRejectPoi: async (payload) => {
    const res = await axiosInstance.post("/pois/approve", payload);
    return res.data;
  },
  getApprovalLogs: async () => {
    const res = await axiosInstance.get("/pois/approval-logs");
    return res.data;
  },
  getOperationalAreaPois: async () => {
    const res = await axiosInstance.get("/pois/operational-area");
    return res.data;
  },
  getPoisByZone: async (zone_id) => {
    if (!zone_id) return { pois: [] };
    const res = await axiosInstance.get(`/pois/zone/${zone_id}`);
    return res.data;
  },
  getC1C2Scores: async (zone_id) => {
    if (!zone_id) return null;
    const res = await axiosInstance.get(`/pois/scores/c1-c2/${zone_id}`);
    return res.data;
  },
};
