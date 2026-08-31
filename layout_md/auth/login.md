# Spesifikasi UI/UX: Login & Autentikasi (`/login`)

Dokumen ini merancang antarmuka form login untuk aplikasi internal COZIS. Halaman ini adalah gerbang tunggal seluruh pengguna (Super Admin, Management, Supervisor, dan Rider).

---

## 1. Audit Endpoint & Data Contract

| Properti | Detail |
| :--- | :--- |
| **Endpoint URL** | `POST /api/auth/login` |
| **Status Audit** | ✅ Endpoint aktif di backend (`authRoutes.js`), rate-limited dengan `loginLimiter` (maks 5 percobaan/menit) |
| **Frontend Service** | `authService.login({ usernameOrEmail, password })` di `bun_svelte/frontend/src/services/authService.ts` |
| **Role Guard** | `PublicAuthRoute` (Jika sudah login dan aktif, redirect otomatis sesuai peran) |

### Request Payload:
```json
{
  "usernameOrEmail": "superadmin@cozis.id",
  "password": "SecurePassword123!"
}
```

### Response Payload (200 OK):
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6...",
    "refreshToken": "d8a7c2...",
    "user": {
      "id": "usr_99a81",
      "username": "superadmin",
      "email": "superadmin@cozis.id",
      "role": "SUPERADMIN",
      "is_active": true,
      "first_login": false
    }
  }
}
```

### Role Redirection Logic:
- `SUPERADMIN` → `/superadmin/dashboard`
- `MANAGEMENT` → `/superadmin/dashboard` (atau `/management/dashboard`)
- `SUPERVISOR` → `/superadmin/dashboard` (atau `/distribution`)
- `RIDER` → `/rider/zone`
- `is_active === false` → `/inactive`
- `first_login === true` → `/activate` (Force password change)

---

## 2. Wireframe Struktur Visual (ASCII Layout)

```text
+-----------------------------------------------------------------------+
|  COZIS Brand Canvas Background (#F4F4F6)                             |
|                                                                       |
|                     +-------------------------------+                 |
|                     |        [ COZIS LOGO ]         |                 |
|                     |    Coffee on Wheels System    |                 |
|                     +-------------------------------+                 |
|                                                                       |
|               +-------------------------------------------+           |
|               |  CARD SURFACE CONTAINER (#FFFFFF)         |           |
|               |  Border: #D2D2D4 | Shadow: sm | r: 12px   |           |
|               |                                           |           |
|               |  Masuk ke Akun Anda                       |           |
|               |  Sistem internal operasional & armada     |           |
|               |                                           |           |
|               |  [!] Alert Banner (Jika error / rate limit)|          |
|               |                                           |           |
|               |  Email atau Username                      |           |
|               |  [ nama@cozis.id / username           ]   |           |
|               |                                           |           |
|               |  Kata Sandi                               |           |
|               |  [ **********                   (eye) ]   |           |
|               |                                           |           |
|               |  [ ] Ingat Saya          Lupa Sandi? [>]  |           |
|               |                                           |           |
|               |  +-------------------------------------+  |           |
|               |  |       [ MASUK SEKARANG ]            |  |           |
|               |  |  bg: #FF634A | text: #FFF | r: 8px  |  |           |
|               |  +-------------------------------------+  |           |
|               |                                           |           |
|               |  ───────────────────────────────────────  |           |
|               |  Belum punya akun? Hubungi Administrator  |           |
|               +-------------------------------------------+           |
|                                                                       |
|               © 2026 COZIS. Internal Corporate Platform.              |
+-----------------------------------------------------------------------+
```

---

## 3. Spesifikasi Komponen & Design Tokens

1. **Card Container**:
   - Background: `var(--color-surface)` (`#FFFFFF`), Border: `1px solid var(--color-border)` (`#D2D2D4`).
   - Width: `100%`, Max-width: `420px`. Border-radius: `var(--radius-lg)` (`12px`).
   - Padding: `2rem` (Desktop/Tablet), `1.5rem` (Mobile).
2. **Logo Header**:
   - COZIS Emblem berwarna `var(--color-primary)` (`#FF634A`).
   - Typography Heading: `Inter 700`, size `1.5rem`, color `var(--color-foreground)` (`#18181B`).
3. **Form Inputs**:
   - Border: `1px solid var(--color-border)`. Focus ring: `2px solid var(--color-primary)`.
   - Toggle password icon button (Eye / Eye-off) di sisi kanan input password.
4. **Primary CTA Button**:
   - Background: `var(--color-primary)` (`#FF634A`), Hover: `var(--color-primary-hover)` (`#E54E36`).
   - Height: `44px` (Touch target compliant).
   - Loading State: Spinner putih `animate-spin` dan teks *"Memverifikasi..."*.

---

## 4. State & Interaksi

| State | Indikator Visual & Perilaku UX |
| :--- | :--- |
| **Idle** | Form kosong / autofill, tombol submit aktif saat input terisi valid. |
| **Validation Error** | Border input berubah menjadi `var(--color-danger)` (`#EF4444`), muncul hint teks merah di bawah input. |
| **Submitting** | Tombol submit disabled, icon loading berputar, input field read-only sementara. |
| **Auth Error (401)** | Muncul toast merah atau alert box: *"Email/Username atau Kata Sandi salah"*. |
| **Rate Limited (429)** | Alert box merah: *"Terlalu banyak percobaan. Silakan tunggu 60 detik"*. |
| **Account Inactive** | Redirect ke `/inactive` dengan pesan kontak administrator. |

---

## 5. Panduan Responsivitas & PWA

- **Desktop (1280px+)**: Center card layout dengan aksen background gradient halus.
- **Tablet (768px - 1024px)**: Center card layout, padding responsif.
- **Mobile (375px - 430px)**:
  - Form memenuhi lebar layar dengan margin 16px.
  - Safe-area-inset top & bottom diterapkan.
  - Keyboard auto-scroll memastikan input tidak tertutup virtual keyboard.
