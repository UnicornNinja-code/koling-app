/*
 * systemSettingController.ts
 * Controller for Managing System Settings & Operational Restriction Rules in TypeScript
 */

import type { Request, Response, NextFunction } from "express";
import { operationalRuleService } from "../services/operationalRuleService.js";

export class SystemSettingController {
  public async getOperationalRules(req: Request, res: Response, next: NextFunction): Promise<any> {
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

  public async updateOperationalRules(req: Request, res: Response, next: NextFunction): Promise<any> {
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
