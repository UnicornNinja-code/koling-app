/*
 *   Copyright (c) 2026 
 *   All rights reserved.
 *   competitorController (HTTP Request Handlers for Competitor Management & C6 Score)
 */

import {
  getZoneC6ScoreService,
  getCompetitorsByZoneService,
  createCompetitorService,
  deleteCompetitorService,
} from "../services/poiService.js";

export const getZoneC6Score = async (req, res) => {
  try {
    const { zone_id } = req.params;
    const result = await getZoneC6ScoreService(zone_id);
    return res.status(200).json(result);
  } catch (error) {
    const statusCode = error.statusCode || 500;
    return res.status(statusCode).json({ msg: error.message || "Internal server error" });
  }
};

export const getCompetitorsByZone = async (req, res) => {
  try {
    const { zone_id } = req.params;
    const competitors = await getCompetitorsByZoneService(zone_id);
    return res.status(200).json({ competitors, count: competitors.length });
  } catch (error) {
    const statusCode = error.statusCode || 500;
    return res.status(statusCode).json({ msg: error.message || "Internal server error" });
  }
};

export const createCompetitor = async (req, res) => {
  try {
    const data = req.body;
    const competitor = await createCompetitorService(data);
    return res.status(201).json({ msg: "Data kompetitor berhasil ditambahkan", competitor });
  } catch (error) {
    const statusCode = error.statusCode || 500;
    return res.status(statusCode).json({ msg: error.message || "Internal server error" });
  }
};

export const deleteCompetitor = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await deleteCompetitorService(id);
    return res.status(200).json(result);
  } catch (error) {
    const statusCode = error.statusCode || 500;
    return res.status(statusCode).json({ msg: error.message || "Internal server error" });
  }
};
