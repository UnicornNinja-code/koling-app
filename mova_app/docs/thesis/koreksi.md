# 📋 DOKUMEN BLUEPRINT ARSITEKTUR & ROADMAP FINAL TINGKAT LANJUT MOVA
*(Geospatial Decision Intelligence, Multi-Tenant Isolation, Dual-Profile Engine & Resilient DSS Platform)*
**Status Blueprint:** READY TO IMPLEMENT (Final Architecture Locked)
**Tanggal Pembaruan:** 07 September 2026

---

## 🏛️ ARSITEKTUR UTAMA SISTEM (MOVA CORE ENGINE)

```text
                                  MOVA CORE ENGINE
                                         │
    ┌────────────────────┬───────────────┼───────────────┬────────────────────┐
    ▼                    ▼               ▼               ▼                    ▼
MULTI-TENANT         GLOBAL SPATIAL     DSS ENGINE        REALTIME ENGINE    RESOURCE GOVERNOR
ISOLATION            MASTER LAYER        (BWM-TOPSIS)     (SOCKET.IO+REDIS)  & ABUSE SHIELD
    │                    │               │               │                    │
• Safe Session RLS   • OSM 1x Sync / Area• Criteria Build • Redis Adapter     • Redis Fast-Path Counter
• withTenantContext  • is_global = true  • C1-C3 Benefit  • Tenant/Zone Rooms • Periodic Reconciliation
• Anti-IDOR/BOLA     • Shared Reference  • C4-C6 Cost     • GPS Throttling    • Queue Concurrency
    └────────────────────┴───────────────┼───────────────┴────────────────────┘
                                         │
                                         ▼
                               DUAL-PROFILE RUNTIME
              (Lite Mengurangi Fitur Platform, Bukan Security Boundary)
                     ┌───────────────────┴───────────────────┐
                     ▼                                       ▼
             PROFILE=platform                         PROFILE=lite
         (Multi-Tenant Showcase)                (Single-Tenant Skripsi)
         • MULTI_TENANT=true                    • MULTI_TENANT=false
         • TENANT_MANAGEMENT=true               • DEFAULT_TENANT_ID=thesis-default
         • GLOBAL_SPATIAL_SHARING=true          • TENANT_MANAGEMENT=false
         • QUOTA_ENFORCEMENT=true               • RLS, RBAC & Context TETAP AKTIF
```

---

## 1. 🔍 AUDIT BACKEND: SPATIAL DATA, MULTI-TENANT ISOLATION & DEFENSE-IN-DEPTH

### A. Skema Multi-Tenant & Pemisahan Data Spasial
Untuk mendukung skalabilitas arsitektur **Multi-Tenant / Multi-Business**, sistem memisahkan secara tegas antara **Master Data Spasial Bersama (Global Shared Spatial Master)** dan **Data Bisnis Spesifik Tenant (Tenant-Specific Domain Data)**:

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    GLOBAL SHARED SPATIAL MASTER DATA                    │
│    (Overpass/OSM POIs, Jaringan Jalan, Jalan Protokol, Koridor Tol)     │
│  • Disinkronkan 1x per kota/wilayah     • is_global = true              │
│  • Direferensikan bersama antar-tenant  • Tanpa duplikasi data dasar    │
└────────────────────────────────────┬────────────────────────────────────┘
                                     │ (Reference / Spatial Join Only)
            ┌────────────────────────┴────────────────────────┐
            ▼                                                 ▼
