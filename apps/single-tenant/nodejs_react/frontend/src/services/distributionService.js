import { axiosInstance } from "../lib/axios.js";

export const distributionService = {
  confirmDuty: async (payload = {}) => {
    const res = await axiosInstance.post("/distribution/duty-confirm", payload);
    return res.data;
  },
  getOverview: async () => {
    const res = await axiosInstance.get("/distribution/overview");
    return res.data;
  },
  autoDistribute: async () => {
    const res = await axiosInstance.post("/distribution/auto");
    return res.data;
  },
  manualDistribute: async ({ rider_id, zone_id }) => {
    const res = await axiosInstance.post("/distribution/manual", { rider_id, zone_id });
    return res.data;
  },
};
