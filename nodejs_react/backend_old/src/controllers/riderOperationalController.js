/*
 *   Copyright (c) 2026 
 *   All rights reserved.
 *   riderOperationalController.js (HTTP Controller for Rider Operational Engine)
 */

import { riderOperationalService } from "../services/rider/RiderOperationalService.js";

export const getActiveSession = async (req, res) => {
  try {
    const riderId = req.user?.id || req.query?.rider_id;
    const result = await riderOperationalService.getRiderActiveSession(riderId);
    return res.status(200).json(result);
  } catch (error) {
    const statusCode = error.statusCode || 500;
    return res.status(statusCode).json({ msg: error.message || "Internal server error" });
  }
};

export const getHubArmadas = async (req, res) => {
  try {
    const riderId = req.user?.id || req.query?.rider_id;
    const result = await riderOperationalService.getHubArmadaCatalog(riderId);
    return res.status(200).json(result);
  } catch (error) {
    const statusCode = error.statusCode || 500;
    return res.status(statusCode).json({ msg: error.message || "Internal server error" });
  }
};

export const holdArmada = async (req, res) => {
  try {
    const riderId = req.user?.id || req.body?.rider_id;
    const { armada_id } = req.body;

    const result = await riderOperationalService.inspectAndHoldArmada({
      riderId,
      armadaId: armada_id,
    });
    return res.status(200).json(result);
  } catch (error) {
    const statusCode = error.statusCode || 500;
    return res.status(statusCode).json({ msg: error.message || "Internal server error" });
  }
};

export const cancelHoldArmada = async (req, res) => {
  try {
    const riderId = req.user?.id || req.body?.rider_id;
    const { armada_id } = req.body;

    const result = await riderOperationalService.cancelArmadaHold({
      riderId,
      armadaId: armada_id,
    });
    return res.status(200).json(result);
  } catch (error) {
    const statusCode = error.statusCode || 500;
    return res.status(statusCode).json({ msg: error.message || "Internal server error" });
  }
};

export const confirmClaimArmada = async (req, res) => {
  try {
    const riderId = req.user?.id || req.body?.rider_id;
    const { armada_id } = req.body;

    const result = await riderOperationalService.confirmArmadaClaim({
      riderId,
      armadaId: armada_id,
    });
    return res.status(200).json(result);
  } catch (error) {
    const statusCode = error.statusCode || 500;
    return res.status(statusCode).json({ msg: error.message || "Internal server error" });
  }
};

export const checkInZone = async (req, res) => {
  try {
    const riderId = req.user?.id || req.body?.rider_id;
    const lat = req.body.latitude !== undefined ? req.body.latitude : req.body.lat;
    const lon = req.body.longitude !== undefined ? req.body.longitude : req.body.lon;

    const result = await riderOperationalService.checkInToZone({
      riderId,
      lat,
      lon,
    });
    return res.status(200).json(result);
  } catch (error) {
    const statusCode = error.statusCode || 500;
    return res.status(statusCode).json({ msg: error.message || "Internal server error" });
  }
};

export const recordSale = async (req, res) => {
  try {
    const riderId = req.user.id;
    const productId = req.body.product_id || req.body.productId;
    const quantity = req.body.quantity !== undefined ? req.body.quantity : req.body.qty;
    const lat = req.body.latitude || req.body.lat;
    const lon = req.body.longitude || req.body.lon;

    const result = await riderOperationalService.recordProductSale({
      riderId,
      productId,
      quantity,
      lat,
      lon,
    });
    return res.status(200).json(result);
  } catch (error) {
    const statusCode = error.statusCode || 500;
    return res.status(statusCode).json({ msg: error.message || "Internal server error" });
  }
};

export const getMySales = async (req, res) => {
  try {
    const riderId = req.user.id;
    const { date, page, limit } = req.query;

    const result = await riderOperationalService.getMySalesHistory({
      riderId,
      date,
      page,
      limit,
    });
    return res.status(200).json({
      status: "success",
      data: result.sales,
      total_revenue: result.total_revenue,
      pagination: result.pagination,
    });
  } catch (error) {
    const statusCode = error.statusCode || 500;
    return res.status(statusCode).json({ msg: error.message || "Internal server error" });
  }
};

export const checkoutSession = async (req, res) => {
  try {
    const riderId = req.user.id;
    const returnStatus = req.body.return_status || req.body.returnStatus || "ACTIVE";
    const notes = req.body.notes;

    const result = await riderOperationalService.checkoutAndReturnArmada({
      riderId,
      returnStatus,
      notes,
    });
    return res.status(200).json(result);
  } catch (error) {
    const statusCode = error.statusCode || 500;
    return res.status(statusCode).json({ msg: error.message || "Internal server error" });
  }
};

