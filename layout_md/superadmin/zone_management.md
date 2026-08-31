# Spesifikasi UI/UX: Super Admin - Manajemen Zona (`/zones`)

Dokumen ini merancang antarmuka **Zone Geofence Management** untuk Super Admin dengan tata letak minimalis dan ringkas (*PWA-ready*).

---

## 1. Audit Endpoint & Data Contract

| Properti | Detail |
| :--- | :--- |
| **Get All Zones** | `GET /api/zones` |
| **Get Spatial Config** | `GET /api/zones/config` |
| **Create Zone** | `POST /api/zones` |
| **Update Zone** | `PUT /api/zones/:id` |
| **Update Status / Cap**| `PATCH /api/zones/:id/status` & `PATCH /api/zones/:id/capacity` |
| **Delete Zone** | `DELETE /api/zones/:id` |
| **Status Audit** | ✅ Endpoint aktif (RBAC: `SUPERADMIN`) |

---

## 2. Pemetaan Komponen Svelte & Opaline Design Tokens

### 2.1 Komponen Svelte
- **Layout**: `AppLayout.svelte`, `TopBar.svelte`, `Sidebar.svelte`
- **Peta Spasial**: `LeafletMap.svelte`, `PolygonEditor.svelte`, `ZoneMarker.svelte`
- **Data & Input**: `DataTable.svelte`, `Button.svelte`, `Input.svelte`, `Badge.svelte`
- **Overlay**: `Modal.svelte`, `Drawer.svelte`, `Alert.svelte`

### 2.2 Token Desain Opaline
- **Poligon Aktif**: Stroke `var(--color-primary)` (`#FF634A`), Fill `rgba(255, 99, 74, 0.25)`
- **Poligon Nonaktif**: Stroke `#8E8E93`, Fill `rgba(142, 142, 147, 0.15)`
- **Jalan Terlarang**: Stroke `#EF4444` (Dashed Line)

---

## 3. Wireframe Visual High-Fidelity (ASCII Layout)

```text
+-------------------------------------------------------------------------------------------------------------------------+
| TOP BAR: [Logo COZIS] | [Q Cari zona... (Ctrl+K)] | Breadcrumb: Master > Zona                   | [Avatar SA]           |
+-------------------------------------------------------------------------------------------------------------------------+
| SIDEBAR (240px) | MANAJEMEN ZONA & GEOFENCE                                                                             |
|                 |                                                                                                       |
| NAVIGATION      | TOOLBAR:                                                                                              |
| [ ] Dashboard   | [Q Cari nama zona / kode...        ] [Status: Semua v]                                 [ + Zona ]     |
| [ ] User        +-------------------------------------------------------------------------------------------------------+
| [•] Zona        | SPLIT VIEW: TABEL & PETA GEOFENCE                                                                     |
| [ ] DSS         | +-----------------------------------------------+ +-------------------------------------------------+ |
| [ ] Armada      | | DAFTAR ZONA (18 Total)                        | | PETA GEOFENCE (Leaflet)                           | |
| [ ] Katalog     | | +-------------------------------------------+ | | [Layer: (•) Map  ( ) Satelit  [✓] Jalan Terlarang]| |
| [ ] Plotting    | | | KODE & NAMA ZONA      | KAPASITAS| STATUS | | |                                                 | |
| [ ] Map         | | +-----------------------+----------+--------+ | |  +-----------------------+                    | |
| [ ] Laporan     | | | [●] JKT-SDR-01        | 4/6 Unit | [AKTIF]| | |  | ZONA SUDIRMAN CENTRAL |                    | |
| [ ] Settings    | | | Sudirman Central Area | (66%)    |        | | |  | 4/6 Rider Bertugas    |                    | |
|                 | | +-----------------------+----------+--------+ | |  +-----------------------+                    | |
| STATS ZONA      | | | [ ] JKT-KNG-02        | 3/5 Unit | [AKTIF]| | |                       +---------------------+ | |
| Total: 18       | | | Kuningan Mega Corridor| (60%)    |        | | |                       | ZONA KUNINGAN MEGA  | | |
| Aktif: 14       | | +-----------------------+----------+--------+ | |                       | 3/5 Rider Bertugas  | | |
| Penuh: 2        | | | [ ] JKT-BKM-03        | 5/5 Unit | [PADAT]| | |                       +---------------------+ | |
|                 | | | Blok M Square Hub     | (100%)   |        | | |                                                 | |
|                 | | +-------------------------------------------+ | | [Tools: ✏ Gambar Poligon | ⤢ Reset | 📍 Centroid] | |
|                 | | [ ✎ Edit Atribut ] [ 🗺 Edit Poligon ]        | | Centroid: Lat -6.2215, Lng 106.8042 (Selected)  | |
|                 | +-----------------------------------------------+ +-------------------------------------------------+ |
+-------------------------------------------------------------------------------------------------------------------------+
```

---

## 4. Wireframe Modal Dialog & Drawer

### 4.1 Modal: Atribut Zona (`#modal-zone-form`)
```text
+-----------------------------------------------------------------------------------+
| EDIT ATRIBUT ZONA                                                     [ X Tutup ] |
+-----------------------------------------------------------------------------------+
| Nama Zona                                          Kode Unik                      |
| [ Zona Sudirman Central                          ] [ JKT-SDR-01                 ] |
|                                                                                   |
| Kapasitas Rider (Maksimal)                         Target Harian (Rp)             |
| [ 6 Unit                                         ] [ Rp 5.000.000               ] |
|                                                                                   |
| Koridor Jalan Terlarang (Restricted)                                              |
| [ Jl. Jend. Sudirman (Jalur Cepat), Flyover Semanggi                           ] |
|                                                                                   |
| Status:  (•) Aktif   ( ) Nonaktif                                                 |
|                                                                                   |
| ───────────────────────────────────────────────────────────────────────────────── |
| [ Batal ]                                                               [ SIMPAN ]|
+-----------------------------------------------------------------------------------+
```

### 4.2 Drawer: Editor Poligon Geofence (`#drawer-polygon-editor`)
```text
+-------------------------------------------------------------------+
| POLIGON GEOFENCE: JKT-SDR-01                          [ X Tutup ] |
+-------------------------------------------------------------------+
| TITIK KOORDINAT (VERTEX):                                         |
| • P1 : -6.221500, 106.804200                                [ 🗑 ]|
| • P2 : -6.223500, 106.812200                                [ 🗑 ]|
| • P3 : -6.229500, 106.809500                                [ 🗑 ]|
| • P4 : -6.226500, 106.801500                                [ 🗑 ]|
|                                                                   |
| [ + Tambah Titik ]                                                |
|                                                                   |
| VALIDASI: [✓] Poligon Valid | Luas: 0.84 km²                      |
|                                                                   |
| ───────────────────────────────────────────────────────────────── |
| [ 🔄 Reset ]                                          [ TERAPKAN ]|
+-------------------------------------------------------------------+
```

---

## 5. State & Interaktivitas UI/UX

1. **Polygon Draw Mode**: Klik tombol pensil untuk menggambar titik koordinat di peta.
2. **Delete Guard**: Zona aktif dengan rider bertugas tidak dapat dihapus (*locked*).

---

## 6. Panduan Responsivitas & PWA

- **Desktop (1280px+)**: Split view berdampingan (List 45% + Peta 55%).
- **Tablet (768px - 1024px)**: Switcher Tab `[ Tabel ]` dan `[ Peta ]`.
- **Mobile (375px - 430px)**: Card list vertikal + tombol tap *"Lihat Peta"* (Bottom Sheet).
