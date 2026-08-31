/*
 *   Copyright (c) 2026 
 *   All rights reserved.
 *   RiderOperationalService.js (Clean Architecture Singleton Service for Rider Operational Engine)
 *   Supports Ticket-Booking Lock Mechanism & PostGIS Geofenced Check-in.
 */

import { riderOperationalRepository } from "../../repositories/riderOperationalRepository.js";
import { productRepository } from "../../repositories/productRepository.js";
import { pool } from "../../config/database.js";
import { addArmadaHoldReleaseJob, removeArmadaHoldReleaseJob } from "../../queues/armadaHoldQueue.js";
import { broadcastArmadaHeld, broadcastArmadaReleased } from "../../socket/armadaLockSocketHandler.js";
import { eventPublisher } from "../../events/eventPublisher.js";

export class RiderOperationalService {
  static instance = null;

  constructor(repo = riderOperationalRepository) {
    if (RiderOperationalService.instance && repo === riderOperationalRepository) {
      return RiderOperationalService.instance;
    }
    this.repo = repo;
    if (repo === riderOperationalRepository) {
      RiderOperationalService.instance = this;
    }
  }

  static getInstance() {
    if (!RiderOperationalService.instance) {
      RiderOperationalService.instance = new RiderOperationalService();
    }
    return RiderOperationalService.instance;
  }

  /**
   * Get Rider Active Session & Assignment Info
   */
  async getRiderActiveSession(riderId) {
    const session = await this.repo.findActiveRiderSession(riderId);
    return {
      has_active_session: !!session,
      session: session || null,
    };
  }

  /**
   * Get Hub Armada Catalog (Ticket-Booking Hold UX Status)
   */
  async getHubArmadaCatalog(riderId) {
    const armadas = await this.repo.getAvailableArmadasForHub(riderId);
    return {
      armadas,
      total_units: armadas.length,
    };
  }

  /**
   * Inspect & Hold Armada (Ticket-Booking Temporary Lock - 5 Minutes)
   * Schedules a BullMQ Delayed Job & Broadcasts Real-Time Socket Lock
   */
  async inspectAndHoldArmada({ riderId, armadaId }) {
    if (!riderId || !armadaId) {
      const error = new Error("Rider ID dan Armada ID harus diisi.");
      error.statusCode = 400;
      throw error;
    }

    const heldArmada = await this.repo.holdArmadaUnit({ riderId, armadaId, holdMinutes: 5 });
    console.log(`🔒 [HOLD LOCK] Unit Armada ${heldArmada.code} sementara dikunci untuk Rider ${riderId} selama 5 menit.`);
    
    // Schedule BullMQ Dynamic Delayed Job (5 Minutes)
    await addArmadaHoldReleaseJob({
      armadaId: heldArmada.id,
      riderId,
      delayMs: 5 * 60 * 1000,
    });

    // Real-Time WebSockets Lock Broadcast to all Hub Riders
    broadcastArmadaHeld({ armadaId: heldArmada.id, code: heldArmada.code, riderId });

    return {
      message: `Unit Armada ${heldArmada.code} berhasil dipilih. Mengalihkan ke Halaman Detail Informasi.`,
      armada: heldArmada,
    };
  }

  /**
   * Cancel Armada Hold (Rider backs out / cancels inspection)
   * Removes BullMQ Delayed Job & Broadcasts Real-Time Socket Lock Release
   */
  async cancelArmadaHold({ riderId, armadaId }) {
    if (!riderId || !armadaId) {
      const error = new Error("Rider ID dan Armada ID harus diisi.");
      error.statusCode = 400;
      throw error;
    }

    const released = await this.repo.cancelArmadaHold({ riderId, armadaId });
    if (!released) {
      const error = new Error("Unit armada tidak dalam status reservasi Anda.");
      error.statusCode = 400;
      throw error;
    }

    // Cancel BullMQ Delayed Job immediately
    await removeArmadaHoldReleaseJob(released.id || armadaId);

    // Real-Time WebSockets Lock Release Broadcast
    broadcastArmadaReleased({ armadaId: released.id || armadaId, code: released.code });

    console.log(`🔓 [RELEASE LOCK] Reservasi Unit Armada ${released.code} dibatalkan dan kembali ketersediaannya.`);
    return {
      message: `Klaim unit ${released.code} dibatalkan. Ketersediaan armada dikembalikan seperti semula.`,
      armada: released,
    };
  }