┌───────────────────────────────────────┐ ┌───────────────────────────────────────┐
│        TENANT A DOMAIN DATA           │ │        TENANT B DOMAIN DATA           │
│  • tenant_id = 'tenant-coffee-01'     │ │  • tenant_id = 'tenant-bakery-02'     │
│  • Armada, Rider, Akun RBAC           │ │  • Armada, Rider, Akun RBAC           │
│  • Custom Zones & Hotspot Evaluations │ │  • Custom Zones & Hotspot Evaluations │
│  • Transaksi Sales & Settlement       │ │  • Transaksi Sales & Settlement       │
│  • Konfigurasi Bobot BWM Khusus       │ │  • Konfigurasi Bobot BWM Khusus       │
└───────────────────────────────────────┘ └───────────────────────────────────────┘
```

1. **Global Shared Spatial Data (Overpass/OSM)**:
   * Data spasial dasar (layer POI, jaringan jalan protokol, batas administrasi, koridor tol) disinkronkan dari Overpass API **cukup satu kali** untuk suatu wilayah/kota.
   * Ditandai sebagai `is_global = true` / dataset spasial bersama.
   * Seluruh tenant bisnis yang beroperasi pada area geografis yang sama cukup mereferensikan dataset global ini via PostGIS spatial query (`ST_Contains(tenant_zones.geom, global_pois.geom)`) tanpa duplikasi fisik.
2. **Tenant-Specific Business Data**:
   * Entitas bisnis khusus tenant: Armada (`fleet`), Rider (`riders`), Master Akun & RBAC (`users`), Riwayat Penjualan (`sales_transactions`), Check-in Log (`rider_checkins`), Zona Khusus Tenant (`tenant_zones`), serta Konfigurasi Preferensi Bobot BWM (`tenant_bwm_configs`).
   * Setiap tabel domain bisnis dilengkapi kolom `tenant_id` terindeks.

---

### B. Defense-in-Depth: Safe Session-Bound PostgreSQL Row-Level Security (RLS)
*Anti-Pattern*:
1. Mengandalkan `WHERE tenant_id = :id` saja di kode controller (rawan *human error*).
2. Menggunakan `$executeRawUnsafe` dengan string interpolation (risiko *SQL Injection*).
3. Mengeksekusi `SET LOCAL` di luar transaksi (context RLS hilang saat Prisma mengambil pool connection lain).

*Solusi Mutlak*: **Session-Bound Parameterized Transaction Context**:
```sql
-- 1. Aktifkan RLS pada seluruh tabel bisnis tenant
ALTER TABLE riders ENABLE ROW LEVEL SECURITY;
ALTER TABLE fleet ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE tenant_zones ENABLE ROW LEVEL SECURITY;
ALTER TABLE candidate_selling_locations ENABLE ROW LEVEL SECURITY;

-- 2. Buat Policy Isolasi Tenant
CREATE POLICY tenant_isolation_policy ON sales_transactions
  USING (tenant_id = current_setting('app.current_tenant_id', true)::text);

CREATE POLICY tenant_isolation_policy ON riders
  USING (tenant_id = current_setting('app.current_tenant_id', true)::text);

CREATE POLICY tenant_isolation_policy ON fleet
  USING (tenant_id = current_setting('app.current_tenant_id', true)::text);
```

*Implementasi Backend Client Wrapper yang Aman & Terikat Sesi Transaksi*:
```typescript
// backend/src/lib/prismaTenantContext.ts
import { PrismaClient, Prisma } from '@prisma/client';
import { prisma } from './prisma';

/**
 * Membungkus eksekusi query tenant-scoped dalam transaksi PostgreSQL yang sama,
 * memastikan context 'app.current_tenant_id' disetel secara terparameter (aman SQLi)
 * dan terikat secara eksklusif ke koneksi transaksi tersebut.
 */
