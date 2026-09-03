# Wireframe Blueprint: Gateway, Showcase & Autentikasi (Fase 1)

Dokumen ini mendefinisikan tata letak (*layout*), hierarki visual, dan spesifikasi interaksi untuk gerbang publik, landing showcase, login dengan CAPTCHA adaptif, registrasi aktivasi token, dan wizard inisialisasi Hub Surabaya Day-0.

---

## 1. Wireframe: Showcase & Public Gateway (`/` atau `/showcase`)

```text
+---------------------------------------------------------------------------------------------------+
|  [MOVA. Logo]           [Demo Primitives] [DSS Tables] [FAQ] [Login] [Sign Up]     [Get Started ->] | (Glass Header Island)
+---------------------------------------------------------------------------------------------------+
|                                                                                                   |
|                                ( NEW: MOVA Platform v2.0 Released )                               |
|                                                                                                   |
|                                     HIGH PRECISION DECISION SYSTEM                                |
|                        Optimal Fleet Spreading via BWM-TOPSIS & PostGIS Geofence                  |
|                                                                                                   |
|             [ Masuk ke Sistem Operasional -> ]         [ Preview Dashboard & Spatial Map ]        |
|                                                                                                   |
+---------------------------------------------------------------------------------------------------+
|  BENTO GRID SHOWCASE (Boxicons & Opaline Kinetic Theme)                                           |
|  +-----------------------------------+  +-------------------------------------------------------+ |
|  | Live Telemetry Customizer         |  | Interactive Component Matrix (Buttons, Pills, Badges) | |
|  | - Status Colors (Emerald, Amber)  |  | - Variants: Primary, Subtle, Outline, Ghost           | |
|  | - Interactive Scales & Rotation   |  | - Sizes: SM (32px), MD (40px), LG (48px)              | |
|  +-----------------------------------+  +-------------------------------------------------------+ |
|  +-------------------------------------------------------+  +-----------------------------------+ |
|  | Algoritma DSS TOPSIS & Matriks Keputusan Live         |  | FAQ Accordion (ETL, BWM, RBAC)    | |
|  | - 8 Kriteria Operasional Surabaya                     |  | - Multi-role access permissions   | |
|  | - Nilai Kedekatan Relatif C_i (0.00 - 1.00)           |  | - Cache TTL & Background Workers  | |
|  +-------------------------------------------------------+  +-----------------------------------+ |
+---------------------------------------------------------------------------------------------------+
```

---

## 2. Wireframe: Halaman Login & Validasi Keamanan (`/login`)

```text
+---------------------------------------------------------------------------------------------------+
|                                 [ Ambient Dot Pattern Background ]                                |
|                                                                                                   |
|                                  +------------------------------+                                 |
|                                  |          [MOVA. LOGO]        |                                 |
|                                  |   Masuk ke Sistem Operasional|                                 |
|                                  |   Platform Decision Intel    |                                 |
|                                  |------------------------------|                                 |
|                                  | Email / NIK Petugas          |                                 |
|                                  | [ [icon] nama@perusahaan.com ]                                 |
|                                  |                              |                                 |
|                                  | Password       [Lupa Sandi?] |                                 |
|                                  | [ [icon] ••••••••      [eye] ]                                 |
|                                  |                              |                                 |
|                                  | [!] VERIFIKASI KEAMANAN      |                                 |
|                                  | (Muncul jika brute force >=3)|                                 |
|                                  | +--------------------------+ |                                 |
|                                  | |   [ SVG Captcha Box ]    | |                                 |
|                                  | +--------------------------+ |                                 |
|                                  | [ [shield] Ketik kode di... ]|                                 |
|                                  |                              |                                 |
|                                  | [X] Ingat sesi perangkat     |                                 |
|                                  |                              |                                 |
|                                  | [  Masuk ke Dashboard ->   ] |                                 |
|                                  |                              |                                 |
|                                  | ----------- ATAU ----------- |                                 |
|                                  | [⚙️ Setup Wizard Hub (Day-0)] |                                 |
|                                  |                              |                                 |
|                                  | Punya token? [Aktivasi Akun] |                                 |
|                                  +------------------------------+                                 |
+---------------------------------------------------------------------------------------------------+
```

---

## 3. Wireframe: Registrasi & Aktivasi Token Petugas (`/register`)

```text
+---------------------------------------------------------------------------------------------------+
|                                  +----------------------------------+                             |
|                                  |          [MOVA. LOGO]            |                             |
|                                  |  Registrasi Petugas Lapangan     |                             |
|                                  |  Aktivasi Akun via Kode Undangan |                             |
|                                  |----------------------------------|                             |
|                                  | Nama Lengkap                     |                             |
|                                  | [ [user] Budi Santoso          ] |                             |
|                                  |                                  |                             |
|                                  | Email              WhatsApp      |                             |
|                                  | [ budi@mova.id ]   [ 08123456..] |                             |
|                                  |                                  |                             |
|                                  | Tanggal Lahir (Usia) Hub Token   |                             |
|                                  | [ [cal] YYYY-MM-DD] [ TOKEN-XXXX]|                             |
|                                  |                                  |                             |
|                                  | Password Baru      Konfirmasi    |                             |
|                                  | [ ••••••••      ]  [ ••••••••   ]|                             |
|                                  | Kekuatan Sandi: [====---] Sedang |                             |
|                                  |                                  |                             |
|                                  | [X] Setuju SOP & Kebijakan GPS   |                             |
|                                  |                                  |                             |
|                                  | [   Daftar & Aktivasi Akun ✔️   ] |                             |
|                                  |                                  |                             |
|                                  | Sudah punya akun? [Masuk di sini]|                             |
|                                  +----------------------------------+                             |
+---------------------------------------------------------------------------------------------------+
```
