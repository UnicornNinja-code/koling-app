/*
 *   Copyright (c) 2026 
 *   All rights reserved.
 *   distributionController.js (HTTP Controller for Rider Distribution Engine & Queue Management)
 */

import { distributionService } from "../services/distribution/DistributionService.js";

export const confirmDuty = async (req, res) => {
  try {
    const riderId = req.user?.id || req.body?.rider_id;
    if (!riderId) {
      return res.status(400).json({ msg: "Rider ID harus disertakan." });
    }

    const queueEntry = await distributionService.confirmRiderDuty(riderId);
    return res.status(200).json({
      status: "success",
      msg: "Konfirmasi kesediaan bertugas berhasil. Rider telah masuk ke Antrean FIFO.",
      queue: queueEntry,
    });
  } catch (error) {
    const statusCode = error.statusCode || 500;
    return res.status(statusCode).json({ msg: error.message || "Internal server error" });
  }
};

export const getRiderDutyStatus = async (req, res) => {
  try {
    const riderId = req.user?.id || req.query?.rider_id;
    if (!riderId) {
      return res.status(400).json({ msg: "Rider ID harus disertakan." });
    }

    const status = await distributionService.getRiderOperationalStatus(riderId);
    return res.status(200).json({
      status: "success",
      data: status,
    });
  } catch (error) {
    const statusCode = error.statusCode || 500;
    return res.status(statusCode).json({ msg: error.message || "Internal server error" });
  }
};

export const getDistributionOverview = async (req, res) => {
  try {
    const { time } = req.query;
    const overview = await distributionService.getDistributionOverview(time);
    return res.status(200).json({
      status: "success",
      data: overview,
    });
  } catch (error) {
    const statusCode = error.statusCode || 500;
    return res.status(statusCode).json({ msg: error.message || "Internal server error" });
  }
};

export const autoDistribute = async (req, res) => {
  try {
    const executedBy = req.user?.id || null;
    const { time } = req.body || {};
    const result = await distributionService.autoDistributeRiders(executedBy, time);
    return res.status(200).json({
      status: "success",
      ...result,
    });
  } catch (error) {
    const statusCode = error.statusCode || 500;
    return res.status(statusCode).json({ msg: error.message || "Internal server error" });
  }
};

export const manualDistribute = async (req, res) => {
  try {
    const { rider_id, zone_id, time } = req.body;
    const assignedBy = req.user?.id || null;

    const result = await distributionService.manualDistributeRider({
      riderId: rider_id,
      zoneId: zone_id,
      assignedBy,
      timeInput: time,
    });

    return res.status(200).json({
      status: "success",
      ...result,
    });
  } catch (error) {
    const statusCode = error.statusCode || 500;
    return res.status(statusCode).json({ msg: error.message || "Internal server error" });
  }
};

export const getDistributionRuns = async (req, res) => {
  try {
    const limit = req.query.limit ? parseInt(req.query.limit, 10) : 20;
    const runs = await distributionService.getDistributionRuns(limit);
    return res.status(200).json({
      status: "success",
      data: runs,
    });
  } catch (error) {
    const statusCode = error.statusCode || 500;
    return res.status(statusCode).json({ msg: error.message || "Internal server error" });
  }
};

export const getDistributionRunById = async (req, res) => {
  try {
    const { id } = req.params;
    const run = await distributionService.getDistributionRunById(id);
    return res.status(200).json({
      status: "success",
      data: run,
    });
  } catch (error) {
    const statusCode = error.statusCode || 500;
    return res.status(statusCode).json({ msg: error.message || "Internal server error" });
  }
};

/**
 * Fetch authenticated rider's own duty and assignment history (Ownership-scoped)
 */
export const getMyDutyHistory = async (req, res) => {
  try {
    const riderId = req.user.id;
    const limit = req.query.limit ? parseInt(req.query.limit, 10) : 30;

    const result = await distributionService.getMyDutyHistory(riderId, limit);
    return res.status(200).json({
      status: "success",
      ...result,
    });
  } catch (error) {
    const statusCode = error.statusCode || 500;
    return res.status(statusCode).json({ msg: error.message || "Internal server error" });
  }
};

/**
 * Aggregate complete rider status summary for Dashboard (SPV, MANAGEMENT, SUPERADMIN)
 */
export const getRidersSummary = async (req, res) => {
  try {
    const summary = await distributionService.getRidersSummary();
    return res.status(200).json({
      status: "success",
      data: summary,
    });
  } catch (error) {
    const statusCode = error.statusCode || 500;
    return res.status(statusCode).json({ msg: error.message || "Internal server error" });
  }
};
