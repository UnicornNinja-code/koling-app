# MOVA Thesis Defense: Comprehensive Examiner Q&A Defense Bank

```text
================================================================================
                    MOVA THESIS DEFENSE ARTIFACT (P4-12)
                     EXAMINER QUESTION & ANSWER DEFENSE BANK
================================================================================
```

---

## 1. Domain 1: Research Methodology & System Architecture

### Q1.1: Mengapa memilih arsitektur *Distributed Monolith* (Bun + Express 5 + PostgreSQL/Redis) daripada arsitektur *Microservices*?
* **Jawaban**:
  1. **Latency & Throughput Spasial**: Dalam sistem pendukung keputusan real-time armada keliling, interaksi antara penyerapan koordinat GPS, validasi poligon PostGIS, dan ranking TOPSIS membutuhkan latensi sub-milidetik. Arsitektur modular monolit pada runtime Bun 1.4 mengeliminasi *network serialization overhead* (gRPC/HTTP inter-service hops).
  2. **Data Consistency (ACID) & RLS Multi-Tenant**: Transaksi perbankan penjualan dan alokasi armada memerlukan jaminan ACID yang ketat. Menggunakan satu PostgreSQL database engine dengan *kernel-level* Row-Level Security (RLS) jauh lebih aman dan konsisten daripada menerapkan *distributed saga/two-phase commit* antar-mikroservis.
  3. **Resource Efficiency**: Sistem berjalan dengan memori sangat rendah ($<250\text{ MB}$ RAM untuk backend) dan memanfaatkan BullMQ worker untuk operasi berat (*asynchronous processing*).

---

## 2. Domain 2: Mathematical Defense (BWM & Safe TOPSIS)

### Q2.1: Mengapa menggunakan Best-Worst Method (BWM) dibandingkan Analytical Hierarchy Process (AHP) untuk pembobotan kriteria?
* **Jawaban**:
  1. **Efisiensi Perbandingan Berpasangan**: Untuk $n = 6$ kriteria baku, AHP membutuhkan $\frac{n(n-1)}{2} = \frac{6 \times 5}{2} = 15$ perbandingan penuh, yang sering menyebabkan inkonsistensi pertimbangan manusia. BWM hanya membutuhkan $2n - 3 = 2(6) - 3 = 9$ perbandingan (vektor $A_B$ Best-to-Others dan $A_W$ Others-to-Worst).
  2. **Optimalitas Matematis**: BWM memformulasikan masalah penentuan bobot sebagai optimasi matematis Min-Max Linear Programming (Simplex LP), sehingga bobot $W^*$ yang dihasilkan bersifat optimal dan terbukti secara matematis.
  3. **Tingkat Konsistensi Tinggi**: Hasil uji empiris pada sistem MOVA menunjukkan nilai Rasio Konsistensi **$CR = 0.0029$**, jauh di bawah batas maksimum $CR \le 0.30$ (Rezaei, 2016).

### Q2.2: Bagaimana sistem mencegah *Division by Zero* dan *Rank Inversion* pada TOPSIS?
* **Jawaban**:
  1. **Zero-Variance Guard**: Pada normalisasi vektor $r_{ij} = \frac{x_{ij}}{\sqrt{\sum x_{kj}^2}}$, jika suatu kriteria bernilai 0 pada semua alternatif (misal: curah hujan 0 di seluruh kota), pembagi bernilai 0. `SafeTopsisEngine.ts` menangani kondisi ini dengan menetapkan $r_{ij} = 0.0$ secara deterministik tanpa melempar nilai `NaN` atau `Infinity`.
  2. **Zero-Distance Fallback Guard**: Jika semua kandidat zona memiliki skor yang persis identik sehingga jarak $D_i^+ = 0$ dan $D_i^- = 0$, rumus kedekatan relatif $R_i = \frac{D_i^-}{D_i^+ + D_i^-}$ akan menghasilkan pembagian nol. Sistem menangani kasus ini dengan menetapkan skor netral $R_i = 0.50$.
  3. **Pemisahan Kriteria Benefit & Cost**: Kriteria $C_1-C_3$ (Benefit: densitas POI, diversitas, keramaian) dan $C_4-C_6$ (Cost: cuaca, jarak akses, kompetitor) dipisahkan secara ketat saat menentukan Solusi Ideal Positif ($A^+$) dan Negatif ($A^-$).

---

## 3. Domain 3: GIS, PostGIS & LBS Spatial Telemetry

