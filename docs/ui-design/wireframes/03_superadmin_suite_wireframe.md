# Wireframe Blueprint: SuperAdmin Management Suite (Fase 2)

Dokumen ini mendefinisikan antarmuka khusus **Super Admin** sebagai administrator sistem menyeluruh:
1. Konfigurasi Master Bobot BWM (Best-Worst Method).
2. Manajemen Zona Spasial PostGIS & Buffer Toleransi $\pm 50\text{m}$.
3. Log Audit Forensik & Monitor Cron Scheduler Latar Belakang.

---

## 1. Wireframe: Kalibrasi Bobot DSS BWM (`/dss`)

```text
+---------------------------------------------------------------------------------------------------+
| [SuperAdmin Workspace]  KALIBRASI MODEL SPK BWM (BEST-WORST METHOD)   [ Consistency Ratio: 0.042 ]|
+---------------------------------------------------------------------------------------------------+
|  [STEP 1: PILIH KRITERIA TERBAIK & TERBURUK]                                                      |
|  Kriteria Terbaik (Best Criterion) : [ C1 - Kepadatan Pejalan Kaki (Pedestrian)     v ]           |
|  Kriteria Terburuk (Worst Criterion): [ C6 - Tingkat Kepadatan Kompetitor           v ]           |
|                                                                                                   |
|  [STEP 2: MATRIKS PERBANDINGAN BERPASANGAN (PAIRWISE COMPARISONS: SKALA SAATY 1 - 9)]             |
|  Perbandingan Kriteria Terbaik (Best-to-Others):                                                  |
|  - C1 vs C2 (Potensi Penjualan)      : [ 3 - Sedikit Lebih Penting       v ]                      |
|  - C1 vs C3 (Prakiraan Cuaca Hujan)  : [ 4 - Moderat Menuju Kuat         v ]                      |
|  - C1 vs C4 (Titik Keramaian POI)    : [ 2 - Antara Sama & Sedikit       v ]                      |
|  - C1 vs C5 (Jarak Tempuh dari Hub)  : [ 5 - Jauh Lebih Penting          v ]                      |
|                                                                                                   |
|  Perbandingan Kriteria Lainnya terhadap Terburuk (Others-to-Worst):                               |
|  - C2 vs C6 (Kompetitor)             : [ 4 - Cukup Penting               v ]                      |
|  - C3 vs C6 (Kompetitor)             : [ 3 - Sedikit Lebih Penting       v ]                      |
|                                                                                                   |
|  [  Hitung Nilai Bobot Optimal (BWM Solver)  ]                                                    |
|                                                                                                   |
|  +---------------------------------------------------------------------------------------------+  |
|  | HASIL OPTIMISASI BOBOT & UJI KONSISTENSI:                                                   |  |
|  | Nilai Ksi Optimum (ξ*): 0.042 (CR: 0.014 <= 0.10) -> [🟢 KONSISTEN & VALID]                  |  |
|  | C1: 0.285 | C2: 0.210 | C3: 0.165 | C4: 0.140 | C5: 0.110 | C6: 0.090                        |  |
|  |                                                                                             |  |
|  | [ Simpan & Kunci Bobot Master ke Database ]                                                 |  |
|  +---------------------------------------------------------------------------------------------+  |
+---------------------------------------------------------------------------------------------------+
```

---

## 2. Wireframe: Manajemen Zona Spasial PostGIS (`/zones`)

```text
+---------------------------------------------------------------------------------------------------+
| [Zona Wilayah]  EDITOR POLIGON & PARAMETER ZONA OPERASIONAL          [ + Tambah Poligon Baru ]    |
+---------------------------------------------------------------------------------------------------+
|  DAFTAR ZONA TERPETAKAN (SURABAYA):            |  PREVIEW POLIGON POSTGIS & TOLERANSI:            |
|  +-------------------------------------------+ |  +---------------------------------------------+ |
|  | [Edit] Zona 01 - Gubeng Grand City         | |  |                                             | |
|  | • Kuota: 4 Rider | Buffer: ±50m            | |  |       /\  Poligon PostGIS                   | |
|  | • Titik Pusat: -7.2605, 112.7511           | |  |      /  \ (Zona 01 Gubeng)                  | |
|  | • Status: AKTIF (Shift Pagi)               | |  |     /    \---------+                        | |
|  |-------------------------------------------| |  |    +--------+       |                        | |
|  | [Edit] Zona 02 - Tunjungan Plaza          | |  |             \______/  [Buffer Toleransi 50m]| |
|  | • Kuota: 5 Rider | Buffer: ±50m            | |  |                                             | |
|  | • Status: AKTIF (Shift Pagi)               | |  | Pusat Zona: Lat -7.2605, Lng 112.7511       | |
|  |-------------------------------------------| |  | Luas Poligon: 1.42 km²                      | |
|  | [Edit] Zona 03 - Rungkut Industri          | |  | Uji Batas Kota: [✔️ Intersects Surabaya]   | |
|  +-------------------------------------------+ |  +---------------------------------------------+ |
+---------------------------------------------------------------------------------------------------+
```

---

## 3. Wireframe: Audit Forensik & Cron Scheduler (`/audit`)

```text
+---------------------------------------------------------------------------------------------------+
| [Audit Forensik]  LOG FORENSIK SISTEM & MONITOR CRON SCHEDULER               [ 🔄 Refresh Log ]   |
+---------------------------------------------------------------------------------------------------+
|  CRON SCHEDULER STATUS:                                                                           |
|  +---------------------------+ +---------------------------+ +----------------------------------+ |
|  | Weather Telemetry Sync    | | Evening Auto-Settlement   | | Redis LBS Radar Cleanup          | |
|  | Jadwal: */30 * * * *      | | Jadwal: 0 22 * * *        | | Jadwal: */5 * * * *              | |
|  | Status: [🟢 ACTIVE]       | | Status: [🟢 ACTIVE]       | | Status: [🟢 ACTIVE]              | |
|  | Last: 5 menit lalu        | | Last: Kemarin 22:00       | | Last: 1 menit lalu               | |
|  +---------------------------+ +---------------------------+ +----------------------------------+ |
|                                                                                                   |
|  LOG AKTIVITAS FORENSIK SISTEM (TERAKHIR):                                                        |
|  +--------------------+----------------------------+-----------------------+--------------------+ |
|  | Timestamp          | Aksi                       | Pengguna              | Entitas Target     | |
|  +--------------------+----------------------------+-----------------------+--------------------+ |
|  | 2026-09-03 06:45   | DISTRIBUTION_COMMITTED     | Supervisor Surabaya   | session:20260903-P | |
|  | 2026-09-03 11:20   | EMERGENCY_SWAP             | Supervisor Surabaya   | asn_102 (FLAT_TIRE)| |
|  | 2026-09-03 07:05   | ARMADA_CLAIMED (180s)      | Ahmad Fadillah        | ARM-GB-001         | |
|  | 2026-09-03 06:00   | BWM_WEIGHTS_UPDATED        | SuperAdmin            | dss_config:surabaya| |
|  +--------------------+----------------------------+-----------------------+--------------------+ |
+---------------------------------------------------------------------------------------------------+
```
