Ya, ini justru salah satu bagian yang menurut saya **perlu kamu benahi sebelum implementasi lebih jauh**, karena saat ini ada pencampuran antara **business rule**, **system configuration**, dan **visualisasi GIS**.

Untuk kasus **Buffer Operasional 12 KM**, saya **tidak menyarankan langsung menjadikannya field onboarding yang bebas dipilih user**, tetapi juga **tidak boleh hard-code** seperti sekarang.

Posisi yang lebih tepat adalah:

> **Operational Coverage Area adalah konfigurasi bisnis yang memiliki nilai default/initial assumption, dan menjadi constraint spasial bagi seluruh zona.**

Karena kamu sendiri mengatakan **12 KM belum pernah divalidasi dalam wawancara**, jangan menulis 12 KM sebagai fakta bisnis yang sudah final.

---

# 1. Masalah pada state sekarang

Sekarang flow-mu secara implisit seperti ini:

```text
Central Hub
    │
    └── hard-coded radius 12 KM
              │
              ▼
          visualisasi
              │
              ▼
        user gambar zona
              │
              ▼
       validasi tol saja
              │
              ▼
           ACTIVE
```

Ada masalah besar di sini:

### Zona belum divalidasi terhadap operational radius.

Artinya user bisa membuat:

```text
             Zona A
               █████████
              ███████████
                         █████
                            ███
                               ● Hub
                              12km
```

dan sistem hanya bertanya:

> "Apakah zona memotong jalan tol?"

Padahal constraint bisnisnya seharusnya juga:

> "Apakah zona masih berada dalam area operasional?"

---

# 2. Jangan jadikan "12 KM" sebagai fakta dulu

Karena dari wawancara belum ada pertanyaan mengenai radius tersebut, saya akan memberi status:

```text
Operational Radius
Value       : 12 KM
Source      : System assumption / existing implementation
Validation  : NOT YET CONFIRMED
```

Ini penting untuk skripsimu.

Jangan sampai nanti dokumen penelitian mengatakan:

> "Berdasarkan wawancara, perusahaan memiliki radius operasional 12 KM."

padahal sebenarnya tidak pernah ditanyakan.

Lebih aman:

> "Sistem saat ini menggunakan radius operasional 12 KM sebagai parameter awal berdasarkan kondisi implementasi, namun parameter tersebut perlu dikonfirmasi kepada stakeholder."

Ini membuat dokumentasimu jujur secara metodologis.

---

# 3. Saya akan mengubah konsepnya menjadi "Operational Area"

Daripada UI menampilkan:

> Buffer Operasional 12 KM

saya lebih menyarankan konsep:

## **Area Operasional**

yang memiliki:

```text
Central Hub
+
Operational Coverage
```

Misalnya:

```text
AREA OPERASIONAL

Central Hub
[ Hub Sidoarjo ]

Radius
[ 12 ] KM

Status
● Aktif

Digunakan sebagai batas maksimum
pembuatan dan validasi zona.
```

Dengan demikian radius bukan sekadar lingkaran visual.

Ia menjadi **constraint utama sistem**.

---

# 4. Tetapi jangan langsung membuat radius sebagai "onboarding"

Saya kurang setuju jika dibuat:

```text
Onboarding
↓
Pilih radius
↓
12 KM
↓
System
```

Karena siapa yang berhak menentukan radius?

Kalau user onboarding bisa menentukan:

```text
5 KM
10 KM
20 KM
50 KM
```

maka itu sebenarnya bukan onboarding preference.

Itu adalah:

> **Business Configuration.**

Lebih cocok berada di:

```text
Settings
  │
  └── Operational Configuration
          │
          ├── Central Hub
          ├── Operational Radius
          └── Operational Schedule
```

Dan aksesnya mungkin hanya:

```text
SUPERADMIN
```

atau sesuai hasil validasi kebutuhan stakeholder.

---

# 5. Arsitektur yang saya rekomendasikan

Saya akan membuat:

```text
SYSTEM CONFIGURATION
│
├── Central Hub
│
├── Operational Radius
│
├── Operational Schedule
│
└── Spatial Restrictions
      ├── Toll Roads
      └── Protocol Roads
```

Kemudian:

```text
Operational Configuration
            │
            ▼
      Operational Area
            │
     ┌──────┴──────┐
     │             │
     ▼             ▼
  Zone Creation   DSS
     │             │
     ▼             ▼
  Spatial       Candidate
  Validation     Zones
```

Jadi DSS **tidak menentukan area operasional**.

DSS hanya menentukan:

> Dari zona-zona yang valid, mana yang paling direkomendasikan?

---

