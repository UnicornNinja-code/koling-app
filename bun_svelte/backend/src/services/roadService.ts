/*
 * roadService.ts
 * Service for fetching PostGIS protocol_roads spatial restriction layer in TypeScript.
 */

import { pool } from "../config/database.js";
import { roadOverpassSyncService } from "./roadOverpassSyncService.js";
import fs from "fs";
import path from "path";
import { roadRepository } from "../repositories/roadRepository.js";

export class RoadService {
  private static instance: RoadService | null = null;

  public static getInstance(): RoadService {
    if (!RoadService.instance) {
      RoadService.instance = new RoadService();
    }
    return RoadService.instance;
  }

  /**
   * Fetch protocol roads from PostGIS as GeoJSON FeatureCollection
   */
  public async getProtocolRoadsGeoJson(): Promise<any> {
    const query = `
      SELECT 
        json_build_object(
          'type', 'FeatureCollection',
          'features', COALESCE(json_agg(
            json_build_object(
              'type', 'Feature',
              'properties', json_build_object(
                'id', external_id,
                'name', name,
                'highway', highway_type,
                'restriction_type', COALESCE(restriction_type, 'PROHIBITED_ROAD')
              ),
              'geometry', ST_AsGeoJSON(geom)::json
            )
          ), '[]'::json)
        ) AS geojson
      FROM protocol_roads
      WHERE restriction_type IS NULL OR restriction_type = 'PROHIBITED_ROAD';
    `;

    const { rows } = await pool.query(query);
    return rows[0]?.geojson || { type: "FeatureCollection", features: [] };
  }

  /**
   * Fetch toll roads from PostGIS as GeoJSON FeatureCollection
   */
  public async getTollRoadsGeoJson(): Promise<any> {
    const query = `
      SELECT 
        json_build_object(
          'type', 'FeatureCollection',
          'features', COALESCE(json_agg(
            json_build_object(
              'type', 'Feature',
              'properties', json_build_object(
                'id', external_id,
                'name', name,
                'highway', highway_type,
                'restriction_type', restriction_type,
                'metadata', metadata
              ),
              'geometry', ST_AsGeoJSON(geom)::json
            )
          ), '[]'::json)
        ) AS geojson
      FROM protocol_roads
      WHERE restriction_type = 'PROHIBITED_TOLL_ROAD';
    `;

    const { rows } = await pool.query(query);
    return rows[0]?.geojson || { type: "FeatureCollection", features: [] };
  }
}

export const roadService = RoadService.getInstance();

export async function syncProtocolRoadsService(): Promise<any> {
  let geojson = await roadService.getProtocolRoadsGeoJson();
  if (!geojson.features || geojson.features.length === 0) {
    const geoJsonPath = path.join(process.cwd(), "public/geojson/jalan_protokol.geojson");
    const file = typeof Bun !== "undefined" ? Bun.file(geoJsonPath) : null;
    if (file && (await file.exists())) {
      const parsed: any = await file.json();
      const features = parsed.features || [];
      const validFeatures = features
        .filter((f: any) => f.geometry?.type === "LineString" && Array.isArray(f.geometry.coordinates))
        .map((feat: any, idx: number) => ({
          external_id: feat.properties?.id || `way/gen-${idx + 1}`,
          name: feat.properties?.name || "Jalan Protokol Utama",
          highway_type: feat.properties?.highway || "secondary",
          restriction_type: "PROHIBITED_ROAD",
          metadata: feat.properties || {},
          geometry: feat.geometry,
        }));
      if (validFeatures.length > 0) {
        await roadRepository.bulkCreate(validFeatures);
        geojson = await roadService.getProtocolRoadsGeoJson();
      }
    } else if (fs.existsSync(geoJsonPath)) {
      const rawData = fs.readFileSync(geoJsonPath, "utf8");
      const parsed = JSON.parse(rawData);
      const features = parsed.features || [];
      const validFeatures = features
        .filter((f: any) => f.geometry?.type === "LineString" && Array.isArray(f.geometry.coordinates))
        .map((feat: any, idx: number) => ({
          external_id: feat.properties?.id || `way/gen-${idx + 1}`,
          name: feat.properties?.name || "Jalan Protokol Utama",
          highway_type: feat.properties?.highway || "secondary",
          restriction_type: "PROHIBITED_ROAD",
          metadata: feat.properties || {},
          geometry: feat.geometry,
        }));
      if (validFeatures.length > 0) {
        await roadRepository.bulkCreate(validFeatures);
        geojson = await roadService.getProtocolRoadsGeoJson();
      }
    }
  }
  return {
    success: true,
    totalRoads: geojson.features ? geojson.features.length : 0,
    msg: "Protocol roads spatial layer synchronized successfully.",
  };
}

export async function syncTollRoadsService(): Promise<any> {
  return await roadOverpassSyncService.syncTollRoadsFromOverpass();
}
