# 🗺️ Alur 02: Manajemen Zona Spasial & Geofence PostGIS

Dokumen ini menjelaskan alur pembuatan zona wilayah operasional gerobak, validasi spasial geografis (*geofence*) berbasis PostgreSQL PostGIS, perlindungan larangan jalan tol, serta pemantauan layer spasial pada Pusat Komando Map Ops.

---

## 👥 1. Identifikasi Aktor & Peran (*Actors*)

1. **Superadmin / Supervisor**: Menggambar dan mendigitasi poligon batas wilayah penjualan gerobak kopi keliling, menentukan kuota kapasitas gerobak, dan meninjau pelanggaran geofence.
2. **Mesin Spasial PostGIS**: Menjalankan fungsi topologi spasial (`ST_Intersects`, `ST_Contains`, `ST_Centroid`, `ST_DistanceSphere`, `ST_MakeValid`) untuk memvalidasi batas poligon.
3. **Pusat Komando Map Ops (`/map`)**: Antarmuka visual Leaflet/GIS untuk menampilkan lapisan (*layers*) poligon zona, jalan protokol, ruas jalan tol terlarang, posisi Central Hub Sidoarjo, dan lokasi GPS real-time rider.

---

## 🎯 2. Use Case 2.1: Pembuatan & Validasi Zona Wilayah Baru (`/zones`)

### A. Pre-conditions
- Pengguna login dengan peran **Superadmin** atau **Supervisor**.
- Mengakses halaman `/zones` (Manajemen Zona Wilayah).
- Dataset spasial batas jalan tol (`toll_roads` - 692 ruas) dan jalan protokol (`protocol_roads` - 885 ruas) telah termuat di database PostGIS.

### B. Post-conditions
- Poligon zona baru tersimpan di tabel `zones` dalam format geometri spasial PostGIS (`geometry(Polygon, 4326)`).
- Zona berstatus `ACTIVE` jika lolos uji spasial, atau `INVALID` jika memotong ruas jalan tol.
- Nilai kapasitas maksimal (`max_capacity`) rider per zona tersimpan.

### C. Basic Path (Alur Utama)
1. Pengguna membuka halaman Manajemen Zona `/zones` dan mengklik tombol **"Tambah Zona Baru"**.
2. Pengguna memasukkan:
   - **Nama Zona** (misal: *"Sidoarjo Alun-Alun & Poros Kota"*).
   - **Deskripsi Wilayah**.
   - **Kapasitas Maksimal Gerobak** (misal: 10 unit).
3. Pengguna menggambar koordinat batas wilayah poligon menggunakan *Map Drawing Tool* atau menempelkan GeoJSON Poligon.
4. Pengguna menekan tombol **"Simpan & Validasi Zona"**.
5. Frontend mengirimkan request `POST /api/zones` berisi data nama, kapasitas, dan GeoJSON geometri.
6. Backend memproses validasi spasial via PostGIS:
   ```sql
   -- 1. Periksa apakah poligon memotong ruas jalan tol terlarang
   SELECT t.name AS toll_name 
   FROM toll_roads t 
   WHERE ST_Intersects(t.geom, ST_SetSRID(ST_GeomFromGeoJSON($1), 4326))
   LIMIT 1;
   ```
7. Jika tidak ada perpotongan dengan jalan tol:
   - Status zona di-set menjadi `ACTIVE`.
   - Poligon disimpan dengan `ST_Multi(ST_MakeValid(ST_SetSRID(ST_GeomFromGeoJSON($1), 4326)))`.
   - Backend menghitung titik centroid dan jarak dari Central HUB Sidoarjo.
8. Backend merespons `201 Created` dengan notifikasi sukses.
9. Poligon zona baru langsung muncul di peta dan dapat dipilih untuk plotting rider.

### D. Alternative Path: Perbaikan Poligon yang Tidak Valid
1. Pengguna membuka tab *"Zona Perlu Perbaikan"* pada halaman `/zones`.
2. Pengguna mengklik tombol *"Edit Poligon"* pada zona yang berstatus `INVALID`.
3. Titik-titik simpul (*vertices*) poligon dapat digeser menjauhi batas jalan tol.
4. Pengguna menyimpan kembali poligon yang telah disesuaikan hingga status berubah menjadi `ACTIVE`.

### E. Exceptional Path (Pelanggaran Geofence Jalan Tol)
- **Poligon Memotong Jalan Tol**: Jika `ST_Intersects` mendeteksi perpotongan dengan ruas tol (misal: *Ruas Tol Surabaya - Gempol KM 28*):
  - Backend tetap menyimpan poligon tetapi menandainya dengan status `status = 'INVALID'`.
  - Kolom `invalid_reason` diisi dengan: *"Zona memotong ruas jalan tol terlarang [Tol Porong-Sidoarjo]. Gerobak dilarang melintas."*
  - Frontend menampilkan kotak peringatan merah tebal dan zona ini **tidak dapat digunakan** dalam perhitungan SPK TOPSIS maupun plotting tugas rider hingga batasnya diperbaiki.

---

## 🎯 3. Use Case 2.2: Visualisasi Pusat Komando Spasial & Central HUB (`/map`)

### A. Pre-conditions
- Pengguna login dan membuka halaman **Map Ops** (`/map`).

### B. Post-conditions
- Peta Leaflet memuat seluruh layer spasial operasional secara *real-time* tanpa lag.

### C. Basic Path (Alur Penjelajahan Peta)
1. Peta otomatis melakukan auto-fit ke wilayah koordinat Sidoarjo (`-7.4478, 112.7183`).
2. Lapisan kartografi dimuat:
   - **Central HUB Sidoarjo**: Marker oranye dengan animasi radar beacon berdenyut di koordinat `-7.397402, 112.711958`.
   - **Buffer Operasional 12 KM**: Lingkaran transparan oranye tipis (`L.circle`) yang mengindikasikan jangkauan jelajah maksimal armada dari gudang pusat.
   - **Layer Poligon Zona**: Poligon hijau transparan dengan garis batas tegas, label nama zona, dan kuota sisa gerobak.
   - **Layer Jalan Protokol (885 Ruas)**: Garis oranye putus-putus (*dashed line*) menandakan koridor jalan dengan kepadatan pembeli tinggi.
   - **Layer Jalan Tol (692 Ruas)**: Garis merah solid tebal (*danger line*) menandakan zona terlarang bagi gerobak kopi keliling.
   - **Posisi Rider Real-time**: Ikon gerobak interaktif dengan warna status (*Hijau: Aktif Berjualan, Biru: Transit, Merah: Melanggar Batas*).
3. Pengguna dapat membuka sub-panel **"Filter Lapisan Spasial"** untuk mengaktifkan / menonaktifkan layer tertentu (misal: sembunyikan jalan tol untuk memperjelas visualisasi zona).
4. Pengguna mengklik poligon zona untuk melihat *popup* parameter atmosferik cuaca lokal (C4), skor densitas POI (C1), dan jumlah kompetitor (C6).
