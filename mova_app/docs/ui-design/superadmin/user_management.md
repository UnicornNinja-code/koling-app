# Spesifikasi UI/UX: Super Admin - Manajemen User (`/users`)

Dokumen ini merancang antarmuka **User Management** untuk Super Admin dengan tata letak minimalis dan ringkas (*PWA-ready*).

---

## 1. Audit Endpoint & Data Contract

| Properti | Detail |
| :--- | :--- |
| **Get All Users** | `GET /api/users?page=1&limit=10&role=ALL&status=ALL&search=` |
| **Get User Detail** | `GET /api/users/:id` |
| **Create User** | `POST /api/users` |
| **Update User** | `PUT /api/users/:id` |
| **Toggle Status** | `PATCH /api/users/:id/status` |
| **Reset Password** | `POST /api/users/:id/reset-password` |
| **User Audit Logs**| `GET /api/users/:id/audit-logs` |
| **Delete User** | `DELETE /api/users/:id` |
| **Status Audit** | ✅ Endpoint aktif (RBAC: `SUPERADMIN`) |

---

## 2. Pemetaan Komponen Svelte & Opaline Design Tokens

### 2.1 Komponen Svelte
- **Layout**: `AppLayout.svelte`, `TopBar.svelte`, `Sidebar.svelte`
- **Tabel & List**: `DataTable.svelte`, `Pagination.svelte`, `DropdownMenu.svelte`
- **Form Controls**: `Input.svelte`, `Select.svelte`, `Button.svelte`, `Switch.svelte`
- **Overlay**: `Modal.svelte`, `Drawer.svelte`, `Alert.svelte`, `Badge.svelte`

### 2.2 Token Desain Opaline
- **Surface**: `var(--color-surface)` (`#FFFFFF`), Border: `1px solid var(--color-border)` (`#D2D2D4`)
- **Badges**:
  - `SUPERADMIN`: `#EF4444` / `#FEF2F2`
  - `MANAGEMENT`: `#3B82F6` / `#EFF6FF`
  - `SUPERVISOR`: `#F59E0B` / `#FFFBEB`
  - `RIDER`: `#10B981` / `#ECFDF5`
  - `AKTIF`: `#10B981` / `#ECFDF5` | `NONAKTIF`: `#52525B` / `#E7E7E7`

---

## 3. Wireframe Visual High-Fidelity (ASCII Layout)

```text
+-------------------------------------------------------------------------------------------------------------------------+
| TOP BAR: [Logo COZIS] | [Q Cari user... (Ctrl+K)] | Breadcrumb: Master > User                   | [Avatar SA]           |
+-------------------------------------------------------------------------------------------------------------------------+
| SIDEBAR (240px) | MANAJEMEN USER (128 Total)                                                                            |
|                 |                                                                                                       |
| NAVIGATION      | TOOLBAR:                                                                                              |
| [ ] Dashboard   | [Q Cari nama, email...             ] [Role: Semua (4) v] [Status: Semua v]             [ + User ]     |
| [•] User        +-------------------------------------------------------------------------------------------------------+
| [ ] Zona        | DAFTAR USER                                                                                           |
| [ ] DSS         | +---------------------------------------------------------------------------------------------------+ |
| [ ] Armada      | | [ ] | USER & USERNAME            | EMAIL             | ROLE         | STATUS    | TERAKHIR LOGIN | AKSI | |
| [ ] Katalog     | +-----+----------------------------+-------------------+--------------+-----------+----------------+------+ |
| [ ] Plotting    | | [ ] | (Avatar) Super Admin       | admin@cozis.id    | [SUPERADMIN] | [AKTIF]   | 2 Mnt Lalu     | [•••]| |
| [ ] Map         | |     | @superadmin                |                   |              |           |                |      | |
| [ ] Laporan     | | [ ] | (Avatar) Budi Santoso      | budi.m@cozis.id   | [MANAGEMENT] | [AKTIF]   | 1 Jam Lalu     | [•••]| |
| [ ] Settings    | |     | @budi.santoso              |                   |              |           |                |      | |
|                 | | [ ] | (Avatar) Ahmad Fauzi       | spv.jkt@cozis.id  | [SUPERVISOR] | [AKTIF]   | 14:10 WIB      | [•••]| |
| QUICK STATS     | |     | @spv.jakarta01             |                   |              |           |                |      | |
| SA: 2 | Mgmt: 4 | | [ ] | (Avatar) Doni Pratama      | doni.r@cozis.id   | [RIDER]      | [AKTIF]   | 14:32 WIB      | [•••]| |
| SPV: 6| Rdr: 116| |     | @doni.pratama              |                   |              |           |                |      | |
|                 | +-----+----------------------------+-------------------+--------------+-----------+----------------+------+ |
|                 | Tampilkan: [ 10 v ]       1 - 10 dari 128 User                  [< Prev] [ 1 ] [ 2 ] ... [ 13 ] [Next >]      |
+-------------------------------------------------------------------------------------------------------------------------+
```

