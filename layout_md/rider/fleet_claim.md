# Spesifikasi UI/UX: Rider - Alur Klaim & Pengembalian Armada (`/fleet`)

Dokumen ini merancang antarmuka **Fleet Claim, Inspection Hold, & Return Flow** untuk Rider.

---

## 1. Audit Endpoint & Data Contract

| Properti | Detail |
| :--- | :--- |
| **Get Hub Armadas** | `GET /api/rider/hub-armadas` (Menandai unit claimable vs faded out) |
| **Hold Armada Unit** | `POST /api/rider/hold-armada` (Ticket-booking lock: 5 menit temporary hold) |
| **Cancel Hold** | `POST /api/rider/cancel-hold-armada` |
| **Confirm Claim** | `POST /api/rider/claim-armada` (Status armada berubah menjadi `IN_USE`) |
| **Return Armada** | `POST /api/rider/checkout` (Input odometer akhir & kembalikan ke Hub) |
| **Status Audit** | ✅ Seluruh endpoint aktif di backend `riderOperationalRoutes.js` (RBAC: `RIDER`) |

---

## 2. Wireframe Struktur Visual (ASCII Layout)

### Tahap 1: Pilih Unit di Hub
```text
+-------------------------------------------------------------+
|  PILIH ARMADA DI HUB PUSAT COZIS                            |
+-------------------------------------------------------------+
|  Unit Siap Pakai Hari Ini: 8 Motor Box                      |
|                                                             |
|  +-------------------------------------------------------+  |
|  | [🛵] Plat: B 1234 COZ          [ PILIH & INSPEKSI ]   |  |
|  | Honda Supra GTR Mod Box | Odo: 12.450 km              |  |
|  +-------------------------------------------------------+  |
|  +-------------------------------------------------------+  |
|  | [🛵] Plat: B 5678 COZ          [ PILIH & INSPEKSI ]   |  |
|  | Honda Supra GTR Mod Box | Odo: 8.210 km               |  |
|  +-------------------------------------------------------+  |
|  +-------------------------------------------------------+  |
|  | [🛵] Plat: B 9999 COZ (DIPILIH RIDER LAIN / HOLD 3m)  |  |
|  | [○ Terkunci Sementara - Faded Out ]                   |  |
|  +-------------------------------------------------------+  |
+-------------------------------------------------------------+
```

### Tahap 2: Inspeksi & Konfirmasi Klaim (Hold Timer 5 Menit)
```text
+-------------------------------------------------------------+
|  INSPEKSI ARMADA: B 1234 COZ                                |
|  [⏱️ Sisa Waktu Kunci: 04:32 ]                               |
+-------------------------------------------------------------+
|  Periksa Kelengkapan Fisik:                                 |
|  [✓] Mesin Espresso & Grinder berfungsi                     |
|  [✓] Tabung Gas & Aki terisi penuh                          |
|  [✓] Box Bersih & Higienis                                  |
|                                                             |
|  Konfirmasi Angka Odometer Awal                             |
|  [ 12450                                             ] km   |
|                                                             |
|  +-------------------------------------------------------+  |
|  |         [ KONFIRMASI KLAIM & AMBIL MOTOR ]            |  |
|  |    Background: #FF634A | Teks: #FFF | Tinggi: 50px    |  |
|  +-------------------------------------------------------+  |
|  [ Batal & Pilih Unit Lain ]                                |
+-------------------------------------------------------------+
```
