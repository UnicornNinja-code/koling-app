# FRONTEND PART 11 — 6-TAB REPORTING CENTER & MULTI-FORMAT EXPORT (COMPREHENSIVE MULTI-PANEL)

## 1. Objective
Menyediakan Pusat Laporan & Audit 6-Tab terpadu (Executive Summary, Rider Operational, Zone Effectiveness, Fleet Report, DSS Accuracy, Audit Logs) dengan toolbar filter periode dinamis, grafik visual pendukung, tabel data multi-kolom lengkap, dan tombol unduh CSV/PDF.

---

## 2. Blueprint 6 Tab Pusat Laporan MOVA

```text
┌────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│ TOPBAR: Pusat Laporan & Analitik | Filter: [ 📅 7 Hari Terakhir ▼ ] [ 📥 Unduh CSV ] [ 🖨️ Cetak PDF ]   │
├────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│ [TAB SELECTOR] (1) Executive  (2) Rider Ops  (3) Zona  (4) Armada  (5) Akurasi DSS  (6) Audit Log      │
├────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│ TAB 1: EXECUTIVE SUMMARY TAB                                                                           │
│ • [PANEL KPI] Omzet Total: Rp 18.420.000 • Total Transaksi: 614 • Rata-rata/Hari: Rp 2.63M             │
│ • [PANEL CHART] Grafik Penjualan Harian vs Target Bulanan (Breakdown Kopi vs Non-Kopi)                 │
│ • [PANEL TABLE] Ringkasan Penjualan per Zona & Kontribusi Terhadap Total Revenue                       │
├────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│ TAB 2: RIDER OPERATIONAL REPORT TAB                                                                    │
│ • [PANEL KPI] Rider Bertugas: 12 • Total Jam Kerja: 840 Jam • Kepatuhan Jam Check-in: 98.4%           │
│ • [PANEL TABLE] Tabel Performa Rider: Nama, Total Omzet, Total Cup, Presensi (In/Out), Kepatuhan SOP   │
├────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│ TAB 3: ZONE EFFECTIVENESS REPORT TAB                                                                   │
│ • [PANEL KPI] Efektivitas Zona: 84.2% • Zona Paling Produktif: Zona 02 • Rata-rata Omzet/Rider: Rp 245k│
│ • [PANEL MAP/TABLE] Heatmap Pendapatan Spasial & Rasio Pencapaian Target per Poligon Zona              │
├────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│ TAB 4: FLEET & ASSET UTILIZATION REPORT TAB                                                            │
│ • [PANEL KPI] Utilisasi Rata-rata: 78% • Total Odometer: 1.840 km • Biaya Servis Bulan Ini: Rp 450.000 │
│ • [PANEL TABLE] Daftar Unit Armada: Kode, Plat, Status Baterai, Riwayat Servis, Total Jam Operasional  │
├────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│ TAB 5: DSS ACCURACY & ACCEPTANCE REPORT TAB                                                            │
│ • [PANEL KPI] Tingkat Penerimaan DSS: 94.2% • Override Rate: 5.8% • Total Evaluasi SPK: 120 Rekomendasi│
│ • [PANEL CHART & TABLE] Evaluasi Perbandingan Rekomendasi TOPSIS vs Keputusan Supervisor               │
├────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│ TAB 6: CENTRALIZED AUDIT LOGS REPORT TAB                                                               │
│ • [PANEL FILTER & TABLE] Filter Multi-Aktor (Super Admin, Management, Supervisor, Rider)               │
│ • Rekaman Seluruh Mutasi Data, Login, Ganti Password, Override, dan Ekspor Laporan                     │
└────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Modal Konfirmasi Khusus Reporting & Export
1. **Modal Konfirmasi Ekspor CSV (Excel BOM):**
   - Menampilkan ringkasan rentang tanggal data yang akan diekspor dan konfirmasi format file.
2. **Modal Pratinjau Cetak PDF (Print Preview):**
   - Menampilkan layout dokumen resmi siap cetak (Kop surat, stempel tanggal, dan kolom tanda tangan).
