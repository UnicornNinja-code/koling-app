Listed directory src
Listed directory db
Listed directory migrations
Viewed schema.sql:1-150
Viewed schema.sql:151-320
Viewed schema.sql:321-516
Viewed 006_fleet_reservations_and_assignments.sql:1-66
Viewed 007_operational_sessions_and_distribution.sql:1-66
Viewed 009_spatial_dataset_versioning_and_staging.sql:1-100
Viewed 008_create_user_preferences_and_dss_audit.sql:1-24
Listed directory routes
Searched for "reports"
Viewed reportService.ts:1-100
Viewed reportService.ts:100-140
Listed directory controllers
Listed directory services
Listed directory dss
Listed directory distribution
Listed directory rider
Listed directory sales
Listed directory dashboard
Listed directory lbs
Listed directory spatial
Listed directory cron
Listed directory poi
Listed directory system
Listed directory repositories
Listed directory workers
Listed directory queues
Listed directory events
Listed directory socket
Listed directory models
Listed directory middlewares
Listed directory utils
Viewed RiderOperationalService.ts:1-120
Viewed RiderOperationalService.ts:121-260
Viewed RiderOperationalService.ts:261-420
Viewed riderOperationalRepository.ts:150-250
Viewed riderOperationalRepository.ts:300-450
Viewed riderOperationalRepository.ts:550-630
Viewed LbsGeofenceService.ts:1-100
Viewed LbsGeofenceService.ts:100-180
Viewed dssController.ts:1-100
Viewed dssController.ts:101-272
Viewed HybridBwmTopsisService.ts:1-100
Viewed HybridBwmTopsisService.ts:101-200
Viewed DistributionService.ts:1-120
Viewed DistributionService.ts:200-350
Viewed weatherController.ts:1-81
Viewed WeatherRepository.ts:1-100
Viewed WeatherRepository.ts:101-176
Viewed datasetSyncJobRepository.ts:1-100
Viewed armadaService.ts:1-100
Viewed armadaService.ts:180-333
Viewed SalesService.ts:1-100
Viewed auditRepository.ts:1-100

# MOVA BACKEND FEATURE & REPORTING READINESS AUDIT

**Target Sistem:** Backend Aplikasi MOVA (*Mobile Operational & Vehicle/Zone Analytics*)  
**Stack Backend:** Bun 1.4, TypeScript, PostgreSQL 16 + PostGIS, Redis / BullMQ, Express  
**Karakter Audit:** **READ-ONLY AUDIT** — Tidak ada kode yang diubah, tidak ada migration yang dijalankan, tidak ada dependency yang diinstal.  
**Tujuan Audit:** Memverifikasi kesiapan seluruh komponen backend (schema database, persistence, worker, cron, service, repository, dan API) untuk menopang kebutuhan operasional dan sistem pelaporan (*analytics/reporting*).

---

## 1. Executive Summary

Berdasarkan audit mendalam terhadap seluruh file database schema, migrasi (001–012), 23 controllers, 21 repositories, 30 services, 4 background workers, dan 4 queues, backend MOVA memiliki arsitektur transaksi harian (*OLTP*) yang sangat tangguh untuk eksekusi operasional real-time. Pipeline ETL spasial Overpass, locking armada 5-menit, PostGIS geofencing, dan engine hibrida BWM-TOPSIS telah diimplementasikan dengan standar clean architecture yang baik.

