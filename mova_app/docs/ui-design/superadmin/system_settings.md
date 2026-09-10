# Spesifikasi UI/UX: Super Admin - Pengaturan Sistem (`/settings`)

Dokumen ini merancang antarmuka **Cron Engine & System Settings** untuk Super Admin dengan tata letak minimalis dan ringkas (*PWA-ready*).

---

## 1. Audit Endpoint & Data Contract

| Properti | Detail |
| :--- | :--- |
| **Get Cron Configs** | `GET /api/crons/configs` |
| **Get Cron Logs** | `GET /api/crons/logs?limit=50&level=ALL` |
| **Toggle Cron** | `PUT /api/crons/toggle/:cronKey` |
| **Trigger Cron** | `POST /api/crons/trigger/:cronKey` |
| **Update Schedule** | `PUT /api/crons/schedule/:cronKey` |
| **Global Audit Logs**| `GET /api/audit-logs?page=1&limit=20` |
| **Status Audit** | ✅ Endpoint aktif (RBAC: `SUPERADMIN` ONLY) |

---

## 2. Pemetaan Komponen Svelte & Opaline Design Tokens

### 2.1 Komponen Svelte
- **Layout**: `AppLayout.svelte`, `TopBar.svelte`, `Sidebar.svelte`
- **Navigasi & Kontrol**: `Tabs.svelte`, `Switch.svelte`, `Button.svelte`
- **Tabel & Logs**: `DataTable.svelte`, `LogViewer.svelte`, `Badge.svelte`
- **Overlay**: `Modal.svelte`, `Drawer.svelte`

### 2.2 Token Desain Opaline
- **Surface**: `var(--color-surface)` (`#FFFFFF`), Border: `1px solid var(--color-border)` (`#D2D2D4`)
- **Terminal Surface**: `#18181B` (Dark Monospace)
- **Log Badges**: `INFO` (#3B82F6), `WARN` (#F59E0B), `ERROR` (#EF4444), `SUCCESS` (#10B981)

---

## 3. Wireframe Visual High-Fidelity (ASCII Layout)

```text
+-------------------------------------------------------------------------------------------------------------------------+
| TOP BAR: [Logo COZIS] | [Q Cari setting... (Ctrl+K)] | Breadcrumb: Sistem > Cron & Audit         | [Avatar SA]           |
+-------------------------------------------------------------------------------------------------------------------------+
| SIDEBAR (240px) | CRON ENGINE & AUDIT TRAIL                                                                             |
|                 |                                                                                                       |
| NAVIGATION      | TABS:                                                                                                 |
| [ ] Dashboard   | [• 1. Cron Otomasi]             [ 2. Audit Trail ]             [ 3. Parameter API ]                   |
| [ ] User        +-------------------------------------------------------------------------------------------------------+
| [ ] Zona        | DAFTAR CRON WORKERS                                                                                   |
| [ ] DSS         | +---------------------------------------------------------------------------------------------------+ |
| [ ] Armada      | | TUGAS CRON                 | JADWAL        | RUN BERIKUT       | DURASI | STATUS       | AKSI MANUAL    | |
| [ ] Katalog     | +----------------------------+---------------+-------------------+--------+--------------+----------------+ |
| [ ] Plotting    | | 🌦 Weather Sync API        | */30 * * * *  | 14:30:00 WIB      | 142 ms | [• ON ] Aktif| [ ⚡ Run ]     | |
| [ ] Map         | | 🧠 Evaluasi TOPSIS DSS     | 0 6 * * *     | Besok 06:00 WIB   | 88 ms  | [• ON ] Aktif| [ ⚡ Run ]     | |
| [ ] Laporan     | | 🔄 Reset Shift Harian      | 0 0 * * *     | Besok 00:00 WIB   | 45 ms  | [• ON ] Aktif| [ ⚡ Run ]     | |
| [•] Settings    | | ⏱ Release Hold Armada      | */1 * * * *   | 14:02:00 WIB      | 12 ms  | [• ON ] Aktif| [ ⚡ Run ]     | |
|                 | | 🧹 Cleanup Expired Token   | 0 2 * * *     | Besok 02:00 WIB   | 31 ms  | [  OFF] Non  | [ ⚡ Run ]     | |
| ENGINE HEALTH   | +----------------------------+---------------+-------------------+--------+--------------+----------------+ |
| Cron Tasks: 5   +-------------------------------------------------------------------------------------------------------+
| Status: OPTIMAL | LIVE LOGS (Socket Stream)                                                         [ 🔄 Bersihkan ]    |
|                 | +---------------------------------------------------------------------------------------------------+ |
|                 | | [ 14:00:00 ] [INFO] [WeatherSync] Mengunduh data cuaca 18 zona dari OpenWeather API...            | |
|                 | | [ 14:00:01 ] [SUCCESS] [WeatherSync] Sukses update parameter cuaca (Suhu: 29°C, Lat: 142ms)      | |
|                 | | [ 14:01:00 ] [INFO] [FleetHold] Memeriksa 0 antrean armada hold kadaluarsa...                    | |
|                 | | [ 14:01:00 ] [SUCCESS] [FleetHold] 0 unit hold dilepaskan kembali ke status AVAILABLE.           | |
|                 | +---------------------------------------------------------------------------------------------------+ |
+-------------------------------------------------------------------------------------------------------------------------+
```

---

## 4. Wireframe Modal Dialog & Drawer

### 4.1 Modal: Trigger Cron Manual (`#modal-trigger-cron`)
```text
+-----------------------------------------------------------------------+
| TRIGGER MANUAL CRON                                       [ X Tutup ] |
+-----------------------------------------------------------------------+
| Eksekusi tugas **"Weather Sync API"** secara on-demand.               |
| Target: `POST /api/cron/sync-weather`                                 |
| Estimasi Durasi: ~150 ms                                              |
|                                                                       |
| [✓] Perbarui rekomendasi DSS setelah selesai                          |
|                                                                       |
| ───────────────────────────────────────────────────────────────────── |
| [ Batal ]                                           [ ⚡ JALANKAN ]   |
+-----------------------------------------------------------------------+
```

### 4.2 Drawer: Riwayat Eksekusi (`#drawer-cron-history`)
```text
+-------------------------------------------------------------------+
| RIWAYAT RUN: Weather Sync                             [ X Tutup ] |
+-------------------------------------------------------------------+
| STATISTIK (24 Jam):                                               |
| • Total Run: 48 | Sukses: 48 | Gagal: 0                           |
| • Rata Durasi: 135 ms | Kuota API: 48 / 1000                      |
|                                                                   |
| LOG RUN:                                                          |
| • 14:00:00 WIB [SUCCESS] (142 ms) - 18 Zona diperbarui.           |
| • 13:30:00 WIB [SUCCESS] (128 ms) - 18 Zona diperbarui.           |
|                                                                   |
| ───────────────────────────────────────────────────────────────── |
| [ 📥 Ekspor Log ]                                       [ Tutup ] |
+-------------------------------------------------------------------+
```

---

## 5. State & Interaktivitas UI/UX

1. **Instant Toggle**: Switch `ON/OFF` aktif instan tanpa reload.
2. **Auto-Scroll Stream**: Terminal logs otomatis menggulung ke baris terbaru.

---

## 6. Panduan Responsivitas & PWA

- **Desktop (1280px+)**: Tabel dan live terminal stream penuh.
- **Tablet (768px - 1024px)**: Kolom durasi diringkas, terminal dengan scrollbar vertikal.
- **Mobile (375px - 430px)**: Kartu cron vertikal dengan switch toggle di kanan atas.