# 6. Urutan constraint zona harus diperbaiki

Saat user membuat zona, jangan hanya:

```text
Polygon
 ↓
Toll intersection?
 ↓
ACTIVE
```

Saya akan membuat validation pipeline:

```text
USER DRAW POLYGON
        │
        ▼
Geometry Validation
        │
        ├── Invalid geometry → REJECT
        │
        ▼
Operational Area Validation
        │
        ├── Outside area → REJECT
        │
        ▼
Toll Road Validation
        │
        ├── Intersects toll → REJECT
        │
        ▼
Zone Overlap Validation
        │
        ├── Conflict → WARNING / REJECT
        │
        ▼
Capacity Validation
        │
        ▼
       VALID
        │
        ▼
      ACTIVE
```

Nah, **Zone Overlap Validation** juga menurut saya belum ada di flow-mu dan sangat penting.

---

# 7. Zona harus berada di dalam operational area

Kalau menggunakan radius 12 KM, secara konsep:

```text
Central Hub
     ●
     │
     │ 12 KM
     ▼
╭───────────────────╮
│                   │
│  Operational Area │
│                   │
│    ┌───────┐      │
│    │ Zone A│      │
│    └───────┘      │
│                   │
╰───────────────────╯
```

Maka rule:

> **Zona harus sepenuhnya berada di dalam area operasional.**

Bukan sekadar centroid-nya berada di dalam radius.

Ini perbedaan penting.

### Salah:

```text
ST_DWithin(centroid, hub, 12km)
```

Karena:

```text
       Zone
    █████████
  █████████████
       ●
       │
      Hub
```

Centroid bisa masuk radius, tetapi sebagian polygon keluar.

### Lebih tepat:

```text
Operational Area
        CONTAINS
           ↓
         Zone
```

Secara PostGIS konsepnya dapat menggunakan:

```sql
ST_CoveredBy(zone.geom, operational_area.geom)
```

atau pendekatan equivalent yang sesuai dengan model geometry-mu.

---

# 8. Tetapi ada satu hal yang lebih fundamental: 12 KM itu apa?

Ini justru **pertanyaan wawancara yang harus kamu tambahkan**.

Ketika stakeholder mengatakan:

> "Jangkauan operasional 12 KM"

kamu harus tahu apakah maksudnya:

### A. Radius garis lurus

```text
Hub ─────────────── Zone
       12 km
```

atau:

### B. Jarak perjalanan jalan

```text
Hub
 │
 ├──── Jalan ─────┐
 │                │
 └────────────────┘
                  Zone

actual travel distance = 12 km
```

Ini **sangat berbeda**.

Kalau bisnis sebenarnya mengatakan:

> Rider maksimal 12 km dari hub berdasarkan perjalanan kendaraan,

maka `ST_DistanceSphere` bukan representasi yang tepat untuk constraint utama.

Karena:

```text
straight-line distance ≠ road travel distance
```

Untuk versi awal sistem, kamu masih bisa menggunakan radius geodesik jika memang business rule-nya adalah radius geografis.

Tetapi **jangan mengasumsikan 12 KM sebagai road distance** sebelum diwawancarai.

---

# 9. Saya akan menambahkan pertanyaan wawancara khusus

Menurut saya ini wajib kamu tanyakan ke stakeholder:

### Pertanyaan 1

> "Apakah terdapat batas maksimum area/jangkauan operasional dari Central Hub?"

Jika ya:

### Pertanyaan 2

> "Berapa jarak maksimum tersebut?"

Lalu:

### Pertanyaan 3

> "Jarak tersebut dihitung berdasarkan jarak garis lurus dari hub atau jarak perjalanan kendaraan melalui jaringan jalan?"

Lalu:

### Pertanyaan 4

> "Apakah seluruh zona penjualan harus berada dalam batas tersebut, atau cukup titik pusat zona/centroid yang berada dalam jangkauan?"

Lalu:

### Pertanyaan 5

> "Apakah batas tersebut berlaku untuk seluruh rider dan seluruh zona?"

Lalu:

### Pertanyaan 6

> "Apakah radius/jangkauan ini dapat berubah berdasarkan kondisi operasional?"

Ini akan menentukan apakah:

```text
12 KM
```

merupakan:

```text
CONSTANT
```

atau:

```text
CONFIGURABLE BUSINESS PARAMETER
```

---

# 10. Bagaimana kalau stakeholder belum tahu?

Ini juga mungkin terjadi.

Jangan memaksakan angka 12 KM.

Sistem dapat memiliki:

```text
Operational Radius
12 KM

Source:
Initial System Configuration

Validation:
Pending Business Confirmation
```

