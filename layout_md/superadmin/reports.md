# Spesifikasi UI/UX: Super Admin - Laporan Sistem (`/reports`)

Dokumen ini merancang antarmuka **Reports & Analytics** untuk Super Admin dengan tata letak minimalis dan ringkas (*PWA-ready*).

---

## 1. Audit Endpoint & Data Contract

| Domain Laporan | Endpoint Backend | Parameter Filter |
| :--- | :--- | :--- |
| **Sales Analytics** | `GET /api/sales/overview` | `startDate`, `endDate`, `zoneId`, `riderId` |
| **Zone Performance**| `GET /api/dashboard/zone-performance` | `dateRange=30d` |
| **DSS Snapshots** | `GET /api/dss/snapshots` | `page`, `limit` |
| **Fleet Utilization**| `GET /api/armadas` | `status`, `dateRange` |
| **Audit Logs** | `GET /api/audit-logs` | `userId`, `action`, `startDate`, `endDate` |
| **Export** | `POST /api/reports/export` | `format: "PDF" \| "XLSX" \| "CSV"` |
| **Status Audit** | ✅ Endpoint aktif (RBAC: `SUPERADMIN`, `MANAGEMENT`) |

---

## 2. Pemetaan Komponen Svelte & Opaline Design Tokens

### 2.1 Komponen Svelte
- **Layout**: `AppLayout.svelte`, `TopBar.svelte`, `Sidebar.svelte`
- **Navigasi & Filter**: `Tabs.svelte`, `DateRangePicker.svelte`, `Select.svelte`, `Button.svelte`
- **Display**: `DataTable.svelte`, `Pagination.svelte`, `Badge.svelte`
- **Overlay**: `Modal.svelte`

### 2.2 Token Desain Opaline
- **Surface**: `var(--color-surface)` (`#FFFFFF`), Border: `1px solid var(--color-border)` (`#D2D2D4`)
- **Excel Button**: `#107C41` | **PDF Button**: `#D83B01`

---

## 3. Wireframe Visual High-Fidelity (ASCII Layout)

```text
+-------------------------------------------------------------------------------------------------------------------------+
| TOP BAR: [Logo COZIS] | [Q Cari laporan... (Ctrl+K)] | Breadcrumb: Analitika > Laporan           | [Avatar SA]           |
+-------------------------------------------------------------------------------------------------------------------------+
| SIDEBAR (240px) | PUSAT LAPORAN & AUDIT                                                                                 |
|                 |                                                                                                       |
| NAVIGATION      | DOMAIN LAPORAN:                                                                                       |
| [ ] Dashboard   | [• 1. Penjualan]            [ 2. Evaluasi DSS ]            [ 3. Armada ]            [ 4. Audit Log ]    |
| [ ] User        +-------------------------------------------------------------------------------------------------------+
| [ ] Zona        | FILTER:                                                                                               |
| [ ] DSS         | Periode: [ 01/08 - 25/08/2026 v ]  Zona: [ Semua (18) v ]      [ 📥 CSV ]  [ 📗 Excel ]  [ 📕 PDF ]       |
| [ ] Armada      +-------------------------------------------------------------------------------------------------------+
| [ ] Katalog     | OVERVIEW PERIODE (25 Hari)                                                                            |
| [ ] Plotting    | +--------------------+  +--------------------+  +--------------------+  +--------------------+        |
| [ ] Map         | | TOTAL OMZET        |  | TOTAL VOLUME CUP   |  | RATA-RATA HARIAN   |  | TOP ZONA           |        |
| [•] Laporan     | | Rp 461.250.000     |  | 30.750 Cup Kopi    |  | Rp 18.450.000 / hr |  | Sudirman Central   |        |
| [ ] Settings    | | [▲ +14.2%]         |  | [▲ 1.230 Cup / hr] |  | [42 Rider Aktif]   |  | [Rp 85.500.000]    |        |
|                 | +--------------------+  +--------------------+  +--------------------+  +--------------------+        |
| FORMAT BERKAS   +-------------------------------------------------------------------------------------------------------+
| • PDF Lanskap   | TABEL PENJUALAN HARIAN                                                                                |
| • Excel .xlsx   | +---------------------------------------------------------------------------------------------------+ |
| • CSV Data      | | TANGGAL    | OMZET (RP)       | CUP (VOL)    | RIDER BERTUGAS | CASH        | QRIS        | STATUS    | |
|                 | +------------+------------------+--------------+----------------+-------------+-------------+-----------+ |
|                 | | 25/08/2026 | Rp 18.450.000    | 1.230 cup    | 42 Rider       | Rp 7.380.000| Rp11.070.000| [VALID]   | |
|                 | | 24/08/2026 | Rp 16.800.000    | 1.120 cup    | 40 Rider       | Rp 6.720.000| Rp10.080.000| [VALID]   | |
|                 | | 23/08/2026 | Rp 19.200.000    | 1.280 cup    | 44 Rider       | Rp 7.680.000| Rp11.520.000| [VALID]   | |
|                 | +------------+------------------+--------------+----------------+-------------+-------------+-----------+ |
|                 | TOTAL: Rp 461.250.000 | Volume: 30.750 Cup | QRIS: 60.0% | Cash: 40.0%                                |
+-------------------------------------------------------------------------------------------------------------------------+
```

---

## 4. Wireframe Modal Dialog

### 4.1 Modal: Ekspor Laporan (`#modal-export-report`)
```text
+-----------------------------------------------------------------------------------+
| EKSPOR LAPORAN                                                        [ X Tutup ] |
+-----------------------------------------------------------------------------------+
| Format Berkas                                      Orientasi Halaman              |
| [ Dropdown: PDF Document (.pdf)                  v ] [ (•) Landscape   ( ) Portrait ] |
|                                                                                   |
| Domain Laporan                                     Rentang Tanggal                |
| [ Penjualan & Omzet                              v ] [ 01/08/2026 - 25/08/2026  v ] |
|                                                                                   |
| [✓] Sertakan Ringkasan Diagram Tren                                               |
| [✓] Kolom Pengesahan Tanda Tangan Super Admin & Management                        |
|                                                                                   |
| ───────────────────────────────────────────────────────────────────────────────── |
| [ Batal ]                                                               [ EKSPOR ]|
+-----------------------------------------------------------------------------------+
```

---

## 5. State & Interaktivitas UI/UX

1. **Async Export**: Progress dialog saat download data besar.
2. **Sticky Total**: Baris total akumulasi selalu terkunci di bawah.

---

## 6. Panduan Responsivitas & PWA

- **Desktop (1280px+)**: Tabel komprehensif.
- **Tablet (768px - 1024px)**: Tabel scroll horizontal.
- **Mobile (375px - 430px)**: KPI vertikal + tombol *"Unduh PDF"* langsung.