export async function withTenantContext<T>(
  tenantId: string,
  fn: (tx: Prisma.TransactionClient) => Promise<T>
): Promise<T> {
  return prisma.$transaction(async (tx) => {
    // Parameterized session set (Anti-SQLi & Connection-Pinned)
    await tx.$executeRaw`SELECT set_config('app.current_tenant_id', ${tenantId}, true);`;
    return fn(tx);
  });
}
```

---

### C. Rules Redundansi Data POI, Protokol, dan Jalan TOL
1. **Deduplikasi POI Komposit Multi-Kunci**:
   * Ambang batas Haversine **15 meter**.
   * Kunci deduplikasi berbasis kombinasi radius, normalisasi nama, dan **kategori POI** untuk mencegah *false-merge* pada dua tempat berdekatan yang berbeda fungsi.
   * Komposit Unique Key: `(osm_type, osm_id)` atau UUID konsisten `logical_poi_id`.
   * Reduksi geometri `way`/`relation` menjadi satu centroid titik referensi (`out center;`).
2. **Aturan Eksklusi Jalan Protokol & TOL**:
   * **Jalan TOL (`PROHIBITED_TOLL_ROAD`)**: Buffer eksklusi minimal **25 meter** (`ST_DWithin`). Titik kandidat armada dilarang mutlak berada di koridor ini.
   * **Jalan Protokol / Kawasan Terbatas (`PROHIBITED_ROAD`)**: Buffer minimal $\ge \mathbf{10\text{ meter}}$ dari garis as jalan (`ST_Buffer`).

---

### D. Investigasi Masalah Overpass API (Penyebab & Solusi)

| Permasalahan | Akar Penyebab (*Why*) | Solusi & Mitigasi Teknis Lanjutan |
| :--- | :--- | :--- |
| **Job Stalled More Than Allowable Limit** | Overpass public server latency tinggi ($\ge 180\text{s}$). Redis worker lock habis sebelum kueri selesai. | 1. Naikkan `lockDuration` BullMQ menjadi **300.000 ms (5 menit)**.<br>2. Terapkan **Dynamic BBox Chunking** (sub-grid dinamis berbasis luas area dan densitas POI).<br>3. Gunakan fallback Overpass mirror endpoints (`kumi.systems`, `overpass-api.de`, `mail.ru`) dengan **Health Score Tracking System**. |
| **Why Duplicate Data** | Overlap antara `node` dan `way center` + sinkronisasi ulang melakukan `INSERT` tanpa filter unik. | 1. Gunakan PostgreSQL `ON CONFLICT (external_id) DO UPDATE`.<br>2. Terapkan **Deduplikasi Komposit Multi-Kunci** (ID eksternal + proximity 20m + kesamaan kategori). |
| **Why Relation on ... Hasn't Gone** | Data historis anak memiliki foreign key ke ID lama, sehingga *hard delete* memicu foreign key error. | Terapkan **Logical Deactivation / Tombstoning**:<br>`UPDATE pois SET is_active=false, operational_status='RETIRED'` alih-alih `DELETE FROM`. |

---

### E. Skenario Rollback Plan Dataset Spasial
Arsitektur rollback menggunakan model **Immutable Snapshot + Atomic Promotion + State Versioning**:
1. **Snapshot Storage & Metadata Table**:
   * File GeoJSON dengan SHA-256 Checksum di direktori storage (`uploads/snapshots/`).
   * Tercatat di tabel database PostgreSQL `spatial_snapshots` (`snapshot_id`, `version`, `sha256_checksum`, `bbox`, `total_pois`, `status`, `promoted_at`).
2. **State Transition Lifecycle**:
   $$\text{STAGING} \xrightarrow{\text{Validasi}} \text{ACTIVE} \xrightarrow{\text{Promosi Baru}} \text{RETIRED}$$
   $$\text{STAGING} \xrightarrow{\text{Validasi Gagal / Checksum Corrupt}} \mathbf{FAILED}$$
   * Status **`FAILED`** mengisolasi snapshot gagal agar tidak dapat terpromosikan.
3. **Atomic Promotion & Instant Rollback**:
   * **Promosi Atomik**: Menandai versi lama sebagai `RETIRED` dan mengaktifkan versi baru dalam 1 transaksi atomik (`BEGIN ... COMMIT`).
   * **Rollback Instan**: Mengubah status target snapshot ke `ACTIVE` dan snapshot rusak ke `RETIRED` tanpa perlu re-download dari Overpass.
4. **Real-time Event Broadcast (Socket.io)**:
   * Event: `snapshot.validation.completed`, `snapshot.promotion.completed`, `snapshot.rollback.completed`, `snapshot.failed`.

---

## 2. 🛡️ RESOURCE GOVERNANCE, ABUSE PROTECTION & CAPACITY LIMITS

```text
                              RESOURCE GOVERNOR
                                      │
        ┌─────────────────────────────┼─────────────────────────────┐
        ▼                             ▼                             ▼
   API LIMITS                    JOB LIMITS                  REALTIME LIMITS
        │                             │                             │
  • Endpoint Rate Limit        • BullMQ Concurrency          • Socket.IO Conn Limit
  • Payload Size Guard         • Queue Quota Isolation       • Server GPS Throttling
  • Query Timeout Guard        • Overpass Query Budget       • Movement Threshold (≥5m)
  • IDOR / BOLA Validator      • Tenant Daily Quotas         • Event Debounce / Coalesce
