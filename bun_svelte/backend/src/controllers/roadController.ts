/*
 * roadController.ts
 * Controller for Spatial Restriction Layer in TypeScript
 */

import type { Request, Response, NextFunction } from "express";
import { roadService, syncTollRoadsService } from "../services/roadService.js";

export class RoadController {
  public async getProtocolRoads(req: Request, res: Response, next: NextFunction): Promise<any> {
    try {
      const geojson = await roadService.getProtocolRoadsGeoJson();
      return res.status(200).json(geojson);
    } catch (error) {
      return next(error);
    }
  }

  public async getTollRoads(req: Request, res: Response, next: NextFunction): Promise<any> {
    try {
      const geojson = await roadService.getTollRoadsGeoJson();
      return res.status(200).json(geojson);
    } catch (error) {
      return next(error);
    }
  }

  public async syncTollRoads(req: Request, res: Response, next: NextFunction): Promise<any> {
    try {
      const result = await syncTollRoadsService();
      return res.status(200).json(result);
    } catch (error) {
      return next(error);
    }
  }
}

export const roadController = new RoadController();
