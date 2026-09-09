/*
 * SystemSettingController.js
 * Controller for Managing System Settings & Operational Restriction Rules
 */

import { operationalRuleService } from "../services/operationalRuleService.js";

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
}

export const systemSettingController = new SystemSettingController();
