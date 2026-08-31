# Spesifikasi UI/UX: Supervisor - Referensi Katalog Produk (`/catalog`)

Dokumen ini merancang antarmuka **Product Catalog Reference View** untuk Supervisor. Supervisor membutuhkan katalog untuk memahami operasional penjualan di lapangan, **namun tidak memiliki izin mengubah harga atau menghapus produk**.

---

## 1. Audit Endpoint & Data Contract

| Properti | Detail |
| :--- | :--- |
| **Get Products** | `GET /api/products` |
| **Status Audit** | ✅ Endpoint aktif di backend (RBAC: `SUPERVISOR`, `SUPERADMIN`, `MANAGEMENT`) |
| **Batasan Role** | ❌ Read-Only. Tidak ada tombol Add Product, Edit Price, atau Delete |

---

## 2. Wireframe Struktur Visual (ASCII Layout)

```text
+---------------------------------------------------------------------------------------------------+
| TOP BAR: [Logo COZIS]  | Operasional Lapangan > Daftar Menu Penjualan            | [Avatar: SPV]  |
+---------------------------------------------------------------------------------------------------+
| SIDEBAR      | REFERENSI KATALOG & HARGA JUAL (READ-ONLY)                                         |
|              |                                                                                   |
| [ ] Dashboard| [Search: Nama / SKU Produk...]  [Kategori: Semua v]                               |
| [ ] Zona Ops +-----------------------------------------------------------------------------------+
| [ ] DSS TOPSIS| GRID PRODUK TERDAFTAR                                                             |
| [ ] Plotting | +-----------------------+ +-----------------------+ +---------------------------+ |
| [ ] Armada   | | [Foto Kopi Aren]      | | [Foto Americano]      | | [Foto Matcha Latte]       | |
| [•] Katalog  | | Kopi Susu Aren        | | Americano Dingin      | | Matcha Latte Cream        | |
| [ ] Peta Ops | | SKU: COZ-COF-001      | | SKU: COZ-COF-002      | | SKU: COZ-NON-001          | |
| [ ] Laporan  | | Harga: Rp 18.000      | | Harga: Rp 15.000      | | Harga: Rp 20.000          | |
|              | | Status: [TERSEDIA]    | | Status: [TERSEDIA]    | | Status: [HABIS DI HUB]    | |
|              | +-----------------------+ +-----------------------+ +---------------------------+ |
+---------------------------------------------------------------------------------------------------+
```
