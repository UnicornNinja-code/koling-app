/*
 * dssService.ts
 * Decision Support System (BWM-TOPSIS) REST Service
 */

import { axiosInstance } from "../lib/axios";

export interface BwmWeights {
  [criterion: string]: number;
}

export interface ActiveDssConfig {
  id?: string;
  best_criterion: string;
  worst_criterion: string;
  weights: BwmWeights;
  consistency_ratio: number;
  is_consistent: boolean;
  calculated_at?: string;
  version?: number;
}

export interface TopsisRanking {
  zone_id: string;
  zone_name: string;
  preference_score: number;
  rank: number;
  d_plus?: number;
  d_minus?: number;
}

export interface TopsisRecommendationResponse {
  time_slot: string;
  weight_source: string;
  rankings: TopsisRanking[];
}

export const dssService = {
  getActiveConfig: async (): Promise<ActiveDssConfig> => {
    const res = await axiosInstance.get("/dss/bwm/active");
    return res.data?.data || res.data;
  },

  calculateBwmWeights: async (payload: {
    bestCriterion: string;
    worstCriterion: string;
    bestToOthers: Record<string, number>;
    othersToWorst: Record<string, number>;
  }): Promise<{
    weights: BwmWeights;
    consistencyRatio: number;
    isConsistent: boolean;
  }> => {
    const res = await axiosInstance.post("/dss/bwm/calculate", payload);
    return res.data?.data || res.data;
  },

  getRecommendations: async (timeSlot?: string): Promise<TopsisRecommendationResponse> => {
    const params = timeSlot ? { timeSlot } : {};
    const res = await axiosInstance.get("/dss/recommendations", { params });
    return res.data?.data || res.data;
  },
};
