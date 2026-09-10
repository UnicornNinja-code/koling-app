# Spesifikasi UI/UX: Super Admin Dashboard (`/superadmin/dashboard`)

Dokumen ini merancang antarmuka **Executive & Health Dashboard** untuk Super Admin dengan tata letak minimalis dan ringkas (*PWA-ready*).

---

## 1. Audit Endpoint & Data Contract

| Properti | Detail |
| :--- | :--- |
| **Summary** | `GET /api/dashboard/summary` |
| **Sales Trend** | `GET /api/dashboard/sales-trend?range=7d` |
| **Zone Performance** | `GET /api/dashboard/zone-performance` |
| **Live Mini Map** | `GET /api/lbs/nearby?lat=-6.2088&lng=106.8456&radius=10000` & Socket `rider:location_updated` |
| **DSS Status** | `GET /api/dss/bwm/active` |
| **Sync Weather** | `POST /api/cron/sync-weather` |
| **Status Audit** | ✅ Endpoint aktif (RBAC: `SUPERADMIN`) |
| **WebSocket** | `rider:location_updated`, `zone:status_changed`, `fleet:status_updated` |

---

## 2. Pemetaan Komponen Svelte & Opaline Design Tokens

### 2.1 Komponen Svelte
- **Layout**: `AppLayout.svelte`, `TopBar.svelte`, `Sidebar.svelte`
- **UI Core**: `Button.svelte`, `Input.svelte`, `Badge.svelte`, `Card.svelte`, `Modal.svelte`, `Drawer.svelte`
- **Widgets**: `StatCard.svelte`, `LineChart.svelte`, `DataTable.svelte`, `ActivityStream.svelte`, `DashboardMiniMap.svelte`

### 2.2 Token Desain Opaline
- **Surface**: `var(--color-surface)` (`#FFFFFF`), Border: `1px solid var(--color-border)` (`#D2D2D4`)
- **Aksen CTA**: `var(--color-primary)` (`#FF634A`), Hover: `var(--color-primary-hover)` (`#E54E36`)
- **Status Badges**:
  - `OPTIMAL` / `AKTIF`: `#10B981` / `#ECFDF5`
  - `WARNING` / `STANDBY`: `#F59E0B` / `#FFFBEB`
  - `CRITICAL` / `MAINTENANCE`: `#EF4444` / `#FEF2F2`
  - `DSS INFO`: `#3B82F6` / `#EFF6FF`

---

## 3. Wireframe Visual High-Fidelity (ASCII Layout)

