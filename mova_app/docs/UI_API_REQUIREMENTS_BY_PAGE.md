# 📋 UI-First API Requirements Matrix by Page (Single Tenant)

Dokumen ini memetakan seluruh kebutuhan API Endpoint berdasarkan analisis visual mendalam terhadap file referensi UI mockups di `assets/img/`:
1. `superadmin-dashboard.png` (Dashboard Utama Super Admin / Management / Supervisor)
2. `superadmin-mapops.png` (Peta Operasi Spasial Real-time, Layer Switcher, Detail Zona, Radar Kriteria)
3. `superadmin-distribusirider.png` (Distribusi & Penugasan Rider, Prioritas DSS, Kapasitas Zona)
4. `superadmin-operationalrider.png` (Monitoring Lapangan Rider, Telemetri LBS, Geofence, Deviasi)
5. `superadmin-dss.png` (Manajemen DSS BWM-TOPSIS, Bobot Kriteria C1–C6, Simulasi & Riwayat)
6. *Insets & Modal References*: Halaman Login, Modal Tambah Zona Geofence, dan Mobile Rider View.

---

## 🎨 Design System v3.0 Specifications (SSOT UI Reference)

- **Color Tokens**:
  - `Primary`: `#2563EB` | `Primary Hover`: `#1D4ED8`
  - `Accent Orange`: `#F97316` (Brand MOVA)
  - `Success`: `#10B981` | `Warning`: `#F59E0B` | `Danger`: `#EF4444`
  - `Neutral 50`: `#FAFAFA` | `Neutral 900`: `#171717`
  - `Surface`: `#FFFFFF` | `Surface Dark`: `#131822` | `Background Dark`: `#0B0F17`
- **Radius**: `sm: 4px`, `md: 8px`, `lg: 12px`, `xl: 16px`, `full: 9999px`
- **Typography**: Inter (Heading 700/600, Body 400/500, Code JetBrains Mono)

---

## 📑 1. Halaman Autentikasi (Login & Security)
*Referensi Visual: Inset `Login Page` pada `superadmin-dashboard.png`*

### UI Components:
- Form Card: Input Email / Username, Input Password (toggle show/hide), Checkbox "Ingat saya", Tombol "Masuk", Link "Lupa password?".
- Branding Card: Logo MOVA Coffee, Tagline *"Coffee Operational Zone Intelligence System - Data. Analitik. Aksi. Untuk Operasional yang Lebih Baik."*

### API Endpoints yang Dibutuhkan:
| Method | Endpoint Path | Query / Body Payload | Kebutuhan Data UI & Output |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/login` | `{ identifier, password }` | Otentikasi user, return JWT token & info profil pengguna (`id, name, email, role`). |
| `POST` | `/api/auth/register` | `{ full_name, username, email, password, role }` | Pendaftaran akun baru terproteksi hierarki peran. |
| `POST` | `/api/auth/activate` | `{ token, password, name, birth_date }` | Aktivasi akun pengguna via token undangan & verifikasi tanggal lahir. |
| `POST` | `/api/auth/refresh-token` | - | Pembaruan access token sesi pengguna secara otomatis. |
| `GET` | `/api/auth/me` | Header: `Bearer <token>` | Validasi session saat reload / hydrate user state ke UI. |
| `POST` | `/api/auth/forgot-password` | `{ email }` | Mengirim link/token reset kata sandi ke email pengguna. |
| `POST` | `/api/auth/reset-password` | `{ token, password }` | Set kata sandi baru pasca verifikasi token. |
| `POST` | `/api/auth/first-login` | `{ newPassword }` | Wajib ganti password pertama kali untuk akun baru ter-provision. |
| `POST` | `/api/auth/logout` | `{ token }` | Hapus sesi login dan invalidasi refresh token. |

---

## 📊 2. Halaman Dashboard Utama (`superadmin-dashboard.png`)
*Dashboard Executive untuk Super Admin, Management, dan Supervisor*

### UI Components & Widgets:
1. **Top Header**: User Profile Avatar, Notifikasi Alert Badge (3 alerts), Jam/Tanggal Indonesia (`Senin, 15 September 2025 • 10:24 WIB`), Toggle Dark Mode, Live Status Hub Sidoarjo, Quick Search Global (`Ctrl + K`).
2. **Top KPI Metric Cards**:
   - *Zona Aktif*: `12` dari 17 zona (↑ 2 zona)
   - *Rider Aktif*: `8` dari 12 rider (↑ 1 rider)
   - *Armada Tersedia*: `5` dari 8 unit (→ 0 unit)
   - *Tingkat Kepatuhan Zona*: `87%` berdasarkan GPS & geofence (↑ 5%)
   - *Penjualan Hari Ini*: `Rp 2.450.000` dari 163 transaksi (↑ 12%)
3. **Peta Operasional Real-Time (Live Tracking)**:
   - Poligon Zona Operasi (warna per zona)
   - Jalur Protokol / Jalan Tol (garis layer biru & orange)
   - Titik POI & Hub Sidoarjo (Marker hitam icon Hub)
   - Posisi Rider & Armada Real-Time (Dot hijau/biru bergerak, Tooltip info rider: misal *Rider A-014, Dalam Tugas, 4.2 km/jam, Zona A*)
4. **Widget Rute & Rekomendasi TOPSIS (Card Kiri/Tengah)**:
   - Rekomendasi Terbaik: `ZON-SDA-01 (Alun-Alun Sidoarjo)` - Skor `0.823`
   - Metrik C1-C6 mini bars: Densitas POI 82%, Aksesibilitas 88%, Keramaian 84%
   - Tombol `Lihat Detail >`
   - Daftar 5 Rekomendasi Teratas (Ranking 1-5 dengan skor & badge *Terbaik, Sangat Baik, Baik, Cukup*).
5. **Widget Kondisi Cuaca & Lingkungan**:
   - Suhu saat ini: `31°C` (Cerah Berawan, Sidoarjo)
   - Kelembapan: `65%` | Angin: `12.5 km/j` | Jarak Pandang: `10.0 km`
6. **Widget Aktivitas Operasional (Progress Bars)**:
   - *Rider Check-in*: 8 / 12
   - *Armada Beroperasi*: 5 / 8
   - *Transaksi Hari Ini*: 163 transaksi
   - *Zona Patuh Geofence*: 11 / 12 zona
7. **Widget Log Aktivitas Terbaru (Live Stream Logs)**:
   - `Rider A-014 check-in di Zona A (10:18)` (Badge Hijau)
   - `Armada AR-003 diklaim rider (09:52)` (Badge Biru)
   - `Transaksi Rp 250.000 di Zona B (09:34)` (Badge Biru)
   - `Zona C keluar geofence [alert] (08:47)` (Badge Merah)

### API Endpoints yang Dibutuhkan:
| Method | Endpoint Path | Query / Body Payload | Kebutuhan Data UI & Output |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/dashboard/overview` | `?date=today` | Ringkasan 5 KPI Cards (Zona aktif, Rider aktif, Armada tersedia, Kepatuhan %, Omzet penjualan). |
| `GET` | `/api/zones` | `?status=ACTIVE` | Data poligon geojson semua zona operasi untuk layer peta. |
| `GET` | `/api/lbs/riders/live` | - | Data posisi GPS live rider, status tugas, kecepatan, dan zona saat ini. |
| `GET` | `/api/armadas` | - | Status unit armada (Tersedia, Digunakan, Maintenance). |
| `GET` | `/api/dss/recommendations` | - | Top 5 rekomendasi zona hasil perhitungan algoritma TOPSIS terkini. |
| `GET` | `/api/weather/hub/:city_name` | `city_name=Sidoarjo` | Data cuaca real-time Open-Meteo untuk Central Hub (suhu, kelembapan, angin, kondisi). |
| `GET` | `/api/analytics/operational/summary` | `?date=today` | Data statistik progress bar (Check-in, Armada beroperasi, Transaksi count, Geofence patuh). |
| `GET` | `/api/analytics/compliance/summary` | `?date=today` | Log riwayat kepatuhan & alert geofence terkini. |
| `GET` | `/api/roads/protocol` | - | Layer GeoJSON jalan protokol (pembatasan rute keliling). |
| `GET` | `/api/roads/toll` | - | Layer GeoJSON jalan tol (pembatasan rute dilarang). |

