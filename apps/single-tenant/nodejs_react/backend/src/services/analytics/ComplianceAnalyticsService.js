/*
 * ComplianceAnalyticsService.js
 * Domain Service for Milestone B-12: Spatial Geofence Compliance & Road Restriction Analytics
 * Distinguishes continuous telemetry observations from discrete transition events.
 */

import { analyticsRepository } from "../../repositories/analyticsRepository.js";
import { formatMetric, DATA_STATUS } from "./AnalyticsContract.js";

export class ComplianceAnalyticsService {
  static instance = null;

  constructor(repo = analyticsRepository) {
    if (ComplianceAnalyticsService.instance && repo === analyticsRepository) {
      return ComplianceAnalyticsService.instance;
    }
    this.repo = repo;
    if (repo === analyticsRepository) {
      ComplianceAnalyticsService.instance = this;
    }
  }

  static getInstance(repo = analyticsRepository) {
    if (!ComplianceAnalyticsService.instance) {
      ComplianceAnalyticsService.instance = new ComplianceAnalyticsService(repo);
    }
    return ComplianceAnalyticsService.instance;
  }

  /**
   * Fetch spatial compliance summary metrics
   */
  async getComplianceSummary({ startDate, endDate, date, zoneId = null, riderId = null } = {}) {
    const targetStartDate = startDate || date || new Date().toISOString().split("T")[0];
    const targetEndDate = endDate || date || targetStartDate;

    const data = await this.repo.getComplianceMetrics({
      startDate: targetStartDate,
      endDate: targetEndDate,
      zoneId,
      riderId,
    });

    const tel = data.telemetry;
    const totalSamples = tel.total_telemetry_samples || 0;
    const compliantSamples = tel.compliant_samples || 0;
    const deviatedSamples = tel.deviated_samples || 0;
    const outsideSamples = tel.outside_zone_samples || 0;

    const hasData = totalSamples > 0;

    return {
      time_window: {
        start_date: targetStartDate,
        end_date: targetEndDate,
      },
      data_status: hasData ? DATA_STATUS.COMPLETE : DATA_STATUS.NO_DATA,
      telemetry_kpis: {
        total_samples: totalSamples,
        zone_compliance_rate: hasData
          ? formatMetric((compliantSamples / totalSamples) * 100, totalSamples, "%")
          : { value: null, formatted: "N/A", data_status: DATA_STATUS.NO_DATA, unit: "%" },
        deviation_rate: hasData
          ? formatMetric((deviatedSamples / totalSamples) * 100, totalSamples, "%")
          : { value: null, formatted: "N/A", data_status: DATA_STATUS.NO_DATA, unit: "%" },
        outside_zone_rate: hasData
          ? formatMetric((outsideSamples / totalSamples) * 100, totalSamples, "%")
          : { value: null, formatted: "N/A", data_status: DATA_STATUS.NO_DATA, unit: "%" },
        prohibited_road_alerts_count: tel.prohibited_road_alerts_count || 0,
      },
      discrete_events: data.discrete_events,
    };
  }
}

export const complianceAnalyticsService = ComplianceAnalyticsService.getInstance();
