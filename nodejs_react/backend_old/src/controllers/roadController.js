/*
 * RoadController.js
 * Controller for Spatial Restriction Layer (Protocol & Toll Roads)
 */

import { roadService, syncTollRoadsService } from "../services/roadService.js";

export class RoadController {
  /**
   * GET /api/roads/protocol
   * Returns GeoJSON FeatureCollection of protocol road spatial restrictions
   */
  async getProtocolRoads(req, res, next) {
    try {
      const geojson = await roadService.getProtocolRoadsGeoJson();
      return res.status(200).json(geojson);
    } catch (error) {
      return next(error);
    }
  }

  /**
   * GET /api/roads/toll
   * Returns GeoJSON FeatureCollection of toll road spatial restrictions
   */
  async getTollRoads(req, res, next) {
    try {
      const geojson = await roadService.getTollRoadsGeoJson();
      return res.status(200).json(geojson);
    } catch (error) {
      return next(error);
    }
  }

  /**
   * POST /api/roads/sync-toll
   * Triggers Overpass API ingestion for Toll Roads into PostGIS protocol_roads
   */
  async syncTollRoads(req, res, next) {
    try {
      const result = await syncTollRoadsService();
      return res.status(200).json(result);
    } catch (error) {
      return next(error);
    }
  }
}

export const roadController = new RoadController();