Kemudian di UI Admin:

```text
⚠ Parameter belum dikonfirmasi

Radius operasional saat ini: 12 KM

Nilai ini merupakan konfigurasi awal
dan belum divalidasi melalui stakeholder.

[ Review Configuration ]
```

**Ini menurut saya sangat bagus untuk menjaga traceability penelitian.**

---

# 11. Flow Manajemen Zona yang baru

Saya akan merombak Use Case 2.1 menjadi:

# Use Case 2.1 — Konfigurasi Area Operasional

```text
SUPERADMIN
    │
    ▼
Operational Configuration
    │
    ├── Central Hub
    ├── Operational Radius
    └── Operational Schedule
    │
    ▼
Generate Operational Area
    │
    ▼
Visualize on Map
```

Kemudian:

# Use Case 2.2 — Create & Validate Zone

```text
Supervisor
     │
     ▼
Tambah Zona
     │
     ▼
Gambar Polygon
     │
     ▼
Pre-validation
     │
     ├── Geometry
     ├── Operational Area
     ├── Toll Road
     ├── Existing Zone
     └── Capacity
     │
     ▼
Validation Result
     │
     ├── INVALID
     │
     └── VALID
          │
          ▼
       Save Zone
          │
          ▼
        ACTIVE
```

Kemudian:

# Use Case 2.3 — Map Ops

```text
Operational Area
        +
Zones
        +
Toll Roads
        +
Protocol Roads
        +
Riders
        +
Hub
```

---

# 12. Status zona juga sebaiknya jangan hanya ACTIVE / INVALID

Sekarang:

```text
ACTIVE
INVALID
```

terlalu sederhana.

Saya lebih menyarankan:

```text
DRAFT
VALID
ACTIVE
INACTIVE
ARCHIVED
```

Dan validation result dipisahkan:

```text
validation_status:
VALID
INVALID

validation_reason:
OUTSIDE_OPERATIONAL_AREA
INTERSECTS_TOLL_ROAD
INVALID_GEOMETRY
OVERLAPS_EXISTING_ZONE
```

Jadi jangan mencampur:

```text
status = INVALID
```

dengan alasan bisnis.

---

# 13. Jangan langsung menghapus polygon invalid

Flow kamu sebenarnya sudah bagus karena menyimpan polygon invalid.

Saya akan mempertahankannya.

Contoh:

```text
Zone A
Status:
DRAFT

Validation:
INVALID

Reason:
INTERSECTS_TOLL_ROAD
```

Supervisor bisa:

```text
[ Edit Boundary ]
```

lalu sistem melakukan validasi ulang.

Ini lebih bagus daripada user harus menggambar ulang dari nol.

---

# 14. Ada satu validasi lain yang menurut saya sangat penting: overlap zona

Bayangkan:

```text
        Zone A
     ┌───────────┐
     │           │
     │    ┌────────────┐
     │    │   Zone B   │
     └────│────────────┘
          │
          └────────────
```

Kalau rider ditempatkan berdasarkan zona, overlap dapat menyebabkan:

```text
Rider A → Zone A
Rider B → Zone B
```

tetapi secara geografis mereka sebenarnya berada di area yang sama.

Maka saya sarankan:

> **Zona tidak boleh overlap**, kecuali memang bisnis secara eksplisit membutuhkan overlapping zones.

Untuk tahap sekarang, lebih aman:

```text
Zone A ∩ Zone B = ∅
```

atau minimal sistem memberi warning jika overlap.

---

# 15. UX pembuatan zona bisa menjadi jauh lebih bagus

Saat user membuka:

**Tambah Zona**

peta langsung menunjukkan:

```text
                 Toll Road
                    ║║
                    ║║
       ┌────────────────────────┐
       │                        │
       │ Operational Area       │
       │                        │
       │      ┌──────────┐      │
       │      │  Zone    │      │
       │      └──────────┘      │
       │                        │
       └────────────────────────┘
                    ●
                  HUB
```

Dan ketika menggambar:

```text
┌─────────────────────────────────────┐
│ VALIDASI ZONA                       │
│                                     │
│ ✓ Berada dalam area operasional     │
│ ✓ Tidak memotong jalan tol          │
│ ✓ Geometri valid                    │
│ ✓ Tidak overlap zona lain           │
│                                     │
│ Zona siap digunakan                 │
└─────────────────────────────────────┘
```

Kalau keluar radius:

```text
⚠ Zona melewati area operasional

4,2% area zona berada di luar
batas operasional 12 KM.

[ Sesuaikan Batas ]
```

Ini jauh lebih UX-friendly daripada baru mengetahui setelah klik Save.

