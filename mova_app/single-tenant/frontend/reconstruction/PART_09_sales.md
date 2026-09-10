# FRONTEND PART 09 — POINT OF SALES (POS), MENU CATALOG & SALES RECORDING

## 1. Objective
Menyediakan modul kasir keliling cepat (*Quick POS*) untuk Rider mencatat penjualan cup kopi/snack, manajemen katalog produk & harga untuk Management, kalkulasi kembalian tunai/QRIS, serta pencetakan struk digital.

---

## 2. Target React Components & Pages
- `src/pages/catalog/CatalogPage.jsx`
- `src/components/pos/PosGridCatalog.jsx`
- `src/components/pos/PosCartDrawer.jsx`
- `src/components/pos/PaymentConfirmModal.jsx`
- `src/components/pos/ReceiptPrintModal.jsx`
- `src/services/productService.js` & `src/services/salesService.js`

---

## 3. API Contract Binding
- `GET /api/products` $\rightarrow$ Query `category?`, `active_only=true` $\rightarrow$ `{ products: ProductItem[] }`
- `POST /api/products` $\rightarrow$ `{ name, category, price, cost_price, is_active }` $\rightarrow$ `{ success: true, product }`
- `PUT /api/products/:id` $\rightarrow$ `{ name, price, is_active }` $\rightarrow$ `{ success: true, product }`
- `POST /api/sales/create-transaction` $\rightarrow$ `{ payment_method: "CASH" | "QRIS", items: [{ product_id, quantity, price_per_unit }] }` $\rightarrow$ `{ success: true, transaction_id, total_amount, receipt_number }`
- `GET /api/sales/today-summary` $\rightarrow$ `{ total_revenue, units_sold, transaction_count }`

---

## 4. UI/UX Interaction & Confirmation Standards
1. **Quick Touch POS Interface:**
   - Thumbnail produk besar dengan tombol (+) dan (-) instan untuk transaksi cepat di pinggir jalan.
2. **Payment Confirmation Modal:**
   - Menampilkan total tagihan, input nominal uang tunai diterima, kalkulator kembalian otomatis, atau QRIS static/dynamic mockup.
   - Tombol konfirmasi final: `Selesaikan Transaksi (Cetak Struk)`.
3. **Product Catalog Modifications:**
   - Penambahan atau pengubahan harga produk wajib melewati modal konfirmasi dengan penegasan perubahan margin keuntungan.

---

## 5. Verification Criteria
- [x] Transaksi penjualan mengurangi stok/mencatat unit terjual dan memperbarui ringkasan omzet hari ini secara real-time.
- [x] Form input kasir terlindungi dari input negatif atau kuantitas kosong.
