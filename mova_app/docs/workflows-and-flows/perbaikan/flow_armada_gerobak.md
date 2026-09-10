Ya. Untuk **Manajemen Armada**, menurut saya ada satu masalah arsitektur yang cukup penting pada state sekarang:

> **`AVAILABLE`, `RESERVED`, `IN_USE`, dan `MAINTENANCE` sedang dicampur dalam satu dimensi status, padahal sebagian adalah kondisi fisik armada dan sebagian adalah kondisi penggunaan/reservasi.**

Kalau ini dibiarkan, nanti akan muncul banyak edge case ketika kita hubungkan dengan **Rider, Assignment, Operational Session, Zone, LBS, dan checkout**.

Saya sarankan kita rapikan dari fondasinya.

---

# 1. Masalah utama pada state sekarang

Saat ini:

```text
AVAILABLE
   ↓
RESERVED
   ↓
IN_USE
   ↓
MAINTENANCE
```

Terlihat sederhana, tetapi secara bisnis sebenarnya:

* `AVAILABLE` = armada bisa dipakai
* `RESERVED` = sedang di-hold rider
* `IN_USE` = sedang digunakan rider
* `MAINTENANCE` = kondisi fisik armada

Masalahnya, **MAINTENANCE bukan state yang sejajar dengan RESERVED/IN_USE**.

Contoh:

```text
Armada EBK-002
Physical condition = MAINTENANCE
Current rider = NULL
```

jelas.

Tapi bagaimana kalau:

```text
EBK-002
Current rider = R01
R01 sedang bertugas
Motor tiba-tiba rusak
```

Apakah:

```text
IN_USE → MAINTENANCE
```

langsung?

Kalau iya, sistem kehilangan informasi:

> R01 masih memegang armada tersebut.

Jadi saya akan memisahkan state.

---

# 2. Pisahkan menjadi 3 dimensi

Saya rekomendasikan model:

```text
ARMADA
│
├── Lifecycle Status
│
├── Availability / Reservation
│
└── Current Assignment
```

Lebih konkretnya:

### A. Fleet Status

```text
ACTIVE
MAINTENANCE
RETIRED
```

Ini menjawab:

> "Apakah unit ini masih merupakan armada operasional dan bagaimana kondisi administratifnya?"

---

### B. Reservation State

```text
AVAILABLE
HELD
```

Ini menjawab:

> "Apakah unit sedang dikunci sementara?"

---

### C. Assignment State

```text
UNASSIGNED
ASSIGNED
```

atau lebih baik sebenarnya assignment disimpan sebagai entity tersendiri.

Jadi kondisi:

```text
Fleet Status: ACTIVE
Reservation: AVAILABLE
Assignment: NONE
```

berarti:

> Armada tersedia.

Sedangkan:

```text
Fleet Status: ACTIVE
Reservation: HELD
Assignment: NONE
```

berarti:

> Armada sedang diinspeksi oleh rider.

Dan:

```text
Fleet Status: ACTIVE
Reservation: NONE
Assignment: R01
```

berarti:

> Armada sedang digunakan Rider 01.

---

# 3. Dengan ini lifecycle menjadi jauh lebih bersih

Secara konseptual:

```text
                    ┌──────────────┐
                    │    ACTIVE    │
                    └──────┬───────┘
                           │
                  ┌────────┴────────┐
                  ▼                 ▼
             AVAILABLE           MAINTENANCE
                  │
                  ▼
                HELD
                  │
           ┌──────┴──────┐
           ▼             ▼
        RELEASE        CLAIM
           │             │
           ▼             ▼
       AVAILABLE       IN USE
```

Tetapi jangan menganggap `IN_USE` sebagai fleet status.

Lebih tepat:

```text
Fleet:
ACTIVE

Reservation:
NONE

Assignment:
RIDER-001
```

---

# 4. "Claim Permanen" juga sebaiknya diubah

Kalimat:

> Rider mengklaim armada secara permanen.

Menurut saya kurang tepat.

Rider tidak **memiliki** armada tersebut secara permanen.

Dia hanya:

> **mengambil / menggunakan armada untuk operational session tertentu.**

Jadi:

```text
CLAIM ARMADA
```

lebih baik dimaknai:

```text
Create Fleet Assignment
```

Contoh:

```text
EBK-002
     ↓
Assigned to
Rider R-012
     ↓
Operational Session
01 Sep 2026
PAGI
```

Setelah selesai:

```text
Checkout
     ↓
Assignment CLOSED
     ↓
Armada kembali AVAILABLE
```

---

# 5. Ini penting untuk historical data

Jangan hanya punya:

```text
armadas.current_rider_id
```

Karena kamu akan kehilangan sejarah.

Misalnya:

```text
EBK-002
```

pernah digunakan:

```text
01 Sep → Rider A
02 Sep → Rider B
03 Sep → Rider C
```

Maka seharusnya ada:

```text
fleet_assignments
```

misalnya:

```text
fleet_assignments

id
armada_id
rider_id
operational_session_id
assigned_at
claimed_at
released_at
status
```

Dengan begitu:

```text
Armada
   │
   ├── Assignment #001 → Rider A
   ├── Assignment #002 → Rider B
   └── Assignment #003 → Rider C
```

Ini akan sangat membantu nanti untuk **Reports dan Audit**.

---

# 6. Hold 5 menit juga sebaiknya dianggap sebagai Reservation

Sekarang kamu menggunakan:

```text
reserved_by_rider_id
reserved_until
```

Konsepnya benar.

Tetapi saya sarankan jangan menganggap `RESERVED` sebagai status permanen armada.

Lebih tepat:

```text
Fleet Status
ACTIVE

Reservation
HELD
```

dengan data:

```text
reservation_id
armada_id
rider_id
created_at
expires_at
released_at
status
```

Status reservation:

```text
ACTIVE
CANCELLED
EXPIRED
CONVERTED
```

Ini membuat histori hold juga bisa dicatat.

---

# 7. Kenapa histori Hold penting?

Misalnya:

```text
Rider A
hold EBK-002
09:00
```

kemudian:

```text
09:04
cancel
```

Rider B:

```text
09:05
hold EBK-002
```

Kalau hanya mengubah:

```text
reserved_by_rider_id = NULL
```

histori hilang.

Padahal data itu bisa berguna untuk:

* audit
* mengetahui rider sering melakukan hold/cancel
* mengetahui armada sering gagal inspeksi
* analisis availability
* investigasi konflik claim

---

# 8. Rule paling penting: Hold ≠ Assignment

Ini harus eksplisit.

```text
HOLD
```

hanya berarti:

> "Rider sedang memiliki hak eksklusif sementara untuk melakukan inspeksi."

Belum berarti:

> "Rider sudah mendapatkan armada."

Flow:

```text
AVAILABLE
    ↓
HOLD
    ↓
Physical Inspection
    │
    ├── Reject
    │      ↓
    │   RELEASE
    │
    └── Accept
           ↓
        CLAIM
           ↓
      ASSIGNMENT
```

---

# 9. Saya juga akan ubah istilah "Reserved"

Untuk UX Rider:

```text
Tersedia
Sedang diperiksa
Digunakan
Perawatan
Tidak tersedia
```

Bukan:

```text
AVAILABLE
RESERVED
IN_USE
MAINTENANCE
```

Internal backend boleh tetap menggunakan enum teknis.

---

# 10. Rule ketika Maintenance

Ini juga perlu diperketat.

## Jika armada AVAILABLE

Boleh:

```text
AVAILABLE
   ↓
MAINTENANCE
```

langsung.

---

## Jika armada sedang HELD

Tidak boleh sembarangan:

```text
HELD
   ↓
MAINTENANCE
```

Karena rider sedang melakukan inspeksi.

Lebih baik:

```text
HELD
 ↓
Cancel Hold
 ↓
AVAILABLE
 ↓
MAINTENANCE
```

atau Admin melakukan **force maintenance** dengan alasan wajib dan audit.

---

## Jika armada sedang digunakan

```text
IN_USE
```

jangan langsung:

```text
IN_USE → MAINTENANCE
```

Lebih baik:

```text
IN_USE
   ↓
Report Damage
   ↓
Operational Session continues?
   │
   ├── YES → Replace Fleet
   │
   └── NO
         ↓
      Checkout
         ↓
      Inspection
         ↓
      MAINTENANCE
```