---

# 16. Dan saya akan mengubah posisi "Buffer Operasional" di UI

Jangan jadikan hanya:

> Layer → Buffer 12 KM

Lebih tepat:

### Map

```text
Operational Area
```

### Settings

```text
Operational Configuration

Central Hub
Sidoarjo Hub

Operational Coverage
12 KM

[ Edit Configuration ]
```

### Zone Creation

```text
Constraint:
Zone must be within Operational Area
```

Dengan demikian satu parameter memiliki **single source of truth**.

---

# 17. Struktur database yang lebih sehat

Daripada:

```text
12 KM
```

hardcoded di service:

```javascript
const OPERATIONAL_RADIUS = 12;
```

buat configuration:

```text
system_configurations

id
key
value
unit
category
is_active
updated_by
updated_at
```

atau kalau kamu ingin lebih terstruktur:

```text
operational_configurations

id
hub_id
radius_km
distance_type
effective_from
effective_until
is_active
created_by
created_at
updated_at
```

Saya lebih suka opsi kedua karena **Operational Configuration adalah domain object**, bukan sekadar key-value setting.

---

# 18. Hub juga sebaiknya jangan hard-code

Saat ini:

```text
Central Hub Sidoarjo
-7.397402
112.711958
```

Kalau sudah kita putuskan radius menjadi configurable, saya sekalian akan mengeluarkan:

```text
HUB_CITY_NAME
HUB_LAT
HUB_LNG
OPERATIONAL_RADIUS
```

dari hard-coded frontend.

Menjadi:

```text
Backend
   ↓
Operational Configuration API
   ↓
Frontend Map
```

Sehingga frontend hanya berkata:

> "Tampilkan operational area."

Bukan:

> "Gambar circle 12 km dari koordinat X."

Ini sesuai dengan prinsip **backend sebagai source of truth** yang sudah kamu gunakan di bagian POI/Weather.

---

# 19. Satu perubahan konseptual yang sangat saya sarankan

Jangan berpikir:

> **"Buffer 12 KM adalah zona besar yang membungkus semua zona."**

Pikirkan:

> **"Operational Area adalah constraint spasial tempat zona boleh dibuat."**

Hub → menentukan area operasional.

Area operasional → membatasi kandidat zona.

Zona → kandidat DSS.

DSS → ranking zona.

Rider → ditempatkan pada zona.

Sehingga:

```text
                CENTRAL HUB
                     │
                     ▼
           OPERATIONAL AREA
              /           \
             /             \
            ▼               ▼
        ZONE A            ZONE B
           │                 │
           └────────┬────────┘
                    ▼
                  DSS
                    │
                    ▼
              TOPSIS RANKING
                    │
                    ▼
            OPERATIONAL ASSIGNMENT
                    │
                    ▼
                  RIDER
```

Ini jauh lebih bersih daripada buffer hanya menjadi layer visual.

---

# 20. Jadi keputusan desain saya untuk state sekarang

| Item              | State sekarang              | Saya sarankan                                   |
| ----------------- | --------------------------- | ----------------------------------------------- |
| Radius 12 KM      | Hard-coded                  | **Configurable**                                |
| Status 12 KM      | Dianggap business rule      | **Initial assumption sampai divalidasi**        |
| Pengaturan radius | Tidak ada                   | **Operational Configuration**                   |
| Onboarding        | Kandidat lokasi konfigurasi | **Bukan onboarding**                            |
| Hub               | Hard-coded                  | **Backend configuration**                       |
| Buffer            | Visual layer                | **Operational Area + visual layer**             |
| Zona              | Validasi tol                | **Geometry + Operational Area + Tol + Overlap** |
| Active Zone       | Langsung setelah save       | **Setelah seluruh validation pass**             |
| DSS               | Bisa melihat zona           | **Hanya zona valid/active**                     |
| Rider             | Menggunakan zona            | **Terikat pada operational session + zona**     |
| Perubahan radius  | Belum didefinisikan         | **Harus versioned/effective-dated**             |

Dan yang paling penting untuk wawancaramu: **jangan buru-buru menetapkan 12 KM sebagai requirement final.** Saya akan masukkan dulu sebagai **"parameter yang perlu dikonfirmasi"**, lalu tambahkan pertanyaan khusus tentang *radius vs road distance, centroid vs seluruh polygon, dan apakah berlaku untuk semua sesi/rider*. Setelah jawaban stakeholder ada, baru kita lock menjadi **BR-ZONE-xx**.

