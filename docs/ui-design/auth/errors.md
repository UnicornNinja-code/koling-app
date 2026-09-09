# Spesifikasi UI/UX: Status & Error Pages (`/inactive`, `/forbidden`, `/not-found`)

Dokumen ini merancang halaman status khusus dan penanganan kesalahan otorisasi di COZIS.

---

## 1. Halaman Akun Nonaktif (`/inactive`)

### Tujuan UX:
Memberikan kejelasan kepada pengguna yang dinonaktifkan oleh administrator (`is_active = false`) agar tidak mengalami looping login tanpa kejelasan.

### Wireframe:
```text
+-----------------------------------------------------------------------+
|  CARD CONTAINER (#FFFFFF)                                             |
|  Radius: 16px | Border: #D2D2D4 | Max-Width: 460px                   |
|                                                                       |
|  [Icon Alert-Octagon (Warna: #EF4444 Danger)]                         |
|                                                                       |
|  Akun Sedang Dinonaktifkan                                            |
|  Akses akun Anda sementara waktu telah dinonaktifkan oleh pihak       |
|  Management / Administrator operasional COZIS.                        |
|                                                                       |
|  +-----------------------------------------------------------------+  |
|  |  Informasi Akun:                                                |  |
|  |  Email   : user.name@cozis.id                                   |  |
|  |  Role    : RIDER                                                |  |
|  |  Status  : NONAKTIF                                             |  |
|  +-----------------------------------------------------------------+  |
|                                                                       |
|  Silakan hubungi supervisor atau tim IT COZIS untuk aktivasi kembali. |
|                                                                       |
|  [ KELUAR / LOGOUT ]                                                  |
|  Border: 1px solid #D2D2D4 | Text: #18181B | Radius: 8px              |
+-----------------------------------------------------------------------+
```

---

## 2. Halaman Akses Ditolak (`/forbidden` - HTTP 403)

### Wireframe:
```text
+-----------------------------------------------------------------------+
|  [Icon Shield-Alert (Warna: #F59E0B Warning)]                         |
|                                                                       |
|  403 - Akses Dibatasi                                                 |
|  Peran akun Anda tidak memiliki wewenang untuk membuka halaman ini.   |
|                                                                       |
|  [ KEMBALI KE DASHBOARD UTAMA ]                                       |
|  Background: #FF634A | Color: #FFFFFF | Radius: 8px                   |
+-----------------------------------------------------------------------+
```

---

## 3. Halaman Tidak Ditemukan (`*` - HTTP 404)

### Wireframe:
```text
+-----------------------------------------------------------------------+
|  [Icon Map-Pin-Off (Warna: #8E8E93 Subtle)]                           |
|                                                                       |
|  404 - Halaman Tidak Ditemukan                                        |
|  Rute URL yang Anda tuju tidak terdaftar di sistem COZIS.             |
|                                                                       |
|  [ MENUJU BERANDA ]                                                   |
+-----------------------------------------------------------------------+
```
