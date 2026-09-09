# Spesifikasi UI/UX: Management - Administrasi Akun Karyawan (`/users`)

Dokumen ini merancang antarmuka **Account Administration & User Provisioning** untuk peran Management. Sesuai arsitektur RBAC di [fitur.md](file:///f:/project_zero/md/fitur.md), Management memiliki wewenang untuk membuat dan mengelola akun **Management**, **Supervisor**, dan **Rider**, namun **DILARANG membuat akun Super Admin**.

---

## 1. Audit Endpoint & Data Contract

| Properti | Detail |
| :--- | :--- |
| **Get Users** | `GET /api/users` (Otomatis difilter oleh backend atau dibatasi tampilan) |
| **Create User** | `POST /api/users` (Backend memblokir jika payload role adalah `SUPERADMIN`) |
| **Update User** | `PUT /api/users/:id` |
| **Toggle Status** | `PATCH /api/users/:id/status` |
| **Delete / Deactivate** | `DELETE /api/users/:id` |
| **Status Audit** | ✅ Seluruh endpoint aktif di backend `userRoutes.js` (RBAC: `MANAGEMENT`) |
| **Hierarki Pembuatan** | Management ➔ `Create Management`, `Create Supervisor`, `Create Rider` |

### Guard Role Validation di Frontend:
Dropdown pilihan Role pada modal pembuatan akun hanya memunculkan:
1. `MANAGEMENT`
2. `SUPERVISOR`
3. `RIDER`
*(Opsi `SUPERADMIN` disembunyikan dan di-disable)*.

---

## 2. Wireframe Struktur Visual (ASCII Layout)

```text
+---------------------------------------------------------------------------------------------------+
| TOP BAR: [Logo COZIS]  | Administrasi Akun > Manajemen Akun Karyawan             | [Avatar: Mgmt] |
+---------------------------------------------------------------------------------------------------+
| SIDEBAR      | KELOLA AKUN KARYAWAN & OPERASIONAL                                                 |
|              |                                                                                   |
| [ ] Dashboard| [Search: Cari nama, email...] [Role: Supervisor/Rider/Mgmt v]  [+ BUAT AKUN BARU] |
| [•] User     +-----------------------------------------------------------------------------------+
| [ ] Armada   | DAFTAR AKUN TIM                                                                   |
| [ ] Katalog  | +-------------------------------------------------------------------------------+ |
| [ ] Map      | | Nama Lengkap       | Email / Username  | Role        | Status    | Aksi        | |
| [ ] Laporan  | +-------------------------------------------------------------------------------+ |
|              | | Ahmad Fauzi        | spv.jkt@cozis.id  | [SUPERVISOR]| [AKTIF]   | [Edit] [•••]| |
|              | | Hendra Wijaya      | spv.bdg@cozis.id  | [SUPERVISOR]| [AKTIF]   | [Edit] [•••]| |
|              | | Budi Santoso       | budi.r@cozis.id   | [RIDER]     | [AKTIF]   | [Edit] [•••]| |
|              | | Agus Supriyadi     | agus.r@cozis.id   | [RIDER]     | [NONAKTIF]| [Edit] [•••]| |
|              | +-------------------------------------------------------------------------------+ |
+---------------------------------------------------------------------------------------------------+

================================ MODAL: BUAT AKUN KARYAWAN BARU =====================================
+---------------------------------------------------------------------------------------------------+
|  MODAL CONTAINER (#FFFFFF | Max-Width: 500px)                                                     |
|                                                                                                   |
|  [Header] Buat Akun Karyawan Baru                                                     [X Tutup]   |
|  ───────────────────────────────────────────────────────────────────────────────────────────────  |
|  Nama Karyawan                                                                                    |
|  [ Masukkan nama lengkap                                                            ]             |
|                                                                                                   |
|  Email Karyawan                                    Peran Akun (Role)                              |
|  [ email@cozis.id                                ] [ Dropdown: RIDER / SUPERVISOR / MANAGEMENT v] |
|                                                                                                   |
|  Nomor Telepon (WhatsApp Notifikasi Undangan)                                                     |
|  [ 08xxxxxxxxxx                                                                     ]             |
|                                                                                                   |
|  ───────────────────────────────────────────────────────────────────────────────────────────────  |
|  [ Batal ]                                                     [ KIRIM UNDANGAN AKTIVASI ]        |
+---------------------------------------------------------------------------------------------------+
```

---

## 3. Spesifikasi Komponen & Validasi RBAC

- **Role Dropdown**: Strict select hanya 3 opsi (Rider, Supervisor, Management).
- **Aksi Dropdown (`•••`)**:
  - *Edit Data Kontak Karyawan*
  - *Kirim Ulang Tautan Aktivasi Sandi*
  - *Nonaktifkan Akun Sementara*
  - *Hapus Akun Karyawan (Hanya jika belum memiliki catatan transaksi)*.
