/*
 * distributionRepository.ts
 * Data Access Layer for Operational Sessions, Distribution Runs, and Zone Assignments in TypeScript
 */

import { pool } from "../config/database.js";
import type { Pool } from "pg";

export class DistributionRepository {
  private static instance: DistributionRepository | null = null;
  private pool: Pool;

  constructor(dbPool: Pool = pool) {
    if (DistributionRepository.instance && dbPool === pool) {
      return DistributionRepository.instance;
    }
    this.pool = dbPool;
    if (dbPool === pool) {
      DistributionRepository.instance = this;
    }
  }

  public static getInstance(dbPool: Pool = pool): DistributionRepository {
    if (!DistributionRepository.instance) {
      DistributionRepository.instance = new DistributionRepository(dbPool);
    }
    return DistributionRepository.instance;
  }

  /**
   * Find or create today's active operational session based on current hour
   */
  public async findOrCreateCurrentSession(): Promise<any> {
    const now = new Date();
    const hour = now.getHours();
    let slot = "PAGI";
    let startTime = "06:00:00";
    let endTime = "10:00:00";

    if (hour >= 10 && hour < 14) {
      slot = "SIANG";
      startTime = "10:00:00";
      endTime = "14:00:00";
    } else if (hour >= 14 && hour < 18) {
      slot = "SORE";
      startTime = "14:00:00";
      endTime = "18:00:00";
    } else if (hour >= 18 || hour < 6) {
      slot = "MALAM";
      startTime = "18:00:00";
      endTime = "22:00:00";
    }

    const dateStr = now.toISOString().split("T")[0].replace(/-/g, "");
    const sessionCode = `${dateStr}-${slot}`;

    const query = `
      INSERT INTO operational_sessions (session_code, session_date, time_slot, start_time, end_time, status)
      VALUES ($1, CURRENT_DATE, $2, $3, $4, 'OPEN')
      ON CONFLICT (session_code) DO UPDATE 
      SET updated_at = CURRENT_TIMESTAMP
      RETURNING *;
    `;
    const { rows } = await this.pool.query(query, [sessionCode, slot, startTime, endTime]);
    return rows[0];
  }

  /**
   * Check if a rider is eligible for duty
   */
  public async checkRiderEligibility(riderId: number | string): Promise<{ eligible: boolean; reason?: string }> {
    // 1. Check user status
    const userQuery = `SELECT id, name, role, is_active FROM users WHERE id = $1;`;
    const { rows: userRows } = await this.pool.query(userQuery, [riderId]);
    const user = userRows[0];

    if (!user) {
      return { eligible: false, reason: "Akun rider tidak ditemukan." };
    }
    if (!user.is_active) {
      return { eligible: false, reason: "Akun rider sedang nonaktif. Hubungi manajemen." };
    }
    if (user.role !== "RIDER") {
      return { eligible: false, reason: "Hanya personel dengan peran RIDER yang dapat bertugas." };
    }

    // 2. Check active ongoing duty today
    const dutyCheckQuery = `
      SELECT id, status, zone_id 
      FROM zone_assignments 
      WHERE rider_id = $1 
        AND assignment_date = CURRENT_DATE 
        AND status IN ('ASSIGNED', 'CHECKED_IN');
    `;
    const { rows: dutyRows } = await this.pool.query(dutyCheckQuery, [riderId]);
    if (dutyRows.length > 0) {
      return { eligible: false, reason: "Rider sedang memiliki tugas aktif yang belum diselesaikan." };
    }

    return { eligible: true };
  }

  /**
   * Add rider to today's duty availability queue (FIFO)
   */
  public async addRiderToDutyQueue(riderId: number | string, sessionId?: string): Promise<any> {
    const query = `
      INSERT INTO rider_duty_queues (rider_id, duty_date, session_id, confirmed_at, status)
      VALUES ($1, CURRENT_DATE, $2, CURRENT_TIMESTAMP, 'WAITING')
      ON CONFLICT (rider_id, duty_date) DO UPDATE 
      SET status = 'WAITING', session_id = COALESCE(EXCLUDED.session_id, rider_duty_queues.session_id), confirmed_at = CURRENT_TIMESTAMP
      RETURNING *;
    `;
    const { rows } = await this.pool.query(query, [riderId, sessionId || null]);
    return rows[0];
  }

  /**
   * Fetch active waiting riders for today in FIFO order (First-In-First-Out)
   */
  public async getWaitingRidersQueue(sessionId?: string): Promise<any[]> {
    let query = `
      SELECT 
        q.id AS queue_id,
        q.rider_id,
        q.confirmed_at,
        q.status,
        q.eligibility_status,
        u.name AS rider_name,
        u.username AS rider_username,
        u.email AS rider_email,
        u.is_active AS rider_is_active
      FROM rider_duty_queues q
      JOIN users u ON q.rider_id = u.id
      WHERE q.duty_date = CURRENT_DATE 
        AND q.status = 'WAITING'
    `;
    const values: any[] = [];
    if (sessionId) {
      values.push(sessionId);
      query += ` AND (q.session_id = $1 OR q.session_id IS NULL)`;
    }
    query += ` ORDER BY q.confirmed_at ASC;`;

    const { rows } = await this.pool.query(query, values);
    return rows;
  }

