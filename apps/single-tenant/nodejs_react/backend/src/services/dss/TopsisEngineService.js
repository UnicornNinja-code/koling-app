/*
 *   Copyright (c) 2026 
 *   All rights reserved.
 *   TopsisEngineService.js (Clean Architecture Singleton Engine for TOPSIS Zone Recommendation)
 *   References: Hwang, C.L. & Yoon, K. (1981). Multiple Attribute Decision Making.
 */

import { topsisRepository } from "../../repositories/topsisRepository.js";
import { bwmRepository } from "../../repositories/bwmRepository.js";
import { poiRepository } from "../../repositories/poiRepository.js";
import { poiTimeCrowdService } from "../poi/POITimeCrowdService.js";
import { poiWeatherService } from "../poi/POIWeatherService.js";
import { poiDistanceService } from "../poi/POIDistanceService.js";
import { poiCompetitorService } from "../poi/POICompetitorService.js";

export class TopsisEngineService {
  static instance = null;

  constructor(repo = topsisRepository) {
    if (TopsisEngineService.instance && repo === topsisRepository) {
      return TopsisEngineService.instance;
    }
    this.repo = repo;
    if (repo === topsisRepository) {
      TopsisEngineService.instance = this;
    }
  }

  static getInstance() {
    if (!TopsisEngineService.instance) {
      TopsisEngineService.instance = new TopsisEngineService();
    }
    return TopsisEngineService.instance;
  }

