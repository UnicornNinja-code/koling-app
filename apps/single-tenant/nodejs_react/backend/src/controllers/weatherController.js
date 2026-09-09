/*
 * weatherController.js
 * Controller for Weather Information & Criteria C4 DSS Evaluation.
 */

import {
  getZoneC4ScoreService,
  getHubWeatherOverviewService,
  syncAllZonesWeatherService,
} from "../services/poiService.js";

export const getZoneC4Score = async (req, res) => {
  try {
    const { zone_id } = req.params;
    const { time } = req.query; // optional query param e.g. ?time=15:00 or ?time=sore
    const result = await getZoneC4ScoreService(zone_id, time);
    return res.status(200).json(result);
  } catch (error) {
    const statusCode = error.statusCode || 500;
    return res.status(statusCode).json({ msg: error.message || "Internal server error" });
  }
};

export const getZoneWeatherInfo = async (req, res) => {
  try {
    const { zone_id } = req.params;
    const { time } = req.query;
    const result = await getZoneC4ScoreService(zone_id, time);
    return res.status(200).json({
      zone_id: result.zone_id,
      zone_name: result.zone_name,
      weather_widget: {
        rain_mm: result.supporting_info?.rain ?? 0,
        weather_code: result.supporting_info?.weather_code ?? 0,
        wind_speed_kmh: result.supporting_info?.wind_speed ?? 0,
        humidity_percent: result.supporting_info?.humidity ?? 0,
        dew_point_c: result.supporting_info?.dew_point ?? 0,
        temperature_c: result.supporting_info?.temperature ?? 0,
        max_rain_probability_percent: result.max_precipitation_probability ?? 0,
      },
      time_slot: result.active_time_slot,
      operational_hours: result.operational_hours_window,
    });
  } catch (error) {
    const statusCode = error.statusCode || 500;
    return res.status(statusCode).json({ msg: error.message || "Internal server error" });
  }
};

export const getHubWeatherInfo = async (req, res) => {
  try {
    const { city_name } = req.params;
    const { time } = req.query;
    const result = await getHubWeatherOverviewService(city_name, time);
    return res.status(200).json(result);
  } catch (error) {
    const statusCode = error.statusCode || 500;
    return res.status(statusCode).json({ msg: error.message || "Internal server error" });
  }
};

export const syncWeather = async (req, res) => {
  try {
    const batch = await syncAllZonesWeatherService();
    return res.status(200).json({
      msg: `Data cuaca untuk ${batch.length} zona berhasil diperbarui dari Open-Meteo API`,
      count: batch.length,
    });
  } catch (error) {
    const statusCode = error.statusCode || 500;
    return res.status(statusCode).json({ msg: error.message || "Internal server error" });
  }
};
