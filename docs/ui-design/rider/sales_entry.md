# Spesifikasi UI/UX: Rider - Kasir POS & Pencatatan Transaksi Penjualan

Dokumen ini merancang antarmuka **Mobile Point-of-Sale (POS) & Sales Recording** untuk Rider.

---

## 1. Audit Endpoint & Data Contract

| Properti | Detail |
| :--- | :--- |
| **Get Available Products**| `GET /api/products?status=AVAILABLE` |
| **Record Sale** | `POST /api/rider/record-sale` |
| **Status Audit** | ✅ Seluruh endpoint aktif di backend `riderOperationalRoutes.js` (RBAC: `RIDER`) |
| **Data Real-time** | Transaksi langsung mentrigger update dashboard Supervisor & Management |

### Request Payload (`POST /api/rider/record-sale`):
```json
{
  "zoneId": "zn_01",
  "paymentMethod": "CASH",
  "items": [
    { "productId": "prd_01", "quantity": 2, "unitPrice": 18000 },
    { "productId": "prd_02", "quantity": 1, "unitPrice": 15000 }
  ],
  "totalAmount": 51000,
  "notes": "Pelanggan kantor SCBD Menara 1"
}
```

---

## 2. Wireframe Struktur Visual (ASCII Layout)

```text
+-------------------------------------------------------------+
|  < KEMBALI                        KASIR PENJUALAN KOPI      |
+-------------------------------------------------------------+
|  PILIH MENU & JUMLAH CUP                                    |
|                                                             |
|  +-------------------------------------------------------+  |
|  | [Foto] Kopi Susu Gula Aren           Rp 18.000 / cup  |  |
|  | Jumlah:  [ - ]  [  2  ]  [ + ]       Subtotal: 36.000 |  |
|  +-------------------------------------------------------+  |
|  +-------------------------------------------------------+  |
|  | [Foto] Americano Dingin              Rp 15.000 / cup  |  |
|  | Jumlah:  [ - ]  [  1  ]  [ + ]       Subtotal: 15.000 |  |
|  +-------------------------------------------------------+  |
|  +-------------------------------------------------------+  |
|  | [Foto] Matcha Latte                  Rp 20.000 / cup  |  |
|  | Jumlah:  [ - ]  [  0  ]  [ + ]       Subtotal: 0      |  |
|  +-------------------------------------------------------+  |
|                                                             |
|  METODE PEMBAYARAN                                          |
|  (•) TUNAI (CASH)           ( ) QRIS STATIS COZIS           |
|                                                             |
|  +-------------------------------------------------------+  |
|  | STICKY FOOTER RINGKASAN:                              |  |
|  | Total 3 Cup                   TOTAL: Rp 51.000        |  |
|  |                                                       |  |
|  | [ PROSES & SIMPAN TRANSAKSI ]                         |  |
|  | Background: #FF634A | Teks: #FFFFFF | Tinggi: 52px    |  |
|  +-------------------------------------------------------+  |
+-------------------------------------------------------------+
```
