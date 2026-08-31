/*
 * dssController.ts
 * HTTP Controller for BWM Engine & TOPSIS Recommendation Engine in TypeScript
 */

import type { Request, Response } from "express";
import { pool } from "../config/database.js";
import { bwmWeightService } from "../services/dss/BwmWeightService.js";
import { topsisEngineService } from "../services/dss/TopsisEngineService.js";
import { rawCriteriaEvaluationService } from "../services/dss/RawCriteriaEvaluationService.js";
import { hybridBwmTopsisService } from "../services/dss/HybridBwmTopsisService.js";
import { bwmRepository } from "../repositories/bwmRepository.js";

export const calculateBwmWeights = async (req: Request, res: Response): Promise<any> => {
  try {
    const { name, best_criteria_id, worst_criteria_id, best_to_others, worst_to_others } = req.body;

    const { rows: criteriaList } = await pool.query("SELECT id, name, type FROM criterias WHERE is_active = true ORDER BY name ASC;");

    if (criteriaList.length === 0) {
      const error: any = new Error("Tabel kriteria (criterias) belum terisi.");
      error.statusCode = 404;
      throw error;
    }

    const formattedCriteria = criteriaList.map((c: any, idx: number) => ({
      ...c,
      code: `C${idx + 1}`,
    }));

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
  } catch (error: any) {
    const statusCode = error.statusCode || 500;
    return res.status(statusCode).json({ msg: error.message || "Internal server error" });
  }
};

export const getActiveDssConfig = async (req: Request, res: Response): Promise<any> => {
  try {
    const config = await bwmRepository.findActiveConfig();
    return res.status(200).json({ config });
  } catch (error: any) {
    const statusCode = error.statusCode || 500;
    return res.status(statusCode).json({ msg: error.message || "Internal server error" });
  }
};

export const getAllDssConfigs = async (req: Request, res: Response): Promise<any> => {
  try {
    const configs = await bwmRepository.findAllConfigs();
    return res.status(200).json({ configs });
  } catch (error: any) {
    const statusCode = error.statusCode || 500;
    return res.status(statusCode).json({ msg: error.message || "Internal server error" });
  }
};

export const getZoneRawEvaluation = async (req: Request, res: Response): Promise<any> => {
  try {
    const id = req.params.id as string;
    const { time, lat, lon } = req.query as { time?: string; lat?: string; lon?: string };

    const result = await rawCriteriaEvaluationService.evaluateZoneRawCriteria(id, {
      timeSlot: time || undefined,
      riderLat: lat ? parseFloat(lat) : null,
      riderLon: lon ? parseFloat(lon) : null,
    });

    return res.status(200).json({
      status: "success",
      data: result,
    });
  } catch (error: any) {
    const statusCode = error.statusCode || 500;
    return res.status(statusCode).json({ msg: error.message || "Internal server error" });
  }
};

export const evaluateHybridBwmTopsis = async (req: Request, res: Response): Promise<any> => {
  try {
    const { zone_ids, time_slot, lat, lon, bwm_config_id } = req.body;

    const result = await hybridBwmTopsisService.evaluateZonesHybrid({
      zone_ids: zone_ids || null,
      time_slot: time_slot || null,
      rider_lat: lat ? parseFloat(lat) : null,
      rider_lon: lon ? parseFloat(lon) : null,
      bwm_config_id: bwm_config_id || null,
      save_snapshot: true,
    });

    return res.status(200).json({
      status: "success",
      data: result,
    });
  } catch (error: any) {
    const statusCode = error.statusCode || 500;
    return res.status(statusCode).json({ msg: error.message || "Internal server error" });
  }
};

export const getDssSnapshots = async (req: Request, res: Response): Promise<any> => {
  try {
    const limit = req.query.limit ? parseInt(String(req.query.limit), 10) : 20;
    const snapshots = await hybridBwmTopsisService.getSnapshots(limit);
    return res.status(200).json({
      status: "success",
      data: snapshots,
    });
  } catch (error: any) {
    const statusCode = error.statusCode || 500;
    return res.status(statusCode).json({ msg: error.message || "Internal server error" });
  }
};

export const getDssSnapshotById = async (req: Request, res: Response): Promise<any> => {
  try {
    const id = req.params.id as string;
    const snapshot = await hybridBwmTopsisService.getSnapshotById(id);
    return res.status(200).json({
      status: "success",
      data: snapshot,
    });
  } catch (error: any) {
    const statusCode = error.statusCode || 500;
    return res.status(statusCode).json({ msg: error.message || "Internal server error" });
  }
};

export const getTopsisRecommendations = async (req: Request, res: Response): Promise<any> => {
  try {
    const { time, lat, lon } = req.query as { time?: string; lat?: string; lon?: string };
    const riderId = req.user?.id || (req.user as any)?.userId || null;

    const result = await topsisEngineService.calculateTopsisRecommendations({
      timeSlot: time || "pagi",
      riderLat: lat ? parseFloat(lat) : null,
      riderLon: lon ? parseFloat(lon) : null,
      riderId,
    });

    return res.status(200).json(result);
  } catch (error: any) {
    const statusCode = error.statusCode || 500;
    return res.status(statusCode).json({ msg: error.message || "Internal server error" });
  }
};