Ini jauh lebih realistis.

---

# 11. Kasus Rider melaporkan kerusakan

Saya sarankan tambahkan flow yang sekarang belum ada:

```text
RIDER
  │
  ▼
Report Problem
  │
  ├── Minor
  │
  └── Critical
```

Misalnya:

```text
EBK-002
Battery drops suddenly
```

Rider:

```text
[ Laporkan Kerusakan ]
```

Backend membuat:

```text
fleet_issue
```

kemudian Supervisor menentukan:

```text
Replace Fleet
Continue Operation
Send to Maintenance
```

Ini lebih baik daripada Rider atau Supervisor langsung mengubah status armada secara manual tanpa konteks.

---

# 12. Hold 5 menit: jangan bergantung pada Cron

Ini bagian teknis yang menurut saya perlu kamu improve.

Sekarang:

```text
Cron every 30 sec
      ↓
find expired reservation
      ↓
release
```

Boleh sebagai **cleanup mechanism**, tetapi jangan dijadikan satu-satunya sumber kebenaran.

Bayangkan:

```text
09:00:00 HOLD
expires = 09:05:00
```

Cron terakhir jalan:

```text
09:04:30
```

Cron berikutnya:

```text
09:05:30
```

Secara UI selama 30 detik:

```text
Armada masih terlihat HELD
```

Padahal seharusnya sudah bisa digunakan.

---

# 13. Gunakan Lazy Expiration

Ketika Rider B mencoba mengambil:

```text
EBK-002
```

backend melakukan:

```text
IF reservation.status = ACTIVE
AND expires_at > NOW()
    → REJECT
ELSE
    → reservation expired
    → allow new hold
```

Jadi expiration ditentukan berdasarkan:

```text
expires_at
```

bukan berdasarkan kapan cron terakhir berjalan.

Cron/worker hanya:

> membersihkan reservation yang sudah expired.

Ini lebih reliable.

---

# 14. Atomicity tetap wajib

Konsep SQL kamu sudah menuju arah yang benar.

Tetapi saya akan memperjelas rule:

> **Hanya satu rider yang boleh berhasil memperoleh hold terhadap satu armada pada satu waktu.**

Misalnya dua rider:

```text
R01 ─────┐
         ├──> EBK-002
R02 ─────┘
```

hasilnya harus:

```text
R01 → HOLD SUCCESS
R02 → 409 CONFLICT
```

bukan:

```text
R01 → SUCCESS
R02 → SUCCESS
```

Ini harus dijamin database, bukan hanya frontend.

---

# 15. UX Hold juga perlu sedikit diubah

Sekarang:

> Inspeksi & Kunci Unit (Hold 5 Mnt)

Saya lebih suka:

### Sebelum hold

```text
EBK-002

Status
Tersedia

[ Mulai Inspeksi ]
```

Setelah berhasil:

```text
EBK-002

Sedang Anda Inspeksi

04:32

Periksa kondisi:
✓ Ban
✓ Rem
✓ Baterai
✓ Cooler
✓ Perlengkapan

[ Armada Baik — Gunakan ]
[ Tolak Armada ]
```

Jadi timer bukan sekadar countdown.

Timer menjadi **contextual state**:

> "Kamu memiliki 4 menit 32 detik untuk menyelesaikan inspeksi."

---

# 16. Bahkan buat checklist inspeksi

Karena kamu sudah menyebut kondisi:

* ban
* baterai
* cooler
* kompor

maka sekalian jadikan business process.

```text
INSPEKSI ARMADA

Ban                 ✓
Rem                 ✓
Baterai             ✓
Cooler              ✓
Perlengkapan        ✓

Kondisi umum
○ Baik
○ Perlu perhatian
○ Rusak

Catatan
[....................]

[ Konfirmasi Armada ]
```

Ini membuat alasan **5 menit** menjadi jelas secara bisnis:

> bukan "5 menit untuk berebut gerobak", tetapi **5 menit untuk inspeksi sebelum assignment**.

Ini jauh lebih kuat untuk dokumentasi sistem.

---

# 17. Apa yang terjadi kalau timer habis ketika sedang mengisi checklist?

Rule harus eksplisit.

Misalnya:

```text
00:03
```

