/*
 * DistributionService.ts
 * Clean Architecture Singleton Service for Rider Distribution Engine in TypeScript
 * Integrates FIFO Queue + TOPSIS Zone Rankings + Capacity Validation.
 */

import { distributionRepository, DistributionRepository } from "../../repositories/distributionRepository.js";
import { topsisEngineService } from "../dss/TopsisEngineService.js";
import { topsisRepository } from "../../repositories/topsisRepository.js";
import { TimeSlotEvaluator } from "../../utils/TimeSlotEvaluator.js";
import { addRiderAssignedNotifJob } from "../../queues/notificationQueue.js";
import { eventPublisher } from "../../events/eventPublisher.js";

export class DistributionService {
  private static instance: DistributionService | null = null;
  private repo: DistributionRepository;

  constructor(repo: DistributionRepository = distributionRepository) {
    if (DistributionService.instance && repo === distributionRepository) {
      return DistributionService.instance;
    }
    this.repo = repo;
    if (repo === distributionRepository) {
      DistributionService.instance = this;
    }
  }

  public static getInstance(): DistributionService {
    if (!DistributionService.instance) {
      DistributionService.instance = new DistributionService();
    }
    return DistributionService.instance;
  }

  /**
   * Rider confirms availability duty for today (FIFO Queue Entry)
   */
  public async confirmRiderDuty(riderId: number | string): Promise<any> {
    if (!riderId) {
      const error: any = new Error("Rider ID harus diisi.");
      error.statusCode = 400;
      throw error;
    }
    const queueEntry = await this.repo.addRiderToDutyQueue(riderId);
    console.log(`✅ Rider ${riderId} berhasil masuk ke Antrean Tugas (FIFO Queue) pada ${queueEntry.confirmed_at}`);
    return queueEntry;
  }

  /**
   * Get distribution overview: FIFO Waiting Queue + TOPSIS Zone Rankings + Remaining Capacities
   */
  public async getDistributionOverview(): Promise<any> {
    const currentSlot = TimeSlotEvaluator.getSlot(new Date());

    const waitingQueue = await this.repo.getWaitingRidersQueue();

    const topsisResult = await topsisEngineService.calculateTopsisRecommendations({
      timeSlot: currentSlot,
    });

    const assignedCounts = await this.repo.getAssignedRidersCountPerZone();

    const zonesOverview = topsisResult.rankings.map((rankItem: any) => {
      const assigned = assignedCounts[rankItem.zone_id] || 0;
      return {
        ...rankItem,
        assigned_count: assigned,
      };
    });

    const activeZones = await topsisRepository.findAllActiveZones();
    const fullZonesOverview = zonesOverview.map((z: any) => {
      const activeZone = activeZones.find((az: any) => az.id === z.zone_id) || {};
      const maxCap =
        activeZone.max_capacity !== undefined && activeZone.max_capacity !== null
          ? parseInt(activeZone.max_capacity, 10)
          : 10;
      const assigned = assignedCounts[z.zone_id] || 0;
      const remaining = Math.max(0, maxCap - assigned);
      return {
        ...z,
        max_capacity: maxCap,
        assigned_count: assigned,
        remaining_capacity: remaining,
        is_full: remaining === 0,
      };
    });

    const totalWaitingRiders = waitingQueue.length;
    const totalRemainingCapacity = fullZonesOverview.reduce((acc: number, z: any) => acc + z.remaining_capacity, 0);

    return {
      time_slot: currentSlot,
      total_waiting_riders: totalWaitingRiders,
      total_remaining_capacity: totalRemainingCapacity,
      is_capacity_sufficient: totalRemainingCapacity >= totalWaitingRiders,
      waiting_queue: waitingQueue,
      zones_overview: fullZonesOverview,
    };
  }

