import { axiosInstance } from "../lib/axios.js";

export const distributionService = {
  confirmDuty: async (payload = {}) => {
    const res = await axiosInstance.post("/distribution/duty/confirm", payload);
    return res.data;
  },
  getDutyStatus: async () => {
    const res = await axiosInstance.get("/distribution/duty/status");
    return res.data;
  },
  getOverview: async () => {
    const res = await axiosInstance.get("/distribution/overview");
    return res.data;
  },
  autoDistribute: async () => {
    const res = await axiosInstance.post("/distribution/auto-assign");
    return res.data;
  },
  manualDistribute: async ({ rider_id, zone_id }) => {
    const res = await axiosInstance.post("/distribution/manual-assign", { rider_id, zone_id });
    return res.data;
  },
  getRuns: async () => {
    const res = await axiosInstance.get("/distribution/runs");
    return res.data;
  },
  getRunById: async (id) => {
    const res = await axiosInstance.get(`/distribution/runs/${id}`);
    return res.data;
  },
  getMyDutyHistory: async () => {
    const res = await axiosInstance.get("/distribution/my-history");
    return res.data;
  },
};
