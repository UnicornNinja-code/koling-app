/*
 *   Copyright (c) 2026 
 *   All rights reserved.
 *   dssController.js (HTTP Controller for BWM Engine & TOPSIS Recommendation Engine)
 */

import { bwmWeightService } from "../services/dss/BwmWeightService.js";
import { topsisEngineService } from "../services/dss/TopsisEngineService.js";
import { rawCriteriaEvaluationService } from "../services/dss/RawCriteriaEvaluationService.js";
import { hybridBwmTopsisService } from "../services/dss/HybridBwmTopsisService.js";
import { bwmRepository } from "../repositories/bwmRepository.js";
import { TimeSlotEvaluator } from "../utils/TimeSlotEvaluator.js";

export const calculateBwmWeights = async (req, res) => {
  try {
    const { name, best_criteria_id, worst_criteria_id, best_to_others, worst_to_others } = req.body;

    // 1. Fetch active criteria list from database via repository
    const criteriaList = await bwmRepository.findActiveCriterias();

    if (criteriaList.length === 0) {
      const error = new Error("Tabel kriteria (criterias) belum terisi.");
      error.statusCode = 404;
      throw error;
    }

    // Assign code (C1..Cn) dynamically if not present
    const formattedCriteria = criteriaList.map((c, idx) => ({
      ...c,
      code: `C${idx + 1}`,
    }));

    // 2. Compute BWM Optimal Weights & Consistency Check
    const result = bwmWeightService.calculateBwmWeights({
      best_criteria_id,
      worst_criteria_id,
      best_to_others,
      worst_to_others,
      criteria_list: formattedCriteria,
    });

    if (!result.is_consistent) {
      return res.status(400).json({
        msg: `Penilaian preferensi BWM tidak konsisten (CR = ${result.consistency_ratio.toFixed(4)} > 0.10). Harap tinjau ulang preferensi perbandingan di UI.`,
        result,
      });
    }

    // 3. Save BWM configuration to PostgreSQL
    const savedConfig = await bwmRepository.saveBwmConfig({
      name: name || "Konfigurasi Bobot BWM Sidoarjo",
      best_criteria_id,
      worst_criteria_id,
      best_to_others,
      worst_to_others,
      calculated_weights: result.weights,
      consistency_ratio: result.consistency_ratio,
    });

    return res.status(200).json({
      msg: "Komputasi bobot BWM optimal berhasil dan konsisten (CR <= 0.10).",
      config: savedConfig,
      bwm_result: result,
    });
  } catch (error) {
    const statusCode = error.statusCode || 500;
    return res.status(statusCode).json({ msg: error.message || "Internal server error" });
  }
};

export const getActiveDssConfig = async (req, res) => {
  try {
    const activeConfig = await bwmRepository.findActiveConfig();
    if (!activeConfig) {
      return res.status(404).json({ msg: "Belum ada konfigurasi BWM aktif yang tersimpan." });
    }
    return res.status(200).json({ config: activeConfig });
  } catch (error) {
    const statusCode = error.statusCode || 500;
    return res.status(statusCode).json({ msg: error.message || "Internal server error" });
  }
};

export const getAllBwmConfigs = async (req, res) => {
  try {
    const configs = await bwmRepository.findAllConfigs();
    return res.status(200).json({ configs });
  } catch (error) {
    const statusCode = error.statusCode || 500;
    return res.status(statusCode).json({ msg: error.message || "Internal server error" });
  }
};

export const activateBwmConfig = async (req, res) => {
  try {
    const { id } = req.params;
    const activated = await bwmRepository.activateConfig(id);
    return res.status(200).json({
      msg: "Konfigurasi BWM berhasil diaktifkan.",
      config: activated,
    });
  } catch (error) {
    const statusCode = error.statusCode || 500;
    return res.status(statusCode).json({ msg: error.message || "Internal server error" });
  }
};

