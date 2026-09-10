Kalau mengikuti pembagian role yang sudah kamu tetapkan, alur **onboarding COZIS setelah aplikasi di-deploy** sebaiknya dibuat seperti ini:

```text
                    ┌─────────────────────┐
                    │   Aplikasi COZIS     │
                    │   Production URL     │
                    └──────────┬──────────┘
                               │
                               ▼
                    ┌─────────────────────┐
                    │   Login / Sign In    │
                    └──────────┬──────────┘
                               │
                     ┌─────────┴─────────┐
                     │                   │
                     ▼                   ▼
              Belum punya akun?    Sudah punya akun
                     │                   │
                     ▼                   ▼
              Tidak bisa register      Login
              secara bebas                │
                     │                    ▼
                     │             Role Identification
                     │                    │
                     │        ┌───────────┼───────────┐
                     │        ▼           ▼           ▼
                     │    Management  Supervisor    Rider
                     │        │           │           │
                     │        ▼           ▼           ▼
                     │    Dashboard   Dashboard    Dashboard
                     │
                     ▼
              Hubungi Management
              / Super Admin
```

### 1. Initial deployment

Pada saat pertama kali sistem di-deploy, **jangan menyediakan public registration** seperti:

> "Create Account"

karena ini adalah **sistem internal perusahaan**, bukan aplikasi publik.

Akun awal dibuat oleh **Super Admin** melalui proses bootstrap/seed.

Contohnya:

```text
Production Deployment
        ↓
Database Migration
        ↓
System Configuration
        ↓
Create Initial Super Admin
        ↓
Super Admin Login
        ↓
Super Admin melakukan konfigurasi awal
```

Super Admin kemudian dapat membuat akun **Management**.

---

## 2. Onboarding Super Admin

Super Admin adalah titik awal organisasi.

```text
Super Admin
     │
     ├── Configure System
     ├── Configure User
     ├── Configure Fleet
     ├── Configure Catalog
     ├── Configure Zone
     └── Create Management Account
```

Tetapi dalam implementasi production, password Super Admin **jangan ditanam hardcode di source code**.

Idealnya:

```text
Deployment
    ↓
Initial Admin Credential / Invite
    ↓
Set Password
    ↓
Login
    ↓
Force Password Change
    ↓
Super Admin Dashboard
```

---

# 3. Onboarding Management

Setelah Super Admin aktif, **Management menjadi pihak yang mengelola akun operasional sehari-hari**.

Contoh:

```text
Super Admin
     │
     ▼
Create Management Account
     │
     ▼
Management Login
     │
     ▼
Management Dashboard
     │
     ├── User Management
     │      ├── Create Supervisor
     │      └── Create Rider
     │
     ├── Fleet Management
     │
     └── Catalog Management
```

Jadi Management menjadi **account provisioning layer** untuk pengguna operasional.

---

# 4. Onboarding Supervisor

Supervisor **tidak melakukan registrasi sendiri**.

Akun dibuat oleh Management:

```text
Management
     │
     ▼
Create Supervisor Account
     │
     ▼
Supervisor receives invitation
     │
     ▼
Set Password
     │
     ▼
Login
     │
     ▼
Supervisor Dashboard
```

Setelah login, Supervisor dapat menjalankan fungsi operasional:

```text
Supervisor
    │
    ├── Operational Dashboard
    │
    ├── DSS
    │    ├── BWM
    │    ├── TOPSIS
    │    └── Zone Recommendation
    │
    ├── Zone Management
    │
    └── Rider Plotting
         └── Rider → Operational Zone
```

---

# 5. Onboarding Rider

Rider juga tidak melakukan public registration.

Management membuat akun:

```text
Management
     │
     ▼
Create Rider Account
     │
     ▼
Rider receives invitation
     │
     ▼
Set Password
     │
     ▼
Login
     │
     ▼
Rider Dashboard
```

Kemudian Supervisor melakukan assignment:

```text
Rider
  │
  ▼
Supervisor
  │
  ▼
Plot / Assign Rider
  │
  ▼
Operational Zone
  │
  ▼
Rider starts selling
```

Ini menurut saya **lebih tepat** daripada membiarkan Rider memilih atau membuat akun sendiri.

---

# 6. Alur lengkap organisasi

Kalau digabung, lifecycle-nya menjadi:

```text
                         SUPER ADMIN
                              │
                              │ Create
                              ▼
                         MANAGEMENT
                              │
                    ┌─────────┴─────────┐
                    │                   │
                 Create              Manage
                    │                   │
          ┌─────────┴─────────┐     Fleet
          ▼                   ▼     Catalog
     SUPERVISOR             RIDER
          │                   │
          │                   │
          └─────────┐   ┌─────┘
                    │   │
                    ▼   ▼
                OPERATIONAL
                   DSS
                    │
                    ▼
             Zone Recommendation
                    │
                    ▼
              Rider Plotting
                    │
                    ▼
             Sales Operation
```

---

# 7. Yang penting: bedakan "Account" dan "Assignment"

Ini menurut saya bagian yang **sangat penting untuk desain sistemmu**.

Jangan membuat Supervisor memiliki CRUD User hanya karena Supervisor perlu melakukan plotting.

Pisahkan:

### Account Management

```text
User
├── Identity
├── Email
├── Password
├── Role
├── Status
└── Account lifecycle
```

Dimiliki:

**Super Admin + Management**

### Operational Assignment

```text
Rider Assignment
├── Rider
├── Zone
├── Date
├── Session
├── Assignment Status
└── Operational Status
```

Dimiliki:

**Supervisor**

Sehingga:

> **Management menentukan "siapa yang memiliki akun".**

Sedangkan:

> **Supervisor menentukan "rider tersebut beroperasi di mana".**

Ini membuat RBAC kamu jauh lebih masuk akal.

---

## 8. Alur login production

Saya juga menyarankan login flow seperti ini:

```text
                    LOGIN
                      │
                      ▼
               Authentication
                      │
                 Credentials
                      │
              ┌───────┴───────┐
              │               │
            Invalid          Valid
              │               │
              ▼               ▼
        Error Message      Check Status
                              │
                    ┌─────────┴─────────┐
                    │                   │
                  Active            Inactive
                    │                   │
                    ▼                   ▼
               Check Role           Reject
                    │
          ┌─────────┼─────────┬─────────┐
          ▼         ▼         ▼         ▼
     Super Admin  Management Supervisor Rider
          │         │         │         │
          ▼         ▼         ▼         ▼
      Dashboard Dashboard Dashboard Dashboard
```

Dan kalau akun baru pertama kali login:

```text
Login
  ↓
first_login = true
  ↓
Force Set Password
  ↓
Update Profile
  ↓
first_login = false
  ↓
Dashboard
```

---

## 9. Jadi lifecycle pengguna COZIS

Secara sederhana:

**Super Admin**

> Bootstrap → Configure → Manage

**Management**

> Manage Account → Manage Fleet → Manage Catalog

**Supervisor**

> Analyze DSS → Manage Zone → Plot Rider → Monitor Operation

**Rider**

> Login → View Assignment → Navigate/Sell → Update Operational Status

Dengan desain ini, **onboarding tidak berhenti di "register → login"**, tetapi menjadi lifecycle yang jelas:

**Provision → Activate → Assign → Operate → Deactivate**

Dan menurut saya ini paling cocok dengan karakter COZIS sebagai **DSS internal perusahaan**, bukan aplikasi SaaS/public registration.
