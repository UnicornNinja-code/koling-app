/*
 *   Copyright (c) 2026 
 *   All rights reserved.
 *   DashboardService.js (Domain Service for Dashboard Analytics & Role-Based Scoping)
 */

import { dashboardRepository } from "../../repositories/dashboardRepository.js";
import { topsisEngineService } from "../dss/TopsisEngineService.js";
import { TimeSlotEvaluator } from "../../utils/TimeSlotEvaluator.js";

export class DashboardService {
  static instance = null;

  constructor(repo = dashboardRepository) {
    if (DashboardService.instance && repo === dashboardRepository) {
      return DashboardService.instance;
    }
    this.repo = repo;
    if (repo === dashboardRepository) {
      DashboardService.instance = this;
    }
  }

  static getInstance(repo = dashboardRepository) {
    if (!DashboardService.instance) {
      DashboardService.instance = new DashboardService(repo);
    }
    return DashboardService.instance;
  }

  /**
   * Helper: Convert date string (or now) to UTC boundaries representing full day in Asia/Jakarta (WIB UTC+7)
   */
  getJakartaDateBoundaries(dateString = null) {
    let targetDateStr = dateString;
    if (!targetDateStr) {
      // Current date formatted in Asia/Jakarta
      const nowJakarta = new Intl.DateTimeFormat("en-CA", {
        timeZone: "Asia/Jakarta",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      }).format(new Date());
      targetDateStr = nowJakarta;
    }

    // Start of day in Jakarta (00:00:00+07) -> UTC is previous day 17:00:00
    const startWib = new Date(`${targetDateStr}T00:00:00+07:00`);
    // End of day in Jakarta (next day 00:00:00+07)
    const nextDay = new Date(startWib.getTime() + 24 * 60 * 60 * 1000);

    return {
      targetDate: targetDateStr,
      startTimestamp: startWib.toISOString(),
      endTimestamp: nextDay.toISOString(),
    };
  }

