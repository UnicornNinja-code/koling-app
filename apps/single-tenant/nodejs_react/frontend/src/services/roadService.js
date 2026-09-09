import { axiosInstance } from "../lib/axios.js";

export const roadService = {
  /**
   * Fetch GeoJSON FeatureCollection of Protocol Roads (Spatial Restriction Layer)
   */
  getProtocolRoads: async () => {
    try {
      const res = await axiosInstance.get("/roads/protocol");
      return res.data;
    } catch (err) {
      console.warn("Falling back to static GeoJSON for protocol roads:", err.message);
      const res = await axiosInstance.get("/data-map/geojson/jalan_protokol.geojson");
      return res.data;
    }
  },

  /**
   * Fetch GeoJSON FeatureCollection of Toll Roads (Spatial Restriction Layer)
   */
  getTollRoads: async () => {
    const res = await axiosInstance.get("/roads/toll");
    return res.data;
  },

  /**
   * Trigger Toll Roads synchronization from Overpass API
   */
  syncTollRoads: async () => {
    const res = await axiosInstance.post("/roads/sync-toll");
    return res.data;
  },
};

