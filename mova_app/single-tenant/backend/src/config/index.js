import { env } from "./env.js";
import { pool } from "./database.js";
import { redisClient } from "./redis.js";

// Fungsi untuk mengecek semua koneksi sebelum server dinyalakan
export const initConfigurations = () => {
  return Promise.all([
    pool.query("SELECT 1"), // Cek Postgres
    redisClient.ping()      // Cek Redis
  ]);
};

// Re-export agar bisa dipakai di seluruh aplikasi
export { env, pool, redisClient };