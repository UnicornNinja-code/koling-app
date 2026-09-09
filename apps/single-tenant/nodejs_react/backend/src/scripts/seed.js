/*
 *   Copyright (c) 2026 
 *   All rights reserved.
 *   Clean Initial Seed Script — Baseline Master Data Tanpa Data Bohongan
 */

import bcrypt from "bcrypt";
import { pool } from "../config/database.js";

async function seedCleanData() {
  console.log("🌱 Memulai Seeding Master Data Bersih (Fase Uji Awal)...");

  try {
    // 0. Pengosongan Tabel Transaksional & Log Sampah
    console.log("⏳ Membersihkan tabel transaksional & log lama...");
    await pool.query(`
      TRUNCATE TABLE 
        sales_logs, 
        recommendations, 
        dss_histories, 
        sessions, 
        zone_assignments, 
        rider_duty_queues, 
        competitors, 
        audit_logs, 
        refresh_tokens, 
        password_reset_tokens
      CASCADE;
    `);

    // 1. Skema Kategori POI & Protocol Roads Helper
    await pool.query(`
      CREATE TABLE IF NOT EXISTS poi_categories (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        name varchar(255) UNIQUE NOT NULL,
        is_active boolean NOT NULL DEFAULT true,
        score_pagi int NOT NULL DEFAULT 1 CHECK (score_pagi BETWEEN 1 AND 5),
        score_siang int NOT NULL DEFAULT 1 CHECK (score_siang BETWEEN 1 AND 5),
        score_sore int NOT NULL DEFAULT 1 CHECK (score_sore BETWEEN 1 AND 5),
        score_malam int NOT NULL DEFAULT 1 CHECK (score_malam BETWEEN 1 AND 5),
        created_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS protocol_roads (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        name varchar(255),
        highway_type varchar(100),
        geometry jsonb NOT NULL,
        created_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
      );

      ALTER TABLE pois DROP COLUMN IF EXISTS zone_id;
    `);

    // 2. Akun Pengguna Utama (Clean Accounts Only)
    console.log("⏳ Seeding Akun Pengguna Utama (Clean RBAC)...");
    const defaultPasswordHash = await bcrypt.hash("password123", 10);

    const usersData = [
      {
        email: "superadmin@kopikeliling.com",
        username: "superadmin",
        password: defaultPasswordHash,
        name: "Super Admin System",
        role: "SUPERADMIN",
      },
      {
        email: "supervisor@kopikeliling.com",
        username: "supervisor1",
        password: defaultPasswordHash,
        name: "Supervisor Operasional Sidoarjo",
        role: "SUPERVISOR",
      },
      {
        email: "rider@kopikeliling.com",
        username: "rider1",
        password: defaultPasswordHash,
        name: "Rider Operasional Utama",
        role: "RIDER",
      },
    ];

    // Clear non-essential users
    await pool.query("DELETE FROM users WHERE email NOT IN ('superadmin@kopikeliling.com', 'supervisor@kopikeliling.com', 'rider@kopikeliling.com');");

    for (const u of usersData) {
      const query = `
        INSERT INTO users (email, username, password, name, role)
        VALUES ($1, $2, $3, $4, $5::"Role")
        ON CONFLICT (email) DO UPDATE SET
          username = EXCLUDED.username,
          password = EXCLUDED.password,
          name = EXCLUDED.name,
          role = EXCLUDED.role;
      `;
      await pool.query(query, [u.email, u.username, u.password, u.name, u.role]);
    }
    console.log(`✅ ${usersData.length} akun pengguna utama (Superadmin & Rider) berhasil disiapkan.`);

    // 3. Kriteria SPK BWM-TOPSIS Standard
    console.log("⏳ Seeding Kriteria SPK Standar...");
    const criteriasData = [
      { name: "C1 - Densitas POI", type: "BENEFIT" },
      { name: "C2 - Diversitas POI", type: "BENEFIT" },
      { name: "C3 - Skor Keramaian Waktu", type: "BENEFIT" },
      { name: "C4 - Kondisi Cuaca", type: "COST" },
      { name: "C5 - Jarak Rider dari Hub ke Zona", type: "COST" },
      { name: "C6 - Jumlah Kompetitor di Zona", type: "COST" },
    ];

    for (const c of criteriasData) {
      const query = `
        INSERT INTO criterias (name, type, is_active)
        SELECT $1::text, $2::"CriteriaType", true
        WHERE NOT EXISTS (SELECT 1 FROM criterias WHERE name = $1::text);
      `;
      await pool.query(query, [c.name, c.type]);
    }
    console.log(`✅ ${criteriasData.length} kriteria SPK standar berhasil disiapkan.`);

    // 4. Kategori POI Matriks Skor Keramaian Waktu (Likert 1-5)
    console.log("⏳ Seeding 51 Kategori POI & Matriks Keramaian Waktu...");
    const poiCategoriesData = [
      { name: "Hotel & Penginapan", pagi: 3, siang: 2, sore: 3, malam: 4 },
      { name: "Kafe & Kedai Kopi", pagi: 2, siang: 3, sore: 5, malam: 5 },
      { name: "Cepat Saji", pagi: 2, siang: 4, sore: 4, malam: 5 },
      { name: "Food Court", pagi: 2, siang: 5, sore: 4, malam: 5 },
      { name: "Restoran", pagi: 2, siang: 5, sore: 3, malam: 5 },
      { name: "Toko Minuman", pagi: 2, siang: 4, sore: 5, malam: 4 },
      { name: "Toko Roti & Kue", pagi: 3, siang: 3, sore: 4, malam: 3 },
      { name: "Minimarket", pagi: 3, siang: 4, sore: 4, malam: 4 },
      { name: "Supermarket", pagi: 2, siang: 4, sore: 4, malam: 4 },
      { name: "Mall / Pusat Perbelanjaan", pagi: 2, siang: 4, sore: 5, malam: 5 },
      { name: "Pasar Tradisional", pagi: 5, siang: 4, sore: 2, malam: 1 },
      { name: "Toko Bangunan", pagi: 3, siang: 4, sore: 3, malam: 1 },
      { name: "Toko Mebel", pagi: 2, siang: 3, sore: 3, malam: 1 },
      { name: "Toko HP & Gadget", pagi: 2, siang: 4, sore: 4, malam: 3 },
      { name: "Provider & Telekomunikasi", pagi: 3, siang: 4, sore: 3, malam: 2 },
      { name: "Toko Elektronik", pagi: 2, siang: 4, sore: 4, malam: 2 },
      { name: "Studio & Fotografi", pagi: 2, siang: 3, sore: 3, malam: 2 },
      { name: "Jasa Pengiriman & Logistik", pagi: 4, siang: 5, sore: 4, malam: 2 },
      { name: "Toko Retail (Umum)", pagi: 3, siang: 4, sore: 4, malam: 3 },
      { name: "Sekolah Dasar (SD/MI)", pagi: 5, siang: 4, sore: 1, malam: 1 },
      { name: "Sekolah Menengah Pertama (SMP/MTs)", pagi: 5, siang: 4, sore: 2, malam: 1 },
      { name: "Sekolah Menengah Atas (SMA/SMK/MA)", pagi: 5, siang: 4, sore: 2, malam: 1 },
      { name: "Sekolah (Umum)", pagi: 5, siang: 4, sore: 2, malam: 1 },
      { name: "Perguruan Tinggi", pagi: 4, siang: 5, sore: 4, malam: 3 },
      { name: "Taman Kanak-Kanak / PAUD", pagi: 5, siang: 3, sore: 1, malam: 1 },
      { name: "Pondok Pesantren", pagi: 3, siang: 3, sore: 3, malam: 3 },
      { name: "Rumah Sakit", pagi: 4, siang: 4, sore: 4, malam: 3 },
      { name: "Klinik & Puskesmas", pagi: 4, siang: 4, sore: 3, malam: 2 },
      { name: "Apotek", pagi: 3, siang: 4, sore: 4, malam: 3 },
      { name: "Layanan Pemerintahan", pagi: 4, siang: 5, sore: 3, malam: 1 },
      { name: "Fasilitas Warga & Balai", pagi: 2, siang: 3, sore: 4, malam: 3 },
      { name: "Bengkel & Otomotif", pagi: 3, siang: 4, sore: 4, malam: 1 },
      { name: "Pangkas Rambut & Salon", pagi: 2, siang: 3, sore: 4, malam: 3 },
      { name: "Taman Kota / Terbuka", pagi: 4, siang: 2, sore: 5, malam: 4 },
      { name: "Fasilitas Olahraga", pagi: 4, siang: 2, sore: 5, malam: 4 },
      { name: "Kolam Renang / Rekreasi Air", pagi: 3, siang: 4, sore: 4, malam: 1 },
      { name: "Masjid & Mushola", pagi: 3, siang: 4, sore: 4, malam: 5 },
      { name: "Gereja", pagi: 4, siang: 3, sore: 3, malam: 2 },
      { name: "Pura", pagi: 3, siang: 2, sore: 3, malam: 2 },
      { name: "Vihara", pagi: 3, siang: 2, sore: 3, malam: 2 },
      { name: "Tempat Ibadah (Lainnya)", pagi: 3, siang: 3, sore: 3, malam: 2 },
      { name: "Stasiun Kereta Api", pagi: 5, siang: 4, sore: 5, malam: 3 },
      { name: "Halte / Terminal Bus", pagi: 5, siang: 4, sore: 5, malam: 3 },
      { name: "Fasilitas Transit & Shelter", pagi: 4, siang: 3, sore: 4, malam: 2 },
      { name: "Fasilitas Parkir", pagi: 4, siang: 4, sore: 4, malam: 3 },
      { name: "Pemakaman", pagi: 3, siang: 2, sore: 2, malam: 1 },
      { name: "Bank & Finansial", pagi: 4, siang: 5, sore: 3, malam: 1 },
      { name: "ATM / Mesin Tunai", pagi: 3, siang: 4, sore: 4, malam: 3 },
      { name: "Perkantoran Komersial", pagi: 4, siang: 5, sore: 4, malam: 2 },
      { name: "SPBU / Stasiun Pengisian Bahan Bakar", pagi: 4, siang: 4, sore: 5, malam: 3 },
      { name: "Lainnya", pagi: 2, siang: 2, sore: 2, malam: 2 }
    ];

    for (const cat of poiCategoriesData) {
      const query = `
        INSERT INTO poi_categories (name, is_active, score_pagi, score_siang, score_sore, score_malam)
        VALUES ($1, true, $2, $3, $4, $5)
        ON CONFLICT (name) DO UPDATE SET
          is_active = true,
          score_pagi = EXCLUDED.score_pagi,
          score_siang = EXCLUDED.score_siang,
          score_sore = EXCLUDED.score_sore,
          score_malam = EXCLUDED.score_malam;
      `;
      await pool.query(query, [cat.name, cat.pagi, cat.siang, cat.sore, cat.malam]);
    }
    console.log(`✅ ${poiCategoriesData.length} matriks kategori POI disiapkan.`);

    // 5. Konfigurasi Sistem (System Settings)
    console.log("⏳ Seeding Konfigurasi Sistem...");
    const settingsData = [
      {
        key: "HUB_CITY_NAME",
        value: "Sidoarjo",
        description: "Nama Kota Hub/Gudang Operasional",
      },
      {
        key: "HUB_LATITUDE",
        value: "-7.397402184098715",
        description: "Koordinat Hub Sidoarjo (Latitude)",
      },
      {
        key: "HUB_LONGITUDE",
        value: "112.71195887495875",
        description: "Koordinat Hub Sidoarjo (Longitude)",
      },
      {
        key: "HUB_BOUNDS_BUFFER",
        value: "0.15",
        description: "Buffer Wilayah Spasial Operasional (Degree Padding)",
      },
      {
        key: "DEFAULT_DSS_ACTIVE",
        value: "true",
        description: "Status aktif default Sistem Pendukung Keputusan",
      },
    ];

    for (const s of settingsData) {
      const query = `
        INSERT INTO system_settings (key, value, description)
        VALUES ($1, $2, $3)
        ON CONFLICT (key) DO UPDATE SET
          value = EXCLUDED.value,
          description = EXCLUDED.description;
      `;
      await pool.query(query, [s.key, s.value, s.description]);
    }
    console.log(`✅ ${settingsData.length} konfigurasi sistem disiapkan.`);

    // 6. Master Produk Menu
    console.log("⏳ Seeding Master Produk...");
    const productsData = [
      {
        name: "Es Kopi Susu Gula Aren",
        description: "Espresso dengan susu segar dan gula aren murni",
        price: 18000,
        status: "AVAILABLE",
      },
      {
        name: "Kopi Hitam (Americano)",
        description: "Espresso blend robusta-arabika hangat/dingin",
        price: 12000,
        status: "AVAILABLE",
      },
      {
        name: "Matcha Latte Premium",
        description: "Matcha Uji Jepang dengan susu segar",
        price: 20000,
        status: "AVAILABLE",
      },
    ];

    for (const p of productsData) {
      const query = `
        INSERT INTO products (name, description, price, status)
        SELECT $1::text, $2::text, $3::double precision, $4::"ProductStatus"
        WHERE NOT EXISTS (SELECT 1 FROM products WHERE name = $1::text);
      `;
      await pool.query(query, [p.name, p.description, p.price, p.status]);
    }
    console.log(`✅ ${productsData.length} master produk disiapkan.`);

    // 7. Master Unit Armada Operasional Real
    console.log("⏳ Seeding Master Armada...");
    const armadasData = [
      { code: "ARM-ML-001", type: "MOTOR_LISTRIK", status: "ACTIVE" },
      { code: "ARM-GB-001", type: "GEROBAK", status: "ACTIVE" },
    ];

    for (const a of armadasData) {
      const query = `
        INSERT INTO armadas (code, type, status)
        VALUES ($1, $2::"ArmadaType", $3::"ArmadaStatus")
        ON CONFLICT (code) DO UPDATE SET
          type = EXCLUDED.type,
          status = EXCLUDED.status;
      `;
      await pool.query(query, [a.code, a.type, a.status]);
    }
    console.log(`✅ ${armadasData.length} unit armada operasional disiapkan.`);

    // 8. Master Zona Operasional Sidoarjo
    console.log("⏳ Seeding Master Zona Operasional Sidoarjo...");
    const zonesData = [
      {
        name: "Zona Sidoarjo 1 - Alun-Alun",
        description: "Pusat Keramaian Alun-Alun Sidoarjo",
        max_capacity: 10,
        status: "ACTIVE",
        polygon: {
          type: "Polygon",
          coordinates: [[[112.7150, -7.4450], [112.7210, -7.4450], [112.7210, -7.4500], [112.7150, -7.4500], [112.7150, -7.4450]]]
        }
      },
      {
        name: "Zona Sidoarjo 2 - Gajah Mada",
        description: "Kawasan Komersial Jalan Gajah Mada Sidoarjo",
        max_capacity: 10,
        status: "ACTIVE",
        polygon: {
          type: "Polygon",
          coordinates: [[[112.7120, -7.4500], [112.7180, -7.4500], [112.7180, -7.4550], [112.7120, -7.4550], [112.7120, -7.4500]]]
        }
      },
      {
        name: "Zona Sidoarjo 3 - Pahlawan",
        description: "Klaster Ritel Jalan Pahlawan Sidoarjo",
        max_capacity: 10,
        status: "ACTIVE",
        polygon: {
          type: "Polygon",
          coordinates: [[[112.7090, -7.4410], [112.7150, -7.4410], [112.7150, -7.4460], [112.7090, -7.4460], [112.7090, -7.4410]]]
        }
      },
      {
        name: "Zona Sidoarjo 4 - GOR Delta",
        description: "Area Olahraga & Rekreasi GOR Delta Sidoarjo",
        max_capacity: 10,
        status: "ACTIVE",
        polygon: {
          type: "Polygon",
          coordinates: [[[112.7060, -7.4550], [112.7130, -7.4550], [112.7130, -7.4610], [112.7060, -7.4610], [112.7060, -7.4550]]]
        }
      }
    ];

    for (const z of zonesData) {
      const query = `
        INSERT INTO zones (name, description, max_capacity, status, polygon)
        SELECT $1::text, $2::text, $3::int, $4::"ZoneStatus", $5::jsonb
        WHERE NOT EXISTS (SELECT 1 FROM zones WHERE name = $1::text);
      `;
      await pool.query(query, [z.name, z.description, z.max_capacity, z.status, JSON.stringify(z.polygon)]);
    }
    console.log(`✅ ${zonesData.length} master zona operasional Sidoarjo disiapkan.`);

    console.log("\n==================================================");
    console.log("🎉 SEEDING DATA BERSIH FASE UJI AWAL SELESAI!");
    console.log("==================================================\n");
  } catch (error) {
    console.error("❌ Gagal melakukan Clean Data Seeding:", error.message);
  } finally {
    await pool.end();
  }
}

seedCleanData();
