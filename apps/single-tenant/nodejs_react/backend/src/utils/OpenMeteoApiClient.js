/*
 * OpenMeteoApiClient.js
 * Singleton Client for Open-Meteo Weather API with batch multi-coordinate query support.
 */

export class OpenMeteoApiClient {
  static instance = null;

  constructor(baseUrl = "https://api.open-meteo.com/v1/forecast") {
    if (OpenMeteoApiClient.instance) {
      return OpenMeteoApiClient.instance;
    }
    this.baseUrl = baseUrl;
    OpenMeteoApiClient.instance = this;
  }

  static getInstance() {
    if (!OpenMeteoApiClient.instance) {
      OpenMeteoApiClient.instance = new OpenMeteoApiClient();
    }
    return OpenMeteoApiClient.instance;
  }

  /**
   * Batch fetch hourly weather forecast for array of locations [{ zone_id, latitude, longitude }]
   * @param {Array<{zone_id: string, latitude: number, longitude: number}>} locations 
   * @returns {Promise<Array<{zone_id: string, latitude: number, longitude: number, hourly: object}>>}
   */
  async fetchBatchWeather(locations) {
    if (!Array.isArray(locations) || locations.length === 0) {
      return [];
    }

    const lats = locations.map((l) => Number(l.latitude).toFixed(6)).join(",");
    const lons = locations.map((l) => Number(l.longitude).toFixed(6)).join(",");

    const hourlyParams = [
      "precipitation_probability",
      "precipitation",
      "rain",
      "weather_code",
      "wind_speed_10m",
      "relative_humidity_2m",
      "dew_point_2m",
      "apparent_temperature",
    ].join(",");

    const url = `${this.baseUrl}?latitude=${lats}&longitude=${lons}&hourly=${hourlyParams}&timezone=Asia%2FJakarta`;

    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Open-Meteo API HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      // Open-Meteo returns array of responses when multiple coordinates are passed,
      // or a single object if only 1 location is passed.
      const rawResults = Array.isArray(data) ? data : [data];

      return locations.map((loc, idx) => {
        const raw = rawResults[idx] || rawResults[0] || {};
        return {
          zone_id: loc.zone_id,
          latitude: loc.latitude,
          longitude: loc.longitude,
          hourly: raw.hourly || {},
          fetched_at: new Date(),
        };
      });
    } catch (error) {
      console.error("❌ Error fetching Open-Meteo batch weather:", error.message);
      throw error;
    }
  }
}

export const openMeteoApiClient = OpenMeteoApiClient.getInstance();
