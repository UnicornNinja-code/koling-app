# FRONTEND PART 02 — USER & RIDER MANAGEMENT (COMPREHENSIVE MULTI-PANEL)

## 1. Objective
Menyediakan modul manajemen pengguna & rider dengan arsitektur multi-panel: Matriks Hirarki Role, Panel KPI Pengguna & Rider, Tabel Pengguna Multifaset, Drawer Profil Rider 360° (Presensi, Omzet, Kepatuhan), Salin Tautan Undangan 48 Jam, serta modal konfirmasi deaktivasi yang aman.

---

## 2. Blueprint 5 Panel Utama Halaman User Management

```text
┌────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│ TOPBAR: User Management | [ + Undang Pengguna Baru ] [ 🔄 Refresh Data ] [ 📥 Unduh CSV Pengguna ]     │
├────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│ [PANEL 1] 4 KPI SUMMARY CARDS USER LIFECYCLE                                                           │
│ ┌──────────────────────┬──────────────────────┬──────────────────────┬───────────────────────────────┐ │
│ │ 👥 TOTAL PENGGUNA    │ 🟢 PENGGUNA AKTIF    │ ⏳ MENUNGGU AKTIVASI │ 🔒 AKUN NONAKTIF/TERKUNCI     │ │
│ │ 18 Akun Terdaftar    │ 16 Akun Aktif        │ 2 Akun (Token Valid) │ 0 Akun Nonaktif               │ │
│ │ 1 SA · 2 Mgt · 3 Spv │ 10 Rider Lapangan    │ 1 Spv · 1 Rider      │ Tingkat Retensi: 100%         │ │
│ └──────────────────────┴──────────────────────┴──────────────────────┴───────────────────────────────┘ │
├────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│ [PANEL 2] ROLE HIERARCHY & ACCESS PERMISSION MATRIX (Visual Diagram Wewenang & Batasan Eskalasi)       │
│ • Super Admin ──(Dapat Mengundang & Mengelola)──➔ Management ──➔ Supervisor ──➔ Rider Lapangan         │
│ • Hierarchy Guard: Management dilarang membuat Super Admin. Supervisor dilarang membuat Management.    │
├────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│ [PANEL 3 & 4] ROW: TABEL UTAMA PENGGUNA & DRAWER PROFIL RIDER 360° (12 Kolom: 8 + 4)                   │
│ ┌────────────────────────────────────────────────────────┬───────────────────────────────────────────┐ │
│ │ [PANEL 3] 📋 MULTI-FACET USER TABLE (8 Kolom)          │ [PANEL 4] 🛵 RIDER 360° PROFILE DRAWER    │ │
│ │ Filter: [ Role: Semua ] [ Status: Aktif ] [ Search ]   │ (Muncul saat nama rider di klik)          │ │
│ │ • Fajar Nugraha (RIDER) • fajar@mova.id • Aktif        │ • Nama: Fajar Nugraha (ID: RDR-004)       │ │
│ │ • Budi Santoso (MGT) • budi@mova.id • Aktif            │ • Tanggal Lahir: 1998-11-10 (27 Thn)      │ │
│ │ • Andi Wijaya (SPV) • andi@mova.id • Aktif             │ • Total Jam Kerja: 142 Jam (Bulan Ini)    │ │
│ │ • Susi Susanti (SPV) • susi@mova.id • Menunggu Aktif   │ • Total Omzet: Rp 14.850.000 (1.020 Cup)  │ │
│ │                                                        │ • Zona Favorit: Zona 02 (Alun-Alun Sda)   │ │
│ │ Aksi: [ 👁️ Profil ] [ ✏️ Edit ] [ 🔗 Salin Link ] [ 🔴 Nonaktifkan ]│ • Skor Kepatuhan SOP: 98% (Disiplin)    │ │
│ └────────────────────────────────────────────────────────┴───────────────────────────────────────────┘ │
├────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│ [PANEL 5] AUDIT LOG MUTASI PENGGUNA (5 Aktivitas Terakhir: Pembuatan Akun, Reset Sandi, Login Pertama) │
└────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Modal Konfirmasi Khusus User Management
1. **Modal Undang Pengguna (Hierarchy Protected):**
   - Form memilih Role. Jika login sebagai Management, opsi `SUPERADMIN` dinonaktifkan.
2. **Modal Salin Link Undangan (Copyable):**
   - Menampilkan link aktivasi lengkap, tombol salin 1-klik, dan hitung mundur kedaluwarsa token 48 jam.
3. **Modal Deaktivasi Pengguna (Danger Confirmation):**
   - Rincian identitas akun, sesi aktif yang akan terputus, serta konfirmasi teks `NONAKTIFKAN` sebelum dieksekusi.
