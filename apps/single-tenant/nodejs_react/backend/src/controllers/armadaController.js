/*
 *   Copyright (c) 2026 
 *   All rights reserved.
 *   armadaController.js (HTTP Controller for Armada Management & 5-Min Hold Claim Engine)
 */

import { armadaService } from "../services/armadaService.js";
import { riderOperationalService } from "../services/rider/RiderOperationalService.js";

export const getAllArmadas = async (req, res) => {
  try {
    const { status, type } = req.query;
    const result = await armadaService.getAllArmadas({ status, type });
    return res.status(200).json(result);
  } catch (error) {
    const statusCode = error.statusCode || 500;
    return res.status(statusCode).json({ msg: error.message || "Internal server error" });
  }
};

export const getArmadaById = async (req, res) => {
  try {
    const { id } = req.params;
    const armada = await armadaService.getArmadaById(id);
    return res.status(200).json({ armada });
  } catch (error) {
    const statusCode = error.statusCode || 500;
    return res.status(statusCode).json({ msg: error.message || "Internal server error" });
  }
};

export const createArmada = async (req, res) => {
  try {
    const { code, name, type, status } = req.body;
    const newArmada = await armadaService.createArmada({ code, name, type, status });
    return res.status(201).json({
      msg: "Unit armada berhasil ditambahkan",
      armada: newArmada,
    });
  } catch (error) {
    const statusCode = error.statusCode || 500;
    return res.status(statusCode).json({ msg: error.message || "Internal server error" });
  }
};

export const updateArmada = async (req, res) => {
  try {
    const { id } = req.params;
    const { code, type, status, current_rider_id } = req.body;

    const updated = await armadaService.updateArmada(id, {
      code,
      type,
      status,
      current_rider_id,
    });

    return res.status(200).json({
      msg: "Data unit armada berhasil diperbarui",
      armada: updated,
    });
  } catch (error) {
    const statusCode = error.statusCode || 500;
    return res.status(statusCode).json({ msg: error.message || "Internal server error" });
  }
};

export const deleteArmada = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await armadaService.deleteArmada(id);
    return res.status(200).json({
      msg: "Unit armada berhasil dihapus",
      armada: deleted,
    });
  } catch (error) {
    const statusCode = error.statusCode || 500;
    return res.status(statusCode).json({ msg: error.message || "Internal server error" });
  }
};

/**
 * 5-Minute Temporary Hold on Armada (Row-Level Lock)
 */
export const holdArmada = async (req, res) => {
  try {
    const { id } = req.params;
    const riderId = req.user?.id || req.body?.rider_id;

    const result = await riderOperationalService.inspectAndHoldArmada({
      riderId,
      armadaId: id,
    });
    return res.status(200).json(result);
  } catch (error) {
    const statusCode = error.statusCode || 500;
    return res.status(statusCode).json({ msg: error.message || "Internal server error" });
  }
};

/**
 * Confirm Final Claim on Armada (Status IN_USE)
 */
export const claimArmada = async (req, res) => {
  try {
    const { id } = req.params;
    const riderId = req.user?.id || req.body?.rider_id;

    const result = await riderOperationalService.confirmArmadaClaim({
      riderId,
      armadaId: id,
    });
    return res.status(200).json(result);
  } catch (error) {
    const statusCode = error.statusCode || 500;
    return res.status(statusCode).json({ msg: error.message || "Internal server error" });
  }
};

/**
 * Release Armada Hold / Cancel Reservation
 */
export const releaseArmada = async (req, res) => {
  try {
    const { id } = req.params;
    const riderId = req.user?.id || req.body?.rider_id;

    const result = await riderOperationalService.cancelArmadaHold({
      riderId,
      armadaId: id,
    });
    return res.status(200).json(result);
  } catch (error) {
    const statusCode = error.statusCode || 500;
    return res.status(statusCode).json({ msg: error.message || "Internal server error" });
  }
};
