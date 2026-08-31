/*
 * distributionRepository.ts
 * Data Access Layer for rider_duty_queues and zone_assignments in TypeScript
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
   * Add rider to today's duty availability queue (FIFO)
   */
  public async addRiderToDutyQueue(riderId: number | string): Promise<any> {
    const query = `
      INSERT INTO rider_duty_queues (rider_id, duty_date, confirmed_at, status)
      VALUES ($1, CURRENT_DATE, CURRENT_TIMESTAMP, 'WAITING')
      ON CONFLICT (rider_id, duty_date) DO UPDATE 
      SET status = 'WAITING', confirmed_at = CURRENT_TIMESTAMP
      RETURNING *;
    `;
    const { rows } = await this.pool.query(query, [riderId]);
    return rows[0];
  }

  /**
   * Fetch active waiting riders for today in FIFO order (First-In-First-Out)
   */
  public async getWaitingRidersQueue(): Promise<any[]> {
    const query = `
      SELECT 
        q.id AS queue_id,
        q.rider_id,
        q.confirmed_at,
        q.status,
        u.name AS rider_name,
        u.username AS rider_username,
        u.email AS rider_email
      FROM rider_duty_queues q
      JOIN users u ON q.rider_id = u.id
      WHERE q.duty_date = CURRENT_DATE 
        AND q.status = 'WAITING'
      ORDER BY q.confirmed_at ASC;
    `;
    const { rows } = await this.pool.query(query);
    return rows;
  }

  /**
   * Count currently assigned riders per zone today
   */
  public async getAssignedRidersCountPerZone(): Promise<Record<string | number, number>> {
    const query = `
      SELECT zone_id, COUNT(*)::int AS assigned_count
      FROM zone_assignments
      WHERE assignment_date = CURRENT_DATE
        AND status IN ('ASSIGNED', 'CHECKED_IN', 'COMPLETED')
      GROUP BY zone_id;
    `;
    const { rows } = await this.pool.query(query);
    const countMap: Record<string | number, number> = {};
    rows.forEach((r: any) => {
      countMap[r.zone_id] = parseInt(r.assigned_count, 10);
    });
    return countMap;
  }

  /**
   * Create zone assignment for rider & update duty queue status
   */
  public async createAssignment({
    rider_id,
    zone_id,
    assigned_by = null,
    assignment_type = "AUTO",
  }: {
    rider_id: number | string;
    zone_id: number | string;
    assigned_by?: number | string | null;
    assignment_type?: string;
  }): Promise<any> {
    const client = await this.pool.connect();
    try {
      await client.query("BEGIN");

      // 1. Insert into zone_assignments
      const assignQuery = `
        INSERT INTO zone_assignments (rider_id, zone_id, assigned_by, assignment_type, assignment_date, status)
        VALUES ($1, $2, $3, $4, CURRENT_DATE, 'ASSIGNED')
        ON CONFLICT (rider_id, assignment_date) DO UPDATE
        SET zone_id = EXCLUDED.zone_id,
            assigned_by = EXCLUDED.assigned_by,
            assignment_type = EXCLUDED.assignment_type,
            status = 'ASSIGNED',
            created_at = CURRENT_TIMESTAMP
        RETURNING *;
      `;
      const { rows } = await client.query(assignQuery, [
        rider_id,
        zone_id,
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
   * Reset today's distribution assignments and duty queue for testing
   */
  public async resetTodayDistribution(): Promise<void> {
    await this.pool.query("DELETE FROM zone_assignments WHERE assignment_date = CURRENT_DATE;");
    await this.pool.query("DELETE FROM rider_duty_queues WHERE duty_date = CURRENT_DATE;");
  }
}

export const distributionRepository = DistributionRepository.getInstance();
