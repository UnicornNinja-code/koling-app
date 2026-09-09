# Spesifikasi UI/UX: Supervisor - Monitoring Status Armada (`/fleet`)

Dokumen ini merancang antarmuka **Fleet Operational Monitoring** untuk Supervisor. Supervisor memantau ketersediaan armada di Hub dan armada yang sedang digunakan rider, **namun tidak dapat menghapus atau mengubah data master kepemilikan aset**.

---

## 1. Audit Endpoint & Data Contract

| Properti | Detail |
| :--- | :--- |
| **Get Armadas** | `GET /api/armadas` |
| **Status Audit** | ✅ Endpoint aktif di backend (RBAC: `SUPERVISOR`, `SUPERADMIN`, `MANAGEMENT`) |
| **Batasan Role** | ❌ Tombol Hapus Armada (*Delete*) dan Edit Nomor Rangka tidak diberikan kepada Supervisor |

---

## 2. Wireframe Struktur Visual (ASCII Layout)

```text
+---------------------------------------------------------------------------------------------------+
| TOP BAR: [Logo COZIS]  | Operasional Lapangan > Monitoring Armada                | [Avatar: SPV]  |
+---------------------------------------------------------------------------------------------------+
| SIDEBAR      | MONITORING ARMADA KENDARAAN (VIEW ONLY)                                            |
|              |                                                                                   |
| [ ] Dashboard| [Search: Plat Nomor / Rider...]  [Status: Semua v]                                 |
| [ ] Zona Ops +-----------------------------------------------------------------------------------+
| [ ] DSS TOPSIS| DAFTAR KENDARAAN & RIDER PENGGUNA HARI INI                                        |
| [ ] Plotting | +-------------------------------------------------------------------------------+ |
| [•] Armada   | | Plat Nomor | Tipe Unit | Status     | Rider Pengemudi | Lokasi Terakhir       | |
| [ ] Katalog  | +-------------------------------------------------------------------------------+ |
| [ ] Peta Ops | | B 1234 COZ | Motor Box | [IN_USE]   | Budi Santoso    | Zona Sudirman Central | |
| [ ] Laporan  | | B 5678 COZ | Motor Box | [IN_USE]   | Andi Wijaya     | Zona Kuningan Mega    | |
|              | | B 9999 COZ | Motor Box | [AVAILABLE]| — (Standby Hub) | Hub Pusat COZIS       | |
|              | | B 3333 COZ | Cart Bike | [SERVIS]   | — (Bengkel)     | Mitra Servis          | |
|              | +-------------------------------------------------------------------------------+ |
+---------------------------------------------------------------------------------------------------+
```
