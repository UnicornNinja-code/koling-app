/*
 * seed.ts
 * Comprehensive Initial Master & Operational Data Seed Script (Bun + TypeScript)
 */

import bcrypt from "bcryptjs";
import { pool } from "../config/database.js";

async function seedCleanData() {
  console.log("🌱 Memulai Seeding Master Data & Operasional Koling App...");

  try {
    // 0. Pengosongan Tabel Transaksional & Log
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

    // 2. Akun Pengguna Utama (Clean RBAC)
    console.log("⏳ Seeding Akun Pengguna Utama (Superadmin, Supervisor, Riders)...");
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
        name: "Supervisor Operasional",
        role: "SUPERVISOR",
      },
      {
        email: "rider@kopikeliling.com",
        username: "rider1",
        password: defaultPasswordHash,
        name: "Doni Pratama",
        role: "RIDER",
      },
      {
        email: "rider2@kopikeliling.com",
        username: "rider2",
        password: defaultPasswordHash,
        name: "Dimas Kurniawan",
        role: "RIDER",
      },
      {
        email: "rider3@kopikeliling.com",
        username: "rider3",
        password: defaultPasswordHash,
        name: "Ahmad Fauzi",
        role: "RIDER",
      },
      {
        email: "rider4@kopikeliling.com",
        username: "rider4",
        password: defaultPasswordHash,
        name: "Rizky Ramadhan",
        role: "RIDER",
      },
      {
        email: "rider5@kopikeliling.com",
        username: "rider5",
        password: defaultPasswordHash,
        name: "Eko Setiawan",
        role: "RIDER",
      },
    ];

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
    console.log(`✅ ${usersData.length} akun pengguna utama berhasil disiapkan.`);

    // 3. Kriteria SPK BWM-TOPSIS Standard
    console.log("⏳ Seeding Kriteria SPK Standar...");
    const criteriasData = [
      { name: "C1 - Densitas POI", type: "BENEFIT", weight: 0.32 },
      { name: "C2 - Diversitas POI", type: "BENEFIT", weight: 0.24 },
      { name: "C3 - Skor Keramaian Waktu", type: "BENEFIT", weight: 0.20 },
      { name: "C4 - Kondisi Cuaca", type: "COST", weight: 0.12 },
      { name: "C5 - Jarak Rider dari Hub ke Zona", type: "COST", weight: 0.08 },
      { name: "C6 - Jumlah Kompetitor di Zona", type: "COST", weight: 0.04 },
    ];

    for (const c of criteriasData) {
      const query = `
        INSERT INTO criterias (name, type, is_active, weight)
        VALUES ($1::text, $2::"CriteriaType", true, $3::float)
        ON CONFLICT (name) DO UPDATE SET
          type = EXCLUDED.type,
          weight = EXCLUDED.weight;
      `;
      await pool.query(query, [c.name, c.type, c.weight]);
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
      { name: "Perkantoran Komersial", pagi: 4, siang: 5, sore: 4, malam: 2 },
      { name: "Stasiun Kereta Api", pagi: 5, siang: 4, sore: 5, malam: 3 },
      { name: "Halte / Terminal Bus", pagi: 5, siang: 4, sore: 5, malam: 3 },
      { name: "Taman Kota / Terbuka", pagi: 4, siang: 2, sore: 5, malam: 4 },
      { name: "SPBU / Stasiun Pengisian Bahan Bakar", pagi: 4, siang: 4, sore: 5, malam: 3 },
      { name: "Lainnya", pagi: 2, siang: 2, sore: 2, malam: 2 },
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
      { key: "HUB_CITY_NAME", value: "Sidoarjo", description: "Nama Kota Hub/Gudang Operasional" },
      { key: "HUB_LATITUDE", value: "-7.397402184098715", description: "Koordinat Hub Sidoarjo (Latitude)" },
      { key: "HUB_LONGITUDE", value: "112.71195887495875", description: "Koordinat Hub Sidoarjo (Longitude)" },
      { key: "HUB_BOUNDS_BUFFER", value: "0.15", description: "Buffer Wilayah Spasial Operasional" },
      { key: "DEFAULT_DSS_ACTIVE", value: "true", description: "Status aktif default SPK" },
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
      { name: "Es Kopi Susu Gula Aren", description: "Espresso dengan susu segar dan gula aren murni", price: 18000, status: "AVAILABLE" },
      { name: "Kopi Hitam (Americano)", description: "Espresso blend robusta-arabika hangat/dingin", price: 12000, status: "AVAILABLE" },
      { name: "Matcha Latte Premium", description: "Matcha Uji Jepang dengan susu segar", price: 20000, status: "AVAILABLE" },
      { name: "Caramel Macchiato", description: "Espresso dengan saus caramel kental dan steamed milk", price: 22000, status: "AVAILABLE" },
      { name: "Croissant Butter", description: "Pastry renyah dengan butter Perancis", price: 15000, status: "AVAILABLE" },
    ];

    const insertedProducts: any[] = [];
    for (const p of productsData) {
      const query = `
        INSERT INTO products (name, description, price, status)
        VALUES ($1::text, $2::text, $3::double precision, $4::"ProductStatus")
        ON CONFLICT (name) DO UPDATE SET
          price = EXCLUDED.price,
          status = EXCLUDED.status
        RETURNING id, name, price;
      `;
      const res = await pool.query(query, [p.name, p.description, p.price, p.status]);
      insertedProducts.push(res.rows[0]);
    }
    console.log(`✅ ${productsData.length} master produk disiapkan.`);

    // 7. Master Unit Armada Operasional Real
    console.log("⏳ Seeding Master Armada...");
    const armadasData = [
      { code: "ARM-ML-001", type: "MOTOR_LISTRIK", status: "IN_USE" },
      { code: "ARM-ML-002", type: "MOTOR_LISTRIK", status: "IN_USE" },
      { code: "ARM-ML-003", type: "MOTOR_LISTRIK", status: "IN_USE" },
      { code: "ARM-GB-001", type: "GEROBAK", status: "IN_USE" },
      { code: "ARM-GB-002", type: "GEROBAK", status: "ACTIVE" },
      { code: "ARM-GB-003", type: "GEROBAK", status: "MAINTENANCE" },
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

    // 8. Master Zona Operasional
    console.log("⏳ Seeding Master Zona Operasional...");
    const zonesData = [
      {
        name: "Zona Sidoarjo 1 - Alun-Alun",
        description: "Pusat Keramaian Alun-Alun Sidoarjo",
        max_capacity: 5,
        status: "ACTIVE",
        polygon: {
          type: "Polygon",
          coordinates: [[[112.7150, -7.4450], [112.7210, -7.4450], [112.7210, -7.4500], [112.7150, -7.4500], [112.7150, -7.4450]]]
        }
      },
      {
        name: "Zona Sidoarjo 2 - Gajah Mada",
        description: "Kawasan Komersial Jalan Gajah Mada Sidoarjo",
        max_capacity: 5,
        status: "ACTIVE",
        polygon: {
          type: "Polygon",
          coordinates: [[[112.7120, -7.4500], [112.7180, -7.4500], [112.7180, -7.4550], [112.7120, -7.4550], [112.7120, -7.4500]]]
        }
      },
      {
        name: "Zona Sidoarjo 3 - Pahlawan",
        description: "Klaster Ritel Jalan Pahlawan Sidoarjo",
        max_capacity: 4,
        status: "ACTIVE",
        polygon: {
          type: "Polygon",
          coordinates: [[[112.7090, -7.4410], [112.7150, -7.4410], [112.7150, -7.4460], [112.7090, -7.4460], [112.7090, -7.4410]]]
        }
      },
      {
        name: "Zona Sidoarjo 4 - GOR Delta",
        description: "Area Olahraga & Rekreasi GOR Delta Sidoarjo",
        max_capacity: 5,
        status: "ACTIVE",
        polygon: {
          type: "Polygon",
          coordinates: [[[112.7060, -7.4550], [112.7130, -7.4550], [112.7130, -7.4610], [112.7060, -7.4610], [112.7060, -7.4550]]]
        }
      }
    ];

    const insertedZones: any[] = [];
    for (const z of zonesData) {
      const query = `
        INSERT INTO zones (name, description, max_capacity, status, polygon)
        VALUES ($1::text, $2::text, $3::int, $4::"ZoneStatus", $5::jsonb)
        ON CONFLICT (name) DO UPDATE SET
          description = EXCLUDED.description,
          max_capacity = EXCLUDED.max_capacity,
          status = EXCLUDED.status,
          polygon = EXCLUDED.polygon
        RETURNING id, name;
      `;
      const res = await pool.query(query, [z.name, z.description, z.max_capacity, z.status, JSON.stringify(z.polygon)]);
      insertedZones.push(res.rows[0]);
    }
    console.log(`✅ ${insertedZones.length} master zona operasional disiapkan.`);

    // 9. Zone Assignments & Duty Queue for Today
    console.log("⏳ Seeding Penugasan Zona & Antrean Tugas Rider...");
    const ridersRes = await pool.query("SELECT id, name FROM users WHERE role = 'RIDER' ORDER BY name;");
    const riders = ridersRes.rows;
    const today = new Date().toISOString().split("T")[0];

    if (riders.length > 0 && insertedZones.length > 0) {
      for (let i = 0; i < Math.min(riders.length, insertedZones.length); i++) {
        const r = riders[i];
        const z = insertedZones[i % insertedZones.length];

        await pool.query(`
          INSERT INTO zone_assignments (rider_id, zone_id, assignment_date, status, check_in_time)
          VALUES ($1, $2, $3::date, 'CHECKED_IN', CURRENT_TIMESTAMP)
          ON CONFLICT DO NOTHING;
        `, [r.id, z.id, today]);

        await pool.query(`
          INSERT INTO rider_duty_queues (rider_id, duty_date, status)
          VALUES ($1, $2::date, 'PLOTTED')
          ON CONFLICT DO NOTHING;
        `, [r.id, today]);
      }
    }
    console.log(`✅ ${riders.length} penugasan rider aktif berhasil disiapkan.`);

    // 10. Seeding Realistic Sales Logs for Today & 30 Days Trend
    console.log("⏳ Seeding Transaksi Penjualan Historis 30 Hari...");
    const products = insertedProducts;

    if (riders.length > 0 && products.length > 0 && insertedZones.length > 0) {
      for (let dayOffset = 30; dayOffset >= 0; dayOffset--) {
        const txDate = new Date(Date.now() - dayOffset * 24 * 60 * 60 * 1000);
        const txCount = dayOffset === 0 ? 32 : Math.floor(22 + Math.random() * 20);

        for (let t = 0; t < txCount; t++) {
          const rider = riders[t % riders.length];
          const prod = products[t % products.length];
          const zone = insertedZones[t % insertedZones.length];
          const qty = Math.floor(1 + Math.random() * 3);
          const unitPrice = prod.price || 18000;
          const totalPrice = qty * unitPrice;

          await pool.query(`
            INSERT INTO sales_logs (rider_id, product_id, qty, unit_price, total_price, latitude, longitude, zone_id, created_at)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9);
          `, [
            rider.id,
            prod.id,
            qty,
            unitPrice,
            totalPrice,
            -7.4450 + (Math.random() - 0.5) * 0.01,
            112.7150 + (Math.random() - 0.5) * 0.01,
            zone.id,
            txDate.toISOString(),
          ]);
        }
      }
    }
    console.log(`✅ Data transaksi penjualan historis 30 hari berhasil di-generate.`);

    // 11. Seeding In-App Notifications
    console.log("⏳ Seeding Notifikasi Sistem...");
    const { rows: adminRows } = await pool.query(`SELECT id FROM users WHERE role = 'SUPERADMIN' LIMIT 1;`);
    if (adminRows.length > 0) {
      const superadminId = adminRows[0].id;
      const sampleNotifs = [
        {
          user_id: superadminId,
          title: "Sistem Inisialisasi Berhasil",
          message: "Seluruh 4 zona PostGIS, 885 jalan protokol, dan 692 jalan tol telah aktif.",
        },
        {
          user_id: superadminId,
          title: "Sinkronisasi Cuaca Satelit",
          message: "Data Open-Meteo Sidoarjo berhasil diperbarui untuk seluruh zona operasional.",
        },
        {
          user_id: superadminId,
          title: "Kalibrasi Bobot BWM",
          message: "Konfigurasi BWM aktif: Best Potensi Pasar, Worst Jarak Hub (CR: 0.042).",
        },
      ];
      for (const n of sampleNotifs) {
        await pool.query(
          `INSERT INTO notifications (user_id, title, message, is_read) VALUES ($1, $2, $3, false);`,
          [n.user_id, n.title, n.message]
        );
      }
      console.log(`✅ ${sampleNotifs.length} notifikasi in-app disiapkan.`);
    }

    console.log("\n==================================================");
    console.log("🎉 SEEDING MASTER & OPERASIONAL DATA SELESAI SUKSES!");
    console.log("==================================================\n");
  } catch (error: any) {
    console.error("❌ Gagal melakukan Seeding Data:", error.message);
  } finally {
    await pool.end();
  }
}

seedCleanData();
