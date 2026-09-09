/*
 * HybridBwmTopsisService.js
 * Domain Service for DSS Phase 2C — Hybrid BWM-TOPSIS Integration Engine (DSS-HYBRID-BWM-TOPSIS-v1.0)
 * Orchestrates: RawCriteriaEvaluationService -> BWM Weight Service -> TOPSIS Engine Service.
 */

import { ZoneModel } from "../../models/zoneModel.js";
import { rawCriteriaEvaluationService } from "./RawCriteriaEvaluationService.js";
import { topsisEngineService } from "./TopsisEngineService.js";
import { bwmRepository } from "../../repositories/bwmRepository.js";
import { topsisRepository } from "../../repositories/topsisRepository.js";
import { pool } from "../../config/database.js";
import { TimeSlotEvaluator } from "../../utils/TimeSlotEvaluator.js";

export class HybridBwmTopsisService {
  static instance = null;

  constructor() {
    if (HybridBwmTopsisService.instance) {
      return HybridBwmTopsisService.instance;
    }
    HybridBwmTopsisService.instance = this;
  }

  static getInstance() {
    if (!HybridBwmTopsisService.instance) {
      HybridBwmTopsisService.instance = new HybridBwmTopsisService();
    }
    return HybridBwmTopsisService.instance;
  }

