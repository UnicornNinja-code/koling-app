# Wireframe Blueprint: Rider Mobile PWA Full-Screen Step Pages (Fase 6)

Dokumen ini mendefinisikan rancangan antarmuka khusus **Rider Lapangan** dalam viewport mobile adaptif (*375px - 430px*) berbasis *Full-Screen Step Pages* yang bebas dari jebakan modal bertingkat.

---

## 1. Langkah 1: Presensi Apel Pagi (`/rider/duty`)

```text
+-------------------------------------------------+
| [<-]       LANGKAH 1 DARI 5       [ (1) Step ]  |
|          Presensi & Plotting Zona               |
+-------------------------------------------------+
|  [⏰ SESI SHIFT HARI INI: PAGI]    [🟢 AKTIF]   |
|                                                 |
|  +-------------------------------------------+  |
|  | Konfirmasi Kehadiran Tugas                |  |
|  | Daftarkan diri ke antrean apel pagi       |  |
|  | sebelum batas waktu ditutup.              |  |
|  |                                           |  |
|  | [✔️] Standar jam kehadiran shift          |  |
|  | [✔️] Alokasi diproses otomatis via TOPSIS |  |
|  |                                           |  |
|  | [  Konfirmasi Hadir Siap Bertugas ✨  ]   |  |
|  +-------------------------------------------+  |
|                                                 |
|  (State Berubah Saat Supervisor Commit Alokasi):|
|  +-------------------------------------------+  |
|  | [✔️ SUDAH DI-PLOT KE ZONA]   [FIFO OK]    |  |
|  | Zona Penugasan Anda:                      |  |
|  | 📍 Zona 01 - Gubeng Grand City            |  |
|  |                                           |  |
|  | [ Lanjut Langkah 2: Klaim Armada -> ]     |  |
|  +-------------------------------------------+  |
+-------------------------------------------------+
```

---

## 2. Langkah 2: Inspeksi & Klaim Armada Hub (`/rider/armada`)

```text
+-------------------------------------------------+
| [<-]       LANGKAH 2 DARI 5       [ (2) Step ]  |
|          Inspeksi & Klaim Gerobak Hub           |
+-------------------------------------------------+
|  +-------------------------------------------+  |
|  | ⏱️ KUNCI UNIT SEMENTARA: 02:45            |  |
|  | [========================-------------]   |  |
|  | Unit ARM-GB-001 terkunci untuk Anda.      |  |
|  | Selesaikan checklist fisik sebelum habis! |  |
|  +-------------------------------------------+  |
|                                                 |
|  CHECKLIST KELAYAKAN FISIK GEROBAK:             |
|  [X] Baterai >= 80% (Indikator Normal)          |
|  [X] Rem Depan & Belakang Pakem & Aman          |
|  [X] Tekanan Angin & Kondisi Roda Prima         |
|  [X] Box Es / Cooler & Insulasi Dingin Siap     |
|  [X] Kebersihan & Sanitasi Gerobak Terjaga      |
|                                                 |
|  Catatan Awal (Opsional):                       |
|  [ Kondisi bodi prima, lampu siap             ] |
|                                                 |
|  [ Lepas Kunci ]   [  Klaim Resmi (IN_USE) ✔️ ] |
+-------------------------------------------------+
```

---

## 3. Langkah 3: Validasi Geofence GPS Satelit (`/rider/checkin`)

```text
+-------------------------------------------------+
| [<-]       LANGKAH 3 DARI 5       [ (3) Step ]  |
|            Validasi Geofence GPS                |
+-------------------------------------------------+
|  ZONA PENUGASAN TARGET:                         |
|  📍 Zona 01 - Gubeng Grand City   [BUFFER ±50M] |
|                                                 |
|  SINYAL GPS SATELIT:             [🔄 Refresh]   |
|  +-----------------------+--------------------+ |
|  | LATITUDE: -7.260541   | LONGITUDE: 112.751 | |
|  +-----------------------+--------------------+ |
|  Akurasi Sinyal: ±12 meter (Toleransi ±50m)     |
|                                                 |
|  (Jika Posisi Masih di Luar Poligon Zona):      |
|  +-------------------------------------------+  |
|  | ⚠️ Di Luar Wilayah Poligon Zona!          |  |
|  | [ Kurang ±85 meter lagi ke batas zona ]   |  |
|  +-------------------------------------------+  |
|                                                 |
|  (Jika Sudah Masuk Buffer Zona):                |
|  +-------------------------------------------+  |
|  | [✔️ CHECK-IN BERHASIL]                     |  |
|  | Kehadiran spasial tervalidasi di zona!    |  |
|  | [ Lanjut Langkah 4: Buka Kasir POS -> ]   |  |
|  +-------------------------------------------+  |
+-------------------------------------------------+
```

---

## 4. Langkah 4: Kasir Penjualan Lapangan POS (`/rider/pos`)

```text
+-------------------------------------------------+
| [<-]       LANGKAH 4 DARI 5       [🟢 ONLINE]   |
|            Kasir POS Lapangan                   |
+-------------------------------------------------+
|  PILIH MENU KOPI:                               |
|  +-------------------------------------------+  |
|  | Kopi Susu Gula Aren     Rp 18.000         |  |
|  | [ - ]  [ 2 ]  [ + ]                       |  |
|  |-------------------------------------------|  |
|  | Americano Dingin        Rp 15.000         |  |
|  | [ - ]  [ 1 ]  [ + ]                       |  |
|  +-------------------------------------------+  |
|                                                 |
|  METODE PEMBAYARAN:                             |
|  [ 💵 Tunai (CASH) ]      [ 📱 QRIS Dinamis ]   |
|                                                 |
|  (Opsi Tunai):                                  |
|  Total: Rp 51.000 | Uang Diterima: [Rp 100.000] |
|  Kembalian: Rp 49.000                           |
|                                                 |
|  (Opsi QRIS):                                   |
|  ⏱️ 175s | [ Dynamic QR Code Card ID10203040 ] |
|                                                 |
|  [  Simpan Penjualan (Idempotency Key) 🛒  ]   |
|                                                 |
|  [ Selesaikan Shift Hari Ini & Settlement -> ]  |
+-------------------------------------------------+
```

---

## 5. Langkah 5: Settlement Kas & Setor Gerobak (`/rider/settlement`)

```text
+-------------------------------------------------+
| [<-]       LANGKAH 5 DARI 5       [ (5) Step ]  |
|        Settlement Kas & Setor Gerobak           |
+-------------------------------------------------+
|  1. SISA BATERAI PENGEMBALIAN GEROBAK:          |
|  [===========-------------------] 28%           |
|  ⚠️ Baterai < 30%. Otomatis diarahkan ke        |
|     status [🟡 CHARGING] di docking Hub.        |
|                                                 |
|  2. SISA STOK CUP KOPI:                         |
|  Stok awal 20 cup - 13 cup terjual              |
|  Sisa Fisik: [ 7 ] Cup                          |
|                                                 |
|  3. REKONSILIASI KAS PENJUALAN:                 |
|  Total Penjualan Sistem: Rp 195.000             |
|  Kas Fisik Disetor     : [Rp 195.000]           |
|  Status Selisih        : [✔️ Pas (Rp 0)]        |
|                                                 |
|  (Jika Ada Selisih):                            |
|  Alasan Selisih Kas: [ Penjelasan selisih...  ] |
|                                                 |
|  [   Tutup Shift & Setor Gerobak ke Hub 🔒  ]   |
+-------------------------------------------------+
```
