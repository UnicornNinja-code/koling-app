/*
 * zoneController.js
 * HTTP Controller for Zone Management
 */

import { zoneService } from "../services/zoneService.js";

export const getZoneConfig = async (req, res) => {
  try {
    const config = await zoneService.getZoneConfig();
    return res.status(200).json(config);
  } catch (error) {
    const statusCode = error.statusCode || 500;
    return res.status(statusCode).json({ msg: error.message || "Internal server error" });
  }
};

export const getAllZones = async (req, res) => {
  try {
    const { status, search } = req.query;
    const result = await zoneService.getAllZones({ status, search });
    return res.status(200).json(result);
  } catch (error) {
    const statusCode = error.statusCode || 500;
    return res.status(statusCode).json({ msg: error.message || "Internal server error" });
  }
};

export const getZoneById = async (req, res) => {
  try {
    const { id } = req.params;
    const zone = await zoneService.getZoneById(id);
    return res.status(200).json({ zone });
  } catch (error) {
    const statusCode = error.statusCode || 500;
    return res.status(statusCode).json({ msg: error.message || "Internal server error" });
  }
};

export const createZone = async (req, res) => {
  try {
    const { name, description, max_capacity, status, polygon } = req.body;
    const newZone = await zoneService.createZone({
      name,
      description,
      max_capacity,
      status,
      polygon,
    });
    return res.status(201).json({
      msg: "Zona operasional berhasil ditambahkan",
      zone: newZone,
    });
  } catch (error) {
    const statusCode = error.statusCode || 500;
    return res.status(statusCode).json({ msg: error.message || "Internal server error" });
  }
};

export const updateZone = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, max_capacity, status, polygon } = req.body;
    const updated = await zoneService.updateZone(id, {
      name,
      description,
      max_capacity,
      status,
      polygon,
    });
    return res.status(200).json({
      msg: "Data zona operasional berhasil diperbarui",
      zone: updated,
    });
  } catch (error) {
    const statusCode = error.statusCode || 500;
    return res.status(statusCode).json({ msg: error.message || "Internal server error" });
  }
};

export const updateZoneStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const updated = await zoneService.updateZoneStatus(id, status);
    return res.status(200).json({
      msg: "Status zona operasional berhasil diubah",
      zone: updated,
    });
  } catch (error) {
    const statusCode = error.statusCode || 500;
    return res.status(statusCode).json({ msg: error.message || "Internal server error" });
  }
};

export const updateZoneCapacity = async (req, res) => {
  try {
    const { id } = req.params;
    const { max_capacity } = req.body;
    const updated = await zoneService.updateZoneCapacity(id, max_capacity);
    return res.status(200).json({
      msg: "Kapasitas kuota zona operasional berhasil diubah",
      zone: updated,
    });
  } catch (error) {
    const statusCode = error.statusCode || 500;
    return res.status(statusCode).json({ msg: error.message || "Internal server error" });
  }
};

export const deleteZone = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await zoneService.deleteZone(id);
    return res.status(200).json({
      msg: "Zona operasional berhasil dihapus",
      zone: deleted,
    });
  } catch (error) {
    const statusCode = error.statusCode || 500;
    return res.status(statusCode).json({ msg: error.message || "Internal server error" });
  }
};