  /**
   * Helper: Convert date range (e.g. 7d, 30d, or custom) to UTC boundaries
   */
  getJakartaRangeBoundaries(range = "7d", startDate = null, endDate = null) {
    const todayJakarta = new Intl.DateTimeFormat("en-CA", {
      timeZone: "Asia/Jakarta",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(new Date());

    let finalStartStr = startDate;
    let finalEndStr = endDate || todayJakarta;

    if (!finalStartStr) {
      const endWib = new Date(`${finalEndStr}T00:00:00+07:00`);
      let days = 7;
      if (range === "30d") days = 30;
      if (range === "this_month") {
        const [year, month] = finalEndStr.split("-");
        finalStartStr = `${year}-${month}-01`;
      } else {
        const startWib = new Date(endWib.getTime() - (days - 1) * 24 * 60 * 60 * 1000);
        finalStartStr = startWib.toISOString().split("T")[0];
      }
    }

    const startTimestamp = new Date(`${finalStartStr}T00:00:00+07:00`).toISOString();
    const endNextDay = new Date(new Date(`${finalEndStr}T00:00:00+07:00`).getTime() + 24 * 60 * 60 * 1000);
    const endTimestamp = endNextDay.toISOString();

    return {
      startDate: finalStartStr,
      endDate: finalEndStr,
      startTimestamp,
      endTimestamp,
    };
  }

  /**
   * Fetch Deterministic Top 1 DSS Zone
   */
  async getTopDssZone() {
    try {
      const currentSlot = TimeSlotEvaluator.getSlot(new Date());
      const topsisResult = await topsisEngineService.calculateTopsisRecommendations({
        timeSlot: currentSlot,
      });

      if (topsisResult && topsisResult.rankings && topsisResult.rankings.length > 0) {
        const top = topsisResult.rankings[0];
        return {
          zone_id: top.zone_id,
          zone_name: top.zone_name,
          preference_score: top.preference_score,
          rank: 1,
          time_slot: currentSlot,
          weight_source: topsisResult.weight_source,
        };
      }
    } catch (err) {
      console.warn("⚠️ Top DSS recommendation fallback:", err.message);
    }
    return null;
  }

  /**
   * Get Unified Executive / Operational Dashboard Summary
   */
  async getDashboardSummary(userRole, { date } = {}) {
    if (userRole === "RIDER") {
      const error = new Error("Rider tidak memiliki otorisasi untuk mengakses Dashboard.");
      error.statusCode = 403;
      throw error;
    }

    const { targetDate, startTimestamp, endTimestamp } = this.getJakartaDateBoundaries(date);

    const [kpis, topDssZone] = await Promise.all([
      this.repo.getExecutiveKpis({ startTimestamp, endTimestamp, targetDate }),
      this.getTopDssZone(),
    ]);

    // Role-based data scoping
    if (userRole === "SUPERVISOR") {
      // Supervisor receives operational & fleet data with operational sales metrics (no financial revenue / AOV)
      return {
        date: targetDate,
        role_scope: "OPERATIONAL_SUPERVISOR",
        operations: kpis.operations,
        fleet: kpis.fleet,
        top_dss_zone: topDssZone,
        operational_sales: {
          total_transactions: kpis.financials.total_transactions,
          total_units_sold: kpis.financials.total_units_sold,
        },
      };
    }

    // Superadmin & Management receive full executive financial and operational data
    return {
      date: targetDate,
      role_scope: "EXECUTIVE_MANAGEMENT",
      financials: kpis.financials,
      operations: kpis.operations,
      fleet: kpis.fleet,
      top_dss_zone: topDssZone,
    };
  }

  /**
   * Get Sales Trend Time-Series Data
   */
  async getSalesTrend(userRole, { range = "7d", startDate, endDate } = {}) {
    if (userRole === "RIDER") {
      const error = new Error("Rider tidak memiliki otorisasi untuk mengakses Sales Trend.");
      error.statusCode = 403;
      throw error;
    }

    const { startDate: sDate, endDate: eDate, startTimestamp, endTimestamp } = this.getJakartaRangeBoundaries(
      range,
      startDate,
      endDate
    );

    const trend = await this.repo.getSalesTrend({ startTimestamp, endTimestamp });

    if (userRole === "SUPERVISOR") {
      // Supervisor receives volume trend without revenue figures
      return {
        range,
        start_date: sDate,
        end_date: eDate,
        data: trend.map((t) => ({
          date: t.date,
          total_transactions: t.total_transactions,
          total_units_sold: t.total_units_sold,
        })),
      };
    }

    return {
      range,
      start_date: sDate,
      end_date: eDate,
      data: trend,
    };
  }

  /**
   * Get Zone Performance Breakdown
   */
  async getZonePerformance(userRole, { date } = {}) {
    if (userRole === "RIDER") {
      const error = new Error("Rider tidak memiliki otorisasi untuk mengakses Zone Performance.");
      error.statusCode = 403;
      throw error;
    }

    const { targetDate, startTimestamp, endTimestamp } = this.getJakartaDateBoundaries(date);

    const zones = await this.repo.getZonePerformanceMetrics({
      startTimestamp,
      endTimestamp,
      targetDate,
    });

    if (userRole === "SUPERVISOR") {
      // Supervisor receives occupancy, riders, and sales counts without monetary revenue
      return {
        date: targetDate,
        zones: zones.map((z) => ({
          zone_id: z.zone_id,
          zone_name: z.zone_name,
          zone_status: z.zone_status,
          max_capacity: z.max_capacity,
          assigned_riders: z.assigned_riders,
          checked_in_riders: z.checked_in_riders,
          remaining_capacity: z.remaining_capacity,
          occupancy_rate_percentage: z.occupancy_rate_percentage,
          total_transactions: z.total_transactions,
          total_units_sold: z.total_units_sold,
        })),
      };
    }

    return {
      date: targetDate,
      zones,
    };
  }

  /**
   * Get Product Performance Breakdown (Management & Superadmin Only)
   */
  async getProductPerformance(userRole, { range = "30d", startDate, endDate } = {}) {
    if (userRole !== "SUPERADMIN" && userRole !== "MANAGEMENT") {
      const error = new Error("Hanya Superadmin dan Management yang memiliki akses ke analitik performa produk.");
      error.statusCode = 403;
      throw error;
    }

    const { startDate: sDate, endDate: eDate, startTimestamp, endTimestamp } = this.getJakartaRangeBoundaries(
      range,
      startDate,
      endDate
    );

    const products = await this.repo.getProductPerformanceMetrics({
      startTimestamp,
      endTimestamp,
    });

    return {
      range,
      start_date: sDate,
      end_date: eDate,
      products,
    };
  }
}

export const dashboardService = DashboardService.getInstance();
