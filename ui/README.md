# MOVA UI/UX Architecture & RBAC Blueprint

Dokumen ini merupakan spesifikasi resmi arsitektur antarmuka pengguna (*UI*), pengalaman pengguna (*UX*), sistem desain, dan pemetaan hak akses berbasis peran (*Role-Based Access Control / RBAC*) untuk platform **MOVA (MantaKopi Decision Support System & Dynamic Fleet Optimization Platform)**, disusun berdasarkan kebutuhan pada [md/fitur.md](file:///f:/project_zero/md/fitur.md) dan alur operasional teruji pada [E2E_WORKFLOW_MAP.md](file:///f:/project_zero/E2E_WORKFLOW_MAP.md).

---

## 1. Prinsip Utama Desain & Arsitektur Antarmuka

1. **Role-Based Separation & Principle of Least Privilege**:
   - Setiap peran memiliki antarmuka yang disesuaikan secara presisi dengan tanggung jawab operasionalnya tanpa mencampuradukkan kompleksitas teknis:
     - **Super Admin**: Administrator sistem menyeluruh (Kalibrasi Master BWM, Parameter Spasial, Audit Forensik, Hak Akses Akun Penuh).
     - **Management**: Administrator sumber daya & akun bisnis (Hierarchical Account Management, Utilisasi Armada, Katalog Menu & Harga, Laporan Finansial/Bisnis).
     - **Supervisor**: Komando operasional harian Hub Surabaya (Eksekusi DSS TOPSIS, Plotting Rider FIFO, Monitoring Peta Spasial Map Ops, Emergency Swap, dan Verifikasi Settlement).
     - **Rider**: Antarmuka mobile PWA (*Progressive Web App*) terfokus (*clean & distraction-free*) berbasis *Full-Screen Step Pages* (Apel Pagi, Klaim Armada 180s, Check-in GPS Geofence, Kasir POS Idempotent, dan Settlement Kas).
2. **PWA-First Mobile & Responsive Desktop**:
   - Antarmuka Rider dirancang dalam viewport mobile vertikal dengan *safe-area insets* iOS/Android, tombol sentuh minimal 44×44px, dan dukungan offline IndexedDB.
   - Antarmuka Desktop Admin & Supervisor menggunakan layout [AppShell.svelte](file:///f:/project_zero/bun_svelte/frontend/src/components/layout/AppShell.svelte) dengan collapsible sidebar, notification bell dropdown, dan live telemetry cards.
3. **Audit Endpoint & Integritas Backend**:
   - Seluruh komponen antarmuka terhubung 100% dengan kontrak API RESTful dan event real-time Socket.IO yang telah lulus uji E2E backend tanpa mengubah logika bisnis yang sudah ada.

---

## 2. Matriks Hak Akses Antarmuka (RBAC Matrix)

Merujuk pada Bab 1 & Bab 12 dari [md/fitur.md](file:///f:/project_zero/md/fitur.md):

| Modul Fitur | Super Admin | Management | Supervisor | Rider | Deskripsi & Batasan Akses |
| :--- | :---: | :---: | :---: | :---: | :--- |
| **Dashboard** | **FULL** | **FULL** (Bisnis) | **FULL** (Ops) | **FULL** (Pribadi) | Perspektif metrik KPI disesuaikan menurut peran pengguna |
| **Map Ops (Monitoring Map)** | **FULL** (Semua Layer) | **MONITOR** (Armada/Rider) | **FULL** (Komando Ops) | **LIMITED** (Navigasi Pribadi) | Peta spasial GIS Leaflet + LBS WebSocket real-time |
| **Manajemen User (Akun)** | **FULL** (CRUD Penuh) | **CRUD** (Hierarkis)* | **VIEW** | **SELF** (Profil Pribadi) | Management dilarang membuat akun Super Admin |
| **Plotting & Penugasan Rider** | **FULL** | **VIEW** | **CRUD** (Alokasi & Swap) | **VIEW** (Zona Ditugaskan) | Supervisor bertanggung jawab atas plotting harian |
| **Zona Wilayah (Master PostGIS)**| **CRUD** | — | **VIEW** | **VIEW** | Super Admin mengelola koordinat poligon & buffer |
| **Zona Wilayah (Operasional)** | **FULL** | — | **CRUD** (Aktivasi Harian) | **VIEW** (Poligon & Kuota) | Supervisor mengaktifkan kuota zona per shift |
| **DSS - Konfigurasi BWM** | **CRUD** | — | **VIEW** | — | Hanya Super Admin yang berwenang mengubah bobot |
| **DSS - Eksekusi TOPSIS** | **FULL** | — | **EXECUTE** | — | Supervisor menjalankan ranking rekomendasi zona |
| **DSS - Rekomendasi Hasil** | **FULL** | — | **FULL** | **VIEW** (Zona Rekomendasi) | Rider hanya melihat rekomendasi zona personal |
| **Armada - Master Data** | **CRUD** | **CRUD** | **VIEW** | — | Super Admin & Management mengelola unit & tipe |
| **Armada - Operasional & Klaim**| **FULL** | **FULL** | **MONITOR** | **CLAIM / RETURN** | Rider mengklaim unit via countdown timer 180s |
| **Katalog Menu & Harga** | **CRUD** | **CRUD** | **VIEW** | **VIEW** (Kasir POS) | Management mengatur harga jual; Rider bertransaksi |
| **Penjualan Kasir (POS)** | **VIEW** | **VIEW** | **VIEW** | **CRUD** (Catat Transaksi) | Rider mencatat order dengan UUID Idempotency-Key |
| **Check-in / Check-out Geofence**| **VIEW** | **VIEW** | **MONITOR** | **CRUD** (GPS Satelit) | Validasi radius spasial PostGIS $\pm 50\text{m}$ buffer |
| **Laporan & Rekonsiliasi** | **FULL** (Sistem) | **MANAGEMENT** (Finansial) | **OPERATIONAL** (Shift) | **PERSONAL** (Penjualan) | Laporan berbasis perspektif peran |
| **Log Audit Forensik** | **FULL** | — | — | — | Rekaman seluruh mutasi data beresiko |
| **Pengaturan Sistem (Settings)** | **FULL** | — | — | — | Konfigurasi parameter Hub Surabaya & boundary |

> [!NOTE]
> `*` **Hierarki Pembuatan Akun oleh Management:**  
> Management dapat membuat akun Management, Supervisor, dan Rider. **Management dilarang keras membuat akun Super Admin.**

---

## 3. Sistem Desain & Design Tokens (Dark Obsidian & Opaline Palette)

Sistem antarmuka MOVA mengusung tema **Dark Obsidian Kinetic** dengan aksen kinetik yang tajam, modern, dan berkontras tinggi:

| Token Visual | Nilai CSS / HEX | Penggunaan Utama |
| :--- | :--- | :--- |
| `--color-primary` | `#FF634A` | Brand Accent (Cinnabar Red) - CTA Utama, Status Aktif |
| `--color-primary-hover` | `#FF8573` | Hover state tombol utama & pulsing indicator |
| `--color-background` | `#09090B` | Deep Canvas Dark Black |
| `--color-surface-card` | `#131316` | Level-2 Container, Modal Backdrop, Glass Card |
| `--color-surface-elevated` | `#1A1A22` | Level-3 Input field, Dropdown, Nested Box |
| `--color-border` | `#24242A` / `#2E2E3C` | Border pemisah halus & divider line |
| `--color-success` | `#10B981` / `#34D399` | Status ONLINE, CHECKED_IN, Klaim Sukses |
| `--color-warning` | `#F59E0B` / `#FBBF24` | Status QUEUED, HOLD 180s, Perhatian Baterai |
| `--color-danger` | `#EF4444` / `#F87171` | Status MAINTENANCE, Pelanggaran Geofence, Error |
| `--color-info` | `#38BDF8` / `#0EA5E9` | Sinyal Satelit GPS, Rekomendasi DSS TOPSIS |

### Tipografi & Geometri
- **Headings**: `'Outfit', sans-serif` (Bold, Modern, Geometris).
- **Body & Controls**: `'Inter', sans-serif` (Optimal untuk keterbacaan teks dan angka kecil).
- **Data & Telemetri**: `'JetBrains Mono', monospace` (Koordinat GPS, Timer countdown, Kode sesi, Nominal Rupiah).

---

## 4. Struktur Direktori Dokumentasi `ui/`

```text
ui/
├── README.md                          # Master UI/UX Architecture & RBAC Matrix
├── ACTIVITY_FLOWS.md                  # Rangkaian Activity Diagrams (Mermaid) per Modul
└── wireframes/                        # Wireframe Blueprint & Layout Specifications
    ├── 01_auth_showcase_wireframe.md   # Showcase, Login, Register, Setup Day-0
    ├── 02_map_ops_wireframe.md         # Spatial Command Center GIS Leaflet & LBS
    ├── 03_superadmin_suite_wireframe.md# DSS BWM Config, Zone PostGIS, Audit Logs
    ├── 04_management_suite_wireframe.md# Hierarchical Users, Fleet Master, Catalog
    ├── 05_supervisor_command_wireframe.md # TOPSIS Run, Plotting FIFO, Emergency Swap
    └── 06_rider_mobile_pwa_wireframe.md  # 5 Full-Screen Steps PWA Mobile Flow
```
