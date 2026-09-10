# FRONTEND PART 01 — AUTHENTICATION, FIRST LOGIN, ACTIVATION & DAY-0 SETUP WIZARD

## 1. Objective
Mengimplementasikan autentikasi JWT modern, perlindungan sesi dengan auto-refresh token, pemaksaan ganti sandi saat login pertama Super Admin (`first_login: true`), aktivasi akun undangan berbasis tanggal lahir (`birth_date`), dan wizard penyiapan sistem Day-0 (Hub, Settings, Initial Config).

---

## 2. Target React Components & Pages
- `src/pages/auth/LoginPage.jsx`
- `src/pages/auth/FirstLoginPage.jsx`
- `src/pages/auth/RegisterPage.jsx` (Activation via Invitation Link)
- `src/pages/auth/ForgotPasswordPage.jsx` & `ResetPasswordPage.jsx`
- `src/components/system/SystemSetupWizard.jsx`
- `src/services/authService.js` & `src/services/setupService.js`

---

## 3. API Contract Binding
- `POST /api/auth/login` $\rightarrow$ `{ email, password }` $\rightarrow$ `{ token, refreshToken, user: { id, name, email, role, first_login } }`
- `POST /api/auth/first-login` $\rightarrow$ `{ new_password }` $\rightarrow$ `{ success: true, message: "Password updated" }`
- `GET /api/auth/verify-token` $\rightarrow$ Query `?token=...&email=...` $\rightarrow$ `{ valid: true, user: { name, email, role } }`
- `POST /api/auth/activate` $\rightarrow$ `{ token, email, password, birth_date }` $\rightarrow$ `{ success: true, user: { ... } }`
- `POST /api/auth/refresh-token` $\rightarrow$ `{ refreshToken }` $\rightarrow$ `{ token, refreshToken }`
- `GET /api/system/readiness` $\rightarrow$ `{ initialized: boolean, setup_step: number, checks: { ... } }`
- `POST /api/system/setup` $\rightarrow$ `{ hub_name, hub_latitude, hub_longitude, operational_radius_km }`

---

## 4. UI/UX Interaction & Confirmation Standards
1. **First Login Interception:**
   - Jika `user.first_login === true`, router mengunci navigasi dan langsung me-redirect ke `/first-login`.
   - UI menampilkan *Password Strength Meter* (karakter $\ge 8$, kombinasi huruf besar, kecil, angka, dan simbol).
   - Dialog konfirmasi sebelum submit kata sandi baru.
2. **Account Activation Flow:**
   - Link aktivasi memuat `token` dan `email`.
   - Form aktivasi mewajibkan input: Kata Sandi Baru, Konfirmasi Kata Sandi, dan Tanggal Lahir (`YYYY-MM-DD`).
3. **Day-0 Setup Wizard (Super Admin Only):**
   - Step 1: Titik Hub & Radius Operasional (Interaktif Map Picker).
   - Step 2: Aturan Pembatas Spasial (Larangan Jalan Protokol & Tol).
   - Step 3: Akun Management Pertama.
   - Konfirmasi dialog ringkasan parameter sebelum sistem resmi diaktifkan (*Finalize Setup*).

---

## 5. Verification Criteria
- [x] Login mengembalikan JWT dan menavigasi sesuai role.
- [x] Super Admin dengan `first_login: true` tidak dapat membuka dashboard sebelum menyelesaikan `/first-login`.
- [x] User baru dapat diaktivasi dengan token valid dan tanggal lahir.
- [x] Token kedaluwarsa otomatis diperbarui tanpa *log-out* mendadak.
