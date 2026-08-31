/*
 * migrate.ts
 * Database migration runner in TypeScript
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { pool } from "../config/database.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function runMigration() {
  try {
    const dbDir = path.join(__dirname, "../db");

    console.log("⏳ [1/4] Memproses migrasi skema utama (schema.sql)...");
    const sqlMaster = fs.readFileSync(path.join(dbDir, "schema.sql"), "utf8");
    await pool.query(sqlMaster);

    console.log("⏳ [2/4] Memproses migrasi 001 (001_poi_eligibility_and_candidate_spots.sql)...");
    const sql001 = fs.readFileSync(path.join(dbDir, "migrations/001_poi_eligibility_and_candidate_spots.sql"), "utf8");
    await pool.query(sql001);

    console.log("⏳ [3/4] Memproses migrasi 002 (002_protocol_roads_spatial_layer.sql)...");
    const sql002 = fs.readFileSync(path.join(dbDir, "migrations/002_protocol_roads_spatial_layer.sql"), "utf8");
    await pool.query(sql002);

    console.log("⏳ [4/4] Memproses migrasi 003 (003_add_zone_invalid_reason.sql)...");
    const sql003 = fs.readFileSync(path.join(dbDir, "migrations/003_add_zone_invalid_reason.sql"), "utf8");
    await pool.query(sql003);

    console.log("✅ Seluruh skema database dan migrasi (001, 002, 003) berhasil dieksekusi!");
  } catch (error: any) {
    console.error("❌ Gagal migrasi database:", error.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

runMigration();
