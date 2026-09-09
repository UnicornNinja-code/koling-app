import { axiosInstance } from "../lib/axios.js";

export const weatherService = {
  getZoneWeatherInfo: async (zone_id) => {
    if (!zone_id) return null;
    const res = await axiosInstance.get(`/weathers/zone/${zone_id}`);
    return res.data;
  },
  getHubWeatherInfo: async (city_name) => {
    if (!city_name) return null;
    const res = await axiosInstance.get(`/weathers/hub/${city_name}`);
    return res.data;
  },
  syncWeather: async () => {
    const res = await axiosInstance.post("/weathers/sync");
    return res.data;
  },
};
