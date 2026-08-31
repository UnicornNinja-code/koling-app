/*
 * armadaRepository.ts
 * Data Access Layer for armadas Table in TypeScript
 */

import { pool } from "../config/database.js";
import type { Pool } from "pg";
import type { Armada, ArmadaStatus } from "../types/fleet.types.js";

export class ArmadaRepository {
  private static instance: ArmadaRepository | null = null;
  private pool: Pool;

  constructor(dbPool: Pool = pool) {
    if (ArmadaRepository.instance && dbPool === pool) {
      return ArmadaRepository.instance;
    }
    this.pool = dbPool;
    if (dbPool === pool) {
      ArmadaRepository.instance = this;
    }
  }

  public static getInstance(dbPool: Pool = pool): ArmadaRepository {
    if (!ArmadaRepository.instance) {
      ArmadaRepository.instance = new ArmadaRepository(dbPool);
    }
    return ArmadaRepository.instance;
  }

  /**
   * Fetch all armada units with optional filters (status, type)
   */
  public async findAll(filters: { status?: string; type?: string } = {}): Promise<Armada[]> {
    const { status, type } = filters;
    let query = `
      SELECT 
        a.id,
        a.code,
        a.type,
        a.status,
        a.current_rider_id,
        u.name AS current_rider_name,
        a.created_at,
        a.updated_at
      FROM armadas a
      LEFT JOIN users u ON a.current_rider_id = u.id
      WHERE 1=1
    `;
    const values: any[] = [];

    if (status) {
      values.push(status);
      query += ` AND a.status = $${values.length}`;
    }
    if (type) {
      values.push(type);
      query += ` AND a.type = $${values.length}`;
    }

    query += ` ORDER BY a.code ASC;`;

    const { rows } = await this.pool.query(query, values);
    return rows;
  }

  /**
   * Fetch single armada unit by ID
   */
  public async findById(id: number | string): Promise<Armada | null> {
    const query = `
      SELECT 
        a.id,
        a.code,
        a.type,
        a.status,
        a.current_rider_id,
        u.name AS current_rider_name,
        a.created_at,
        a.updated_at
      FROM armadas a
      LEFT JOIN users u ON a.current_rider_id = u.id
      WHERE a.id = $1;
    `;
    const { rows } = await this.pool.query(query, [id]);
    return rows[0] || null;
  }

  /**
   * Fetch single armada unit by code / serial number (case insensitive)
   */
  public async findByCode(code: string): Promise<Armada | null> {
    const query = `SELECT * FROM armadas WHERE LOWER(code) = LOWER($1);`;
    const { rows } = await this.pool.query(query, [code]);
    return rows[0] || null;
  }

  /**
   * Create a new armada unit
   */
  public async create({
    code,
    type = "GEROBAK",
    status = "AVAILABLE",
  }: {
    code: string;
    type?: string;
    status?: ArmadaStatus | string;
  }): Promise<Armada> {
    const query = `
      INSERT INTO armadas (code, type, status)
      VALUES ($1, $2, $3)
      RETURNING *;
    `;
    const { rows } = await this.pool.query(query, [code, type, status]);
    return rows[0];
  }

  /**
   * Update armada unit details or status
   */
  public async update(
    id: number | string,
    {
      code,
      type,
      status,
      current_rider_id,
    }: {
      code?: string;
      type?: string;
      status?: ArmadaStatus | string;
      current_rider_id?: number | string | null;
    }
  ): Promise<Armada | null> {
    const query = `
      UPDATE armadas 
      SET 
        code = COALESCE($2, code),
        type = COALESCE($3, type),
        status = COALESCE($4, status),
        current_rider_id = $5,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING *;
    `;
    const { rows } = await this.pool.query(query, [
      id,
      code || null,
      type || null,
      status || null,
      current_rider_id !== undefined ? current_rider_id : null,
    ]);
    return rows[0] || null;
  }

  /**
   * Delete armada unit by ID
   */
  public async delete(id: number | string): Promise<Armada | null> {
    const query = `DELETE FROM armadas WHERE id = $1 RETURNING *;`;
    const { rows } = await this.pool.query(query, [id]);
    return rows[0] || null;
  }
}

export const armadaRepository = ArmadaRepository.getInstance();