Dengan perubahan ini, **Alur 02 tidak lagi sekadar "gambar polygon + cek tol"**, tetapi menjadi **Spatial Governance**: sistem menentukan *di mana zona boleh eksis*, lalu DSS menentukan *zona mana yang paling baik*. Itu boundary yang menurut saya jauh lebih tepat untuk arsitektur COZIS.


## Business rules 
Betul. Ini sebenarnya **masalah yang lebih fundamental daripada sekadar UX drag polygon**. Ada dua layer yang perlu kamu pisahkan:

1. **Business rule:** apa yang boleh terjadi terhadap zona yang sedang dipakai operasional.
2. **GIS interaction:** bagaimana user mengedit geometry dengan nyaman tanpa merusak constraint spasial.

Dan saya akan menerapkan prinsip yang sama seperti DSS: **jangan mengubah objek yang sedang menjadi referensi operasional secara langsung.**

---

# 1. Prinsip utama: zona ACTIVE yang sedang digunakan jangan diedit langsung

Misalnya kondisi:

```text
Zona A
Status: ACTIVE

Rider:
R01 → Assigned
R02 → Assigned
R03 → Assigned
```

Kemudian Supervisor membuka Edit Zona dan menggeser boundary.

Kalau sistem langsung menyimpan:

```text
Polygon A (lama)
       ↓
EDIT
       ↓
Polygon A (baru)
```

maka kita punya masalah:

```text
Rider R01
     │
     ▼
Assignment → Zona A
               │
               ▼
         geometry berubah
```

Rider masih menganggap dirinya berada di Zona A, tetapi **Zona A secara spasial sudah berubah**.

Lebih buruk lagi kalau perubahan polygon menyebabkan posisi rider sekarang berada di luar geofence.

Maka rule yang saya rekomendasikan:

> **Zona yang sedang digunakan dalam sesi operasional aktif tidak boleh mengubah geometry secara langsung.**

---

# 2. Bedakan 3 kondisi zona

Ini penting.

### Kondisi A — Zona belum digunakan

```text
DRAFT
```

Tidak ada rider.

→ Bebas diedit.

---

### Kondisi B — Zona ACTIVE tetapi tidak sedang digunakan

```text
ACTIVE
Assigned Rider = 0
Operational Session = NONE
```

→ Boleh diedit, **tetapi tetap melalui validation**.

---

### Kondisi C — Zona ACTIVE dan sedang digunakan

```text
ACTIVE
Operational Session = ACTIVE
Assigned Rider > 0
```

→ **LOCKED.**

Tidak boleh:

* mengubah polygon
* menghapus zona
* mengubah constraint penting
* mengubah area yang memengaruhi geofence

---

# 3. Kalau user tetap ingin mengubahnya?

Jangan sekadar:

> "Tidak bisa."

Lebih bagus buat mekanisme:

## "Propose Zone Change"

Misalnya:

```text
Zona A
ACTIVE
Sedang digunakan oleh 3 rider

[ Edit Zona ]
```

ketika diklik:

```text
┌───────────────────────────────────────┐
│ Zona sedang digunakan                 │
│                                       │
│ Zona A saat ini memiliki 3 rider     │
│ yang sedang bertugas.                 │
│                                       │
│ Perubahan boundary tidak dapat        │
│ diterapkan langsung pada sesi aktif.  │
│                                       │
│ Anda dapat membuat perubahan untuk    │
│ sesi berikutnya.                      │
│                                       │
│ [ Jadwalkan Perubahan ]               │
│ [ Batal ]                             │
└───────────────────────────────────────┘
```

---

# 4. Konsepnya sama dengan BWM

Ini bisa kita samakan dengan yang tadi kita desain:

### DSS

```text
BWM v3 ACTIVE
      │
      ├── immutable
      │
      ▼
BWM v4 DRAFT
      │
      ▼
Schedule
      │
      ▼
Next Session
```

### Zone

```text
Zone A ACTIVE
      │
      ├── immutable during session
      │
      ▼
Zone A Revision
      │
      ▼
Validate
      │
      ▼
Schedule
      │
      ▼
Next Session
```

Jadi kamu sebenarnya mulai memiliki pola arsitektur:

> **Operational entities are immutable during an active operational session.**

Ini bagus sekali untuk sistemmu.

---

# 5. Bagaimana dengan perubahan kecil?

Saya tidak menyarankan semua perubahan harus diblokir secara membabi buta.

Kita bisa membedakan:

### Non-impacting change

Misalnya:

```text
Nama zona
Deskripsi
Warna tampilan
Catatan
```

Boleh dilakukan saat operasional.

Sedangkan:

### Operational-impacting change

```text
Polygon
Capacity
Operational boundary
Status
```

harus mengikuti rule khusus.

