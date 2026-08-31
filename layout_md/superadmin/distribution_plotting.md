# Spesifikasi UI/UX: Super Admin - Plotting Rider (`/distribution`)

Dokumen ini merancang antarmuka **Rider Distribution Workspace** untuk Super Admin dengan tata letak minimalis dan ringkas (*PWA-ready*).

---

## 1. Audit Endpoint & Data Contract

| Properti | Detail |
| :--- | :--- |
| **Get Overview** | `GET /api/distribution/overview` |
| **Auto Plotting** | `POST /api/distribution/auto` (FIFO + TOPSIS + Kuota) |
| **Manual Plotting** | `POST /api/distribution/manual` |
| **Swap / Reassign** | `PUT /api/distribution/reassign` |
| **Reset Plotting** | `POST /api/distribution/reset` |
| **Status Audit** | ✅ Endpoint aktif (RBAC: `SUPERADMIN`, `SUPERVISOR`) |
| **WebSocket** | `distribution:updated`, `rider:plotted`, `attendance:checked_in` |

---

## 2. Pemetaan Komponen Svelte & Opaline Design Tokens

### 2.1 Komponen Svelte
- **Layout**: `AppLayout.svelte`, `TopBar.svelte`, `Sidebar.svelte`
- **Kanban**: `KanbanBoard.svelte`, `KanbanColumn.svelte`, `DraggableCard.svelte`, `DropZone.svelte`
- **Display**: `Button.svelte`, `Badge.svelte`, `ProgressBar.svelte`
- **Overlay**: `Modal.svelte`, `ConfirmDialog.svelte`

### 2.2 Token Desain Opaline
- **Zona Penuh**: Border `var(--color-danger)` (`#EF4444`), Badge `#FEF2F2`
- **Zona Tersedia**: Border `var(--color-success)` (`#10B981`), Badge `#ECFDF5`
- **Kartu Dragging**: Border `2px dashed var(--color-primary)` (`#FF634A`)

---

## 3. Wireframe Visual High-Fidelity (ASCII Layout)

```text
+-------------------------------------------------------------------------------------------------------------------------+
| TOP BAR: [Logo COZIS] | [Q Cari rider/zona... (Ctrl+K)] | Breadcrumb: Operasional > Plotting            | [Avatar SA]   |
+-------------------------------------------------------------------------------------------------------------------------+
| SIDEBAR (240px) | WORKSPACE PLOTTING RIDER                                                              [Shift 07:00]   |
|                 |                                                                                                       |
| NAVIGATION      | TOOLBAR:                                                                                              |
| [ ] Dashboard   | FIFO: 42 Hadir | 38 Plotted | 4 Waiting          [ 🔄 Reset ]            [ ⚡ Auto Plot FIFO ]        |
| [ ] User        +-------------------------------------------------------------------------------------------------------+
| [ ] Zona        | KANBAN WORKSPACE (FIFO -> Rekomendasi TOPSIS -> Status Lapangan)                                      |
| [ ] DSS         | +------------------------+ +--------------------------------+ +---------------------------------------+ |
| [ ] Armada      | | 1. ANTREAN FIFO (4)    | | 2. REKOMENDASI TOPSIS (14)   | | 3. STATUS LAPANGAN (38)               | |
| [ ] Katalog     | +------------------------+ +--------------------------------+ +---------------------------------------+ |
| [•] Plotting    | | [Kartu 1] 06:10 WIB    | | +----------------------------+ | | +-----------------------------------+ | |
| [ ] Map         | | Dimas Kurniawan        | | | #1 SUDIRMAN CENTRAL        | | | | Budi -> Sudirman Central          | | |
| [ ] Laporan     | | Unit: B 1234 COZ       | | | Kuota: [██████] 6/6 (FULL) | | | | Unit: B 1234 COZ | [CHECKED-IN]   | | |
| [ ] Settings    | | [ :: Drag ke Zona ]    | | | TOPSIS (V_i): 0.884        | | | | Sales: Rp 450.000 (30 Cup)        | | |
|                 | +------------------------+ | +----------------------------+ | | +-----------------------------------+ | |
| SHIFT STATS     | | [Kartu 2] 06:14 WIB    | | +----------------------------+ | | +-----------------------------------+ | |
| Target: 18 Zona | | Rizky Ramadhan         | | | #2 KUNINGAN MEGA           | | | | Joni -> Kuningan Mega             | | |
| Hadir : 42 Rider| | Unit: B 5678 COZ       | | | Kuota: [████░░] 4/6 (SISA 2| | | | Unit: B 5678 COZ | [OTW ZONA]     | | |
| Plotted: 38     | | [ :: Drag ke Zona ]    | | | TOPSIS (V_i): 0.742        | | | | Estimasi: 8 Mnt                   | | |
| Waiting: 4      | +------------------------+ | | [ + Drop Rider di Sini ]   | | | +-----------------------------------+ | |
|                 | | [Kartu 3] 06:22 WIB    | | +----------------------------+ | | +-----------------------------------+ | |
|                 | | Farhan Pratama         | | +----------------------------+ | | | Dedi -> Blok M Square             | | |
|                 | | Unit: B 9999 COZ       | | | #3 BLOK M SQUARE           | | | | Unit: B 9999 COZ | [CHECKED-IN]   | | |
|                 | | [ :: Drag ke Zona ]    | | | Kuota: [██████] 5/5 (FULL) | | | | Sales: Rp 620.000 (41 Cup)        | | |
|                 | +------------------------+ | +----------------------------+ | | +-----------------------------------+ | |
+-------------------------------------------------------------------------------------------------------------------------+
```

