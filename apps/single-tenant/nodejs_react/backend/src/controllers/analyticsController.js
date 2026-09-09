/*
 * analyticsController.js
 * HTTP Controller for Milestone B-12: Reporting, Supervisor KPI & Plan-vs-Actual Analytics Layer
 * Pure read-only aggregation layer delegating 100% to Domain Services.
 */

import { reportingService } from "../services/analytics/ReportingService.js";
import { operationalAnalyticsService } from "../services/analytics/OperationalAnalyticsService.js";
import { complianceAnalyticsService } from "../services/analytics/ComplianceAnalyticsService.js";
import { salesAnalyticsService } from "../services/analytics/SalesAnalyticsService.js";
import { dssPerformanceService } from "../services/analytics/DSSPerformanceService.js";

/**
 * Get Unified Dashboard Overview (RBAC projected)
 * GET /api/analytics/overview
 */
export const getDashboardOverview = async (req, res) => {
  try {
    const userRole = req.user?.role || "SUPERVISOR";
    const { date, start_date, end_date, zone_id, rider_id } = req.query;

    const result = await reportingService.getUnifiedDashboardOverview(userRole, {
      date,
      startDate: start_date,
      endDate: end_date,
      zoneId: zone_id,
      riderId: rider_id,
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

/**
 * Get Operational Lifecycle & Fleet Summary
 * GET /api/analytics/operational/summary
 */
export const getOperationalSummary = async (req, res) => {
  try {
    const { date, start_date, end_date, zone_id } = req.query;
    const result = await operationalAnalyticsService.getOperationalSummary({
      date,
      startDate: start_date,
      endDate: end_date,
      zoneId: zone_id,
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

/**
 * Get Fleet Utilization Breakdown
 * GET /api/analytics/operational/fleet-utilization
 */
export const getFleetUtilization = async (req, res) => {
  try {
    const result = await operationalAnalyticsService.getFleetUtilization();
    return res.status(200).json({
      status: "success",
      data: result,
    });
  } catch (error) {
    const statusCode = error.statusCode || 500;
    return res.status(statusCode).json({ msg: error.message || "Internal server error" });
  }
};

/**
 * Get Spatial Compliance & Prohibited Road Alerts
 * GET /api/analytics/compliance/summary
 */
export const getComplianceSummary = async (req, res) => {
  try {
    const { date, start_date, end_date, zone_id, rider_id } = req.query;
    const result = await complianceAnalyticsService.getComplianceSummary({
      date,
      startDate: start_date,
      endDate: end_date,
      zoneId: zone_id,
      riderId: rider_id,
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

/**
 * Get Commercial & Sales Performance
 * GET /api/analytics/sales/performance
 */
export const getSalesPerformance = async (req, res) => {
  try {
    const { range, date, start_date, end_date, zone_id, rider_id } = req.query;
    const result = await salesAnalyticsService.getSalesPerformance({
      range,
      date,
      startDate: start_date,
      endDate: end_date,
      zoneId: zone_id,
      riderId: rider_id,
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

/**
 * Get Plan-vs-Actual DSS Effectiveness Analysis
 * GET /api/analytics/dss/plan-vs-actual
 */
export const getDSSPlanVsActual = async (req, res) => {
  try {
    const { date, start_date, end_date, distribution_run_id, dss_history_id } = req.query;
    const result = await dssPerformanceService.getPlanVsActualAnalysis({
      date,
      startDate: start_date,
      endDate: end_date,
      distributionRunId: distribution_run_id,
      dssHistoryId: dss_history_id,
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

/**
 * Get Daily Operational Report (JSON or CSV Export)
 * GET /api/analytics/reports/daily-summary
 */
export const getDailyReport = async (req, res) => {
  try {
    const { date, zone_id, format } = req.query;
    const targetDate = date || new Date().toISOString().split("T")[0];

    if (format === "csv") {
      const csvData = await reportingService.generateDailyReportCSV({
        targetDate,
        zoneId: zone_id,
      });

      res.setHeader("Content-Type", "text/csv; charset=utf-8");
      res.setHeader("Content-Disposition", `attachment; filename="mova_daily_report_${targetDate}.csv"`);
      return res.status(200).send(csvData);
    }

    const report = await reportingService.getDailyOperationalReport({
      targetDate,
      zoneId: zone_id,
    });

    return res.status(200).json({
      status: "success",
      data: report,
    });
  } catch (error) {
    const statusCode = error.statusCode || 500;
    return res.status(statusCode).json({ msg: error.message || "Internal server error" });
  }
};