  /**
   * Execute Hybrid BWM-TOPSIS Zone Evaluation for user-selected zone IDs
   * 
   * @param {Object} options
   * @param {Array<string>} options.zone_ids - List of selected zone IDs to compare
   * @param {string} options.time_slot - Operational time slot ('pagi', 'siang', 'sore', 'malam')
   * @param {number} options.rider_lat - Optional dynamic origin latitude
   * @param {number} options.rider_lon - Optional dynamic origin longitude
   * @param {string} options.bwm_config_id - Optional BWM configuration ID to use
   * @returns {Promise<Object>} Formatted DSS-HYBRID-BWM-TOPSIS-v1.0 Response Object
   */
  async evaluateZonesHybrid(options = {}) {
    const evaluatedAt = new Date();
    const activeSlot = options.time_slot || TimeSlotEvaluator.getSlot(evaluatedAt);
    const { zone_ids = null, rider_lat = null, rider_lon = null, bwm_config_id = null } = options;

    // --- STEP 1: FETCH RAW CRITERIA EVALUATIONS FOR SELECTED ZONES ---
    let targetZoneIds = [];
    if (Array.isArray(zone_ids) && zone_ids.length > 0) {
      targetZoneIds = zone_ids;
    } else {
      const activeZones = await ZoneModel.findAll({ status: "ACTIVE" });
      targetZoneIds = activeZones.map((z) => z.id);
    }

    let rawEvaluations = [];
    const excludedZones = [];

    for (const zid of targetZoneIds) {
      const zone = await ZoneModel.findById(zid);
      if (!zone) continue;

      if (zone.status === "RESTRICTED" || zone.status === "INACTIVE") {
        excludedZones.push({
          zone_id: zone.id,
          zone_name: zone.name,
          status: zone.status,
          reason: `Zona tidak dapat digunakan sebagai alternatif DSS karena berstatus '${zone.status}'.`,
        });
        continue;
      }

      const evalRes = await rawCriteriaEvaluationService.evaluateZoneRawCriteria(zid, {
        timeSlot: activeSlot,
        riderLat: rider_lat,
        riderLon: rider_lon,
      });
      rawEvaluations.push(evalRes);
    }

    if (rawEvaluations.length === 0) {
      const error = new Error("Tidak ada data Zona Operasional AKTIF yang dapat dievaluasi (semua zona terdekat berstatus RESTRICTED/INACTIVE).");
      error.statusCode = 422;
      throw error;
    }

    // --- STEP 2: FETCH ACTIVE BWM CONFIGURATION & WEIGHTS ---
    let bwmConfig = null;
    if (bwm_config_id) {
      bwmConfig = await bwmRepository.findConfigById(bwm_config_id);
    }
    if (!bwmConfig) {
      bwmConfig = await bwmRepository.findActiveConfig();
    }

    // Default criteria weights fallback if BWM config is not set (Equal Weights 1/6)
    let weights = {
      C1: 1 / 6, C2: 1 / 6, C3: 1 / 6,
      C4: 1 / 6, C5: 1 / 6, C6: 1 / 6,
    };

    let bwmMetadata = {
      id: bwmConfig?.id || "DEFAULT_EQUAL_WEIGHTS",
      name: bwmConfig?.name || "Equal Weights Fallback (1/6)",
      weight_source: bwmConfig ? "BWM" : "EQUAL_FALLBACK",
      best_criteria_id: bwmConfig?.best_criteria_id || null,
      worst_criteria_id: bwmConfig?.worst_criteria_id || null,
      consistency_ratio: bwmConfig?.consistency_ratio || 0,
      is_consistent: bwmConfig ? (bwmConfig.consistency_ratio <= 0.10) : true,
      weights,
    };

    if (bwmConfig && bwmConfig.best_to_others && bwmConfig.worst_to_others) {
      const { bwmWeightService } = await import("./BwmWeightService.js");
      const { rows: dbCriteria } = await pool.query("SELECT id, name, type FROM criterias WHERE is_active = true ORDER BY name ASC;");
      const formattedCriteria = dbCriteria.map((c, idx) => ({ ...c, code: `C${idx + 1}` }));

      const bwmRes = bwmWeightService.calculateBwmWeights({
        best_criteria_id: bwmConfig.best_criteria_id,
        worst_criteria_id: bwmConfig.worst_criteria_id,
        best_to_others: bwmConfig.best_to_others,
        worst_to_others: bwmConfig.worst_to_others,
        criteria_list: formattedCriteria,
      });

      dbCriteria.forEach((c, idx) => {
        const code = `C${idx + 1}`;
        if (bwmRes.weights[c.id] !== undefined) {
          weights[code] = bwmRes.weights[c.id];
        }
      });

      bwmMetadata.weights = weights;
      bwmMetadata.consistency_ratio = bwmRes.consistency_ratio;
      bwmMetadata.is_consistent = bwmRes.is_consistent;
    }

    // --- STEP 3: CONSTRUCT CRITERIA METADATA SPECS (C1-C6) ---
    const criteriaSpecs = [
      { code: "C1", name: "Densitas POI", type: "BENEFIT", weight: weights.C1 || (1 / 6) },
      { code: "C2", name: "Diversitas POI", type: "BENEFIT", weight: weights.C2 || (1 / 6) },
      { code: "C3", name: "Keramaian Waktu", type: "BENEFIT", weight: weights.C3 || (1 / 6) },
      { code: "C4", name: "Risiko Cuaca", type: "COST", weight: weights.C4 || (1 / 6) },
      { code: "C5", name: "Jarak Aksesibilitas Centroid", type: "COST", weight: weights.C5 || (1 / 6) },
      { code: "C6", name: "Indeks Persaingan Pasar", type: "COST", weight: weights.C6 || (1 / 6) },
    ];

    // --- STEP 4: CONSTRUCT RAW DECISION MATRIX X ---
    const rawMatrix = rawEvaluations.map((ev) => ({
      id: ev.zone_id,
      name: ev.zone_name,
      scores: {
        C1: ev.criteria.C1.raw_value,
        C2: ev.criteria.C2.raw_value,
        C3: ev.criteria.C3.raw_value,
        C4: ev.criteria.C4.raw_value,
        C5: ev.criteria.C5.raw_value,
        C6: ev.criteria.C6.raw_value,
      },
    }));

    // --- STEP 5: EXECUTE PURE TOPSIS MATRIX EVALUATION ---
    const topsisRes = topsisEngineService.calculateTopsisForMatrix(rawMatrix, criteriaSpecs);

    // --- STEP 6: CONSTRUCT END-TO-END TRACEABLE RESPONSE OBJECT ---
    const traceableRankings = topsisRes.rankings.map((rk) => {
      const rawObj = rawEvaluations.find((ev) => ev.zone_id === rk.id);
      const normRow = topsisRes.normalized_matrix.find((n) => n.id === rk.id);
      const weightRow = topsisRes.weighted_matrix.find((w) => w.id === rk.id);

      return {
        rank: rk.rank,
        zone_id: rk.id,
        zone_name: rk.name,
        preference_score: rk.preference_score,
        preference_score_full: rk.preference_score_full,
        d_pos: rk.d_pos,
        d_neg: rk.d_neg,
        traceability: {
          raw_criteria: rawObj ? rawObj.criteria : {},
          normalized_r: normRow ? normRow.r : {},
          weighted_v: weightRow ? weightRow.y : {},
        },
      };
    });

    const evaluationResult = {
      evaluation_version: "DSS-HYBRID-BWM-TOPSIS-v1.1",
      evaluated_at: evaluatedAt.toISOString(),
      time_slot: activeSlot,
      total_evaluated_zones: rawEvaluations.length,
      excluded_zones: excludedZones,
      bwm_config: bwmMetadata,
      criteria_specs: criteriaSpecs,
      topsis_summary: {
        ideal_positive: topsisRes.ideal_positive,
        ideal_negative: topsisRes.ideal_negative,
        column_metadata: topsisRes.column_metadata,
        rankings: traceableRankings,
      },
    };

    // Save evaluation snapshot to backend PostgreSQL database if requested or by default
    if (options.save_snapshot !== false) {
      try {
        const savedHistory = await topsisRepository.saveExecutionHistory({
          consistency_ratio: bwmMetadata.consistency_ratio,
          status: "COMPLETED",
          details: evaluationResult,
          rankings: traceableRankings,
        });
        evaluationResult.snapshot_id = savedHistory.history?.id || null;
      } catch (saveErr) {
        console.warn("⚠️ Warning: Gagal menyimpan snapshot evaluasi ke database:", saveErr.message);
      }
    }

    return evaluationResult;
  }

