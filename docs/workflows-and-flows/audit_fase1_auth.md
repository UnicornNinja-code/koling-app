# Audit State Fitur - Fase 1: Onboarding, Login, Register, & Lupa Password

Dokumen ini mencatat hasil audit alur backend, rancangan alur halaman frontend, manajemen state, kekurangan sistem saat ini, serta rekomendasi optimasi untuk **Fase 1**.

> **Terakhir diperbarui**: 8 Agustus 2026

---

## 1. Onboarding

### 🛠️ Alur Backend
- **Status Backend**: *Statik / Client-side pure.*
- Belum ada endpoint khusus backend untuk onboarding tour (misal penyimpanan status `has_completed_onboarding` pada tabel `users`).
- Pengguna yang baru mendaftar langsung mendapat default role `RIDER`.

### 📱 Alur Halaman Frontend (Rancangan)
1. User pertama kali membuka aplikasi ➔ Ditampilkan **Splash / Carousel Onboarding** (3-4 slide penjelas fitur MantaKopi DSS).
2. Terdapat tombol **"Lewati" (Skip)** atau **"Mulai"**.
3. Navigasi otomatis mengarah ke halaman **Login** atau **Register**.

### 📊 Penjelasan State
- `hasSeenOnboarding`: Boolean (`localStorage`) untuk menandai apakah user sudah pernah melihat onboarding.
- `activeSlideIndex`: Number (0, 1, 2) untuk mengontrol carousel slide.

### ⚠️ Kekurangan Saat Ini
- Status onboarding hanya disimpan di `localStorage` per browser, belum persisten lintas perangkat via database user.

### ⚡ Hal yang Bisa Di-optimasi
- Tambahkan kolom `is_onboarded` (boolean) pada tabel `users` di backend jika ingin onboarding tersinkronisasi antar-perangkat.

---

## 2. Login

### 🛠️ Alur Backend (`POST /api/auth/login`)
1. Menerima payload `{ identifier, password }` (`identifier` bisa berupa `email` atau `username`).
2. Dilindungi oleh `loginLimiter` (rate limiting pencegah brute-force).
3. Mengecek keberadaan user & status `is_active` (`403` jika akun dinonaktifkan).
4. Verifikasi hash password menggunakan `bcrypt.compare`.
5. Jika valid:
   - Membuat **Access Token** JWT (default expired: `1d`).
   - Membuat **Refresh Token** (crypto random 64 hex) & disimpan di tabel database `refresh_tokens` (expired `30 hari`).
6. ~~Mengembalikan payload JSON `{ msg, token, refreshToken, user }`.~~ → Refresh token sekarang dikirim via **HTTP-Only Cookie**, JSON response hanya berisi `{ msg, token, user }`.

### 📱 Alur Halaman Frontend (Rancangan)
1. User memasukkan `email/username` & `password`.
2. Opsi checkbox **"Ingat Saya"**.
3. Submit form ➔ Trigger API Login via Axios Client terpusat.
4. Jika sukses ➔ Access token disimpan di state/memory, redirect otomatis sesuai role:
   - **ADMIN** ➔ Dashboard DSS Admin
   - **RIDER** ➔ Peta Spasial Operasional
5. Tautan navigasi bawah: *"Belum punya akun? Register"* & *"Lupa Password?"*.

### 📊 Penjelasan State
- `isLoading`: State loading tombol saat request login berlangsung.
- `accessToken`: Mengandung JWT access token (disimpan di memory/state, bukan localStorage).
- `currentUser`: Menyimpan objek profil pengguna `{ id, username, email, name, role }`.
- `isAuthenticated`: Boolean pengontrol akses *Protected Routes*.

### ⚠️ Kekurangan Saat Ini
- ~~Refresh token dikembalikan dalam response body JSON standar, belum disimpan di **HTTP-Only Cookie**.~~ ✅ **TERTANGANI**

### ⚡ Hal yang Bisa Di-optimasi
- ~~Simpan Refresh Token pada **HTTP-Only Secure Cookie** dari backend.~~ ✅ **TERTANGANI**
- Manfaatkan **Centralized Axios Interceptor** di frontend untuk auto-attach `Authorization: Bearer <token>` dan auto-refresh token saat token kadaluarsa (`401`). *(Ditangani saat fase frontend)*

---

## 3. Register

### 🛠️ Alur Backend (`POST /api/auth/register`)
1. Menerima payload `{ username, name, email, password }`. *(Parameter `role` sudah dihapus dari input).*
2. Dilindungi oleh `registerLimiter`.
3. Validasi kelengkapan data input & duplikasi email/username (`400` / PostgreSQL error code `23505`).
4. Password di-hash menggunakan `bcrypt` dengan 10 salt rounds.
5. User disimpan ke tabel `users` dengan role `RIDER` (hardcoded) dan `is_active = true`.

