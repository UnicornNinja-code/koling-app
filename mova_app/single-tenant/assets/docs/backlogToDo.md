# Backlog & Roadmap Implementasi MOVA (Single-Tenant)

---

## ✅ Pencapaian Selesai (Completed Milestones)
- [x] **Executive Top Summary Chips & Omset Banner**: Standardisasi ringkasan eksekutif pada 3 kartu operasional bawah dashboard.
- [x] **Swagger / OpenAPI 3.0 SSOT Synchronization**: Dokumentasi 167 endpoint lengkap dan tersinkronisasi 100% parity (`test-swagger-parity.js`).
- [x] **Reusable UI Component Library**: Modularisasi `<MOVAInteractiveMap/>`, `<SummaryChipGroup/>`, `<RiderStatusBadge/>`, `<ZoneDetailDrawer/>`, dan `<ArmadaDetailDrawer/>`.
- [x] **Real-time Live Optimization (WebSockets / SSE)**: Sinkronisasi telemetri GPS live rider, deviasi geofence, status plotting, dan hold armada tanpa reload halaman.
- [x] **Error Handling & Skeleton Loaders**: Shimmer pulse loading states di seluruh panel dashboard dengan fallback retry handler.
- [x] **End-to-End (E2E) Scenario Validation**: Simulasi alur penuh (*Konfirmasi Tugas $\rightarrow$ FIFO Auto-Plotting $\rightarrow$ Live Telemetri $\rightarrow$ Deteksi Deviasi Geofence* - 5/5 tahap lolos 100%).
- [x] **Map Ops GIS Command Center (Phases 1 - 4)**: Kanvas peta ultra-wide 78vh, floating HUDs, 4 seksi tabel vertikal terpadu, dan slide-over `<ZoneDetailDrawer/>` 3-tab inspector.
- [x] **Distribution Page (3-Column Workspace & Human-in-the-Loop)**: Alur *Real-Time Dispatch First*, 3 Kolom (*FIFO Queue $\rightarrow$ DSS TOPSIS $\rightarrow$ Assignment Board*), Preview Simulasi, Supervisor Override dengan pencatatan alasan audit, dan modal Explainability C1–C6.
- [x] **Fleet Management & Hub Inventory Center**: 5 Summary Metric Cards, status fisik vs reservasi, active 5-minute hold inspection panel, modal perbaikan bengkel, dan `<ArmadaDetailDrawer/>`.

---

## 🗺️ 1. Halaman Map Ops: GIS Command Center & Live Telemetry

> [!IMPORTANT]
> **Konsep Desain Utama (Immense Full-Canvas Architecture):**
> Peta GIS membentang **penuh secara luas (Full-Height 85vh–90vh)** tanpa terpotong oleh grid statis. Informasi pendukung disajikan melalui **Floating HUDs**, **Zone Selector Pills**, serta **Vertical Stacked Operational Tables** di bawah kanvas.

```text
┌────────────────────────────────────────────────────────────────────────────────┐
│ [HEADER] 🗺️ Peta Operasi Spasial & Telemetri Lapangan (Map Ops)                │
│ [🟢 Live Socket.io] [🌤️ Cuaca: 29°C Cerah] [⏱️ Real-Time] [📥 Export Log]       │
├────────────────────────────────────────────────────────────────────────────────┤
│ ================= KANVAS PETA ULTRA-WIDE (TINGGI PENUH 85vh) ================= │
│  [TOP-LEFT: LAYER SWITCHER HUD]   [TOP-CENTER: QUICK ALERT]   [TOP-RIGHT: KPI] │
│  • Zona & Rank TOPSIS             🚨 Deviasi: Budi S.         🚴 12 Rider      │
│  • Live Rider GPS (LBS)           🌧️ Hujan: Zona Alun-Alun   📦 31/43 Slot    │
│  • Cuaca Spasial Real-Time                                                     │
│  • POI & Kompetitor Kopi                                                       │
│                                                                                │
│  [BOTTOM-CENTER: HORIZONTAL ZONE SELECTOR PILLS (Klik = Smooth Fly-To)]        │
│  [⭐ Alun-Alun (#1 | 8/10 Slot | 🌤️)]  [GOR Delta (#2 | 6/8 Slot | ⛅)]        │
├────────────────────────────────────────────────────────────────────────────────┤
│ [SEKSI 1: TABEL TELEMETRI LAPANGAN RIDER] (GPS, Kecepatan, Geofence, Fly-To)   │
│ [SEKSI 2: TABEL ZONA & TOPSIS] (Rank, Skor Ci, Kuota Terisi/Maks, Cuaca, POI)  │
│ [SEKSI 3: TABEL TITIK JUAL REKOMENDASI] (Candidate Selling Spots & Status Lock)│
│ [SEKSI 4: TABEL INTELIJEN KOMPETITOR] (Nama Kedai, Radius Buffer, Level C6)    │
└────────────────────────────────────────────────────────────────────────────────┘
```

