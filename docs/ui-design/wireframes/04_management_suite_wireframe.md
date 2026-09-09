# Wireframe Blueprint: Management Suite (Fase 4)

Dokumen ini mendefinisikan antarmuka khusus peran **Management** (Administrator Sumber Daya & Akun Bisnis) sesuai batasan [md/fitur.md](file:///f:/project_zero/md/fitur.md):
- Hierarchical Account Management (dilarang membuat Super Admin).
- Fleet Master Availability & Maintenance Control.
- Catalog Menu & Price Management.
- Laporan Bisnis & Utilisasi Armada.

---

## 1. Wireframe: Manajemen User Hierarkis (`/users`)

```text
+---------------------------------------------------------------------------------------------------+
| [Management Workspace]  MANAJEMEN AKUN PETUGAS                    [ + Tambah Akun Petugas ]       |
+---------------------------------------------------------------------------------------------------+
|  +---------------------------------------------------------------------------------------------+  |
|  | FORM TAMBAH AKUN PETUGAS HIERARKIS (ROLE MANAGEMENT):                                       |  |
|  | Nama Lengkap: [ Budi Santoso                              ]                                 |  |
|  | Email Resmi : [ budi@mova.id                              ]                                 |  |
|  | Peran Akses : [ Supervisor Hub Surabaya                 v ]                                 |  |
|  |               (Opsi: Management, Supervisor, Rider)                                         |  |
|  |               *Peringatan: Management Dilarang Membuat Akun Super Admin                     |  |
|  |                                                                                             |  |
|  | [ Generate Secure Activation Link & Kirim Undangan ]                                        |  |
|  +---------------------------------------------------------------------------------------------+  |
|                                                                                                   |
|  DAFTAR AKUN & STATUS PROVISI:                                                                    |
|  +-----------------------+--------------+------------------+---------------+--------------------+ |
|  | Nama Petugas          | Email        | Peran            | Status Akun   | Aksi               | |
|  +-----------------------+--------------+------------------+---------------+--------------------+ |
|  | Hendra Wijaya         | hendra@...   | Supervisor       | 🟢 ACTIVE     | [Edit] [Nonaktif]  | |
|  | Ahmad Fadillah        | ahmad@...    | Rider            | 🟢 ACTIVE     | [Edit] [Reset Sandi| |
|  | Doni Pratama          | doni@...     | Rider            | 🟡 INVITED    | [Kirim Ulang Token]| |
|  +-----------------------+--------------+------------------+---------------+--------------------+ |
+---------------------------------------------------------------------------------------------------+
```

---

## 2. Wireframe: Master Data Armada & Utilisasi (`/fleet`)

```text
+---------------------------------------------------------------------------------------------------+
| [Manajemen Armada]  KATALOG MASTER & STATUS KETERSEDIAAN ARMADA           [ + Registrasi Unit ]   |
+---------------------------------------------------------------------------------------------------+
|  RINGKASAN STATUS ARMADA HUB SURABAYA:                                                             |
|  +---------------------------+ +---------------------------+ +----------------------------------+ |
|  | Total Armada: 18 Unit     | | Siap Pakai: 12 Unit       | | Sedang Digunakan: 5 Unit         | |
|  | Tipe: 15 Gerobak, 3 Motor | | Status: [🟢 AVAILABLE]    | | Status: [🔵 IN_USE]              | |
|  +---------------------------+ +---------------------------+ +----------------------------------+ |
|                                                                                                   |
|  TABEL MASTER ARMADA GEROBAK KOPI:                                                                |
|  +-------------+-----------+----------------+---------------+-----------------+-----------------+ |
|  | Kode Unit   | Tipe      | Baterai        | Status Operasi| Rider Saat Ini  | Aksi            | |
|  +-------------+-----------+----------------+---------------+-----------------+-----------------+ |
|  | ARM-GB-001  | GEROBAK   | 95% (Normal)   | 🟢 AVAILABLE  | - (Di Hub)      | [Jadwal Servis] | |
|  | ARM-GB-002  | GEROBAK   | 88% (Normal)   | 🔵 IN_USE     | Ahmad Fadillah  | [Lacak GPS]     | |
|  | ARM-GB-003  | GEROBAK   | 22% (Rendah)   | 🟡 CHARGING   | - (Docking Hub) | [Catatan Bat]   | |
|  | ARM-GB-004  | GEROBAK   | 0% (Rusak)     | 🔴 MAINTENANCE| - (Bengkel Hub) | [Riwayat Servis]| |
|  +-------------+-----------+----------------+---------------+-----------------+-----------------+ |
+---------------------------------------------------------------------------------------------------+
```

---

## 3. Wireframe: Manajemen Katalog Menu & Penentuan Harga (`/catalog`)

```text
+---------------------------------------------------------------------------------------------------+
| [Katalog Menu]  MANAJEMEN MENU & HARGA KOPI                                [ + Tambah Menu Kopi ] |
+---------------------------------------------------------------------------------------------------+
|  +-----------------------+---------------------+-------------------+-------------+--------------+ |
|  | Nama Menu             | Kategori            | Harga Jual Satuan | Status Menu | Aksi         | |
|  +-----------------------+---------------------+-------------------+-------------+--------------+ |
|  | Kopi Susu Gula Aren   | SIGNATURE ESPRESSO  | Rp 18.000         | 🟢 AKTIF    | [Ubah Harga] | |
|  | Americano Dingin      | CLASSIC BLACK       | Rp 15.000         | 🟢 AKTIF    | [Ubah Harga] | |
|  | Caramel Macchiato     | MILK SPECIALTY      | Rp 20.000         | 🟢 AKTIF    | [Ubah Harga] | |
|  | Cold Brew Classic     | REFRESHMENT COLD    | Rp 22.000         | 🟡 HABIS    | [Ubah Status]| |
|  +-----------------------+---------------------+-------------------+-------------+--------------+ |
+---------------------------------------------------------------------------------------------------+
```
