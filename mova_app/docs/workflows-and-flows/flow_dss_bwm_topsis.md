# 🧮 Alur 03: DSS Engine Suite (BWM & TOPSIS)

Dokumen ini menjelaskan alur kerja Sistem Pendukung Keputusan (*Decision Support System - DSS*) multi-kriteria berbasis kombinasi **Best-Worst Method (BWM)** untuk pembobotan kriteria dan **Technique for Order of Preference by Similarity to Ideal Solution (TOPSIS)** untuk perangkingan zona penjualan kopi keliling.

---

## 👥 1. Identifikasi Aktor & Peran (*Actors*)

1. **Superadmin**: Menentukan kriteria terbaik (*Best*) dan terburuk (*Worst*), mengisi skala perbandingan 1-9, dan mengaktifkan profil kalibrasi BWM.
2. **Mesin Optimasi BWM (Solver Linier)**: Menghitung bobot optimal kriteria ($w_j^*$) yang meminimalkan nilai inkonsistensi $\xi^*$ (*Xi*), serta memvalidasi rasio konsistensi ($CR \le 0.1$).
3. **Mesin Kalkulasi TOPSIS**: Menjalankan algoritma perangkingan zona 6-tahap berdasarkan matriks keputusan multi-dimensi (C1 s.d. C6).
4. **Layanan Satelit Cuaca Open-Meteo**: Menyediakan parameter cuaca satelit otomatis untuk kriteria C4.
5. **Database POI & Kompetitor**: Menyediakan data agregasi spasial untuk kriteria C1, C2, C3, C5, dan C6.

---

## 📊 2. Struktur 6 Kriteria Keputusan SPK

| Kode | Nama Kriteria | Tipe Atribut | Sumber Data | Bobot Default |
|:---:|:---|:---:|:---|:---:|
| **C1** | Densitas Titik Keramaian (POI Density) | **BENEFIT** (Makin tinggi makin baik) | Query Spasial PostGIS `pois` per zona | 0.32 (32%) |
| **C2** | Diversitas Kategori POI (POI Diversity) | **BENEFIT** (Makin beragam makin baik) | Jumlah kategori unik POI di dalam zona | 0.24 (24%) |
| **C3** | Skor Keramaian Waktu (Time-Slot Score) | **BENEFIT** (Sesuai jam operasional) | Matriks kategori `poi_categories` $\times$ slot jam | 0.20 (20%) |
| **C4** | Risiko Cuaca Buruk (Rain Probability) | **COST** (Makin rendah hujan makin baik) | Data Satelit Open-Meteo `weathers` | 0.12 (12%) |
| **C5** | Jarak Tempuh dari Central Hub (Distance) | **COST** (Makin dekat hub makin hemat tenaga) | Perhitungan Geodesik `ST_DistanceSphere` | 0.08 (8%) |
| **C6** | Kepadatan Kompetitor (Starling Density) | **COST** (Makin sedikit saingan makin baik) | Survei lapangan PostGIS `competitors` | 0.04 (4%) |

---

## 🎯 3. Use Case 3.1: Kalibrasi Bobot Kriteria dengan BWM (`/dss` Tab 1)

### A. Pre-conditions
- Pengguna login sebagai **Superadmin**.
- Membuka halaman Master DSS `/dss` pada Tab *"1. Kalibrasi Bobot BWM"*.

### B. Post-conditions
- Bobot kriteria teroptimasi ($w_1, w_2, \dots, w_6$) tersimpan ke tabel `dss_configurations` dengan status `is_active = true`.
- Nilai Rasio Konsistensi ($CR$) terverifikasi valid ($CR \le 0.1$).

### C. Basic Path (Alur Kalibrasi BWM)
1. Superadmin menentukan **Kriteria Terbaik (*Best Criteria*)** (misal: *C1 - Densitas POI*).
2. Superadmin menentukan **Kriteria Terburuk (*Worst Criteria*)** (misal: *C5 - Jarak dari Hub*).
3. Superadmin mengisi **Vektor Perbandingan Best-to-Others ($A_B$)** menggunakan skala Saaty (1 s.d. 9):
   - Seberapa penting kriteria Best dibandingkan kriteria lainnya.
4. Superadmin mengisi **Vektor Perbandingan Others-to-Worst ($A_W$)**:
   - Seberapa penting kriteria lainnya dibandingkan kriteria Worst.
