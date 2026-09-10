# Spesifikasi UI/UX: Super Admin - Peta Monitoring Spasial (`/map`)

Dokumen ini merancang antarmuka **Live Spatial Map** untuk Super Admin dengan tata letak minimalis dan ringkas (*PWA-ready*), optimal untuk layar mobile maupun desktop.

---

## 1. Audit Endpoint & Data Contract

| Layer Spasial | Endpoint / WebSocket Event | RBAC Guard |
| :--- | :--- | :--- |
| **Live Rider Tracking** | `POST /api/lbs/track` & Socket `rider:location_updated` | Super Admin Full |
| **Proximity Riders** | `GET /api/lbs/nearby?lat=&lng=&radius=5000` | Super Admin Full |
| **Active Armadas** | `GET /api/armadas` | Super Admin Full |
| **Zone Geofences** | `GET /api/zones/config` | Super Admin Full |
| **POI & Kompetitor** | `GET /api/pois` & `GET /api/poi-categories` | Super Admin Full |
| **Weather Overlay** | `GET /api/weather` & Socket `weather:updated` | Super Admin Full |
| **Jalan Terlarang** | `GET /api/roads` | Super Admin Full |
| **DSS Heatmap** | `GET /api/dss/recommendations` | Super Admin Full |
| **Geofence Breach Alerts**| Socket `alert:geofence_breach` | Super Admin Full |

---

## 2. Pemetaan Komponen Svelte & Opaline Design Tokens

### 2.1 Komponen Svelte
- **Peta Utama**: `LeafletMap.svelte`, `TileLayer.svelte`, `MarkerCluster.svelte`
- **HUD & Kontrol**: `LayerToggle.svelte`, `FloatingHUD.svelte`, `RiderHUDCard.svelte`, `SearchBarMap.svelte`
- **Layer Khusus**: `RiderMarker.svelte`, `PolygonGeofence.svelte`, `RestrictedRoadLayer.svelte`, `WeatherOverlay.svelte`
- **Overlay & Detail**: `Drawer.svelte`, `Modal.svelte`, `AlertBanner.svelte`, `Badge.svelte`

### 2.2 Token Desain Opaline
- **Rider Aktif (Online)**: Marker `#10B981` (Emerald Glow)
- **Rider Breach / Alert**: Marker `#EF4444` (Crimson Pulse)
- **Poligon Zona**: Stroke `var(--color-primary)` (`#FF634A`), Fill `rgba(255, 99, 74, 0.15)`
- **Jalan Terlarang**: Stroke `#EF4444` (Dashed Line)
- **HUD Surface**: `rgba(255, 255, 255, 0.92)`, Blur `8px`, Border `1px solid var(--color-border)`

---

## 3. Wireframe Visual High-Fidelity (ASCII Layout)

```text
+-------------------------------------------------------------------------------------------------------------------------+
| TOP BAR: [Logo COZIS] | [Q Cari lokasi, rider, zona...] | [● 42 Online] | [Avatar SA]                                   |
+-------------------------------------------------------------------------------------------------------------------------+
| SIDEBAR (64px) | PETA MONITORING (Leaflet.js)                                                                           |
|                |                                                                                                       |
| [•] Map        | +---------------------------------------------------------+                                           |
| [ ] Dashboard  | | [ 🔍 Cari Rider / Plat / Zona... ] [Wilayah: Semua v]   |                                           |
| [ ] User       | +---------------------------------------------------------+                                           |
| [ ] Zona       |                                                                                                       |
| [ ] DSS        |                                              +--------------------------------------------+           |
| [ ] Armada     |                                              | LAYER FILTER (Top Right)                   |           |
| [ ] Katalog    |                                              | [✓] Rider (42 active)                      |           |
| [ ] Plotting   |                                              | [✓] Zona (18 Area)                         |           |
| [ ] Laporan    |                                              | [✓] Armada (50 Unit)                       |           |
| [ ] Settings   |                                              | [✓] Jalan Terlarang                        |           |
|                |              [ ZONA SUDIRMAN ]               | [✓] Cuaca (29°C)                           |           |
| ZOOM CONTROLS  |           +-------------------------------+  | [ ] DSS Heatmap                            |           |
| [+] Zoom In    |           |   (●) Rider Doni (18 km/h)    |  | [ ] POI Kopi                               |           |
| [-] Zoom Out   |           |        \                      |  | [ ] Traffic Live                           |           |
| [⤢] Reset      |           |   [=== JALAN TERLARANG ===]   |  +--------------------------------------------+           |
|                |           |        /                      |                                                           |
|                |           |   (●) Rider Dimas (Checked)   |      [ Weather: 29°C ]                                    |
|                |           +-------------------------------+                                                           |
|                |                                                                                                       |
|                | +---------------------------------------------------------------------------------------------------+ |
|                | | STATUS HUD (Bottom Bar)                                                                           | |
|                | | Rider: 42 Active | Avg Speed: 16 km/h | Breach: 0 | Sales: 410 Cup  [ 📢 Alert ] [ 📥 Log ] [ ⤢ Full ]| |
|                | +---------------------------------------------------------------------------------------------------+ |
+-------------------------------------------------------------------------------------------------------------------------+
```