```

---

### A. Quota Enforcement: Redis Fast-Path + PostgreSQL Periodic Reconciliation
*Prinsip*:
* **Redis Counter** = *Runtime Fast-Path* (kinerja tinggi, zero-latency).
* **PostgreSQL** = *Ultimate Source of Truth* (kebenaran absolut transaksi).
* **Periodic Reconciliation Worker** = Memperbaiki *counter drift* apabila server restart atau crash sebelum operasi `DECR` terpanggil.

```text
       [Rider On-Duty Request]
                 │
                 ▼
     [Redis Atomic Counter INCR] ──► (Cek Quota Instan < 1ms)
                 │
      ┌──────────┴──────────┐
      ▼                     ▼
[Dalam Batas]          [Melebihi Quota]
      │                     │
      ▼                     ▼
[Lanjutkan Proses]     [Rollback DECR & Tolak 429]
      │
      ▼
[PostgreSQL Update: status = 'ON_DUTY']
      │
      ▼
┌────────────────────────────────────────────────────────┐
│     PERIODIC RECONCILIATION CRON (Tiap 5-10 Menit)     │
│  1. Hitung aktual: SELECT COUNT(*) WHERE status=ON_DUTY │
│  2. Bandingkan dengan nilai key Redis                  │
│  3. Jika drift / tidak sinkron -> Perbaiki counter     │
└────────────────────────────────────────────────────────┘
```

*Implementasi Reconciliation Worker*:
```typescript
// backend/src/workers/quotaReconciliationWorker.ts
export async function reconcileTenantActiveCounters(): Promise<void> {
  const activeTenants = await prisma.tenant.findMany({ where: { status: 'ACTIVE' } });
  
  for (const tenant of activeTenants) {
    const actualActiveRiders = await prisma.rider.count({
      where: { tenant_id: tenant.id, duty_status: 'ON_DUTY' }
    });
    
    // Sinkronkan counter Redis dengan database PostgreSQL
    await redis.set(`quota:${tenant.id}:active_riders`, actualActiveRiders);
  }
}
```

```
┌───────────────────────────────────┬───────────────────────────────┬─────────────────────────────────┐
│ Parameter Kapasitas               │ System Hard Limit (Default)   │ Per-Tenant Quota (Tiered)       │
├───────────────────────────────────┼───────────────────────────────┼─────────────────────────────────┤
│ Active Fleets                     │ MAX_ACTIVE_FLEETS_SYSTEM      │ MAX_FLEETS_PER_TENANT           │
│ Active Riders (On-Duty)           │ MAX_ACTIVE_RIDERS_SYSTEM      │ MAX_RIDERS_PER_TENANT           │
│ Registered Zones                  │ MAX_ZONES_SYSTEM              │ MAX_ZONES_PER_TENANT            │
│ Concurrent DSS Calculations       │ MAX_CONCURRENT_DSS_SYSTEM     │ MAX_CONCURRENT_DSS_PER_TENANT   │
│ Overpass Sync Jobs (Daily)        │ MAX_OVERPASS_DAILY_SYSTEM     │ MAX_OVERPASS_DAILY_PER_TENANT   │
│ Asynchronous Export Jobs          │ MAX_CONCURRENT_EXPORTS_SYSTEM │ MAX_CONCURRENT_EXPORTS_TENANT   │
└───────────────────────────────────┴───────────────────────────────┴─────────────────────────────────┘
```

---

### B. Socket.IO Architecture: Redis Adapter & Room Segregation
1. **Socket.IO Redis Adapter (`@socket.io/redis-adapter`)**:
   * Menghubungkan seluruh instance server Node.js/Bun melalui Redis Pub/Sub backend stream.
2. **Tenant & Zone Room Segregation**:
   ```typescript
   io.use(socketAuthMiddleware);
   
   io.on('connection', (socket) => {
     const { tenantId, role, assignedZoneId } = socket.user;
     
     // Isolasi room tenant
     socket.join(`tenant:${tenantId}`);
     
     // Isolasi sub-room zona khusus supervisor / rider
     if (assignedZoneId) {
       socket.join(`tenant:${tenantId}:zone:${assignedZoneId}`);
     }
     
     // Broadcast GPS hanya dialirkan ke room tenant yang sesuai
     socket.on('RIDER_LOCATION_UPDATE', async (payload) => {
       const validated = await processGpsIngestionGuard(socket.user, payload);
       if (validated) {
         io.to(`tenant:${tenantId}`).emit('RIDER_LOCATION_CHANGED', validated);
       }
     });
   });
   ```

---

### C. Server-Side GPS Throttling & Ingestion Guard
* Server memaksakan:
  * `MIN_ACCEPTED_GPS_INTERVAL = 5 seconds` (event lebih cepat langsung di-drop).
  * `MIN_LOCATION_DISTANCE = 5 meters` (koordinat yang bergeser $< 5\text{m}$ hanya memperbarui timestamp *heartbeat* tanpa memicu kueri spasial).

---

### D. Event-Driven DSS Recalculation (Debouncing & Coalescing)
```
[GPS Ingestion] ──► [Server Throttle (≥5s, ≥5m)] ──► [Update Redis GEO] ──► [Geofence Evaluation]
                                                                                   │
