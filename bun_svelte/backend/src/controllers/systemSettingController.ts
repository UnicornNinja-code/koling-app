/*
 * systemSettingController.ts
 * HTTP Controller for System Readiness, Central Hub & Operational Settings in TypeScript
 */

import type { Request, Response, NextFunction } from "express";
import { systemReadinessService } from "../services/system/systemReadinessService.js";
import { operationalRuleService } from "../services/operationalRuleService.js";
import { auditLogger } from "../utils/AuditLogger.js";

export const getSystemReadiness = async (req: Request, res: Response): Promise<any> => {
  try {
    const report = await systemReadinessService.evaluateSystemReadiness();
    return res.status(200).json(report);
  } catch (error: any) {
    const statusCode = error.statusCode || 500;
    return res.status(statusCode).json({ msg: error.message || "Internal server error" });
  }
};

export const updateSystemSettings = async (req: Request, res: Response): Promise<any> => {
  try {
    const {
      hub_name,
      hub_address,
      hub_latitude,
      hub_longitude,
      operational_radius_km,
      protocol_road_prohibited,
      toll_road_prohibited,
    } = req.body;

    const report = await systemReadinessService.updateSystemSettings({
      hub_name,
      hub_address,
      hub_latitude: hub_latitude !== undefined ? parseFloat(hub_latitude) : undefined,
      hub_longitude: hub_longitude !== undefined ? parseFloat(hub_longitude) : undefined,
      operational_radius_km: operational_radius_km !== undefined ? parseFloat(operational_radius_km) : undefined,
      protocol_road_prohibited: protocol_road_prohibited !== undefined ? Boolean(protocol_road_prohibited) : undefined,
      toll_road_prohibited: toll_road_prohibited !== undefined ? Boolean(toll_road_prohibited) : undefined,
    });

    await auditLogger.logAction({
      userId: req.user?.id,
      action: "SYSTEM_SETTINGS_UPDATED",
      entityType: "SYSTEM_SETTINGS",
      details: {
        hub_name,
        hub_address,
        hub_latitude,
        hub_longitude,
        operational_radius_km,
        protocol_road_prohibited,
        toll_road_prohibited,
      },
    });

    return res.status(200).json({
      msg: "Konfigurasi operasional Central Hub & jangkauan berhasil disimpan.",
      report,
    });
  } catch (error: any) {
    const statusCode = error.statusCode || 500;
    return res.status(statusCode).json({ msg: error.message || "Internal server error" });
  }
};

export const systemSettingController = {
  async getOperationalRules(req: Request, res: Response, next: NextFunction): Promise<any> {
    try {
      const data = await operationalRuleService.getOperationalRules();
      return res.json({ success: true, data });
    } catch (err) {
      next(err);
    }
  },

  async updateOperationalRules(req: Request, res: Response, next: NextFunction): Promise<any> {
    try {
      const result = await operationalRuleService.updateOperationalRules(req.body, req.user);
      return res.json(result);
    } catch (err) {
      next(err);
    }
  },

  getSystemReadiness,
  updateSystemSettings,
};