---

## 4. Wireframe Modal Dialog & Slide-Over Drawer

### 4.1 Drawer: Detail Rider & Unit (`#drawer-rider-detail`)
```text
+-------------------------------------------------------------------+
| DETAIL RIDER                                          [ X Tutup ] |
+-------------------------------------------------------------------+
| • Nama: Doni Pratama (@doni.pratama)  • Telp: 081298765432        |
| • Zona: Sudirman Central              • Status: [CHECKED-IN]      |
|                                                                   |
| TELEMETRI:                                                        |
| • Posisi: -6.2215, 106.8042 (Akurasi: ±3m)                        |
| • Speed: 18 km/h  • Arah: 142° SE  • Baterai: 94%                 |
|                                                                   |
| ARMADA & SALES:                                                   |
| • Unit: B 1234 COZ (Motor Box)  • Odo Hari Ini: 14.2 km           |
| • Sales Hari Ini: 34 Cup (Rp 510.000)                             |
|                                                                   |
| ───────────────────────────────────────────────────────────────── |
| [ 📞 Call ]             [ 💬 Chat ]                 [ Tutup ]     |
+-------------------------------------------------------------------+
```

### 4.2 Modal: Broadcast Peringatan Lapangan (`#modal-broadcast-alert`)
```text
+-----------------------------------------------------------------------+
| BROADCAST PERINGATAN                                      [ X Tutup ] |
+-----------------------------------------------------------------------+
| Target: (•) Semua Rider (42)   ( ) Zona Tertentu: [ Sudirman Central v]|
| Tipe  : [ Dropdown: Cuaca Ekstrem / Hujan                         v ] |
|                                                                       |
| Pesan Peringatan:                                                     |
| [ Hujan deras di area SCBD. Harap amankan armada ke shelter terdekat. ]|
|                                                                       |
| ───────────────────────────────────────────────────────────────────── |
| [ Batal ]                                           [ 📢 KIRIM ]      |
+-----------------------------------------------------------------------+
```

---

## 5. State & Interaktivitas UI/UX

1. **Live GPS Interpolation**: Pergerakan marker bergerak mulus tanpa lag.
2. **Breach Alert**: Jika rider keluar geofence atau masuk jalan terlarang, marker berkedip merah dan memicu notifikasi visual.
3. **Layer Persistence**: Pengaturan layer tersimpan di browser (*localStorage*).

---

## 6. Panduan Responsivitas & PWA

- **Desktop (1280px+)**: Peta layar penuh dengan sidebar ikon compact (64px) dan floating HUD.
- **Tablet (768px - 1024px)**: Panel Layer diringkas menjadi Drawer popover via tombol `[ Layers ]`.
- **Mobile (375px - 430px)**: Peta full-bleed dengan bottom sheet swipe-up untuk melihat status rider.
