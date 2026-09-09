# 🚲 Alur 04: Manajemen Master Armada & Sistem Hold 5-Menit

Dokumen ini menjelaskan alur pengelolaan unit armada gerobak kopi keliling, status pemeliharaan (*maintenance*), serta mekanisme penguncian sementara (*ticket-booking lock 5-menit*) untuk mencegah perebutan unit armada secara bersamaan antar rider di Central HUB Sidoarjo.

---

## 👥 1. Identifikasi Aktor & Peran (*Actors*)

1. **Superadmin / Supervisor**: Menambah master armada baru, memodifikasi tipe unit, dan mengubah status unit ke pemeliharaan bengkel (*MAINTENANCE*).
2. **Rider Kopi Keliling**: Memeriksa daftar armada yang tersedia di Central HUB, melakukan *hold* inspeksi fisik gerobak selama 5 menit, dan mengklaim armada secara permanen.
3. **Background Worker & Native Cron Scheduler (`Bun.cron` / `armadaHoldWorker`)**: Secara otomatis melepaskan kunci reservasi armada jika waktu 5 menit habis tanpa konfirmasi klaim dari rider.

---

## 📋 2. Matriks Status Siklus Hidup Armada

```text
┌──────────────┐     Hold 5-Mnt (Inspeksi)     ┌──────────────┐
│  AVAILABLE   │ ────────────────────────────> │   RESERVED   │
│ (Siap Pakai) │ <──────────────────────────── │ (Hold 5-Mnt) │
└──────┬───────┘    Batal / Timeout Expired    └──────┬───────┘
       │                                              │
       │                                              │ Konfirmasi Klaim
       │                                              v
       │ Masuk Bengkel                         ┌──────────────┐
       ├─────────────────────────────────────> │    IN_USE    │
       │                                       │(Sedang Tugas)│
       v                                       └──────┬───────┘
┌──────────────┐                                      │
│ MAINTENANCE  │ <────────────────────────────────────┘
│ (Perawatan)  │             Checkout / Selesai Tugas & Rusak
└──────────────┘
```

---

## 🎯 3. Use Case 4.1: Manajemen Master Armada oleh Admin (`/fleet`)

### A. Pre-conditions
- Pengguna login sebagai **Superadmin** atau **Supervisor**.
- Mengakses halaman `/fleet`.

### B. Post-conditions
- Data armada tersimpan di tabel `armadas` dengan kode unik (misal: `GBK-001`, `EBK-002`).

### C. Basic Path: Tambah / Edit Unit Armada
1. Admin menekan tombol **"Tambah Armada Baru"**.
2. Admin mengisi:
   - **Kode Armada**: Kode plat/nomor identitas gerobak (misal: `GBK-007`).
   - **Tipe Armada**: Pilihan tipe (*GEROBAK_MANUAL*, *MOTOR_LISTRIK_EBIKE*, atau *UNIT_KHUSUS*).
   - **Kondisi Fisik / Catatan**: Informasi baterai, kelengkapan cooler box, atau kompor.
3. Admin menekan **"Simpan Armada"** $\rightarrow$ API `POST /api/armadas` dieksekusi.
4. Unit langsung terdaftar dalam sistem dengan status awal `AVAILABLE`.

### D. Alternative Path: Perubahan Status ke Bengkel (Maintenance)
1. Jika unit mengalami kerusakan (misal: ban bocor atau motor listrik drop):
2. Admin menggeser saklar status atau memilih opsi *"Set Perawatan (Maintenance)"*.
3. API `PATCH /api/armadas/:id/status` mengubah status unit menjadi `MAINTENANCE`.
4. Unit dengan status `MAINTENANCE` secara otomatis **disembunyikan** dari daftar armada yang dapat diklaim oleh rider.

---

## 🎯 4. Use Case 4.2: Mekanisme Ticket-Booking Lock 5-Menit

### A. Pre-conditions
- Rider telah terdaftar dan ditugaskan ke salah satu zona wilayah.
- Rider tiba di Central Hub Sidoarjo untuk mengambil gerobak.

### B. Post-conditions
- Unit armada terkunci sementara khusus untuk rider tersebut selama 300 detik (5 menit).
- Rider lain melihat unit tersebut dalam status buram (*faded out / locked*).

### C. Basic Path (Alur Hold dan Klaim Sukses)
1. Rider membuka halaman pemilihan armada di aplikasi.
2. Rider melihat daftar armada berstatus `AVAILABLE` di Hub.
3. Rider memilih salah satu unit (misal: `EBK-002`) dan menekan tombol **"Inspeksi & Kunci Unit (Hold 5 Mnt)"**.
4. Frontend mengirim request `POST /api/rider/hold-armada` berisi `{ armada_id }`.
5. Backend melakukan penguncian atomik di database:
   ```sql
   UPDATE armadas 
   SET status = 'RESERVED',
       reserved_by_rider_id = $1,
       reserved_until = NOW() + INTERVAL '5 minutes'
   WHERE id = $2 AND (status = 'AVAILABLE' OR (status = 'RESERVED' AND reserved_until < NOW()));
   ```
6. Backend merespons sukses dengan sisa waktu reservasi (300 detik).
7. Aplikasi menampilkan hitung mundur (*countdown timer*) 5 menit: Rider melakukan pengecekan fisik unit di gudang.
8. Setelah rider yakin kondisi unit baik, rider menekan tombol **"Konfirmasi Klaim Armada"**.
9. Frontend mengirim request `POST /api/rider/claim-armada` berisi `{ armada_id }`.
10. Backend mengubah status armada menjadi `IN_USE` dan mengaitkannya ke ID rider (`current_rider_id`).
11. Unit armada resmi aktif beroperasi dan rider dapat berangkat menuju zona penjualan.

### D. Alternative Path: Pembatalan Hold Mandiri oleh Rider
1. Saat memeriksa unit dalam masa 5 menit, rider menemukan kendala fisik (misal: rem kurang pakem).
2. Rider menekan tombol **"Batal & Pilih Unit Lain"**.
3. Frontend mengirim request `POST /api/rider/cancel-hold-armada`.
4. Backend mengosongkan `reserved_by_rider_id`, menyetel `reserved_until = NULL`, dan mengembalikan status armada menjadi `AVAILABLE`.
5. Rider bebas memilih unit armada lainnya.

### E. Exceptional Path: Timeout 5-Menit Habis (Auto-Release)
- Jika rider mengunci unit tetapi tidak mengonfirmasi klaim dalam 300 detik (misal: meninggalkan aplikasi atau lupa):
  1. Cron scheduler `Bun.cron` atau background worker mengevaluasi tabel `armadas` setiap 30 detik:
     ```sql
     UPDATE armadas 
     SET status = 'AVAILABLE', reserved_by_rider_id = NULL, reserved_until = NULL
     WHERE status = 'RESERVED' AND reserved_until < NOW();
     ```
  2. Kunci unit armada secara otomatis dibatalkan dan unit kembali berstatus `AVAILABLE` sehingga rider lain dapat memilihnya.
  3. Aplikasi rider yang timeout akan menerima notifikasi: *"Masa reservasi 5 menit telah berakhir. Silakan pilih unit kembali."*