┌──────────────────────────────────────────────────────────────────────────────────┘
▼
[Pemicu Rekalkulasi Terdeteksi?]
  ├── Rider berpindah antar-zona operasional
  ├── Cuaca zona berubah (Open-Meteo Sync)
  ├── Snapshot dataset POI baru dipromosikan
  └── Perubahan densitas kompetitor terdeteksi
          │
          ├─► [YA] ──► Set Flag: DSS_RECALCULATION_REQUIRED
          │             │
          │             ▼
          │           [Debounce & Coalescing Buffer (10s)]
          │             │ (Mereduksi N event menjadi 1 eksekusi batch per zona)
          │             ▼
          │           [Enqueue ke BullMQ dssQueue]
          │
          └─► [TIDAK] ──► Selesai (Simpan koordinat tanpa kalkulasi matriks)
```

---

### E. BullMQ Worker Isolation & Concurrency Control
```typescript
export const QUEUE_CONCURRENCY = {
  overpassQueue: 1,     // Sangat ketat untuk menjaga IP dari blokir Overpass API
  weatherQueue: 2,      // Polling periodik cuaca
  dssQueue: 3,          // Perhitungan matematis BWM-TOPSIS (CPU-bound)
  snapshotQueue: 2,     // Hashing, kompresi, dan promosi snapshot
  exportQueue: 1        // Worker pembuatan laporan besar PDF/Excel
};
```

---

### F. Database Connection Pool & PostGIS Guard
* `statement_timeout = 15.000 ms` (mencegah kueri gantung).
* `MAX_SEARCH_RADIUS = 5.000 meters` dan `MAX_BBOX_DIAGONAL = 25 km`.
* Seluruh kueri spasial wajib menggunakan index GiST (`idx_pois_geom_gist`, `idx_protocol_roads_geom_gist`, `idx_zones_polygon_gist`).

---

### G. API Security & Anti-IDOR/BOLA Protection
* Autentikasi: JWT (15 menit) + Refresh Token Rotation (7 hari) + Redis Blacklist Revocation.
* Password Hashing: **Argon2id** ($m=65536, t=3, p=4$) atau Bcrypt ($cost \ge 12$).
* Verifikasi Otorisasi: `Token -> Tenant -> Role -> TenantScopeMiddleware -> Resource Ownership`.
* Rate Limiting Ketat: Endpoint autentikasi (5 req/min), sinkronisasi Overpass (1 req/tenant/day), dan DSS on-demand (strict queue).

---

### H. Asynchronous Heavy Export Protection
* Request export laporan PDF/Excel dilarang berjalan pada HTTP request thread.
* User Request $\rightarrow$ Validasi Rentang $\le 31$ Hari $\rightarrow$ Enqueue ke BullMQ $\rightarrow$ Worker Generate File $\rightarrow$ Storage $\rightarrow$ Socket.io Notification & Secure Download Link.

---

### I. Circuit Breaker Pattern & Graceful Degradation
* **Circuit Breaker**: `CLOSED` $\rightarrow$ `OPEN` $\rightarrow$ `HALF-OPEN` pada dependensi eksternal (Overpass, Open-Meteo, BMKG, Redis).
* **Graceful Degradation Mode**:
  * **NORMAL**: Semua fitur aktif standar.
  * **HIGH LOAD (CPU > 75%)**: LBS interval dinaikkan ke 15s, background export diantrekan, sync Overpass non-kritis ditunda.
  * **DEGRADED (CPU > 90%)**: DSS otomatis dinonaktifkan sementara (hanya layani DSS on-demand), export baru ditolak, **transaksi kasir POS rider dan operasional inti tetap 100% aktif**.

---

### J. Observability & Alerting
* Metrik Real-Time: CPU/RAM %, Event Loop Lag, HTTP Latency p95/p99, PostgreSQL Pool %, Redis Memory, BullMQ Queue Depth, Ingested GPS Events/sec, Overpass Mirror Health Score.
* Alert threshold otomatis: `CPU > 80%`, `DB Pool > 85%`, `Overpass Health < 40%`.

---

## 3. 🌐 GEOSPATIAL DECISION INTELLIGENCE: KRITERIA & SOLVER HYBRID BWM-TOPSIS

### A. Modular Criteria Builder Layer
Lapisan pemisah (*Criteria Builder Layer*) mentransformasikan data mentah dari berbagai provider (cuaca, GPS, OSM, kompetitor) menjadi matriks keputusan ternormalisasi sebelum diserahkan ke solver BWM-TOPSIS.

---

### B. Standarisasi 6 Kriteria Keputusan ($C_1 - C_6$)

$$\mathbf{C_1\text{ (Benefit)} \longrightarrow C_2\text{ (Benefit)} \longrightarrow C_3\text{ (Benefit)} \longrightarrow C_4\text{ (Cost)} \longrightarrow C_5\text{ (Cost)} \longrightarrow C_6\text{ (Cost)}}$$

| Kriteria | Nama Kriteria | Tipe | Deskripsi & Definisi Pengukuran |
| :---: | :--- | :---: | :--- |
| **$C_1$** | **Densitas POI** | **Benefit** | Jumlah titik POI target (kantor, sekolah, kampus, stasiun) dalam radius hotspot. |
| **$C_2$** | **Diversitas POI** | **Benefit** | Variasi kategori POI dalam kluster (indeks diversitas Shannon/Simpson) untuk stabilitas pasar. |
| **$C_3$** | **Skor Keramaian (Footfall Potential)** | **Benefit** | Estimasi volume lalu lintas pejalan kaki & keramaian berdasarkan time-slot. |
| **$C_4$** | **Risiko/Penalti Cuaca (Weather Risk / Penalty)** | **Cost** | Semakin tinggi probabilitas hujan, presipitasi ekstrem, atau suhu buruk, semakin tinggi nilai cost (semakin buruk untuk armada keliling). |
| **$C_5$** | **Jarak Rider (Proximity)** | **Cost** | Jarak tempuh riil (meter) dari posisi GPS rider saat ini menuju titik kandidat lokasi (semakin jauh semakin tinggi cost). |
| **$C_6$** | **Dampak Kompetitor (Competitor Impact)** | **Cost** | Jumlah kompetitor sejenis dalam radius 200m dan tingkat aktivitasnya (semakin padat semakin tinggi cost). |

---

### C. Perhitungan Matematis Hybrid BWM-TOPSIS

1. **BWM (Best-Worst Method) Weight Solver**:
   * Menentukan kriteria terbaik ($C_B$) dan terburuk ($C_W$).
   * Vektor perbandingan: $A_B = (a_{B1}, a_{B2}, \dots, a_{B6})$ dan $A_W = (a_{1W}, a_{2W}, \dots, a_{6W})^T$.
   * Menghitung bobot optimal $(w_1, w_2, w_3, w_4, w_5, w_6)$ dengan meminimalkan konsistensi $\xi^*$.
2. **TOPSIS Ranking Engine**:
   * Normalisasi matriks keputusan ($m$ alternatif, 6 kriteria):
     $$r_{ij} = \frac{x_{ij}}{\sqrt{\sum_{i=1}^m x_{ij}^2}}$$
   * Matriks terbobot: $v_{ij} = w_j \cdot r_{ij}$.
   * Solusi Ideal Positif ($A^+$) dan Solusi Ideal Negatif ($A^-$) berbasis Benefit ($C_1 - C_3$) dan Cost ($C_4 - C_6$):
     $$A^+ = \{ \max_i v_{i1}, \max_i v_{i2}, \max_i v_{i3}, \min_i v_{i4}, \min_i v_{i5}, \min_i v_{i6} \}$$
     $$A^- = \{ \min_i v_{i1}, \min_i v_{i2}, \min_i v_{i3}, \max_i v_{i4}, \max_i v_{i5}, \max_i v_{i6} \}$$
   * Jarak Separasi Euclidean:
     $$S_i^+ = \sqrt{\sum_{j=1}^6 (v_{ij} - v_j^+)^2}, \quad S_i^- = \sqrt{\sum_{j=1}^6 (v_{ij} - v_j^-)^2}$$
   * Nilai Preferensi Relatif:
     $$C_i = \frac{S_i^-}{S_i^+ + S_i^-}, \quad 0 \le C_i \le 1$$
   * **Output**: Peringkat lokasi rekomendasi prioritas tertinggi bagi Rider & Supervisor.

---

## 4. 🎛️ DUAL-PROFILE RUNTIME: PRINCIPLE OF SECURITY BOUNDARY INVARIANCE

Prinsip Utama: **`PROFILE=lite` mengurangi fitur eksposur platform, BUKAN mengurangi security boundary.**

```text
MOVA Lite (Single-Tenant Profile)
├── Kolom tenant_id TETAP ADA di seluruh tabel database
├── withTenantContext & PostgreSQL RLS TETAP AKTIF 100% (mengikat DEFAULT_TENANT_ID = 'thesis-default')
├── RBAC, JWT Interceptor & Resource Ownership TETAP AKTIF
├── Criteria Builder & Hybrid BWM-TOPSIS Solver 100% IDENTIK
└── LBS Telemetry Throttling & Socket Room Segregation TETAP AKTIF