---

## 4. Wireframe Modal Dialog & Drawer

### 4.1 Menu Kontekstual (`•••`)
```text
+-------------------------------+
| [✎] Edit User                 |
| [🔑] Reset Password           |
| [🔒] Nonaktifkan              |
| [📋] Audit Log                |
| ───────────────────────────── |
| [🗑] Hapus Akun               |
+-------------------------------+
```

### 4.2 Modal: Tambah User (`#modal-user-form`)
```text
+-----------------------------------------------------------------------------------+
| TAMBAH USER                                                           [ X Tutup ] |
+-----------------------------------------------------------------------------------+
| Nama Lengkap                                                                      |
| [ Ahmad Fauzi                                                                   ] |
|                                                                                   |
| Username                                           Email                          |
| [ spv.jakarta01                                  ] [ spv.jkt01@cozis.id         ] |
|                                                                                   |
| Peran (Role)                                       No. WhatsApp                   |
| [ Dropdown: SUPERVISOR                         v ] [ 081234567890               ] |
|                                                                                   |
| Password Sementara                                                                |
| [ TempPassword2026!                                                     (eye)   ] |
| [✓] Kirim kredensial via email                                                    |
|                                                                                   |
| ───────────────────────────────────────────────────────────────────────────────── |
| [ Batal ]                                                               [ SIMPAN ]|
+-----------------------------------------------------------------------------------+
```

### 4.3 Modal: Reset Password (`#modal-reset-password`)
```text
+-----------------------------------------------------------------------------------+
| RESET PASSWORD: Ahmad Fauzi (@spv.jakarta01)                          [ X Tutup ] |
+-----------------------------------------------------------------------------------+
| Password Sementara Baru:                                                          |
| +-------------------------------------------------------------------------------+ |
| |  CZS-2026-X99bK#                                              [ 📋 Salin ]    | |
| +-------------------------------------------------------------------------------+ |
| (•) Wajib ganti sandi saat login berikutnya                                       |
|                                                                                   |
| ───────────────────────────────────────────────────────────────────────────────── |
| [ Batal ]                                                               [ TERAPKAN]
+-----------------------------------------------------------------------------------+
```

### 4.4 Drawer: Audit Log User (`#drawer-user-audit`)
```text
+-------------------------------------------------------------------+
| AUDIT LOG: @spv.jakarta01                             [ X Tutup ] |
+-------------------------------------------------------------------+
| • ID: usr_spv_001 | Status: [AKTIF] | Dibuat: 10 Jan 2026         |
| • Email: spv.jkt01@cozis.id | Telp: 081234567890                  |
|                                                                   |
| AKTIVITAS:                                                        |
| • 25 Aug, 14:10 WIB : [AUTH] Login IP 182.253.12.9                |
| • 24 Aug, 08:30 WIB : [PLOT] Plotting 5 Rider ke Sudirman CBD     |
| • 10 Jan, 09:00 WIB : [CREATE] Akun dibuat (SUPERVISOR)           |
|                                                                   |
| ───────────────────────────────────────────────────────────────── |
| [ 📥 Ekspor PDF ]                                       [ Tutup ] |
+-------------------------------------------------------------------+
```

---

## 5. State & Interaktivitas UI/UX

1. **Debounced Search**: Pencarian `300ms` sebelum query ke server.
2. **Async Validation**: Validasi email/username unik otomatis saat input blur.
3. **Empty State**: Menampilkan ikon cari kosong + tombol `[ Reset Filter ]`.

---

## 6. Panduan Responsivitas & PWA

- **Desktop (1280px+)**: Tabel 7 kolom lengkap dengan menu aksi dropdown.
- **Tablet (768px - 1024px)**: Kolom last login disembunyikan.
- **Mobile (375px - 430px)**: Tabel otomatis beralih menjadi **Card List User** vertikal dengan tombol aksi cepat.
