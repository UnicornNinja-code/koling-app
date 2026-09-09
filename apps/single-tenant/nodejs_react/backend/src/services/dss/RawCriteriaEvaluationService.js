/*
 * RawCriteriaEvaluationService.js
 * Domain Service for DSS Phase 1 — Raw Criteria Evaluation Engine (DSS-CRITERIA-v1.0)
 * Evaluates raw C1-C6 criteria values for user-defined operational zones.
 */

import { ZoneModel } from "../../models/zoneModel.js";
import { poiRepository } from "../../repositories/poiRepository.js";
import { poiTimeCrowdService } from "../poi/POITimeCrowdService.js";
import { poiWeatherService } from "../poi/POIWeatherService.js";
import { poiDistanceService } from "../poi/POIDistanceService.js";
import { poiCompetitorService } from "../poi/POICompetitorService.js";
import { TimeSlotEvaluator } from "../../utils/TimeSlotEvaluator.js";

export class RawCriteriaEvaluationService {
  static instance = null;

  constructor() {
    if (RawCriteriaEvaluationService.instance) {
      return RawCriteriaEvaluationService.instance;
    }
    RawCriteriaEvaluationService.instance = this;
  }

  static getInstance() {
    if (!RawCriteriaEvaluationService.instance) {
      RawCriteriaEvaluationService.instance = new RawCriteriaEvaluationService();
    }
    return RawCriteriaEvaluationService.instance;
  }

  /**
   * Evaluate Raw Criteria (C1-C6) for a specific zone ID
   * 
   * @param {string} zoneId 
   * @param {Object} options
   * @param {string} options.timeSlot - Optional time slot ('pagi', 'siang', 'sore', 'malam')
   * @param {number} options.riderLat - Optional dynamic origin latitude
   * @param {number} options.riderLon - Optional dynamic origin longitude
   * @returns {Promise<Object>} Formatted DSS-CRITERIA-v1.0 Raw Evaluation Object
   */
  async evaluateZoneRawCriteria(zoneId, options = {}) {
    const zone = await ZoneModel.findById(zoneId);
    if (!zone) {
      const error = new Error(`Zona dengan ID '${zoneId}' tidak ditemukan.`);
      error.statusCode = 404;
      throw error;
    }

    const evaluatedAt = new Date();
    const activeSlot = options.timeSlot || TimeSlotEvaluator.getSlot(evaluatedAt);
    const { riderLat = null, riderLon = null } = options;

    // 1. Fetch C1 & C2 (Density & Diversity)
    const c1c2Res = await poiRepository.getDensitasDanDiversitasByZonePolygon(zone.polygon);
    const c1Val = parseInt(c1c2Res?.skor_c1 || 0, 10);
    const c2Val = parseInt(c1c2Res?.skor_c2 || 0, 10);

    // 2. Fetch C3 (Time Crowd Score + Detailed Breakdown)
    const c3Res = await poiTimeCrowdService.calculateZoneC3Score(zone.polygon, activeSlot);
    const c3Details = await poiRepository.getTimeCrowdDetailsByZonePolygon(zone.polygon, activeSlot);
    const c3Val = parseFloat((c3Res?.total_c3_score || 0).toFixed(2));

    // 3. Fetch C4 (Weather Risk Cost)
    const c4Res = await poiWeatherService.calculateZoneC4Score(zone.id, evaluatedAt);
    const c4Val = parseFloat((c4Res?.skor_c4 ?? c4Res?.max_precipitation_probability ?? 0).toFixed(2));

    // 4. Fetch C5 (Distance Cost to Zone Centroid)
    const c5Res = await poiDistanceService.calculateZoneC5Score(zone.id, riderLat, riderLon);
    const c5Val = parseFloat((c5Res?.skor_c5 ?? c5Res?.distance_km ?? 0).toFixed(2));

    // 5. Fetch C6 (Market Competition Index Cost)
    const c6Res = await poiCompetitorService.getZoneC6Score(zone.id);
    const c6Val = parseInt(c6Res?.skor_c6 || 0, 10);

    // Format Competitor Details with Threat Level explicitly
    const formattedCompetitors = (c6Res?.details || []).map((comp) => ({
      id: comp.id,
      name: comp.name,
      category: comp.category,
      source: comp.source, // 'SURVEY' vs 'POI_AUTOMATED'
      threat_level: parseInt(comp.weight || 1, 10),
      latitude: comp.latitude,
      longitude: comp.longitude,
    }));

    return {
      zone_id: zone.id,
      zone_name: zone.name,
      evaluation_version: "DSS-CRITERIA-v1.0",
      evaluated_at: evaluatedAt.toISOString(),
      time_slot: activeSlot,
      criteria: {
        C1: {
          code: "C1",
          name: "Densitas POI",
          type: "BENEFIT",
          raw_value: c1Val,
          unit: "POI",
          details: { total_distinct_logical_pois: c1Val },
        },
        C2: {
          code: "C2",
          name: "Diversitas POI",
          type: "BENEFIT",
          raw_value: c2Val,
          unit: "CATEGORY",
          details: { total_distinct_active_categories: c2Val },
        },
        C3: {
          code: "C3",
          name: "Keramaian Waktu",
          type: "BENEFIT",
          raw_value: c3Val,
          unit: "SCORE",
          details: c3Details,
        },
        C4: {
          code: "C4",
          name: "Kondisi Cuaca",
          type: "COST",
          raw_value: c4Val,
          unit: "PERCENT",
          details: {
            source: "Open-Meteo API",
            max_precipitation_probability: c4Val,
            avg_precipitation_probability: c4Res?.avg_precipitation_probability || 0,
            weather_condition: c4Res?.supporting_info?.weather_condition || "Normal",
            risk_level: c4Val > 60 ? "HIGH" : c4Val > 30 ? "MEDIUM" : "LOW",
            operational_hours_window: c4Res?.operational_hours_window || "06:00 - 21:00",
          },
        },
        C5: {
          code: "C5",
          name: "Jarak Aksesibilitas",
          type: "COST",
          raw_value: c5Val,
          unit: "KM",
          details: {
            distance_meters: c5Res?.distance_meters || 0,
            centroid: c5Res?.centroid || { latitude: 0, longitude: 0 },
            origin: c5Res?.origin || { type: "HUB_DEFAULT_LOCATION", latitude: 0, longitude: 0 },
          },
        },
        C6: {
          code: "C6",
          name: "Tingkat Persaingan",
          type: "COST",
          raw_value: c6Val,
          unit: "INDEX",
          details: formattedCompetitors,
        },
      },
    };
  }

  /**
   * Evaluate Raw Criteria for all active zones
   */
  async evaluateAllActiveZonesRawCriteria(options = {}) {
    const activeZones = await ZoneModel.findAll({ status: "ACTIVE" });
    const results = [];
    for (const zone of activeZones) {
      const rawEval = await this.evaluateZoneRawCriteria(zone.id, options);
      results.push(rawEval);
    }
    return results;
  }
}

export const rawCriteriaEvaluationService = RawCriteriaEvaluationService.getInstance();
