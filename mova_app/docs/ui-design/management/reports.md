# Spesifikasi UI/UX: Management - Laporan Bisnis & Penjualan (`/reports`)

Dokumen ini merancang antarmuka **Management & Business Analytics Reports** untuk Management.

---

## 1. Audit Endpoint & Data Contract

| Domain Laporan | Endpoint Backend |
| :--- | :--- |
| **Sales Analytics** | `GET /api/sales/overview` |
| **Product Performance** | `GET /api/dashboard/product-performance` |
| **Fleet Utilization** | `GET /api/armadas` |
| **Status Audit** | ✅ Seluruh endpoint aktif di backend (RBAC: `MANAGEMENT`) |
| **Batasan Role** | ❌ Tidak menampilkan audit sistem teknis / BWM raw matrix |

---

## 2. Wireframe Struktur Visual (ASCII Layout)

```text
+---------------------------------------------------------------------------------------------------+
| TOP BAR: [Logo COZIS]  | Laporan Manajemen > Laporan Finansial & Bisnis          | [Avatar: Mgmt] |
+---------------------------------------------------------------------------------------------------+
| SIDEBAR      | PUSAT LAPORAN BISNIS                                                               |
|              |                                                                                   |
| [ ] Dashboard| [Tab: Laporan Penjualan] [Tab: Performa Menu/Produk] [Tab: Utilisasi Aset]        |
| [ ] User     +-----------------------------------------------------------------------------------+
| [ ] Armada   | FILTER & EKSPOR LAPORAN                                                           |
| [ ] Katalog  | Periode: [ 01/08/2026 - 25/08/2026 v ]  Zona: [ Semua v ]  [ EKSPOR EXCEL (.XLSX) ] |
| [ ] Map      +-----------------------------------------------------------------------------------+
| [•] Laporan  | TABEL RINGKASAN FINANSIAL & PENJUALAN                                             |
|              | +-------------------------------------------------------------------------------+ |
|              | | Tanggal    | Total Omzet    | Total Cup  | Rata-rata per Rider | Top Product   | |
|              | +-------------------------------------------------------------------------------+ |
|              | | 25/08/2026 | Rp 18.450.000  | 1.230 cup  | Rp 439.285 / rider  | Kopi Aren     | |
|              | | 24/08/2026 | Rp 16.800.000  | 1.120 cup  | Rp 420.000 / rider  | Kopi Aren     | |
|              | | 23/08/2026 | Rp 19.200.000  | 1.280 cup  | Rp 436.363 / rider  | Americano     | |
|              | +-------------------------------------------------------------------------------+ |
+---------------------------------------------------------------------------------------------------+
```