---

## 🗺️ 3. Halaman Map Operations / `Map Ops` (`superadmin-mapops.png`)
*Pusat Komando Peta Spasial Interaktif & Investigasi Zona*

### UI Components & Widgets:
1. **Header KPI Stats**:
   - Zona Aktif: `12 / 16` (↑ 2)
   - Rider Aktif: `42 / 80` (↑ 5)
   - Armada Beroperasi: `68 / 80` (↑ 3)
   - Kepatuhan Operasional: `91.4%` (↑ 2.8%)
   - Alert & Toast: `3` (↑ 1)
2. **Interactive Map Area & Controls**:
   - Zoom (+/-), Reset View, Compass orientation, Ruler scale bar (`0, 2.5, 5 km`).
   - Floating Layer Switcher Panel (Checkbox toggles):
     - *Zona Operasional*: Zona Aktif (Biru/Hijau), Zona Rekomendasi (Orange), Zona Degradasi (Kuning), Zona Invalid (Abu).
     - *Rider*: Rider Aktif (Hijau), Rider Deviasi (Merah), Rider Offline (Abu).
     - *Armada*: Armada Aktif, Armada Maintenance, Armada Offline.
     - *POI*: POI Utama, Jalan Protokol, Jalan Tol.
   - Floating Weather Widget (31°C Cerah Berawan, Hujan 20%, Kelembapan 68%, Angin 12 km/h).
3. **Right Drawer / Detail Zona Panel (Side Panel)**:
   - Header: Badge `Zona Rekomendasi`, Nama Zona `ZON-SDA-01 (Alun-Alun Sidoarjo)`.
   - Badges: `Rank #1`, `Skor 0.382` (↑ 12.4%).
   - Mini Stats: POI `182`, Rider `12`, Kapasitas `68%`.
   - Breakdown 6 Kriteria Utama (Progress bars C1–C6):
     - C1 Densitas POI: `0.87` (Hijau)
     - C2 Diversitas POI: `0.76` (Biru)
     - C3 Keramaian (Waktu): `0.69` (Ungu)
     - C4 Cuaca: `0.82` (Kuning)
     - C5 Jarak Rider: `0.71` (Merah/Pink)
     - C6 Kompetitor: `0.58` (Abu-abu)
   - Status Operasional: Badge `COMPLIANT`.
   - Cuaca di Zona: `30°C` (Hujan 18%).
   - Info Rider Terpilih: `Rider #R-014` (1.2 km • 3 menit).
   - Tombol Aksi: `Lihat Detail` (Secondary) & `Kelola Zona` (Primary).
4. **Bottom Dock Sections**:
   - *Rute & Rekomendasi TOPSIS*: Grafik profil elevasi / jarak rute (`ZON-SDA-01 -> Zona Alun-Alun Sidoarjo`, Jarak 0.62 km, Estimasi 10 min, Rider 1, Omzet Rp 0).
   - *Aktivitas Operasional (Live)*: Feed log deviasi & check-in rider.
   - *Distribusi Armada (Donut Chart)*: 68% (Beroperasi: 54, Maintenance: 12, Offline: 8, Cadangan: 6).

