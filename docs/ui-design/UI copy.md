file ini ditujukan untuk merancang draft UI dari aplikasi COZIS 

# important!
sebelum menginisiasi Tampilan UI sebagai AI agent kamu harus melakukan beberapa hal 
1. mengaudit apakah Endpoint tersebut sudah tersedia
2. Memeriksa Fungsi dari Endpoint tersebut
3. Mengecek Implementasi yang sudah terjadi pada frontend 
4. Tidak Mengubah Logic dari Backend 
5. Melakukan implementasi UI berdasarkan apa yang dibutuhkan

Pada hal diatas ini kamu akan melapor dulu terkait hal yang berhubungan dengan diatas tersebut setelah user mengkonfirmasi untuk proceed kamu akan melanjutkan proses pembuatan UI

UI harus responsif dan mobile friendly
UI harus mengikuti design system yang sudah ada
UI harus mobile friendly 
    - tidak terlalu banyak informasi 
    - responsive pada tampilan mobile, tab dan web dikarenakan rancangan frontend akan di implementasi sebagai aplikasi PWA 

# Matriks akses utama

| Fitur                 | Super Admin | Management            | Supervisor                  | Rider                   |
| --------------------- | ----------- | --------------------- | --------------------------- | ----------------------- |
| **Dashboard**         | Full        | Management Dashboard  | Operational Dashboard       | Rider Dashboard         |
| **Manajemen Zona**    | Full        | —                     | Full Operational            | View                    |
| **Manajemen DSS**     | Full        | —                     | Full                        | View Recommendation     |
| **Manajemen Armada**  | Full        | Full                  | Monitor                     | Claim / Return          |
| **Manajemen User**    | Full*       | CRUD Account          | Assignment / Plotting       | Self Profile            |
| **Manajemen Catalog** | Full        | Full                  | —                           | View                    |
| **Laporan**           | Full        | Management Report     | Operational Report          | Personal/Sales Report   |
| **Notifikasi**        | Full        | Management            | Operational                 | Receive                 |
| **Monitoring Map**    | Full        | Fleet/User Monitoring | Full Operational Monitoring | Limited Operational Map |

* Super Admin memiliki seluruh akses administrasi akun, tetapi tidak masuk ke operasional perusahaan sebagai Rider.

# Positioning Pada Module Manejemen User 
## Role : SuperAdmin 
Full Account Administration
*    Create account
*    Read account
*    Update account
*    Delete/deactivate account
*    Change username/email
*    Reset password
*    Change role
*    Activate/deactivate user
*    View user activity

## Role : Management
Account Administration
*    Create account
*    Read account
*    Update username/email
*    Delete/deactivate account
*    Administrative password reset
*    Change role

* Manegement tidak boleh membuat Super Admin.

Management
   │
   ├── Create Management
   ├── Create Supervisor
   └── Create Rider

* Manegement tidak boleh membuat Super Admin.

## Role : Supervisor
Supervisor bukan User Administrator.
User Management
│
├── View Rider
├── View Rider Status
├── Assign Rider → Zone
├── Change Rider → Zone
├── Plotting Rider
└── View Operational Assignment

# Positioning pada module Manajemen Zona 
## SUPER ADMIN 
(FULL ACCESS)
*    Create zone
*    Edit zone
*    Delete zone
*    Activate/deactivate zone
*    Configure zone parameters
*    View zone
*    View spatial restrictions
## SUPERVISOR 
*   View zone
*   Activate operational zone
*   Select recommended zone
*    Assign rider → zone
*   Change rider → zone
*    Monitor zone
*    View zone status
*    View geofence

<!-- Tetapi saya sarankan Supervisor tidak bebas menghapus master zone. -->
## RIDER
Rider
(View Only)
*    View operational zone
*    View assigned zone
*    View geofence
*    View zone recommendation

Tidak boleh:
*    Create
*    Edit
*    Delete
*    Configure

# Manajemen DSS
Ini harus menjadi fitur yang sangat terbatas.

Super Admin
Full access:

DSS
├── Configure Criteria
├── Configure Weight
├── BWM
├── TOPSIS
├── Run Calculation
├── View Result
├── View Ranking
└── View History

Supervisor
Saya sarankan:

DSS
├── View Criteria
├── View Weight
├── Run DSS
├── View TOPSIS Result
├── View Ranking
└── Select Operational Recommendation

Namun Jangan Berikan : 
Modify BWM Configuration ❌
<!-- Modify Core Criteria ❌  -->
<!-- Modify Methodology ❌ -->
<!-- Delete Calculation History ❌  -->


# Management
No Access

Ini konsisten dengan requirement kamu:

Management tidak menyentuh aspek DSS.


# Rider
Recommendation View Only

Rider boleh melihat:
"Zona yang direkomendasikan untuk kamu"

tetapi bukan:
"Hasil perhitungan BWM-TOPSIS secara keseluruhan."
<!-- Ini penting agar UI Rider tidak terlalu kompleks. -->

# Pembagian Fitur 
Manajemen Zona 
Manajemen DSS
Manajemen Armada 
Manajemen User 
Manajemen Catalog
Laporan 
