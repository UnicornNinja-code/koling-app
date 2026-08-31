Saya sudah membaca state onboarding yang kamu kirim. Secara konsep, **fondasinya sudah cukup bagus**, terutama pemisahan *Account Provisioning* dan *Operational Assignment*. Dokumenmu memang sudah mendefinisikan COZIS sebagai sistem internal tanpa public registration dan lifecycle `Provision → Activate → Assign → Operate → Deactivate`. 

Tetapi setelah kita membahas **DSS** dan **Manajemen Zona**, menurut saya onboarding sekarang perlu direvisi cukup signifikan.

## 1. Masalah terbesar: onboarding saat ini terlalu berpusat pada "akun"

Sekarang flow utamanya:

```text
Bootstrap Superadmin
        ↓
Create Management
        ↓
Create Supervisor / Rider
        ↓
Activate Account
        ↓
Assign
        ↓
Operate
```

Padahal COZIS bukan sekadar aplikasi user management.

Ada **dua hal yang harus siap sebelum organisasi bisa beroperasi**:

```text
IDENTITY / ACCESS
        +
OPERATIONAL FOUNDATION
```

Yaitu:

```text
                COZIS INITIAL SETUP
                       │
          ┌────────────┴────────────┐
          ▼                         ▼
    Identity Setup           Operational Setup
          │                         │
    Superadmin                  Central Hub
    Management                 Area Operasional
    Supervisor                 Operational Schedule
    Rider                      Zone
          │                         │
          └────────────┬────────────┘
                       ▼
                READY TO OPERATE
```

Saat ini bagian kanan belum benar-benar menjadi bagian dari onboarding.

Padahal dari pembahasan sebelumnya kita sudah menemukan bahwa **Central Hub dan Operational Radius memengaruhi Zone**, lalu Zone memengaruhi DSS dan assignment Rider.

---

# 2. Saya sarankan onboarding dibagi menjadi 3 fase

Bukan semua dijadikan satu wizard panjang.

### Phase 1 — System Bootstrap

Dilakukan sekali oleh Superadmin / DevOps.

```text
System deployed
      ↓
Database ready
      ↓
Superadmin initialized
      ↓
Force password change
      ↓
Superadmin active
```

Ini sebenarnya sudah ada di dokumenmu. 

---

### Phase 2 — Organization Setup

Setelah Superadmin aktif:

```text
Superadmin
    ↓
Organization Setup
    │
    ├── Central Hub
    ├── Operational Coverage
    ├── Operational Schedule
    ├── Spatial Restrictions
    └── DSS Configuration
```

Ini yang sekarang belum jelas.

---

### Phase 3 — User & Operational Readiness

Baru:

```text
Create Management
       ↓
Create Supervisor
       ↓
Create Rider
       ↓
Activate Accounts
       ↓
Create / Activate Zones
       ↓
DSS Ready
       ↓
Operational Ready
```

---

# 3. Jangan masukkan semua konfigurasi ke onboarding wizard

Ini penting.

Saya **tidak menyarankan** onboarding menjadi:

```text
Step 1 User
Step 2 Hub
Step 3 Radius
Step 4 Zone
Step 5 BWM
Step 6 POI
Step 7 Weather
Step 8 Rider
Step 9 Fleet
...
```

Itu akan menjadi wizard yang sangat panjang.

Lebih baik onboarding hanya berfungsi sebagai:

> **Guided Initial Setup**

yang memastikan prerequisite utama selesai.

---

# 4. Konsep yang lebih bagus: Setup Checklist

Setelah Superadmin pertama kali login, jangan langsung dilempar ke dashboard kosong.

Tampilkan:

```text
WELCOME TO COZIS

Mari siapkan sistem operasional Anda.

Setup Progress
━━━━━━━━━━━━━━━━━━━━ 40%

✓ Administrator
✓ Organization Profile

○ Operational Area
○ Operational Schedule
○ Spatial Restriction
○ DSS Configuration
○ Initial Users

                    [Continue Setup]
```