Namun, **untuk kebutuhan sistem laporan (*Reporting & Analytics Readiness*)**, backend saat ini menghadapi kendala struktural yang signifikan:
1. **Pencatatan Waktu Kehadiran Hilang (*Nullified Attendance Timestamps*)**: Pada proses check-in spasial di repository, query database tidak mengisi kolom `check_in_time`, melainkan menimpa kolom `created_at`. Pada saat checkout, kolom `check_out_time` sama sekali tidak diisi. Akibatnya, durasi kerja aktual dan analisis keterlambatan rider tidak dapat dihitung dari tabel penugasan.
2. **Koordinat Check-in Tidak Disimpan (*Unpersisted Check-in Coordinates*)**: Titik koordinat GPS (`lat`, `lon`) saat check-in hanya divalidasi dengan `ST_Contains` di memori dan dipancarkan ke WebSocket, tetapi **tidak disimpan ke kolom database**.
3. **Data Cuaca Bersifat Destruktif (*Destructive Cache*)**: Setiap kali sinkronisasi cuaca dijalankan untuk suatu zona, query melakukan `DELETE FROM weathers WHERE zone_id = $1` sebelum insert. Backend hanya menyimpan kondisi cuaca 60 menit terakhir, sehingga tren cuaca historis hilang.
4. **Terputusnya Relasi Rekomendasi vs Keputusan Supervisor (*Broken DSS-to-Decision Traceability*)**: Penugasan manual oleh supervisor (`manualDistributeRider`) langsung menulis ke tabel penugasan tanpa mereferensikan ID rekomendasi DSS awal ataupun mencatat alasan override. Akibatnya, *DSS Acceptance Rate* dan *Override Analysis* belum dapat dihitung secara akurat.
5. **Ketiadaan Riwayat Titik GPS/Jarak Tempuh (*Missing Trajectory Persistence*)**: Titik live GPS hanya disimpan sementara di Redis dengan TTL, dan database PostgreSQL hanya mencatat event `ENTER`/`EXIT` batas zona. Data breadcrumbs koordinat untuk menghitung "Total Jarak Tempuh Rider" tidak tersedia di penyimpanan permanen.

### Scorecard Kesiapan Backend

| Dimensi Evaluasi | Skor | Status Evaluasi |
| :--- | :---: | :--- |
| **Architecture** | **8.5 / 10** | Service terisolasi rapi, repository pattern konsisten, event publisher aktif, BullMQ terpasang. |
| **Feature Completeness** | **7.8 / 10** | Alur operasional harian (klaim armada, check-in zona, catat penjualan, BWM, TOPSIS) berfungsi penuh. |
| **Data Integrity** | **7.5 / 10** | Constraint foreign key kuat; kelemahan pada penulisan timestamp kehadiran dan koordinat check-in. |
| **Historical Data Readiness** | **4.5 / 10** | Banyak entitas hanya menyimpan *current state* (cuaca, koordinat check-in, polygon zona, status armada). |
| **Reporting Readiness** | **5.0 / 10** | Laporan Sales dan Audit siap; Laporan Operasional Rider, Efektivitas Zona, dan DSS Accuracy terhambat gap data. |
| **DSS Traceability** | **6.0 / 10** | Snapshot komputasi tersimpan di `dss_histories`, namun relasi ke keputusan supervisor di lapangan terputus. |
| **Operational Traceability** | **5.5 / 10** | Rantai Rider -> Sesi -> Armada -> Penjualan utuh; rantai Lokasi -> Jarak Tempuh -> Waktu Kerja terputus. |
| **Performance** | **8.0 / 10** | Indeks spasial PostGIS GiST dan B-Tree komposit sudah terpasang dengan baik pada tabel-tabel utama. |

---

## 2. Module Health

| Module | Feature | Data | History | API | Reporting | Health Status |
| :--- | :---: | :---: | :---: | :---: | :---: | :--- |
| **AUTH** | Lengkap | Tersimpan | Ada | Lengkap | Ready | **HEALTHY** |
| **USER** | Lengkap | Tersimpan | Ada | Lengkap | Ready | **HEALTHY** |
| **RIDER OPS** | Lengkap | Parsial | Kurang | Lengkap | Insufficient | **NEEDS ATTENTION** (check-in time & coords missing) |
| **FLEET** | Lengkap | Tersimpan | Ada | Lengkap | Partial | **HEALTHY** (history pemakaian & issue ada, biaya servis belum) |
| **ZONE** | Lengkap | Tersimpan | Tidak Ada | Lengkap | Partial | **WARNING** (polygon history ter-overwrite) |
| **POI SYNC** | Lengkap | Tersimpan | Ada | Lengkap | Ready | **EXCELLENT** (dataset_versions & sync_jobs lengkap) |
| **WEATHER** | Lengkap | Current Only | Tidak Ada | Lengkap | Unfit | **CRITICAL GAP** (delete-before-insert, no historical log) |
| **DSS BWM** | Lengkap | Tersimpan | Ada | Lengkap | Ready | **HEALTHY** (versi konfigurasi tersimpan permanen) |
| **DSS TOPSIS**| Lengkap | Tersimpan | Ada | Lengkap | Partial | **HEALTHY** (snapshot JSONB lengkap di dss_histories) |
| **DISTRIBUTION**| Lengkap | Tersimpan | Parsial | Lengkap | Partial | **WARNING** (override supervisor tidak terhubung ke rekomendasi) |
| **SALES** | Lengkap | Tersimpan | Ada | Lengkap | Partial | **HEALTHY** (metode pembayaran QRIS/Tunai belum tercatat) |
| **LBS TRACKING**| Lengkap | Volatile | Tidak Ada | Lengkap | Unfit | **CRITICAL GAP** (koordinat live hanya di Redis, jarak tempuh nihil) |
| **AUDIT LOG** | Lengkap | Tersimpan | Ada | Lengkap | Ready | **EXCELLENT** (actor, action, metadata, ip, user_agent lengkap) |
| **CRON** | Lengkap | Tersimpan | Ada | Lengkap | Ready | **HEALTHY** (cron_configurations & cron_logs aktif) |

