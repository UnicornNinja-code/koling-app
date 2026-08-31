/*
 * armadaController.ts
 * HTTP Controller for Armada Management in TypeScript
 */

import type { Request, Response } from "express";
import { armadaService } from "../services/armadaService.js";

export const getAllArmadas = async (req: Request, res: Response): Promise<any> => {
  try {
    const { status, type } = req.query as { status?: string; type?: string };
    const result = await armadaService.getAllArmadas({ status, type });
    return res.status(200).json(result);
  } catch (error: any) {
    const statusCode = error.statusCode || 500;
    return res.status(statusCode).json({ msg: error.message || "Internal server error" });
  }
};

export const getArmadaById = async (req: Request, res: Response): Promise<any> => {
  try {
    const id = req.params.id as string;
    const armada = await armadaService.getArmadaById(id);
    return res.status(200).json({ armada });
  } catch (error: any) {
    const statusCode = error.statusCode || 500;
    return res.status(statusCode).json({ msg: error.message || "Internal server error" });
  }
};

export const createArmada = async (req: Request, res: Response): Promise<any> => {
  try {
    const { code, name, type, status } = req.body;
    const newArmada = await armadaService.createArmada({ code, name, type, status });
    return res.status(201).json({
      msg: "Unit armada berhasil ditambahkan",
      armada: newArmada,
    });
  } catch (error: any) {
    const statusCode = error.statusCode || 500;
    return res.status(statusCode).json({ msg: error.message || "Internal server error" });
  }
};

export const updateArmada = async (req: Request, res: Response): Promise<any> => {
  try {
    const id = req.params.id as string;
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
  } catch (error: any) {
    const statusCode = error.statusCode || 500;
    return res.status(statusCode).json({ msg: error.message || "Internal server error" });
  }
};

export const deleteArmada = async (req: Request, res: Response): Promise<any> => {
  try {
    const id = req.params.id as string;
    const deleted = await armadaService.deleteArmada(id);
    return res.status(200).json({
      msg: "Unit armada berhasil dihapus",
      armada: deleted,
    });
  } catch (error: any) {
    const statusCode = error.statusCode || 500;
    return res.status(statusCode).json({ msg: error.message || "Internal server error" });
  }
};