Ini jauh lebih nyaman daripada wizard yang memaksa user menyelesaikan semua step secara linear.

---

# 5. Saya bahkan akan menggunakan konsep "System Readiness"

Ini akan sangat cocok dengan sistemmu.

Misalnya:

```text
SYSTEM READINESS

Identity              ✓ Ready
Operational Area      ✓ Ready
Spatial Rules         ✓ Ready
Zone                  ⚠ Not Ready
DSS Configuration     ⚠ Not Ready
Users                 ✓ Ready

────────────────────────────

Operational Readiness
⚠ NOT READY

2 prerequisites remaining
```

Kemudian:

```text
[ Complete Setup ]
```

---

# 6. Kenapa ini lebih baik?

Karena tidak semua konfigurasi memiliki dependency yang sama.

Contohnya:

```text
Superadmin
    ↓
Management
```

tidak bergantung pada Zone.

Tetapi:

```text
Central Hub
    ↓
Operational Area
    ↓
Zone
    ↓
DSS
    ↓
Rider Assignment
```

Jadi dependency graph-nya kira-kira:

```text
                 SUPERADMIN
                     │
          ┌──────────┴──────────┐
          ▼                     ▼
       USERS             OPERATIONAL SETUP
                                │
                    ┌───────────┼───────────┐
                    ▼           ▼           ▼
                   HUB        AREA        SCHEDULE
                    │           │
                    └─────┬─────┘
                          ▼
                        ZONE
                          │
                          ▼
                         DSS
                          │
                          ▼
                  RIDER ASSIGNMENT
```

Ini menurut saya jauh lebih menggambarkan arsitektur bisnis COZIS.

---

# 7. Central Hub harus keluar dari hard-code

Dokumenmu saat ini mengatakan konfigurasi `system_settings` memasang koordinat Central HUB Sidoarjo. 

Ini sudah lebih baik daripada hard-code frontend.

Tetapi kita bisa improve lagi.

Pada onboarding:

### Step: Operational Base

```text
OPERATIONAL BASE

Central Hub

Nama
[ Hub Sidoarjo             ]

Alamat
[ ....................... ]

Lokasi
[          MAP            ]

Latitude
-7.xxxxx

Longitude
112.xxxxx

                [Save & Continue]
```

Tetapi **jangan minta user mengisi latitude/longitude secara manual**.

UX:

```text
Search location
     ↓
Select location on map
     ↓
System captures coordinates
```

Manual coordinate input hanya sebagai advanced option.

---

# 8. Operational Area masuk setelah Hub

Kemudian:

```text
OPERATIONAL COVERAGE

Central Hub
● Hub Sidoarjo

Operational Radius
[ 12 ] KM

Area Preview

       ╭──────────────╮
       │              │
       │      ●       │
       │     HUB      │
       │              │
       ╰──────────────╯

ⓘ Radius ini menjadi batas
   area pembuatan zona.
```

Tetapi karena **12 KM belum berasal dari wawancara**, UI/dokumentasi sebaiknya memperlakukannya sebagai **initial/default configuration**, bukan business fact.

---

# 9. Tambahkan status "Not Yet Confirmed"

Untuk skripsi dan sistem nyata, ini sangat bagus:

```text
Operational Radius
12 KM

Status
⚠ Initial Configuration

Source
System Default

[Review]
```

Setelah stakeholder mengonfirmasi:

```text
Status
✓ Business Rule Confirmed
```

Jadi kamu punya traceability antara:

```text
Interview
   ↓
Business Rule
   ↓
System Configuration
   ↓
Implementation
```

---

# 10. Operational Schedule juga sebaiknya ada

Ini menjadi semakin penting karena kita tadi sudah membahas **perubahan DSS hanya aman di luar operational session**.

Onboarding bisa mendefinisikan:

