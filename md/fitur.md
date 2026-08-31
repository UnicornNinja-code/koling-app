# Panduan & Draft UI Aplikasi COZIS

Dokumen ini ditujukan untuk merancang draft antarmuka pengguna (*UI*) dari aplikasi **COZIS**.

---

> [!IMPORTANT]
> ### Prosedur AI Agent Sebelum Menginisiasi Tampilan UI
> Sebelum menginisiasi atau mengimplementasikan Tampilan UI, sebagai AI agent kamu **wajib** melakukan beberapa hal berikut:
> 1. **Audit Endpoint**: Memeriksa apakah Endpoint terkait sudah tersedia.
> 2. **Periksa Fungsi Endpoint**: Memeriksa fungsi dari Endpoint tersebut.
> 3. **Cek Implementasi Frontend**: Mengecek implementasi yang sudah terjadi pada sisi frontend.
> 4. **Integritas Logic Backend**: Tidak mengubah logic dari backend.
> 5. **Implementasi Kebutuhan UI**: Melakukan implementasi UI berdasarkan apa yang dibutuhkan.
> 
> **Alur Konfirmasi:**  
> Pada hal di atas, kamu wajib melapor terlebih dahulu terkait hal-hal yang berhubungan dengan pemeriksaan tersebut. Setelah user mengonfirmasi untuk *proceed*, barulah kamu melanjutkan proses pembuatan UI.

### Prinsip Desain UI
- **Responsif & Mobile-Friendly**:
  - UI tidak boleh memuat terlalu banyak informasi (*clean & focused*).
  - Responsif pada tampilan **Mobile**, **Tablet**, dan **Web Desktop** dikarenakan rancangan frontend akan diimplementasikan sebagai aplikasi **PWA**.
- **Design System**: UI wajib mengikuti *design system* yang sudah ada.

---

## 1. Matriks Akses Utama

| Fitur | Super Admin | Management | Supervisor | Rider |
| :--- | :--- | :--- | :--- | :--- |
| **Dashboard** | Full | Management Dashboard | Operational Dashboard | Rider Dashboard |
| **Manajemen Zona** | Full | — | Full Operational | View |
| **Manajemen DSS** | Full | — | Full | View Recommendation |
| **Manajemen Armada** | Full | Full | Monitor | Claim / Return |
| **Manajemen User** | Full* | CRUD Account | Assignment / Plotting | Self Profile |
| **Manajemen Catalog** | Full | Full | — | View |
| **Laporan** | Full | Management Report | Operational Report | Personal/Sales Report |
| **Notifikasi** | Full | Management | Operational | Receive |
| **Monitoring Map** | Full | Fleet/User Monitoring | Full Operational Monitoring | Limited Operational Map |

> [!NOTE]
> `*` **Super Admin** memiliki seluruh akses administrasi akun, tetapi tidak masuk ke operasional perusahaan sebagai Rider.

---

## 2. Positioning pada Modul Manajemen User

### Role: Super Admin (Full Account Administration)
- Create account
- Read account
- Update account
- Delete/deactivate account
- Change username/email
- Reset password
- Change role
- Activate/deactivate user
- View user activity

---

### Role: Management (Account Administration)
- Create account
- Read account
- Update username/email
- Delete/deactivate account
- Administrative password reset
- Change role

> [!WARNING]
> **Management tidak boleh membuat Super Admin.**

**Hierarki Pembuatan Akun oleh Management:**
```text
Management
├── Create Management
├── Create Supervisor
└── Create Rider
```

*(Catatan: Management dilarang membuat akun Super Admin).*

---

### Role: Supervisor
> *Supervisor bukan User Administrator.*

**Struktur User Management (Supervisor):**
```text
User Management
├── View Rider
├── View Rider Status
├── Assign Rider → Zone
├── Change Rider → Zone
├── Plotting Rider
└── View Operational Assignment
```

---

## 3. Positioning pada Modul Manajemen Zona

### Role: Super Admin (Full Access)
- Create zone
- Edit zone
- Delete zone
- Activate/deactivate zone
- Configure zone parameters
- View zone
- View spatial restrictions

---

### Role: Supervisor
- View zone
- Activate operational zone
- Select recommended zone
- Assign rider → zone
- Change rider → zone
- Monitor zone
- View zone status
- View geofence

> [!NOTE]
> Disarankan Supervisor tidak bebas menghapus master zone.

---

### Role: Rider (View Only)
- View operational zone
- View assigned zone
- View geofence
- View zone recommendation

**Batasan Akses (Tidak Boleh):**
- ❌ Create
- ❌ Edit
- ❌ Delete
- ❌ Configure

---

## 4. Manajemen DSS (Decision Support System)

> [!NOTE]
> Fitur ini harus menjadi fitur yang sangat terbatas.

