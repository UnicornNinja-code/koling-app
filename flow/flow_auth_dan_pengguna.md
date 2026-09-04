# 🔐 Alur 01: Autentikasi & Manajemen Pengguna (RBAC)

Dokumen ini menjelaskan alur autentikasi pengguna, aktivasi akun baru, pemulihan kata sandi, serta administrasi hierarki akun berbasis peran (*Role-Based Access Control*).

---

## 👥 1. Identifikasi Aktor & Peran (*Actors*)

1. **Superadmin**: Memiliki hak akses penuh (*root administrator*) untuk mengelola seluruh akun sistem, mereset password pengguna lain, dan mengonfigurasi sistem.
2. **Management**: Mengelola akun Supervisor dan Rider, melihat laporan analitik omzet, dan memonitor kinerja operasional (tidak dapat membuat atau mengedit akun Superadmin).
3. **Supervisor**: Memonitor pergerakan rider di lapangan, melakukan plotting rute harian, dan mengawasi stok katalog produk.
4. **Rider**: Mengonfirmasi kesediaan tugas, mengklaim armada gerobak, melakukan check-in GPS spasial, dan mencatat transaksi penjualan kopi keliling.
5. **Sistem Backend (Auth Service)**: Memverifikasi kredensial pengguna, menghasilkan JWT token (`accessToken` & `refreshToken`), dan melakukan enkripsi hashing native `Bun.password`.

---

## 🎯 2. Use Case 1.1: Masuk ke Sistem (*User Login*)

### A. Pre-conditions
- Pengguna memiliki akun terdaftar yang berstatus aktif (`is_active = true`).
- Pengguna berada di halaman login `/login`.

### B. Post-conditions
- Pengguna menerima JWT Access Token dan diarahkan ke rute pendaratan sesuai perannya (`/dashboard` untuk Superadmin/Management/Supervisor, atau `/rider/duty` untuk Rider).
- Data sesi pengguna tersimpan di memory store Svelte (`authStore`).
- Event login berhasil dicatat ke dalam tabel `audit_logs`.

### C. Basic Path (Alur Utama dengan Verifikasi CAPTCHA)
1. Frontend memuat tantangan CAPTCHA visual terdistorsi via `GET /api/auth/captcha`.
2. Pengguna memasukkan **Username atau Email**, **Kata Sandi**, dan **5 Karakter Kode CAPTCHA**.
3. Pengguna menekan tombol **"Masuk ke Sistem"**.
4. Frontend mengirimkan request `POST /api/auth/login` berisi `{ identifier, password, captcha_id, captcha_answer }`.
5. Backend memverifikasi tanda tangan HMAC dan masa berlaku CAPTCHA (5 menit).
6. Backend mencari akun pengguna berdasarkan email atau username di tabel `users`.
7. Backend memverifikasi hash kata sandi menggunakan `Bun.password.verify()`.
8. Backend memastikan status `is_active` bernilai `true`.
9. Backend menghasilkan Access Token JWT (masa berlaku 1 hari) dan Refresh Token JWT.
10. Backend memperbarui kolom `last_login` pengguna dan menyimpan log login di `audit_logs`.
11. Frontend menerima response sukses `200 OK`, menyimpan token ke `localStorage`, dan mengarahkan pengguna ke halaman dashboard utama.

### D. Alternative Path 1: Masuk Menggunakan Google OAuth 2.0 (SSO) <- masih dinonaktifkan
1. Pengguna mengklik tombol **"Masuk dengan Akun Google"** pada form login.
2. Google Identity Services memverifikasi akun pengguna dan mengirimkan ID Token ke frontend.
3. Frontend mengirim request `POST /api/auth/google` berisi `{ email, name, google_id }`.
4. Backend mencocokkan email Google dengan whitelist akun terdaftar di tabel `users`.
5. Jika email cocok dan berstatus aktif, backend mengaitkan `google_id`, menerbitkan JWT sesi login COZIS, dan mengarahkan pengguna ke Dashboard.

### D2. Alternative Path 2: Pilihan Kredensial Cepat Demo <- dinonaktifkan
1. Pada halaman login, pengguna mengklik salah satu kartu *Quick Demo Account* (**Super Admin**, **Supervisor**, atau **Rider**).
2. Form secara otomatis terisi dengan kredensial preset, pengguna mengisi CAPTCHA, dan menekan tombol login.

### E. Exceptional Path (Penanganan Kesalahan)
- **Kode CAPTCHA Salah / Kadaluarsa**: Backend merespons `400 Bad Request` dengan pesan *"Kode CAPTCHA salah atau telah kadaluarsa. Silakan refresh CAPTCHA."* Gambar CAPTCHA otomatis diperbarui.
- **Akun Tidak Ditemukan / Password Salah**: Backend merespons `401 Unauthorized` dengan pesan *"Username/email atau kata sandi tidak valid."*
- **Email Google Belum Terdaftar**: Jika login via Google dengan email di luar database perusahaan, backend merespons `403 Forbidden` dengan pesan *"Email Google belum terdaftar dalam sistem COZIS. Silakan hubungi Management."*
- **Akun Dinonaktifkan**: Jika `is_active === false`, backend merespons `403 Forbidden` dengan pesan *"Akun Anda sedang dinonaktifkan oleh Administrator."* Pengguna tidak dapat masuk.