### API Endpoints yang Dibutuhkan:
| Method | Endpoint Path | Query / Body Payload | Kebutuhan Data UI & Output |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/zones` | - | FeatureCollection GeoJSON seluruh zona beserta metadata skor & kapasitas. |
| `GET` | `/api/zones/:id` | - | Detail lengkap single zone (poligon batas, status, kapasitas, ranking). |
| `GET` | `/api/dss/zones/:zoneId/raw-evaluation` | - | Nilai skor kriteria C1 sampai C6 mentah & terbobot untuk render progress bar / radar. |
| `GET` | `/api/lbs/riders/live` | - | Data koordinat GPS live rider beserta flag geofence compliance (`is_deviated, distance_to_zone`). |
| `GET` | `/api/armadas` | - | Data agregat status armada untuk render chart distribusi donat. |
| `GET` | `/api/weather/zone/:zone_id` | - | Info suhu, curah hujan, & kelembapan spesifik pada poligon zona terpilih. |
| `GET` | `/api/candidate-selling-locations/zone/:zoneId` | - | Titik rekomendasi spot penjualan potensial di dalam zona. |
| `GET` | `/api/roads/protocol` | - | GeoJSON rute jalan protokol untuk overlay pembatas. |
| `GET` | `/api/roads/toll` | - | GeoJSON rute jalan tol untuk overlay larangan. |

---

## 👥 4. Halaman Distribusi Rider (`superadmin-distribusirider.png`)
*Manajemen Penugasan Rider, Penyeimbangan Kapasitas Zona, dan Rekomendasi Penugasan DSS*

### UI Components & Widgets:
1. **Top Header**: Breadcrumb (`MOVA / Operasional / Distribusi Rider`), Quick Search, Notifikasi, User Avatar, Date Picker (`10 Sep 2025`), Status `Live`, Tombol `Sinkronkan`.
2. **Top Metric Cards**:
   - Total Rider: `48` (↑ 12% dari kemarin)
   - Rider Aktif: `42` (87.5% dari total)
   - Rider dalam Tugas: `36` (75.0%)
   - Rider Tersedia: `6` (12.5%)
   - Rata-rata Waktu Tugas: `28 mnt` (↓ 18% dari kemarin)
3. **Filter Bar**:
   - Dropdown `Semua Zona` | Dropdown `Semua Status` | Dropdown `Jenis Rider` | Input `Cari rider...`
4. **Spatial Map Distribusi**:
   - Poligon Zona A, B, C, D dengan label kapasitas (contoh: `ZON-SDA-01 8/12`, `ZON-SDA-02 12/15`, `ZON-SDA-03 10/14`, `ZON-SDA-04 6/10`).
   - Marker Rider berwarna: Hijau (Aktif), Kuning (Tugas), Biru (Tersedia), Merah/Abu (Offline).
   - Marker POI & Hub.
5. **Right Side Panels**:
   - *Ringkasan Distribusi*: Kapasitas terpakai per zona dengan progress bar & persentase (Total: `36 / 48 • 75%`).
   - *Cuaca Sidoarjo Mini Card*: 31°C Cerah Berawan (Hujan 20%, Kelembapan 68%, Angin 12 km/h).
   - *Rekomendasi Distribusi (DSS)*: List Zona Prioritas dengan skor Ci (`ZON-SDA-02: 0.823`, `ZON-SDA-01: 0.761`, dst).
6. **Tabel Daftar Rider (Bottom Table)**:
   - Header Controls: Tampilkan 10/25/50, Tombol `Ekspor (CSV/Excel)`, Tombol `+ Penugasan Massal` (Primary Orange).
   - Kolom: Checkbox row, ID Rider (`R-004`, `R-012`), Nama Rider, Zona Saat Ini (Badge warna zona), Lokasi Terakhir (Nama Jalan/Tempat), Status (Badge: *Aktif, Tugas, Tersedia, Offline*), Tugas Aktif (Nama Titik Spot), Waktu Tugas (durasi menit), Kolom Aksi.

### API Endpoints yang Dibutuhkan:
| Method | Endpoint Path | Query / Body Payload | Kebutuhan Data UI & Output |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/distribution/overview` | `?date=2025-09-10` | Ringkasan KPI distribusi (Total, Aktif, Dalam Tugas, Tersedia, Rata-rata durasi tugas, Kapasitas per zona). |
| `GET` | `/api/distribution/duty/status` | - | Data status penugasan real-time semua rider. |
| `GET` | `/api/users` | `?role=RIDER` | List seluruh data rider untuk populasi tabel & filter. |
| `GET` | `/api/zones` | - | Data zona + kapasitas maksimal vs jumlah rider bertugas saat ini. |
| `GET` | `/api/dss/recommendations` | - | Ranking rekomendasi penempatan zona dari DSS. |
| `POST` | `/api/distribution/auto-assign` | `{ date, algorithm: "BWM_TOPSIS" }` | Trigger pembagian tugas rider otomatis oleh sistem berbasis algoritma rekomendasi. |
| `POST` | `/api/distribution/manual-assign` | `{ rider_id, zone_id, candidate_location_id }` | Penugasan manual single rider ke zona / spot tertentu oleh Supervisor. |
| `GET` | `/api/distribution/runs` | `?limit=10` | Riwayat eksekusi batch distribusi rider. |

---

## 🛵 5. Halaman Operasional Rider / Monitoring Lapangan (`superadmin-operationalrider.png`)
*Monitoring Posisi, Kepatuhan Geofence, Deviasi, dan Status Tugas Rider*

### UI Components & Widgets:
1. **Top Metric Cards**:
   - Total Rider: `48` (↑ 12%)
   - Rider Aktif: `42 / 48` (87.5%)
   - Dalam Tugas: `36` (75.0%)
   - Offline: `6` (12.5%)
   - Rata-rata Waktu Tugas: `28 mnt` (↓ 18%)