  /**
   * Fetch recent Evaluation Snapshots from Database
   */
  async getSnapshots(limit = 20) {
    const histories = await topsisRepository.findHistories(limit);
    return histories.map((h) => {
      let detailsObj = h.details;
      if (typeof detailsObj === "string") {
        try { detailsObj = JSON.parse(detailsObj); } catch (e) {}
      }
      return {
        id: h.id,
        created_at: h.created_at,
        consistency_ratio: h.consistency_ratio,
        status: h.status,
        evaluation_version: detailsObj?.evaluation_version || "DSS-HYBRID-BWM-TOPSIS-v1.1",
        time_slot: detailsObj?.time_slot || "unknown",
        total_evaluated_zones: detailsObj?.total_evaluated_zones || 0,
        bwm_config_name: detailsObj?.bwm_config?.name || "Standard Profile",
        top_ranking_zone: detailsObj?.topsis_summary?.rankings?.[0]?.zone_name || "N/A",
        details: detailsObj,
      };
    });
  }

  /**
   * Fetch single Evaluation Snapshot by ID from Database
   */
  async getSnapshotById(id) {
    const history = await topsisRepository.findHistoryById(id);
    if (!history) {
      const error = new Error(`Snapshot evaluasi dengan ID '${id}' tidak ditemukan.`);
      error.statusCode = 404;
      throw error;
    }

    let detailsObj = history.details;
    if (typeof detailsObj === "string") {
      try { detailsObj = JSON.parse(detailsObj); } catch (e) {}
    }

    return {
      id: history.id,
      created_at: history.created_at,
      consistency_ratio: history.consistency_ratio,
      status: history.status,
      snapshot_data: detailsObj,
    };
  }
}

export const hybridBwmTopsisService = HybridBwmTopsisService.getInstance();