rider sedang mengisi catatan.

Timer:

```text
00:00
```

→ hold expired.

Kemudian tombol:

```text
Konfirmasi Armada
```

tidak boleh berhasil.

Backend harus tetap memvalidasi:

```text
reservation.status
expires_at
rider_id
armada_id
```

Jika expired:

```text
409 RESERVATION_EXPIRED
```

UI:

```text
Masa inspeksi telah berakhir.

Armada ini tidak lagi dikunci untuk Anda.

[ Kembali ke Daftar Armada ]
```

---

# 18. Jangan izinkan "claim" tanpa hold

Rule:

> Rider hanya dapat melakukan claim terhadap armada yang sedang di-hold oleh dirinya sendiri dan reservation masih valid.

Artinya:

```text
R01
   ↓
Claim EBK-002
```

Backend harus memastikan:

```text
armada = EBK-002
AND
hold.rider = R01
AND
hold.status = ACTIVE
AND
hold.expires_at > NOW()
```

Kalau tidak:

```text
403 / 409
```

---

# 19. Hubungkan dengan Zone dan Operational Session

Karena sebelumnya kita sudah membahas Zone, saya akan membuat dependency:

```text
Rider
  ↓
Operational Session
  ↓
Zone Assignment
  ↓
Fleet Assignment
```

Jangan:

```text
Rider → Claim Fleet
```

tanpa konteks operasional.

Idealnya:

```text
Rider R01
     │
     ▼
Session: PAGI
     │
     ▼
Zone: Sidoarjo Barat
     │
     ▼
Fleet Selection
     │
     ▼
EBK-002
```

Sehingga database bisa menjawab:

> "Armada EBK-002 digunakan siapa, pada zona mana, pada sesi apa?"

---

# 20. Ada satu business rule tambahan: satu Rider satu Armada per Session

Saya sangat menyarankan:

> Dalam satu operational session, satu rider hanya dapat memiliki satu armada aktif.

Dan:

> Satu armada hanya dapat digunakan oleh satu rider aktif pada satu operational session.

Sehingga:

```text
R01 → Session Pagi → EBK-002
```

valid.

Tetapi:

```text
R01 → EBK-002
R01 → EBK-003
```

secara bersamaan:

❌ invalid.

Dan:

```text
R01 → EBK-002
R02 → EBK-002
```

❌ invalid.

---

# 21. Flow baru yang saya rekomendasikan

## Master Armada

```text
Create Armada
     ↓
ACTIVE
     ↓
AVAILABLE
```

---

## Hold

```text
AVAILABLE
     ↓
Start Inspection
     ↓
Atomic Hold
     ↓
HELD
     ↓
5-minute timer
```

Kemudian:

```text
HELD
 ├───────────────┐
 │               │
 ▼               ▼
Cancel         Expired
 │               │
 └───────┬───────┘
         ▼
     AVAILABLE
```

atau:

```text
HELD
  ↓
Inspection Passed
  ↓
CLAIM
  ↓
Fleet Assignment CREATED
  ↓
IN USE
```

---

# 22. Checkout

Jangan:

```text
IN_USE → AVAILABLE
```

begitu saja.

Flow:

```text
IN USE
   ↓
End Operational Session
   ↓
Fleet Return
   ↓
Physical Inspection
   │
   ├── Good
   │     ↓
   │  AVAILABLE
   │
   └── Damaged
         ↓
      MAINTENANCE
```

Ini lebih kuat.

---

# 23. Final state machine

Saya akan dokumentasikan kira-kira seperti ini:

```text
                       ┌──────────────┐
                       │    ACTIVE    │
                       └──────┬───────┘
                              │
                              ▼
                       ┌──────────────┐
                       │  AVAILABLE   │
                       └──────┬───────┘
                              │
                       Start Inspection
                              │
                              ▼
                       ┌──────────────┐
                       │     HELD     │
                       │   5 MINUTES  │
                       └──────┬───────┘
                         ┌────┴────┐
                         │         │
                     Expired    Confirm
                         │         │
                         ▼         ▼
                    AVAILABLE   ASSIGNED
                                   │
                                   ▼
                                IN USE
                                   │
                              End Session
                                   │
                                   ▼
                              INSPECTION
                              ┌────┴────┐
                              │         │
                            Good     Damaged
                              │         │
                              ▼         ▼
                         AVAILABLE  MAINTENANCE
                                         │
                                    Repair Complete
                                         │
                                         ▼
                                      AVAILABLE

ACTIVE
  │
  ▼
RETIRED
```