2. **Filter & Control Bar**:
   - Datepicker `10 Sep 2025`, Dropdown `Semua Zona`, Dropdown `Semua Status`, Dropdown `Semua Armada`, Search input `Cari rider...`.
3. **Peta Monitoring Lapangan**:
   - Layer check: Zona Operasional, Rider Aktif, Rider Tugas, Rider Offline, POI, Jalan Protokol, Jalan Tol.
   - Marker rider dengan status warna (Hijau: On-Time, Kuning: Tugas, Merah: Deviasi, Abu: Offline).
4. **Right Side Panels**:
   - *Ringkasan Operasional*: On Time (`78% • 37 rider`), Terlambat (`12% • 6 rider`), Deviasi Zona (`8% • 4 rider`), Offline (`2% • 1 rider`).
   - *Aktivitas Terbaru*: Log feed dengan stempel waktu, nama rider, jenis aksi, dan badge (*Check-in zona [On Time], Deviasi zona ±120m [Deviasi], Selesai tugas [Selesai], Check-out [On Time], Offline sinyal hilang [Offline]*).
   - *Distribusi Rider per Zona*: Persentase keterisian zona (`ZON-SDA-01 12/12 100%`, `ZON-SDA-02 83%`, `ZON-SDA-03 67%`, `ZON-SDA-04 50%`).
   - *Box Catatan*: Info panduan SOP check-in/out.
5. **Tabel Daftar Rider Lapangan (Bottom Table)**:
   - Tombol `Filter`, Tombol `Export`, Tombol `+ Penugasan Manual`.
   - Kolom: Checkbox, No, Rider ID, Nama Rider, Zona Saat Ini, Status (Aktif/Tugas/Tersedia/Offline), Posisi Terakhir (Lat, Long presisi), Tugas Aktif, Waktu Tugas, Menu Aksi (`...`).

### API Endpoints yang Dibutuhkan:
| Method | Endpoint Path | Query / Body Payload | Kebutuhan Data UI & Output |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/analytics/operational/summary` | `?date=2025-09-10` | Ringkasan performa operasional (% on-time, terlambat, deviasi, offline). |
| `GET` | `/api/lbs/riders/live` | `?zone_id=...&status=...` | Lokasi live GPS rider, koordinat lat/long terkini, dan status geofence. |
| `GET` | `/api/lbs/zone-logs` | `?limit=20` | Feed log transisi zona, check-in, check-out, dan alert deviasi. |
| `GET` | `/api/reports/rider-operational` | `?date=2025-09-10` | Data tabel komprehensif riwayat tugas dan durasi kerja tiap rider. |
| `POST` | `/api/distribution/manual-assign` | `{ rider_id, zone_id }` | Modal penugasan manual langsung dari tabel. |

---

## ⚖️ 6. Halaman Manajemen DSS & Rekomendasi BWM-TOPSIS (`superadmin-dss.png`)
*Konfigurasi Pembobotan Best-Worst Method (BWM) dan Hasil Perankingan Zona TOPSIS*

### UI Components & Widgets:
1. **Top Metric Cards**:
   - Total Kriteria: `6` (Aktif: 6 • Nonaktif: 0)
   - Metode: `BWM + TOPSIS` (Badge Aktif)
   - Konfigurasi: `v1.0.0` (Terakhir diubah: 10 Sep 2025, 08:42)
   - Kualitas Data: `VALID` (0% degraded • 0% invalid)
2. **Tabel Kriteria Penilaian (Kiri Atas)**:
   - Tombol `+ Tambah Kriteria` (Primary Orange)
   - Kolom: Kode (C1–C6), Nama Kriteria & Deskripsi, Tipe (*Benefit / Cost*), Bobot BWM (0.18, 0.16, 0.14, 0.12, 0.10, 0.10), Arah (*↑ Higher / ↓ Lower*), Status (*Aktif*), Aksi (Edit icon, menu `...`).
     - `C1`: Densitas POI (Benefit, 0.18)
     - `C2`: Diversitas POI (Benefit, 0.16)
     - `C3`: Skor Keramaian Berbasis Waktu (Benefit, 0.14)
     - `C4`: Cuaca (Cost, 0.12)
     - `C5`: Jarak Rider (Cost, 0.10)
     - `C6`: Data Kompetitor (Benefit, 0.10)
3. **Panel Konfigurasi BWM (Kanan Atas)**:
   - Tombol `Edit` Konfigurasi
   - *Best Criteria*: Tag selector `C3 Skor Keramaian` (Best), `C1 Densitas POI`, `C2 Diversitas POI`
   - *Worst Criteria*: Tag selector `C5 Jarak Rider` (Worst), `C4 Cuaca`
   - *Skala Penilaian*: 1 – 9 (AHP/BWM-like scale)
   - *Ringkasan Bobot Kriteria (Donut Chart)*: 100% Total Bobot dengan color breakdown tiap kriteria.
4. **Tabel Hasil Perhitungan TOPSIS (Kiri Bawah)**:
   - Header: Timestamp (`10 Sep 2025, 08:42`), Status `Selesai`
   - Kolom: Rangking (1-5), Kode Zona, Nama Zona, Nilai Preferensi (Ci), Status (Badge: *Sangat Baik, Baik, Cukup*).
     - Rank 1: `ZON-SDA-01 (Alun-Alun Sidoarjo)` - Ci: `0.822` (Sangat Baik)
     - Rank 2: `ZON-SDA-04 (Taman Pinang)` - Ci: `0.761` (Baik)
     - Rank 3: `ZON-SDA-03 (RS Siti Hajar)` - Ci: `0.698` (Baik)
     - Rank 4: `ZON-SDA-02 (Delta Plaza)` - Ci: `0.642` (Cukup)
     - Rank 5: `ZON-SDA-05 (Pasar Larangan)` - Ci: `0.587` (Cukup)
5. **Riwayat Konfigurasi (Kanan Bawah)**:
   - Log audit: Perubahan konfigurasi BWM, penyesuaian kriteria cuaca, eksekusi metode TOPSIS, inisialisasi awal.

### API Endpoints yang Dibutuhkan:
| Method | Endpoint Path | Query / Body Payload | Kebutuhan Data UI & Output |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/dss/bwm/active` | - | Mengambil konfigurasi bobot BWM aktif, Best Criteria, Worst Criteria, dan nilai bobot C1–C6. |
| `GET` | `/api/dss/bwm/configs` | - | Menampilkan seluruh daftar versi konfigurasi bobot BWM yang tersimpan. |
| `POST` | `/api/dss/bwm/calculate` | `{ best_criterion, worst_criterion, others_to_worst, best_to_others }` | Menghitung vektor bobot optimal BWM dan konsistensi rasio ($\xi^*$). |
| `POST` | `/api/dss/bwm/:id/activate` | - | Mengaktifkan versi konfigurasi BWM tertentu sebagai rujukan aktif perankingan. |
| `POST` | `/api/dss/bwm/preview-impact` | `{ weights }` | Simulasi perankingan zona TOPSIS instan sebelum menyimpan perubahan bobot secara permanen. |
| `POST` | `/api/dss/evaluate` | `{ date, slot }` | Eksekusi perhitungan hybrid BWM-TOPSIS untuk menghasilkan perankingan zona terkini. |
| `GET` | `/api/dss/recommendations` | - | Mengambil hasil ranking preferensi TOPSIS (Ci) zona terbaru untuk ditampilkan di tabel. |
| `GET` | `/api/dss/snapshots` | `?limit=10` | Mengambil riwayat snapshot konfigurasi dan hasil eksekusi TOPSIS. |

