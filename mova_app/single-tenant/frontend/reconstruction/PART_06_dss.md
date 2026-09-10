# FRONTEND PART 06 — DSS BWM-TOPSIS ENGINE & CRITERIA CALIBRATION (COMPREHENSIVE MULTI-PANEL)

## 1. Objective
Menyediakan modul manajemen Decision Support System (DSS) berbasis algoritma **Best-Worst Method (BWM)** dan **TOPSIS**: Matriks Perbandingan Berpasangan, Visualisasi Radar Bobot Kriteria, Gauge Rasio Konsistensi ($\xi^* \le 0.10$), serta Simulasi Live Skor Preferensi Titik Rekomendasi.

---

## 2. Blueprint 5 Panel Utama Halaman DSS Management

```text
┌────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│ TOPBAR: DSS Engine Calibration | [ ⚙️ Kalibrasi Ulang BWM ] [ 🧪 Jalankan Simulasi TOPSIS ] [ 📥 Unduh ]│
├────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│ [PANEL 1] 4 KPI SUMMARY CARDS KESEHATAN ENGINE DSS                                                     │
│ ┌──────────────────────┬──────────────────────┬──────────────────────┬───────────────────────────────┐ │
│ │ 🧠 RASIO KONSISTENSI │ 🏆 KRITERIA TERBAIK  │ 📉 KRITERIA TERBURUK │ 🎯 AKURASI REKOMENDASI        │ │
│ │ ξ* 0.042 (Optimal)   │ POTENSI_PASAR        │ JARAK_HUB            │ 94.2% Acceptance Rate         │ │
│ │ Ambang Batas: ≤ 0.10 │ Bobot: 38.2% (w=0.38)│ Bobot: 4.1% (w=0.04) │ 5.8% Supervisor Override      │ │
│ └──────────────────────┴──────────────────────┴──────────────────────┴───────────────────────────────┘ │
├────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│ [PANEL 2 & 3] ROW: MATRIKS PERBANDINGAN BWM & RADAR BOBOT KRITERIA (12 Kolom: 7 + 5)                   │
│ ┌────────────────────────────────────────────────────────┬───────────────────────────────────────────┐ │
│ │ [PANEL 2] ⚖️ BWM PAIRWISE COMPARISON MATRIX (7 Kolom)  │ [PANEL 3] 📊 KRITERIA WEIGHT RADAR (5 Kol)│ │
│ │ Pemilihan Kriteria Acuan:                              │ Bobot Kriteria Hasil Solver LP:           │ │
│ │ • Best Criterion : [ POTENSI_PASAR (K1) ▼ ]            │ 1. K1 Potensi Pasar: 38.2% (w=0.382)      │ │
│ │ • Worst Criterion: [ JARAK_HUB (K6) ▼ ]                │ 2. K2 Kepadatan POI: 22.4% (w=0.224)      │ │
│ │ Slider Skala Saaty (1-9):                              │ 3. K3 Aksesibilitas: 16.5% (w=0.165)      │ │
│ │ • Best vs K2: [==4==] • Best vs K3: [==3==]            │ 4. K4 Kepadatan Kompetitor: 11.2% (Cost)  │ │
│ │ • Best vs K4: [==5==] • Best vs K5: [==6==]            │ 5. K5 Faktor Cuaca: 7.6% (w=0.076)        │ │
│ │                                                        │ 6. K6 Jarak ke Hub: 4.1% (Cost, w=0.041)  │ │
│ │ [ 🧪 Hitung Nilai Bobot Baru (Linear Programming) ]    │ Total Bobot: Σw = 1.000 (100%)            │ │
│ └────────────────────────────────────────────────────────┴───────────────────────────────────────────┘ │
├────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│ [PANEL 4 & 5] ROW: MATRIKS KEPUTUSAN TERISOLASI & SIMULASI RANKING TOPSIS (12 Kolom: 5 + 7)            │
│ ┌────────────────────────────────────────────────────────┬───────────────────────────────────────────┐ │
│ │ [PANEL 4] 📐 SOLUSI IDEAL POSITIF & NEGATIF (A+, A-)   │ [PANEL 5] 🏆 TOPSIS LIVE SIMULATION TABLE │ │
│ │ • Jarak Solusi Positif (D+) & Negatif (D-)             │ Ranking Titik Jual Rekomendasi:           │ │
│ │ • Normalisasi Matriks Keputusan Euclidean              │ 1. Spot Alun-Alun A: Skor V = 0.892 (Z02) │ │
│ │ • Kategori Bobot Benefit (+) vs Cost (-) Terpetakan    │ 2. Spot Depan Mall B: Skor V = 0.841 (Z05)│ │
│ │                                                        │ 3. Spot Taman Pinang: Skor V = 0.785 (Z01)│ │
│ └────────────────────────────────────────────────────────┴───────────────────────────────────────────┘ │
└────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Modal Konfirmasi Khusus DSS Engine
1. **Modal Terapkan Bobot Baru (High Impact Warning):**
   - Menampilkan tabel perbandingan bobot lama vs bobot baru serta nilai $\xi^*$ baru.
   - Peringatan bahwa perubahan bobot akan memengaruhi rekomendasi penugasan harian rider selanjutnya.
