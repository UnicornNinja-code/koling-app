# Spesifikasi UI/UX: Pemulihan Kata Sandi (`/forgot-password` & `/reset-password`)

Dokumen ini merancang alur pemulihan kata sandi pengguna yang lupa kredensial login.

---

## 1. Audit Endpoint & Data Contract

| Properti | Detail |
| :--- | :--- |
| **Request Token** | `POST /api/auth/forgot-password` (Rate limited: `forgotPasswordLimiter`) |
| **Verify Token** | `GET /api/auth/verify-reset-token/:token` |
| **Submit New Password** | `POST /api/auth/reset-password` |
| **Status Audit** | ✅ Seluruh endpoint aktif di backend `authRoutes.js` |
| **Frontend Service** | `authService.forgotPassword(email)` & `authService.resetPassword(...)` |

### Request Payload (Forgot Password):
```json
{
  "email": "supervisor@cozis.id"
}
```

### Request Payload (Reset Password):
```json
{
  "token": "rst_token_8819ab...",
  "newPassword": "NewSecurePassword123!",
  "confirmPassword": "NewSecurePassword123!"
}
```

---

## 2. Wireframe Struktur Visual (ASCII Layout)

### Tahap 1: Permintaan Reset Sandi (`/forgot-password`)
```text
+-----------------------------------------------------------------------+
|  CARD CONTAINER (#FFFFFF)                                             |
|  Radius: 12px | Border: #D2D2D4 | Max-Width: 420px                   |
|                                                                       |
|  [Icon Lock-Question]                                                 |
|  Lupa Kata Sandi?                                                     |
|  Masukkan email terdaftar akun Anda. Kami akan mengirimkan tautan     |
|  pemulihan kata sandi ke kotak masuk Anda.                            |
|                                                                       |
|  Alamat Email Terdaftar                                               |
|  [ nama@cozis.id                                       ]              |
|                                                                       |
|  +-----------------------------------------------------------------+  |
|  |             [ KIRIM TAUTAN PEMULIHAN ]                          |  |
|  |       bg: #FF634A | text: #FFFFFF | r: 8px                      |  |
|  +-----------------------------------------------------------------+  |
|                                                                       |
|  < Kembali ke Halaman Masuk                                           |
+-----------------------------------------------------------------------+
```

### Tahap 2: Atur Ulang Sandi (`/reset-password?token=...`)
```text
+-----------------------------------------------------------------------+
|  CARD CONTAINER (#FFFFFF)                                             |
|                                                                       |
|  [Icon Key-Round]                                                     |
|  Atur Ulang Kata Sandi                                                |
|  Buat kata sandi baru yang kuat untuk akun Anda.                      |
|                                                                       |
|  Kata Sandi Baru                                                      |
|  [ **********                                         (eye) ]         |
|                                                                       |
|  Konfirmasi Kata Sandi Baru                                           |
|  [ **********                                         (eye) ]         |
|                                                                       |
|  +-----------------------------------------------------------------+  |
|  |                 [ SIMPAN KATA SANDI BARU ]                      |  |
|  |            bg: #FF634A | text: #FFFFFF | r: 8px                 |  |
|  +-----------------------------------------------------------------+  |
+-----------------------------------------------------------------------+
```

---

## 3. Spesifikasi Komponen & Micro-Interactions

1. **Email Input with Auto-trim**: Validasi format regex email instan sebelum tombol kirim aktif.
2. **Success Feedback State**:
   - Menampilkan icon amplop hijau `var(--color-success)` dan teks *"Email Terkirim! Periksa inbox atau spam folder Anda"*.
   - Timer 60 detik sebelum tombol *Kirim Ulang* dapat diklik kembali.
3. **Invalid Token Screen**:
   - Jika token sudah kedaluwarsa (> 1 jam) atau sudah terpakai, tampilkan icon warning amber `var(--color-warning)` dengan CTA *"Minta Tautan Baru"*.
