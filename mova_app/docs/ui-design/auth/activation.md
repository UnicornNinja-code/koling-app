# Spesifikasi UI/UX: Aktivasi Akun & Password Pertama Kali (`/activate`)

Dokumen ini merancang antarmuka aktivasi akun pengguna baru. Sesuai arsitektur onboarding COZIS di [ONBOARDING.md](file:///f:/project_zero/md/ONBOARDING.md), aplikasi internal COZIS **tidak menggunakan registrasi publik terbuka**. Akun dibuat oleh Super Admin / Management dan pengguna mengaktifkan akun melalui tautan undangan / pengaturan kata sandi pertama kali.

---

## 1. Audit Endpoint & Data Contract

| Properti | Detail |
| :--- | :--- |
| **Endpoint URL (Token Verify)** | `GET /api/auth/verify-reset-token/:token` |
| **Endpoint URL (Set Password)** | `POST /api/auth/reset-password` atau `POST /api/auth/register` (Account Activation flow) |
| **Status Audit** | ✅ Endpoint aktif di backend (`authRoutes.js`), rate-limited dengan `registerLimiter` |
| **Frontend Service** | `authService.activateAccount(...)` / `authService.resetPassword(...)` |
| **Konteks RBAC** | User baru dari role `MANAGEMENT`, `SUPERVISOR`, atau `RIDER` yang dibuat oleh admin |

### Request Payload (Aktivasi Akun / Set Password Pertama Kali):
```json
{
  "token": "inv_token_98af72bc...",
  "newPassword": "SecurePass2026!@",
  "confirmPassword": "SecurePass2026!@"
}
```

### Response Payload (200 OK):
```json
{
  "success": true,
  "message": "Akun berhasil diaktifkan. Silakan masuk.",
  "data": {
    "userId": "usr_7812bc",
    "email": "rider.budi@cozis.id",
    "role": "RIDER",
    "is_active": true,
    "first_login": false
  }
}
```

---

## 2. Wireframe Struktur Visual (ASCII Layout)

```text
+-----------------------------------------------------------------------+
|  COZIS Brand Canvas Background (#F4F4F6)                             |
|                                                                       |
|                     +-------------------------------+                 |
|                     |        [ COZIS LOGO ]         |                 |
|                     |     Aktivasi Akun Karyawan    |                 |
|                     +-------------------------------+                 |
|                                                                       |
|               +-------------------------------------------+           |
|               |  CARD CONTAINER (#FFFFFF)                 |           |
|               |  Border: #D2D2D4 | Radius: 12px           |           |
|               |                                           |           |
|               |  Selamat Datang di Tim COZIS!             |           |
|               |  Atur kata sandi untuk akun Anda:         |           |
|               |  Email: rider.budi@cozis.id               |           |
|               |  Role : [ BADGE: RIDER ]                  |           |
|               |                                           |           |
|               |  Kata Sandi Baru                          |           |
|               |  [ **********                   (eye) ]   |           |
|               |                                           |           |
|               |  Konfirmasi Kata Sandi                    |           |
|               |  [ **********                   (eye) ]   |           |
|               |                                           |           |
|               |  Indikator Kekuatan Sandi:                |           |
|               |  [=====       ] Sedang (Min. 8 Karakter)  |           |
|               |  ✓ Huruf besar & kecil                    |           |
|               |  ✓ Mengandung angka & simbol              |           |
|               |                                           |           |
|               |  +-------------------------------------+  |           |
|               |  |     [ AKTIFKAN AKUN & MASUK ]       |  |           |
|               |  |  bg: #FF634A | text: #FFF | r: 8px  |  |           |
|               |  +-------------------------------------+  |           |
|               |                                           |           |
|               |  ───────────────────────────────────────  |           |
|               |  Sudah memiliki sandi aktif? Masuk di sini|           |
|               +-------------------------------------------+           |
+-----------------------------------------------------------------------+
```

---

## 3. Spesifikasi Komponen & Design Tokens

1. **User Identity Preview**:
   - Menampilkan email terdaftar dan badge peran (`SUPERVISOR` / `MANAGEMENT` / `RIDER`) menggunakan pill berlatar `var(--color-primary-soft)` (`#FFF2EF`) dan teks `var(--color-primary)` (`#FF634A`).
2. **Password Strength Meter**:
   - Bar meter 4-tahap (Weak, Fair, Good, Strong) dengan warna:
     - Weak: `var(--color-danger)` (`#EF4444`)
     - Fair: `var(--color-warning)` (`#F59E0B`)
     - Strong: `var(--color-success)` (`#10B981`)
3. **Primary Action**:
   - Button "Aktifkan Akun & Masuk" dengan tinggi `44px`, radius `8px`, warna latar `#FF634A`.

---

## 4. State & Interaksi

- **Token Invalid / Expired**: Tampilkan state error dengan tombol kontak admin untuk meminta pengiriman ulang tautan aktivasi.
- **Mismatch Password**: Peringatan instan merah saat konfirmasi sandi tidak sesuai.
- **Success State**: Animasi checkmark hijau, modal sukses otomatis redirect ke `/login` atau langsung sign-in ke dashboard sesuai role.
