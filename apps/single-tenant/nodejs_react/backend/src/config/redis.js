import { createClient } from "redis";
import { env } from "./env.js";

const redisClient = createClient({
  socket: {
    host: env.REDIS.HOST || "127.0.0.1",
    port: Number(env.REDIS.PORT || 6379),
    reconnectStrategy: (retries) => {
      return Math.min(retries * 50, 2000);
    },
  },
  password: env.REDIS.PASSWORD || undefined,
});

redisClient.on("connect", () => {
  console.log("⚡ Redis Client: Menghubungkan...");
});

redisClient.on("ready", () => {
  console.log("🔴 Redis Server berhasil terhubung & siap digunakan!");
});

redisClient.on("error", (err) => {
  console.error("❌ Redis Client Error:", err.message);
});

redisClient.on("end", () => {
  console.log("🔌 Sambungan Redis terputus.");
});

// 3. Melakukan Panggilan / Menekan Tombol Sambung
// Menangani proses asynchronous dengan .catch()
redisClient.connect().catch((err) => {
  console.error("❌ Gagal menyambungkan Redis Client di awal:", err.message);
});

export { redisClient };