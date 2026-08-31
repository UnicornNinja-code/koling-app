# Spesifikasi UI/UX: Super Admin - Manajemen Armada (`/fleet`)

Dokumen ini merancang antarmuka **Fleet Management** untuk Super Admin dengan tata letak minimalis dan ringkas (*PWA-ready*).

---

## 1. Audit Endpoint & Data Contract

| Properti | Detail |
| :--- | :--- |
| **Get All Armadas** | `GET /api/armadas?status=ALL&search=` |
| **Get Armada Detail** | `GET /api/armadas/:id` |
| **Create Armada** | `POST /api/armadas` |
| **Update Armada** | `PUT /api/armadas/:id` |
| **Update Status / Servis** | `PATCH /api/armadas/:id/status` |
| **Maintenance Logs** | `GET /api/armadas/:id/maintenance` |
| **Delete Armada** | `DELETE /api/armadas/:id` |
| **Status Audit** | ✅ Endpoint aktif (RBAC: `SUPERADMIN`, `MANAGEMENT`) |
| **WebSocket** | `fleet:status_updated` |

---

## 2. Pemetaan Komponen Svelte & Opaline Design Tokens

### 2.1 Komponen Svelte
- **Layout**: `AppLayout.svelte`, `TopBar.svelte`, `Sidebar.svelte`
- **Display**: `StatCard.svelte`, `DataTable.svelte`, `Badge.svelte`
- **Form Controls**: `Input.svelte`, `Select.svelte`, `Button.svelte`
- **Overlay**: `Modal.svelte`, `Drawer.svelte`, `Alert.svelte`

### 2.2 Token Desain Opaline
- **Surface**: `var(--color-surface)` (`#FFFFFF`), Border: `1px solid var(--color-border)` (`#D2D2D4`)
- **Badges**:
  - `AVAILABLE`: `#10B981` / `#ECFDF5`
  - `IN_USE`: `#3B82F6` / `#EFF6FF`
  - `HOLD`: `#F59E0B` / `#FFFBEB`
  - `SERVIS`: `#EF4444` / `#FEF2F2`

---

## 3. Wireframe Visual High-Fidelity (ASCII Layout)

```text
+-------------------------------------------------------------------------------------------------------------------------+
| TOP BAR: [Logo COZIS] | [Q Cari armada... (Ctrl+K)] | Breadcrumb: Master > Armada               | [Avatar SA]           |
+-------------------------------------------------------------------------------------------------------------------------+
| SIDEBAR (240px) | MANAJEMEN ARMADA (50 Unit)                                                                            |
|                 |                                                                                                       |
| NAVIGATION      | OVERVIEW:                                                                                             |
| [ ] Dashboard   | +--------------------+  +--------------------+  +--------------------+  +--------------------+        |
| [ ] User        | | TOTAL ARMADA       |  | IN-USE             |  | TERSEDIA           |  | SERVIS             |        |
| [ ] Zona        | | 50 Unit            |  | 38 Unit (76%)      |  | 8 Unit             |  | 4 Unit             |        |
| [ ] DSS         | | [● 100% Terdaftar] |  | [● Bertugas Aktif] |  | [Siap Pakai]       |  | [Bengkel Mitra]    |        |
| [•] Armada      | +--------------------+  +--------------------+  +--------------------+  +--------------------+        |
| [ ] Katalog     +-------------------------------------------------------------------------------------------------------+
| [ ] Plotting    | TOOLBAR:                                                                                              |
| [ ] Map         | [Q Cari Plat Nomor, Model...       ] [Tipe: Semua v] [Status: Semua v]             [ + Armada ]       |
| [ ] Laporan     +-------------------------------------------------------------------------------------------------------+
| [ ] Settings    | DAFTAR ARMADA                                                                                         |
|                 | +---------------------------------------------------------------------------------------------------+ |
| QUICK METRICS   | | PLAT NOMOR  | MERK / MODEL          | TIPE        | ODOMETER  | STATUS      | RIDER          | AKSI   | |
| Cart: 15        | +-------------+-----------------------+-------------+-----------+-------------+----------------+--------+ |
| Motor Box: 30   | | B 1234 COZ  | Honda Supra GTR 150   | Motor Box   | 12.450 km | [IN_USE]    | Doni Pratama   | [•••]  | |
| Van: 5          | | B 5678 COZ  | Yamaha Jupiter MX King| Motor Box   | 8.210 km  | [AVAILABLE] | — (Di Hub)     | [•••]  | |
|                 | | B 9999 COZ  | Custom Cart E-Bike    | Cart Bike   | 4.100 km  | [SERVIS]    | Bengkel Motor  | [•••]  | |
|                 | | B 3456 COZ  | Honda Vario 160 Box   | Motor Box   | 18.900 km | [IN_USE]    | Ahmad Fauzi    | [•••]  | |
|                 | +-------------+-----------------------+-------------+-----------+-------------+----------------+--------+ |
|                 | 1 - 10 dari 50 Armada                           [< Prev] [ 1 ] [ 2 ] [ 3 ] [ 4 ] [ 5 ] [Next >]       |
+-------------------------------------------------------------------------------------------------------------------------+
```