  /**
   * Confirm Final Claim on Armada (Permanent IN_USE Status)
   * Removes BullMQ Delayed Job & Broadcasts Permanent Lock
   */
  async confirmArmadaClaim({ riderId, armadaId }) {
    if (!riderId || !armadaId) {
      const error = new Error("Rider ID dan Armada ID harus diisi.");
      error.statusCode = 400;
      throw error;
    }

    const sessionRes = await this.getRiderActiveSession(riderId);
    const assignmentId = sessionRes.session?.assignment_id || null;

    const claimed = await this.repo.confirmArmadaClaim({
      riderId,
      armadaId,
      assignmentId,
    });

    // Cancel BullMQ Delayed Job immediately (no longer needed)
    await removeArmadaHoldReleaseJob(claimed.id || armadaId);

    // Real-Time WebSockets Permanent Claim Broadcast via eventPublisher
    eventPublisher.publishArmadaClaimed({
      armadaId: claimed.id || armadaId,
      code: claimed.code,
      riderId,
      riderName: sessionRes.session?.rider_name || "Rider",
    });

    console.log(`✅ [CONFIRM CLAIM] Rider ${riderId} resmi mengklaim Unit Armada ${claimed.code} (Status: IN_USE).`);

    return {
      message: `Selamat! Unit Armada ${claimed.code} berhasil diklaim. Silakan berkendara menuju zona tugas.`,
      armada: claimed,
    };
  }

  /**
   * Check-in Rider GPS coordinates to zone polygon via PostGIS ST_Contains
   */
  async checkInToZone({ riderId, lat, lon }) {
    if (!riderId || lat === undefined || lon === undefined) {
      const error = new Error("Rider ID dan koordinat GPS (lat, lon) harus diisi.");
      error.statusCode = 400;
      throw error;
    }

    const sessionRes = await this.getRiderActiveSession(riderId);
    if (!sessionRes.has_active_session) {
      const error = new Error("Anda tidak memiliki penugasan zona aktif hari ini.");
      error.statusCode = 400;
      throw error;
    }

    const session = sessionRes.session;
    const checkInResult = await this.repo.validateAndCheckInRider({
      riderId,
      assignmentId: session.assignment_id,
      zoneId: session.zone_id,
      lat,
      lon,
    });

    // Real-Time Event Emission to Supervisors Room
    eventPublisher.publishRiderCheckedIn({
      assignmentId: session.assignment_id,
      riderId,
      riderName: session.rider_name || "Rider",
      zoneId: session.zone_id,
      zoneName: checkInResult.zone_name,
      lat,
      lon,
    });

    console.log(`📍 [CHECK-IN SPASIAL] Rider ${riderId} berhasil Check-in di ${checkInResult.zone_name} (GPS: ${lat}, ${lon}).`);

    return {
      message: `Check-in Berhasil! Kehadiran Anda di ${checkInResult.zone_name} telah tervalidasi.`,
      check_in: checkInResult,
    };
  }