```text
+-------------------------------------------------------------------------------------------------------------------------+
| TOP BAR: [Logo COZIS] | [Q Cari menu/data...] | [● 48 Socket] [Notif (3)] | [Avatar SA]                                 |
+-------------------------------------------------------------------------------------------------------------------------+
| SIDEBAR (240px) | DASHBOARD OVERVIEW                                                                    [25 Aug, 14:35] |
|                 |                                                                                                       |
| NAVIGATION      | AKSI CEPAT:  [ ⚡ Cuaca ]  [ 🔄 DSS ]  [ + User ]  [ 📥 Ekspor ]                                      |
| [•] Dashboard   +-------------------------------------------------------------------------------------------------------+
| [ ] User        | OVERVIEW                                                                                              |
| [ ] Zona        | +--------------------+  +--------------------+  +--------------------+  +--------------------+        |
| [ ] DSS         | | TOTAL USER         |  | RIDER AKTIF        |  | ARMADA DIGUNAKAN   |  | PENJUALAN HARI INI |        |
| [ ] Armada      | | 128 User           |  | 42 / 45 Bertugas   |  | 76% (38/50 Unit)   |  | Rp 18.450.000      |        |
| [ ] Katalog     | | [▲ +4 minggu ini]  |  | [● 42 GPS Online]  |  | [4 Servis]         |  | [▲ +12.4%]         |        |
| [ ] Plotting    | +--------------------+  +--------------------+  +--------------------+  +--------------------+        |
| [ ] Map         +-------------------------------------------------------------------------------------------------------+
| [ ] Laporan     | ANALITIKA & HEALTH DSS                                                                                |
| [ ] Settings    | +---------------------------------------------------+ +-----------------------------------------------+ |
|                 | | TREN PENJUALAN & VOLUME (7 Hari)                  | | HEALTH SISTEM & DSS ENGINE                    | |
| STATUS SISTEM   | | [Range: (•) 7 Hari  ( ) 30 Hari  ( ) Bulan Ini]   | | • Algoritma: BWM-TOPSIS                       | |
| CPU: 12%        | |                                                   | | • BWM Consistency (ξ*): 0.042 [ KONSISTEN ]   | |
| Memory: 42%     | | Rp 20J +                      .-'""'-.   .-*      | | • Terakhir Dihitung: 07:00 WIB                | |
| Latency: 14ms   | | Rp 15J |            .-*""'-. /        \ /         | | • Kriteria Utama: Potensi Pasar (42.8%)       | |
| [ v1.4.0 ]      | | Rp 10J |       .-* /        '          '          | | • DB Latency: 14 ms  | Uptime: 99.98%         | |
|                 | |  Rp 5J |  .-*""   '                               | | • WebSocket: Connected                        | |
|                 | |        +--+---+---+---+---+---+---+               | | [ Logs > ]  [ Rekalkulasi ]                   | |
|                 | |          Sen Sel Rab Kam Jum Sab Min              | |                                               | |
|                 | +---------------------------------------------------+ +-----------------------------------------------+ |
|                 +-------------------------------------------------------------------------------------------------------+
|                 | LIVE MINI-MAP & AKTIVITAS                                                                             |
|                 | +---------------------------------------------------+ +-----------------------------------------------+ |
|                 | | MINI-MAP (LIVE SEBARAN)                           | | AKTIVITAS TERBARU (LIVE FEED)                 | |
|                 | | [● 42 Rider] [14 Zona] [⤢ Buka Peta]              | | • 14:34 [RIDER] Doni check-in Z-01            | |
|                 | | +-----------------------------------------------+ | | • 14:32 [SALES] Rp 54.000 (3 Cup) di Z-03     | |
|                 | | |           [Poligon Z-01 Sudirman]             | | | • 14:28 [ZONA] Sudirman status [PADAT]        | |
|                 | | |            (●) Rider Doni (SCBD)              | | | • 14:15 [FLEET] Armada B-102 masuk Servis     | |
|                 | | |        [Poligon Z-02 Kuningan]                | | | • 14:00 [CRON] Sync Cuaca Selesai             | |
|                 | | |         (●) Rider Dimas (Mega)                | | |                                               | |
|                 | | +-----------------------------------------------+ | | [ Auto-scroll On (●) ]  [ Bersihkan ]         | |
|                 | | Top: Sudirman (4/4) | Kuningan (3/5) | Blok M (5/5) |                                               | |
|                 | +---------------------------------------------------+ +-----------------------------------------------+ |
+-------------------------------------------------------------------------------------------------------------------------+
```

---

## 4. Wireframe Modal Dialog

### 4.1 Modal: Rekalkulasi DSS BWM (`#modal-recalculate-dss`)
```text
+-----------------------------------------------------------------------+
| REKALKULASI BOBOT DSS                                     [ X Tutup ] |
+-----------------------------------------------------------------------+
| Jalankan ulang perhitungan matriks bobot BWM kriteria zona.           |
|                                                                       |
| Model Aktif:                                                          |
| • Best  : POTENSI_PASAR (0.428)                                       |
| • Worst : JARAK_HUB (0.062)                                           |
| • Nilai ξ* : 0.042 (Valid)                                            |
|                                                                       |
| [ ] Update data cuaca sebelum kalkulasi                               |
|                                                                       |
| ───────────────────────────────────────────────────────────────────── |
| [ Batal ]                                           [ 🔄 HITUNG ]     |
+-----------------------------------------------------------------------+
```

### 4.2 Modal: Sync Cuaca API (`#modal-sync-weather`)
```text
+-----------------------------------------------------------------------+
| SINKRONISASI CUACA                                        [ X Tutup ] |
+-----------------------------------------------------------------------+
| Mengambil parameter cuaca OpenWeather untuk 18 zona operasional.      |
| Status API: [ READY ] | Terakhir: 14:00 WIB (35 mnt lalu)             |
| Progress: [████████████████████░░░░░░] 75% Mengunduh Data...          |
|                                                                       |
| ───────────────────────────────────────────────────────────────────── |
| [ Tutup ]                                         [ SINKRONKAN ]      |
+-----------------------------------------------------------------------+
```

---

## 5. State & Interaktivitas UI/UX

1. **Mini-Map**: Klik `[ ⤢ Buka Peta ]` langsung membuka `/map`.
2. **Skeleton Loader**: Shimmer box saat fetching data.
3. **Socket Event**: Counter rider berkedip halus saat ada update lokasi.

---

## 6. Panduan Responsivitas & PWA

- **Desktop (1280px+)**: 4 kolom KPI, 2 kolom grid (8:4).
- **Tablet (768px - 1024px)**: 2x2 grid KPI, stacked 1 kolom (Grafik, Mini-Map, Feed).
- **Mobile (375px - 430px)**: KPI carousel scroll horizontal, widget Mini-Map compact (tinggi 180px).