  /**
   * Execute Automatic Distribution (Matches FIFO Queue to TOPSIS Zone Rank & Capacity)
   */
  public async autoDistributeRiders(): Promise<any> {
    console.log("\n================================================================================");
    console.log("🚀 [DISTRIBUSI ENGINE] MEMULAI DISTRIBUSI OTOMATIS RIDER (FIFO + TOPSIS)");
    console.log("================================================================================");

    const overview = await this.getDistributionOverview();
    const { waiting_queue: queue, zones_overview: zones } = overview;

    if (queue.length === 0) {
      console.log("ℹ️ Tidak ada Rider dalam antrean bertugas (FIFO Queue Kosong).");
      return {
        message: "Antrean Rider kosong. Tidak ada penugasan baru yang dilakukan.",
        assigned_riders_count: 0,
        unassigned_riders_count: 0,
        assignments: [],
      };
    }

    const assignments: any[] = [];
    let queueIndex = 0;
    const totalQueueCount = queue.length;

    for (const zone of zones) {
      let remainingCap = zone.remaining_capacity;

      while (remainingCap > 0 && queueIndex < totalQueueCount) {
        const rider = queue[queueIndex];

        const assignment = await this.repo.createAssignment({
          rider_id: rider.rider_id,
          zone_id: zone.zone_id,
          assigned_by: null,
          assignment_type: "AUTO",
        });

        assignments.push({
          ...assignment,
          rider_name: rider.rider_name,
          zone_name: zone.zone_name,
          topsis_rank: zone.rank,
        });

        console.log(`   🎯 [AUTO PLOT] Rider ${rider.rider_name.padEnd(20)} -> TOPSIS Rank ${zone.rank}: ${zone.zone_name}`);

        eventPublisher.publishRiderAssigned({
          assignmentId: assignment.id,
          riderId: rider.rider_id,
          zoneName: zone.zone_name,
          topsisRank: zone.rank,
          assignmentType: "AUTO",
        });

        await addRiderAssignedNotifJob({
          assignmentId: assignment.id,
          riderId: rider.rider_id,
          zoneName: zone.zone_name,
          topsisRank: zone.rank,
          assignmentType: "AUTO",
        });

        remainingCap--;
        queueIndex++;
      }

      if (queueIndex >= totalQueueCount) {
        break;
      }
    }

    const unassignedCount = totalQueueCount - queueIndex;
    const isSufficient = unassignedCount === 0;

    const responseMsg = isSufficient
      ? `Distribusi Otomatis Berhasil Selesai! ${assignments.length} Rider berhasil diploting ke zona prioritas TOPSIS.`
      : `⚠️ Kapasitas zona tidak mencukupi! ${assignments.length} Rider terploting, ${unassignedCount} Rider tetap berstatus Belum Terploting (menganggur).`;

    return {
      message: responseMsg,
      is_capacity_sufficient: isSufficient,
      assigned_riders_count: assignments.length,
      unassigned_riders_count: unassignedCount,
      assignments,
    };
  }

  /**
   * Execute Manual Distribution by Supervisor (Validates Zone Capacity)
   */
  public async manualDistributeRider({
    riderId,
    zoneId,
    assignedBy = null,
  }: {
    riderId: number | string;
    zoneId: number | string;
    assignedBy?: number | string | null;
  }): Promise<any> {
    if (!riderId || !zoneId) {
      const error: any = new Error("Rider ID dan Zone ID harus diisi.");
      error.statusCode = 400;
      throw error;
    }

    const overview = await this.getDistributionOverview();
    const targetZone = overview.zones_overview.find((z: any) => z.zone_id === zoneId);

    if (!targetZone) {
      const error: any = new Error("Zona sasaran tidak ditemukan di database.");
      error.statusCode = 404;
      throw error;
    }

    if (targetZone.remaining_capacity <= 0) {
      const error: any = new Error("Zona sudah penuh, silakan pilih zona lain.");
      error.statusCode = 400;
      throw error;
    }

    const assignment = await this.repo.createAssignment({
      rider_id: riderId,
      zone_id: zoneId,
      assigned_by: assignedBy,
      assignment_type: "MANUAL",
    });

    console.log(`   ✍️ [MANUAL PLOT] Rider ${riderId} -> Zona: ${targetZone.zone_name} (Oleh SPV/Admin)`);

    eventPublisher.publishRiderAssigned({
      assignmentId: assignment.id,
      riderId,
      zoneName: targetZone.zone_name,
      topsisRank: 1,
      assignmentType: "MANUAL",
    });

    await addRiderAssignedNotifJob({
      assignmentId: assignment.id,
      riderId,
      zoneName: targetZone.zone_name,
      topsisRank: 1,
      assignmentType: "MANUAL",
    });

    return {
      message: `Rider berhasil diploting secara manual ke ${targetZone.zone_name}.`,
      assignment: {
        ...assignment,
        zone_name: targetZone.zone_name,
      },
    };
  }

  /**
   * Fetch personal operational duty & assignment history for authenticated user
   */
  public async getMyDutyHistory(riderId: number | string, limit: number = 30): Promise<any> {
    if (!riderId) {
      const error: any = new Error("Rider ID required");
      error.statusCode = 400;
      throw error;
    }
    const history = await this.repo.getRiderDutyHistory(riderId, limit);
    return {
      rider_id: riderId,
      total_records: history.length,
      history,
    };
  }
}

export const distributionService = DistributionService.getInstance();