Contoh:

| Perubahan  | Saat ada rider aktif   |
| ---------- | ---------------------- |
| Nama zona  | ✓ Boleh                |
| Deskripsi  | ✓ Boleh                |
| Warna      | ✓ Boleh                |
| Polygon    | ❌ Lock                 |
| Capacity   | ⚠ Tergantung kondisi   |
| Delete     | ❌ Lock                 |
| Deactivate | ❌ / membutuhkan proses |
| Geofence   | ❌ Lock                 |

---

# 6. Capacity juga perlu rule

Misalnya:

```text
Capacity = 10
Current Rider = 7
```

Supervisor ingin:

```text
Capacity = 5
```

Tidak boleh.

Karena:

```text
5 capacity
7 assigned
```

tidak masuk akal.

Rule:

> `new_capacity >= current_active_assignments`

Kalau ingin menurunkan kapasitas:

```text
Current = 7
New = 5
```

UI:

```text
Tidak dapat mengurangi kapasitas.

7 rider sedang terassigned,
sedangkan kapasitas baru hanya 5.

Silakan pindahkan minimal 2 rider
sebelum menurunkan kapasitas.
```

Ini contoh business rule yang sangat penting.

---

# 7. Bagaimana dengan DELETE?

Saya justru **tidak menyarankan hard delete zona**.

Misalnya:

```text
Zone A
2026
```

pernah digunakan oleh:

```text
TOPSIS result
Rider assignment
LBS tracking
Audit log
Reports
```

Kalau dihapus:

```text
DELETE FROM zones
```

maka historical reference bisa rusak.

Lebih baik:

```text
ACTIVE
   ↓
INACTIVE
   ↓
ARCHIVED
```

Jadi tombol UI sebaiknya bukan:

> Hapus Zona

tetapi:

> **Nonaktifkan Zona**

---

# 8. Rule delete yang saya rekomendasikan

### Jika ada active assignment

```text
Zone A
3 active riders
```

→ ❌ tidak bisa dinonaktifkan.

Harus:

```text
Reassign riders
       ↓
Active assignments = 0
       ↓
Deactivate Zone
```

### Jika tidak ada rider

```text
Active assignments = 0
```

→ boleh:

```text
Deactivate
```

Kemudian:

```text
Zone status:
INACTIVE
```

Bukan benar-benar delete.

---

# 9. Kenapa saya tidak menyarankan DELETE?

Karena nanti kamu punya hubungan:

```text
Zone
 │
 ├── TOPSIS Result
 ├── Operational Session
 ├── Rider Assignment
 ├── Check-in
 ├── Check-out
 ├── Sales
 └── Audit
```

Kalau Zone dihapus:

```text
          Zone ❌
            │
     ┌──────┼───────┐
     ▼      ▼       ▼
  TOPSIS   Rider   Sales
   ???      ???     ???
```

Historical data menjadi bermasalah.

Jadi:

> **Zone adalah historical business entity, bukan temporary drawing.**

---

# 10. Untuk polygon editing: masalahmu sekarang memang UX issue

Sekarang kamu mengatakan:

> "ketika aku mau edit atau memindahkan titik poin poligon saya tidak bisa hanya dengan menggeser atau mendrag ke posisi yang saya inginkan."

Ini biasanya terjadi karena implementasi Leaflet hanya membuat polygon:

```javascript
L.polygon(...)
```

tetapi tidak menggunakan mekanisme editing vertex.

Kalau kamu ingin:

```text
      ●──────●
      │      │
      │      │
      ●──────●
```

kemudian user bisa:

```text
drag ●
  ↓
●────────●
```

kamu membutuhkan **geometry editing interaction**, bukan sekadar polygon biasa.

---

# 11. UX yang saya sarankan

Jangan membuat user menggambar ulang polygon.

Flow:

```text
Zone Detail
      │
      ▼
[ Edit Boundary ]
      │
      ▼
Polygon masuk EDIT MODE
      │
      ├── Vertex bisa di-drag
      ├── Vertex bisa dihapus
      ├── Vertex baru bisa ditambahkan
      └── Polygon bisa dipindahkan
      │
      ▼
Live Validation
      │
      ├── Operational Area
      ├── Toll Road
      ├── Overlap
      └── Geometry
      │
      ▼
[ Simpan Perubahan ]
```

---

# 12. Ada dua mode editing yang sebaiknya dibedakan

### Mode 1 — Edit Vertex

User ingin mengubah bentuk zona:

```text
Before

●────────●
│        │
│        │
●────────●


After

●────────────●
│            │
│            │
●───────●────●
```

User cukup drag vertex.