### 📱 Alur Halaman Frontend (Rancangan)
1. Form registrasi dengan input: `Nama Lengkap`, `Username`, `Email`, `Password`, dan `Konfirmasi Password`.
2. Visual Indicator kekuatan password (*Password Strength Meter*).
3. Submit ➔ Tampilkan pesan sukses ➔ Auto-redirect ke halaman Login.

### 📊 Penjelasan State
- `isSubmitting`: Loading state saat pengiriman data form.
- `formErrors`: Penampung pesan error validasi per field (misal: "Email format tidak valid").
- `registerSuccess`: Flag notifikasi toast/alert registrasi berhasil.

### ⚠️ Kekurangan Saat Ini
- ~~**Kerentanan Keamanan (Role Injection)**: Backend menerima properti `role` dari body request tanpa filter ketat.~~ ✅ **TERTANGANI**
- **Tanpa Verifikasi Email**: Pengguna langsung aktif tanpa validasi kepemilikan email (OTP / email verification link).

### ⚡ Hal yang Bisa Di-optimasi
- ~~**Hardening Backend**: Kunci default `role` registrasi publik hanya untuk `RIDER`.~~ ✅ **TERTANGANI**
- Terapkan **React Hook Form + Zod Schema** pada frontend untuk pencegahan re-render berlebihan & validasi real-time. *(Ditangani saat fase frontend)*

---

## 4. Lupa Password & Reset Password

### 🛠️ Alur Backend

#### A. Request Reset Token (`POST /api/auth/forgot-password`)
1. Menerima payload `{ email }` (Dilindungi `forgotPasswordLimiter`).
2. Mencari user berdasarkan email.
3. Jika user ditemukan:
   - Membuat `resetToken` (crypto 32 bytes hex) yang berlaku 1 jam.
   - Disimpan di tabel `password_reset_tokens`.
   - ~~Mengisi log internal/console.~~ → Mengirim **email HTML profesional** via Nodemailer (fallback ke Ethereal di development, fallback ke console jika SMTP gagal).
4. Mengembalikan response statis demi keamanan: *"If the email is registered, a password reset link has been sent."*

#### B. Verifikasi Token (`GET /api/auth/verify-reset-token/:token`) ✨ NEW
1. Menerima `token` dari URL parameter.
2. Memeriksa keberadaan token, status `used`, dan tanggal kadaluarsa.
3. Mengembalikan `{ valid: true }` atau `{ valid: false, reason: "..." }`.

#### C. Eksekusi Reset Password (`POST /api/auth/reset-password`)
1. Menerima payload `{ token, password }`.
2. Memeriksa keberadaan token, status `used`, dan tanggal kadaluarsa (`expires_at`).
3. Hash password baru dengan `bcrypt`.
4. Mengubah password user di DB, menandai token sebagai `used`, serta **mencabut seluruh refresh token active** milik user tersebut (force re-login).

### 📱 Alur Halaman Frontend (Rancangan)
1. **Halaman Lupa Password** (`/forgot-password`):
   - Form input Email ➔ Submit ➔ Tampilkan konfirmasi pesan terkirim.
2. **Halaman Reset Password** (`/reset-password?token=XYZ`):
   - Menerima `token` dari query string URL.
   - Panggil `GET /api/auth/verify-reset-token/:token` untuk validasi awal.
   - Jika token invalid ➔ Tampilkan pesan error langsung tanpa form.
   - Jika valid ➔ Form input `Password Baru` & `Konfirmasi Password`.
   - Submit ➔ Notifikasi sukses ➔ Redirect ke Halaman Login.

### 📊 Penjelasan State
- `resetStep`: State tahapan flow (1: Input Email, 2: Sent Confirmation, 3: Set New Password).
- `tokenValidating`: State periksa keabsahan token saat halaman reset diakses.
- `isSubmitting`: Loading state eksekusi reset.

### ⚠️ Kekurangan Saat Ini
- ~~**Email Service Belum Terintegrasi**: Pengiriman link reset password hanya dicetak ke console server.~~ ✅ **TERTANGANI**
- ~~Belum ada endpoint `GET /api/auth/verify-reset-token` untuk memverifikasi token.~~ ✅ **TERTANGANI**

### ⚡ Hal yang Bisa Di-optimasi
- ~~Integrasikan **Nodemailer / SMTP Provider** untuk pengiriman email link reset password.~~ ✅ **TERTANGANI**
- ~~Tambahkan endpoint backend `GET /api/auth/verify-reset-token/:token`.~~ ✅ **TERTANGANI**

