# Spesifikasi UI/UX: Management - Manajemen Armada & Aset (`/fleet`)

Dokumen ini merancang antarmuka **Fleet Operational Management, Maintenance, & Utilization** untuk Management.

---

## 1. Audit Endpoint & Data Contract

| Properti | Detail |
| :--- | :--- |
| **Get Armadas** | `GET /api/armadas` |
| **Create Armada** | `POST /api/armadas` |
| **Update Armada** | `PUT /api/armadas/:id` |
| **Delete Armada** | `DELETE /api/armadas/:id` |
| **Status Audit** | ✅ Seluruh endpoint aktif di backend `armadaRoutes.js` (RBAC: `MANAGEMENT`, `SUPERADMIN`) |
| **Kewenangan** | Management memiliki hak penuh mengelola ketersediaan armada, registrasi unit baru, dan penjadwalan servis/perbaikan. |

---

## 2. Wireframe Struktur Visual (ASCII Layout)

```text
+---------------------------------------------------------------------------------------------------+
| TOP BAR: [Logo COZIS]  | Pengelolaan Aset > Manajemen Armada & Utilisasi         | [Avatar: Mgmt] |
+---------------------------------------------------------------------------------------------------+
| SIDEBAR      | KELOLA ASET ARMADA MOTOR & CART (TOTAL 50 UNIT)                                    |
|              |                                                                                   |
| [ ] Dashboard| [Search: Plat Nomor...] [Tipe: Semua v] [Status: Semua Status v]  [+ TAMBAH UNIT]  |
| [ ] User     +-----------------------------------------------------------------------------------+
| [•] Armada   | RINGKASAN UTILISASI ASET                                                          |
| [ ] Katalog  | • 38 Unit Sedang Beroperasi (76%)   • 8 Unit Siap di Hub   • 4 Unit Perbaikan     |
| [ ] Map      +-----------------------------------------------------------------------------------+
| [ ] Laporan  | TABEL ASET ARMADA & LOG SERVIS                                                    |
|              | +-------------------------------------------------------------------------------+ |
|              | | Plat Nomor | Tipe Unit | Odometer   | Status     | Servis Terakhir | Aksi      | |
|              | +-------------------------------------------------------------------------------+ |
|              | | B 1234 COZ | Motor Box | 12.450 km  | [IN_USE]   | 10/08/2026      | [Edit][Log| |
|              | | B 5678 COZ | Motor Box | 8.210 km   | [AVAILABLE]| 15/08/2026      | [Edit][Log| |
|              | | B 9999 COZ | Cart Bike | 4.100 km   | [SERVIS]   | Sedang Servis   | [Edit][Log| |
|              | +-------------------------------------------------------------------------------+ |
+---------------------------------------------------------------------------------------------------+
```

---

## 3. Fitur Utama & Interaksi

- **Log Servis Kendaraan**: Input catatan ganti oli, sparepart mesin espresso, dan batas kilometer servis berkala.
- **Registrasi Unit Baru**: Modal input plat nomor, jenis motor, dan nomor rangka/mesin aset perusahaan.
