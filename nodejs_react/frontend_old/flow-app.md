# Dokumen Rancangan User Flow Aplikasi (MantaKopi DSS)

## 1. Auth (Autentikasi & Otorisasi)
- **Login**
  - Input Email & Password dengan validasi schema Zod.
  - Generasi JWT Access Token & HTTP-Only Refresh Token Cookie.
  - Redirect otomatis berbasis Role pengguna (SuperAdmin/Management/Supervisor ke Dashboard, Rider ke Operational Portal).
- **Register**
  - Pendaftaran akun baru (Dual Persona: Management & Field Rider).
- **Forgot Password**
  - Permintaan reset password via email (Integrasi SMTP Mailer).
- **Reset Password**
  - Verifikasi token reset dari link email & pembaharuan password baru.
- **Session & Auto-Refresh**
  - Auto-refresh token secara transparan via Axios Interceptor.
  - Logout & revokasi session token di Redis.

## 2. User Profile (Profil Pengguna)
- **View Profile**
  - Menampilkan informasi akun, role, email, nomor HP, dan tanggal registrasi.
- **Edit Profile**
  - Pembaruan nama lengkap, kontak/telepon, dan metadata profil.
- **Change Password**
  - Pembaruan password pribadi dengan verifikasi password lama & enkripsi bcrypt.

## 3. Kontrol Zona (Zone Management)
- **Create New Zone**
  - Menggambar poligon zona baru pada kanvas peta interaktif Leaflet.
  - Validasi batas wilayah & deteksi konflik overlap spasial via PostGIS (`ST_Intersects` -> HTTP 409 Conflict).
  - Validasi area terlarang spasial (Restriksi Jalan Protokol & Jalan Tol).
  - Pengaturan nama zona, deskripsi, dan batas kapasitas maksimal Rider.
- **Edit Current Zone**
  - Pengubahan bentuk poligon geometri zona, batas kapasitas, atau nama zona.
  - Validasi ulang PostGIS terhadap zona sekitar pasca pembaruan geometri.
- **Delete Zone**
  - Penghapusan/deaktivasi zona (Soft-delete & mitigasi jika zona sedang ditempati Rider).
- **Zone Status Toggle**
  - Mengubah status operasional zona (`ACTIVE`, `INACTIVE`, `MAINTENANCE`).
- **POI Verification & Ingestion Queue**
  - Sinkronisasi otomatis POI sekitar zona via Overpass API (Overpass Worker BullMQ).
  - Verifikasi & Approval POI yang ditambahkan manual oleh Rider atau hasil auto-sync.
  - Kategorisasi POI untuk perhitungan skor kepadatan kriteria $C_1$ (Aktivitas Utama) dan $C_2$ (Kompetitor).
- **Candidate Selling Locations Spatial Grid**
  - Generasi titik kisi spasial calon lokasi berjualan di dalam poligon zona.
  - Scoring & pemeringkatan kandidat lokasi jualan spesifik per zona.

## 4. DSS (Decision Support System Engine)
- **Seleksi Horizon / Time Slot**
  - Pemilihan slot waktu evaluasi operasional (Pagi, Siang, Sore, Malam).
- **Best-Worst Method (BWM) - Weight Calculation**
  - Pemilihan kriteria Terbaik ($C_B$) dan Terburuk ($C_W$) dari 6 kriteria ($C_1 - C_6$).
  - Input Vektor Perbandingan *Best-to-Others* ($A_B$) dan *Others-to-Worst* ($A_W$).
  - Perhitungan bobot optimal kriteria ($w_j$) & rasio konsistensi BWM ($CR \le 0.1$).
- **Matriks Evaluasi TOPSIS Multi-Zona**
  - Penarikan metrik raw real-time ($X$) per zona: Kepadatan POI ($C_1$), Proksimitas Kompetitor ($C_2$), Cuaca/Peluang Hujan Open-Meteo ($C_3$), Aksesibilitas Spasial ($C_4$), Arus Lalu Lintas ($C_5$), dll.
  - Pembentukan Matriks Ter-normalisasi ($R$) dan Matriks Ter-normalisasi Terbobot ($V$).
  - Perhitungan Solusi Ideal Positif ($A^+$) dan Solusi Ideal Negatif ($A^-$).
  - Perhitungan skor preferensi kedekatan relatif ($C_i$).
- **View Result of DSS & Recommendation**
  - **Rank #1 Highlight Card**: Kartu rekomendasi zona prioritas utama untuk aksi alokasi cepat.
  - **Leaderboard**: Peringkat seluruh zona berdasarkan skor TOPSIS $C_i$.
  - **Raw Metrics Panel**: Tampilan data aktual $C_1 - C_6$ per zona.
  - **BWM Criteria Profile**: Profil persentase bobot kriteria terpasang.
  - **Evidence Audit Traceability Drawer**: Penelusuran bukti akademis matematis lengkap ($X \rightarrow R \rightarrow V \rightarrow A^+/A^- \rightarrow C_i$).
- **Generate & Export DSS Report**
  - Eksport laporan PDF hasil rekomendasi DSS dan penyesuaian snapshot audit log histori.
- **Direct Plot Trigger**
  - Aksi cepat "Plot / Gunakan Zona Ini" langsung memicu alokasi Rider dari halaman DSS ke alokasi distribusi.

## 5. Plotting & Distribution Management
- **View Rider Readiness for Duty**
  - Daftar antrean Rider siap tugas yang diurutkan berdasarkan kesiapan/shift.
- **Auto Plotting (Otomatis)**
  - Alokasi otomatis Rider ke zona terbaik menggunakan algoritma kombinasi FIFO + Skor TOPSIS DSS (`POST /api/distribution/auto`).