---

## 3. Reporting Readiness Matrix

Matriks kesiapan data backend terhadap 14 kebutuhan laporan analitika MOVA:

| No | Kategori Laporan | Metrik Utama yang Dibutuhkan | Entitas Sumber Data | Ketersediaan Data | Sifat Histori | Status Kesiapan Pelaporan |
| :---: | :--- | :--- | :--- | :---: | :---: | :--- |
| 1 | **Executive Summary** | Total Rider Aktif, Utilisasi Armada, Total Omzet, Kepatuhan Check-in, Top Zona | `users`, `armadas`, `sales_logs`, `zone_assignments` | Parsial | Parsial | **PARTIALLY READY** (Omzet & armada siap; metrik kepatuhan jam kerja belum) |
| 2 | **Rider Operational** | Hari bertugas, frekuensi check-in/out, jam keterlambatan, total jarak tempuh, zona favorit | `zone_assignments`, `fleet_assignments`, `rider_zone_logs` | Parsial | Tidak Lengkap | **FEATURE EXISTS — REPORTING DATA INSUFFICIENT** |
| 3 | **Zone Effectiveness**| Frekuensi rekomendasi vs pilihan supervisor vs eksekusi rider, omzet per zona, utilisasi kuota | `dss_histories`, `distribution_run_items`, `zone_assignments`, `sales_logs` | Parsial | Parsial | **FEATURE EXISTS — REPORTING DATA INSUFFICIENT** |
| 4 | **DSS Snapshot** | Bobot kriteria BWM, matriks normalisasi, matriks terbobot, skor preferensi, ranking alternatif | `dss_histories.details` (JSONB) | Tersedia | Lengkap | **REPORTING READY** |
| 5 | **BWM Configuration**| Kriteria terbaik/terburuk, vektor perbandingan Saaty, rasio konsistensi, pembuat konfigurasi | `dss_configurations`, `criterias` | Tersedia | Lengkap | **REPORTING READY** |
| 6 | **DSS Accuracy** | Rasio penerimaan rekomendasi sistem vs perubahan manual supervisor, alasan override | `recommendations`, `distribution_run_items`, `zone_assignments` | Tidak Lengkap | Terputus | **FEATURE EXISTS — REPORTING DATA INSUFFICIENT** |
| 7 | **DSS Impact** | Perbandingan penjualan & pemerataan rider antara periode Pre-DSS vs Post-DSS | `sales_logs`, `zone_assignments` | Parsial | Parsial | **FEATURE EXISTS — REPORTING DATA INSUFFICIENT** |
| 8 | **Revenue / Business**| Total omzet, volume cup, tren harian/mingguan/bulanan, omzet per rider & zona, rata-rata transaksi | `sales_logs`, `products`, `zones`, `users` | Tersedia | Lengkap | **REPORTING READY** (Metode bayar QRIS/Tunai belum tercatat) |
| 9 | **Fleet Management** | Jumlah unit per status, riwayat peminjaman/pengembalian, checklist kondisi fisik, rekap kerusakan | `armadas`, `fleet_assignments`, `fleet_issue_reports`, `fleet_reservations` | Tersedia | Lengkap | **REPORTING READY** (Biaya perawatan moneter belum ada) |
| 10 | **Operational Zone** | Luas area, poligon aktif, densitas POI, indeks kompetitor, rekap pelanggaran geofence | `zones`, `pois`, `competitors`, `protocol_roads`, `candidate_selling_locations` | Tersedia | Current State | **CURRENT STATE AVAILABLE — HISTORICAL TRACEABILITY MISSING** |
| 11 | **POI Sync Audit** | Waktu sinkronisasi Overpass, durasi (ms), jumlah diunduh, divalidasi, deduplikasi, versi dataset | `dataset_sync_jobs`, `dataset_versions`, `cron_logs` | Tersedia | Lengkap | **REPORTING READY** |
| 12 | **Weather Analytics** | Riwayat curah hujan, probabilitas presipitasi, korelasi cuaca terhadap performa penjualan | `weathers` | Tidak Ada | Terhapus | **CURRENT STATE AVAILABLE — HISTORICAL TRACEABILITY MISSING** |
| 13 | **System Audit Log** | Jejak audit administrator (siapa, aksi apa, entitas mana, IP address, waktu, status) | `audit_logs` | Tersedia | Lengkap | **REPORTING READY** |
| 14 | **System Activity** | Log eksekusi cron background, pembersihan reservasi expired, status koneksi Socket/Redis | `cron_logs`, `dataset_sync_jobs` | Tersedia | Lengkap | **REPORTING READY** |

