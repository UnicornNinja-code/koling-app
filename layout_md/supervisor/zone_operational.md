# Spesifikasi UI/UX: Supervisor - Manajemen Zona Operasional (`/zones`)

Dokumen ini merancang antarmuka **Operational Zone Management & Geofence Inspection** untuk Supervisor. Sesuai batasan di [fitur.md](file:///f:/project_zero/md/fitur.md), Supervisor dapat mengaktifkan zona operasional dan memilih zona rekomendasi, **namun TIDAK memiliki izin menghapus master zone**.

---

## 1. Audit Endpoint & Data Contract

| Properti | Detail |
| :--- | :--- |
| **Get Zones** | `GET /api/zones` |
| **Get Zone Config** | `GET /api/zones/config` |
| **Activate Zone** | `PATCH /api/zones/:id/status` (Operasional) |
| **Status Audit** | ✅ Seluruh endpoint aktif di backend `zoneRoutes.js` (RBAC: `SUPERVISOR`, `SUPERADMIN`) |
| **Batasan Role** | ❌ Tombol `Delete Zone` dan form edit poligon master tidak tersedia untuk Supervisor |

---

## 2. Wireframe Struktur Visual (ASCII Layout)

```text
+---------------------------------------------------------------------------------------------------+
| TOP BAR: [Logo COZIS]  | Operasional Lapangan > Aktivasi Zona Harian             | [Avatar: SPV]  |
+---------------------------------------------------------------------------------------------------+
| SIDEBAR      | ZONA OPERASIONAL HARI INI                                                          |
|              |                                                                                   |
| [ ] Dashboard| [Filter Status: Aktif Hari Ini v]  [Cari Zona...]         [+ AKTIFKAN SEMUA ZONA]  |
| [•] Zona Ops +-----------------------------------------------------------------------------------+
| [ ] DSS TOPSIS| DAFTAR STATUS ZONA HARI INI                                                       |
| [ ] Plotting | +-------------------------------------------------------------------------------+ |
| [ ] Armada   | | Nama Zona          | Kuota Max | Rider Terplotting | Status Operasional       | |
| [ ] Katalog  | +-------------------------------------------------------------------------------+ |
| [ ] Peta Ops | | Sudirman Central   | 6 Rider   | 6 Rider           | [● AKTIF] [Toggle Off]   | |
| [ ] Laporan  | | Kuningan Mega      | 5 Rider   | 3 Rider           | [● AKTIF] [Toggle Off]   | |
|              | | Blok M Square      | 4 Rider   | 4 Rider           | [● AKTIF] [Toggle Off]   | |
|              | | Senayan Park       | 4 Rider   | 0 Rider           | [○ NONAKTIF] [Aktifkan]  | |
|              | +-------------------------------------------------------------------------------+ |
+---------------------------------------------------------------------------------------------------+
```
