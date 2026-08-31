/*
 * distributionController.ts
 * HTTP Controller for Rider Distribution Engine & Queue Management in TypeScript
 */

import type { Request, Response } from "express";
import { distributionService } from "../services/distribution/DistributionService.js";

export const confirmDuty = async (req: Request, res: Response): Promise<any> => {
  try {
    const riderId = req.user?.id || req.body?.rider_id;
    if (!riderId) {
      return res.status(400).json({ msg: "Rider ID harus disertakan." });
    }

    const queueEntry = await distributionService.confirmRiderDuty(riderId);
    return res.status(200).json({
      msg: "Konfirmasi kesediaan bertugas berhasil. Rider telah masuk ke Antrean FIFO.",
      queue: queueEntry,
    });
  } catch (error: any) {
    const statusCode = error.statusCode || 500;
    return res.status(statusCode).json({ msg: error.message || "Internal server error" });
  }
};

export const getDistributionOverview = async (req: Request, res: Response): Promise<any> => {
  try {
    const overview = await distributionService.getDistributionOverview();
    return res.status(200).json(overview);
  } catch (error: any) {
    const statusCode = error.statusCode || 500;
    return res.status(statusCode).json({ msg: error.message || "Internal server error" });
  }
};

export const autoDistribute = async (req: Request, res: Response): Promise<any> => {
  try {
    const result = await distributionService.autoDistributeRiders();
    return res.status(200).json(result);
  } catch (error: any) {
    const statusCode = error.statusCode || 500;
    return res.status(statusCode).json({ msg: error.message || "Internal server error" });
  }
};

export const manualDistribute = async (req: Request, res: Response): Promise<any> => {
  try {
    const { rider_id, zone_id } = req.body;
    const assignedBy = req.user?.id;

    const result = await distributionService.manualDistributeRider({
      riderId: rider_id,
      zoneId: zone_id,
      assignedBy,
    });

    return res.status(200).json(result);
  } catch (error: any) {
    const statusCode = error.statusCode || 500;
    return res.status(statusCode).json({ msg: error.message || "Internal server error" });
  }
};

/**
 * Fetch authenticated rider's own duty and assignment history
 */
export const getMyDutyHistory = async (req: Request, res: Response): Promise<any> => {
  try {
    const riderId = req.user.id;
    const limit = req.query.limit ? parseInt(String(req.query.limit), 10) : 30;

    const result = await distributionService.getMyDutyHistory(riderId, limit);
    return res.status(200).json(result);
  } catch (error: any) {
    const statusCode = error.statusCode || 500;
    return res.status(statusCode).json({ msg: error.message || "Internal server error" });
  }
};