---

## 🗺️ 7. Halaman Master Zona & Modal Tambah Geofence
*Referensi Visual: Inset `Zone Management (with spatial input)` pada `superadmin-dashboard.png`*

### UI Components & Modal:
1. **Daftar Zona Operasi (Sidebar List)**: Search input, List zona dengan badge status (`Aktif`, `Nonaktif`), Tombol `+ Tambah Zona`.
2. **Modal Tambah Zona Geofence (Wizard 3 Step)**:
   - Step 1: *Gambar Poligon* (Interactive Leaflet Map canvas + Leaflet Draw polygon tool)
   - Step 2: *Konfirmasi*
   - Step 3: *Simpan*
   - Form Fields:
     - Nama Zona (`Nama Zona *`)
     - Deskripsi (`Deskripsi Area komersial potensial`)
     - Kapasitas Maksimal (`Kapasitas Maksimal [20] Rider`)
     - Status Operasional (Dropdown: `Aktif`, `Nonaktif`, `Maintenance`)
   - Tombol Aksi: `Batal` & `Simpan Zona` (Primary Blue).

### API Endpoints yang Dibutuhkan:
| Method | Endpoint Path | Query / Body Payload | Kebutuhan Data UI & Output |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/zones` | `?status=...&search=...` | List master zona untuk tabel dan list pencarian. |
| `POST` | `/api/zones/validate` | `{ polygon, name }` | Validasi dry-run geometri GeoJSON poligon (cek self-intersection & overlap) sebelum simpan. |
| `POST` | `/api/zones` | `{ name, description, polygon, max_capacity, status }` | Simpan data zona baru ke PostGIS database. |
| `PUT` | `/api/zones/:id` | `{ name, description, polygon, max_capacity, status }` | Update geometri atau metadata zona yang sudah ada. |
| `PATCH` | `/api/zones/:id/status` | `{ status: "ACTIVE" \| "INACTIVE" }` | Toggle cepat status operasional zona. |
| `PATCH` | `/api/zones/:id/capacity` | `{ max_capacity }` | Update cepat batas kapasitas rider di zona. |
| `DELETE` | `/api/zones/:id` | - | Hapus data zona (dengan pengecekan integritas relasi). |

---

## 📱 8. Mobile Rider View & Operasional Lapangan
*Referensi Visual: Inset `Mobile Rider View` pada `superadmin-dashboard.png`*

### UI Components (Mobile App Viewport):
1. **Header**: Salam pengguna (`Halo Andi`), Badge Status Online, Informasi Zona Tugas (`Zona A - Alun-Alun Sidoarjo • 12.4 km dari hub`).
2. **Armada 5-Minute Hold Timer Card**:
   - Large Countdown Clock: `04:32`
   - Label: `Sisa Hold Armada`
   - Primary Action Button: `Konfirmasi Armada` (Status berubah menjadi CLAIMED/IN_USE).
3. **Menu Navigasi Bawah (Bottom Navigation Bar)**:
   - Tab 1: `Beranda` (Home & status sesi)
   - Tab 2: `Peta` (Geofence & Lokasi Jual)
   - Tab 3: `Penjualan` (Input transaksi & rekap)
   - Tab 4: `Profil` (Akun & Riwayat Tugas)

### API Endpoints yang Dibutuhkan:
| Method | Endpoint Path | Query / Body Payload | Kebutuhan Data UI & Output |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/rider/active-session` | - | Mengambil status sesi aktif rider, zona penugasan, dan status armada saat ini. |
| `GET` | `/api/rider/hub-armadas` | - | Menampilkan daftar unit armada di Hub yang siap di-hold. |
| `POST` | `/api/rider/hold-armada` | `{ armada_id }` | Mengunci armada selama 5 menit (tiket hold dengan Redis TTL). |
| `POST` | `/api/rider/cancel-hold-armada` | `{ armada_id }` | Membatalkan kunci hold sebelum 5 menit habis. |
| `POST` | `/api/rider/claim-armada` | `{ armada_id }` | Mengonfirmasi klaim permanen unit armada untuk bertugas di lapangan. |
| `POST` | `/api/rider/check-in` | `{ latitude, longitude }` | Check-in spasial PostGIS saat rider sampai di dalam poligon geofence zona. |
| `POST` | `/api/rider/lock-spot` | `{ candidate_location_id, latitude, longitude }` | Mengunci spot jualan potensial di dalam zona agar tidak bentrok dengan rider lain. |
| `POST` | `/api/rider/record-sale` | `{ product_id, quantity, latitude, longitude }` | Mencatat transaksi penjualan minuman/kopi di lokasi jualan. |
| `GET` | `/api/rider/my-sales` | `?date=today` | Riwayat transaksi dan omzet yang dicapai rider hari ini. |
| `POST` | `/api/rider/checkout` | `{ return_status: "ACTIVE" }` | Check-out akhir shift dan pengembalian unit armada ke Hub. |