---

### Mode 2 — Move Entire Zone

User sebenarnya ingin:

> "Zona ini digeser 500 meter ke utara."

Tidak perlu menggeser 20 vertex satu per satu.

Berikan:

```text
[ Move Zone ]
```

kemudian seluruh polygon dapat di-drag.

Ini akan sangat meningkatkan UX.

---

# 13. Tambahkan vertex juga

Misalnya polygon:

```text
●────────●
│        │
│        │
●────────●
```

User ingin membuat bentuk:

```text
●──────●────●
│           │
│           │
●───────────●
```

maka pada edge harus ada affordance:

```text
●────────○────────●
```

`○` = insertion point.

Klik:

```text
●────────●────────●
```

lalu vertex baru bisa di-drag.

Ini pola interaction yang umum pada GIS editor.

---

# 14. Jangan tunggu sampai Save untuk validation

Ini improvement UX yang sangat saya rekomendasikan.

Ketika user menggeser vertex:

```text
drag
 ↓
backend validation?
```

Jangan request backend setiap pixel drag.

Lebih baik:

```text
USER DRAG
   ↓
Frontend geometry preview
   ↓
Local validation
   ↓
Visual feedback
```

Misalnya:

```text
✓ Dalam operational area
✓ Tidak memotong tol
✓ Tidak overlap
```

Setelah user berhenti:

```text
Debounce
   ↓
POST /api/zones/:id/validate
```

Backend melakukan authoritative validation.

Jadi:

> **Frontend = immediate feedback**
> **Backend/PostGIS = source of truth**

---

# 15. UX ketika polygon keluar operational area

Misalnya user drag:

```text
Operational Area
╭──────────────────╮
│                  │
│       Zone       │
│          ████████│
╰──────────████████╯
```

Jangan langsung:

> Save failed.

Tampilkan:

```text
⚠ Batas zona melewati area operasional

8.4% area polygon berada di luar
Operational Area.

[ Kembali ke batas valid ]
```

Dan tombol:

```text
Simpan Perubahan
```

disabled.

---

# 16. Kalau polygon menyentuh tol?

Sama:

```text
⚠ Zona memotong area jalan tol

Perubahan boundary tidak dapat disimpan
karena polygon berinteraksi dengan
ruas jalan tol terlarang.

[ Perbaiki Boundary ]
```

---

# 17. Saya akan membuat "Validation Summary"

Ini bisa menjadi bagian UI yang sangat bagus.

Di kanan map:

```text
┌──────────────────────────────┐
│ EDIT ZONA                    │
│                              │
│ Zona: Sidoarjo Barat         │
│                              │
│ VALIDASI BOUNDARY            │
│                              │
│ ✓ Geometry valid             │
│ ✓ Dalam area operasional     │
│ ✓ Tidak memotong tol         │
│ ✓ Tidak overlap zona lain    │
│                              │
│ Kapasitas                    │
│ 10 gerobak                   │
│ 4 sedang bertugas            │
│                              │
│ ──────────────────────────── │
│                              │
│ [ Batal ] [ Simpan ]         │
└──────────────────────────────┘
```

Kalau invalid:

```text
┌──────────────────────────────┐
│ VALIDASI BOUNDARY            │
│                              │
│ ✓ Geometry valid             │
│ ✕ Keluar area operasional    │
│ ✕ Memotong jalan tol         │
│ ✓ Tidak overlap              │
│                              │
│ [ Simpan ] disabled          │
└──────────────────────────────┘
```

---

# 18. Sekarang kita masuk ke kasus paling sulit: rider sedang berada di area yang berubah

Misalnya:

```text
Zone A
        ┌─────────────┐
        │ Rider 01 ●  │
        │             │
        └─────────────┘
```

Supervisor ingin mengecilkan zona:

```text
        ┌───────┐
        │       │
        └───────┘
```

dan rider berada di luar boundary baru.

**Jangan otomatis force logout / memindahkan rider.**

Yang harus terjadi adalah:

```text
Current Session
       │
       ▼
Zone A geometry remains unchanged
       │
       ▼
Scheduled Revision
       │
       ▼
Next Session
       │
       ▼
New Geometry
```

Jadi rider menyelesaikan sesi berdasarkan **versi zona lama**.

---

# 19. Inilah alasan "Zone Version" sebenarnya sangat berguna

Saya bahkan akan mempertimbangkan:

```text
Zone A
Version 1
```

kemudian:

```text
Zone A
Version 2
```

Contoh:

```text
Zone A
├── v1
│   └── 01 Sep 06:00–14:00
│
└── v2
    └── effective 01 Sep 14:00
```

