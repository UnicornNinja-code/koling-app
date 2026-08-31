/*
 *   Copyright (c) 2026 
 *   All rights reserved.
 *   armadaService.js (Clean Architecture Singleton Service for Armada Management)
 */

import { armadaRepository } from "../repositories/armadaRepository.js";

export class ArmadaService {
  static instance = null;

  constructor(repo = armadaRepository) {
    if (ArmadaService.instance && repo === armadaRepository) {
      return ArmadaService.instance;
    }
    this.repo = repo;
    if (repo === armadaRepository) {
      ArmadaService.instance = this;
    }
  }

  static getInstance() {
    if (!ArmadaService.instance) {
      ArmadaService.instance = new ArmadaService();
    }
    return ArmadaService.instance;
  }

  /**
   * Fetch all armada units
   */
  async getAllArmadas(filters = {}) {
    const armadas = await this.repo.findAll(filters);
    return { armadas, count: armadas.length };
  }

  /**
   * Fetch single armada unit by ID
   */
  async getArmadaById(id) {
    const armada = await this.repo.findById(id);
    if (!armada) {
      const error = new Error(`Unit armada dengan ID '${id}' tidak ditemukan.`);
      error.statusCode = 404;
      throw error;
    }
    return armada;
  }

  /**
   * Create a new master armada unit
   */
  async createArmada({ code, name, type = "GEROBAK", status = "ACTIVE" }) {
    const rawCode = code || name;
    if (!rawCode || typeof rawCode !== "string" || rawCode.trim() === "") {
      const error = new Error("Nomor seri unit armada (code) harus diisi.");
      error.statusCode = 400;
      throw error;
    }

    const formattedCode = rawCode.trim().toUpperCase();

    // Check duplicate code / serial number
    const existing = await this.repo.findByCode(formattedCode);
    if (existing) {
      const error = new Error("Nomor seri unit sudah terdaftar.");
      error.statusCode = 400;
      throw error;
    }

    // Type normalization
    let finalType = "GEROBAK";
    const typeUpper = (type || "").toString().trim().toUpperCase();
    if (typeUpper === "MOTOR_LISTRIK" || typeUpper.includes("MOTOR") || typeUpper.includes("E-BIKE")) {
      finalType = "MOTOR_LISTRIK";
    } else if (typeUpper === "LAINNYA" || typeUpper.includes("OTHER")) {
      finalType = "LAINNYA";
    } else {
      finalType = "GEROBAK";
    }

    // Status normalization
    let finalStatus = "ACTIVE";
    const statusUpper = (status || "").toString().trim().toUpperCase();
    if (statusUpper === "MAINTENANCE") {
      finalStatus = "MAINTENANCE";
    } else if (statusUpper === "IN_USE" || statusUpper.includes("USE")) {
      finalStatus = "IN_USE";
    } else if (statusUpper === "RESERVED") {
      finalStatus = "RESERVED";
    } else {
      finalStatus = "ACTIVE";
    }

    const newArmada = await this.repo.create({
      code: formattedCode,
      type: finalType,
      status: finalStatus,
    });

    console.log(`✅ Master Unit Armada Berhasil Dibuat: [${newArmada.code}] (${newArmada.type}) - Status: ${newArmada.status}`);
    return newArmada;
  }

  /**
   * Update armada unit details / status
   */
  async updateArmada(id, updateData = {}) {
    const existing = await this.repo.findById(id);
    if (!existing) {
      const error = new Error(`Unit armada dengan ID '${id}' tidak ditemukan.`);
      error.statusCode = 404;
      throw error;
    }

    let formattedCode = existing.code;
    if (updateData.code && updateData.code.trim() !== "") {
      formattedCode = updateData.code.trim().toUpperCase();
      if (formattedCode !== existing.code) {
        const duplicate = await this.repo.findByCode(formattedCode);
        if (duplicate) {
          const error = new Error("Nomor seri unit sudah terdaftar.");
          error.statusCode = 400;
          throw error;
        }
      }
    }

    const updated = await this.repo.update(id, {
      code: formattedCode,
      type: updateData.type || existing.type,
      status: updateData.status || existing.status,
      current_rider_id: updateData.current_rider_id !== undefined ? updateData.current_rider_id : existing.current_rider_id,
    });

    console.log(`📝 Unit Armada [${updated.code}] Berhasil Diperbarui -> Status: ${updated.status}`);
    return updated;
  }

  /**
   * Delete armada unit by ID (Blocks deletion if status is IN_USE)
   */
  async deleteArmada(id) {
    const existing = await this.repo.findById(id);
    if (!existing) {
      const error = new Error(`Unit armada dengan ID '${id}' tidak ditemukan.`);
      error.statusCode = 404;
      throw error;
    }

    if (existing.status === "IN_USE") {
      const error = new Error("Armada sedang digunakan oleh Rider dan tidak dapat dihapus.");
      error.statusCode = 400;
      throw error;
    }

    const deleted = await this.repo.delete(id);
    console.log(`🗑️ Unit Armada [${deleted.code}] Berhasil Dihapus.`);
    return deleted;
  }
}

export const armadaService = ArmadaService.getInstance();
