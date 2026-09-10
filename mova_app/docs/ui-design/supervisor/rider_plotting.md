# Spesifikasi UI/UX: Supervisor - Workspace Plotting & Penugasan Rider (`/distribution`)

Dokumen ini merancang antarmuka **Rider Assignment & Plotting Workspace** untuk Supervisor. Sesuai arsitektur [fitur.md](file:///f:/project_zero/md/fitur.md), Supervisor mengelola **penugasan operasional (*operational assignment*)**, bukan manajemen akun (*user administrator*).

---

## 1. Audit Endpoint & Data Contract

| Properti | Detail |
| :--- | :--- |
| **Get Overview** | `GET /api/distribution/overview` |
| **Auto Distribute** | `POST /api/distribution/auto` |
| **Manual Distribute** | `POST /api/distribution/manual` |
| **Status Audit** | ✅ Seluruh endpoint aktif di backend `distributionRoutes.js` (RBAC: `SUPERVISOR`, `SUPERADMIN`) |
| **Socket Events** | `distribution:updated`, `duty:confirmed` |

---

## 2. Wireframe Struktur Visual (ASCII Layout)

```text
+---------------------------------------------------------------------------------------------------+
| TOP BAR: [Logo COZIS]  | Operasional Lapangan > Plotting Penugasan Shift         | [Avatar: SPV]  |
+---------------------------------------------------------------------------------------------------+
| SIDEBAR      | WORKSPACE PLOTTING RIDER HARIAN                                                    |
|              |                                                                                   |
| [ ] Dashboard| Antrean Hadir: 42 Rider | Belum Terplotting: 4 Rider    [⚡ AUTO PLOTTING TOPSIS] |
| [ ] Zona Ops +-----------------------------------------------------------------------------------+
| [ ] DSS TOPSIS| 3-COLUMN INTERACTIVE BOARD                                                        |
| [•] Plotting | +-----------------------+ +-------------------------+ +-------------------------+ |
| [ ] Armada   | | 1. ANTREAN FIFO RIDER | | 2. ZONA REKOMENDASI DSS | | 3. RIDER SUDAH BERTUGAS | |
| [ ] Katalog  | | (Menunggu Plotting)   | | (Target Kuota & Kuota)  | | (Live OTW / Checked-in) | |
| [ ] Peta Ops | | +-------------------+ | | +---------------------+ | | +---------------------+ | |
| [ ] Laporan  | | | #1 Budi (06:05)   | | | | #1 Sudirman CBD     | | | | Dimas [Sudirman]    | | |
|              | | |    [Pilih Zona v] | | | |    [Kuota: 6/6 FULL]| | | | Status: CHECK-IN    | | |
|              | | +-------------------+ | | +---------------------+ | | +---------------------+ | |
|              | | | #2 Doni (06:10)   | | | | #2 Kuningan Mega    | | | | Toni [Kuningan]     | | |
|              | | |    [Pilih Zona v] | | | |    [Kuota: 3/5 OK]  | | | | Status: OTW         | | |
|              | | +-------------------+ | | +---------------------+ | | +---------------------+ | |
|              | +-----------------------+ +-------------------------+ +-------------------------+ |
+---------------------------------------------------------------------------------------------------+
```
