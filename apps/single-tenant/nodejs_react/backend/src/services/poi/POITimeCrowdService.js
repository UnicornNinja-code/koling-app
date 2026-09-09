/*
 * POITimeCrowdService.js
 * Singleton Service for C3 Criteria (Time-based Crowd Score) Management & Zone Evaluation.
 */

import { PoiCategoryModel } from "../../models/poiCategoryModel.js";
import { poiRepository } from "../../repositories/poiRepository.js";
import { TimeSlotEvaluator } from "../../utils/TimeSlotEvaluator.js";

export class POITimeCrowdService {
  static instance = null;

  constructor() {
    if (POITimeCrowdService.instance) {
      return POITimeCrowdService.instance;
    }
    POITimeCrowdService.instance = this;
  }

  static getInstance() {
    if (!POITimeCrowdService.instance) {
      POITimeCrowdService.instance = new POITimeCrowdService();
    }
    return POITimeCrowdService.instance;
  }

  /**
   * Helper to validate single Likert rating (must be integer 1 to 5)
   */
  validateLikertScore(score, scoreName) {
    if (score !== undefined && score !== null) {
      const num = Number(score);
      if (!Number.isInteger(num) || num < 1 || num > 5) {
        const error = new Error(`Nilai ${scoreName} harus berupa angka bulat antara 1 dan 5 (Skala Likert).`);
        error.statusCode = 400;
        throw error;
      }
      return num;
    }
    return undefined;
  }

  /**
   * Update time-based crowd scores for a single category by ID
   */
  async updateCategoryTimeScores(categoryId, { score_pagi, score_siang, score_sore, score_malam }) {
    const category = await PoiCategoryModel.findById(categoryId);
    if (!category) {
      const error = new Error(`Kategori POI dengan ID '${categoryId}' tidak ditemukan.`);
      error.statusCode = 404;
      throw error;
    }

    const validatedPagi = this.validateLikertScore(score_pagi, "score_pagi");
    const validatedSiang = this.validateLikertScore(score_siang, "score_siang");
    const validatedSore = this.validateLikertScore(score_sore, "score_sore");
    const validatedMalam = this.validateLikertScore(score_malam, "score_malam");

    const updatedCategory = await PoiCategoryModel.updateTimeScores(categoryId, {
      score_pagi: validatedPagi,
      score_siang: validatedSiang,
      score_sore: validatedSore,
      score_malam: validatedMalam,
    });

    return updatedCategory;
  }

  /**
   * Bulk update time-based crowd scores for multiple categories
   */
  async bulkUpdateCategoryTimeScores(items) {
    if (!Array.isArray(items) || items.length === 0) {
      const error = new Error("Data bulk update harus berupa array berisi objek kategori POI.");
      error.statusCode = 400;
      throw error;
    }

    const validatedItems = items.map((item, index) => {
      if (!item.id && !item.name) {
        const error = new Error(`Item pada index ${index} harus menyertakan 'id' atau 'name'.`);
        error.statusCode = 400;
        throw error;
      }

      return {
        id: item.id,
        name: item.name,
        score_pagi: this.validateLikertScore(item.score_pagi, `score_pagi (item ${index})`),
        score_siang: this.validateLikertScore(item.score_siang, `score_siang (item ${index})`),
        score_sore: this.validateLikertScore(item.score_sore, `score_sore (item ${index})`),
        score_malam: this.validateLikertScore(item.score_malam, `score_malam (item ${index})`),
      };
    });

    const updated = await PoiCategoryModel.bulkUpdateTimeScores(validatedItems);
    return updated;
  }

  /**
   * Calculate dynamic C3 score for a given zone polygon and time
   */
  async calculateZoneC3Score(zonePolygon, timeInput) {
    const activeSlot = TimeSlotEvaluator.getSlot(timeInput);
    const result = await poiRepository.getTimeCrowdScoreByZonePolygon(zonePolygon, activeSlot);

    return {
      active_time_slot: activeSlot,
      total_pois: result.total_pois,
      total_c3_score: Math.round((result.total_c3_score || 0) * 100) / 100,
      avg_c3_score: Math.round((result.avg_c3_score || 0) * 100) / 100,
      is_off_hours: activeSlot === "off_hours",
    };
  }
}

export const poiTimeCrowdService = POITimeCrowdService.getInstance();
