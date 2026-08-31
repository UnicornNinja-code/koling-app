import { pool } from "../config/database.js";

export const RefreshTokenModel = {
  async create({ id, token, userId, expiresAt }) {
    const query = `
      INSERT INTO refresh_tokens (id, token, user_id, expires_at)
      VALUES ($1, $2, $3, $4)
      RETURNING *;
    `;
    const values = [id, token, userId, expiresAt];
    const { rows } = await pool.query(query, values);
    return rows[0];
  },

  async findByToken(token) {
    const query = `
      SELECT * FROM refresh_tokens 
      WHERE token = $1;
    `;
    const { rows } = await pool.query(query, [token]);
    return rows[0];
  },

  async findValidToken(token) {
    const query = `
      SELECT * FROM refresh_tokens 
      WHERE token = $1 AND revoked = FALSE AND expires_at > CURRENT_TIMESTAMP;
    `;
    const { rows } = await pool.query(query, [token]);
    return rows[0];
  },

  async revoke(token) {
    const query = `
      UPDATE refresh_tokens 
      SET revoked = TRUE 
      WHERE token = $1 
      RETURNING id;
    `;
    const { rows } = await pool.query(query, [token]);
    return rows[0];
  },

  async revokeAllForUser(userId) {
    const query = `
      UPDATE refresh_tokens 
      SET revoked = TRUE 
      WHERE user_id = $1 AND revoked = FALSE;
    `;
    await pool.query(query, [userId]);
  }
};