### Pentahapan Implementasi Map Ops (Phased Delivery):
* **Phase 1 (P0 - Core Operations)**: Kanvas peta Leaflet, render poligon PostGIS zona, live marker GPS rider via Socket.io, deteksi status geofence (*SAFE* / *DEVIATION*).
* **Phase 2 (P1 - Decision Intelligence)**: Peringkat warna TOPSIS (*Emerald #1, Blue #2-#3, Amber #4+*), kapasitas kuota zona, dan overlay cuaca spasial.
* **Phase 3 (P1 - Advanced Field Intel)**: Marker POI 58 kategori, Candidate Selling Spots per zona, dan marker kompetitor kopi keliling/kedai beserta lingkaran buffer 300m–500m.
* **Phase 4 (P2 - Advanced Interactions)**: Sticky `🎯 Fly-To` camera animation, Floating HUD Layer Switcher, Collapsible Accordion Tables, dan `<ZoneDetailDrawer/>` (3-Tab Inspector: DSS C1–C6, Rider Squad, Spot Jual).

---

## 🚚 2. Halaman Distribusi: Operational Dispatch & Distribution Center

> [!IMPORTANT]
> **Prinsip Utama: *Real-time dispatch first, planning second.***
> 1. **Siapa rider yang siap beroperasi sekarang?** (`WAITING` Queue - FIFO).
> 2. **Zona mana yang paling direkomendasikan saat ini?** (TOPSIS Ranking & Explainability).
> 3. **Siapa ditempatkan ke mana?** (Auto Pairing with Preview / Manual Assignment).
> 4. **Apakah penugasan sudah berjalan dengan benar?** (Assignment Board & Audit Trail).

### A. Information Architecture & Layout 3 Kolom (Input $\rightarrow$ Decision $\rightarrow$ Output)

```text
┌────────────────────────────────────────────────────────────────────────────────┐
│ DISTRIBUSI RIDER                                         🟢 OPERASIONAL AKTIF  │
│ Kelola antrean, rekomendasi zona, dan penugasan operasional rider              │
├────────────────────────────────────────────────────────────────────────────────┤
│ 📅 Hari Ini: Jumat, 11 Sep 2026   🕒 Real-Time (09:45 WIB)   🌤️ Cerah • 31°C  │
│ Decision Time Context: [ ● Sekarang (Real-Time) | ○ Pagi | ○ Siang | ○ Sore ]  │
├────────────────────────────────────────────────────────────────────────────────┤
│ ┌────────────┐ ┌────────────┐ ┌────────────┐ ┌────────────────┐               │
│ │ 🟡 WAITING │ │ 🔵 PLOTTED │ │ 🟢 OPERATING│ │ 📍 AVAILABLE   │               │
│ │  12 Rider  │ │  8 Rider   │ │  24 Rider  │ │    16 Slot     │               │
│ └────────────┘ └────────────┘ └────────────┘ └────────────────┘               │
├────────────────────────────────────────────────────────────────────────────────┤
│ ┌────────────────┬────────────────────┬──────────────────────────────────────┐ │
│ │ [25%] WAITING  │ [35%] RECOMMENDED  │ [40%] ASSIGNMENT BOARD               │ │
│ │ QUEUE (Input)  │ ZONES (DSS Engine) │ (Result / Output)                    │ │
│ ├────────────────┼────────────────────┼──────────────────────────────────────┤ │
│ │ ① Ahmad Fauzi  │ 🥇 #1 Alun-Alun    │ Ahmad Fauzi → Alun-Alun Sidoarjo     │ │
│ │   Hadir: 08:12 │   Skor: 0.92       │ 🔵 PLOTTED • Auto DSS • 08:25 WIB    │ │
│ │   Tunggu: 18m  │   Slot: 1/3        │                                      │ │
│ │   [Tugaskan]   │   [Mengapa C1-C6?] │ Budi Santoso → GOR Delta Sidoarjo    │ │
│ │                │                    │ 🟢 OPERATING • Checked-in 08:40 WIB  │ │
│ │ ② Budi Santoso │ 🥈 #2 GOR Delta    │                                      │ │
│ │   Hadir: 08:17 │   Skor: 0.88       │ Siti Rahma → Taman Pinang            │ │
│ │   Tunggu: 13m  │   Slot: 2/3        │ 🔵 PLOTTED • Manual SPV • 08:30 WIB  │ │
│ └────────────────┴────────────────────┴──────────────────────────────────────┘ │
├────────────────────────────────────────────────────────────────────────────────┤
│ 💡 12 Rider menunggu di Hub                                                    │
│ [ 👁️ Preview Distribusi Otomatis ]          [ 🚀 Eksekusi Distribusi Otomatis ] │
└────────────────────────────────────────────────────────────────────────────────┘
```

### B. User Flow: Preview Before Execute & Supervisor Override
1. **Auto Distribution Flow**:
   * Supervisor klik `[ Preview Distribusi ]` $\rightarrow$ Modal Simulasi terbuka.
   * Sistem menampilkan tabel pemasangan FIFO #1 $\rightarrow$ Rank #1, FIFO #2 $\rightarrow$ Rank #1/2 (sesuai sisa kuota).
   * Menampilkan peringatan transparan jika kuota zona tidak cukup (*"⚠️ 2 Rider belum dapat zona"*).
   * Supervisor klik `[ Konfirmasi & Eksekusi ]` $\rightarrow$ Commit atomik ke backend $\rightarrow$ Push notifikasi Socket.io.
2. **Manual Assignment & Override Flow**:
   * Supervisor memilih rider dari Waiting Queue $\rightarrow$ Klik `[ Tugaskan Manual ]`.
   * Membuka *Zone Selector Modal* (Zona penuh tetap ditampilkan dengan status disabled).
   * Jika supervisor memilih zona di luar rekomendasi Rank #1 $\rightarrow$ Muncul dialog **Supervisor Override Confirmation**.
   * Menangkap alasan override: `Event Lokal`, `Kondisi Lapangan`, `Permintaan Manajemen`, `Zona Bermasalah`, dll. $\rightarrow$ Tercatat ke audit log.

### C. Prioritas Backlog Halaman Distribusi:
* **P0 (Core Operational Flow)**: Waiting FIFO Queue, TOPSIS Recommendation Cards, Auto Distribution Preview Modal, Manual Assignment Modal, Assignment Board.
* **P1 (Supervisor Intelligence)**: Explainability DSS Modal (C1–C6 breakdown & weather), Supervisor Override Confirmation Modal dengan pencatatan alasan, Warning kapasitas penuh.
* **P2 (Audit & Activity Trail)**: Recent Distribution Activity Stream di panel bawah, Riwayat audit runs history (`/api/distribution/runs`).

---

## 🛵 3. Halaman Manajemen Armada: Hub Fleet Inventory & Reservation Center

> [!IMPORTANT]
> **Koreksi Arsitektur: Pemisahan *Fleet Physical Status* dan *Reservation State*:**
> * **Fleet Physical Status** (Kondisi fisik aset): `AVAILABLE`, `IN_USE`, `MAINTENANCE`, `INACTIVE`.
> * **Reservation State** (Hak operasional sesi): `NONE`, `RESERVED`, `ARRIVED`, `INSPECTING`, `CLAIMED`, `CANCELLED`, `EXPIRED`, `FAILED`.

### A. Lifecycle Komprehensif Armada MOVA

```text
┌─────────────────┐
│    AVAILABLE    │ ◀───────────────────────────────────────────┐
└────────┬────────┘                                             │
         │ (Rider Booking dari Rumah / Hub)                     │ (Checkout & Return)
         ▼                                                      │
┌─────────────────┐                                             │
│    RESERVED     │ ──(Batas Waktu Habis / Batal)──> EXPIRED ───┤
└────────┬────────┘                                             │
         │ (Rider Tiba Fisik di Hub)                            │
         ▼                                                      │
┌─────────────────┐                                             │
│     ARRIVED     │                                             │
└────────┬────────┘                                             │
         │ (Inspeksi Fisik & Uji Baterai/Kondisi)               │
         ▼                                                      │
┌─────────────────┐                                             │
│   INSPECTING    │ ──(Inspeksi Gagal / Rusak)─────> MAINTENANCE│
└────────┬────────┘                                     │       │
         │ (Inspeksi Lolos & Konfirmasi Klaim)          │ (Rilis)
         ▼                                              ▼       │
┌─────────────────┐                             AVAILABLE ──────┤
│  IN_USE / OPER. │ ────────────────────────────────────────────┘
└─────────────────┘
```

### B. Information Architecture & Struktur UI (`FleetManagementPage.jsx`)

1. **Header & 5 Summary Metric Cards**:
   - 📦 **Total Armada**: Total seluruh unit gerobak/motor keliling di Hub.
   - 🟢 **Tersedia di Hub (Available)**: Unit siap pakai yang standby di Hub.
   - 🟡 **Direservasi (Reserved)**: Unit yang telah di-booking rider dan menunggu kedatangan fisik di Hub.
   - 🔵 **Sedang Beroperasi (In-Use)**: Unit yang aktif dibawa rider bertugas di lapangan.
   - 🔧 **Dalam Perbaikan (Maintenance)**: Unit dalam penanganan servis / perbaikan.

2. **Active Reservations Section (Operasional Sesi Berjalan)**:
   - Panel visual menampilkan daftar unit yang sedang di-booking:
     * `ARM-001` • Rider: Ahmad Fauzi • Batas Kedatangan: 08:30 WIB • ⏳ Sisa 12 Menit • Status: `RESERVED`.
     * `ARM-005` • Rider: Budi Santoso • Sudah Hadir di Hub • Status: `INSPECTING`.

3. **Tabel Inventaris Armada (Fleet Inventory Table)**:
   - Kolom: Kode Unit, Tipe Unit, Status Fisik, Status Reservasi, Rider Aktif, Zona Operasi, Daya Baterai IoT, Aksi.
   - Aksi: `[ Detail Drawer ]`, `[ Set Servis ]` / `[ Rilis Servis ]`, `[ Edit ]`, `[ Hapus ]`.

4. **Armada Detail Drawer (Current Operational Context)**:
   - Spesifikasi Teknis: Tipe, Nomor Rangka/Seri, Kapasitas Muatan, Persentase Baterai.
   - Konteks Operasional Berjalan:
     * Jika *Reserved*: Nama rider pemesan, jam booking, batas waktu hadir, estimasi zona.
     * Jika *In-Use*: Nama rider aktif, zona bertugas, waktu check-in, omset shift berjalan.
   - Riwayat Pemakaian & Log Servis Pemeliharaan (Tanggal servis, catatan keluhan, biaya).

### C. Prioritas Backlog Halaman Armada:
* **P0 (Core Fleet Management - API 100% Ready)**:
  - [x] Inventaris & Tabel Seluruh Unit Armada (`GET /api/armadas`).
  - [x] CRUD Data Armada (`POST`, `PUT`, `DELETE /api/armadas`).
  - [x] Manajemen Servis Pemeliharaan (`POST /api/armadas/:id/maintenance`, `release-maintenance`).
  - [x] In-Hub Temporary 5-Min Hold Lock & Claim (`POST /api/rider/hold-armada`, `claim-armada`).
* **P1 (Operational Fleet Context & Inspection)**:
  - [x] 5 Summary Metric Cards di header.
  - [x] Armada Detail Drawer dengan rincian *Current Operational Context*.
  - [x] Modal Set Servis dengan form catatan keluhan & estimasi biaya.
  - [x] Panel *Active Reservations* di UI supervisor (5-Min In-Hub Hold).
* **P2 (Advanced Remote Reservation Extension - Backend Extension Required)**:
  - [ ] Booking armada dari rumah sebelum hadir di Hub (`POST /api/fleet-reservations`).
  - [ ] Arrival Deadline Countdown Timer & Auto-Release saat kedatangan kedaluwarsa (*BullMQ delayed job*).

---

## 📊 4. Matriks Kesiapan API Endpoint Antar Modul

| Modul | Endpoint API | Method | Status Backend | Keterangan |
| :--- | :--- | :---: | :---: | :--- |
| **Map Ops** | `/api/zones`, `/api/lbs/riders/live`, `/api/pois/operational-area` | `GET` | ✅ **100% Ready** | Mendukung 6 layer spasial, PostGIS geofence, dan live socket |
| **Distribusi** | `/api/distribution/overview`, `/api/distribution/auto-assign` | `GET`/`POST` | ✅ **100% Ready** | Mendukung konteks waktu, FIFO auto-plot, preview, & override |
| **Fleet Core** | `/api/armadas`, `/api/armadas/:id/maintenance` | `GET`/`POST`/`PUT` | ✅ **100% Ready** | Mendukung CRUD, status maintenance, dan in-hub lock |
| **Fleet Remote**| `/api/fleet-reservations` (Booking dari rumah) | `POST` | ⚠️ **Backend Extension** | Fitur lanjutan P2 untuk alur booking jarak jauh |

