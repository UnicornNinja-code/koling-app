import { axiosInstance } from "../lib/axios.js";

export const lbsService = {
  getNearbyRiders: async ({ latitude, longitude, radius_km = 5 }) => {
    const res = await axiosInstance.get("/lbs/nearby", {
      params: { latitude, longitude, radius_km },
    });
    return res.data;
  },
  calculateRiderDistance: async ({ rider1_id, rider2_id }) => {
    const res = await axiosInstance.get("/lbs/distance", {
      params: { rider1_id, rider2_id },
    });
    return res.data;
  },
  getRiderLocation: async (riderId) => {
    const res = await axiosInstance.get(`/lbs/riders/${riderId}`);
    return res.data;
  },
};
