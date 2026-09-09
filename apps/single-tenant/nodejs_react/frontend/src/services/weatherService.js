import { axiosInstance } from "../lib/axios.js";

export const weatherService = {
  getZoneWeatherInfo: async (zone_id, time) => {
    if (!zone_id) return null;
    const params = time ? { time } : {};
    const res = await axiosInstance.get(`/weathers/zone/${zone_id}`, { params });
    return res.data;
  },

  getZoneWeatherTimeline: async (zone_id, { date = "today", slot = "all" } = {}) => {
    if (!zone_id) return null;
    const res = await axiosInstance.get(`/weathers/zone/${zone_id}/timeline`, {
      params: { date, slot },
    });
    return res.data;
  },

  getHubWeatherInfo: async (city_name) => {
    if (!city_name) return null;
    const res = await axiosInstance.get(`/weathers/hub/${city_name}`);
    return res.data;
  },

  getHubWeather: async (city_name) => {
    if (!city_name) return null;
    const res = await axiosInstance.get(`/weathers/hub/${city_name}`);
    return res.data;
  },

  getZoneC4Score: async (zone_id, time) => {
    if (!zone_id) return null;
    const params = time ? { time } : {};
    const res = await axiosInstance.get(`/weathers/zone/${zone_id}/c4`, { params });
    return res.data;
  },

  syncWeather: async () => {
    const res = await axiosInstance.post("/weathers/sync");
    return res.data;
  },
};

export default weatherService;