### Role: Super Admin (Full Access)
```text
DSS
├── Configure Best & Worst Criteria
├── Configure Weight
├── BWM
├── TOPSIS
├── Run Calculation
├── View Result
├── View Ranking
└── View History
```

---

### Role: Supervisor
**Akses Operasional yang Disarankan:**
```text
DSS
├── View Criteria
├── View Weight
├── Run DSS
├── View TOPSIS Result
├── View Ranking
└── Select Operational Recommendation
```

**Batasan untuk Supervisor (Jangan Berikan Akses):**
- ❌ Modify BWM Configuration
- ❌ Modify Core Criteria
- ❌ Modify Methodology
- ❌ Delete Calculation History

---

### Role: Management (No Access)
- **No Access**: Sesuai requirement, Management tidak menyentuh aspek DSS sama sekali.

---

### Role: Rider (Recommendation View Only)
- **Akses yang diberikan:**  
  Rider hanya boleh melihat: *"Zona yang direkomendasikan untuk kamu"*
- **Batasan:**  
  Rider **tidak boleh** melihat *"Hasil perhitungan BWM-TOPSIS secara keseluruhan."*  
  *(Ini penting agar tampilan UI Rider tidak terlalu kompleks).*

---

## 5. Manajemen Armada

> Konsep pembagian:  
> - **Management**: Mengelola armada.  
> - **Supervisor**: Memantau armada.  
> - **Rider**: Menggunakan armada.

### Role: Super Admin (Full)
- CRUD fleet
- Fleet master data
- Fleet status
- Maintenance
- Assignment
- Fleet history
- Monitoring

---

### Role: Management (Full Operational Management)
- CRUD fleet
- Fleet availability
- Maintenance
- Fleet status
- Fleet assignment overview
- Fleet utilization

---

### Role: Supervisor (Monitoring + Operational Control)
- View fleet
- View availability
- View current rider
- Monitor fleet status
- Monitor fleet location/status
- View fleet assignment

**Batasan Akses Supervisor (Tidak Diberikan):**
- ❌ Delete fleet
- ❌ Modify master fleet
- ❌ Change ownership/master data

---

### Role: Rider (Transactional Access)
> Rider memiliki *transactional access*, bukan *fleet management*.

```text
Armada
├── View Available Fleet
├── Claim Fleet
├── View Claimed Fleet
├── Confirm Usage
└── Confirm Return
```

---

## 6. Manajemen Catalog

> Catalog bukan merupakan bagian dari DSS.

### Role: Super Admin
- Full access

---

### Role: Management (Full)
- Create catalog
- Edit catalog
- Delete/deactivate catalog
- Manage price
- Manage availability
- Manage product status

---

### Role: Supervisor (View)
- View catalog  
  *(Supervisor membutuhkan catalog untuk memahami operasional, tetapi tidak perlu mengubahnya).*

---

### Role: Rider (Operational View)
**Akses yang Diberikan:**
- View active products
- View price
- Select product
- Record sales

**Batasan Akses (Tidak Boleh):**
- ❌ Change price
- ❌ Delete product
- ❌ Create product

---

## 7. Laporan

> Laporan disarankan dibedakan berdasarkan perspektif peran (*role-based*), bukan satu halaman laporan yang sama untuk semua role.

### Role: Super Admin (System Report - Seluruh Laporan)
- DSS report
- Zone report
- Rider report
- Fleet report
- Sales report
- User report
- Operational report
- Audit report

---

### Role: Management (Business / Management Report)
- Sales
- Fleet utilization
- Rider productivity
- Catalog performance
- Operational summary

**Tidak Perlu Ditampilkan:**
- ❌ BWM technical calculation
- ❌ TOPSIS intermediate calculation
- ❌ System audit detail

---

### Role: Supervisor (Operational Report)
- Zone performance
- Rider performance
- Rider distribution
- Fleet utilization
- Check-in / check-out
- Operational DSS result
- Plotting history

---

### Role: Rider (Personal Report)
- Personal sales
- Attendance
- Check-in
- Check-out
- Fleet usage
- Assigned zone
- Personal performance

---

## 8. Dashboard

### Role: Super Admin Dashboard
```text
System Overview
├── Total Users
├── Active Riders
├── Fleet Status
├── Active Zones
├── DSS Status
├── Sales Overview
├── System Activity
└── Operational Overview
```

---

### Role: Management Dashboard
```text
Management Overview
├── Active Users
├── Fleet Availability
├── Fleet Utilization
├── Sales
├── Catalog Performance
└── Business Summary
```

---

### Role: Supervisor Dashboard
> Ini harus menjadi dashboard paling kuat setelah Super Admin:

```text
Operational Dashboard
├── Active Riders
├── Rider Distribution
├── Active Zones
├── DSS Recommendation
├── Fleet Status
├── Rider Plotting
├── Check-in Status
├── Geofence Monitoring
└── Operational Map
```

