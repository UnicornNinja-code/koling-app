# Spesifikasi UI/UX: Supervisor - Laporan Operasional & Absensi (`/reports`)

Dokumen ini merancang antarmuka **Operational Reports & Rider Performance** untuk Supervisor.

---

## 1. Audit Endpoint & Data Contract

| Properti | Detail |
| :--- | :--- |
| **Zone Performance** | `GET /api/dashboard/zone-performance` |
| **Sales Overview** | `GET /api/sales/overview` |
| **Distribution History** | `GET /api/distribution/overview` |
| **Status Audit** | ✅ Seluruh endpoint aktif di backend (RBAC: `SUPERVISOR`, `SUPERADMIN`) |

---

## 2. Wireframe Struktur Visual (ASCII Layout)

```text
+---------------------------------------------------------------------------------------------------+
| TOP BAR: [Logo COZIS]  | Laporan Lapangan > Kinerja Operasional & Absensi        | [Avatar: SPV]  |
+---------------------------------------------------------------------------------------------------+
| SIDEBAR      | PUSAT LAPORAN OPERASIONAL                                                          |
|              |                                                                                   |
| [ ] Dashboard| [Tab: Absensi & Check-in] [Tab: Penjualan per Zona] [Tab: Riwayat Plotting DSS]   |
| [ ] Zona Ops +-----------------------------------------------------------------------------------+
| [ ] DSS TOPSIS| FILTER & CETAK LAPORAN                                                            |
| [ ] Plotting | Tanggal: [ 25/08/2026 v ]  Zona: [ Sudirman CBD v ]  [ CETAK RINGKASAN SHIFT (PDF) ]|
| [ ] Armada   +-----------------------------------------------------------------------------------+
| [ ] Katalog  | TABEL LOG KEHADIRAN & KINERJA RIDER SHIFT HARI INI                                |
| [ ] Peta Ops | +-------------------------------------------------------------------------------+ |
| [•] Laporan  | | Nama Rider   | Waktu Hadir | Check-in Zona | Armada    | Penjualan (Cup) | Omzet | |
|              | +-------------------------------------------------------------------------------+ |
|              | | Budi Santoso | 06:05 WIB   | 07:15 (Z1)    | B 1234 COZ| 45 cup          | 720rb | |
|              | | Dimas Pratama| 06:10 WIB   | 07:22 (Z1)    | B 5678 COZ| 38 cup          | 610rb | |
|              | | Joni Wijaya  | 06:12 WIB   | 07:18 (Z2)    | B 9999 COZ| 42 cup          | 690rb | |
|              | +-------------------------------------------------------------------------------+ |
+---------------------------------------------------------------------------------------------------+
```