Rider pagi:

```text
Rider R01
Assignment
Zone A v1
```

Rider sore:

```text
Rider R02
Assignment
Zone A v2
```

Nama zona tetap:

> Zona A

tetapi geometry-nya memiliki versi.

Ini membuat historical tracking sangat bersih.

---

# 20. Flow final yang saya rekomendasikan

## Create

```text
Create Zone
    ↓
Draw Polygon
    ↓
Validate
    ↓
DRAFT
    ↓
Activate
    ↓
ACTIVE
```

## Edit tanpa active assignment

```text
ACTIVE
   ↓
Edit Boundary
   ↓
Create Revision
   ↓
Validate
   ↓
Save
   ↓
New Version
```

## Edit dengan active assignment

```text
ACTIVE
   +
Rider Assigned
   +
Session ACTIVE
       │
       ▼
    LOCKED
       │
       ▼
Create Revision
       │
       ▼
Schedule
       │
       ▼
Next Session
```

## Delete

```text
Zone
 │
 ├── Active Assignment?
 │       │
 │       ├── YES → BLOCK
 │       │
 │       └── NO
 │
 ▼
INACTIVE
 │
 ▼
ARCHIVED
```

---

# 21. Business rules yang saya sarankan kamu masukkan ke dokumen

### BR-ZONE-01 — Active Zone Immutability

> Geometri zona yang sedang digunakan pada sesi operasional aktif tidak dapat diubah secara langsung.

### BR-ZONE-02 — Zone Revision

> Perubahan terhadap geometri zona aktif dibuat sebagai revisi baru dan tidak mengubah geometri yang sedang digunakan oleh sesi operasional berjalan.

### BR-ZONE-03 — Scheduled Zone Revision

> Revisi zona yang berdampak terhadap operasional dapat dijadwalkan untuk mulai berlaku pada sesi operasional berikutnya.

### BR-ZONE-04 — Assignment Protection

> Zona yang memiliki active rider assignment tidak dapat dihapus atau dinonaktifkan sampai seluruh assignment aktif diselesaikan atau dipindahkan.

### BR-ZONE-05 — Capacity Constraint

> Kapasitas zona tidak boleh diturunkan di bawah jumlah rider yang sedang ter-assigned.

### BR-ZONE-06 — Spatial Validation

> Setiap revisi geometri harus melewati validasi geometry, operational area, prohibited road, dan overlap sebelum dapat diterapkan.

### BR-ZONE-07 — Historical Integrity

> Zona yang telah digunakan dalam operational session, rider assignment, transaksi, atau hasil DSS tidak dihapus secara permanen; zona dinonaktifkan atau diarsipkan.

### BR-ZONE-08 — Session Geometry Lock

> Selama operational session aktif, rider menggunakan geometri zona yang telah ditetapkan pada awal session dan tidak terpengaruh oleh revisi zona yang dijadwalkan.

### BR-ZONE-09 — Administrative Override

> Superadmin dapat melakukan perubahan darurat terhadap zona aktif melalui mekanisme override dengan alasan wajib dan pencatatan audit.

---

# 22. Dan saya akan mengubah struktur Use Case-mu

Saat ini:

```text
2.1 Pembuatan & Validasi Zona
2.2 Map Ops
```

Menurut saya lebih bagus menjadi:

```text
2.1 Konfigurasi Area Operasional
    ├── Central Hub
    ├── Operational Radius
    └── Operational Schedule

2.2 Pembuatan & Validasi Zona
    ├── Geometry
    ├── Operational Area
    ├── Toll Road
    └── Zone Overlap

2.3 Pengeditan & Revisi Zona
    ├── Edit Vertex
    ├── Move Polygon
    ├── Validation
    ├── Revision
    └── Scheduled Activation

2.4 Aktivasi / Nonaktifkan Zona
    ├── Assignment Check
    ├── Session Check
    └── Archive

2.5 Operational Map / Map Ops
    ├── Zones
    ├── Hub
    ├── Operational Area
    ├── Toll Roads
    ├── Protocol Roads
    └── Riders
```

Menurut saya ini jauh lebih mencerminkan **state nyata sistemmu**.

Dan untuk masalah teknis drag vertex yang kamu alami, **itu sebaiknya kita selesaikan sebagai bagian dari Use Case 2.3**, bukan dianggap bug kecil terpisah. UX yang ideal adalah **Edit Boundary → vertex draggable + add/remove vertex + move entire polygon + live validation + backend authoritative validation**. Dengan begitu user benar-benar merasa sedang mengedit geometri GIS, bukan menggambar polygon baru setiap kali ingin memperbaiki satu titik.