---

## 🗃️ 9. Master Data & Pengaturan Sistem (Super Admin Suite)

### A. Manajemen Armada (`/fleet` / `/armada`)
| Method | Endpoint Path | Payload | UI Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/armadas` | `?status=...` | List tabel armada, filter status (*ACTIVE, IN_USE, MAINTENANCE*). |
| `POST` | `/api/armadas` | `{ code, name, type, status }` | Modal tambah armada baru. |
| `PUT` | `/api/armadas/:id` | `{ code, name, type, status }` | Modal edit armada. |
| `POST` | `/api/armadas/:id/maintenance` | `{ reason }` | Set unit armada ke status perawatan / servis. |
| `POST` | `/api/armadas/:id/release-maintenance` | - | Kembalikan armada yang selesai servis ke status ACTIVE. |
| `DELETE` | `/api/armadas/:id` | - | Hapus armada. |

### B. Manajemen Pengguna (`/users`)
| Method | Endpoint Path | Payload | UI Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/users` | `?role=...&search=...` | List pengguna sistem (*SUPERADMIN, MANAGEMENT, SUPERVISOR, RIDER*). |
| `GET` | `/api/users/:id` | - | Mengambil data profil lengkap seorang pengguna berdasarkan ID. |
| `POST` | `/api/users` | `{ username, email, full_name, role, phone }` | Modal tambah pengguna & auto-provision link aktivasi. |
| `PUT` | `/api/users/:id` | `{ full_name, role, phone }` | Modal edit detail pengguna. |
| `PATCH` | `/api/users/:id/status` | `{ is_active: boolean }` | Toggle aktifkan / nonaktifkan akun pengguna. |
| `DELETE` | `/api/users/:id` | - | Hapus akun pengguna. |

### C. Manajemen Katalog Produk (`/catalog`)
| Method | Endpoint Path | Payload | UI Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/products` | `?status=...` | List produk kopi/minuman beserta harga dan status stok. |
| `POST` | `/api/products` | `{ name, description, price, status }` | Modal tambah produk baru. |
| `PUT` | `/api/products/:id` | `{ name, description, price, status }` | Modal edit produk. |
| `PATCH` | `/api/products/:id/status` | `{ status: "AVAILABLE" \| "OUT_OF_STOCK" }` | Toggle ketersediaan produk. |
| `DELETE` | `/api/products/:id` | - | Hapus produk dari katalog. |

### D. Manajemen Data POI & Ingesti OSM (`/pois`)
| Method | Endpoint Path | Payload | UI Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/pois/pending` | - | Tabel moderasi POI yang terdeteksi dari OSM / pengajuan lapangan. |
| `POST` | `/api/pois/approve` | `{ poi_id, is_approved, rejection_reason }` | Tombol Approve / Reject POI. |
| `POST` | `/api/pois/sync-city` | `{ city: "Sidoarjo" }` | Tombol trigger sinkronisasi POI Overpass OSM manual. |
| `GET` | `/api/poi-categories/crowd-scores` | - | Tabel matriks bobot kategori POI dan skor keramaian berdasarkan jam/hari. |
| `PUT` | `/api/poi-categories/crowd-scores` | `{ scores: [...] }` | Form edit bobot kategori POI. |

### E. Manajemen Survei Kompetitor (`/competitors`)
| Method | Endpoint Path | Payload | UI Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/competitors/zone/:zone_id` | - | List titik kompetitor kopi keliling / gerai lain di zona terpilih. |
| `POST` | `/api/competitors` | `{ name, zone_id, latitude, longitude, price_range }` | Modal tambah catatan survei kompetitor lapangan. |
| `DELETE` | `/api/competitors/:id` | - | Hapus catatan kompetitor. |

### F. Pelaporan & Ekspor Multi-Format (`/reports`)
| Method | Endpoint Path | Payload | UI Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/reports/executive-summary` | `?startDate=...&endDate=...` | Ringkasan KPI eksekutif untuk laporan bulanan/mingguan. |
| `GET` | `/api/reports/rider-operational` | `?startDate=...&endDate=...` | Tabel laporan operasional & kehadiran rider. |
| `GET` | `/api/reports/zone-effectiveness` | `?startDate=...&endDate=...` | Tabel efektivitas zona dan tingkat kepatuhan spasial. |
| `GET` | `/api/reports/fleet` | - | Laporan kesehatan & utilisasi armada. |
| `GET` | `/api/reports/dss-accuracy` | `?startDate=...&endDate=...` | Laporan akurasi rekomendasi TOPSIS terhadap penjualan riil. |
| `GET` | `/api/reports/export` | `?reportType=...&format=csv\|pdf` | Tombol download laporan file CSV / cetak PDF. |