---

## 4. Wireframe Modal Dialog

### 4.1 Modal: Auto Plotting FIFO (`#modal-auto-plotting`)
```text
+-----------------------------------------------------------------------+
| AUTO PLOTTING FIFO-TOPSIS                                 [ X Tutup ] |
+-----------------------------------------------------------------------+
| Alokasikan 4 rider dalam antrean presensi ke zona terbaik yang        |
| masih memiliki sisa kuota.                                            |
|                                                                       |
| Target Alokasi:                                                       |
| • 1. Kuningan Mega (Sisa: 2)   • 2. Senayan Park (Sisa: 2)            |
|                                                                       |
| [✓] Kirim notifikasi instan ke rider                                  |
|                                                                       |
| ───────────────────────────────────────────────────────────────────── |
| [ Batal ]                                           [ ⚡ JALANKAN ]   |
+-----------------------------------------------------------------------+
```

### 4.2 Modal: Manual Override (`#modal-override-rider`)
```text
+-----------------------------------------------------------------------------------+
| OVERRIDE PENUGASAN: Dimas Kurniawan                                   [ X Tutup ] |
+-----------------------------------------------------------------------------------+
| Zona Tujuan                                        Unit Armada                    |
| [ Dropdown: Kuningan Mega                        v ] [ B 1234 COZ (Motor Box)   ] |
|                                                                                   |
| Alasan Override:                                                                  |
| [ Permintaan lonjakan pesanan SCBD                                              ] |
|                                                                                   |
| ───────────────────────────────────────────────────────────────────────────────── |
| [ Batal ]                                                               [ SIMPAN ]|
+-----------------------------------------------------------------------------------+
```

---

## 5. State & Interaktivitas UI/UX

1. **Drag-and-Drop**: Drop target zona menyala hijau jika tersedia, merah jika penuh.
2. **Live Sync**: Status otomatis berubah saat rider melakukan check-in GPS.

---

## 6. Panduan Responsivitas & PWA

- **Desktop (1280px+)**: 3 kolom Kanban berdampingan.
- **Tablet (768px - 1024px)**: Kolom 1 di kiri, Kolom 2 & 3 via tab di kanan.
- **Mobile (375px - 430px)**: List antrean vertikal dengan tombol tap *"Pilih Zona"*.
