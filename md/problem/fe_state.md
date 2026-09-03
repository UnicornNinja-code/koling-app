Listed directory src
Listed directory pages
Listed directory superadmin
Listed directory auth
Listed directory rider
Listed directory supervisor
Listed directory setup
Listed directory steps
Listed directory components
Listed directory map
Viewed MonitoringMap.svelte:1-100
Viewed MonitoringMap.svelte:100-300
Viewed SuperAdminDistributionPage.svelte:1-100
Viewed SuperAdminDistributionPage.svelte:400-576
Viewed SuperAdminSettingsPage.svelte:1-100
Viewed SuperAdminCatalogPage.svelte:1-80
Viewed SupervisorCatalogPage.svelte:1-100
Viewed RiderDashboardPage.svelte:1-100
Viewed SuperAdminDssPage.svelte:1-100
Viewed BwmCalibrationTab.svelte:1-60
Viewed DssCalibrationStep.svelte:1-60
Viewed App.svelte:1-150
Viewed App.svelte:151-305
Listed directory ui
Viewed MoraLoading.svelte:1-25
Listed directory lib
Listed directory components
Listed directory ui
Listed directory services
Listed directory stores
Listed directory layout
Viewed AppShell.svelte:1-100
Viewed SuperAdminDashboardPage.svelte:1-100
Viewed SuperAdminReportsPage.svelte:1-100
Viewed RegisterPage.svelte:1-100
Viewed FirstLoginPage.svelte:30-70
Searched for "leaflet"
Viewed HubLocationPicker.svelte:35-65
Viewed RadiusPreviewMap.svelte:30-60
Viewed MapPreferencePreview.svelte:30-70
Viewed DashboardMiniMap.svelte:140-180
Viewed axios.ts:1-100
Searched for "fetch("
Viewed app.css:1-100

# FRONTEND ARCHITECTURE AUDIT — READ ONLY
**Aplikasi:** MOVA (*Mobile Operations & Visibility Analytics*)  
**Frontend Stack:** Svelte 5 (Runes), Bun 1.4, Leaflet GIS, TypeScript, Tailwind CSS  
**Lingkup Audit:** Analisis arsitektur, modularitas komponen, duplikasi kode, integrasi Leaflet, manajemen state, performa, dan konsistensi desain UI.

---

## Executive Summary

Kondisi frontend MOVA menunjukkan pondasi arsitektur data yang baik pada level service API dan store reaktif Svelte 5 (`$state`, `$derived`, `$effect`), serta desain visual *Dark Bento Grid* yang kuat. Namun, audit menemukan beberapa area kritis yang memerlukan perbaikan struktural:

