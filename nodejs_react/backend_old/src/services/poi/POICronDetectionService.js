/*
 *   Copyright (c) 2026 
 *   All rights reserved.
 *   POICronDetectionService (Automated Background POI Detection & Pending Approval Ingestion)
 */

import { overpassApiClient } from "../../utils/overpassClient.js";
import { poiClusterer } from "./POIClusterer.js";
import { spatialDeduplicator } from "./SpatialDeduplicator.js";
import { poiEntityFactory } from "./POIEntityFactory.js";
import { poiRepository } from "../../repositories/poiRepository.js";

export class POICronDetectionService {
  static instance = null;

  constructor(
    client = overpassApiClient,
    clusterer = poiClusterer,
    deduplicator = spatialDeduplicator,
    factory = poiEntityFactory,
    repo = poiRepository
  ) {
    if (POICronDetectionService.instance && client === overpassApiClient) {
      return POICronDetectionService.instance;
    }
    this.overpassClient = client;
    this.clusterer = clusterer;
    this.deduplicator = deduplicator;
    this.factory = factory;
    this.repo = repo;

    if (client === overpassApiClient) {
      POICronDetectionService.instance = this;
    }
  }

  static getInstance() {
    if (!POICronDetectionService.instance) {
      POICronDetectionService.instance = new POICronDetectionService();
    }
    return POICronDetectionService.instance;
  }

  /**
   * Scans Overpass API for new POIs and saves newly discovered POIs with status 'PENDING_APPROVAL'
   */
  async detectNewPois(hubCity = "Sidoarjo") {
    const query = `
      [out:json][timeout:300];
      area["name"="${hubCity}"]["admin_level"="5"]->.searchArea;
      (
        nwr["amenity"](area.searchArea); nwr["shop"](area.searchArea);
        nwr["leisure"](area.searchArea); nwr["office"](area.searchArea);
        nwr["tourism"](area.searchArea); nwr["healthcare"](area.searchArea);
      );
      out center;
    `;

    let overpassData = [];
    try {
      overpassData = await this.overpassClient.fetchOverpassData(query);
    } catch (err) {
      console.warn("⚠️ [POICronDetection] Overpass API error:", err.message);
      return { detectedCount: 0, pendingCount: 0, message: "Overpass API unreachable" };
    }

    if (!overpassData || overpassData.length === 0) {
      return { detectedCount: 0, pendingCount: 0, message: "No data returned from Overpass" };
    }

    // 1. Transform Overpass elements
    const transformedPois = overpassData
      .map((el) => this.factory.createFromOverpassElement(el, this.clusterer))
      .filter((p) => p.category !== "IGNORED" && !isNaN(p.latitude) && !isNaN(p.longitude));

    // 2. Deduplicate spatially
    const deduplicatedPois = this.deduplicator.deduplicate(transformedPois, 15);

    // 3. Fetch existing POIs from database
    const existingPois = await this.repo.findAll();
    const existingOsmIds = new Set(existingPois.map((p) => p.osm_id).filter(Boolean));

    // 4. Filter for NEW POIs not present in database
    const newPois = deduplicatedPois.filter((p) => {
      if (p.osm_id && existingOsmIds.has(p.osm_id)) {
        return false;
      }
      // Check spatial distance against existing approved POIs
      const isDuplicate = existingPois.some((existing) => {
        if (
          existing.category === p.category &&
          existing.name.toLowerCase().trim() === p.name.toLowerCase().trim()
        ) {
          const dist = this.deduplicator.calculateHaversineDistanceMeter(
            existing.latitude,
            existing.longitude,
            p.latitude,
            p.longitude
          );
          return dist <= 15;
        }
        return false;
      });
      return !isDuplicate;
    });

    // 5. Insert new POIs with status 'PENDING_APPROVAL'
    let newlyInserted = [];
    if (newPois.length > 0) {
      const pendingPoisToInsert = newPois.map((p) => ({
        ...p,
        status: "PENDING_APPROVAL",
      }));
      newlyInserted = await this.repo.syncCityPoisWithTransaction(pendingPoisToInsert);
    }

    const currentPending = await this.repo.findPendingPois();

    console.log(`🤖 [POICronDetection] Scan Complete: ${newlyInserted.length} POI baru terdeteksi & disimpan dengan status PENDING_APPROVAL.`);
    return {
      message: "Proses pemindaian POI otomatis selesai.",
      newlyDetectedCount: newlyInserted.length,
      totalPendingCount: currentPending.length,
      pendingPois: currentPending,
    };
  }
}

export const poiCronDetectionService = POICronDetectionService.getInstance();
