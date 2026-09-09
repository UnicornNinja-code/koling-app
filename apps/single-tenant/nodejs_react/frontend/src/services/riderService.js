import { axiosInstance } from "../lib/axios.js";

/**
 * Rider Operational Domain Service (Canonical Backend Phase 1-7)
 */
export const riderService = {
  getActiveSession: async () => {
    const res = await axiosInstance.get("/rider/active-session");
    return res.data;
  },

  getHubArmadas: async () => {
    const res = await axiosInstance.get("/rider/hub-armadas");
    return res.data;
  },

  holdArmada: async (armada_id) => {
    const res = await axiosInstance.post("/rider/hold-armada", { armada_id });
    return res.data;
  },

  cancelHoldArmada: async (armada_id) => {
    const res = await axiosInstance.post("/rider/cancel-hold-armada", { armada_id });
    return res.data;
  },

  claimArmada: async (armada_id) => {
    const res = await axiosInstance.post("/rider/claim-armada", { armada_id });
    return res.data;
  },

  checkInZone: async ({ latitude, longitude }) => {
    const res = await axiosInstance.post("/rider/check-in", {
      latitude: Number(latitude),
      longitude: Number(longitude),
    });
    return res.data;
  },

  recordSale: async ({ product_id, quantity, latitude, longitude }) => {
    const payload = {
      product_id,
      quantity: Number(quantity),
    };
    if (latitude !== undefined && longitude !== undefined) {
      payload.latitude = Number(latitude);
      payload.longitude = Number(longitude);
    }
    const res = await axiosInstance.post("/rider/record-sale", payload);
    return res.data;
  },

  checkoutSession: async (payload = { return_status: "ACTIVE" }) => {
    const res = await axiosInstance.post("/rider/checkout", payload);
    return res.data;
  },

  getMySales: async (params = {}) => {
    const res = await axiosInstance.get("/rider/my-sales", { params });
    return res.data;
  },

  getMyHistory: async () => {
    const res = await axiosInstance.get("/distribution/my-history");
    return res.data;
  },
};
