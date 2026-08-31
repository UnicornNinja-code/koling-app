/*
 * mapService.ts
 * Spatial & LBS Tracking REST Service for Leaflet Map
 */

import { axiosInstance } from "../lib/axios";

export interface ZoneFeature {
  id: string;
  name: string;
  code?: string;
  description?: string;
  max_capacity: number;
  status: "ACTIVE" | "INACTIVE" | "RESTRICTED";
  polygon?: any;
  coordinates?: [number, number][];
  current_riders?: number;
}

export interface NearbyRider {
  riderId: string;
  name: string;
  latitude: number;
  longitude: number;
  speed?: number;
  heading?: number;
  battery?: number;
  distanceMeters?: number;
  zoneId?: string;
  zoneName?: string;
  plateNumber?: string;
  vehicleType?: string;
  status?: "CHECKED_IN" | "OTW" | "IDLE" | "BREACH";
  updatedAt?: string;
}

export interface POIFeature {
  id: string;
  name: string;
  category: string;
  latitude: number;
  longitude: number;
  operational_status?: string;
  approval_status?: string;
}

export interface HubWeatherOverview {
  status: string;
  hub_city_name: string;
  total_zones: number;
  hub_overview: {
    avg_temperature_c: number;
    max_rain_probability_percent: number;
    weather_condition: string;
    weather_code: number;
    active_time_slot: string;
    operational_hours: string;
  };
  zones_weather_list: Array<{
    zone_id: string;
    zone_name: string;
    skor_c4_cost: number;
    rain_probability_percent: number;
    temperature_c: number;
    weather_code: number;
    weather_condition: string;
    risk_level: "HIGH" | "MEDIUM" | "LOW";
  }>;
}

export interface GeocodeResult {
  place_id: number | string;
  display_name: string;
  lat: string;
  lon: string;
  type?: string;
  class?: string;
}

export const mapService = {
  getZoneConfig: async (): Promise<any> => {
    const res = await axiosInstance.get("/zones/config");
    return res.data;
  },

  getAllZones: async (): Promise<ZoneFeature[]> => {
    const res = await axiosInstance.get("/zones");
    return res.data?.zones || res.data || [];
  },

  getProtocolRoads: async (): Promise<any> => {
    const res = await axiosInstance.get("/roads/protocol");
    return res.data?.geojson || res.data;
  },

  getTollRoads: async (): Promise<any> => {
    const res = await axiosInstance.get("/roads/toll");
    return res.data?.geojson || res.data;
  },

  getNearbyRiders: async (
    lat: number = -7.4450,
    lng: number = 112.7150,
    radiusMeters: number = 50000
  ): Promise<NearbyRider[]> => {
    try {
      const res = await axiosInstance.get("/lbs/nearby", {
        params: { lat, lng, radius: radiusMeters },
      });
      return res.data?.riders || res.data || [];
    } catch {
      return [];
    }
  },

  getPOIs: async (): Promise<POIFeature[]> => {
    try {
      const res = await axiosInstance.get("/pois/operational-area");
      return res.data?.pois || res.data?.data || res.data || [];
    } catch {
      return [];
    }
  },

  getHubWeather: async (cityName: string = "sidoarjo"): Promise<HubWeatherOverview | null> => {
    try {
      const res = await axiosInstance.get(`/weathers/hub/${cityName}`);
      return res.data;
    } catch {
      return null;
    }
  },

  syncWeather: async (): Promise<any> => {
    const res = await axiosInstance.post("/weathers/sync");
    return res.data;
  },

  searchSidoarjoLocation: async (query: string): Promise<GeocodeResult[]> => {
    if (!query || query.trim().length < 2) return [];
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          query + ", Sidoarjo, Jawa Timur, Indonesia"
        )}&viewbox=112.50,-7.58,112.85,-7.33&bounded=1&limit=5&addressdetails=1`
      );
      const data = await res.json();
      return Array.isArray(data) ? data : [];
    } catch {
      return [];
    }
  },
};
