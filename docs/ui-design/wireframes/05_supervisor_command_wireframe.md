# Wireframe Blueprint: Supervisor Operational Command Suite (Fase 5)

Dokumen ini mendefinisikan antarmuka khusus peran **Supervisor** sebagai komandan operasional harian Hub Surabaya:
- Eksekusi Perhitungan TOPSIS & Pemilihan Rekomendasi Zona.
- Antrean FIFO Presensi Rider & Plotting Zona Harian.
- Penanganan Insiden Darurat (*Emergency Swap Modal*).
- Verifikasi Akhir Settlement Kas & Pengembalian Gerobak.

---

## 1. Wireframe: Eksekusi TOPSIS & Plotting Alokasi (`/distribution`)

```text
+---------------------------------------------------------------------------------------------------+
| [Supervisor Command]  DISTRIBUSI ARMADA & PLOTTING HARIAN               [ ⚡ Hitung Ulang TOPSIS ]|
+---------------------------------------------------------------------------------------------------+
|  STATUS OPERASIONAL SHIFT PAGI:                                                                   |
|  - Total Rider Hadir Apel : 12 Rider (Antrean FIFO Aktif)                                         |
|  - Total Zona Aktif       : 4 Zona Operasional Surabaya                                           |
|                                                                                                   |
|  HASIL EVALUASI SPK TOPSIS (NILAI PREFERENSI C_i):                                                |
|  +--------------------------------+-----------------+-------------+-----------------------------+ |
|  | Peringkat & Zona               | Nilai Kedekatan | Kuota Zona  | Status Rekomendasi          | |
|  +--------------------------------+-----------------+-------------+-----------------------------+ |
|  | 🥇 1. Zona 01 - Gubeng GC      | C_i = 0.842     | 4 Rider     | [⭐ Rekomendasi Utama]      | |
|  | 🥈 2. Zona 02 - Tunjungan      | C_i = 0.765     | 5 Rider     | [⭐ Rekomendasi Tinggi]     | |
|  | 🥉 3. Zona 04 - Wonokromo      | C_i = 0.612     | 3 Rider     | [Cukup Optimal]             | |
|  |    4. Zona 03 - Rungkut        | C_i = 0.435     | 2 Rider     | [Potensi Rendah / Standby]  | |
|  +--------------------------------+-----------------+-------------+-----------------------------+ |
|                                                                                                   |
|  ALOKASI PENUGASAN RIDER (FIFO QUEUE COMMIT):                                                     |
|  +-----------------------+---------------------+-------------------+----------------------------+ |
|  | Nama Rider (Queue #)  | Jam Apel Hadir      | Zona Ditugaskan   | Aksi Penyesuaian           | |
|  +-----------------------+---------------------+-------------------+----------------------------+ |
|  | 1. Ahmad Fadillah     | 06:05:12 (Antrean 1)| Zona 01 - Gubeng  | [Ganti Zona] [Swap Darurat]| |
|  | 2. Budi Darmawan      | 06:08:44 (Antrean 2)| Zona 01 - Gubeng  | [Ganti Zona] [Swap Darurat]| |
|  | 3. Choky Pratama      | 06:10:02 (Antrean 3)| Zona 02 - Tunjung.| [Ganti Zona] [Swap Darurat]| |
|  +-----------------------+---------------------+-------------------+----------------------------+ |
|                                                                                                   |
|  [  ✔️ Commit & Publikasikan Hasil Plotting ke Seluruh Rider Lapangan  ]                          |
+---------------------------------------------------------------------------------------------------+
```

---

## 2. Wireframe: Emergency Swap Modal (Handover Mid-Shift)

```text
+---------------------------------------------------------------------------------------------------+
|                                  +--------------------------------------+                         |
|                                  | ⚠️ OPERASI PENUKARAN DARURAT (SWAP)  |                         |
|                                  | Serah Terima Penugasan di Lapangan   |                         |
|                                  |--------------------------------------|                         |
|                                  | Rider Mengalami Kendala:             |                         |
|                                  | Ahmad Fadillah (Zona 01 - Gubeng)    |                         |
|                                  |                                      |                         |
|                                  | Alasan Insiden Darurat:              |                         |
|                                  | [ Ban Gerobak Bocor (FLAT_TIRE)    v ]|                         |
|                                  |                                      |                         |
|                                  | Pilih Rider Pengganti (Standby):     |                         |
|                                  | [ Doni Pratama (Antrean Standby)   v ]|                         |
|                                  |                                      |                         |
|                                  | Catatan Serah Terima:                |                         |
|                                  | [ Gerobak dipindahkan ke Doni di... ]|                         |
|                                  |                                      |                         |
|                                  | [ Batal ]  [  Eksekusi Swap Darurat ]|                         |
|                                  +--------------------------------------+                         |
+---------------------------------------------------------------------------------------------------+
```
