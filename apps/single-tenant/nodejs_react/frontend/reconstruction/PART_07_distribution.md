# FRONTEND PART 07 — RIDER PLOTTING & FIFO DISTRIBUTION (COMPREHENSIVE MULTI-PANEL)

## 1. Objective
Menyediakan modul distribusi rider & penugasan harian berbasis rekomendasi DSS TOPSIS, antrean presensi First-In-First-Out (FIFO), kartu kuota zona, alur Supervisor Override terjustifikasi, serta batch auto-assign.

---

## 2. Blueprint 5 Panel Utama Halaman Distribution & Plotting

```text
┌────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│ TOPBAR: Rider Plotting & Distribution | [ ⚡ Auto-Assign (DSS FIFO) ] [ 🔄 Refresh Antrean ] [ 📥 Unduh ]│
├────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│ [PANEL 1] 4 KPI SUMMARY CARDS PLOTTING STATUS                                                          │
│ ┌──────────────────────┬──────────────────────┬──────────────────────┬───────────────────────────────┐ │
│ │ 🛵 RIDER CHECKED-IN  │ 🟢 SUDAH DI-PLOTTING │ ⏳ MENUNGGU PENUGASAN│ 📍 ZONA PENUH (CAPACITY MAX)  │ │
│ │ 12 Rider Hadir       │ 10 Rider (83.3%)     │ 2 Rider dalam Antrean│ 4 dari 12 Zona                │ │
│ │ Presensi Terbuka     │ Status: Bertugas     │ Waktu Tunggu: 4 Mnt  │ 8 Zona Masih Tersedia Slot    │ │
│ └──────────────────────┴──────────────────────┴──────────────────────┴───────────────────────────────┘ │
├────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│ [PANEL 2 & 3] ROW: ANTREAN FIFO RIDER & MATRIKS KUOTA ZONA (12 Kolom: 5 + 7)                           │
│ ┌────────────────────────────────────────────────────────┬───────────────────────────────────────────┐ │
│ │ [PANEL 2] ⏳ ANTREAN PRESENSI FIFO (5 Kolom)           │ [PANEL 3] 📍 KUOTA & STATUS ZONA (7 Kolom)│ │
│ │ Urutan Berdasarkan Jam Check-in:                       │ 1. Zona 02 (Alun-Alun) [ Kuota: 2/2 PENUH]│ │
│ │ 1. [06:40] Fajar Nugraha ──➔ [ Ter-assign: Zona 02 ]   │    ↳ Rider: Fajar (R-004), Andi (R-001)   │ │
│ │ 2. [06:42] Budi Santoso  ──➔ [ Ter-assign: Zona 05 ]   │ 2. Zona 05 (Kawasan Bisnis) [ 2/2 PENUH ] │ │
│ │ 3. [06:55] Dani Pratama  ──➔ [ Standby di Hub ]        │ 3. Zona 01 (Pahlawan) [ 1/2 Tersedia 1 ]  │ │
│ │    ↳ Aksi: [ 🎯 Assign DSS ] [ ✍️ Manual Plot ]        │ 4. Zona 08 (Stasiun) [ 1/2 Tersedia 1 ]   │ │
│ └────────────────────────────────────────────────────────┴───────────────────────────────────────────┘ │
├────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│ [PANEL 4 & 5] ROW: REKOMENDASI SPK VS REALISASI & AUDIT OVERRIDE (12 Kolom: 6 + 6)                     │
│ ┌────────────────────────────────────────────────────────┬───────────────────────────────────────────┐ │
│ │ [PANEL 4] 🧠 REKOMENDASI TOPSIS HARIAN (6 Kolom)       │ [PANEL 5] 📜 LOG SUPERVISOR OVERRIDE (6)  │ │
│ │ Urutan Zona Direkomendasikan Sistem DSS:               │ Rekam Jejak Pengubahan Rekomendasi:       │ │
│ │ 1. Zona 02: Skor TOPSIS 0.892 (Potensi Tertinggi)      │ [07:15] Spv Andi ubah Rider Dani ke Z-08  │ │
│ │ 2. Zona 05: Skor TOPSIS 0.841                          │    ↳ Alasan: "Permintaan event bazar kopi"│ │
│ │ 3. Zona 01: Skor TOPSIS 0.785                          │ [07:05] Spv Andi setujui Rekomendasi DSS  │ │
│ └────────────────────────────────────────────────────────┴───────────────────────────────────────────┘ │
└────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Modal Konfirmasi Khusus Distribution & Plotting
1. **Modal Batch Auto-Assign (Primary):**
   - Menampilkan daftar pasangan Rider $\rightarrow$ Zona yang dihasilkan algoritma FIFO + TOPSIS sebelum dieksekusi secara masal.
2. **Modal Supervisor Override (Warning Audit):**
   - Mewajibkan pengisian alasan pengalihan zona dan konfirmasi pencatatan ke dalam *DSS Accuracy Report*.