---

### Role: Rider Dashboard
> Tampilan dijaga agar tidak terlalu kompleks:

```text
Rider Dashboard
├── Attendance
├── Today's Assignment
├── Assigned Zone
├── Fleet
├── Sales
├── Check-in Status
├── Check-out Status
└── Map
```

---

## 9. Map / Monitoring

> Map merupakan fitur bersama (*shared feature*), tetapi layer-nya berbeda berdasarkan kebutuhan masing-masing role.

### Role: Super Admin (Semua Layer)
- Users
- Riders
- Fleet
- Zones
- POI
- Weather
- Protocol Roads
- Geofence
- DSS Recommendation

---

### Role: Management (Fokus Monitoring Bisnis)
- Riders
- Fleet
- Zones

---

### Role: Supervisor (Operational Command Map)
- Riders
- Fleet
- Zones
- DSS Recommendation
- POI
- Protocol Roads
- Geofence

---

### Role: Rider
**Layer yang Dapat Dilihat:**
- My Location
- Assigned Zone
- Recommended Zone
- Nearby Riders
- Protocol Roads
- Geofence

**Fitur Khusus Peringatan Proximity Rider:**
```text
Rider
  │
  ▼
GPS Location
  │
  ▼
Distance to Restricted Road
  │
  ├── > 50m  →  Normal
  │
  └── ≤ 50m  →  Warning
```

---

## 10. Rekomendasi Struktur Navigasi Sidebar (Role-Based)

Daripada semua role melihat sidebar yang sama, gunakan *role-based navigation*:

### Super Admin
```text
Dashboard

Management
├── Manajemen User
├── Manajemen Armada
├── Manajemen Catalog
└── Manajemen Zona

Decision Support
└── Perhitungan DSS

Monitoring
└── Operational Map

Reports
└── Laporan

System
├── Audit Log
└── Settings
```

---

### Management
```text
Dashboard

Management
├── Manajemen User
├── Manajemen Armada
└── Manajemen Catalog

Monitoring
└── Fleet & Rider Monitoring

Reports
└── Laporan
```

---

### Supervisor
```text
Dashboard

Operational
├── Manajemen Zona
├── Perhitungan DSS
├── Rider Plotting
└── Monitoring Armada

Map
└── Operational Map

Reports
└── Laporan Operasional
```

---

### Rider
```text
Dashboard

My Operation
├── Kehadiran
├── Armada Saya
├── Penjualan
├── Penugasan
└── Check-in / Check-out

Map
└── Operational Map

Reports
└── Riwayat Saya
```

---

## 11. Rekomendasi Pemisahan Modul User vs Operasional

Pemisahan "Manajemen User" agar tidak dijadikan fitur yang sepenuhnya diakses oleh Supervisor:

```text
MANAGEMENT
└── Manajemen User
      └── Account Management

SUPERVISOR
└── Operasional
      └── Rider Assignment
```

> **Prinsip:**  
> `Account Management ≠ Rider Assignment`  
> 
> Dengan begitu istilahnya sendiri sudah menjelaskan kewenangannya. Ini akan membuat arsitektur backend, frontend, database permission, dan penjelasan skripsimu jauh lebih konsisten.

---

## 12. Final Matrix Hak Akses

| Modul | SA | Management | Supervisor | Rider |
| :--- | :---: | :---: | :---: | :---: |
| **Dashboard** | FULL | FULL | FULL | FULL |
| **User Account** | CRUD | CRUD | VIEW | SELF |
| **Rider Assignment** | FULL | VIEW | CRUD | VIEW |
| **Zone Master** | CRUD | — | VIEW | VIEW |
| **Zone Operation** | FULL | — | CRUD | VIEW |
| **DSS Configuration** | CRUD | — | VIEW | — |
| **DSS Execution** | FULL | — | EXECUTE | — |
| **DSS Recommendation** | FULL | — | FULL | VIEW |
| **Fleet Master** | CRUD | CRUD | VIEW | — |
| **Fleet Operation** | FULL | FULL | MONITOR | CLAIM/RETURN |
| **Catalog Master** | CRUD | CRUD | VIEW | VIEW |
| **Sales** | VIEW | VIEW | VIEW | CRUD |
| **Check-in/out** | VIEW | VIEW | MONITOR | CRUD |
| **Map** | FULL | MONITOR | FULL | LIMITED |
| **Reports** | FULL | MANAGEMENT | OPERATIONAL | PERSONAL |
| **Audit Log** | FULL | — | — | — |
| **Settings** | FULL | — | — | — |

---

## 13. Ringkasan Inti Arsitektur Peran

- **Super Admin** = System Administrator
- **Management** = Resource & Account Administrator
- **Supervisor** = Operational Decision & Control
- **Rider** = Operational Execution
