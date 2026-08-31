# Spesifikasi UI/UX: Management Dashboard (`/management/dashboard`)

Dokumen ini merancang antarmuka **Executive & Business Overview Dashboard** untuk peran Management. Dashboard ini berfokus pada efisiensi operasional bisnis, pendapatan penjualan, utilisasi aset armada, dan performa katalog tanpa detail teknis algoritma kalkulasi DSS.

---

## 1. Audit Endpoint & Data Contract

| Properti | Detail |
| :--- | :--- |
| **Endpoint Summary** | `GET /api/dashboard/summary` |
| **Endpoint Sales Trend** | `GET /api/dashboard/sales-trend?range=7d` |
| **Endpoint Product Performance**| `GET /api/dashboard/product-performance` |
| **Status Audit** | ✅ Seluruh endpoint aktif di backend `dashboardRoutes.js` (RBAC: `MANAGEMENT`) |
| **Batasan Role** | ❌ Tidak menampilkan intermediate BWM Consistency Ratio teknis |

### Response Payload Summary (`GET /api/dashboard/summary`):
```json
{
  "success": true,
  "data": {
    "users": { "total": 128, "activeRiders": 42, "supervisors": 6 },
    "fleet": { "total": 50, "inUse": 38, "available": 8, "utilizationRate": 76.0 },
    "salesToday": { "totalAmount": 18450000, "totalCups": 1230, "targetAchievement": 92.2 },
    "topProducts": [
      { "name": "Kopi Susu Gula Aren", "cupsSold": 640, "revenue": 11520000 },
      { "name": "Americano Dingin", "cupsSold": 310, "revenue": 4650000 }
    ]
  }
}
```

---

## 2. Wireframe Struktur Visual (ASCII Layout)

```text
+---------------------------------------------------------------------------------------------------+
| TOP BAR: [Logo COZIS]  | Search (Ctrl+K)              | [Notifikasi (2)] | [Avatar: Management]   |
+---------------------------------------------------------------------------------------------------+
| SIDEBAR      | BUSINESS OVERVIEW DASHBOARD (MANAGEMENT)                                           |
|              |                                                                                   |
| [•] Dashboard| [ Stat Card 1 ]     [ Stat Card 2 ]     [ Stat Card 3 ]     [ Stat Card 4 ]       |
| [ ] User     | Pendapatan Hari Ini Utilisasi Armada   Rider Bertugas Hari  Pencapaian Target     |
| [ ] Armada   | Rp 18.450.000       76% (38/50 Unit)    42 Rider Aktif      92.2% (Target 20 Jt)  |
| [ ] Katalog  | [▲ +12.4% vs kemar] [8 Standby di Hub]  [3 Belum Check-in]  [█████████▒ 92%]      |
| [ ] Map      +-----------------------------------------------------------------------------------+
| [ ] Laporan  | MAIN GRID (2 Kolom 8:4)                                                           |
|              | +----------------------------------------------+ +--------------------------------+ |
|              | | PERFORMA PENJUALAN MINGGUAN                  | | PRODUK TERLARIS (TOP SALES)    | |
|              | | [Filter: 7 Hari | 30 Hari | Kuartal Ini]     | | 1. Kopi Susu Aren (640 Cup)    | |
|              | |                                              | |    Rp 11.520.000 [62% Share]   | |
|              | |   [ Bar Chart: Omzet Harian vs Target ]      | | 2. Americano Dingin (310 Cup)  | |
|              | |                                              | |    Rp 4.650.000 [25% Share]    | |
|              | |                                              | | 3. Matcha Latte (180 Cup)      | |
|              | |                                              | |    Rp 2.280.000 [13% Share]    | |
|              | +----------------------------------------------+ +--------------------------------+ |
|              | +-------------------------------------------------------------------------------+ |
|              | | RINGKASAN EFISIENSI ARMADA & KETERSEDIAAN ASET                                | |
|              | | Total Unit: 50 | Siap Jalan: 8 | Beroperasi: 38 | Maintenance: 4              | |
|              | +-------------------------------------------------------------------------------+ |
+---------------------------------------------------------------------------------------------------+
```

---

## 3. Spesifikasi Komponen & Design Tokens

1. **Revenue Focus Cards**:
   - Menampilkan total omzet dengan format mata uang Rupiah besar, dilengkapi persentase pencapaian target harian (*Progress bar* warna `#FF634A`).
2. **Katalog Contribution Breakdown**:
   - Donut Chart / Progress bar list yang menunjukkan kontribusi tiap kategori produk terhadap omzet harian.
