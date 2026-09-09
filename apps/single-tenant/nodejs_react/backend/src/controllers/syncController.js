/*
 * syncController.js
 * Controller for Data Freshness Monitoring & Manual Sync Triggering
 */

import { syncRunRepository } from "../repositories/syncRunRepository.js";
import { POIEltPipelineService } from "../services/poiService.js";
import { POIWeatherService } from "../services/poi/POIWeatherService.js";

const poiPipelineService = new POIEltPipelineService();
const weatherService = POIWeatherService.getInstance();

export const getSyncStatus = async (req, res) => {
  try {
    const summary = await syncRunRepository.getLatestStatusSummary();
    return res.status(200).json({
      status: "success",
      freshness_summary: summary,
    });
  } catch (error) {
    const statusCode = error.statusCode || 500;
    return res.status(statusCode).json({ msg: error.message || "Internal server error" });
  }
};

export const getSyncRuns = async (req, res) => {
  try {
    const limit = req.query.limit ? parseInt(req.query.limit, 10) : 20;
    const runs = await syncRunRepository.getRecentRuns(limit);
    return res.status(200).json({
      status: "success",
      total: runs.length,
      runs,
    });
  } catch (error) {
    const statusCode = error.statusCode || 500;
    return res.status(statusCode).json({ msg: error.message || "Internal server error" });
  }
};

export const triggerPoiSync = async (req, res) => {
  try {
    const { city } = req.body || {};
    const result = await poiPipelineService.syncCityPois(city || null);
    return res.status(200).json({
      status: "success",
      msg: "Sinkronisasi POI Overpass API berhasil diproses dan dicatat ke data_sync_runs.",
      result,
    });
  } catch (error) {
    const statusCode = error.statusCode || 500;
    return res.status(statusCode).json({ msg: error.message || "Internal server error" });
  }
};

export const triggerWeatherSync = async (req, res) => {
  try {
    const run = await syncRunRepository.startRun({
      data_type: "WEATHER",
      source: "OPEN_METEO",
      metadata: { trigger: "MANUAL" },
    });

    try {
      const result = await weatherService.syncAllZonesWeather(true);
      await syncRunRepository.completeRun(run.id, {
        records_fetched: result.length,
        records_processed: result.length,
        records_rejected: 0,
        metadata: { zones_count: result.length },
      });

      return res.status(200).json({
        status: "success",
        msg: `Sinkronisasi cuaca Open-Meteo berhasil diproses (${result.length} zona).`,
        zones_updated: result.length,
      });
    } catch (err) {
      await syncRunRepository.failRun(run.id, err.message, { trigger: "MANUAL" });
      throw err;
    }
  } catch (error) {
    const statusCode = error.statusCode || 500;
    return res.status(statusCode).json({ msg: error.message || "Internal server error" });
  }
};