```text
OPERATIONAL SCHEDULE

Hari Operasional
☑ Senin
☑ Selasa
☑ Rabu
☑ Kamis
☑ Jumat
☑ Sabtu
☐ Minggu

Slot Operasional

Pagi   06:00 – 10:00
Siang  10:00 – 14:00
Sore   14:00 – 18:00
Malam  18:00 – 22:00
```

Tapi hati-hati:

> **Jangan otomatis menganggap empat slot tersebut sebagai business rule final hanya karena sekarang ada di DSS.**

Kalau itu belum dikonfirmasi stakeholder, tandai sebagai default/system configuration.

---

# 11. DSS tidak harus dikonfigurasi penuh di onboarding

Ini penting.

Saya akan membuat:

```text
DSS Setup
```

hanya sebagai readiness check:

```text
DSS CONFIGURATION

BWM Configuration
⚠ Not configured

TOPSIS Criteria
✓ 6 criteria available

Active Weight Profile
⚠ None

[ Configure DSS ]
```

Klik:

```text
[ Configure DSS ]
```

→ masuk `/dss`.

Jadi onboarding **tidak mengambil alih modul DSS**.

---

# 12. Hal yang sama berlaku untuk Zone

Jangan buat user menggambar semua zona dalam onboarding.

Lebih baik:

```text
ZONE SETUP

Operational Area
✓ Configured

Active Zones
0

System requires at least
1 active zone to start operation.

[ Create Zone ]
[ Skip for Now ]
```

Kalau belum ada zone:

```text
System Status:
NOT READY FOR OPERATION
```

Tetapi onboarding tetap bisa selesai.

Ini penting karena setup organisasi dan operational readiness adalah dua hal berbeda.

---

# 13. User onboarding yang sekarang juga perlu diperbaiki

Sekarang dokumenmu mengatakan Management membuat akun dan menghasilkan username otomatis dari email, token 48 jam, lalu email activation dikirim. 

Menurut saya ini sudah jauh lebih baik daripada registrasi publik.

Tetapi lifecycle seharusnya:

```text
PROVISIONED
    ↓
INVITATION SENT
    ↓
INVITATION OPENED
    ↓
IDENTITY COMPLETED
    ↓
ACTIVATED
    ↓
READY
```

Bukan:

```text
Create User
    ↓
is_active = true
```

Karena dokumenmu sendiri mengatakan akun disimpan dalam status menunggu aktivasi. 

Jadi ada sedikit inkonsistensi terminology yang sebaiknya dibersihkan.

---

# 14. `is_active` sebaiknya bukan satu-satunya state

Saya menyarankan:

```text
user_status

INVITED
ACTIVE
SUSPENDED
DEACTIVATED
```

Dengan:

```text
invitation_status

PENDING
SENT
ACCEPTED
EXPIRED
```

Jangan mencoba merepresentasikan seluruh lifecycle dengan:

```text
is_active = true / false
```

Karena:

```text
INVITED
```

bukan berarti:

```text
ACTIVE
```

---

# 15. Lifecycle yang lebih akurat

Saya akan revisi:

```text
Provision
    ↓
Invite
    ↓
Activate
    ↓
Available
    ↓
Assign
    ↓
Operate
    ↓
Deactivate
    ↓
Archive
```

Perhatikan:

**Available ≠ Assigned.**

Rider bisa:

```text
ACTIVE
but
NOT ASSIGNED
```

Ini sangat penting untuk sistemmu.

---

# 16. Onboarding Rider jangan sampai langsung berarti "siap bertugas"

Ketika Management membuat:

```text
Rider: Budi
Email: ...
Role: RIDER
```

setelah aktivasi:

```text
Account Status
✓ Active

Operational Status
○ Unassigned

Assignment
None
```

Baru Supervisor melakukan:

```text
Assign Rider
    ↓
Zone
    ↓
Operational Session
    ↓
Rider accepts
    ↓
ON DUTY
```