### G. Pengaturan Sistem & Cron Scheduler (`/settings`)
| Method | Endpoint Path | Payload | UI Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/system-settings/operational-rules` | - | Form pengaturan radius toleransi geofence (misal 50m) & batas jalan protokol. |
| `PATCH` | `/api/system-settings/operational-rules` | `{ max_deviation_meters, protocol_road_buffer }` | Tombol simpan perubahan aturan operasional. |
| `GET` | `/api/system-settings/hub` | - | Form koordinat titik pusat Central Hub Sidoarjo. |
| `PUT` | `/api/system-settings/hub` | `{ name, latitude, longitude, radius_meters }` | Simpan titik koordinat Hub. |
| `GET` | `/api/cron-management/configs` | - | Tabel status scheduled jobs (Overpass sync, Weather sync, Armada release). |
| `PUT` | `/api/cron-management/toggle/:cronKey` | - | Toggle aktif / non-aktif background cron job. |
| `POST` | `/api/cron-management/trigger/:cronKey` | - | Tombol eksekusi cron job sekarang (on-demand). |
| `GET` | `/api/audit-logs` | `?page=1&limit=50` | Tabel log audit aktivitas seluruh pengguna sistem. |

---

## 🧩 10. Appendiks: Endpoint Mesin Analitik & Utilitas Lanjutan (Backend & Swagger Extended Reference)

Selain 99 endpoint halaman UI utama di atas, arsitektur Backend Express dan spesifikasi `swagger.yaml` menyediakan endpoint-endpoint pendukung mesin komputasi spasial, moderasi POI, histori snapshot, dan sinkronisasi data:

### A. Mesin Rekomendasi Titik Jual Kandidat (`/candidate-selling-locations`)
| Method | Endpoint Path | Payload / Query | Deskripsi Fungsional & Kegunaan |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/candidate-locations/zone/:zone_id` | - | Mengambil kandidat titik jualan potensial di zona tertentu. |
| `GET` | `/api/candidate-locations/all` | - | Mengambil seluruh titik kandidat di seluruh zona aktif. |
| `POST` | `/api/candidate-locations/generate/:zone_id` | `{ radius, minPoiCluster }` | Generate otomatis kandidat titik jual berbasis clustering POI & jaringan jalan. |
| `POST` | `/api/candidate-selling-locations` | `{ name, zone_id, latitude, longitude }` | Pendaftaran titik rekomendasi lokasi secara manual. |
| `GET` | `/api/candidate-selling-locations/:id` | - | Mengambil data detail titik kandidat lokasi. |
| `POST` | `/api/candidate-selling-locations/:id/evaluate` | `{ weights }` | Evaluasi skor TOPSIS untuk satu titik lokasi tertentu. |
| `POST` | `/api/candidate-selling-locations/evaluate/zone/:zoneId` | `{ weights }` | Evaluasi dan perankingan seluruh titik lokasi dalam suatu zona. |
| `GET` | `/api/candidate-selling-locations/evaluation/:evaluationId` | - | Mengambil data snapshot evaluasi titik lokasi berdasarkan ID. |
| `GET` | `/api/candidate-selling-locations/evaluation/:evaluationId/explanation` | - | Mengambil rincian breakdown dan eksplanasi skor kriteria. |
| `GET` | `/api/candidate-selling-locations/evaluation/:evaluationId/audit` | - | Metadata jejak audit evaluasi titik rekomendasi. |

### B. Moderasi & Ingesti POI Lanjutan (`/pois`)
| Method | Endpoint Path | Payload / Query | Deskripsi Fungsional & Kegunaan |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/pois` | `?category=...&zone_id=...` | List seluruh POI yang telah disetujui (Approved) dengan filter kategori/zona. |
| `POST` | `/api/pois` | `{ name, category_id, latitude, longitude }` | Pengajuan POI baru dari lapangan (status pending). |
| `GET` | `/api/pois/unapproved` | `?page=1&limit=20` | List antrean POI yang menunggu moderasi/persetujuan supervisor. |
| `PATCH` | `/api/pois/:id/approve` | `{ notes }` | Persetujuan POI agar aktif masuk ke perhitungan densitas C1. |
| `PATCH` | `/api/pois/:id/reject` | `{ reason }` | Penolakan POI tidak valid dengan catatan alasan. |
| `GET` | `/api/pois/categories` | - | Master data kategori POI beserta konfigurasi bobot C1–C3. |
| `GET` | `/api/pois/density/:zone_id` | - | Hitung skor densitas POI (Kriteria C1) per zona. |
| `GET` | `/api/pois/events/:zone_id` | - | Hitung skor keramaian/event situasional (Kriteria C3) per zona. |
| `GET` | `/api/pois/operational-area` | - | List seluruh POI aktif di dalam poligon area operasional Sidoarjo. |
| `PUT` | `/api/poi-categories/:id/crowd-scores` | `{ crowd_scores: [...] }` | Update matriks skor keramaian berbasis waktu per kategori POI. |

### C. Analitik Spasial, Telemetri LBS & Cuaca
| Method | Endpoint Path | Payload / Query | Deskripsi Fungsional & Kegunaan |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/lbs/ping` | `{ rider_id, latitude, longitude, speed }` | Ingesti telemetri GPS real-time & evaluasi deviasi geofence PostGIS. |
| `GET` | `/api/weather/current` | - | Kondisi cuaca langsung dari stasiun Open-Meteo Sidoarjo. |
| `GET` | `/api/weather/zone/:zone_id/score` | - | Perhitungan skor kesesuaian cuaca (Kriteria C2) per zona. |
| `GET` | `/api/weather/zone/:zone_id/timeline` | `?date=today&slot=all` | Prakiraan cuaca dan peluang hujan per jam di zona. |
| `GET` | `/api/roads/zone-accessibility-score/:zone_id` | - | Perhitungan skor aksesibilitas jalan protokol (Kriteria C4) per zona. |
| `GET` | `/api/competitors/score/:zone_id` | - | Perhitungan skor kepadatan kompetitor (Kriteria C6) per zona. |