1. **Inkonsistensi Pemuatan Leaflet**: Terdapat 3 mekanisme pemuatan Leaflet yang saling bertentangan dalam satu project (impor dinamis NPM, injeksi `<script>` CDN dari unpkg, dan *polling* `window.L` via `setTimeout`).
2. **Bundel Monolitik (Zero Route Code-Splitting)**: Seluruh 15 halaman diimpor secara statis di [App.svelte](file:///f:/project_zero/bun_svelte/frontend/src/App.svelte), menghasilkan bundel awal sebesar **913.78 kB** yang diunduh bahkan saat pengguna hanya mengakses halaman login.
3. **Komponen Halaman Terlalu Besar (*Fat Pages*)**: Beberapa halaman seperti [SuperAdminSettingsPage.svelte](file:///f:/project_zero/bun_svelte/frontend/src/pages/superadmin/SuperAdminSettingsPage.svelte) (761 LOC) dan [SuperAdminDistributionPage.svelte](file:///f:/project_zero/bun_svelte/frontend/src/pages/superadmin/SuperAdminDistributionPage.svelte) (576 LOC) masih menggabungkan multi-tab, inisialisasi peta mandiri, dan modal form inline.
4. **Duplikasi Logika Bisnis & Domain**: Modul kalibrasi DSS BWM terduplikasi hampir 90% antara langkah *onboarding* ([DssCalibrationStep.svelte](file:///f:/project_zero/bun_svelte/frontend/src/pages/setup/steps/DssCalibrationStep.svelte)) dan halaman operasional admin ([BwmCalibrationTab.svelte](file:///f:/project_zero/bun_svelte/frontend/src/components/dss/BwmCalibrationTab.svelte)).

### Scorecard Rating

| Dimensi | Skor | Catatan Evaluasi |
| :--- | :---: | :--- |
| **Architecture** | **7.2 / 10** | Service terpusat berbasis Axios berjalan baik; kelemahan utama pada routing monolitik dan pemuatan Leaflet yang tidak seragam. |
| **Componentization** | **6.8 / 10** | Map panels dan auth captcha sudah rapi; AppShell, Settings, dan Distribution masih memuat modal dan tab inline. |
| **Reusability** | **6.5 / 10** | Komponen UI dasar (`Button`, `Input`, `Badge`) tersedia namun jarang diadopsi halaman utama (lebih banyak raw HTML). |
| **Maintainability** | **6.8 / 10** | Tipestart TypeScript di services rapi, namun data statis crowd profile C3 (~150 LOC) masih tertanam di file komponen UI peta. |
| **Performance** | **6.2 / 10** | Bundel awal berat (>900 kB); [DashboardMiniMap.svelte](file:///f:/project_zero/bun_svelte/frontend/src/components/dashboard/DashboardMiniMap.svelte) memuat ratusan fitur jalan protokol tanpa kompresi spasial untuk thumbnail 250px. |
| **Consistency** | **6.5 / 10** | [SupervisorCatalogPage.svelte](file:///f:/project_zero/bun_svelte/frontend/src/pages/supervisor/SupervisorCatalogPage.svelte) menyimpang ke tema terang dan menggunakan emoji, kontras dengan *Dark Bento* sistem. |

---

## Critical Issues

| Priority | File / Modul | Issue | Impact | Rekomendasi |
| :---: | :--- | :--- | :--- | :--- |
| **P0** | [`HubLocationPicker.svelte`](file:///f:/project_zero/bun_svelte/frontend/src/components/map/HubLocationPicker.svelte)<br>[`RadiusPreviewMap.svelte`](file:///f:/project_zero/bun_svelte/frontend/src/components/map/RadiusPreviewMap.svelte)<br>[`MapPreferencePreview.svelte`](file:///f:/project_zero/bun_svelte/frontend/src/components/map/MapPreferencePreview.svelte) | Injeksi script eksternal `unpkg.com/leaflet@1.9.4` di `HubLocationPicker`, sementara komponen lain melakukan *polling* `window.L` via `setTimeout(initMap, 150)`. | Jika koneksi offline, lambat, atau CDN unpkg diblokir/gagal, komponen mengalami *infinite timeout loop* atau crash fatal. | Satukan seluruh inisialisasi Leaflet menggunakan *singleton loader* lokal dari paket NPM `leaflet`. |
| **P1** | [`App.svelte`](file:///f:/project_zero/bun_svelte/frontend/src/App.svelte) | Seluruh 15 route halaman utama diimpor statis di baris 4–27. Tidak ada *code splitting* atau *lazy loading*. | File `index-CFkmhCuL.js` membengkak hingga 913 kB. Pengguna yang hanya ingin login terpaksa mengunduh modul GIS peta dan DSS. | Terapkan *route-based dynamic import* menggunakan `async () => (await import('./pages/...')).default`. |
| **P1** | [`DssCalibrationStep.svelte`](file:///f:/project_zero/bun_svelte/frontend/src/pages/setup/steps/DssCalibrationStep.svelte)<br>vs<br>[`BwmCalibrationTab.svelte`](file:///f:/project_zero/bun_svelte/frontend/src/components/dss/BwmCalibrationTab.svelte) | Duplikasi logika matriks BWM (definisi C1-C6, Saaty scale 1-9, kalkulasi vektor Best-to-Others & Others-to-Worst, dan payload solver LP). | Dua versi kalkulasi BWM yang rawan desinkronisasi bobot kriteria jika salah satu diperbarui tanpa memperbarui yang lain. | Ekstrak konstanta kriteria dan fungsi kalkulasi vektor BWM ke domain service `dssService.ts` / komponen shared `BwmWizardCore.svelte`. |
| **P1** | [`DashboardMiniMap.svelte`](file:///f:/project_zero/bun_svelte/frontend/src/components/dashboard/DashboardMiniMap.svelte) | Memanggil `getProtocolRoads()` (885 fitur polyline) dan `getTollRoads()` untuk widget thumbnail 250px di dashboard. | Beban memory, parsing GeoJSON masif di UI thread, dan pemborosan bandwidth jaringan saat dashboard dibuka. | Matikan layer detail jalan protokol di mini-map atau buat endpoint backend khusus *lightweight bounding box / snapshot*. |
| **P2** | [`SuperAdminSettingsPage.svelte`](file:///f:/project_zero/bun_svelte/frontend/src/pages/superadmin/SuperAdminSettingsPage.svelte) | 5 tab besar (Hub, Rules, Schedule, Security, Readiness) ditulis dalam 1 file 761 baris, lengkap dengan pembuatan peta Leaflet manual. | Sangat sulit di-*maintain*, risiko bentrok state antar tab, dan menduplikasi logika peta yang sudah ada di modul onboarding. | Pecah 5 tab menjadi subkomponen terpisah di `components/settings/` dan gunakan kembali `HubLocationPicker`. |
| **P2** | [`AppShell.svelte`](file:///f:/project_zero/bun_svelte/frontend/src/components/layout/AppShell.svelte) | Sidebar, Topbar navigasi, Notification dropdown, dan User profile dropdown ditulis menyatu dalam 472 baris kode. | Struktur layout menjadi padat, event handling navigasi bercampur dengan logika polling notifikasi PostgreSQL. | Ekstrak menjadi `Sidebar.svelte`, `TopNavbar.svelte`, `NotificationDropdown.svelte`, dan `UserDropdown.svelte`. |
| **P2** | [`RiderDashboardPage.svelte`](file:///f:/project_zero/bun_svelte/frontend/src/pages/rider/RiderDashboardPage.svelte) | Hardcoded data statis pada state: `totalSalesToday = 195000`, `shiftTargetCups = 20`, serta koordinat manual GPS `-7.4478, 112.7183`. | Informasi di layar rider tidak mencerminkan data riil backend, dan multi-tab (Home, Catalog, Hotspots, Profile) menyatu dalam satu file. | Ambil statistik penjualan dari `riderService`, gunakan `navigator.geolocation`, dan pisahkan 4 tab ke subkomponen. |
| **P3** | [`SupervisorCatalogPage.svelte`](file:///f:/project_zero/bun_svelte/frontend/src/pages/supervisor/SupervisorCatalogPage.svelte) | Desain menggunakan warna terang (`bg-[#F4F4F6]`, `border-[#D2D2D4]`) dan emoji (`👁️`), bertolak belakang dari *Dark Bento Grid*. | Pelanggaran konsistensi UI MOVA dan aturan larangan emoji pada antarmuka sistem. | Samakan styling dengan `SuperAdminCatalogPage` (Dark Bento) dan ganti emoji dengan Lucide icon. |
| **P3** | File Orphaned / Residue | Terdapat file sisa starter/duplikat: `src/lib/Counter.svelte`, `src/lib/components/ui/mora-loading.svelte`, dan `src/components/ui/MoraLoading.svelte`. | Kebingungan import (*dead code*) dan memperbesar ukuran repositori. | Hapus file residu yang tidak digunakan. |

---

## Componentization Opportunities

### 1. `AppShell.svelte` Breakdown
- **Lokasi Saat Ini**: [`src/components/layout/AppShell.svelte`](file:///f:/project_zero/bun_svelte/frontend/src/components/layout/AppShell.svelte) (472 LOC)
- **Tanggung Jawab Saat Ini**: Menyediakan shell aplikasi, mengelola navigasi menu sidebar desktop/mobile, rendering header pencarian, polling & mark-as-read notifikasi, dan user dropdown session info.
- **Masalah**: Single responsibility dilanggar secara masif. Logika notifikasi bercampur dengan navigasi rute dan rendering profil user.
- **Rekomendasi Pemisahan**:
  - `src/components/layout/Sidebar.svelte`: Khusus navigasi, status active item, dan responsive collapse.
  - `src/components/layout/TopNavbar.svelte`: Kontainer top bar dengan breadcrumb/search global.
  - `src/components/layout/NotificationDropdown.svelte`: Khusus polling, list notifikasi, dan aksi mark-as-read.
  - `src/components/layout/UserDropdown.svelte`: Info akun, countdown sesi, dan tombol logout.
- **Reuse Potential**: MEDIUM (digunakan terpusat di seluruh authenticated routes).
- **Risk**: LOW (props dan event sudah sangat jelas terisolasi).

---

### 2. `SuperAdminSettingsPage.svelte` Multi-Tab Modules
- **Lokasi Saat Ini**: [`src/pages/superadmin/SuperAdminSettingsPage.svelte`](file:///f:/project_zero/bun_svelte/frontend/src/pages/superadmin/SuperAdminSettingsPage.svelte) (761 LOC)
- **Tanggung Jawab Saat Ini**: Mengelola 5 domain pengaturan (Hub Geografis, Proteksi Jalur Spasial, Jam Operasional/Shift, Keamanan Token & Sesi, serta Diagnostik System Readiness).
- **Masalah**: Menginisialisasi peta Leaflet sendiri secara manual pada tab Hub, padahal komponen `HubLocationPicker` dan `RadiusPreviewMap` sudah ada.
- **Rekomendasi Pemisahan**:
  - `src/components/settings/SettingsHubTab.svelte`
  - `src/components/settings/SettingsSpatialRulesTab.svelte`
  - `src/components/settings/SettingsScheduleTab.svelte`
  - `src/components/settings/SettingsSecurityTab.svelte`
  - `src/components/settings/SettingsReadinessTab.svelte`
- **Reuse Potential**: LOW untuk tab lain, HIGH untuk integrasi peta Hub.
- **Risk**: LOW (halaman sudah memiliki tab selector terstruktur).

---

### 3. `SuperAdminDistributionPage.svelte` Sub-Panels & Modal
- **Lokasi Saat Ini**: [`src/pages/superadmin/SuperAdminDistributionPage.svelte`](file:///f:/project_zero/bun_svelte/frontend/src/pages/superadmin/SuperAdminDistributionPage.svelte) (576 LOC)
- **Tanggung Jawab Saat Ini**: Orchestrator distribusi plotting, tabel penugasan aktif, antrian rider check-in, ranking zona TOPSIS, dan form modal penugasan manual.
- **Masalah**: Form manual penugasan rider (baris 493–575) ditulis inline di dalam page, sementara modal lain (`DistributionPreviewModal`, `DistributionRunsModal`) sudah dipisah.
- **Rekomendasi Pemisahan**:
  - `src/components/distribution/ManualAssignmentModal.svelte`: Form modal pemilihan rider, zona, dan armada.
  - `src/components/distribution/DutyQueueList.svelte`: Widget daftar antrian rider check-in dan aksi no-show.
  - `src/components/distribution/ZoneTopsisRankingCard.svelte`: Widget pemeringkatan zona TOPSIS dan kapasitas kuota.
- **Reuse Potential**: MEDIUM.
- **Risk**: LOW.

---

### 4. `MonitoringMap.svelte` Domain Crowd Profiles
- **Lokasi Saat Ini**: [`src/components/map/MonitoringMap.svelte`](file:///f:/project_zero/bun_svelte/frontend/src/components/map/MonitoringMap.svelte) (1,103 LOC)
- **Tanggung Jawab Saat Ini**: Menginisialisasi Leaflet, merender layer spasial, dan menyimpan dictionary matrix C3 (baris 112–228).
- **Masalah**: `timeSlotDefinitions`, `categoryCrowdProfiles`, dan fungsi `mapPoiToGroup` memakan lebih dari 120 baris data murni yang sifatnya statis/domain config di dalam script komponen UI.
- **Rekomendasi Pemisahan**:
  - Ekstrak ke `src/lib/constants/crowdProfiles.ts`.
- **Reuse Potential**: HIGH (bisa digunakan juga pada step onboarding C3 dan halaman simulasi DSS).
- **Risk**: LOW.

---

### 5. Shared Password Strength & Validation Component
- **Lokasi Saat Ini**:
  - [`RegisterPage.svelte`](file:///f:/project_zero/bun_svelte/frontend/src/pages/auth/RegisterPage.svelte) (baris 43–47)
  - [`ResetPasswordPage.svelte`](file:///f:/project_zero/bun_svelte/frontend/src/pages/auth/ResetPasswordPage.svelte) (baris 35–40)
  - [`FirstLoginPage.svelte`](file:///f:/project_zero/bun_svelte/frontend/src/pages/auth/FirstLoginPage.svelte) (baris 29–43)
- **Tanggung Jawab Saat Ini**: Menghitung skor kekuatan sandi (panjang, huruf besar, angka, simbol) dan menampilkan progress bar warna serta checklist validasi.
- **Masalah**: Logika perhitungan dan markup checklist diulang 3 kali di halaman auth yang berbeda.
- **Rekomendasi Pemisahan**:
  - `src/components/auth/PasswordStrengthMeter.svelte`: Menerima prop `password` dan merender bar meter serta checklist visual.
- **Reuse Potential**: HIGH (digunakan di seluruh alur aktivasi dan reset password).
- **Risk**: LOW.

---

## Duplication Report

| Lokasi A | Lokasi B | Tipe Duplikasi | Dampak & Rekomendasi |
| :--- | :--- | :---: | :--- |
| [`DssCalibrationStep.svelte`](file:///f:/project_zero/bun_svelte/frontend/src/pages/setup/steps/DssCalibrationStep.svelte) | [`BwmCalibrationTab.svelte`](file:///f:/project_zero/bun_svelte/frontend/src/components/dss/BwmCalibrationTab.svelte) | **LOGIC & STRUCTURAL** | Definisi kriteria C1-C6, deskripsi skala Saaty 1–9, form slider perbandingan, dan pemanggilan API solver LP ditulis berulang. Satukan modul kalkulator BWM menjadi komponen reusable. |
| [`RegisterPage.svelte`](file:///f:/project_zero/bun_svelte/frontend/src/pages/auth/RegisterPage.svelte) | [`ResetPasswordPage.svelte`](file:///f:/project_zero/bun_svelte/frontend/src/pages/auth/ResetPasswordPage.svelte) | **STRUCTURAL & LOGIC** | Evaluasi regex password (`hasMinLength`, `hasUppercase`, `hasNumber`, `isMatching`) dan markup pesan error berulang. Ekstrak ke komponen helper password. |
| [`HubLocationPicker.svelte`](file:///f:/project_zero/bun_svelte/frontend/src/components/map/HubLocationPicker.svelte) | [`SuperAdminSettingsPage.svelte`](file:///f:/project_zero/bun_svelte/frontend/src/pages/superadmin/SuperAdminSettingsPage.svelte) | **LOGIC DUPLICATION** | Pengambilan koordinat Central Hub, reverse-geocoding, marker draggable, dan sinkronisasi radius Leaflet ditulis ulang. Gunakan `HubLocationPicker` langsung di halaman Settings. |
| [`SuperAdminCatalogPage.svelte`](file:///f:/project_zero/bun_svelte/frontend/src/pages/superadmin/SuperAdminCatalogPage.svelte) | [`SupervisorCatalogPage.svelte`](file:///f:/project_zero/bun_svelte/frontend/src/pages/supervisor/SupervisorCatalogPage.svelte) | **STRUCTURAL DUPLICATION** | Toolbar filter kategori (Semua, Kopi, Non-Kopi, Makanan) dan input pencarian produk diulang. Halaman supervisor hanya membutuhkan flag `readOnly={true}` pada halaman katalog utama. |
| `src/lib/components/ui/mora-loading.svelte` | `src/components/ui/MoraLoading.svelte` | **EXACT DUPLICATION** | Dua file identik di dua direktori berbeda yang hanya membungkus `MovaLoading.svelte`. Hapus file pembungkus duplikat. |
| [`MonitoringMap.svelte`](file:///f:/project_zero/bun_svelte/frontend/src/components/map/MonitoringMap.svelte) | [`DashboardMiniMap.svelte`](file:///f:/project_zero/bun_svelte/frontend/src/components/dashboard/DashboardMiniMap.svelte) | **LOGIC DUPLICATION** | Fetching API serentak untuk jalan protokol, jalan tol, dan poligon zona diulang persis tanpa caching. Gunakan TanStack Query atau shared in-memory layer cache. |

---

## Page Complexity Ranking

| Rank | Page / Component | LOC | Ukuran | Tanggung Jawab Utama | Tingkat Kompleksitas | Rekomendasi Utama |
| :---: | :--- | :---: | :---: | :--- | :---: | :--- |
| 1 | [`MonitoringMap.svelte`](file:///f:/project_zero/bun_svelte/frontend/src/components/map/MonitoringMap.svelte) | 1,103 | 45.0 KB | Visualisasi peta GIS, 6 layer groups, WebSocket rider telemetry, C3 crowd matrix, geocoding Nominatim, rendering custom HTML marker. | **EXTREME** | Ekstrak kamus data C3 ke file constants terpisah; pindahkan pembuatan icon SVG marker ke factory helper. |
| 2 | [`SuperAdminSettingsPage.svelte`](file:///f:/project_zero/bun_svelte/frontend/src/pages/superadmin/SuperAdminSettingsPage.svelte) | 761 | 33.7 KB | Orchestrator 5 konfigurasi (Hub, Spasial, Jadwal, Keamanan, Readiness), form handling, Leaflet map generator. | **VERY HIGH** | Pecah menjadi 5 subkomponen tab terisolasi; ganti peta manual dengan `HubLocationPicker`. |
| 3 | [`SuperAdminZonesPage.svelte`](file:///f:/project_zero/bun_svelte/frontend/src/pages/superadmin/SuperAdminZonesPage.svelte) | 936 | 37.1 KB | Mengelola poligon geofence, layer postgis jalan/tol/poi, drawing mode polygon, kalkulasi luas, validasi overlap spasial. | **HIGH** | Pindahkan logika validasi geometri spasial (Ray-casting / Turf.js) ke utility `geoUtils.ts`. |
| 4 | [`BwmCalibrationTab.svelte`](file:///f:/project_zero/bun_svelte/frontend/src/components/dss/BwmCalibrationTab.svelte) | 823 | 35.8 KB | Wizard interaktif BWM 3-tahap, kalkulasi konsistensi matematis, visualisasi drawer audit LP solver. | **HIGH** | Delegasikan kalkulasi bobot LP dan Saaty scale ke shared core engine. |
| 5 | [`SuperAdminDistributionPage.svelte`](file:///f:/project_zero/bun_svelte/frontend/src/pages/superadmin/SuperAdminDistributionPage.svelte) | 576 | 24.8 KB | Orchestration distribusi shift, preview TOPSIS, antrean rider, tabel assignment, manual allocation modal. | **HIGH** | Ekstrak modal manual assignment dan kartu ranking zona ke file terpisah. |
| 6 | [`DssCalibrationStep.svelte`](file:///f:/project_zero/bun_svelte/frontend/src/pages/setup/steps/DssCalibrationStep.svelte) | 560 | 24.7 KB | Implementasi wizard BWM khusus onboarding dengan animasi visual dan step locking. | **HIGH** | Gunakan kembali engine BWM yang sama dengan modul admin. |
| 7 | [`AppShell.svelte`](file:///f:/project_zero/bun_svelte/frontend/src/components/layout/AppShell.svelte) | 472 | 22.2 KB | Layout aplikasi, sidebar collapse state, notifikasi polling, user menu, navigation guards. | **MEDIUM-HIGH** | Dekomposisi layout menjadi 4 subkomponen spesifik. |
| 8 | [`RiderDashboardPage.svelte`](file:///f:/project_zero/bun_svelte/frontend/src/pages/rider/RiderDashboardPage.svelte) | 429 | 17.5 KB | Mobile UI rider, 4 tab (Home, Catalog, Hotspot, Profile), quick order simulation, GPS check-in. | **MEDIUM** | Pisahkan tab menjadi komponen independen dan hubungkan ke service API nyata. |
| 9 | [`RegisterPage.svelte`](file:///f:/project_zero/bun_svelte/frontend/src/pages/auth/RegisterPage.svelte) | 411 | 17.7 KB | Token URL verification, multi-step user activation, validasi tanggal lahir dan kata sandi. | **MEDIUM** | Ekstrak form step dan password strength meter. |
| 10 | [`SuperAdminDashboardPage.svelte`](file:///f:/project_zero/bun_svelte/frontend/src/pages/superadmin/SuperAdminDashboardPage.svelte) | 374 | 14.0 KB | Dashboard agregator KPI, audit logs feed, sales trend chart, mini-map summary. | **LOW-MEDIUM** | Sudah cukup baik terkomponentisasi; perlu optimalisasi data query pada mini-map. |

---

## Leaflet Architecture

### Kondisi Saat Ini
Integrasi Leaflet di MOVA saat ini terfragmentasi dan memiliki beberapa titik risiko stabilitas:

```
LEAFLET ARCHITECTURE MAP (CURRENT STATE)
├── Ingestion / Loading Mode:
│   ├── HubLocationPicker.svelte ───> document.createElement('script') CDN unpkg.com [RISIKO NETWORK]
│   ├── RadiusPreviewMap.svelte ────> Polling window.L via setTimeout(..., 150) [FRAGILE]
│   ├── MapPreferencePreview.svelte > Polling window.L via setTimeout(..., 150) [FRAGILE]
│   ├── MonitoringMap.svelte ───────> Dynamic import('leaflet') lokal NPM [STABIL]
│   ├── DashboardMiniMap.svelte ────> Dynamic import('leaflet') lokal NPM [STABIL]
│   └── SuperAdminZonesPage.svelte ─> Dynamic import('leaflet') lokal NPM [STABIL]
│
├── Layer Management:
│   ├── Basemap ───────────────────> createBasemapLayer() terpusat via mapProviders.ts [BAGUS]
│   ├── PostGIS Protocol Roads ────> Unduh penuh (885 fitur) tanpa spatial indexing
│   ├── Marker Creation ───────────> L.divIcon string HTML inline masif di script
│   └── Poligon Geofence ──────────> Konversi manual koordinat [lng, lat] vs [lat, lng] berulang
│
└── Lifecycle & Cleanup:
    ├── MonitoringMap ─────────────> mapInstance.remove() pada onDestroy [BAGUS]
    └── RadiusPreviewMap ──────────> Marker & circle tidak selalu di-clear sebelum render ulang
```

### Rekomendasi Arsitektur Peta Sehat
Buat modul loader Leaflet terpusat di `src/lib/leaflet/leafletLoader.ts`:
- Memuat Leaflet satu kali dari bundel lokal NPM secara aman (*SSR-safe*).
- Menyediakan helper pembuatan marker konsisten (*Marker Factory*) sehingga tidak ada penulisan template HTML SVG marker berulang di berbagai file.
- Standarisasi siklus hidup: `initMap` -> `bindLayers` -> `cleanupOnDestroy`.

---

## API & Data Layer

### Evaluasi Kepatuhan
1. **Axios Centralized Client (`src/lib/axios.ts`)**: **Sangat Baik**. Mengimplementasikan interceptor token JWT otomatis, refresh token pada error 401, serta penanganan event `auth:first_login_required` secara global sesuai panduan `AGENTS.md`.
2. **Layer Service (`src/services/*.ts`)**: **Sangat Baik**. Seluruh komunikasi HTTP backend telah dibungkus ke dalam 16 modul service bertipe data TypeScript yang jelas (`armadaService`, `zoneService`, `dssService`, dll).
3. **Kekurangan**:
   - **Ketiadaan Data Caching Layer (TanStack Query / SWR)**: Setiap kali berpindah rute dan kembali lagi, request API dieksekusi ulang secara penuh tanpa deduping atau *stale-while-revalidate*.
   - **Over-fetching di Widget Kecil**: Endpoint `getProtocolRoads()` mengembalikan GeoJSON lengkap yang berat, padahal hanya dibutuhkan oleh halaman Map Ops dan Zone Admin.

---

## Performance Issues

| Severity | Lokasi | Masalah | Dampak Performa | Rekomendasi |
| :---: | :--- | :--- | :--- | :--- |
| **HIGH** | [`App.svelte`](file:///f:/project_zero/bun_svelte/frontend/src/App.svelte) | Static import seluruh 15 halaman di root. | Bundel awal JavaScript mencapai ~914 kB, memperlambat *First Contentful Paint (FCP)* di jaringan mobile. | Ubah ke dynamic lazy loading menggunakan async component loader. |
| **HIGH** | [`DashboardMiniMap.svelte`](file:///f:/project_zero/bun_svelte/frontend/src/components/dashboard/DashboardMiniMap.svelte) | Mengunduh ratusan polyline jalan protokol & tol untuk thumbnail statis 250px. | Membebani memory browser dan memblokir rendering dashboard saat pertama kali dibuka. | Hapus layer jalan protokol dari mini-map atau ganti dengan gambar statis/vektor ringkas. |
| **MEDIUM** | [`MonitoringMap.svelte`](file:///f:/project_zero/bun_svelte/frontend/src/components/map/MonitoringMap.svelte) | `renderPois()` menghapus seluruh layer dan membuat ulang ratusan marker HTML setiap kali filter kategori diganti. | Stutter / drop frame saat pengguna mengklik pill kategori POI di panel layers. | Simpan referensi marker dalam Map/Dictionary dan ubah visibilitas via `.addTo()` / `.removeLayer()` tanpa membuat ulang objek DOM. |
| **MEDIUM** | [`RiderDashboardPage.svelte`](file:///f:/project_zero/bun_svelte/frontend/src/pages/rider/RiderDashboardPage.svelte) | Hardcoded mock interval order timer dan state yang tidak dibersihkan saat navigasi keluar. | Potensi *memory leak* pada perangkat handphone rider di lapangan. | Pasang timer cleanup pada blok `$effect` return function. |

---

## Recommended Component Architecture

Rekomendasi penataan arsitektur direktori frontend secara terorganisir tanpa over-engineering:

```
src/
├── lib/
│   ├── api/                     # Axios instance & interceptors
│   │   └── axios.ts
│   ├── constants/               # Kamus data statis & konfigurasi domain
│   │   ├── crowdProfiles.ts     # C3 time slot definitions & categories
│   │   └── bwmCriteria.ts       # Definisi kriteria C1-C6 & Saaty matrix
│   ├── leaflet/                 # Core wrapper & helper Leaflet
│   │   ├── leafletLoader.ts     # Singleton loader Leaflet NPM
│   │   ├── markerFactory.ts     # Builder marker HTML/SVG konsisten
│   │   └── mapProviders.ts      # OpenMapTiles & CartoDB tile presets
│   ├── stores/                  # Svelte 5 runes global state
│   │   ├── auth.svelte.ts
│   │   ├── setupStore.svelte.ts
│   │   └── confirmModal.svelte.ts
│   └── utils/                   # Geo & general utilities (Turf/Raycasting)
│       └── geoUtils.ts
│
├── components/
│   ├── layout/                  # Shell & shell parts terkomposisi
│   │   ├── AppShell.svelte
│   │   ├── Sidebar.svelte
│   │   ├── TopNavbar.svelte
│   │   ├── NotificationDropdown.svelte
│   │   └── UserDropdown.svelte
│   ├── ui/                      # Komponen UI atomik murni
│   │   ├── Button.svelte
│   │   ├── Input.svelte
│   │   ├── Badge.svelte
│   │   ├── Modal.svelte
│   │   └── Alert.svelte
│   ├── auth/                    # Komponen spesifik alur autentikasi
│   │   ├── CaptchaChallenge.svelte
│   │   └── PasswordStrengthMeter.svelte
│   ├── map/                     # Komponen GIS & panel Map Ops
│   │   ├── MonitoringMap.svelte
│   │   ├── HubLocationPicker.svelte
│   │   ├── RadiusPreviewMap.svelte
│   │   └── panels/              # 8 sub-panel Map Ops yang sudah rapi
│   ├── dss/                     # Komponen kalkulator DSS
│   │   ├── BwmWizardCore.svelte # Shared wizard BWM (dipakai onboarding & admin)
│   │   └── TopsisSimulationTab.svelte
│   ├── distribution/            # Komponen alur distribusi & plotting
│   │   ├── ManualAssignmentModal.svelte
│   │   ├── DutyQueueList.svelte
│   │   └── ZoneTopsisRankingCard.svelte
│   └── settings/                # Sub-tab halaman pengaturan sistem
│       ├── SettingsHubTab.svelte
│       └── SettingsReadinessTab.svelte
│
├── pages/                       # Halaman route (hanya orchestrator tipis)
│   ├── auth/
│   ├── setup/
│   ├── superadmin/
│   └── rider/
│
└── services/                    # REST API client terpusat (16 services)
```

---

## Refactoring Priority

```
URUTAN DEPENDENSI REFACTOR:
PHASE 1 (Stabilisasi Leaflet & Performa Bundel Awal)
       │
       ▼
PHASE 2 (Dekomposisi Komponen Halaman Besar: Settings, Shell, Distribution)
       │
       ▼
PHASE 3 (Konsolidasi Logika Domain & Deduplikasi DSS BWM)
```

### PHASE 1 — Safe / High-Impact Performa (Low Risk)
1. **Standardisasi Leaflet Loader**: Ganti injeksi script CDN unpkg di `HubLocationPicker` dan polling `setTimeout` di `RadiusPreviewMap` dengan singleton lokal NPM.
2. **Route Code-Splitting**: Bungkus impor halaman di `App.svelte` dengan dynamic import agar pengguna login tidak mengunduh modul GIS.
3. **Pembersihan File Residu**: Hapus `MoraLoading.svelte`, `mora-loading.svelte`, dan starter template `Counter.svelte`.
4. **Optimasi Dashboard Mini-Map**: Hapus pemanggilan 885 jalan protokol di `DashboardMiniMap.svelte`.

### PHASE 2 — Modularisasi Layout & Page Terlalu Besar (Medium Risk)
1. **Dekomposisi AppShell**: Ekstrak `Sidebar`, `TopNavbar`, `NotificationDropdown`, dan `UserDropdown`.
2. **Dekomposisi SuperAdminSettingsPage**: Pisahkan 5 tab pengaturan menjadi subkomponen di `components/settings/`.
3. **Dekomposisi SuperAdminDistributionPage**: Ekstrak `ManualAssignmentModal` dan widget antrean rider.
4. **Modularisasi RiderDashboardPage**: Pisahkan 4 tab tampilan rider dan bersihkan hardcoded state.

### PHASE 3 — Konsolidasi Logika Domain (Architectural / Medium-High Risk)
1. **Konsolidasi BWM Wizard**: Satukan logika `DssCalibrationStep.svelte` dan `BwmCalibrationTab.svelte` ke satu modul shared `BwmWizardCore.svelte`.
2. **Penyelarasan Desain Supervisor**: Ubah `SupervisorCatalogPage.svelte` agar menggunakan Dark Bento Grid dan singkirkan emoji.
3. **Password Validation Unification**: Gunakan `PasswordStrengthMeter` bersama untuk Register, Reset Password, dan First Login.

---

## TOP 10 RECOMMENDED REFACTORING

Urutan prioritas berdasarkan dampak terbesar terhadap **stabilitas operasional**, **keandalan aplikasi**, dan **kemudahan pemeliharaan**:

### 1. Standardisasi Leaflet Loader Lokal
- **File**: [`src/components/map/HubLocationPicker.svelte`](file:///f:/project_zero/bun_svelte/frontend/src/components/map/HubLocationPicker.svelte), [`src/components/map/RadiusPreviewMap.svelte`](file:///f:/project_zero/bun_svelte/frontend/src/components/map/RadiusPreviewMap.svelte), [`src/components/map/MapPreferencePreview.svelte`](file:///f:/project_zero/bun_svelte/frontend/src/components/map/MapPreferencePreview.svelte)
- **Problem**: Penggunaan CDN script tag eksternal dan *polling* `window.L` via `setTimeout` interval 150ms.
- **Why**: Rawan *infinite loop*, gagal saat koneksi tidak stabil/offline, dan melanggar prinsip kemandirian aplikasi lokal.
- **Recommended Solution**: Buat helper singleton `leafletLoader.ts` yang memuat Leaflet dari `node_modules` secara aman.
- **Risk**: LOW.
- **Estimated Effort**: **S** (Small).

---

### 2. Code-Splitting & Route Lazy Loading
- **File**: [`src/App.svelte`](file:///f:/project_zero/bun_svelte/frontend/src/App.svelte)
- **Problem**: Seluruh halaman diimpor langsung secara statis di level atas.
- **Why**: Ukuran bundel JavaScript utama mencapai ~914 kB. User login harus mengunduh kode GIS dan DSS yang belum dibutuhkannya.
- **Recommended Solution**: Gunakan dynamic import berbasis rute dengan fallback loading sederhana.
- **Risk**: LOW.
- **Estimated Effort**: **S** (Small).

---

### 3. Konsolidasi Engine Kalibrasi BWM
- **File**: [`src/pages/setup/steps/DssCalibrationStep.svelte`](file:///f:/project_zero/bun_svelte/frontend/src/pages/setup/steps/DssCalibrationStep.svelte) & [`src/components/dss/BwmCalibrationTab.svelte`](file:///f:/project_zero/bun_svelte/frontend/src/components/dss/BwmCalibrationTab.svelte)
- **Problem**: Duplikasi masif logika form BWM, slider Saaty 1–9, dan payload solver linear programming.
- **Why**: Jika ada perubahan formula atau kriteria DSS, salah satu file rentan terlewat dan menyebabkan inkonsistensi bobot kriteria sistem.
- **Recommended Solution**: Ekstrak konstanta kriteria ke `bwmCriteria.ts` dan buat komponen wizard kalkulasi BWM terpadu.
- **Risk**: MEDIUM.
- **Estimated Effort**: **M** (Medium).

---

### 4. Peringanan Beban Data Dashboard Mini-Map
- **File**: [`src/components/dashboard/DashboardMiniMap.svelte`](file:///f:/project_zero/bun_svelte/frontend/src/components/dashboard/DashboardMiniMap.svelte)
- **Problem**: Mengunduh seluruh layer jalan protokol (885 fitur) dan jalan tol untuk kotak thumbnail kecil.
- **Why**: Memperlambat rendering halaman ringkasan dashboard dan memboroskan pemakaian memori pengguna.
- **Recommended Solution**: Nonaktifkan layer jalan protokol dan jalan tol pada mini-map; hanya tampilkan titik Central Hub dan poligon zona aktif.
- **Risk**: LOW.
- **Estimated Effort**: **S** (Small).

---

### 5. Dekomposisi Multi-Tab `SuperAdminSettingsPage`
- **File**: [`src/pages/superadmin/SuperAdminSettingsPage.svelte`](file:///f:/project_zero/bun_svelte/frontend/src/pages/superadmin/SuperAdminSettingsPage.svelte)
- **Problem**: 761 baris kode menggabungkan 5 tab berbeda dan re-inisialisasi peta Leaflet manual.
- **Why**: Menurunkan maintainability dan membingungkan developer ketika ingin mengedit satu pengaturan spesifik.
- **Recommended Solution**: Pecah menjadi 5 file tab di `components/settings/` dan gunakan `HubLocationPicker` untuk pengaturan lokasi Hub.
- **Risk**: LOW.
- **Estimated Effort**: **M** (Medium).

---

### 6. Dekomposisi Komponen `AppShell`
- **File**: [`src/components/layout/AppShell.svelte`](file:///f:/project_zero/bun_svelte/frontend/src/components/layout/AppShell.svelte)
- **Problem**: 472 baris memuat Sidebar, Topbar, Notifikasi, dan Dropdown Pengguna secara inline.
- **Why**: Kode layout membengkak; sulit menambahkan fitur navigasi atau custom notifikasi baru tanpa menyentuh file utama.
- **Recommended Solution**: Pisahkan menjadi subkomponen `Sidebar.svelte`, `TopNavbar.svelte`, `NotificationDropdown.svelte`, dan `UserDropdown.svelte`.
- **Risk**: LOW.
- **Estimated Effort**: **S** (Small).

---

### 7. Ekstrak Kamus Data C3 Crowd Matrix dari Komponen UI
- **File**: [`src/components/map/MonitoringMap.svelte`](file:///f:/project_zero/bun_svelte/frontend/src/components/map/MonitoringMap.svelte)
- **Problem**: Matriks keramaian waktu C3 dan pemetaan kategori POI (~150 LOC) ditulis langsung di file `.svelte`.
- **Why**: Mengotori logika visual komponen peta; data tersebut sebenarnya adalah konstanta domain sistem yang harusnya bisa diakses modul lain.
- **Recommended Solution**: Pindahkan ke file TypeScript terpisah `src/lib/constants/crowdProfiles.ts`.
- **Risk**: LOW.
- **Estimated Effort**: **S** (Small).

---

### 8. Modularisasi Tab Halaman Rider & Sinkronisasi API
- **File**: [`src/pages/rider/RiderDashboardPage.svelte`](file:///f:/project_zero/bun_svelte/frontend/src/pages/rider/RiderDashboardPage.svelte)
- **Problem**: 4 tab (Home, Katalog, Hotspot, Profil) ditulis inline dan menggunakan hardcoded dummy sales serta koordinat GPS statis.
- **Why**: Tidak mencerminkan data dinamis dari backend dan membatasi pengembangan fitur khusus rider di masa depan.
- **Recommended Solution**: Pecah menjadi 4 subkomponen tab dan ganti data hardcoded dengan data responsif dari `riderService`.
- **Risk**: LOW.
- **Estimated Effort**: **M** (Medium).

---

### 9. Ekstrak Modal Manual Assignment pada Halaman Distribusi
- **File**: [`src/pages/superadmin/SuperAdminDistributionPage.svelte`](file:///f:/project_zero/bun_svelte/frontend/src/pages/superadmin/SuperAdminDistributionPage.svelte)
- **Problem**: Form modal manual penugasan rider (baris 493–575) ditulis inline di dalam page.
- **Why**: Pola tidak konsisten dengan modal preview dan runs log yang sudah dipisahkan ke komponen modal tersendiri.
- **Recommended Solution**: Ekstrak menjadi `ManualAssignmentModal.svelte` di direktori `src/components/distribution/`.
- **Risk**: LOW.
- **Estimated Effort**: **S** (Small).

---

### 10. Penyeragaman Styling & Penghapusan Emoji pada Halaman Supervisor
- **File**: [`src/pages/supervisor/SupervisorCatalogPage.svelte`](file:///f:/project_zero/bun_svelte/frontend/src/pages/supervisor/SupervisorCatalogPage.svelte)
- **Problem**: Satu-satunya halaman yang masih menggunakan palet abu-abu terang (`bg-[#F4F4F6]`) dan memuat emoji `👁️`.
- **Why**: Melanggar konsistensi identitas desain *Dark Bento Grid* dan aturan baku tanpa emoji pada sistem MOVA.
- **Recommended Solution**: Ubah styling agar konsisten dengan tema *Dark Bento* dan ganti emoji dengan Lucide icon (`Eye`).
- **Risk**: LOW.
- **Estimated Effort**: **S** (Small).