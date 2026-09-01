/*
 * RiderOperationalService.ts
 * Clean Architecture Singleton Service for Rider Operational Engine in TypeScript
 * Supports Ticket-Booking Lock Mechanism & PostGIS Geofenced Check-in.
 */

import { riderOperationalRepository, RiderOperationalRepository } from "../../repositories/riderOperationalRepository.js";
import { productRepository } from "../../repositories/productRepository.js";
import { addArmadaHoldReleaseJob, removeArmadaHoldReleaseJob } from "../../queues/armadaHoldQueue.js";
import { broadcastArmadaHeld, broadcastArmadaReleased } from "../../socket/armadaLockSocketHandler.js";
import { eventPublisher } from "../../events/eventPublisher.js";

export class RiderOperationalService {
  private static instance: RiderOperationalService | null = null;
  private repo: RiderOperationalRepository;

  constructor(repo: RiderOperationalRepository = riderOperationalRepository) {
    if (RiderOperationalService.instance && repo === riderOperationalRepository) {
      return RiderOperationalService.instance;
    }
    this.repo = repo;
    if (repo === riderOperationalRepository) {
      RiderOperationalService.instance = this;
    }
  }

  public static getInstance(): RiderOperationalService {
    if (!RiderOperationalService.instance) {
      RiderOperationalService.instance = new RiderOperationalService();
    }
    return RiderOperationalService.instance;
  }

  /**
   * Get Rider Active Session & Assignment Info
   */
  public async getRiderActiveSession(riderId: number | string): Promise<any> {
    const session = await this.repo.findActiveRiderSession(riderId);
    return {
      has_active_session: !!session,
      session: session || null,
    };
  }

  /**
   * Get Hub Armada Catalog
   */
  public async getHubArmadaCatalog(riderId: number | string): Promise<any> {
    const armadas = await this.repo.getAvailableArmadasForHub(riderId);
    return {
      armadas,
      total_units: armadas.length,
    };
  }

  /**
   * Inspect & Hold Armada (Ticket-Booking Temporary Lock - 5 Minutes)
   */
  public async inspectAndHoldArmada({
    riderId,
    armadaId,
  }: {
    riderId: number | string;
    armadaId: number | string;
  }): Promise<any> {
    if (!riderId || !armadaId) {
      const error: any = new Error("Rider ID dan Armada ID harus diisi.");
      error.statusCode = 400;
      throw error;
    }

    const heldArmada = await this.repo.holdArmadaUnit({ riderId, armadaId, holdMinutes: 5 });
    console.log(`🔒 [HOLD LOCK] Unit Armada ${heldArmada.code} sementara dikunci untuk Rider ${riderId} selama 5 menit.`);

    await addArmadaHoldReleaseJob({
      armadaId: heldArmada.id,
      riderId,
      delayMs: 5 * 60 * 1000,
    });

    broadcastArmadaHeld({
      armadaId: heldArmada.id,
      code: heldArmada.code,
      riderId,
      riderName: "Rider",
    });

    return {
      message: `Unit Armada ${heldArmada.code} berhasil dipilih. Mengalihkan ke Halaman Detail Informasi.`,
      armada: heldArmada,
    };
  }

  /**
   * Cancel Armada Hold
   */
  public async cancelArmadaHold({
    riderId,
    armadaId,
  }: {
    riderId: number | string;
    armadaId: number | string;
  }): Promise<any> {
    if (!riderId || !armadaId) {
      const error: any = new Error("Rider ID dan Armada ID harus diisi.");
      error.statusCode = 400;
      throw error;
    }

    const released = await this.repo.cancelArmadaHold({ riderId, armadaId });
    if (!released) {
      const error: any = new Error("Unit armada tidak dalam status reservasi Anda.");
      error.statusCode = 400;
      throw error;
    }

    await removeArmadaHoldReleaseJob(released.id || armadaId);

    broadcastArmadaReleased({ armadaId: released.id || armadaId, code: released.code });

    console.log(`🔓 [RELEASE LOCK] Reservasi Unit Armada ${released.code} dibatalkan dan kembali ketersediaannya.`);
    return {
      message: `Klaim unit ${released.code} dibatalkan. Ketersediaan armada dikembalikan seperti semula.`,
      armada: released,
    };
  }

