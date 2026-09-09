# Spesifikasi UI/UX: Management - Manajemen Katalog & Penentuan Harga (`/catalog`)

Dokumen ini merancang antarmuka **Product Catalog, Pricing, & Menu Availability** untuk Management.

---

## 1. Audit Endpoint & Data Contract

| Properti | Detail |
| :--- | :--- |
| **Get Products** | `GET /api/products` |
| **Create Product** | `POST /api/products` |
| **Update Product & Price** | `PUT /api/products/:id` |
| **Toggle Status (Available/Out)** | `PATCH /api/products/:id/status` |
| **Delete Product** | `DELETE /api/products/:id` |
| **Status Audit** | ✅ Seluruh endpoint aktif di backend `productRoutes.js` (RBAC: `MANAGEMENT`, `SUPERADMIN`) |

---

## 2. Wireframe Struktur Visual (ASCII Layout)

```text
+---------------------------------------------------------------------------------------------------+
| TOP BAR: [Logo COZIS]  | Pengelolaan Produk > Katalog & Harga Jual               | [Avatar: Mgmt] |
+---------------------------------------------------------------------------------------------------+
| SIDEBAR      | KELOLA MENU & PENETAPAN HARGA JUAL                                                 |
|              |                                                                                   |
| [ ] Dashboard| [Search: Nama / SKU...] [Kategori: Kopi/Non-Kopi v]             [+ TAMBAH PRODUK]  |
| [ ] User     +-----------------------------------------------------------------------------------+
| [ ] Armada   | DAFTAR MENU PENJUALAN                                                             |
| [•] Katalog  | +-------------------------------------------------------------------------------+ |
| [ ] Map      | | Gambar | Nama Menu           | Modal (HPP) | Harga Jual  | Margin | Status    | |
| [ ] Laporan  | +-------------------------------------------------------------------------------+ |
|              | | [Foto] | Kopi Susu Aren      | Rp 12.000   | Rp 18.000   | +33.3% | [TERSEDIA]| |
|              | | [Foto] | Americano Dingin    | Rp 9.000    | Rp 15.000   | +40.0% | [TERSEDIA]| |
|              | | [Foto] | Matcha Latte        | Rp 14.000   | Rp 20.000   | +30.0% | [HABIS]   | |
|              | +-------------------------------------------------------------------------------+ |
+---------------------------------------------------------------------------------------------------+
```

---

## 3. Fitur Utama

- **Kalkulator Margin Instan**: Menghitung otomatis margin laba kotor saat Management mengubah harga jual produk.
- **Toggle Ketersediaan**: Mengubah status menu secara live (jika stok bahan baku habis di gudang pusat).
