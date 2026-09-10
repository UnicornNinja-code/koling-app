# Spesifikasi UI/UX: Supervisor - Dashboard Komando Operasional

Dokumen ini merancang antarmuka **Operational Command Dashboard** untuk peran Supervisor. Supervisor adalah pusat komando lapangan yang mengawasi kehadiran rider, eksekusi DSS, kepatuhan geofence, dan plotting operasional harian.

---

## 1. Audit Endpoint & Data Contract

| Properti | Detail |
| :--- | :--- |
| **Get Summary** | `GET /api/dashboard/summary` |
| **Get Zone Performance** | `GET /api/dashboard/zone-performance` |
| **Get Distribution Overview** | `GET /api/distribution/overview` |
| **Get Active DSS Config** | `GET /api/dss/bwm/active` |
| **Status Audit** | ✅ Seluruh endpoint aktif di backend `dashboardRoutes.js`, `distributionRoutes.js`, `dssRoutes.js` (RBAC: `SUPERVISOR`) |
| **WebSocket Events** | `rider:location_updated`, `zone:status_changed`, `shift:checked_in` |

---

## 2. Wireframe Struktur Visual (ASCII Layout)

```text
+---------------------------------------------------------------------------------------------------+
| TOP BAR: [Logo COZIS]  | Shift: PAGI (06:00 - 15:00 WIB) | [Notif (4)] | [Avatar: SPV Jakarta]     |
+---------------------------------------------------------------------------------------------------+
| SIDEBAR      | OPERATIONAL COMMAND DASHBOARD (SUPERVISOR)                                         |
|              |                                                                                   |
| [•] Dashboard| [ Stat Card 1 ]     [ Stat Card 2 ]     [ Stat Card 3 ]     [ Stat Card 4 ]       |
| [ ] Zona Ops | Rider Hadir / Tugas Status Plotting     Zona Aktif Hari Ini Peringatan Geofence   |
| [ ] DSS TOPSIS| 42 / 45 Rider       38 Plotted (4 Wait) 14 / 18 Terisi      0 Pelanggaran         |
| [ ] Plotting | [● 36 Check-in Z1-Z14][+ AUTO DISTRIBUSI] [2 Zona Penuh]     [✓ AMAN & TERTIB]     |
| [ ] Armada   +-----------------------------------------------------------------------------------+
| [ ] Katalog  | MAIN OPERATIONAL WORKSPACE (2 Kolom 8:4)                                          |
| [ ] Peta Ops | +----------------------------------------------+ +--------------------------------+ |
| [ ] Laporan  | | STATUS PLOTTING & KEPADATAN ZONA HARI INI    | | REKOMENDASI DSS HARI INI       | |
|              | | +------------------------------------------+ | | Status Perhitungan: SIAP (06:00)| |
|              | | | Zona             | Kap | Terisi | Status | | |                                | |
|              | | +------------------------------------------+ | | Peringkat Zona Tertinggi:      | |
|              | | | #1 Sudirman CBD  | 6   | 6 / 6  | [PADAT]| | | 1. Sudirman CBD (Score: 0.842) | |
|              | | | #2 Kuningan Mega | 5   | 3 / 5  | [OK]   | | | 2. Kuningan Mega (Score: 0.791)| |
|              | | | #3 Blok M Square | 4   | 4 / 4  | [PADAT]| | | 3. Senayan SCBD (Score: 0.730) | |
|              | | | #4 Tebet Barat   | 4   | 2 / 4  | [OK]   | | |                                | |
|              | | +------------------------------------------+ | | [ JALANKAN DSS RE-CALCULATE ]  | |
|              | +----------------------------------------------+ +--------------------------------+ |
|              | +-------------------------------------------------------------------------------+ |
|              | | LIVE LOG KEHADIRAN & AKTIVITAS RIDER                                          | |
|              | | • 07:15 - Rider Budi Santoso CHECK-IN di Zona Sudirman CBD (Akurasi GPS 4m)   | |
|              | | • 07:10 - Rider Dimas klaim armada Motor Box B 1234 COZ di Hub               | |
|              | | • 06:45 - Rider Joni konfirmasi ketersediaan tugas (FIFO Position #1)        | |
|              | +-------------------------------------------------------------------------------+ |
+---------------------------------------------------------------------------------------------------+
```

---

## 3. Spesifikasi Komponen & Action Center

1. **Operational Summary Cards**:
   - Status kehadiran real-time, jumlah rider yang sudah check-in di zona vs masih perjalanan (OTW).
2. **Quick Re-run DSS Button**:
   - Memungkinkan Supervisor memperbarui kalkulasi TOPSIS secara cepat jika kondisi cuaca di pagi hari mendadak hujan badai.