---

## ✅ Checklist Capaian Perbaikan Backend

| # | Item Perbaikan | Status | Detail Capaian |
| :--- | :--- | :---: | :--- |
| 1 | Role Injection pada Register | ✅ Selesai | Parameter `role` dihapus dari input. Registrasi publik selalu `RIDER`. Whitelist `ALLOWED_PUBLIC_ROLES` ditambahkan di service. Default di repository diubah dari `SUPERADMIN` → `RIDER`. |
| 2 | Refresh Token ke HTTP-Only Cookie | ✅ Selesai | `cookie-parser` terintegrasi. Login set cookie (`HttpOnly`, `SameSite=Strict`, `Secure` di production, path `/api/auth`). Refresh & logout baca dari cookie dengan fallback ke body (backward compatible). |
| 3 | Endpoint Verifikasi Reset Token | ✅ Selesai | Endpoint baru `GET /api/auth/verify-reset-token/:token`. Mengecek keberadaan, status `used`, dan `expires_at`. Return `{ valid, reason }`. |
| 4 | Email Service (Nodemailer) | ✅ Selesai | Modul [mailer.js](file:///f:/PROJECT-ZERO/backend/src/config/mailer.js) dibuat. Auto-fallback ke Ethereal (test SMTP) di development. Email HTML profesional dengan link reset & branding. Fallback ke console jika pengiriman gagal. |

---

## 🔔 Hal yang Harus Diperhatikan (Post-Fix Notes)

### 1. Frontend Harus Menyesuaikan Cara Baca Refresh Token
- Login response **tidak lagi mengembalikan `refreshToken` di JSON body**. Frontend harus memastikan Axios/fetch dikonfigurasi dengan `credentials: 'include'` (atau `withCredentials: true`) agar cookie otomatis dikirim pada setiap request ke `/api/auth/*`.
- Endpoint `POST /api/auth/refresh-token` dan `POST /api/auth/logout` sekarang membaca token dari cookie. Frontend tidak perlu mengirim token di body lagi.

### 2. CORS Credentials Sudah Aktif
- `credentials: true` sudah di-set pada konfigurasi CORS di [index.js](file:///f:/PROJECT-ZERO/backend/index.js). Pastikan `allowedOrigins` sesuai dengan URL frontend yang digunakan.

### 3. Akun ADMIN/SUPERVISOR Hanya Bisa Dibuat Secara Internal
- Registrasi publik sekarang terkunci ke role `RIDER`. Untuk membuat akun `SUPERVISOR`, `MANAGEMENT`, atau `SUPERADMIN`, harus melalui endpoint internal yang dilindungi middleware `authenticateToken` + `checkRole(['SUPERADMIN'])` (misal via `userRoutes`).

### 4. SMTP Masih Menggunakan Ethereal (Development)
- Saat ini variabel SMTP di `.env` masih di-comment. Nodemailer otomatis menggunakan **Ethereal** (test SMTP). Email terkirim ke inbox virtual yang bisa dilihat di `https://ethereal.email/login`.
- Untuk production: Uncomment dan isi `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM` di `.env`.

### 5. Verifikasi Email Saat Registrasi Belum Ada
- User baru langsung aktif tanpa verifikasi email (OTP atau confirmation link). Ini masih menjadi kekurangan yang bisa ditangani di iterasi berikutnya jika diperlukan.

### 6. Cookie `Secure` Flag Hanya Aktif di Production
- Flag `secure: true` pada cookie hanya aktif ketika `NODE_ENV=production`. Di development (`NODE_ENV=development`), cookie dikirim tanpa flag `secure` agar bisa diakses via `http://localhost`.

---

## 📌 Ringkasan Rencana Tindakan (Action Items)

| Fitur | Item | Status | Keterangan |
| :--- | :--- | :---: | :--- |
| **Register** | Role Injection Fix | ✅ | Hardcoded `RIDER`, parameter `role` dihapus |
| **Register** | Email Verification | ⏳ | Belum ditangani, bisa di iterasi selanjutnya |
| **Login** | Refresh Token → Cookie | ✅ | `HttpOnly`, `SameSite=Strict`, backward compatible |
| **Forgot Password** | Nodemailer Integration | ✅ | Ethereal (dev) / SMTP (prod), email HTML profesional |
| **Forgot Password** | Verify Reset Token Endpoint | ✅ | `GET /api/auth/verify-reset-token/:token` |
| **Frontend** | Axios Interceptor + RHF + Zod | ⏳ | Ditangani saat membangun frontend |