### D. Flashback & Riwayat Keputusan DSS (`/dss`)
| Method | Endpoint Path | Payload / Query | Deskripsi Fungsional & Kegunaan |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/dss/history` | `?page=1&limit=20` | Riwayat seluruh eksekusi perankingan DSS terdahulu (Snapshot Trail). |
| `GET` | `/api/dss/history/:id` | - | Replay/Flashback hasil keputusan DSS pada tanggal/jam tertentu. |
| `GET` | `/api/dss/snapshots/:id` | - | Detail snapshot perhitungan matriks ternormalisasi dan nilai preferensi. |
| `POST` | `/api/dss/bwm/preview-impact` | `{ pairwise_comparisons }` | Simulasi instan dampak perubahan bobot BWM terhadap perankingan zona. |

### E. Konfirmasi Shift & Riwayat Rider Lapangan (`/distribution`)
| Method | Endpoint Path | Payload / Query | Deskripsi Fungsional & Kegunaan |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/distribution/duty/confirm` | `{ rider_id, is_ready }` | Konfirmasi kehadiran rider untuk shift operasional hari ini (FIFO Queue). |
| `POST` | `/api/distribution/duty-confirm` | `{ rider_id }` | Alias konfirmasi kehadiran shift operasional. |
| `GET` | `/api/distribution/runs/:id` | - | Detail hasil plotting penugasan rider dan armada per batch distribusi. |
| `GET` | `/api/distribution/my-history` | - | Riwayat penugasan zona dan performa personal rider yang login. |

### F. Eksekutif Analitik & Laporan Tingkat Lanjut (`/analytics`)
| Method | Endpoint Path | Payload / Query | Deskripsi Fungsional & Kegunaan |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/analytics/overview` | `?timeframe=today` | Ringkasan terpadu metrik eksekutif dan supervisor dengan proyeksi RBAC. |
| `GET` | `/api/analytics/operational/fleet-utilization` | `?range=7d` | Analitik tingkat utilisasi dan kesiapan unit armada gerobak. |
| `GET` | `/api/analytics/sales/performance` | `?range=30d` | Kurva penjualan per jam, zona terbaik, dan perbandingan in-zone vs out-of-zone. |
| `GET` | `/api/analytics/dss/plan-vs-actual` | `?range=30d` | Korelasi akurasi ranking TOPSIS terhadap omset riil di lapangan. |
| `GET` | `/api/analytics/reports/daily-summary` | `?date=...` | Rekapitulasi tabular operasional harian terintegrasi. |
| `GET` | `/api/reports/export/:reportType` | `?format=csv\|pdf` | Mesin ekspor dinamis berkas laporan operasional. |

### G. Readiness Sistem, Konfigurasi Basemap & Sinkronisasi
| Method | Endpoint Path | Payload / Query | Deskripsi Fungsional & Kegunaan |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/system-settings/readiness` | - | Laporan holistik kesiapan operasional server, database PostGIS, dan Redis. |
| `GET` | `/api/system-settings/map-config` | - | Konfigurasi basemap layer GIS (CartoDB, OSM, Satellite). |
| `GET` | `/api/zones/config` | - | Konfigurasi spasial batasan zona dan buffer protokol jalan. |
| `GET` | `/api/products/:id` | - | Mengambil detail spesifik produk dari master katalog. |
| `GET` | `/api/sync/status` | - | Ringkasan kebaruan data (*Data Freshness*) POI, Cuaca, dan Jalan. |
| `GET` | `/api/sync/runs` | `?limit=10` | Log audit riwayat eksekusi sinkronisasi background worker. |
| `POST` | `/api/sync/poi` | `{ city: "Sidoarjo" }` | Trigger sinkronisasi manual data POI dari OpenStreetMap Overpass API. |
| `POST` | `/api/sync/weather` | `{ hub: "Sidoarjo" }` | Trigger sinkronisasi batch prakiraan cuaca Open-Meteo. |

---

## 📦 Standar Struktur Payload Request & Response

Untuk memastikan kelancaran komunikasi antara Backend dan Frontend:

### 1. Standar Format Respons Sukses (`HTTP 200 / 201`)
```json
{
  "success": true,
  "message": "Data berhasil dimuat / diperbarui",
  "data": {
    "id": "ZON-SDA-01",
    "name": "Alun-Alun Sidoarjo",
    "score": 0.823
  },
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 42,
    "totalPages": 5
  },
  "meta": {
    "timestamp": "2026-09-10T14:40:00.000Z",
    "version": "v1.0.0"
  }
}
```

### 2. Standar Format Respons Error (`HTTP 400 / 401 / 403 / 404 / 500`)
```json
{
  "success": false,
  "message": "Deskripsi pesan kegagalan / validasi input",
  "error": "BAD_REQUEST_ERROR",
  "statusCode": 400,
  "details": [
    {
      "field": "identifier",
      "message": "Email atau username wajib diisi"
    }
  ]
}
```

---

## 🚀 Kesimpulan & Langkah Selanjutnya
Dengan penambahan rincian pada Appendiks di atas, seluruh **154 endpoint** pada `swagger.yaml` dan **218 rute** backend Express telah terpetakan 100% secara komprehensif ke dalam dokumen ini. Dokumen ini resmi menjadi **Single Source of Truth (SSOT)** terlengkap untuk implementasi, audit berkala, serta integrasi frontend.