  /**
   * Confirm Final Claim on Armada
   */
  public async confirmArmadaClaim({
    riderId,
    armadaId,
    checklist,
    notes,
  }: {
    riderId: number | string;
    armadaId: number | string;
    checklist?: Record<string, any>;
    notes?: string;
  }): Promise<any> {
    if (!riderId || !armadaId) {
      const error: any = new Error("Rider ID dan Armada ID harus diisi.");
      error.statusCode = 400;
      throw error;
    }

    const sessionRes = await this.getRiderActiveSession(riderId);
    const assignmentId = sessionRes.session?.assignment_id || null;

    const claimed = await this.repo.confirmArmadaClaim({
      riderId,
      armadaId,
      assignmentId,
      checklist,
      notes,
    });

    await removeArmadaHoldReleaseJob(claimed.id || armadaId);

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
   * Check-in Rider GPS coordinates to zone polygon
   */
  public async checkInToZone({
    riderId,
    lat,
    lon,
  }: {
    riderId: number | string;
    lat: number | string;
    lon: number | string;
  }): Promise<any> {
    if (!riderId || lat === undefined || lon === undefined) {
      const error: any = new Error("Rider ID dan koordinat GPS (lat, lon) harus diisi.");
      error.statusCode = 400;
      throw error;
    }

    const sessionRes = await this.getRiderActiveSession(riderId);
    if (!sessionRes.has_active_session) {
      const error: any = new Error("Anda tidak memiliki penugasan zona aktif hari ini.");
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

    eventPublisher.publishRiderCheckedIn({
      assignmentId: session.assignment_id,
      riderId,
      riderName: session.rider_name || "Rider",
      zoneId: session.zone_id,
      zoneName: checkInResult.zone_name,
      lat: parseFloat(String(lat)),
      lon: parseFloat(String(lon)),
    });

    console.log(`📍 [CHECK-IN SPASIAL] Rider ${riderId} berhasil Check-in di ${checkInResult.zone_name} (GPS: ${lat}, ${lon}).`);

    return {
      message: `Check-in Berhasil! Kehadiran Anda di ${checkInResult.zone_name} telah tervalidasi.`,
      check_in: checkInResult,
    };
  }

  /**
   * Record daily product sales log
   */
  public async recordProductSale({
    riderId,
    productId,
    quantity,
    lat,
    lon,
  }: {
    riderId: number | string;
    productId: number | string;
    quantity: number | string;
    lat?: number;
    lon?: number;
  }): Promise<any> {
    if (!riderId || !productId || quantity === undefined) {
      const error: any = new Error("Rider ID, Product ID, dan Quantity harus diisi.");
      error.statusCode = 400;
      throw error;
    }

    const qty = parseInt(String(quantity), 10);
    if (isNaN(qty) || qty <= 0) {
      const error: any = new Error("Jumlah penjualan (quantity) harus angka positif lebih dari 0.");
      error.statusCode = 400;
      throw error;
    }

    const sessionRes = await this.getRiderActiveSession(riderId);
    if (!sessionRes.has_active_session) {
      const error: any = new Error("Anda tidak memiliki sesi operasional aktif hari ini.");
      error.statusCode = 400;
      throw error;
    }

    const session = sessionRes.session;

    if (session.assignment_status !== "CHECKED_IN") {
      const error: any = new Error("Anda belum melakukan Check-in di zona tugas. Harap lakukan Check-in lokasi terlebih dahulu sebelum mencatat penjualan.");
      error.statusCode = 400;
      throw error;
    }

    const product = await productRepository.findById(productId);
    if (!product) {
      const error: any = new Error(`Produk dengan ID '${productId}' tidak ditemukan di katalog menu.`);
      error.statusCode = 404;
      throw error;
    }

    if (product.status !== "AVAILABLE") {
      const error: any = new Error(`Produk '${product.name}' berstatus ${product.status} dan tidak dapat dijual.`);
      error.statusCode = 400;
      throw error;
    }

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
  public async getMySalesHistory({
    riderId,
    date,
    page,
    limit,
  }: {
    riderId: number | string;
    date?: string | null;
    page?: number;
    limit?: number;
  }): Promise<any> {
    if (!riderId) {
      const error: any = new Error("Rider ID harus diisi.");
      error.statusCode = 400;
      throw error;
    }

    return await this.repo.getRiderSalesHistory({
      riderId,
      date,
      page,
      limit,
    });
  }

  /**
   * Checkout rider operational session & return armada unit
   */
  public async checkoutAndReturnArmada({
    riderId,
    returnStatus = "ACTIVE",
    inspectionCondition = {},
    notes = "",
  }: {
    riderId: number | string;
    returnStatus?: string;
    inspectionCondition?: Record<string, any>;
    notes?: string;
  }): Promise<any> {
    if (!riderId) {
      const error: any = new Error("Rider ID harus diisi.");
      error.statusCode = 400;
      throw error;
    }

    const sessionRes = await this.getRiderActiveSession(riderId);
    if (!sessionRes.has_active_session) {
      const error: any = new Error("Anda tidak memiliki sesi operasional aktif untuk dicheckout.");
      error.statusCode = 400;
      throw error;
    }

    const session = sessionRes.session;
    const checkoutResult = await this.repo.checkoutRiderSession({
      assignmentId: session.assignment_id,
      armadaId: session.armada_id,
      riderId,
      returnStatus,
      inspectionCondition,
      notes,
    });

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