  /**
   * Calculate TOPSIS Zone Recommendations across all 6 Criteria (C1-C6)
   * 
   * @param {Object} options
   * @param {string} options.timeSlot - Operational time slot ('pagi', 'siang', 'sore', 'malam')
   * @param {number} options.riderLat - Optional dynamic rider latitude
   * @param {number} options.riderLon - Optional dynamic rider longitude
   * @param {string} options.riderId - Optional rider user ID for saving recommendations
   */
  async calculateTopsisRecommendations(options = {}) {
    const { TimeSlotEvaluator } = await import("../../utils/TimeSlotEvaluator.js");
    const activeSlot = options.timeSlot || TimeSlotEvaluator.getSlot(new Date());
    const { riderLat = null, riderLon = null, riderId = null } = options;

    console.log("\n================================================================================");
    console.log("🚀 [TOPSIS ENGINE] MEMULAI REKOMENDASI LOKASI DSS ZONA (TOPSIS PIPELINE)");
    console.log("================================================================================");
    console.log(`📌 Time Slot Operasional : ${activeSlot.toUpperCase()} (BERDASARKAN WAKTU AKTUAL SAAT INI)`);
    console.log(`📌 Lokasi Asal Evaluasi  : ${riderLat && riderLon ? `LIVE RIDER (${riderLat}, ${riderLon})` : 'DEFAULT HUB UTAMA SIDOARJO'}`);
    console.log("--------------------------------------------------------------------------------");

    // --- STEP 0: FETCH ACTIVE BWM WEIGHTS & ACTIVE ZONES ---
    const activeBwmConfig = await bwmRepository.findActiveConfig();
    const activeZones = await this.repo.findAllActiveZones();

    if (!activeZones || activeZones.length === 0) {
      const error = new Error("Tidak ada data Zona Operasional yang aktif di database.");
      error.statusCode = 404;
      throw error;
    }

    // Default criteria weights fallback if BWM config is not set (Equal Weights 1/6 = 0.1667)
    let weights = {
      C1: 0.1667, C2: 0.1667, C3: 0.1667,
      C4: 0.1667, C5: 0.1667, C6: 0.1667,
    };

    if (activeBwmConfig && activeBwmConfig.best_to_others && activeBwmConfig.worst_to_others) {
      const { pool } = await import("../../config/database.js");
      const { bwmWeightService } = await import("./BwmWeightService.js");
      const { rows: dbCriteria } = await pool.query("SELECT id, name, type FROM criterias WHERE is_active = true ORDER BY name ASC;");
      const formattedCriteria = dbCriteria.map((c, idx) => ({ ...c, code: `C${idx + 1}` }));

      const bwmRes = bwmWeightService.calculateBwmWeights({
        best_criteria_id: activeBwmConfig.best_criteria_id,
        worst_criteria_id: activeBwmConfig.worst_criteria_id,
        best_to_others: activeBwmConfig.best_to_others,
        worst_to_others: activeBwmConfig.worst_to_others,
        criteria_list: formattedCriteria,
      });

      dbCriteria.forEach((c, idx) => {
        const code = `C${idx + 1}`;
        if (bwmRes.weights[c.id] !== undefined) {
          weights[code] = bwmRes.weights[c.id];
        }
      });
      console.log(`✅ Menggunakan Bobot BWM Optimal dari Database Config: "${activeBwmConfig.name}" (CR = ${bwmRes.consistency_ratio.toFixed(4)})`);
    } else {
      console.log("ℹ️ Belum ada konfigurasi BWM aktif. Menggunakan Bobot Equal Fallback (1/6 = 16.67%).");
    }

    // Criteria Metadata Specification (C1-C6)
    const criteriaSpecs = [
      { code: "C1", name: "Densitas POI", type: "BENEFIT", weight: weights.C1 || weights["c1-id"] || 0.1667 },
      { code: "C2", name: "Diversitas POI", type: "BENEFIT", weight: weights.C2 || weights["c2-id"] || 0.1667 },
      { code: "C3", name: "Keramaian Waktu", type: "BENEFIT", weight: weights.C3 || weights["c3-id"] || 0.1667 },
      { code: "C4", name: "Kondisi Cuaca (Hujan)", type: "COST", weight: weights.C4 || weights["c4-id"] || 0.1667 },
      { code: "C5", name: "Jarak Boundary (KM)", type: "COST", weight: weights.C5 || weights["c5-id"] || 0.1667 },
      { code: "C6", name: "Dampak Kompetitor", type: "COST", weight: weights.C6 || weights["c6-id"] || 0.1667 },
    ];

    // --- STEP 1: CONSTRUCT DECISION MATRIX (X_m x 6) ---
    console.log("\n📋 [LANGKAH 1] MENYUSUN MATRIKS KEPUTUSAN (X_m x 6) SPASIAL POSTGIS:");
    console.log("--------------------------------------------------------------------------------");

    const m = activeZones.length;
    const n = criteriaSpecs.length;
    const rawMatrix = []; // X_m x n

    for (let i = 0; i < m; i++) {
      const zone = activeZones[i];

      // Fetch C1 & C2
      const c1c2Res = await poiRepository.getDensitasDanDiversitasByZonePolygon(zone.polygon);
      const c1Val = c1c2Res?.skor_c1 || 0;
      const c2Val = c1c2Res?.skor_c2 || 0;

      // Fetch C3
      const c3Res = await poiTimeCrowdService.calculateZoneC3Score(zone.polygon, activeSlot);
      const c3Val = c3Res?.total_c3_score || 0;

      // Fetch C4
      const c4Res = await poiWeatherService.calculateZoneC4Score(zone.id, activeSlot);
      const c4Val = c4Res?.skor_c4 ?? c4Res?.max_precipitation_probability ?? 0;

      // Fetch C5
      const c5Res = await poiDistanceService.calculateZoneC5Score(zone.id, riderLat, riderLon);
      const c5Val = c5Res?.skor_c5 ?? c5Res?.distance_km ?? 0;

      // Fetch C6
      const c6Res = await poiCompetitorService.getZoneC6Score(zone.id);
      const c6Val = c6Res?.skor_c6 || 0;

      const zoneRow = {
        zone_id: zone.id,
        zone_name: zone.name,
        scores: {
          C1: c1Val,
          C2: c2Val,
          C3: c3Val,
          C4: c4Val,
          C5: c5Val,
          C6: c6Val,
        },
      };

      rawMatrix.push(zoneRow);

      console.log(`   • [Zona ${i + 1}] ${zone.name.padEnd(28)} | C1:${c1Val.toString().padStart(3)} | C2:${c2Val.toString().padStart(3)} | C3:${c3Val.toFixed(1).padStart(5)} | C4:${c4Val.toFixed(0).padStart(3)}% | C5:${c5Val.toFixed(2).padStart(5)}km | C6:${c6Val.toString().padStart(3)}`);
    }

    // --- STEP 2: VECTOR NORMALIZATION MATRIX (R_m x 6) ---
    console.log("\n📐 [LANGKAH 2] MENORMALISASI MATRIKS KEPUTUSAN (R_m x 6) (r_ij = x_ij / sqrt(sum(x_kj^2))):");
    console.log("--------------------------------------------------------------------------------");

    // Calculate sum of squares for each column j
    const sumSquares = {};
    criteriaSpecs.forEach((crit) => {
      let sumSq = 0;
      for (let i = 0; i < m; i++) {
        const val = rawMatrix[i].scores[crit.code] || 0;
        sumSq += val * val;
      }
      sumSquares[crit.code] = Math.sqrt(sumSq);
    });

    const normalizedMatrix = []; // R_m x n
    for (let i = 0; i < m; i++) {
      const normRow = { zone_id: rawMatrix[i].zone_id, zone_name: rawMatrix[i].zone_name, r: {} };
      criteriaSpecs.forEach((crit) => {
        const denom = sumSquares[crit.code];
        normRow.r[crit.code] = denom > 0 ? rawMatrix[i].scores[crit.code] / denom : 0;
      });
      normalizedMatrix.push(normRow);
      console.log(`   • [Normalized ${i + 1}] ${normRow.zone_name.padEnd(24)} | C1:${normRow.r.C1.toFixed(4)} | C2:${normRow.r.C2.toFixed(4)} | C3:${normRow.r.C3.toFixed(4)} | C4:${normRow.r.C4.toFixed(4)} | C5:${normRow.r.C5.toFixed(4)} | C6:${normRow.r.C6.toFixed(4)}`);
    }

    // --- STEP 3: WEIGHTED NORMALIZED MATRIX (V_m x 6) ---
    console.log("\n⚖️ [LANGKAH 3] MEMBENTUK MATRIKS TERBOBOT (V_m x 6) (y_ij = w_j * r_ij):");
    console.log("--------------------------------------------------------------------------------");

    const weightedMatrix = []; // V_m x n
    for (let i = 0; i < m; i++) {
      const weightRow = { zone_id: normalizedMatrix[i].zone_id, zone_name: normalizedMatrix[i].zone_name, y: {} };
      criteriaSpecs.forEach((crit) => {
        weightRow.y[crit.code] = normRowValue(normalizedMatrix[i].r[crit.code]) * (crit.weight || (1 / n));
      });
      weightedMatrix.push(weightRow);
      console.log(`   • [Weighted ${i + 1}] ${weightRow.zone_name.padEnd(26)} | C1:${weightRow.y.C1.toFixed(4)} | C2:${weightRow.y.C2.toFixed(4)} | C3:${weightRow.y.C3.toFixed(4)} | C4:${weightRow.y.C4.toFixed(4)} | C5:${weightRow.y.C5.toFixed(4)} | C6:${weightRow.y.C6.toFixed(4)}`);
    }

    // --- STEP 4: POSITIVE (A+) AND NEGATIVE (A-) IDEAL SOLUTIONS ---
    console.log("\n⭐ [LANGKAH 4] MENENTUKAN SOLUSI IDEAL POSITIF (A+) DAN NEGATIF (A-):");
    console.log("--------------------------------------------------------------------------------");

    const idealPositive = {}; // A+
    const idealNegative = {}; // A-

    criteriaSpecs.forEach((crit) => {
      const colValues = weightedMatrix.map((row) => row.y[crit.code]);
      const maxVal = Math.max(...colValues);
      const minVal = Math.min(...colValues);

      if (crit.type === "BENEFIT") {
        idealPositive[crit.code] = maxVal;
        idealNegative[crit.code] = minVal;
      } else {
        // COST Criteria
        idealPositive[crit.code] = minVal;
        idealNegative[crit.code] = maxVal;
      }
      console.log(`   • [${crit.code}] (${crit.type.padEnd(7)}) -> Ideal Positif (A+): ${idealPositive[crit.code].toFixed(4)} | Ideal Negatif (A-): ${idealNegative[crit.code].toFixed(4)}`);
    });

    // --- STEP 5: EUCLIDEAN DISTANCES (D+ & D-) ---
    console.log("\n📏 [LANGKAH 5] MENGHITUNG JARAK EUCLIDEAN TERHADAP SOLUSI IDEAL (D+ & D-):");
    console.log("--------------------------------------------------------------------------------");

    const distanceResults = [];
    for (let i = 0; i < m; i++) {
      let sumSqPos = 0;
      let sumSqNeg = 0;

      criteriaSpecs.forEach((crit) => {
        const yVal = weightedMatrix[i].y[crit.code];
        const diffPos = yVal - idealPositive[crit.code];
        const diffNeg = yVal - idealNegative[crit.code];

        sumSqPos += diffPos * diffPos;
        sumSqNeg += diffNeg * diffNeg;
      });

      const dPos = Math.sqrt(sumSqPos);
      const dNeg = Math.sqrt(sumSqNeg);

      distanceResults.push({
        zone_id: weightedMatrix[i].zone_id,
        zone_name: weightedMatrix[i].zone_name,
        d_pos: dPos,
        d_neg: dNeg,
      });

      console.log(`   • [Dist ${i + 1}] ${weightedMatrix[i].zone_name.padEnd(28)} | D+ (Jarak ke Ideal Positif): ${dPos.toFixed(4)} | D- (Jarak ke Ideal Negatif): ${dNeg.toFixed(4)}`);
    }

    // --- STEP 6: PREFERENCE SCORE (V_i = D- / (D+ + D-)) & RANKING ---
    console.log("\n🏆 [LANGKAH 6] MENGHITUNG NILAI PREFERENSI AKHIR (V_i = D- / (D+ + D-)) & PERANKINGAN:");
    console.log("================================================================================");

    const finalRankings = distanceResults.map((item) => {
      const denom = item.d_pos + item.d_neg;
      const preferenceScore = denom > 0 ? item.d_neg / denom : 0;
      return {
        zone_id: item.zone_id,
        zone_name: item.zone_name,
        preference_score: parseFloat(preferenceScore.toFixed(4)),
        d_pos: parseFloat(item.d_pos.toFixed(4)),
        d_neg: parseFloat(item.d_neg.toFixed(4)),
      };
    });

    // Deterministic sort descending by preference_score (Rank 1, Rank 2, ...), then zone_name/zone_id
    finalRankings.sort((a, b) => {
      if (Math.abs(b.preference_score - a.preference_score) > 1e-9) {
        return b.preference_score - a.preference_score;
      }
      return String(a.zone_name).localeCompare(String(b.zone_name)) || String(a.zone_id).localeCompare(String(b.zone_id));
    });
    finalRankings.forEach((item, index) => {
      item.rank = index + 1;
      const scorePct = (item.preference_score * 100).toFixed(2);
      console.log(`   🥇 RANK ${item.rank} : ${item.zone_name.padEnd(30)} | Skor Preferensi (V_i): ${item.preference_score.toFixed(4)} (${scorePct}%)`);
    });
    console.log("================================================================================");

    const weightSource = activeBwmConfig ? "BWM" : "EQUAL_FALLBACK";

    // Save Execution History to Database
    await this.repo.saveExecutionHistory({
      rider_id: riderId,
      consistency_ratio: activeBwmConfig?.consistency_ratio || 0,
      status: "COMPLETED",
      details: {
        time_slot: activeSlot,
        weight_source: weightSource,
        weights,
        criteria_specs: criteriaSpecs,
        decision_matrix: rawMatrix,
        ideal_positive: idealPositive,
        ideal_negative: idealNegative,
      },
      rankings: finalRankings,
    });

    return {
      message: "Proses Komputasi TOPSIS Rekomendasi Lokasi Berhasil Selesai.",
      time_slot: activeSlot,
      weight_source: weightSource,
      total_evaluated_zones: m,
      ideal_positive: idealPositive,
      ideal_negative: idealNegative,
      rankings: finalRankings,
    };
  }

