# Spesifikasi UI/UX: Super Admin - Manajemen Katalog (`/catalog`)

Dokumen ini merancang antarmuka **Product Catalog & Pricing** untuk Super Admin dengan tata letak minimalis dan ringkas (*PWA-ready*).

---

## 1. Audit Endpoint & Data Contract

| Properti | Detail |
| :--- | :--- |
| **Get Products** | `GET /api/products?status=ALL&category=ALL&search=` |
| **Get Product Detail** | `GET /api/products/:id` |
| **Create Product** | `POST /api/products` |
| **Update Product** | `PUT /api/products/:id` |
| **Toggle Status** | `PATCH /api/products/:id/status` |
| **Delete Product** | `DELETE /api/products/:id` (Sales Guard Protected) |
| **Status Audit** | ✅ Endpoint aktif (RBAC: `SUPERADMIN`, `MANAGEMENT`) |

---

## 2. Pemetaan Komponen Svelte & Opaline Design Tokens

### 2.1 Komponen Svelte
- **Layout**: `AppLayout.svelte`, `TopBar.svelte`, `Sidebar.svelte`
- **Katalog**: `ProductCard.svelte`, `DataTable.svelte`, `ViewToggle.svelte`
- **Form & Upload**: `Input.svelte`, `Select.svelte`, `Button.svelte`, `ImageUploader.svelte`
- **Overlay**: `Modal.svelte`, `Badge.svelte`, `Alert.svelte`

### 2.2 Token Desain Opaline
- **Surface**: `var(--color-surface)` (`#FFFFFF`), Border: `1px solid var(--color-border)` (`#D2D2D4`)
- **Badges**:
  - `TERSEDIA`: `#10B981` / `#ECFDF5`
  - `HABIS`: `#EF4444` / `#FEF2F2`
  - `DRAFT`: `#52525B` / `#E7E7E7`

---

## 3. Wireframe Visual High-Fidelity (ASCII Layout)

```text
+-------------------------------------------------------------------------------------------------------------------------+
| TOP BAR: [Logo COZIS] | [Q Cari menu... (Ctrl+K)] | Breadcrumb: Master > Katalog                | [Avatar SA]           |
+-------------------------------------------------------------------------------------------------------------------------+
| SIDEBAR (240px) | KATALOG PRODUK & PRICING                                                                              |
|                 |                                                                                                       |
| NAVIGATION      | TOOLBAR:                                                                                              |
| [ ] Dashboard   | [Q Cari produk, SKU...     ] [Kategori: (•) Semua ( ) Kopi ( ) Non] [View: [⊞ Grid] [≡ List]] [ + Menu ]|
| [ ] User        +-------------------------------------------------------------------------------------------------------+
| [ ] Zona        | GRID PRODUK (24 Menu)                                                                                 |
| [ ] DSS         | +-----------------------+ +-----------------------+ +-----------------------+ +---------------------+ |
| [ ] Armada      | | +-------------------+ | | +-------------------+ | | +-------------------+ | | +-----------------+ | |
| [•] Katalog     | | | [FOTO PRODUK]     | | | | [FOTO PRODUK]     | | | | [FOTO PRODUK]     | | | | [FOTO PRODUK]   | | |
| [ ] Plotting    | | +-------------------+ | | +-------------------+ | | +-------------------+ | | +-----------------+ | |
| [ ] Map         | | Kopi Susu Aren      | | | Americano Dingin    | | | Matcha Latte Cream  | | | Dark Choco Float  | | |
| [ ] Laporan     | | SKU: COZ-COF-001    | | | SKU: COZ-COF-002    | | | SKU: COZ-NON-001    | | | SKU: COZ-NON-002  | | |
| [ ] Settings    | | HPP: 11k | JUAL: 18k| | | HPP: 9k  | JUAL: 15k| | | HPP: 13k | JUAL: 20k| | | HPP: 12k| JUAL: 22k| |
|                 | | Margin: 38.9% (▲)   | | | Margin: 40.0% (▲)   | | | Margin: 35.0% (▲)   | | | Margin: 43.1% (▲) | |
| RINGKASAN MENU  | | Status: [TERSEDIA]  | | | Status: [TERSEDIA]  | | | Status: [HABIS]     | | | Status: [TERSEDIA]| |
| Kopi: 14 Item   | | [ ✎ Edit ] [ ⚙ ]    | | [ ✎ Edit ] [ ⚙ ]    | | [ ✎ Edit ] [ ⚙ ]    | | [ ✎ Edit ][ ⚙ ]   | |
| Non-Kopi: 10    | +-----------------------+ +-----------------------+ +-----------------------+ +---------------------+ |
| Margin: 39%     | 1 - 12 dari 24 Menu                             [< Prev] [ 1 ] [ 2 ] [Next >]                         |
+-------------------------------------------------------------------------------------------------------------------------+
```

---

## 4. Wireframe Modal Dialog

### 4.1 Modal: Tambah Menu (`#modal-product-form`)
```text
+-----------------------------------------------------------------------------------+
| TAMBAH MENU                                                           [ X Tutup ] |
+-----------------------------------------------------------------------------------+
| Foto Menu (Format: JPG/PNG, 1:1, Max 2MB)                                         |
| +-------------------------------------------------------------------------------+ |
| | [ 📁 Tarik Foto atau Klik untuk Upload ]                                      | |
| +-------------------------------------------------------------------------------+ |
|                                                                                   |
| Nama Menu                                          SKU                            |
| [ Kopi Susu Gula Aren COZIS                      ] [ COZ-COF-001                ] |
|                                                                                   |
| Kategori                                           Status                         |
| [ Dropdown: Minuman Kopi                       v ] [ Dropdown: TERSEDIA         v]|
|                                                                                   |
| HPP (Base Price)                                   Harga Jual (Selling Price)     |
| [ Rp 11.000                                      ] [ Rp 18.000                  ] |
| Gross Margin: Rp 7.000 / cup (+38.9%)                                             |
|                                                                                   |
| ───────────────────────────────────────────────────────────────────────────────── |
| [ Batal ]                                                               [ SIMPAN ]|
+-----------------------------------------------------------------------------------+
```

### 4.2 Modal: Delete Guard (`#modal-delete-guard`)
```text
+-----------------------------------------------------------------------+
| TIDAK DAPAT HAPUS PRODUK                                  [ X Tutup ] |
+-----------------------------------------------------------------------+
| [⚠️] Menu **"Kopi Susu Aren"** memiliki 1.420 transaksi historis.     |
| Menghapus permanen akan merusak laporan keuangan.                     |
|                                                                       |
| Solusi: Ubah status menu menjadi **"Nonaktif / Arsip"**.              |
|                                                                       |
| ───────────────────────────────────────────────────────────────────── |
| [ Batal ]                                           [ ARSIPKAN ]      |
+-----------------------------------------------------------------------+
```

---

## 5. State & Interaktivitas UI/UX

1. **Auto Margin**: Margin laba kotor dihitung instan saat input HPP & Harga Jual.
2. **Instant Status Switch**: Switch toggle ketersediaan di kartu menu.

---

## 6. Panduan Responsivitas & PWA

- **Desktop (1280px+)**: Grid 4 kolom atau Tabel.
- **Tablet (768px - 1024px)**: Grid 2-3 kolom.
- **Mobile (375px - 430px)**: Grid 1-2 kolom dengan touch target lebar (44px).