Hanya Fitur Eksposur yang Dinonaktifkan:
├── Tenant Onboarding & Management UI = OFF
├── Multi-Tenant Switcher / Selector = OFF
└── Platform Superadmin UI = OFF
```

```typescript
// backend/src/config/runtimeProfile.ts
export interface AppConfig {
  profile: 'platform' | 'lite';
  features: {
    multiTenant: boolean;
    tenantManagement: boolean;
    globalSpatialSharing: boolean;
    quotaEnforcement: boolean;
    platformSuperadmin: boolean;
  };
  defaultTenantId: string;
}

export const config: AppConfig = {
  profile: (process.env.APP_PROFILE as 'platform' | 'lite') || 'platform',
  features: {
    multiTenant: process.env.APP_PROFILE === 'platform',
    tenantManagement: process.env.APP_PROFILE === 'platform',
    globalSpatialSharing: true, // Core spatial engine selalu reusable
    quotaEnforcement: process.env.APP_PROFILE === 'platform',
    platformSuperadmin: process.env.APP_PROFILE === 'platform',
  },
  defaultTenantId: process.env.DEFAULT_TENANT_ID || 'thesis-default',
};
```

---

## 5. 👥 AUDIT INTEGRASI ANTAR ROLE & FRONTEND SVELTE 5

### A. Role Hierarchy (RBAC)
* **Superadmin**: Konfigurasi platform, kuota tenant, snapshot rollback/promotion, dan bobot BWM global.
* **Management**: Laporan omset agregat, analitik performa rekomendasi DSS ($C_1 - C_6$), dan export asinkron.
* **Supervisor**: Live fleet tracking per room zona, validasi POI baru, verifikasi check-in GPS, dan settlement kasir.
* **Rider**: Mobile PWA kasir POS, klaim armada (hold 5 menit `FOR UPDATE SKIP LOCKED`), navigasi rute rekomendasi TOPSIS, dan verifikasi GPS.

### B. Frontend Engineering (Svelte 5 & Resiliency)
* **Svelte 5 Runes**: Reaktivitas murni berbasis `$state`, `$derived`, dan `$effect`.
* **Keamanan Interceptor**: Mutex Refresh Token Lock saat HTTP 401 dan penanganan global `403 FIRST_LOGIN_REQUIRED`.
* **Socket.io Client Resiliency**: Auto-reconnect dengan exponential backoff dan registrasi otomatis ke Room Tenant yang terautentikasi.

---

## 6. 🚀 ROADMAP EKSEKUSI BLUEPRINT (11-STAGE ACTION PLAN)

```
[1. Multi-Tenant Isolation & Safe Session-Bound RLS]
       │ (Setup withTenantContext helper, Enable RLS Policies pada tabel domain)
       ▼
