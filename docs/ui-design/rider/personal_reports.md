# Spesifikasi UI/UX: Rider - Riwayat Shift & Performa Pribadi

Dokumen ini merancang antarmuka **Personal Sales History, Attendance, & Performance Reports** untuk Rider.

---

## 1. Audit Endpoint & Data Contract

| Properti | Detail |
| :--- | :--- |
| **Get My Sales History** | `GET /api/sales/my-sales` |
| **Get Duty History** | `GET /api/distribution/my-history` |
| **Status Audit** | ✅ Seluruh endpoint aktif di backend (RBAC: `RIDER`) |

---

## 2. Wireframe Struktur Visual (ASCII Layout)

```text
+-------------------------------------------------------------+
|  < KEMBALI                       RIWAYAT KERJA & PENJUALAN  |
+-------------------------------------------------------------+
|  RINGKASAN TOTAL BULAN INI (AGUSTUS 2026)                   |
|  +---------------------------+ +-------------------------+  |
|  | Total Cup Terjual         | | Total Hari Bertugas     |  |
|  | 1.120 Cup                 | | 24 Hari                 |  |
|  | Estimasi Insentif: 1.2 Jt | | Rata-rata: 46.6 Cup/hari|  |
|  +---------------------------+ +-------------------------+  |
|                                                             |
|  DAFTAR RIWAYAT SHIFT HARIAN                                |
|  +-------------------------------------------------------+  |
|  | 📅 Selasa, 25 Agustus 2026 (Hari Ini)                 |  |
|  | Zona: Sudirman CBD | Armada: B 1234 COZ              |  |
|  | Penjualan: 45 Cup (Rp 720.000)                        |  |
|  | Jam Kerja: 07:15 - Sekarang [SEDANG BERJALAN]         |  |
|  +-------------------------------------------------------+  |
|  +-------------------------------------------------------+  |
|  | 📅 Senin, 24 Agustus 2026                            |  |
|  | Zona: Kuningan Mega | Armada: B 5678 COZ              |  |
|  | Penjualan: 48 Cup (Rp 768.000)                        |  |
|  | Jam Kerja: 07:10 - 15:30 WIB [SELESAI]                |  |
|  +-------------------------------------------------------+  |
+-------------------------------------------------------------+
```
