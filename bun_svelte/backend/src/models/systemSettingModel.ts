import { pool } from "../config/database.js";

export const SystemSettingModel = {
  async getByKey(key: string) {
    const query = `SELECT * FROM system_settings WHERE key = $1;`;
    const { rows } = await pool.query(query, [key]);
    return rows[0];
  },

  async upsert(key: string, value: string, description = "") {
    const query = `
      INSERT INTO system_settings (key, value, description)
      VALUES ($1, $2, $3)
      ON CONFLICT (key) DO UPDATE SET
        value = EXCLUDED.value,
        description = EXCLUDED.description,
        updated_at = CURRENT_TIMESTAMP
      RETURNING *;
    `;
    const { rows } = await pool.query(query, [key, value, description]);
    return rows[0];
  }
};