[2. Global Spatial Master Architecture]
       │ (Overpass 1x Fetch per Kota, Flag is_global=true, PostGIS shared reference)
       ▼
[3. Spatial ETL + Dynamic Deduplication]
       │ (Dynamic BBox Chunking, Mirror Health Score, Composite Key Deduplication)
       ▼
[4. Snapshot + State Versioning Rollback]
       │ (GeoJSON SHA-256 Storage, DB Metadata Table, Status FAILED Isolation)
       ▼
[5. Modular Criteria Builder & DSS Engine]
       │ (Standarisasi C1-C3 Benefit & C4-C6 Cost, Solver Hybrid BWM-TOPSIS)
       ▼
[6. Real-Time Engine & Socket Room Segregation]
       │ (Socket.io Redis Adapter, Tenant & Zone Rooms, Server GPS Throttle ≥5s)
       ▼
[7. Resource Governance & Redis Quota Reconciliation]
       │ (Redis Fast-Path Counter + Periodic DB Reconciliation Worker, Queue Concurrency)
       ▼
[8. Security Hardening & IDOR/BOLA Guard]
       │ (Argon2id, Refresh Token Rotation, Endpoint Rate Limit, Async Export Worker)
       ▼
[9. Observability & Graceful Degradation]
       │ (Prometheus/Grafana Metrics, Circuit Breaker, Degradation Normal/High/Degraded)
       ▼
[10. Dual-Profile Runtime (Security Boundary Invariance)]
       │ (Konfigurasi PROFILE=platform vs PROFILE=lite dengan RLS & TenantScope 100% aktif)
       ▼
[11. Capacity Planning, Stress Test & Production Rollout]
         (K6/Autocannon Load Testing, Penentuan Batas Limit Nyata & Zero-Downtime Migration)
```