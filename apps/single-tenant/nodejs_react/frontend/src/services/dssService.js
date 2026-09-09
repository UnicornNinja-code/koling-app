import { axiosInstance } from "../lib/axios.js";

export const dssService = {
  calculateBwmWeights: async (payload) => {
    const res = await axiosInstance.post("/dss/bwm/calculate", payload);
    return res.data;
  },
  getActiveDssConfig: async () => {
    const res = await axiosInstance.get("/dss/bwm/active");
    return res.data;
  },
  evaluateHybridBwmTopsis: async (payload) => {
    const res = await axiosInstance.post("/dss/evaluate", payload);
    return res.data;
  },
  getZoneRawEvaluation: async (zoneId, params = {}) => {
    const res = await axiosInstance.get(`/dss/zones/${zoneId}/raw-evaluation`, { params });
    return res.data;
  },
  getDssSnapshots: async (params = {}) => {
    const res = await axiosInstance.get("/dss/snapshots", { params });
    return res.data;
  },
  getDssSnapshotById: async (id) => {
    const res = await axiosInstance.get(`/dss/snapshots/${id}`);
    return res.data;
  },
  getTopsisRecommendations: async () => {
    const res = await axiosInstance.get("/dss/recommendations");
    return res.data;
  },
};
