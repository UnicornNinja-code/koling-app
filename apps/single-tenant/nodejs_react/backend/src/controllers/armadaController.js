/*
 *   Copyright (c) 2026 
 *   All rights reserved.
 *   armadaController.js (HTTP Controller for Armada Management)
 */

import { armadaService } from "../services/armadaService.js";

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
