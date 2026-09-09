# Wireframe Blueprint: Map Ops Spatial Command Center (`/map`)

Dokumen ini mendefinisikan arsitektur tata letak, panel kontrol telemetri, panel filter layer GIS, dan interaksi LBS real-time untuk halaman **Map Ops (Monitoring Map)**.

---

## 1. Komponen Utama Map Ops

1. **Leaflet Canvas Viewport**: Peta interaktif layar penuh dengan koordinat awal Surabaya (Lat: `-7.2575`, Lng: `112.7521`, Zoom: `13`).
2. **Top Time-Slot & Telemetry HUD**: Bar status operasional (PAGI 06:00-11:00, SIANG 11:00-15:00, SORE 15:00-19:00, MALAM 19:00-23:00).
3. **Floating Floating Toolbar (Left HUD)**:
   - Pencarian alamat/zona (*Geocoding Search*).
   - Filter Layer Spasial (*Layer Switcher*).
   - Pemantau Rider Terdekat (*Nearby Riders Radar*).
   - Pemantau Cuaca Zona (*Weather Telemetry*).
   - Legenda Peta (*Map Legend*).
   - Pilihan Basemap (*Carto Dark, OpenStreetMap, Satellite Esri*).
4. **Bottom-Right Action Buttons**: Tombol zoom, reset pusat peta ke Hub Surabaya, dan tombol darurat **Broadcast Alert Modal**.
5. **Rider Detail Drawer (Right Slide-over)**: Menampilkan telemetri rider saat marker diklik (status tugas, baterai armada, sisa cup, koordinat, dan tombol kontak).

---

## 2. Layout Wireframe Map Ops

```text
+---------------------------------------------------------------------------------------------------+
| [AppShell Sidebar]  [ TOP TIME-SLOT HUD: SHIFT PAGI (06:00 - 11:00) ]  [🟢 14 Rider Online] [Cuaca: 31°C] |
+---------------------------------------------------------------------------------------------------+
|  [TOOLBAR]        |                                                                               |
|  [🔍 Cari Lokasi] |                         ( LEAFLET GIS CANVAS )                                |
|  [📑 Layer Peta]  |                                                                               |
|  [🛵 Rider LBS]   |      [POLIGON POSTGIS ZONA 01 - GUBENG]                                      |
|  [⛅ Cuaca Zona]  |      • Marker Rider #01 (🟢 ONLINE, Baterai 92%)                              |
|  [🗺️ Basemap]     |      • Marker Armada ARM-GB-001 (Gerobak Aktif)                              |
|  [ℹ️ Legenda]     |                                                                               |
|                   |                      [JALAN PROTOKOL (BUFFER 50M)]                             |
|  -----------------|                      =============================                            |
|  [LAYER PANEL]    |                      ⚠️ Marker Rider #05 (🟡 Mendekati Batas: 35m)             |
|  [X] Zona Wilayah |                                                                               |
|  [X] Rider LBS    |                                            +--------------------------------+ |
|  [X] Armada Hub   |                                            | [RIDER DETAIL DRAWER]          | |
|  [X] Overpass POI |                                            | Rider: Ahmad Fadillah          | |
|  [X] Jalan Prot.  |                                            | Armada: GEROBAK-04 (88% Bat)   | |
|  [X] Cuaca Real   |                                            | Zona: Zona 02 - Tunjungan      | |
|  [ ] DSS Heatmap  |                                            | Status: CHECKED_IN             | |
|                   |                                            | Penjualan: 18 Cup (Rp 270.000) | |
|                   |                                            | [ Hubungi ]  [ Swap Armada ]   | |
|                   |                                            +--------------------------------+ |
|                   |                                                                               |
|                   |                                                  [ + ] [ - ] [ ⌖ Reset Hub ]  |
|                   |                                                  [ 🚨 Broadcast Komando Ops ] |
+---------------------------------------------------------------------------------------------------+
```

---

## 3. Spesifikasi Layer & Aturan Peringatan Proximity

### A. Layer PostGIS Zona Wilayah
- Poligon transparan hijau (`fill: #10B981`, `opacity: 0.15`) dengan batas tegas (`stroke: #10B981`, `weight: 2`).
- Menampilkan label nama zona, kuota maksimum rider, dan status aktivasi shift.

### B. Layer Jalan Protokol (Restricted Roads $\pm 50\text{m}$)
- Garis merah tegas (`stroke: #EF4444`, `weight: 3`, `dashArray: '6, 6'`) dengan zona penyangga (*buffer*) transparan $\pm 50$ meter.
- **Logika Proximity Alert**:
  $$\text{Jarak ke Jalan Protokol} \le 50\text{ meter} \implies \text{Trigger Peringatan Kritis}$$
  - Marker rider di peta berubah warna menjadi kuning/merah berdenyut (*pulsing ripple*).
  - Mengirim notifikasi darurat audio/haptic ke PWA rider untuk segera berputar arah.

### C. Layer Titik Keramaian (POI Overpass OSM)
- Ikon pin kategori:
  - 🏬 **Mall / Pusat Belanja**: Pin Biru Cyan.
  - 🎓 **Kampus / Universitas**: Pin Oranye.
  - 🚆 **Stasiun / Transit**: Pin Kuning Emas.
  - 🌳 **Taman / Rekreasi**: Pin Hijau Zamrud.