5. Superadmin menekan tombol **"Hitung Optimasi BWM"**.
6. Backend memproses formulasi optimasi linier BWM:
   $$\min \xi^L \quad \text{s.t.} \quad |w_B - a_{Bj} w_j| \le \xi^L, \quad |w_j - a_{jW} w_W| \le \xi^L, \quad \sum w_j = 1, \quad w_j \ge 0$$
7. Backend menghitung Rasio Konsistensi: $CR = \frac{\xi^*}{CI}$ (menggunakan Indeks Konsistensi $CI$ sesuai skala preferensi tertinggi).
8. Frontend menampilkan diagram grafik batang bobot hasil kalibrasi, nilai bobot per kriteria, dan badge hijau *"Konsistensi Tinggi (CR = 0.042)"*.
9. Superadmin menekan **"Aktifkan Konfigurasi Ini"** $\rightarrow$ API `POST /api/dss/bwm/calibrate` menyimpan konfigurasi aktif ke database.

### D. Exceptional Path (Rasio Konsistensi Melebihi Batas)
- Jika nilai $CR > 0.10$ (misal: $CR = 0.24$ karena perbandingan input kontradiktif):
  - Frontend menampilkan kotak peringatan kuning: *"Perbandingan kurang konsisten ($CR > 0.10$). Harap sesuaikan kembali nilai perbandingan kriteria Best atau Worst."*
  - Tombol simpan tetap memberikan opsi perbaikan sebelum bobot diterapkan.

---

## 🎯 4. Use Case 3.2: Simulasi & Perangkingan Zona dengan TOPSIS (`/dss` Tab 4)

### A. Pre-conditions
- Terdapat minimal 2 zona berstatus `ACTIVE` di PostGIS.
- Bobot kriteria BWM telah aktif di database.

### B. Post-conditions
- Matriks evaluasi zona dan skor preferensi relatif ($C_i$) selesai dihitung.
- Zona diurutkan dari Peringkat 1 (Sangat Direkomendasikan) hingga Peringkat Terendah.

### C. Basic Path (6 Langkah Perhitungan TOPSIS)
1. Pengguna memilih **Slot Waktu Operasional** (*PAGI 06:00-10:00, SIANG 10:00-14:00, SORE 14:00-18:00, MALAM 18:00-22:00*) atau menggunakan waktu otomatis saat ini.
2. Pengguna menekan tombol **"Jalankan Simulasi TOPSIS"**.
3. Backend mengeksekusi pipeline 6-langkah pada `TopsisEngineService.ts`:
   - **Langkah 1: Pembentukan Matriks Keputusan ($X$)**:
     Mengambil data riil 6 kriteria untuk setiap zona aktif.
   - **Langkah 2: Normalisasi Matriks ($R$)**:
     $$r_{ij} = \frac{x_{ij}}{\sqrt{\sum_{k=1}^m x_{kj}^2}}$$
   - **Langkah 3: Matriks Terbobot ($V$)**:
     $$v_{ij} = w_j \times r_{ij}$$
   - **Langkah 4: Menentukan Solusi Ideal Positif ($A^+$) dan Negatif ($A^-$)**:
     - Untuk kriteria *Benefit* (C1, C2, C3): $A^+ = \max(v_{ij}), \quad A^- = \min(v_{ij})$
     - Untuk kriteria *Cost* (C4, C5, C6): $A^+ = \min(v_{ij}), \quad A^- = \max(v_{ij})$
   - **Langkah 5: Menghitung Jarak Separasi Euclidean ($D_i^+$ dan $D_i^-$)**:
     $$D_i^+ = \sqrt{\sum_{j=1}^n (v_{ij} - v_j^+)^2}, \qquad D_i^- = \sqrt{\sum_{j=1}^n (v_{ij} - v_j^-)^2}$$
   - **Langkah 6: Menghitung Nilai Preferensi Kedekatan Relatif ($C_i$)**:
     $$C_i = \frac{D_i^-}{D_i^+ + D_i^-} \quad (0 \le C_i \le 1)$$
4. Backend mengembalikan daftar zona yang telah diurutkan berdasarkan nilai $C_i$ tertinggi beserta matriks langkah per langkah.
5. Frontend merender tabel peringkat visual, badge rekomendasi (*Prioritas Utama, Potensial, Kurang Direkomendasikan*), dan tombol simpan snapshot laporan.