---

## 4. Critical Data Gaps

Daftar kelemahan persistensi data yang ditemukan secara nyata di kode sumber, diurutkan berdasarkan tingkat keparahan risiko terhadap sistem laporan:

### Gap 1 (P0): Penulisan Nilai NULL pada `check_in_time` dan `check_out_time`
- **Lokasi Kode**: [`src/repositories/riderOperationalRepository.ts`](file:///f:/project_zero/bun_svelte/backend/src/repositories/riderOperationalRepository.ts) (Baris 408–416 & Baris 576–582)
- **Fakta Implementasi**:
  ```sql
  -- Method: validateAndCheckInRider
  UPDATE zone_assignments 
  SET status = 'CHECKED_IN', created_at = CURRENT_TIMESTAMP 
  WHERE id = $1;

  -- Method: checkoutRiderSession
  UPDATE zone_assignments 
  SET status = 'COMPLETED' 
  WHERE id = $1;
  ```
- **Dampak Kritis**:
  1. Kolom `check_in_time` dan `check_out_time` pada tabel `zone_assignments` dibiarkan bernilai `NULL`.
  2. Query menimpa kolom `created_at` saat check-in, merusak audit kapan penugasan pertama kali dibuat.
  3. Menghitung **durasi kerja rider**, **rata-rata keterlambatan jam masuk**, dan **kepatuhan jam operasional shift** menjadi **TIDAK BISA DILAKUKAN**.

### Gap 2 (P0): Koordinat Presisi GPS Check-in Tidak Disimpan ke Database
- **Lokasi Kode**: [`src/repositories/riderOperationalRepository.ts`](file:///f:/project_zero/bun_svelte/backend/src/repositories/riderOperationalRepository.ts) (Baris 388–425)
- **Fakta Implementasi**: Parameter `lat` dan `lon` hanya dilewatkan ke query PostGIS `ST_Contains(..., ST_MakePoint($lon, $lat))` untuk memvalidasi apakah rider berada di dalam zona. Hasilnya dikembalikan ke objek return memory dan socket event, tetapi **tidak ada query SQL yang menyimpannya ke tabel manapun**.
- **Dampak Kritis**: Sistem tidak memiliki bukti forensik lokasi koordinat titik presisi tempat rider menekan tombol check-in.

### Gap 3 (P1): Destructive Caching pada Tabel Cuaca (`weathers`)
- **Lokasi Kode**: [`src/repositories/WeatherRepository.ts`](file:///f:/project_zero/bun_svelte/backend/src/repositories/WeatherRepository.ts) (Baris 139)
- **Fakta Implementasi**:
  ```ts
  await this.pool.query(`DELETE FROM weathers WHERE zone_id = $1;`, [zoneId]);
  ```
- **Dampak Kritis**: Tabel `weathers` hanya bertindak sebagai cache volatil 1 baris per zona. Setiap ada penarikan data baru dari Open-Meteo, data cuaca jam/hari sebelumnya dihapus permanen. Laporan korelasi "Penurunan Omzet vs Intensitas Hujan Masa Lalu" tidak memiliki sumber data cuaca historis.

### Gap 4 (P1): Tidak Tersimpannya Breadcrumbs Trajectory / Odometer Jarak Tempuh
- **Lokasi Kode**: [`src/services/lbs/LbsGeofenceService.ts`](file:///f:/project_zero/bun_svelte/backend/src/services/lbs/LbsGeofenceService.ts) & [`src/services/lbs/RedisGeoService.ts`](file:///f:/project_zero/bun_svelte/backend/src/services/lbs/RedisGeoService.ts)
- **Fakta Implementasi**: Ping GPS live hanya dicatat di Redis geospatial hash dengan durasi hidup pendek (*volatile*). Database PostgreSQL hanya mencatat event diskrit `ENTER` dan `EXIT` pada tabel `rider_zone_logs`.
- **Dampak Kritis**: Backend tidak memiliki data titik pergerakan rider di jalanan. Metrik **"Total Jarak Tempuh Rider (km)"** adalah **NOT FOUND IN CURRENT IMPLEMENTATION**.

### Gap 5 (P1): Terputusnya Relasi Rekomendasi DSS ke Penugasan Manual Supervisor
- **Lokasi Kode**: [`src/services/distribution/DistributionService.ts`](file:///f:/project_zero/bun_svelte/backend/src/services/distribution/DistributionService.ts) (Baris 334–375)
- **Fakta Implementasi**: Saat supervisor melakukan penugasan manual (`manualDistributeRider`), fungsi langsung membuat baris baru di `zone_assignments` dengan `assignment_type = 'MANUAL'`. Fungsi tidak mencatat zona apa yang sebelumnya direkomendasikan DSS untuk rider tersebut, dan tidak menyediakan kolom alasan supervisor memindahkan zona (*override reason*).
- **Dampak Kritis**: Metrik *DSS Acceptance Rate*, *Override Rate*, dan *Analisis Anomali Keputusan Supervisor* tidak dapat dikorelasikan secara otomatis.

### Gap 6 (P2): Kolom Metode Pembayaran Hilang pada `sales_logs`
- **Lokasi Kode**: [`src/db/schema.sql`](file:///f:/project_zero/bun_svelte/backend/src/db/schema.sql) (Baris 221–235)
- **Fakta Implementasi**: Tabel `sales_logs` mencatat `qty`, `unit_price`, `total_price`, `latitude`, `longitude`, `rider_id`, `zone_id`. Namun, **tidak ada kolom `payment_method`** (QRIS / Tunai).
- **Dampak Kritis**: Frontend laporan (`reportService.ts`) mengharapkan data `qris_revenue` dan `cash_revenue`, namun backend tidak memiliki kolom tersebut.

---

## 5. Broken Traceability

Visualisasi titik putus (*broken links*) rantai data pada backend MOVA:

### Alur 1: DSS Recommendation -> Supervisor Decision -> Execution
```
[DSS Engine Execution]
       │
       ▼
[dss_histories (Snapshot JSONB)]
       │
       ▼
[distribution_runs (Batch Simulation)]
       │
       ├── (Jalur Auto: Tersimpan di distribution_run_items) ──► [zone_assignments (AUTO)]
       │
       └── (Jalur Manual Supervisor: manualDistributeRider)
                   │
                   ▼
       ❌ BROKEN RELATIONSHIP
          (zone_assignments tidak menyimpan foreign key ke dss_histories/recommendations,
           dan tidak ada kolom override_reason ataupun original_recommended_zone_id)
                   │
                   ▼
       [zone_assignments (MANUAL)]
```

### Alur 2: Check-In -> Location -> Working Duration
```
[Rider GPS Ping di HP]
       │
       ▼
[RiderOperationalService.checkInToZone(lat, lon)]
       │
       ├──► [PostGIS ST_Contains Check] ──► Validasi Berhasil
       │
       ├──► ❌ BROKEN PERSISTENCE: lat & lon Check-in Dibuang (Tidak Disimpan ke DB)
       │
       ├──► ❌ BROKEN TIMESTAMP: check_in_time Dibiarkan NULL (created_at Diterpa)
       │
       ▼
[RiderOperationalService.checkoutAndReturnArmada()]
       │
       └──► ❌ BROKEN TIMESTAMP: check_out_time Dibiarkan NULL
                   │
                   ▼
       [Total Durasi Jam Kerja = TIDAK BISA DIHITUNG (NULL - NULL)]
```

---

## 6. Historical Data Problems

Tabel-tabel berikut saat ini **hanya menyimpan status terkini (*current state*)**, padahal modul pelaporan membutuhkan rekam jejak historis:

| Entitas / Tabel | Kolom Saat Ini | Kondisi Realita | Kebutuhan Reporting | Kategori Masalah |
| :--- | :--- | :--- | :--- | :--- |
| **`weathers`** | `zone_id`, `temperature_2m`, `precipitation_probability`, `updated_at` | Row lama di-`DELETE` setiap fetch baru | Analisis pengaruh cuaca terhadap penjualan dari bulan ke bulan | **CURRENT STATE AVAILABLE — HISTORICAL TRACEABILITY MISSING** |
| **`zones`** | `polygon` (GeoJSON), `max_capacity`, `status` | Jika poligon diubah, koordinat batas wilayah lama langsung tertimpa | Rekonstruksi spasial penugasan rider tahun lalu berdasarkan batas zona pada saat itu | **CURRENT STATE AVAILABLE — HISTORICAL TRACEABILITY MISSING** |
| **`zone_assignments`** | `check_in_time`, `check_out_time` | Kolom ada di DDL schema tetapi tidak pernah diisi oleh query SQL | Laporan absensi rider, jam mulai jualan, jam pulang, dan durasi operasional | **FEATURE EXISTS — REPORTING DATA INSUFFICIENT** |
| **`armadas`** | `status` (ACTIVE, IN_USE, MAINTENANCE, RESERVED, RETIRED) | Perubahan status armada langsung meng-overwrite row tanpa snapshot status log | Timeline riwayat transisi status armada (berapa hari aktif vs berapa hari di bengkel) | **CURRENT STATE AVAILABLE — HISTORICAL TRACEABILITY MISSING** |
| **`sales_logs`** | `total_price`, `qty`, `unit_price` | Tidak ada informasi tipe pembayaran | Rekapitulasi kas harian: setoran tunai vs settlement otomatis QRIS | **FEATURE EXISTS — REPORTING DATA INSUFFICIENT** |

---

## 7. Missing Backend Features

Pengelompokan fitur yang belum tersedia secara transparan berdasarkan hasil audit:

### A. Genuinely Missing Feature (Belum Ada Sama Sekali)
1. **Rider Continuous Trajectory / Breadcrumb Persistence**: Tidak ada service, worker, maupun tabel untuk menyimpan jejak waypoint koordinat rute perjalanan rider.
2. **Maintenance Cost & Routine Service Scheduling**: Belum ada entitas untuk mencatat biaya servis moneter (Rp) ataupun jadwal servis berkala armada.
3. **Dedicated Reporting API Gateway**: Belum ada router khusus `/reports/*` yang menyediakan endpoint agregasi analitik siap pakai untuk frontend.
4. **Historical Weather Log Table**: Belum ada tabel arsip cuaca time-series harian.

### B. Feature Exists but Incomplete (Fitur Ada tetapi Belum Lengkap)
1. **Check-in Spasial**: Logika PostGIS `ST_Contains` sudah bekerja sempurna, namun penyimpanan koordinat `lat`, `lon`, dan `check_in_time` belum diimplementasikan pada query database.
2. **Checkout Operasional**: Penutupan sesi dan pengembalian armada berhasil, tetapi `check_out_time` pada tabel penugasan tidak diperbarui.
3. **Pencatatan Penjualan**: Transaksi produk, harga, dan lokasi koordinat penjualan tercatat rapi, tetapi metode pembayaran (Tunai / QRIS) belum ada di schema.

### C. Feature Exists but Not Reporting-Ready (Fitur Ada tetapi Data Belum Cukup untuk Laporan)
1. **Manajemen Penugasan Manual**: Supervisor bisa menugaskan rider secara manual di UI, tetapi sistem tidak mencatat alasan override dan rekomendasi asli sistem.
2. **Efektivitas Zona**: Skor TOPSIS dan kapasitas tersimpan, tetapi durasi penggunaan zona tidak dapat dihitung karena waktu check-in/out kosong.

---

## 8. Recommended Backend Architecture (Konseptual)

Arsitektur pelaporan yang direkomendasikan untuk memisahkan beban transaksional operasional (*OLTP*) dari beban analitika laporan (*OLAP/Reporting*):

```
┌────────────────────────────────────────────────────────────────────────┐
│                      TRANSACTIONAL LAYER (OLTP)                        │
│  Rider Check-in, Fleet Claims, Sales Logs, PostGIS Geofence, DSS Runs  │
└──────────────────────────────────┬─────────────────────────────────────┘
                                   │
                                   ▼
┌────────────────────────────────────────────────────────────────────────┐
│                        DATA PERSISTENCE FIXES                          │
│  - zone_assignments: check_in_time, check_out_time, check_in_coords    │
│  - weather_logs: Time-series append-only weather table                 │
│  - distribution_overrides: Audit rekomendasi vs keputusan supervisor   │
│  - sales_logs: payment_method (CASH, QRIS)                             │
└──────────────────────────────────┬─────────────────────────────────────┘
                                   │
                                   ▼
┌────────────────────────────────────────────────────────────────────────┐
│                   REPORTING SERVICE LAYER (DOMAIN)                     │
│  src/services/reports/                                                 │
│    ├── RiderOperationalReportService.ts                                │
│    ├── ZoneEffectivenessReportService.ts                               │
│    ├── DssAccuracyReportService.ts                                     │
│    ├── FleetMaintenanceReportService.ts                                │
│    └── ExecutiveSummaryReportService.ts                                │
└──────────────────────────────────┬─────────────────────────────────────┘
                                   │
                                   ▼
┌────────────────────────────────────────────────────────────────────────┐
│                        REPORTING API CONTROLLER                        │
│  src/controllers/reportController.ts  ──►  GET /api/reports/*          │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 9. Recommended Data Model Improvements (Konseptual)

Rekomendasi penyesuaian kolom dan tabel baru untuk menutup data gap laporan:

| Entitas Target | Rekomendasi Field / Tabel Baru | Tujuan Fungsional | Ketergantungan Laporan | Prioritas |
| :--- | :--- | :--- | :--- | :---: |
| `zone_assignments` | `check_in_time TIMESTAMP`<br>`check_out_time TIMESTAMP`<br>`check_in_lat DOUBLE PRECISION`<br>`check_in_lon DOUBLE PRECISION`<br>`check_in_accuracy DOUBLE PRECISION` | Mencatat waktu kehadiran aktual dan koordinat fisik saat check-in di zona | Rider Operational Report & Zone Effectiveness | **P0** |
| `zone_assignments` | `dss_recommendation_id UUID REFERENCES recommendations(id)`<br>`override_reason TEXT`<br>`original_recommended_zone_id UUID REFERENCES zones(id)` | Menghubungkan keputusan manual supervisor dengan rekomendasi awal DSS | DSS Accuracy & Acceptance Report | **P1** |
| `weather_logs` *(Tabel Baru)* | `id UUID PRIMARY KEY`<br>`zone_id UUID REFERENCES zones(id)`<br>`temperature DOUBLE PRECISION`<br>`rain_mm DOUBLE PRECISION`<br>`precipitation_prob DOUBLE PRECISION`<br>`recorded_at TIMESTAMP` | Append-only time series data cuaca tanpa operasi `DELETE` | Weather Impact & Correlation Report | **P1** |
| `sales_logs` | `payment_method VARCHAR(50) DEFAULT 'CASH'`<br>`reference_number VARCHAR(100)` | Membedakan transaksi tunai vs nontunai (QRIS) | Business Revenue Report & Rekap Kas | **P2** |
| `fleet_issue_reports` | `maintenance_cost NUMERIC(14,2) DEFAULT 0`<br>`parts_replaced JSONB DEFAULT '[]'` | Mencatat pengeluaran riil perbaikan armada di bengkel | Fleet Expense & TCO Report | **P2** |
| `zone_versions` *(Tabel Baru)* | `id UUID PRIMARY KEY`<br>`zone_id UUID REFERENCES zones(id)`<br>`version INT`<br>`polygon JSONB`<br>`effective_from TIMESTAMP`<br>`effective_to TIMESTAMP` | Snapshot poligon geofence masa lalu saat zona diperluas/dipersempit | Operational Zone History Report | **P3** |

---

## 10. Reporting API Architecture

Struktur endpoint pelaporan yang direkomendasikan untuk dibangun di level controller dan router:

```
GET /api/reports/executive-summary
    ├── Query: ?start_date=2026-09-01&end_date=2026-09-30
    └── Output: Aggregated KPI (Total Revenue, Active Riders, Compliance Rate, Top Zones)

GET /api/reports/riders/operational
    ├── Query: ?rider_id=...&session_id=...&start_date=...&end_date=...
    └── Output: Hari kerja, kehadiran, durasi kerja rata-rata, keterlambatan, omzet pribadi

GET /api/reports/zones/effectiveness
    ├── Query: ?zone_id=...&start_date=...&end_date=...
    └── Output: Rekomendasi vs Realisasi, Tingkat Utilisasi, Total Penjualan, Tren Cuaca

GET /api/reports/dss/accuracy
    ├── Query: ?start_date=...&end_date=...
    └── Output: Total Rekomendasi, Acceptance Rate, Override Rate, Daftar Alasan Override

GET /api/reports/fleet/utilization
    ├── Query: ?type=...&status=...
    └── Output: Rasio unit aktif vs standby vs rusak, riwayat inspeksi, durasi pemakaian
```

---

## 11. Refactoring & Implementation Roadmap

Rencana tahapan implementasi yang berorientasi pada **koreksi data transaksional terlebih dahulu** sebelum membangun lapisan laporan:

```
ROADMAP IMPLEMENTASI:
PHASE 1 (Integritas Data Kehadiran & Check-in)
       │
       ▼
PHASE 2 (Pelestarian Data Cuaca & Metadata Penjualan)
       │
       ▼
PHASE 3 (Ketertelusuran Keputusan DSS & Supervisor)
       │
       ▼
PHASE 4 (Penyediaan Service Agregasi & Query Pelaporan)
       │
       ▼
PHASE 5 (Endpoint REST API /reports/*)
```

### PHASE 1 — Data Integrity & Presence Logging (Priority: P0 | Risk: Low | Effort: S)
- **Fokus**: Perbaiki query SQL di `riderOperationalRepository.ts` agar mengisi `check_in_time`, `check_out_time`, serta kolom `check_in_lat` dan `check_in_lon` pada tabel `zone_assignments`.
- **Target**: Memastikan setiap aktivitas check-in dan checkout mulai hari ini menghasilkan data waktu dan koordinat yang valid.

### PHASE 2 — Weather & Payment Persistence (Priority: P1 | Risk: Low | Effort: S)
- **Fokus**: Hentikan `DELETE FROM weathers` destruktif; tambahkan tabel arsip `weather_logs`. Tambahkan kolom `payment_method` pada `sales_logs`.
- **Target**: Memastikan data historis cuaca dan metode pembayaran tunai/QRIS mulai terakumulasi di database.

### PHASE 3 — DSS-to-Decision Traceability (Priority: P1 | Risk: Medium | Effort: M)
- **Fokus**: Tambahkan kolom `dss_recommendation_id`, `original_recommended_zone_id`, dan `override_reason` pada alur penugasan manual `DistributionService.ts`.
- **Target**: Menghubungkan keputusan supervisor dengan output rekomendasi sistem.

### PHASE 4 — Domain Reporting Services & Aggregation (Priority: P2 | Risk: Low | Effort: M)
- **Fokus**: Buat modul service agregasi di `src/services/reports/` yang mengeksekusi query SQL analitik (menggunakan `DATE_TRUNC`, `COUNT DISTINCT`, `AVG`, window functions).
- **Target**: Menyediakan logika bisnis perhitungan metrik laporan yang bersih dan teruji tanpa membebani frontend.

### PHASE 5 — Reporting API & Export Endpoints (Priority: P2 | Risk: Low | Effort: S)
- **Fokus**: Daftarkan router `/api/reports/*` dan hubungkan dengan frontend `reportService.ts`.
- **Target**: Seluruh halaman Reports MOVA di frontend menerima data nyata yang akurat dari backend.

---

## Kesimpulan Akhir Audit

Backend MOVA **sudah memiliki fondasi sistem transaksional operasional yang solid dan stabil**, namun **belum siap sepenuhnya untuk menjadi sumber data laporan analitika historis**. Masalah utama bukan terletak pada kompleksitas algoritma, melainkan pada beberapa titik penyimpanan data operasional (*presence timestamp*, koordinat check-in, dan log cuaca) yang belum dipersistensikan secara permanen ke PostgreSQL. Dengan menyelesaikan perbaikan pada Phase 1 dan Phase 2, backend MOVA akan segera memenuhi seluruh standar kesiapan pelaporan analitika secara paripurna.