---

## 🎯 3. Use Case 1.2: Aktivasi Akun / Registrasi Mandiri

### A. Pre-conditions
- Pengguna baru memiliki link/token undangan aktivasi atau mendaftar mandiri melalui halaman `/register`.

### B. Post-conditions
- Akun pengguna baru tersimpan di tabel `users` dengan password yang ter-hash.
- Pengguna dapat langsung melakukan login.

### C. Basic Path
1. Pengguna membuka halaman `/register`.
2. Pengguna mengisi **Nama Lengkap**, **Username**, **Email**, dan **Kata Sandi**.
3. Pengguna mengonfirmasi kata sandi (indikator keamanan memeriksa panjang min 8 karakter, huruf besar, dan angka).
4. Pengguna menekan tombol **"Aktivasi Akun"**.
5. Frontend memvalidasi form dan mengirim `POST /api/auth/register`.
6. Backend memvalidasi ketiadaan duplikasi email/username.
7. Backend mengenkripsi password dengan `Bun.password.hash(password, { algorithm: "bcrypt", cost: 10 })`.
8. Backend menyimpan data user baru dengan peran default `RIDER` dan status `is_active = true`.
9. Pengguna diarahkan ke halaman login dengan notifikasi sukses.

### D. Exceptional Path
- **Email/Username Sudah Digunakan**: Backend merespons `409 Conflict` dengan pesan *"Email atau username sudah terdaftar dalam sistem."*

---

## 🎯 4. Use Case 1.3: Lupa & Reset Kata Sandi

### A. Pre-conditions
- Pengguna melupakan password akunnya dan mengakses halaman `/forgot-password`.

### B. Post-conditions
- Pengguna menerima instruksi pemulihan atau token reset via email.
- Password diperbarui menjadi kata sandi baru yang aman.

### C. Basic Path
1. Pengguna memasukkan alamat email terdaftar pada form `/forgot-password`.
2. Backend memverifikasi keberadaan email dan membuat reset token sementara (berlaku 1 jam).
3. Pengguna mengakses tautan pemulihan `/reset-password?token=...`.
4. Pengguna memasukkan kata sandi baru dan mengulanginya pada form konfirmasi.
5. Backend memperbarui password pengguna di tabel `users` dan mencabut seluruh token sesi aktif sebelumnya (*revoked* di tabel `refresh_tokens`).
6. Pengguna berhasil login menggunakan password baru.

---

## 🎯 5. Use Case 1.4: Manajemen Akun Pengguna oleh Administrator (`/users`)

### A. Pre-conditions
- Pengguna login sebagai **Superadmin** atau **Management**.
- Mengakses halaman `/users`.

### B. Post-conditions
- Perubahan status akun, penambahan akun baru, atau penggantian password pengguna tersimpan di database dan tercatat di `audit_logs`.

### C. Basic Path: Tambah / Edit Pengguna
1. Admin menekan tombol **"Tambah Pengguna Baru"** pada halaman `/users`.
2. Form modal terbuka: Admin memasukkan Nama, Username, Email, Kata Sandi Awal, dan memilih Peran (*Superadmin / Management / Supervisor / Rider*).
3. *Aturan Validasi RBAC*: Jika pengguna login adalah role `MANAGEMENT`, opsi peran `SUPERADMIN` dinonaktifkan secara otomatis.
4. Admin menekan **"Simpan Pengguna"** $\rightarrow$ API `POST /api/users` dieksekusi.
5. Tabel pengguna melakukan refresh otomatis dan menampilkan data terbaru.

### D. Alternative Path: Reset Password Administratif
1. Admin mengklik tombol kunci pada baris pengguna tertentu.
2. Modal reset password administratif terbuka.
3. Admin dapat mengetikkan kata sandi baru secara manual atau mengklik tombol **"Generate Acak"** untuk membuat sandi kuat 10 karakter.
4. Admin mengklik **"Salin & Simpan Sandi"** $\rightarrow$ API `POST /api/users/:id/reset-password` dieksekusi.
5. Seluruh sesi login pengguna target di perangkat lain langsung diputus (*force logout*).

### E. Alternative Path: Nonaktifkan / Aktifkan Akun (Toggle Status)
1. Admin menggeser saklar *Active Switch* pada baris akun pengguna.
2. Frontend mengirimkan request `PATCH /api/users/:id/status` dengan payload `{ is_active: boolean }`.
3. Akun yang dinonaktifkan tidak akan dapat login kembali hingga diaktifkan ulang.