  /**
   * Record daily product sales log with Check-In validation & server-side price snapshot
   */
  async recordProductSale({ riderId, productId, quantity, lat, lon }) {
    if (!riderId || !productId || quantity === undefined) {
      const error = new Error("Rider ID, Product ID, dan Quantity harus diisi.");
      error.statusCode = 400;
      throw error;
    }

    const qty = parseInt(quantity, 10);
    if (isNaN(qty) || qty <= 0) {
      const error = new Error("Jumlah penjualan (quantity) harus angka positif lebih dari 0.");
      error.statusCode = 400;
      throw error;
    }

    // 1. Validate active session
    const sessionRes = await this.getRiderActiveSession(riderId);
    if (!sessionRes.has_active_session) {
      const error = new Error("Anda tidak memiliki sesi operasional aktif hari ini.");
      error.statusCode = 400;
      throw error;
    }

    const session = sessionRes.session;

    // 2. Validate CHECKED_IN prerequisite
    if (session.assignment_status !== "CHECKED_IN") {
      const error = new Error("Anda belum melakukan Check-in di zona tugas. Harap lakukan Check-in lokasi terlebih dahulu sebelum mencatat penjualan.");
      error.statusCode = 400;
      throw error;
    }

    // 3. Validate Master Product existence and AVAILABLE status
    const product = await productRepository.findById(productId);
    if (!product) {
      const error = new Error(`Produk dengan ID '${productId}' tidak ditemukan di katalog menu.`);
      error.statusCode = 404;
      throw error;
    }

    if (product.status !== "AVAILABLE") {
      const error = new Error(`Produk '${product.name}' berstatus ${product.status} dan tidak dapat dijual.`);
      error.statusCode = 400;
      throw error;
    }

    // 4. Server-side price snapshot & total calculation
    const unitPrice = parseFloat(product.price);
    const totalPrice = parseFloat((qty * unitPrice).toFixed(2));

    const salesLog = await this.repo.insertSalesLog({
      riderId,
      zoneId: session.zone_id,
      assignmentId: session.assignment_id,
      productId,
      quantity: qty,
      unitPrice,
      totalPrice,
      lat,
      lon,
    });

    // Real-Time Event Emission (Management full financial / Supervisor operational volume)
    eventPublisher.publishSaleRecorded({
      saleId: salesLog.id,
      assignmentId: session.assignment_id,
      riderId,
      riderName: session.rider_name || "Rider",
      zoneId: session.zone_id,
      zoneName: session.zone_name,
      productId,
      productName: product.name,
      qty,
      unitPrice,
      totalPrice,
    });

    console.log(`💰 [SALES LOG] Rider ${riderId} mencatat penjualan ${qty}x ${product.name} (Total: Rp${totalPrice.toLocaleString("id-ID")}).`);

    return {
      message: "Data penjualan produk berhasil dicatat.",
      sales_log: {
        ...salesLog,
        product_name: product.name,
        unit_price: unitPrice,
        total_price: totalPrice,
      },
    };
  }

  /**
   * Fetch personal sales history for authenticated rider
   */
  async getMySalesHistory({ riderId, date, page, limit }) {
    if (!riderId) {
      const error = new Error("Rider ID harus diisi.");
      error.statusCode = 400;
      throw error;
    }

    const result = await this.repo.getRiderSalesHistory({
      riderId,
      date,
      page,
      limit,
    });

    return result;
  }

  /**
   * Checkout rider operational session & return armada unit
   */
  async checkoutAndReturnArmada({ riderId, returnStatus = "ACTIVE", notes = "" }) {
    if (!riderId) {
      const error = new Error("Rider ID harus diisi.");
      error.statusCode = 400;
      throw error;
    }

    const sessionRes = await this.getRiderActiveSession(riderId);
    if (!sessionRes.has_active_session) {
      const error = new Error("Anda tidak memiliki sesi operasional aktif untuk dicheckout.");
      error.statusCode = 400;
      throw error;
    }

    const session = sessionRes.session;
    const checkoutResult = await this.repo.checkoutRiderSession({
      assignmentId: session.assignment_id,
      armadaId: session.armada_id,
      returnStatus,
    });

    // 1. Emit Session Checkout to Supervisors Room
    eventPublisher.publishRiderCheckedOut({
      assignmentId: session.assignment_id,
      riderId,
      riderName: session.rider_name || "Rider",
      zoneId: session.zone_id,
      zoneName: session.zone_name,
      armadaId: session.armada_id,
      armadaCode: checkoutResult.armada_code,
      returnStatus,
    });

    // 2. Emit Armada Lock Release to all Riders Hub UI
    if (session.armada_id) {
      eventPublisher.publishArmadaReleased({
        armadaId: session.armada_id,
        code: checkoutResult.armada_code,
      });
    }

    console.log(`🏁 [CHECKOUT SESSION] Sesi operasional Rider ${riderId} ditutup. Armada dikembalikan dengan status '${returnStatus}'.`);

    return {
      message: "Sesi operasional berhasil ditutup. Terima kasih atas kerja keras Anda hari ini!",
      checkout: checkoutResult,
    };
  }
}

export const riderOperationalService = RiderOperationalService.getInstance();
