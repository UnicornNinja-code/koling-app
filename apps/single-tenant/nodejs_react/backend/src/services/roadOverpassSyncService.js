/*
 * RoadOverpassSyncService.js
 * Specialized Service for ingesting OSM Toll Road polylines via Overpass API
 */

import { overpassApiClient } from "../utils/overpassClient.js";
import { roadRepository } from "../repositories/roadRepository.js";

export class RoadOverpassSyncService {
  static instance = null;

  constructor(client = overpassApiClient, repo = roadRepository) {
    if (RoadOverpassSyncService.instance && client === overpassApiClient) {
      return RoadOverpassSyncService.instance;
    }
    this.overpassClient = client;
    this.roadRepo = repo;

    if (client === overpassApiClient) {
      RoadOverpassSyncService.instance = this;
    }
  }

  static getInstance() {
    if (!RoadOverpassSyncService.instance) {
      RoadOverpassSyncService.instance = new RoadOverpassSyncService();
    }
    return RoadOverpassSyncService.instance;
  }

  /**
   * Fetches Toll Roads from OpenStreetMap for Sidoarjo & Pasuruan operational areas
   * Transmutes elements into LineString geometries and persists them in PostGIS protocol_roads
   */
  async syncTollRoadsFromOverpass() {
    console.log("🌐 [RoadOverpassSyncService] Executing Overpass QL for Toll Roads...");

    const query = `
      [out:json][timeout:180];
      (
        area["name"="Sidoarjo"]["admin_level"="5"];
        area["name"="Pasuruan"]["admin_level"="5"];
      )->.searchAreas;
      (
        way["highway"="motorway"](area.searchAreas);
        way["highway"="motorway_link"](area.searchAreas);
        way["toll"="yes"](area.searchAreas);
      );
      out geom;
    `;

    let elements = [];
    try {
      elements = await this.overpassClient.fetchOverpassData(query);
    } catch (err) {
      console.error("💥 [RoadOverpassSyncService] Error calling Overpass API:", err.message);
      throw new Error(`Gagal mengambil data Jalan Tol dari Overpass API: ${err.message}`);
    }

    if (!Array.isArray(elements) || elements.length === 0) {
      console.warn("⚠️ [RoadOverpassSyncService] No elements returned from Overpass QL.");
      return {
        success: true,
        source: "OVERPASS_API",
        inserted: 0,
        updated: 0,
        total: 0,
        restriction_type: "PROHIBITED_TOLL_ROAD",
        message: "Tidak ada data jalan tol yang dikembalikan dari Overpass.",
      };
    }

    console.log(`📊 [RoadOverpassSyncService] ${elements.length} elements received from Overpass. Transforming...`);

    const validTollRoads = [];

    for (let i = 0; i < elements.length; i++) {
      const el = elements[i];
      if (el.type === "way" && Array.isArray(el.geometry) && el.geometry.length >= 2) {
        const coords = el.geometry
          .filter((pt) => typeof pt.lat === "number" && typeof pt.lon === "number")
          .map((pt) => [pt.lon, pt.lat]);

        if (coords.length >= 2) {
          const osmId = el.id;
          const externalId = `osm:way:${osmId}`;
          const tags = el.tags || {};
          const roadName = tags.name || tags["name:id"] || tags.ref || `Way #${osmId}`;
          const highwayType = tags.highway || "motorway";

          const lineStringGeoJson = {
            type: "LineString",
            coordinates: coords,
          };

          validTollRoads.push({
            external_id: externalId,
            osm_type: "way",
            osm_id: osmId,
            name: roadName,
            highway_type: highwayType,
            restriction_type: "PROHIBITED_TOLL_ROAD",
            metadata: {
              toll: tags.toll || "yes",
              ref: tags.ref || null,
              operator: tags.operator || null,
              highway: tags.highway || null,
              tags: tags,
            },
            geometry: lineStringGeoJson,
          });
        }
      }
    }

    console.log(`✅ [RoadOverpassSyncService] ${validTollRoads.length} valid LineString geometries processed.`);

    let dbResults = [];
    if (validTollRoads.length > 0) {
      dbResults = await this.roadRepo.bulkCreate(validTollRoads);
    }

    return {
      success: true,
      source: "OVERPASS_API",
      inserted: dbResults.length,
      updated: dbResults.length,
      total: dbResults.length,
      restriction_type: "PROHIBITED_TOLL_ROAD",
      message: `Berhasil menyinkronkan ${dbResults.length} segmen Jalan Tol dari Overpass API ke PostGIS.`,
    };
  }
}

export const roadOverpassSyncService = RoadOverpassSyncService.getInstance();
