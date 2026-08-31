/*
 *   Copyright (c) 2026 
 *   All rights reserved.
 *   dashboardController.js (HTTP Controller for Dashboard Analytics Endpoints)
 */

import { dashboardService } from "../services/dashboard/DashboardService.js";

export const getSummary = async (req, res) => {
  try {
    const userRole = req.user.role;
    const { date } = req.query;

    const summary = await dashboardService.getDashboardSummary(userRole, { date });

    return res.status(200).json({
      status: "success",
      data: summary,
    });
  } catch (error) {
    const statusCode = error.statusCode || 500;
    return res.status(statusCode).json({ msg: error.message || "Internal server error" });
  }
};

export const getSalesTrend = async (req, res) => {
  try {
    const userRole = req.user.role;
    const { range, start_date, end_date } = req.query;

    const trend = await dashboardService.getSalesTrend(userRole, {
      range,
      startDate: start_date,
      endDate: end_date,
    });

    return res.status(200).json({
      status: "success",
      data: trend,
    });
  } catch (error) {
    const statusCode = error.statusCode || 500;
    return res.status(statusCode).json({ msg: error.message || "Internal server error" });
  }
};

export const getZonePerformance = async (req, res) => {
  try {
    const userRole = req.user.role;
    const { date } = req.query;

    const performance = await dashboardService.getZonePerformance(userRole, { date });

    return res.status(200).json({
      status: "success",
      data: performance,
    });
  } catch (error) {
    const statusCode = error.statusCode || 500;
    return res.status(statusCode).json({ msg: error.message || "Internal server error" });
  }
};

export const getProductPerformance = async (req, res) => {
  try {
    const userRole = req.user.role;
    const { range, start_date, end_date } = req.query;

    const performance = await dashboardService.getProductPerformance(userRole, {
      range,
      startDate: start_date,
      endDate: end_date,
    });

    return res.status(200).json({
      status: "success",
      data: performance,
    });
  } catch (error) {
    const statusCode = error.statusCode || 500;
    return res.status(statusCode).json({ msg: error.message || "Internal server error" });
  }
};