Perhatikan bahwa **MAINTENANCE bukan jalur normal dari IN_USE tanpa proses return/inspection**.

---

# 24. Business Rules yang saya sarankan

Masukkan minimal ini ke dokumen:

### BR-FLEET-01 — Unique Fleet Identity

Setiap armada memiliki kode unik dan tidak dapat digunakan oleh lebih dari satu unit.

### BR-FLEET-02 — Fleet Availability

Armada hanya dapat dipilih rider apabila status administratifnya `ACTIVE` dan tidak sedang digunakan, di-hold, atau maintenance.

### BR-FLEET-03 — Exclusive Hold

Satu armada hanya dapat memiliki satu active hold pada waktu yang sama.

### BR-FLEET-04 — Hold Duration

Hold berlaku maksimal 5 menit sejak reservation berhasil dibuat.

### BR-FLEET-05 — Lazy Expiration

Status hold dianggap expired berdasarkan `expires_at`; background worker hanya berfungsi sebagai mekanisme cleanup.

### BR-FLEET-06 — Claim Authorization

Rider hanya dapat melakukan claim terhadap armada yang sedang di-hold olehnya dan belum expired.

### BR-FLEET-07 — One Fleet per Session

Seorang rider hanya dapat memiliki satu armada aktif dalam satu operational session.

### BR-FLEET-08 — One Rider per Fleet

Satu armada hanya dapat memiliki satu active fleet assignment dalam satu operational session.

### BR-FLEET-09 — Maintenance Protection

Armada maintenance tidak dapat di-hold, di-claim, atau di-assignment.

### BR-FLEET-10 — Active Assignment Protection

Armada yang sedang digunakan tidak dapat dihapus, di-maintenance, atau di-assignment kepada rider lain.

### BR-FLEET-11 — Fleet Return Inspection

Armada yang selesai digunakan harus melalui proses return/inspection sebelum kembali `AVAILABLE` atau masuk `MAINTENANCE`.

### BR-FLEET-12 — Historical Assignment

Assignment armada tidak dihapus secara permanen karena menjadi bagian dari histori operasional.

---

## 25. Dan ada satu hal yang menurut saya perlu kamu tanyakan ke stakeholder

**"5 menit" adalah business rule yang sangat spesifik.**

Sama seperti **Buffer Operasional 12 KM**, jangan menganggap angka itu sebagai kebenaran bisnis hanya karena sudah tertulis di rancangan.

Yang perlu dikonfirmasi:

> **Berapa lama rider diberi waktu untuk melakukan inspeksi fisik dan mengunci armada sebelum reservation otomatis dilepaskan?**

Pilihan awal bisa kamu ajukan:

```text
5 menit
10 menit
15 menit
```

Tetapi **angka final harus berasal dari proses bisnis**, bukan dari asumsi developer.

Hal yang sama untuk:

* apakah semua armada harus melalui inspeksi?
* apakah hold hanya boleh dilakukan ketika rider sudah berada di Central Hub?
* apakah rider harus berada dalam radius tertentu dari Hub untuk melakukan hold?
* apakah satu rider boleh mengganti armada setelah claim?
* siapa yang boleh memaksa-release hold?
* siapa yang boleh memindahkan armada ke maintenance?
* apakah armada yang rusak di tengah sesi harus langsung diganti?
* apakah ada batas jumlah armada cadangan di Hub?

Ini akan menentukan flow final.

**Secara arsitektur, improvement terbesar yang saya rekomendasikan adalah memisahkan `Fleet Status`, `Reservation/Hold`, dan `Fleet Assignment`.** Dengan itu, hubungan Armada ↔ Rider ↔ Operational Session menjadi jauh lebih konsisten, dan nanti integrasi ke **LBS, Zone, Dashboard, Reports, Audit, dan Redis/worker** tidak perlu dipaksa mengikuti satu kolom `status` yang memuat terlalu banyak makna.
