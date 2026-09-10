/*
 * SystemSettingController.js
 * Controller for Managing System Settings, Central Hub Configuration & System Readiness
 */

import { operationalRuleService } from "../services/operationalRuleService.js";
import { systemReadinessService } from "../services/systemReadinessService.js";

export class SystemSettingController {
  /**
   * GET /api/system-settings/operational-rules
   * Returns current operational rule configuration
   */
  async getOperationalRules(req, res, next) {
    try {
      const rules = await operationalRuleService.getOperationalRules();
      return res.status(200).json({
        success: true,
        data: rules,
      });
    } catch (error) {
      return next(error);
    }
  }

  /**
   * PATCH /api/system-settings/operational-rules
   * Updates operational rule configuration & triggers PostGIS spatial re-evaluation
   */
  async updateOperationalRules(req, res, next) {
    try {
      const { protocol_road_prohibited, toll_road_prohibited } = req.body;
      const user = req.user || {};

      const result = await operationalRuleService.updateOperationalRules(
        { protocol_road_prohibited, toll_road_prohibited },
        user
      );

      return res.status(200).json(result);
    } catch (error) {
      return next(error);
    }
  }

  /**
   * GET /api/system-settings/readiness
   * Returns holistic operational readiness report across all system pillars
   */
  async getSystemReadiness(req, res, next) {
    try {
      const report = await systemReadinessService.evaluateSystemReadiness();
      return res.status(200).json({
        success: true,
        data: report,
      });
    } catch (error) {
      return next(error);
    }
  }

  /**
   * GET /api/system-settings/hub
   * Returns Central Hub spatial configuration
   */
  async getHubConfig(req, res, next) {
    try {
      const report = await systemReadinessService.evaluateSystemReadiness();
      return res.status(200).json({
        success: true,
        data: report.hub_config,
      });
    } catch (error) {
      return next(error);
    }
  }

  /**
   * PUT /api/system-settings/hub
   * Updates Central Hub configuration in PostgreSQL system_settings
   */
  async updateHubConfig(req, res, next) {
    try {
      const user = req.user || {};
      const updatedReport = await systemReadinessService.updateHubConfig(req.body, user);
      return res.status(200).json({
        success: true,
        msg: "Konfigurasi Central Hub & parameter spasial berhasil diperbarui.",
        data: updatedReport.hub_config,
        report: updatedReport,
      });
    } catch (error) {
      return next(error);
    }
  }

  /**
   * GET /api/system-settings/map-config
   * Returns supported Leaflet basemap providers & configuration options
   */
  async getMapConfig(req, res, next) {
    try {
      const providers = [
        {
          id: "osm-standard",
          name: "OpenStreetMap Standard (Free & Ringan)",
          url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
          maxZoom: 19,
          subdomains: ["a", "b", "c"],
          is_default: true,
          is_free: true,
        },
        {
          id: "openmaptiles-streets",
          name: "OpenMapTiles Streets (Jalan & Bangunan)",
          url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
          maxZoom: 19,
          is_default: false,
          is_free: true,
        },
        {
          id: "openmaptiles-dark",
          name: "OpenMapTiles Dark (Kontras Gelap)",
          url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
          maxZoom: 19,
          is_default: false,
          is_free: true,
        },
        {
          id: "openmaptiles-satellite",
          name: "OpenMapTiles Satellite (Citra Satelit Hybrid)",
          url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
          maxZoom: 19,
          is_default: false,
          is_free: true,
        },
        {
          id: "openmaptiles-outdoor",
          name: "OpenMapTiles Outdoor (Topografi & Kontur)",
          url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
          maxZoom: 19,
          is_default: false,
          is_free: true,
        },
        {
          id: "esri-topographic",
          name: "Esri World Topographic (Topografi Komprehensif)",
          url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}",
          maxZoom: 19,
          is_default: false,
          is_free: true,
        },
      ];

      return res.status(200).json({
        success: true,
        data: {
          default_basemap_id: "osm-standard",
          default_buffer_meters: 50,
          providers,
        },
      });
    } catch (error) {
      return next(error);
    }
  }
}

export const systemSettingController = new SystemSettingController();
