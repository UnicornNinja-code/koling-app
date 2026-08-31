# 🚴‍♂️ Alur 06: Siklus Operasional Harian Rider

Dokumen ini menjelaskan alur kerja operasional harian (*end-to-end operational lifecycle*) seorang Rider Kopi Keliling, mulai dari kedatangan di gudang pusat hingga pengembalian gerobak di akhir shift.

---

## 👥 1. Identifikasi Aktor & Peran (*Actors*)

1. **Rider Kopi Keliling**: Menjalankan aktivitas fisik operasional penjualan kopi di zona wilayah tugasnya.
2. **Mesin Lokasi Spasial LBS & Redis**: Menerima streaming koordinat GPS rider, memvalidasi keberadaan di dalam poligon zona, dan mendeteksi pelanggaran batas (*geofence breach*).
3. **Database Transaksi Penjualan**: Mencatat setiap *cup* kopi yang terjual secara real-time.

---

## 🔄 2. Tahapan Siklus Operasional 5-Langkah

```text
┌────────────────────────┐
│ 1. KONFIRMASI TUGAS    │ Rider check-in kehadiran di pagi hari -> Masuk antrean FIFO.
└───────────┬────────────┘
            │
            v
┌────────────────────────┐
│ 2. KLAIM ARMADA GEROBAK│ Inspeksi fisik di Central HUB Sidoarjo -> Lock 5-Mnt -> Klaim 'IN_USE'.
└───────────┬────────────┘
            │
            v
┌────────────────────────┐
│ 3. CHECK-IN SPASIAL GPS│ Tiba di lokasi zona -> Validasi PostGIS ST_Contains poligon zona.
└───────────┬────────────┘
            │
            v
┌────────────────────────┐
│ 4. PENJUALAN KOPI LIVE │ Jual produk -> Catat transaksi (Cash / QRIS) -> Update stok & omzet.
└───────────┬────────────┘
            │
            v
┌────────────────────────┐
│ 5. CHECKOUT & KEMBALIKAN│ Akhiri shift kerja -> Kembali ke Hub -> Armada kembali 'AVAILABLE'.
└────────────────────────┘
```

---

## 🎯 3. Rincian Langkah Demi Langkah

### 📍 Langkah 1: Konfirmasi Kesiapan Bertugas (*Duty Confirmation*)
- **Endpoint**: `POST /api/distribution/duty-confirm`
- **Aksi**: Rider menekan tombol kesiapan di aplikasi saat bersiap berangkat ke Central Hub Sidoarjo.
- **Hasil**: Rider memperoleh nomor antrean penugasan FIFO dan status plotting rute.

---

### 📍 Langkah 2: Inspeksi & Klaim Unit Armada Gerobak
- **Endpoint**: `POST /api/rider/hold-armada` & `POST /api/rider/claim-armada`
- **Aksi**: 
  1. Rider tiba di Central Hub Sidoarjo (`-7.397402, 112.711958`).
  2. Rider memilih unit gerobak/e-bike dan menekan **"Hold 5-Menit"** untuk melakukan pengecekan fisik (kondisi termos, cup sealer, baterai).
  3. Setelah unit dipastikan prima, rider menekan **"Konfirmasi Klaim"**.
- **Hasil**: Status armada berubah menjadi `IN_USE` dan terhubung ke penugasan rider hari itu.

---

### 📍 Langkah 3: Berangkat & Check-In Spasial di Zona Wilayah
- **Endpoint**: `POST /api/rider/check-in`
- **Payload**: `{ latitude, longitude, zone_id }`
- **Aksi**:
  1. Rider mengayuh/mengendarai armada menuju zona penugasan (misal: *Zona Alun-Alun Sidoarjo*).
  2. Begitu tiba di dalam batas wilayah, rider menekan tombol **"Check-In Lokasi Zona"**.
  3. Backend memvalidasi koordinat GPS rider menggunakan fungsi PostGIS:
     ```sql
     SELECT ST_Contains(z.polygon, ST_SetSRID(ST_Point($1, $2), 4326)) AS is_inside
     FROM zones z WHERE z.id = $3;
     ```
- **Hasil**: Jika `is_inside === true`, status penugasan di `zone_assignments` berubah dari `ASSIGNED` menjadi `CHECKED_IN`, waktu `check_in_time` tercatat, dan marker rider di Map Ops menyala hijau.

---

### 📍 Langkah 4: Pencatatan Transaksi Penjualan Kopi (*Record Sale*)
- **Endpoint**: `POST /api/sales/transaction` atau `POST /api/rider/record-sale`
- **Payload**: `{ product_id, qty, unit_price, payment_method, latitude, longitude }`
- **Aksi**:
  1. Pembeli memesan kopi (misal: 3 cup *Kopi Susu Gula Aren*).
  2. Rider memilih produk di katalog mobile dan menekan **"Simpan Transaksi"**.
  3. Backend menyimpan entri ke tabel `sales_logs` dengan koordinat lokasi transaksi, harga, dan relasi zona.
  4. Event Socket.IO memancarkan pembaruan omzet ke Dashboard Eksekutif secara instan.
- **Hasil**: Total pendapatan harian rider bertambah dan stok produk terpotong.

---

### 📍 Langkah 5: Checkout Selesai Shift & Pengembalian Armada
- **Endpoint**: `POST /api/rider/checkout`
- **Payload**: `{ notes, condition_status }`
- **Aksi**:
  1. Di sore/malam hari, rider kembali ke Central Hub Sidoarjo.
  2. Rider menyerahkan sisa stok fisik dan gerobak ke petugas gudang.
  3. Rider menekan tombol **"Akhiri Shift & Checkout"** di aplikasi.
  4. Backend mengeksekusi:
     - Mengubah status armada di tabel `armadas` dari `IN_USE` menjadi `AVAILABLE` (atau `MAINTENANCE` jika rider melaporkan kerusakan).
     - Melepaskan `current_rider_id` pada armada.
     - Mengubah status di `zone_assignments` menjadi `COMPLETED` dan mencatat `check_out_time = CURRENT_TIMESTAMP`.
- **Hasil**: Shift kerja rider selesai, ringkasan performa penjualan harian ditampilkan, dan armada siap digunakan untuk shift berikutnya.

---

## 🚨 4. Penanganan Kasus Pengecualian (*Exceptional Paths*)

1. **Check-In di Luar Batas Zona Wilayah (Geofence Rejection)**:
   - Jika rider mencoba menekan "Check-In" saat posisinya masih 2 KM di luar batas poligon zona:
   - Backend merespons `400 Bad Request` dengan pesan: *"Koordinat GPS Anda berada di luar batas Zona [Nama Zona]. Silakan menuju area zona terlebih dahulu."*
2. **Pelanggaran Batas Wilayah saat Berjualan (Geofence Breach Event)**:
   - Jika rider yang sedang aktif berjualan terdeteksi bergerak keluar dari poligon zona:
   - Layanan Redis LBS memicu event `RIDER_BREACH_GEOFENCE`.
   - Supervisor dan Superadmin menerima notifikasi peringatan di Pusat Komando Map Ops.
