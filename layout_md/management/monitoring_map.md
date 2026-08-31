# Spesifikasi UI/UX: Management - Peta Monitoring Bisnis

Dokumen ini merancang antarmuka **Fleet & Active Rider Coverage Map** untuk Management. Management fokus memantau sebaran sebaran armada aktif dan coverage wilayah tanpa detail kontrol operasional taktikal.

---

## 1. Audit Endpoint & Data Contract

| Properti | Detail |
| :--- | :--- |
| **Layer Rider Aktif** | `GET /api/lbs/nearby` & WebSocket `rider:location_updated` |
| **Layer Armada** | `GET /api/armadas` |
| **Layer Zona** | `GET /api/zones` |
| **Status Audit** | ✅ Seluruh endpoint aktif di backend (RBAC: `MANAGEMENT`) |
| **Batasan Role** | ❌ Tidak menampilkan tombol override plotting atau eksekusi re-kalkulasi DSS |

---

## 2. Wireframe Struktur Visual (ASCII Layout)

```text
+---------------------------------------------------------------------------------------------------+
| TOP BAR: [Logo COZIS]  | Monitoring Lapangan > Sebaran Armada & Rider            | [Avatar: Mgmt] |
+---------------------------------------------------------------------------------------------------+
| SIDEBAR      | PETA MONITORING SEBARAN ARMADA (BISNIS)                                            |
|              |                                                                                   |
| [ ] Dashboard| +-------------------------------------------------------------------------------+ |
| [ ] User     | | [LAYER FILTER: (v) Armada Beroperasi  (v) Zona Aktif  ( ) Kompetitor]        | |
| [ ] Armada   | |                                                                               | |
| [ ] Katalog  | |                 [Zona 1: Sudirman (6 Unit Bekerja)]                           | |
| [•] Map      | |                 +---------------------------------+                           | |
| [ ] Laporan  | |                 | [Motor 01]   [Motor 02]         |                           | |
|              | |                 | [Motor 03]   [Motor 04]         |                           | |
|              | |                 +---------------------------------+                           | |
|              | |                                                                               | |
|              | +-------------------------------------------------------------------------------+ |
|              | | FLOATING STAT BAR:                                                            | |
|              | | Unit Bergerak: 38 | Unit di Hub: 8 | Rasio Coverage Zona: 88.8%               | |
|              | +-------------------------------------------------------------------------------+ |
+---------------------------------------------------------------------------------------------------+
```