Ini menjaga separation of concerns yang sebenarnya sudah bagus di dokumen awalmu: account provisioning dilakukan Management, sedangkan operational assignment dilakukan Supervisor. 

---

# 17. Maka saya akan membuat "Onboarding Readiness"

Setelah setup awal:

```text
┌────────────────────────────────────────┐
│ COZIS SETUP STATUS                     │
│                                        │
│ Account & Access                 ✓     │
│ Central Hub                      ✓     │
│ Operational Area                 ✓     │
│ Operational Schedule             ✓     │
│ Spatial Restrictions             ✓     │
│ Active Zone                      ✓     │
│ DSS Weight Configuration         ✓     │
│ Management Account               ✓     │
│ Supervisor Account               ✓     │
│ Rider Account                    ✓     │
│                                        │
│ ────────────────────────────────────── │
│ SYSTEM READY FOR OPERATION             │
│                                        │
│              [ Go to Dashboard ]       │
└────────────────────────────────────────┘
```

---

# 18. Tapi jangan jadikan semua item mandatory

Saya akan membaginya:

### Mandatory

```text
✓ Superadmin
✓ Central Hub
✓ Operational Area
✓ Operational Schedule
✓ Spatial Restriction
✓ At least 1 Active Zone
✓ Active DSS Configuration
```

### Recommended

```text
○ Management
○ Supervisor
○ Rider
○ Fleet
○ Product Catalog
```

Karena mungkin Superadmin ingin menyiapkan sistem terlebih dahulu sebelum membuat seluruh akun.

---

# 19. Final onboarding flow yang saya rekomendasikan

Secara keseluruhan:

```text
                    SYSTEM DEPLOYMENT
                           │
                           ▼
                  INITIAL SUPERADMIN
                           │
                           ▼
                  FORCE PASSWORD CHANGE
                           │
                           ▼
                    SYSTEM SETUP
                           │
              ┌────────────┼────────────┐
              ▼            ▼            ▼
             HUB        AREA/RADIUS   SCHEDULE
              │            │            │
              └────────────┼────────────┘
                           ▼
                  SPATIAL CONFIGURATION
                           │
                           ▼
                     ZONE SETUP
                           │
                           ▼
                     DSS SETUP
                           │
                           ▼
                   USER PROVISIONING
                           │
              ┌────────────┼────────────┐
              ▼            ▼            ▼
         MANAGEMENT     SUPERVISOR     RIDER
              │            │            │
              └────────────┼────────────┘
                           ▼
                  SYSTEM READINESS
                           │
                           ▼
                  READY TO OPERATE
```

---

# 20. Satu perubahan terminologi yang menurut saya penting

Dokumen sekarang diberi nama:

> **"Onboarding Organisasi & Lifecycle Pengguna"**

Saya justru akan memisahkan menjadi:

### **Alur 08 — Initial System Setup & User Lifecycle**

atau bahkan:

```text
Alur 08 — Initial System Setup
Alur 09 — User Lifecycle & Provisioning
```

Karena sekarang ada dua domain berbeda:

```text
SYSTEM SETUP
    ├── Hub
    ├── Operational Area
    ├── Schedule
    ├── Spatial Rules
    └── DSS

USER LIFECYCLE
    ├── Provision
    ├── Invite
    ├── Activate
    ├── Assign
    ├── Operate
    └── Deactivate
```

Menurut saya ini akan membuat keseluruhan desain COZIS jauh lebih mudah dipahami.

**Kesimpulan utamanya:** onboarding COZIS sebaiknya bukan "wizard untuk memasukkan semua data", tetapi **mekanisme initial provisioning + readiness orchestration**. Ia memastikan fondasi sistem tersedia, tetapi masing-masing domain tetap dikonfigurasi di modulnya sendiri. Dengan pola ini, **DSS tetap punya lifecycle configuration sendiri, Zone punya revision lifecycle sendiri, dan User punya account lifecycle sendiri**, sementara onboarding hanya mengorkestrasi dependensi awalnya.
