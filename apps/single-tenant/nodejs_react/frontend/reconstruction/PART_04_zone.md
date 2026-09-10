# FRONTEND PART 04 — SPATIAL ZONE & GEOMETRIC MANAGEMENT (COMPREHENSIVE MULTI-PANEL)

## 1. Objective
Menyediakan modul zonasi spasial interaktif multi-panel: Peta Fullscreen dengan Multi-Layer Control, Panel Validasi Geometri Real-Time (PostGIS), Panel Target & Ranking Efektivitas Zona, serta Panel Titik Jual Potensial (*Candidate Selling Spots*).

---

## 2. Blueprint 5 Panel Utama Halaman Zone Management

```text
┌────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│ TOPBAR: Spatial Zone Management | [ + Buat Zona Baru ] [ 📐 Gambar Poligon ] [ 🛡️ Validasi Geometri ]   │
├────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│ [PANEL 1] 4 KPI SUMMARY CARDS ZONASI SPASIAL                                                           │
│ ┌──────────────────────┬──────────────────────┬──────────────────────┬───────────────────────────────┐ │
│ │ 📍 TOTAL ZONA AKTIF  │ 📏 TOTAL LUAS CAKUPAN│ 🎯 TARGET OMZET TOTAL│ 🛵 KAPASITAS RIDER            │ │
│ │ 12 Zona Terdaftar    │ 42.8 km² (PostGIS)   │ Rp 3.600.000 / Hari  │ 18 Kuota Maksimal             │ │
│ │ 100% Geometri Valid  │ Rata-rata 3.5 km²/Z  │ Realisasi: 82%       │ 10 Terisi · 8 Tersedia        │ │
│ └──────────────────────┴──────────────────────┴──────────────────────┴───────────────────────────────┘ │
├────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│ [PANEL 2 & 3] ROW: PETA EDITOR POLIGON & VALIDATOR REAL-TIME (12 Kolom: 8 + 4)                         │
│ ┌────────────────────────────────────────────────────────┬───────────────────────────────────────────┐ │
│ │ [PANEL 2] 🗺️ INTERACTIVE SPATIAL MAP EDITOR (8 Kolom) │ [PANEL 3] 🛡️ REAL-TIME GEOMETRY VALIDATOR │ │
│ │ Multi-Layer Control:                                   │ (Memeriksa poligon yang sedang digambar): │ │
│ │ [✓] Batas Poligon 12 Zona (Warna Identitas)            │ • Status Geometri: 🟢 VALID (ST_IsValid)  │ │
│ │ [✓] Heatmap 8.432 POI                                  │ • Luas Area: 342.150 m² (0.34 km²) [AMAN] │ │
│ │ [✓] Jalur Merah: Jalan Tol (Larangan Masuk)            │ • Cek Tumpang Tindih (Overlap): 🟢 0 Zona │ │
│ │ [✓] Jalur Kuning: Jalan Protokol (Buffer 10m)          │ • Cek Memotong Jalan Tol: 🟢 0 Jalur      │ │
│ │                                                        │                                           │ │
│ │ Toolbar Peta: [ ✏️ Draw ] [ 🔄 Edit ] [ 🗑️ Clear ]      │ [ 💾 Simpan Zona ke PostGIS ]             │ │
│ └────────────────────────────────────────────────────────┴───────────────────────────────────────────┘ │
├────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│ [PANEL 4 & 5] ROW: RANKING EFEKTIVITAS ZONA & CANDIDATE SELLING SPOTS (12 Kolom: 6 + 6)                │
│ ┌────────────────────────────────────────────────────────┬───────────────────────────────────────────┐ │
│ │ [PANEL 4] 🏆 RANKING PERFORMA & EFISIENSI ZONA (6 Kol) │ [PANEL 5] 📍 CANDIDATE SELLING SPOTS (6)  │ │
│ │ 1. Zona 02 (Alun-Alun): Rp 620k (103% Target) • 2 Rdr  │ Titik Jual Rekomendasi di Zona Terpilih:  │ │
│ │ 2. Zona 05 (Kawasan Bisnis): Rp 510k (95%) • 2 Rdr     │ • Spot A: Depan Kantor Pos (Skor 0.89)    │ │
│ │ 3. Zona 01 (Pahlawan): Rp 440k (88%) • 1 Rdr           │ • Spot B: Pintu Masuk Taman (Skor 0.84)   │ │
│ │ 4. Zona 08 (Stasiun): Rp 390k (78%) • 1 Rdr            │ • Spot C: Sudut Pujasera (Skor 0.79)      │ │
│ └────────────────────────────────────────────────────────┴───────────────────────────────────────────┘ │
└────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Modal Konfirmasi Khusus Zone Management
1. **Modal Validasi Gagal (Hard Block):**
   - Jika poligon memotong jalan tol atau luas $< 0.1$ ha atau $> 500$ ha, tombol simpan memunculkan dialog daftar pelanggaran teknis dan tidak dapat disimpan.
2. **Modal Deaktivasi / Hapus Zona (Danger):**
   - Menampilkan konfirmasi jika zona sedang memiliki rider bertugas di lapangan.