### Q3.1: Bagaimana MOVA menangani *GPS Jitter*, *Teleportation Anomaly*, dan *Boundary Flickering* pada geofence?
* **Jawaban**:
  1. **Haversine Velocity Ceiling**: Setiap data posisi GPS yang masuk dihitung kecepatannya terhadap titik sebelumnya ($v = \Delta d / \Delta t$). Jika $v > 33.33\text{ m/s}$ ($120\text{ km/h}$), data ditolak sebagai anomali *teleportation* atau pemalsuan lokasi (*mock GPS*).
  2. **Monotonic Timestamp Invariant**: Sistem hanya menerima data dengan urutan waktu monotonik naik ($t_{\text{current}} \ge t_{\text{prev}}$) untuk mencegah data *out-of-order* merusak riwayat kehadiran.
  3. **Buffer Histeresis Geofence**: Transisi status kehadiran menggunakan mesin keadaan 4 tahap (`ENTER` $\rightarrow$ `DWELL` $\rightarrow$ `EXIT` $\rightarrow$ `DEVIATION`) dengan batas buffer 50 meter dan ambang waktu tinggal 180 detik, sehingga rider yang bergerak di batas terluar zona tidak memicu log keluar-masuk secara berulang-ulang (*flickering*).
  4. **PostGIS Spatial Indexing**: Semua pencarian poligon zona (`ST_Contains`) dan kedekatan jalan protokol (`ST_DWithin`) menggunakan indeks spasial GiST (*Generalized Search Tree*) berkecepatan tinggi pada SRID 4326.

---

## 4. Domain 4: Multi-Tenant Security & RLS Defense

### Q4.1: Mengapa memilih PostgreSQL Row-Level Security (RLS) daripada menambahkan klausa `WHERE tenant_id = ...` manual di setiap query?
* **Jawaban**:
  1. **Kernel-Level Enforcement**: RLS dieksekusi langsung oleh engine database PostgreSQL. Jika ada kesalahan programmer pada logika aplikasi (misalnya lupa menambahkan `WHERE tenant_id`), database tetap secara otomatis memfilter baris data berdasarkan variabel sesi `app.current_tenant_id`.
  2. **Peran Khusus `NOBYPASSRLS`**: Aplikasi terhubung menggunakan database role `mova_app` yang dikonfigurasi dengan `NOSUPERUSER` dan `NOBYPASSRLS`. Bahkan jika terjadi kerentanan SQL Injection, penyerang tidak dapat membaca data tenant lain.
  3. **IDOR / BOLA Zero Information Leak**: Ketika penyerang mencoba mengakses ID resource milik tenant lain (misal: `/api/reports/export/:foreignId`), query RLS menghasilkan 0 baris, sehingga sistem mengembalikan respons `404 Not Found` standar. Hal ini mencegah penyerang mengetahui apakah suatu resource ID valid atau ada pada sistem.

---

## 5. Domain 5: Analytics & Asynchronous Reporting

### Q5.1: Mengapa ekspor laporan di-offload ke BullMQ worker dan mengapa `SALES_SETTLEMENT_REPORT` berstatus `DEFERRED`?
* **Jawaban**:
  1. **$O(1)$ Heap Memory & Non-Blocking**: Pembuatan file Excel (XLSX) dan PDF dengan ratusan ribu baris membutuhkan komputasi CPU dan alokasi memori yang intensif. Menggunakan BullMQ queue berbasis Redis dan *streaming transformer* memastikan memori server tetap konstan ($O(1)$) tanpa memblokir thread HTTP API Express.
  2. **Resource Governor**: Sistem membatasi maksimal 2 pekerjaan ekspor bersamaan per tenant (mengembalikan HTTP 429 jika saturasi) dan membatasi rentang query maksimal 90 hari / 100.000 baris.
  3. **Alasan Status `DEFERRED`**: Tabel database `shift_settlements` pada baseline saat ini belum memiliki kolom `tenant_id` tersendiri. Demi mempertahankan integritas multi-tenant RLS tanpa kompromi, fitur ekspor laporan settlement secara jujur dan transparan dikunci sebagai **`DEFERRED`** hingga migrasi skema lanjutan diterapkan.

---

## 6. Domain 6: Quality Assurance, Testing & Deployment

### Q6.1: Berapa cakupan pengujian (*test coverage*) sistem MOVA dan bagaimana status deployment-nya?
* **Jawaban**:
  1. **Test Suite Baseline**: Sistem divalidasi oleh **312 unit dan contract tests otomatis (286 backend + 26 frontend)** dengan total **883 assertions** dan **0 failure (100% pass)**.
  2. **Static Type Safety**: `svelte-check` menghasilkan **0 errors dan 0 warnings** pada seluruh komponen frontend Svelte 5 runes dan TypeScript.
  3. **Deployment Status**: Baseline software telah memenuhi kualifikasi **RC-1 Qualified** pada native runtime Bun 1.4 dan Node 22; sedangkan containerization Docker secara transparan dicatat sebagai *NOT PRESENT* dalam repositori dan dijadwalkan pada roadmap *post-RC release packaging*.
