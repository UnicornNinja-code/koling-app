# FRONTEND PART 10 — COMPREHENSIVE MULTI-PANEL DASHBOARD SUITE

## 1. Objective
Merancang ulang arsitektur dashboard Single-Tenant menjadi **Multi-Panel Command Center** yang padat informasi (*data-dense*), terstruktur secara hierarkis, kaya visual (KPI Cards, Time-Series Charts, Live Mini-Map, Health Radars, Activity Streams), dan relevan 100% dengan operasional bisnis kopi keliling serta engine DSS BWM-TOPSIS.

---

## 2. Blueprint 10 Panel Utama Dashboard Super Admin / Management

```text
┌────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│ TOPBAR: [MOVA Logo] | Breadcrumb | SYSTEM ONLINE (🟢 Pulse) | Quick Actions: [🌦️ Sync Cuaca] [🧠 DSS Engine] [👥 +User] [📦 +Menu]     │
├────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│ [PANEL 1] EARLY WARNING & QUICK ALERT CENTER (Perimeter Lapangan, Geofence Alert, Baterai Rendah, Anomali Cuaca)                       │
├────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│ [PANEL 2] 8-METRIC KPI SUMMARY MATRIX GRID (Financial, Operational, Spatial & AI Engine Metrics)                                      │
│ ┌──────────────────────┬──────────────────────┬──────────────────────┬──────────────────────┬────────────────────────────────────────┐ │
│ │ 💰 OMZET HARI INI    │ ☕ CUP TERJUAL       │ 🛵 RIDER BERTUGAS    │ 🚲 UTILISASI ARMADA  │ 🧠 BOBOT BWM (CR)                      │ │
│ │ Rp 2.450.000         │ 163 Cup (82 Trx)     │ 10 / 12 Rider        │ 71.4% (10/14 Unit)   │ ξ* 0.042 [ Konsisten ✓ ]               │ │
│ │ +12.4% vs Kemarin    │ Rata-rata Rp 29.8k   │ ● LIVE Sinyal GPS    │ 1 Servis, 3 Standby  │ Best: POTENSI_PASAR                    │ │
│ ├──────────────────────┼──────────────────────┼──────────────────────┼──────────────────────┼────────────────────────────────────────┤ │
│ │ 📍 ZONA AKTIF        │ 🎯 TARGET HARIAN     │ 🌦️ INDEKS CUACA HUB │ 🛡️ SPATIAL QA STATUS │ ⏳ RATA-RATA PRESENSI                  │ │
│ │ 12 / 12 Wilayah      │ 81.6% Tercapai       │ 29°C (Cerah Berawan) │ 8.432 POI [ 🟢 VALID]│ 06:45 WIB                              │ │
│ │ 0 Overlap Geometri   │ Sisa Rp 550.000      │ Operasional: AMAN    │ 0 Critical Anomaly   │ Kepatuhan: 98%                         │ │
│ └──────────────────────┴──────────────────────┴──────────────────────┴──────────────────────┴────────────────────────────────────────┘ │
├────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│ [PANEL 3 & 4] ROW 1: ANALISIS TREN PENJUALAN & LEADERBOARD PRODUK (12 Kolom: 8 + 4)                                                    │
│ ┌──────────────────────────────────────────────────────────────────────┬─────────────────────────────────────────────────────────────┐ │
│ │ [PANEL 3] 📈 SALES TREND & HOURLY DEMAND CHART (8 Kolom)             │ [PANEL 4] ☕ TOP SELLING MENU & CATEGORY SHARE (4 Kolom)     │ │
│ │ Selector: [ Per Jam | 7 Hari | 30 Hari | Bulan Ini | Kustom ]        │ 1. Kopi Susu Gula Aren  ████████████ 84 Cup (Rp 1.260.000)  │ │
│ │ ~~~ Multi-Line Chart (Omzet Penjualan vs Target vs Cup) ~~~          │ 2. Americano Cold Brew  ████████░░░░ 42 Cup (Rp 630.000)    │ │
│ │ Zero-filled continuous time-series (Tanpa grafik putus)              │ 3. Matcha Latte Cream   █████░░░░░░░ 28 Cup (Rp 420.000)    │ │
│ │                                                                      │ 4. Caramel Macchiato    ███░░░░░░░░░ 15 Cup (Rp 225.000)    │ │
│ │ Breakdown Penjualan: 74% Kopi Espresso-Based • 26% Non-Coffee        │ [ Kelola Menu Katalog ➔ ]                                   │ │
│ └──────────────────────────────────────────────────────────────────────┴─────────────────────────────────────────────────────────────┘ │
├────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│ [PANEL 5, 6 & 7] ROW 2: SPATIAL OPERATIONAL, DSS ENGINE & INFRASTRUCTURE (12 Kolom: 5 + 4 + 3)                                         │
│ ┌──────────────────────────────────────┬─────────────────────────────────────────┬───────────────────────────────────────────────────┐ │
│ │ [PANEL 5] 🗺️ DASHBOARD MINI-MAP      │ [PANEL 6] 🧠 DSS BWM-TOPSIS ENGINE RADAR│ [PANEL 7] 🌦️ ATMOSPHERIC RADAR & CUACA           │ │
│ │ • 12 Batas Poligon Zona Aktif        │ • Nilai CR: 0.042 (Batas Maksimal 0.10) │ • Lokasi Hub: Sidoarjo (-7.4478, 112.7183)        │ │
│ │ • Live GPS Posisi Gerobak Rider      │ • Kriteria 1: Potensi Pasar (w = 0.382) │ • Suhu: 29.4°C • Kelembaban: 68%                  │ │
│ │ • Heatmap Titik POI Potensial        │ • Kriteria 2: Kepadatan POI (w = 0.224) │ • Kecepatan Angin: 8 km/h • Hujan: 0.0 mm/jam     │ │
│ │ • Jalur Larangan Jalan Tol & Protokol│ • Kriteria 3: Akses Jalan (w = 0.165)   │ • Prediksi 6 Jam ke Depan: Cerah Berawan          │ │
│ │ [ Buka Peta Operasional Lengkap ➔ ]  │ [ ⚙️ Kalibrasi Ulang Bobot DSS ➔ ]      │ [ 🔄 Sinkronisasi Data Cuaca Satelit ]            │ │
│ └──────────────────────────────────────┴─────────────────────────────────────────┴───────────────────────────────────────────────────┘ │
├────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│ [PANEL 8, 9 & 10] ROW 3: KESIAPAN SISTEM, KESEHATAN ARMADA & LIVE AUDIT TRAIL (12 Kolom: 4 + 4 + 4)                                    │
│ ┌──────────────────────────────────────┬─────────────────────────────────────────┬───────────────────────────────────────────────────┐ │
│ │ [PANEL 8] 🚀 SYSTEM READINESS MATRIX │ [PANEL 9] 🚲 KESEHATAN ARMADA & BATERAI │ [PANEL 10] 📜 LIVE AUDIT STREAM (Postgres/Socket) │ │
│ │ Checklist Kesiapan 6 Pilar Day-0:    │ • Baterai Rata-rata Armada: 84%         │ [10:45:12] Rider Fajar Check-in Zona 02 (Alun-alun│ │
│ │ [✓] Central Hub & Radius Terdaftar   │ • Unit Baterai Aman (>50%): 11 Unit     │ [10:30:05] Transaksi Baru Rp 35.000 (QRIS)        │ │
│ │ [✓] 18 Pengguna Terverifikasi        │ • Unit Perlu Cas (<30%): 2 Unit         │ [10:15:22] DSS Nightly Batch Selesai (CR: 0.042)  │ │
│ │ [✓] 14 Unit Armada Aktif Siap Pakai  │ • Unit Dalam Servis: 1 Unit             │ [09:55:01] Superadmin Update Bobot Kriteria BWM   │ │
│ │ [✓] 17 Kategori POI Likert 1-5       │ • Total Jarak Tempuh Hari Ini: 84.6 km  │ [09:40:18] Overpass Sync: 8.432 POI Terverifikasi │ │
│ │ [✓] 12 Zona Poligon Valid di PostGIS │ [ Buka Manajemen Armada Lengkap ➔ ]     │ [ Buka Seluruh Audit Trail & Log Keamanan ➔ ]     │ │
│ └──────────────────────────────────────┴─────────────────────────────────────────┴───────────────────────────────────────────────────┘ │
└────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Rincian dan Peran Tiap Panel

1. **Panel 1 (Quick Alert Center):**
   - Menampilkan banner peringatan darurat: batas geofence rider, baterai unit di bawah 20%, dan peringatan hujan lebat.
2. **Panel 2 (8-Metric KPI Summary Grid):**
   - Menggabungkan indikator finansial, kepatuhan rider, ketersediaan armada, akurasi DSS, hingga kepatuhan presensi jam kerja.
3. **Panel 3 (Sales Trend & Hourly Demand Chart):**
   - Grafik interaktif multi-seri yang membandingkan omzet riil terhadap target harian dengan breakdown volume cup.
4. **Panel 4 (Top Selling Menu & Category Breakdown):**
   - Visual progress bar kontribusi produk kopi, non-kopi, dan snack terhadap total pendapatan.
5. **Panel 5 (Dashboard Mini-Map Spasial):**
   - Snapshot peta PostGIS yang menampilkan posisi 12 zona poligon, sebaran rider aktif, dan jalur larangan jalan tol.
6. **Panel 6 (DSS BWM-TOPSIS Engine Health):**
   - Menampilkan status parameter SPK: Rasio Konsistensi $\xi^*$, pembobotan 6 kriteria, dan ranking skor TOPSIS tertinggi.
7. **Panel 7 (Atmospheric Radar & Cuaca):**
   - Parameter meteorologi dari Open-Meteo API yang menentukan status kelayakan berkeliling gerobak kopi.
8. **Panel 8 (System Readiness 6-Pillar Matrix):**
   - Status kesiapan infrastruktur Day-0 agar Super Admin dapat mendeteksi komponen yang belum terkonfigurasi.
9. **Panel 9 (Kesehatan Armada & Baterai):**
   - Monitoring level daya baterai motor listrik keliling dan log jarak tempuh (odometer).
10. **Panel 10 (Live Audit Trail Stream):**
    - Aliran log aktivitas administratif dan transaksi secara real-time via WebSocket.

---

## 4. Standar Interaksi & Confirmation Modal
- **Sync Cuaca & Kalibrasi DSS:** Membuka modal konfirmasi dengan estimasi waktu eksekusi.
- **Inspect Audit Stream:** Mengklik entri log membuka drawer detail JSON metadata (Aktor, IP, Payload perubahan).
