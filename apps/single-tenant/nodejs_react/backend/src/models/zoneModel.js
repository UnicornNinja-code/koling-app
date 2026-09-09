/*
 * zoneModel.js
 * Model for Zone CRUD and Spatial Queries (PostGIS)
 */

import { pool } from "../config/database.js";

export const ZoneModel = {
  /**
   * Find a zone by UUID, including active rider count
   */
  async findById(id) {
    const query = `
      SELECT 
        z.*,
        COALESCE((
          SELECT COUNT(za.id) 
          FROM zone_assignments za 
          WHERE za.zone_id = z.id 
            AND za.status = 'CHECKED_IN'
            AND za.assignment_date = CURRENT_DATE
        ), 0)::int AS active_riders_count
      FROM zones z 
      WHERE z.id = $1;
    `;
    const { rows } = await pool.query(query, [id]);
    return rows[0] || null;
  },

  /**
   * Find a zone by name (case-insensitive)
   */
  async findByName(name, excludeId = null) {
    let query = `SELECT * FROM zones WHERE LOWER(name) = LOWER($1)`;
    const values = [name.trim()];
    if (excludeId) {
      query += ` AND id != $2`;
      values.push(excludeId);
    }
    query += ` LIMIT 1;`;
    const { rows } = await pool.query(query, values);
    return rows[0] || null;
  },

  /**
   * Find all zones with optional status and search filter
   */
  async findAll({ status, search } = {}) {
    let query = `
      SELECT 
        z.*,
        COALESCE((
          SELECT COUNT(za.id) 
          FROM zone_assignments za 
          WHERE za.zone_id = z.id 
            AND za.status = 'CHECKED_IN'
            AND za.assignment_date = CURRENT_DATE
        ), 0)::int AS active_riders_count
      FROM zones z
      WHERE 1=1
    `;
    const values = [];
    let paramIndex = 1;

    if (status) {
      query += ` AND z.status = $${paramIndex}::"ZoneStatus"`;
      values.push(status.toUpperCase());
      paramIndex++;
    }

    if (search) {
      query += ` AND (z.name ILIKE $${paramIndex} OR z.description ILIKE $${paramIndex})`;
      values.push(`%${search}%`);
      paramIndex++;
    }

    query += ` ORDER BY z.name ASC;`;
    const { rows } = await pool.query(query, values);
    return rows;
  },

  /**
   * Create a new zone
   */
  async create({ name, description = "", max_capacity = 10, status = "ACTIVE", polygon }) {
    const query = `
      INSERT INTO zones (name, description, max_capacity, status, polygon)
      VALUES ($1, $2, $3, $4::"ZoneStatus", $5::jsonb)
      RETURNING *;
    `;
    const values = [name.trim(), description, parseInt(max_capacity, 10), status, JSON.stringify(polygon)];
    const { rows } = await pool.query(query, values);
    return rows[0];
  },

  /**
   * Update all fields of an existing zone
   */
  async update(id, { name, description, max_capacity, status, polygon }) {
    const setClauses = [];
    const values = [id];
    let paramIndex = 2;

    if (name !== undefined) {
      setClauses.push(`name = $${paramIndex}`);
      values.push(name.trim());
      paramIndex++;
    }
    if (description !== undefined) {
      setClauses.push(`description = $${paramIndex}`);
      values.push(description);
      paramIndex++;
    }
    if (max_capacity !== undefined) {
      setClauses.push(`max_capacity = $${paramIndex}`);
      values.push(parseInt(max_capacity, 10));
      paramIndex++;
    }
    if (status !== undefined) {
      setClauses.push(`status = $${paramIndex}::"ZoneStatus"`);
      values.push(status.toUpperCase());
      paramIndex++;
    }
    if (polygon !== undefined) {
      setClauses.push(`polygon = $${paramIndex}::jsonb`);
      values.push(JSON.stringify(polygon));
      paramIndex++;
    }

    if (setClauses.length === 0) {
      return this.findById(id);
    }

    const query = `
      UPDATE zones
      SET ${setClauses.join(", ")}
      WHERE id = $1
      RETURNING *;
    `;
    const { rows } = await pool.query(query, values);
    return rows[0] || null;
  },

  /**
   * Quick Edit: Update Zone Status (ACTIVE, RESTRICTED, INACTIVE)
   */
  async updateStatus(id, status) {
    const query = `
      UPDATE zones
      SET status = $2::"ZoneStatus"
      WHERE id = $1
      RETURNING *;
    `;
    const { rows } = await pool.query(query, [id, status.toUpperCase()]);
    return rows[0] || null;
  },

  /**
   * Quick Edit: Update Zone Max Capacity
   */
  async updateCapacity(id, max_capacity) {
    const query = `
      UPDATE zones
      SET max_capacity = $2
      WHERE id = $1
      RETURNING *;
    `;
    const { rows } = await pool.query(query, [id, parseInt(max_capacity, 10)]);
    return rows[0] || null;
  },

  /**
   * Delete a zone by ID
   */
  async delete(id) {
    const query = `
      DELETE FROM zones
      WHERE id = $1
      RETURNING *;
    `;
    const { rows } = await pool.query(query, [id]);
    return rows[0] || null;
  },

  /**
   * Check if there are active checked-in riders in a zone
   */
  async countActiveRiders(zoneId) {
    const query = `
      SELECT COUNT(id)::int AS count
      FROM zone_assignments
      WHERE zone_id = $1
        AND status = 'CHECKED_IN'
        AND assignment_date = CURRENT_DATE;
    `;
    const { rows } = await pool.query(query, [zoneId]);
    return rows[0]?.count || 0;
  },

  /**
   * Check spatial overlap using PostGIS ST_Intersects / ST_Overlaps against other active zones
   * @param {string} polygonGeoJsonStr GeoJSON string of the polygon geometry
   * @param {string|null} excludeZoneId Zone ID to exclude (for updates)
   * @returns {Promise<{id: string, name: string}|null>} Overlapping zone if exists
   */
  async checkPolygonOverlap(polygonGeoJsonStr, excludeZoneId = null) {
    const query = `
      SELECT id, name
      FROM zones
      WHERE status != 'INACTIVE'
        AND ($1::uuid IS NULL OR id != $1)
        AND polygon IS NOT NULL
        AND ST_Intersects(
          ST_SetSRID(ST_GeomFromGeoJSON($2), 4326),
          ST_SetSRID(ST_GeomFromGeoJSON(
            CASE 
              WHEN jsonb_typeof(polygon) = 'object' AND polygon->>'type' = 'Polygon' THEN polygon::text
              WHEN jsonb_typeof(polygon) = 'object' AND polygon->>'type' = 'Feature' THEN (polygon->>'geometry')::text
              ELSE polygon::text
            END
          ), 4326)
        )
        AND (
          ST_Overlaps(
            ST_SetSRID(ST_GeomFromGeoJSON($2), 4326),
            ST_SetSRID(ST_GeomFromGeoJSON(
              CASE 
                WHEN jsonb_typeof(polygon) = 'object' AND polygon->>'type' = 'Polygon' THEN polygon::text
                WHEN jsonb_typeof(polygon) = 'object' AND polygon->>'type' = 'Feature' THEN (polygon->>'geometry')::text
                ELSE polygon::text
              END
            ), 4326)
          )
          OR ST_Contains(
            ST_SetSRID(ST_GeomFromGeoJSON($2), 4326),
            ST_SetSRID(ST_GeomFromGeoJSON(
              CASE 
                WHEN jsonb_typeof(polygon) = 'object' AND polygon->>'type' = 'Polygon' THEN polygon::text
                WHEN jsonb_typeof(polygon) = 'object' AND polygon->>'type' = 'Feature' THEN (polygon->>'geometry')::text
                ELSE polygon::text
              END
            ), 4326)
          )
          OR ST_Within(
            ST_SetSRID(ST_GeomFromGeoJSON($2), 4326),
            ST_SetSRID(ST_GeomFromGeoJSON(
              CASE 
                WHEN jsonb_typeof(polygon) = 'object' AND polygon->>'type' = 'Polygon' THEN polygon::text
                WHEN jsonb_typeof(polygon) = 'object' AND polygon->>'type' = 'Feature' THEN (polygon->>'geometry')::text
                ELSE polygon::text
              END
            ), 4326)
          )
        )
      LIMIT 1;
    `;

    try {
      const { rows } = await pool.query(query, [excludeZoneId || null, polygonGeoJsonStr]);
      return rows[0] || null;
    } catch (err) {
      // If error occurs during ST_GeomFromGeoJSON calculation, log and ignore if geometry is unparseable
      console.warn("⚠️ Warning checking polygon overlap with PostGIS:", err.message);
      return null;
    }
  }
};