- **Manual Plotting (Manual)**
  - Pengalokasian Rider secara manual oleh Supervisor/Management ke zona spesifik (`POST /api/distribution/manual`).
- **Hold Queue & Temporary Lock**
  - Penguncian temporer slot armada selama 5 menit via BullMQ saat proses alokasi berlangsung.
- **Re-Allocation & Override**
  - Pembatalan atau pengalihan alokasi zona Rider aktif jika terjadi perubahan kondisi lapangan.

## 6. Rider Operational Workflow (Field Rider Mobile App)
- **Operational Progress Stepper (State Machine)**
  - **State 1 (Duty Confirm)**: Konfirmasi status kehadiran & tugas harian dari Supervisor.
  - **State 2 (Hold Fleet)**: Memilih & mengunci armada di Hub selama 5 menit (`POST /hold-armada`).
  - **State 3 (Claim Fleet)**: Konfirmasi pemakaian armada secara permanen / status armada `IN_USE` (`POST /claim-armada`).
  - **State 4 (Check-in Spasial)**: Verifikasi GPS di lokasi jualan dengan PostGIS `ST_Contains` poligon zona (`POST /check-in`).
  - **State 5 (Active Shift & LBS Telemetry)**: Periode jualan aktif dengan pengiriman koordinat pings LBS real-time via Socket.IO.
  - **State 6 (Sales Record Logger)**: Pencatatan omzet transaksi penjualan item/produk harian (`POST /record-sale`).
  - **State 7 (Checkout & Return Fleet)**: Penutupan sesi operasional, penyerahan rekap omzet, dan pengembalian status armada ke `ACTIVE` (`POST /checkout`).
- **Geofence Map & Road Compliance**
  - Visualisasi peta spasial lokasi Rider terhadap poligon zona target.
  - Indikator status patuh (*Compliant* / Hijau) vs menyimpang (*Deviated* / Oranye) vs jalan terlarang (Merah).

## 7. Fleet Management (Manajemen Armada)
- **Create New Fleet**
  - Penambahan armada gerobak kopi / motor listrik (Kode Armada, Plat Nomor, Kondisi Baterai/Kualifikasi) oleh SuperAdmin/Management.
- **Edit Fleet**
  - Pembaruan spesifikasi unit armada dan status operasional (`ACTIVE`, `HELD`, `IN_USE`, `MAINTENANCE`).
- **Real-Time Hold Expiry Monitor**
  - Pemantauan timer hold 5 menit pada armada dan rilis otomatis jika kedaluwarsa.
- **Delete Fleet**
  - Penghapusan atau deaktivasi unit armada dari sistem Hub.

## 8. Configuration & Operational Rules (Settings)
- **POI Sync Configuration**
  - Pengaturan sinkronisasi Overpass API (Sync jalan protokol, jalan tol, dan POI komersial/publik).
- **Weather Sync Configuration**
  - Pengaturan sinkronisasi cuaca Open-Meteo per hub/kota (Peluang presipitasi C3/C4).
- **Operational Rule Configuration (Spasial)**
  - Pengaturan mode penegakan aturan batas jalan terlarang (Jalan Protokol & Jalan Tol): Mode **BLOCKING** (Blokir pembuat poligon) vs **ADVISORY** (Peringatan saja).
  - Pemicuan re-evaluasi spasial poligon zona otomatis pasca perubahan aturan kebijakan.
- **Cron Management & System Maintenance**
  - Toggle & peluncuran manual pekerjaan cron terdistribusi (Weather sync, POI refresh, Audit cleanup).
  - Inspeksi distributed lock Redis Redlock dan status kesehatan worker BullMQ.

## 9. User Management
- **Create New User**
  - Penambahan akun pengguna baru (Khusus SuperAdmin).
- **Assign Role & Permissions**
  - Pembagian role pengguna (`SUPERADMIN`, `MANAGEMENT`, `SUPERVISOR`, `RIDER`).
- **Edit User Status & Details**
  - Pengubahan informasi dasar pengguna serta status akun (`ACTIVE`, `INACTIVE`, `SUSPENDED`).
- **Admin Password Reset**
  - Override reset password akun pengguna oleh SuperAdmin.
- **Delete User**
  - Soft-delete atau deaktivasi akun pengguna dari sistem.

## 10. Dashboard & Live Monitoring
- **Monitoring Live Rider (Spatial Telemetry)**
  - Tracking posisi spasial Rider secara real-time di peta interaktif menggunakan Socket.IO WebSocket.
  - Penanda visual status kepatuhan lokasi Rider terhadap poligon zona yang dialokasikan.
- **Executive Operational KPIs**
  - Ringkasan KPI: Total Rider Aktif, Tingkat Okupansi Zona, Total Penjualan/Omzet Hari Ini, & Health System.
- **Zone Performance & Occupancy Board**
  - Pemantauan alokasi zona (Rider terisi vs kapasitas maksimal zona).
- **Telemetry Alert System**
  - Alert otomatis jika ada Rider yang melintasi area terlarang atau keluar geofence poligon.

## 11. Audit Logs & System Traceability
- **System Activity Audit Trail**
  - Log audit terpusat untuk seluruh aktivitas sistem (Login, Perubahan Zona, Perubahan Rule Spasial, DSS Calculation, Claim Armada, Check-in, & Pencatatan Transaksi).
- **Filter & Search Audit Logs**
  - Pencarian log berdasarkan modul, pengguna, rentang waktu, dan tipe aksi.
- **JSON Trace Drawer**
  - Drawer penelusuran teknis untuk melihat payload JSON mentah, kalkulasi spasial PostGIS, dan trace audit akademis.
