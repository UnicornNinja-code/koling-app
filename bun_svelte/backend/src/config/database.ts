import pg from "pg";
import { env } from "./env.js";

const { Pool } = pg;

export const pool = new Pool({
  host: env.DB.HOST,
  user: env.DB.USER,
  port: env.DB.PORT,
  password: env.DB.PASSWORD,
  database: env.DB.NAME,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});

pool.connect((err, client, release) => {
  if (err) {
    console.error("❌ Gagal terhubung ke PostgreSQL:", err.message);
    return;
  }
  console.log("🐘 PostgreSQL & PostGIS berhasil terhubung!");
  release?.();
});