  /**
   * Count currently assigned riders per zone today
   */
  public async getAssignedRidersCountPerZone(sessionId?: string): Promise<Record<string | number, number>> {
    let query = `
      SELECT zone_id, COUNT(*)::int AS assigned_count
      FROM zone_assignments
      WHERE assignment_date = CURRENT_DATE
        AND status IN ('ASSIGNED', 'CHECKED_IN', 'COMPLETED')
    `;
    const values: any[] = [];
    if (sessionId) {
      values.push(sessionId);
      query += ` AND (session_id = $1 OR session_id IS NULL)`;
    }
    query += ` GROUP BY zone_id;`;

    const { rows } = await this.pool.query(query, values);
    const countMap: Record<string | number, number> = {};
    rows.forEach((r: any) => {
      countMap[r.zone_id] = parseInt(r.assigned_count, 10);
    });
    return countMap;
  }

  /**
   * Commit a batch distribution run transaction (ACID)
   */
  public async commitBatchDistribution({
    sessionId,
    executionType = "AUTO",
    executedBy = null,
    dssSnapshot = {},
    allocations,
    unassignedRiders = [],
  }: {
    sessionId?: string | null;
    executionType?: string;
    executedBy?: string | null;
    dssSnapshot?: any;
    allocations: Array<{
      rider_id: string | number;
      zone_id: string | number;
      topsis_score?: number;
      compatibility_score?: number;
      distance_km?: number;
      reason?: string;
    }>;
    unassignedRiders?: Array<{
      rider_id: string | number;
      reason?: string;
    }>;
  }): Promise<any> {
    const client = await this.pool.connect();
    try {
      await client.query("BEGIN");

      // 1. Create Distribution Run record
      const runNumber = `RUN-${Date.now()}`;
      const runQuery = `
        INSERT INTO distribution_runs (
          session_id, run_number, execution_type, dss_snapshot,
          total_riders, assigned_count, unassigned_count, executed_by
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING *;
      `;
      const totalRiders = allocations.length + unassignedRiders.length;
      const { rows: runRows } = await client.query(runQuery, [
        sessionId || null,
        runNumber,
        executionType,
        JSON.stringify(dssSnapshot),
        totalRiders,
        allocations.length,
        unassignedRiders.length,
        executedBy || null,
      ]);
      const distributionRun = runRows[0];

      const createdAssignments: any[] = [];

      // 2. Insert items and create zone_assignments
      for (const item of allocations) {
        // Insert run item
        await client.query(
          `INSERT INTO distribution_run_items (
             run_id, rider_id, zone_id, topsis_score, compatibility_score, distance_km, status, reason
           )
           VALUES ($1, $2, $3, $4, $5, $6, 'ASSIGNED', $7);`,
          [
            distributionRun.id,
            item.rider_id,
            item.zone_id,
            item.topsis_score || null,
            item.compatibility_score || null,
            item.distance_km || null,
            item.reason || "Kapasitas & kecocokan zona prioritas TOPSIS",
          ]
        );

        // Insert or update zone_assignments
        const assignQuery = `
          INSERT INTO zone_assignments (
            rider_id, zone_id, session_id, assigned_by, assignment_type, assignment_date, status
          )
          VALUES ($1, $2, $3, $4, $5, CURRENT_DATE, 'ASSIGNED')
          ON CONFLICT (rider_id, assignment_date) DO UPDATE
          SET zone_id = EXCLUDED.zone_id,
              session_id = EXCLUDED.session_id,
              assigned_by = EXCLUDED.assigned_by,
              assignment_type = EXCLUDED.assignment_type,
              status = 'ASSIGNED',
              created_at = CURRENT_TIMESTAMP
          RETURNING *;
        `;
        const { rows: assignRows } = await client.query(assignQuery, [
          item.rider_id,
          item.zone_id,
          sessionId || null,
          executedBy || null,
          executionType,
        ]);
        createdAssignments.push(assignRows[0]);

        // Update rider_duty_queues
        await client.query(
          `UPDATE rider_duty_queues 
           SET status = 'PLOTTED' 
           WHERE rider_id = $1 AND duty_date = CURRENT_DATE;`,
          [item.rider_id]
        );
      }

      // 3. Record unassigned run items
      for (const unassigned of unassignedRiders) {
        await client.query(
          `INSERT INTO distribution_run_items (
             run_id, rider_id, status, reason
           )
           VALUES ($1, $2, 'UNASSIGNED', $3);`,
          [
            distributionRun.id,
            unassigned.rider_id,
            unassigned.reason || "Kapasitas zona telah terpenuhi",
          ]
        );
      }

      await client.query("COMMIT");
      return {
        run: distributionRun,
        assignments: createdAssignments,
      };
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Create manual zone assignment for a rider
   */
  public async createAssignment({
    rider_id,
    zone_id,
    session_id = null,
    assigned_by = null,
    assignment_type = "MANUAL",
  }: {
    rider_id: number | string;
    zone_id: number | string;
    session_id?: number | string | null;
    assigned_by?: number | string | null;
    assignment_type?: string;
  }): Promise<any> {
    const client = await this.pool.connect();
    try {
      await client.query("BEGIN");

      // 1. Insert into zone_assignments
      const assignQuery = `
        INSERT INTO zone_assignments (rider_id, zone_id, session_id, assigned_by, assignment_type, assignment_date, status)
        VALUES ($1, $2, $3, $4, $5, CURRENT_DATE, 'ASSIGNED')
        ON CONFLICT (rider_id, assignment_date) DO UPDATE
        SET zone_id = EXCLUDED.zone_id,
            session_id = EXCLUDED.session_id,
            assigned_by = EXCLUDED.assigned_by,
            assignment_type = EXCLUDED.assignment_type,
            status = 'ASSIGNED',
            created_at = CURRENT_TIMESTAMP
        RETURNING *;
      `;
      const { rows } = await client.query(assignQuery, [
        rider_id,
        zone_id,
        session_id || null,
        assigned_by,
        assignment_type,
      ]);
      const assignment = rows[0];

      // 2. Mark queue status as PLOTTED
      await client.query(
        `UPDATE rider_duty_queues SET status = 'PLOTTED' WHERE rider_id = $1 AND duty_date = CURRENT_DATE;`,
        [rider_id]
      );

      await client.query("COMMIT");
      return assignment;
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Fetch all past distribution runs with item counts and executor details
   */
  public async findAllDistributionRuns(limit = 20): Promise<any[]> {
    const query = `
      SELECT 
        dr.*,
        u.name AS executed_by_name,
        os.session_code,
        os.time_slot
      FROM distribution_runs dr
      LEFT JOIN users u ON dr.executed_by = u.id
      LEFT JOIN operational_sessions os ON dr.session_id = os.id
      ORDER BY dr.executed_at DESC
      LIMIT $1;
    `;
    const { rows } = await this.pool.query(query, [limit]);
    return rows;
  }

  /**
   * Fetch personal operational duty & assignment history for a specific rider
   */
  public async getRiderDutyHistory(riderId: number | string, limit = 30): Promise<any[]> {
    const query = `
      SELECT 
        za.id AS assignment_id,
        za.assignment_date,
        za.assignment_type,
        za.status AS assignment_status,
        za.created_at AS assigned_at,
        z.id AS zone_id,
        z.name AS zone_name,
        a.id AS armada_id,
        a.code AS armada_code,
        a.type AS armada_type,
        q.confirmed_at AS duty_confirmed_at,
        q.status AS queue_status
      FROM zone_assignments za
      JOIN zones z ON za.zone_id = z.id
      LEFT JOIN armadas a ON za.armada_id = a.id
      LEFT JOIN rider_duty_queues q ON q.rider_id = za.rider_id AND q.duty_date = za.assignment_date
      WHERE za.rider_id = $1
      ORDER BY za.assignment_date DESC, za.created_at DESC
      LIMIT $2;
    `;
    const { rows } = await this.pool.query(query, [riderId, limit]);
    return rows;
  }

  /**
   * Fetch all zone assignments for today across all riders
   */
  public async getAllTodayAssignments(): Promise<any[]> {
    const query = `
      SELECT 
        za.id AS id,
        za.rider_id,
        u.name AS rider_name,
        u.email AS rider_email,
        za.zone_id,
        z.name AS zone_name,
        za.armada_id,
        a.code AS armada_code,
        a.type AS armada_type,
        za.assignment_type,
        za.assignment_date,
        za.status,
        za.check_in_time,
        za.check_out_time,
        za.created_at
      FROM zone_assignments za
      JOIN users u ON za.rider_id = u.id
      JOIN zones z ON za.zone_id = z.id
      LEFT JOIN armadas a ON za.armada_id = a.id
      WHERE za.assignment_date = CURRENT_DATE
      ORDER BY za.created_at DESC;
    `;
    const { rows } = await this.pool.query(query);
    return rows;
  }

  /**
   * Update duty queue status (e.g. NO_SHOW, CANCELLED)
   */
  public async updateDutyQueueStatus(riderId: number | string, status: string, notes?: string): Promise<any> {
    const query = `
      UPDATE rider_duty_queues
      SET status = $2, notes = COALESCE($3, notes)
      WHERE rider_id = $1 AND duty_date = CURRENT_DATE
      RETURNING *;
    `;
    const { rows } = await this.pool.query(query, [riderId, status, notes || null]);
    return rows[0];
  }
}

export const distributionRepository = DistributionRepository.getInstance();
