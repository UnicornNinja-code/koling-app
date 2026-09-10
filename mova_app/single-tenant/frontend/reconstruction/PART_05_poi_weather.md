# FRONTEND PART 05 — SPATIAL QA, POI & ATMOSPHERIC RADAR (COMPREHENSIVE MULTI-PANEL)

## 1. Objective
Menyediakan modul tata kelola data spasial terpadu: Panel Automated Quality Gate, Panel Distribusi 17 Kategori POI (Likert 1–5), Panel Triage Anomali Spasial (Human-in-the-loop), serta Panel Radar Cuaca Atmosferik Hub dari Open-Meteo.

---

## 2. Blueprint 5 Panel Utama Halaman Spatial QA & Weather

```text
┌────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│ TOPBAR: Spatial QA & POI Management | [ 🔄 Sync Overpass API ] [ 🌦️ Sync Cuaca ] [ 📥 Unduh GeoJSON ]   │
├────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│ [PANEL 1] 4 KPI SUMMARY CARDS DATA QUALITY GATE                                                        │
│ ┌──────────────────────┬──────────────────────┬──────────────────────┬───────────────────────────────┐ │
│ │ 📍 TOTAL RAW POI     │ 🟢 VALID DATASET     │ 🔄 DUPLIKAT DI-MERGE │ ⚠️ ANOMALI PERLU REVIEW       │ │
│ │ 8.432 Titik Objek    │ 8.217 POI (97.4%)    │ 183 Objek (Resolved) │ 32 Titik (Kategori Baru/Nama) │ │
│ │ Overpass QL Ingested │ Kualitas: 🟢 VALID   │ 3-Level Deduplicator │ Status: Tindakan Opsional     │ │
│ └──────────────────────┴──────────────────────┴──────────────────────┴───────────────────────────────┘ │
├────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│ [PANEL 2 & 3] ROW: DISTRIBUSI KATEGORI POI & ANOMALY TRIAGE (12 Kolom: 7 + 5)                         │
│ ┌────────────────────────────────────────────────────────┬───────────────────────────────────────────┐ │
│ │ [PANEL 2] 📊 17 KATEGORI POI & BOBOT LIKERT (7 Kolom)  │ [PANEL 3] 🔍 ANOMALY TRIAGE (5 Kolom)     │ │
│ │ • Perkantoran / Bisnis (Bobot 5): 1.420 POI            │ Daftar 32 Objek Memerlukan Perhatian:     │ │
│ │ • Universitas & Sekolah (Bobot 5): 890 POI             │ 1. "OSM_ID: 948210" (Tanpa Kategori Valid)│ │
│ │ • Pusat Perbelanjaan / Mall (Bobot 4): 340 POI         │    ↳ Aksi: [ Petakan ke Perkantoran ]     │ │
│ │ • Taman Kota / Ruang Publik (Bobot 4): 180 POI         │ 2. "Warung Kopi Tradisional" (Kompetitor) │ │
│ │ • Rumah Sakit / Faskes (Bobot 3): 210 POI              │    ↳ Aksi: [ Tandai Kompetitor (Radius 50)│ │
│ │ • Pemukiman / Cluster (Bobot 2): 4.200 POI             │                                           │ │
│ │ [ ✏️ Sesuaikan Nilai Bobot Likert Kategori ]           │ [ 🛡️ Setujui Semua Anomali Terpetakan ]   │ │
│ └────────────────────────────────────────────────────────┴───────────────────────────────────────────┘ │
├────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│ [PANEL 4 & 5] ROW: RADAR CUACA ATMOSFERIK & PROYEKSI PERJAM (12 Kolom: 6 + 6)                          │
│ ┌────────────────────────────────────────────────────────┬───────────────────────────────────────────┐ │
│ │ [PANEL 4] 🌦️ HUB ATMOSPHERIC RADAR CARD (6 Kolom)     │ [PANEL 5] ⏱️ PROYEKSI CUACA 12 JAM KE DEPAN│ │
│ │ • Lokasi Hub: Sidoarjo (-7.4478, 112.7183)             │ 08:00 WIB: 27°C • Cerah (Aman)            │ │
│ │ • Suhu Terkini: 29.4°C • Kelembaban Udara: 68%         │ 11:00 WIB: 32°C • Panas Terik (Potensi Es)│ │
│ │ • Curah Hujan: 0.0 mm/jam • Kecepatan Angin: 8 km/h    │ 14:00 WIB: 30°C • Berawan                 │ │
│ │ • Status Operasional: 🟢 SANGAT AMAN UNTUK BERKELILING │ 17:00 WIB: 28°C • Hujan Ringan (Waspada)  │ │
│ └────────────────────────────────────────────────────────┴───────────────────────────────────────────┘ │
└────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Modal Konfirmasi Khusus Spatial QA
1. **Modal Trigger Sync Overpass (Background Process):**
   - Konfirmasi penarikan ulang dataset dari satelit OpenStreetMap melalui mirror server dengan estimasi waktu 15–30 detik.
2. **Modal Approve Promoted Dataset (Dataset-Level Approval):**
   - Ringkasan kualitas data sebelum dataset resmi dijadikan Single Source of Truth (SSOT) untuk engine DSS.
