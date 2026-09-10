# 📊 Alur 07: Laporan, Audit Log, Notifikasi & Cron Otomatis

Dokumen ini menjelaskan alur pelaporan analitik bisnis, pencatatan jejak audit sistem (*OWASP Audit Trail*), manajemen notifikasi *in-app*, serta penjadwalan tugas otomatis berbasis native **`Bun.cron`**.

---

## 👥 1. Identifikasi Aktor & Peran (*Actors*)

1. **Management & Superadmin**: Memantau tren omzet penjualan, mengekspor laporan CSV/PDF, dan mengaudit jejak aktivitas pengguna untuk kepatuhan keamanan.
2. **Semua Pengguna**: Menerima notifikasi peringatan operasional (peringatan cuaca buruk, batas geofence, jadwal perawatan armada).
3. **Native Bun Cron Scheduler (`Bun.cron`)**: Mengeksekusi tugas otomatis terjadwal di latar belakang tanpa dependensi eksternal.

---

## 📈 2. Use Case 7.1: Ekspor & Analitik Laporan Penjualan (`/reports` Tab 1)

### A. Pre-conditions
- Pengguna login sebagai **Superadmin** atau **Management**.
- Terdapat data transaksi penjualan di tabel `sales_logs`.

### B. Post-conditions
- Ringkasan KPI omzet (Total Pendapatan, Volume Cup, Rata-rata Harian, Komparasi Cash vs QRIS) ditampilkan.
- File CSV laporan terunduh ke perangkat lokal pengguna.

### C. Basic Path
1. Pengguna membuka halaman `/reports` pada Tab *"1. Laporan Penjualan"*.
2. Pengguna memilih **Rentang Tanggal** (misal: *30 Hari Terakhir* atau kustom *Start Date - End Date*).
3. Frontend memanggil `reportService.getSalesOverview({ start_date, end_date })`.
4. Backend melakukan agregasi database:
   ```sql
   SELECT 
     DATE(created_at) AS date,
     SUM(total_price) AS total_revenue,
     SUM(qty) AS total_cup_count,
     COUNT(DISTINCT rider_id) AS active_riders_count,
     SUM(CASE WHEN payment_method = 'CASH' THEN total_price ELSE 0 END) AS cash_revenue,
     SUM(CASE WHEN payment_method = 'QRIS' THEN total_price ELSE 0 END) AS qris_revenue
   FROM sales_logs
   WHERE created_at BETWEEN $1 AND $2
   GROUP BY DATE(created_at)
   ORDER BY date DESC;
   ```
5. Frontend menampilkan kartu metrik dan tabel rincian transaksi harian.
6. Pengguna mengklik tombol **"Ekspor CSV"** $\rightarrow$ File `laporan_penjualan_kopikeliling.csv` langsung ter-generate dan diunduh oleh browser.

---

## 🛡️ 3. Use Case 7.2: Penelusuran Jejak Audit Sistem (*Audit Trail Log*)

### A. Pre-conditions
- Pengguna login sebagai **Superadmin**.
- Membuka halaman `/reports` pada Tab *"5. Log Audit Sistem"*.

### B. Post-conditions
- Catatan histori aktivitas seluruh pengguna dan event sistem tersaji lengkap dan tidak dapat dimanipulasi (*immutable audit trail*).

### C. Basic Path
1. Setiap kali terjadi aksi sensitif di sistem (Login, Pembuatan User, Reset Password, Ubah Konfigurasi BWM, Plotting Rute, Perubahan Status Armada), interceptor backend secara otomatis mencatat ke tabel `audit_logs`:
   ```typescript
   await auditService.log({
     user_id: req.user.id,
     action: "BWM_CALIBRATION_ACTIVATE",
     entity_type: "DSS",
     entity_id: configId,
     details: { cr_value: 0.042, scenario: "Potensi Pasar Utama" },
     ip_address: req.ip,
     user_agent: req.headers["user-agent"],
   });
   ```
2. Superadmin dapat memfilter log berdasarkan **Aktor**, **Kategori Entitas** (*USER, DSS, ZONE, FLEET, AUTH*), atau **Kata Kunci**.
3. Superadmin mengklik baris audit log untuk melihat detail payload JSON perubahan data.

---

## 🔔 4. Use Case 7.3: Pusat Notifikasi In-App (`AppShell.svelte`)

### A. Pre-conditions
- Pengguna telah login ke aplikasi.

### B. Post-conditions
- Notifikasi terkait peran pengguna termuat di ikon lonceng header.
- Status baca notifikasi diperbarui di tabel `notifications`.

### C. Basic Path
1. Saat aplikasi dimuat, `AppShell.svelte` memanggil `GET /api/notifications`.
2. Badge angka oranye menampilkan jumlah notifikasi yang belum dibaca (`unread_count`).
3. Pengguna mengklik ikon lonceng untuk membuka drawer popover notifikasi.
4. Pengguna dapat:
   - Mengklik satu notifikasi $\rightarrow$ memanggil `PATCH /api/notifications/:id/read` untuk menandainya telah dibaca.
   - Mengklik tombol **"Tandai Dibaca"** $\rightarrow$ memanggil `PATCH /api/notifications/read-all` untuk menandai seluruh notifikasi sekaligus.
   - Mengklik **"Buka Pusat Komando Spasial"** untuk diarahkan langsung ke halaman peta jika terdapat peringatan geofence/cuaca.

---

## ⏰ 5. Use Case 7.4: Penjadwalan Otomatis Bun Native Cron Scheduler

Sistem memanfaatkan mesin **`Bun.cron`** native berkinerja tinggi untuk menjalankan 3 jadwal tugas latar belakang utama:

| Pola Jadwal (Cron Expression) | Nama Tugas Latar Belakang | Deskripsi Fungsi |
|:---|:---|:---|
| `*/30 * * * * *` (Setiap 30 Detik) | **Armada Auto-Release Watcher** | Memeriksa tabel `armadas` dan melepaskan status `RESERVED` armada yang telah melewati batas 5 menit tanpa klaim dari rider. |
| `0 */1 * * *` (Setiap 1 Jam) | **Open-Meteo Weather Syncer** | Mengunduh data satelit atmosferik terbaru untuk seluruh zona Sidoarjo dan memperbarui nilai kriteria C4. |
| `0 0 * * *` (Setiap Tengah Malam) | **Daily Session & Shift Cleaner** | Mereset antrean tugas harian, menutup sesi penugasan kemarin yang belum ditutup, dan memperbarui agregasi performa 30 hari. |