---

## 4. Wireframe Modal Dialog & Drawer

### 4.1 Menu Kontekstual (`•••`)
```text
+-------------------------------+
| [✎] Edit Data                 |
| [🔧] Masuk Bengkel (Servis)   |
| [📋] Riwayat Servis           |
| ───────────────────────────── |
| [🗑] Hapus (Decommission)     |
+-------------------------------+
```

### 4.2 Modal: Registrasi Armada (`#modal-fleet-form`)
```text
+-----------------------------------------------------------------------------------+
| REGISTRASI ARMADA                                                     [ X Tutup ] |
+-----------------------------------------------------------------------------------+
| Plat Nomor Kendaraan                               Tipe Armada                    |
| [ B 1234 COZ                                     ] [ Dropdown: MOTOR_CART_BOX   v ] |
|                                                                                   |
| Merk & Model                                       Odometer Awal (Km)             |
| [ Honda Supra GTR 150 Custom Box                 ] [ 12450                      ] |
|                                                                                   |
| Status Awal: (•) AVAILABLE   ( ) SERVIS                                           |
|                                                                                   |
| Catatan Fasilitas:                                                                |
| [ Mesin espresso 2-group, cooler box 40L, inverter baterai                      ] |
|                                                                                   |
| ───────────────────────────────────────────────────────────────────────────────── |
| [ Batal ]                                                               [ SIMPAN ]|
+-----------------------------------------------------------------------------------+
```

### 4.3 Drawer: Riwayat Servis (`#drawer-fleet-maintenance`)
```text
+-------------------------------------------------------------------+
| RIWAYAT SERVIS: B 1234 COZ                            [ X Tutup ] |
+-------------------------------------------------------------------+
| • Model: Honda Supra GTR 150 | Odo: 12.450 km | Status: [IN_USE]  |
|                                                                   |
| LOG PERAWATAN:                                                    |
| • 15 Aug 2026 (Odo: 12.000 km) : [SERVIS RUTIN] Ganti oli, rem    |
|   Biaya: Rp 350.000 | Bengkel: Mitra SCBD Motor                   |
|                                                                   |
| • 10 Jul 2026 (Odo: 10.500 km) : [PERBAIKAN] Ganti aki kering     |
|   Biaya: Rp 280.000 | Teknisi Internal                            |
|                                                                   |
| [ + Catat Servis Baru ]                                           |
| ───────────────────────────────────────────────────────────────── |
| [ 📥 Cetak Log ]                                        [ Tutup ] |
+-------------------------------------------------------------------+
```

---

## 5. State & Interaktivitas UI/UX

1. **In-Use Lock**: Unit berstatus `IN_USE` tidak dapat dihapus.
2. **Socket Sync**: Status armada ter-update otomatis saat klaim/return.

---

## 6. Panduan Responsivitas & PWA

- **Desktop (1280px+)**: 4 KPI cards + tabel komprehensif.
- **Tablet (768px - 1024px)**: 2x2 grid KPI.
- **Mobile (375px - 430px)**: KPI carousel + Card list armada.