export const previewBwmImpact = async (req, res) => {
  try {
    const { weights, best_criteria_id, worst_criteria_id, best_to_others, worst_to_others, time_slot } = req.body;
    const slot = time_slot ? TimeSlotEvaluator.getSlot(time_slot) : TimeSlotEvaluator.getSlot(new Date());

    let customWeights = weights || null;

    // Jika user mengirimkan perbandingan BWM langsung untuk di-preview sebelum disimpan
    if (!customWeights && best_criteria_id && worst_criteria_id && best_to_others && worst_to_others) {
      const criteriaList = await bwmRepository.findActiveCriterias();
      const formattedCriteria = criteriaList.map((c, idx) => ({ ...c, code: `C${idx + 1}` }));
      
      const bwmRes = bwmWeightService.calculateBwmWeights({
        best_criteria_id,
        worst_criteria_id,
        best_to_others,
        worst_to_others,
        criteria_list: formattedCriteria,
      });
      customWeights = bwmRes.weights;
    }

    const result = await topsisEngineService.calculateTopsisRecommendations({
      timeSlot: slot,
      customWeights,
    });

    return res.status(200).json({
      status: "success",
      time_slot: slot,
      rankings: result.rankings || [],
      total_zones: result.total_evaluated_zones || result.rankings?.length || 0,
    });
  } catch (error) {
    const statusCode = error.statusCode || 500;
    return res.status(statusCode).json({ msg: error.message || "Internal server error" });
  }
};

export const getZoneRawEvaluation = async (req, res) => {
  try {
    const { id } = req.params;
    const { time, lat, lon } = req.query;
    const slot = time ? TimeSlotEvaluator.getSlot(time) : TimeSlotEvaluator.getSlot(new Date());

    const result = await rawCriteriaEvaluationService.evaluateZoneRawCriteria(id, {
      timeSlot: slot,
      riderLat: lat ? parseFloat(lat) : null,
      riderLon: lon ? parseFloat(lon) : null,
    });

    return res.status(200).json({
      status: "success",
      data: result,
    });
  } catch (error) {
    const statusCode = error.statusCode || 500;
    return res.status(statusCode).json({ msg: error.message || "Internal server error" });
  }
};

export const evaluateHybridBwmTopsis = async (req, res) => {
  try {
    const { zone_ids, time_slot, lat, lon, bwm_config_id } = req.body;
    const slot = time_slot ? TimeSlotEvaluator.getSlot(time_slot) : TimeSlotEvaluator.getSlot(new Date());

    const result = await hybridBwmTopsisService.evaluateZonesHybrid({
      zone_ids: zone_ids || null,
      time_slot: slot,
      rider_lat: lat ? parseFloat(lat) : null,
      rider_lon: lon ? parseFloat(lon) : null,
      bwm_config_id: bwm_config_id || null,
      save_snapshot: true,
    });

    return res.status(200).json({
      status: "success",
      data: result,
    });
  } catch (error) {
    const statusCode = error.statusCode || 500;
    return res.status(statusCode).json({ msg: error.message || "Internal server error" });
  }
};

export const getDssSnapshots = async (req, res) => {
  try {
    const limit = req.query.limit ? parseInt(req.query.limit) : 20;
    const snapshots = await hybridBwmTopsisService.getSnapshots(limit);
    return res.status(200).json({
      status: "success",
      data: snapshots,
    });
  } catch (error) {
    const statusCode = error.statusCode || 500;
    return res.status(statusCode).json({ msg: error.message || "Internal server error" });
  }
};

export const getDssSnapshotById = async (req, res) => {
  try {
    const { id } = req.params;
    const snapshot = await hybridBwmTopsisService.getSnapshotById(id);
    return res.status(200).json({
      status: "success",
      data: snapshot,
    });
  } catch (error) {
    const statusCode = error.statusCode || 500;
    return res.status(statusCode).json({ msg: error.message || "Internal server error" });
  }
};

export const getTopsisRecommendations = async (req, res) => {
  try {
    const { time, lat, lon } = req.query;
    const riderId = req.user?.id || req.user?.userId || null;
    const slot = time ? TimeSlotEvaluator.getSlot(time) : TimeSlotEvaluator.getSlot(new Date());

    const result = await topsisEngineService.calculateTopsisRecommendations({
      timeSlot: slot,
      riderLat: lat ? parseFloat(lat) : null,
      riderLon: lon ? parseFloat(lon) : null,
      riderId,
    });

    return res.status(200).json(result);
  } catch (error) {
    const statusCode = error.statusCode || 500;
    return res.status(statusCode).json({ msg: error.message || "Internal server error" });
  }
};