  /**
   * Pure TOPSIS Engine Matrix Evaluation (Reusable for Zone or Candidate Matrix)
   * Standard: Hwang & Yoon (1981), DSS-BWM-TOPSIS-CONTRACT-v1.0
   * 
   * @param {Array<Object>} rawMatrix - Array of objects [{ id/zone_id, name/zone_name, scores: { C1, C2, C3, C4, C5, C6 } }]
   * @param {Array<Object>} criteriaSpecs - Array of objects [{ code: 'C1', type: 'BENEFIT'|'COST', weight: number }]
   */
  calculateTopsisForMatrix(rawMatrix = [], criteriaSpecs = []) {
    const m = rawMatrix.length;
    const n = criteriaSpecs.length;

    if (m === 0) {
      return {
        total_alternatives: 0,
        decision_matrix: [],
        normalized_matrix: [],
        weighted_matrix: [],
        ideal_positive: {},
        ideal_negative: {},
        distances: [],
        rankings: [],
      };
    }

    // Step 1: Decision Matrix X
    const formattedRawMatrix = rawMatrix.map((item) => ({
      id: item.id || item.zone_id,
      name: item.name || item.zone_name,
      scores: { ...(item.scores || item.raw_scores || {}) },
    }));

    // Step 2: Calculate sum of squares & zero-variance discriminating metadata per column j
    const sumSquares = {};
    const columnMetadata = {};

    criteriaSpecs.forEach((crit) => {
      let sumSq = 0;
      const colValues = [];

      for (let i = 0; i < m; i++) {
        const val = parseFloat(formattedRawMatrix[i].scores[crit.code] || 0);
        colValues.push(val);
        sumSq += val * val;
      }

      const mean = colValues.reduce((acc, curr) => acc + curr, 0) / (m || 1);
      const variance = colValues.reduce((acc, curr) => acc + Math.pow(curr - mean, 2), 0) / (m || 1);

      sumSquares[crit.code] = Math.sqrt(sumSq);
      columnMetadata[crit.code] = {
        code: crit.code,
        name: crit.name || crit.code,
        type: crit.type,
        weight: crit.weight || 0,
        variance,
        discriminating: variance > 1e-9, // False if all raw values in column are identical
        sum_squares: sumSq,
      };
    });

    // Step 3: Euclidean Vector Normalization (Matrix R)
    const normalizedMatrix = [];
    for (let i = 0; i < m; i++) {
      const normRow = { id: formattedRawMatrix[i].id, name: formattedRawMatrix[i].name, r: {} };
      criteriaSpecs.forEach((crit) => {
        const denom = sumSquares[crit.code];
        const rawVal = parseFloat(formattedRawMatrix[i].scores[crit.code] || 0);
        normRow.r[crit.code] = denom > 0 ? rawVal / denom : 0;
      });
      normalizedMatrix.push(normRow);
    }

    // Step 4: Weighted Normalization Matrix (Matrix V)
    const weightedMatrix = [];
    for (let i = 0; i < m; i++) {
      const weightRow = { id: normalizedMatrix[i].id, name: normalizedMatrix[i].name, y: {} };
      criteriaSpecs.forEach((crit) => {
        const rVal = normRowValue(normalizedMatrix[i].r[crit.code]);
        const wVal = parseFloat(crit.weight || (1 / (n || 1)));
        weightRow.y[crit.code] = rVal * wVal;
      });
      weightedMatrix.push(weightRow);
    }

    // Step 5: Positive Ideal (A+) and Negative Ideal (A-) Solutions
    const idealPositive = {};
    const idealNegative = {};

    criteriaSpecs.forEach((crit) => {
      const colValues = weightedMatrix.map((row) => row.y[crit.code]);
      const maxVal = Math.max(...colValues);
      const minVal = Math.min(...colValues);

      if (crit.type === "BENEFIT") {
        idealPositive[crit.code] = maxVal;
        idealNegative[crit.code] = minVal;
      } else {
        // COST Criteria
        idealPositive[crit.code] = minVal;
        idealNegative[crit.code] = maxVal;
      }
    });

    // Step 6: Euclidean Distances (D+ & D-)
    const distanceResults = [];
    for (let i = 0; i < m; i++) {
      let sumSqPos = 0;
      let sumSqNeg = 0;

      criteriaSpecs.forEach((crit) => {
        const yVal = weightedMatrix[i].y[crit.code];
        const diffPos = yVal - idealPositive[crit.code];
        const diffNeg = yVal - idealNegative[crit.code];

        sumSqPos += diffPos * diffPos;
        sumSqNeg += diffNeg * diffNeg;
      });

      const dPos = Math.sqrt(sumSqPos);
      const dNeg = Math.sqrt(sumSqNeg);

      distanceResults.push({
        id: weightedMatrix[i].id,
        name: weightedMatrix[i].name,
        d_pos: dPos,
        d_neg: dNeg,
      });
    }

    // Step 7: Preference Score (C_i = D- / (D+ + D-)) & Deterministic Ranking
    const finalRankings = distanceResults.map((item) => {
      let preferenceScore = 0;
      if (m === 1) {
        // Single zone edge case: deterministically preference score = 1.0000
        preferenceScore = 1.0;
      } else {
        const denom = item.d_pos + item.d_neg;
        preferenceScore = denom > 0 ? item.d_neg / denom : 0;
      }

      return {
        id: item.id,
        name: item.name,
        preference_score: parseFloat(preferenceScore.toFixed(4)),
        preference_score_full: preferenceScore,
        d_pos: parseFloat(item.d_pos.toFixed(4)),
        d_neg: parseFloat(item.d_neg.toFixed(4)),
        d_pos_full: item.d_pos,
        d_neg_full: item.d_neg,
      };
    });

    // Deterministic sort: preference_score DESC, then id ASC
    finalRankings.sort((a, b) => {
      if (Math.abs(b.preference_score_full - a.preference_score_full) > 1e-9) {
        return b.preference_score_full - a.preference_score_full;
      }
      return String(a.id).localeCompare(String(b.id));
    });

    finalRankings.forEach((item, index) => {
      item.rank = index + 1;
    });

    return {
      total_alternatives: m,
      column_metadata: columnMetadata,
      decision_matrix: formattedRawMatrix,
      normalized_matrix: normalizedMatrix,
      weighted_matrix: weightedMatrix,
      ideal_positive: idealPositive,
      ideal_negative: idealNegative,
      distances: distanceResults,
      rankings: finalRankings,
    };
  }
}

function normRowValue(val) {
  return isNaN(val) ? 0 : val;
}

export const topsisEngineService = TopsisEngineService.getInstance();
