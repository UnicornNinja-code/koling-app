# Spesifikasi UI/UX: Rider - Dashboard Shift Mobile PWA (`/rider/zone`)

Dokumen ini merancang antarmuka **Mobile-First Rider Shift Dashboard** untuk Rider. Tampilan ini didesain ringkas, fokus, ramah sentuhan, dan optimal untuk layar smartphone PWA tanpa informasi teknis rumit.

---

## 1. Audit Endpoint & Data Contract

| Properti | Detail |
| :--- | :--- |
| **Get Active Session** | `GET /api/rider/active-session` |
| **Duty Confirmation** | `POST /api/distribution/duty-confirm` |
| **Get My Sales Today** | `GET /api/sales/my-sales` |
| **Status Audit** | ✅ Seluruh endpoint aktif di backend `riderOperationalRoutes.js`, `distributionRoutes.js`, `salesRoutes.js` (RBAC: `RIDER`) |
| **PWA Requirements** | Touch target min 44×44px, Safe area top & bottom insets |

---

## 2. Wireframe Struktur Visual Mobile PWA (ASCII Layout)

```text
+-------------------------------------------------------------+
|  STATUS BAR (WiFi / Baterai / Jam) [Safe Area Top]          |
|  +-------------------------------------------------------+  |
|  | [Avatar] Budi Santoso               [● ONLINE - AKTIF]|  |
|  | Rider Lapangan • Shift Pagi                           |  |
|  +-------------------------------------------------------+  |
|                                                             |
|  KARTU STATUS TUGAS HARI INI                                |
|  +-------------------------------------------------------+  |
|  | ZONA PENUGASAN SAYA                                   |  |
|  | 📍 Sudirman Central CBD (Zona #1)                     |  |
|  | Status: [ CHECKED-IN - SEDANG BEROPERASI ]            |  |
|  |                                                       |  |
|  | Armada: B 1234 COZ (Box Supra 150)                    |  |
|  | Jam Mulai: 07:15 WIB (Durasi: 3j 45m)                 |  |
|  +-------------------------------------------------------+  |
|                                                             |
|  RINGKASAN PENJUALAN SAYA HARI INI                          |
|  +---------------------------+ +-------------------------+  |
|  | Cup Terjual               | | Total Penjualan         |  |
|  | 45 Cup                    | | Rp 720.000              |  |
|  | Target: 50 Cup (90%)      | | Tunai: 400k | QRIS: 320k|  |
|  +---------------------------+ +-------------------------+  |
|                                                             |
|  AKSI CEPAT OPERASIONAL (BIG BUTTONS)                       |
|  +-------------------------------------------------------+  |
|  | [ + CATAT PENJUALAN KOPI BARU (POS) ]                 |  |
|  | Background: #FF634A | Teks: #FFFFFF | Tinggi: 52px    |  |
|  +-------------------------------------------------------+  |
|  +-------------------------------------------------------+  |
|  | [ 🗺️ BUKA PETA NAVIGASI & GEOFENCE ]                   |  |
|  | Background: #FFFFFF | Border: #D2D2D4 | Tinggi: 48px   |  |
|  +-------------------------------------------------------+  |
|                                                             |
|  ─────────────────────────────────────────────────────────  |
|  BOTTOM NAVIGATION (PWA STICKY FOOTER)                      |
|  [ 🏠 Beranda ]  [ 📋 Absensi ]  [ 🛵 Armada ]  [ 📊 Laporan ]|
+-------------------------------------------------------------+
```

---

## 3. Spesifikasi Komponen & Design Tokens

1. **Top Header**:
   - Menampilkan sapaan nama rider, foto profil, dan pill status operasional (`STANDBY`, `CLAIMING_ARMADA`, `OTW`, `CHECKED_IN`).
2. **Main Big Action**:
   - Tombol "Catat Penjualan Kopi Baru" menggunakan warna primer `var(--color-primary)` (`#FF634A`), tinggi 52px dengan efek tactile press responsif.
3. **PWA Bottom Navigation Bar**:
   - Ketinggian 64px + `var(--safe-area-bottom)`, background putih dengan top border `1px solid #D2D2D4`.
