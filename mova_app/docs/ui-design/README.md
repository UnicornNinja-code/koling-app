# COZIS UI/UX Layout Architecture & Design System Documentation

Dokumentasi ini merupakan spesifikasi lengkap antarmuka pengguna (*UI*), pengalaman pengguna (*UX*), dan arsitektur visual untuk aplikasi **COZIS (Coffee on Wheels Zone & Intelligent Spreading System)**.

---

## 1. Prinsip Utama Desain

1. **Role-Based Separation & Least Privilege**:
   - **Super Admin**: Administrator sistem menyeluruh (Full Access & Konfigurasi BWM Master).
   - **Management**: Administrator sumber daya & akun (User CRUD hierarkis, Armada, Katalog, Laporan Bisnis).
   - **Supervisor**: Komando operasional harian (Eksekusi DSS TOPSIS, Plotting Rider, Zona Harian, Monitoring Armada & Peta Komando).
   - **Rider**: Eksekusi penjualan mobile PWA (Klaim Armada, Check-in GPS, POS Penjualan, Peta Navigasi & Peringatan Jalan Protokol).
2. **PWA-First Mobile & Responsive Desktop**:
   - Setiap layar dioptimalkan untuk desktop (1280px+), tablet (768px - 1024px), dan antarmuka mobile PWA (375px - 430px) dengan *safe-area insets* dan *touch target* minimum 44×44px.
3. **Audit Endpoint & Backend Integrity**:
   - Seluruh rancangan antarmuka terhubung 100% dengan endpoint RESTful dan event WebSocket/Socket.IO yang telah teruji di backend tanpa mengubah logika bisnis.

---

## 2. Design System & Design Tokens (Opaline Palette)

### 2.1 Palet Warna (Color Tokens)

| Token CSS | Kode Warna HEX | Deskripsi & Penggunaan |
| :--- | :--- | :--- |
| `--color-primary` | `#FF634A` | Brand Accent (Cinnabar Red) - CTA Utama, Status Aktif |
| `--color-primary-dark` | `#B82814` | Hover gelap, Pressed state |
| `--color-primary-hover` | `#E54E36` | Primary Button Hover State |
| `--color-primary-soft` | `#FFF2EF` | Light Tint Primary - Badge latar, Selected item |
| `--color-background` | `#F4F4F6` | Canvas / App Background |
| `--color-surface` | `#FFFFFF` | Card, Modal, Sidebar, Surface Putih Bersih |
| `--color-surface-hover` | `#E7E7E7` | Table row hover, Subtle button hover |
| `--color-border` | `#D2D2D4` | Card border, Divider, Input border |
| `--color-border-hover` | `#B8B8BA` | Focus/Hover border input |
| `--color-foreground` | `#18181B` | Primary Text (Zinc-900) |
| `--color-muted-foreground`| `#52525B` | Secondary / Subtitle Text (Zinc-600) |
| `--color-subtle` | `#8E8E93` | Placeholder & Inactive Icon (Zinc-400) |
| `--color-success` | `#10B981` | Status Aktif, Berhasil, OTW, Checked-In (Emerald) |
| `--color-success-bg` | `#ECFDF5` | Emerald Soft Background |
| `--color-warning` | `#F59E0B` | Status Standby, Hold, Perhatian (Amber) |
| `--color-warning-bg` | `#FFFBEB` | Amber Soft Background |
| `--color-danger` | `#EF4444` | Status Maintenance, Terputus, Breach/Pelanggaran |
| `--color-danger-bg` | `#FEF2F2` | Crimson Soft Background |
| `--color-info` | `#3B82F6` | Rekomendasi DSS, Info Tautan (Blue) |
| `--color-info-bg` | `#EFF6FF` | Blue Soft Background |

### 2.2 Tipografi & Geometri
- **Font Heading & Body**: `'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif`
- **Font Monospace (Data, Odometer, Koordinat)**: `'JetBrains Mono', monospace`
- **Corner Radius**:
  - `radius-sm`: `4px` (Input kecil, badge persegi, mini pill)
  - `radius-md`: `8px` (Button standar, Card kecil, Form field)
  - `radius-lg`: `12px` (Card utama, Container panel, Dropdown)
  - `radius-xl`: `16px` (Modal dialog, Floating HUD panel)
  - `radius-full`: `9999px` (Status badges, avatar, floating action buttons)

---

## 3. Matriks Hak Akses Antarmuka (RBAC Matrix)

| Modul / Halaman | Super Admin | Management | Supervisor | Rider |
| :--- | :---: | :---: | :---: | :---: |
| **Dashboard** | Full System Health | Business / Revenue | Operational Command | Rider Mobile Shift |
| **User Management** | CRUD Full + Audit | CRUD Mgmt/Spv/Rider | — (View Ops Only) | Self Profile |
| **Zone Master** | Full CRUD + Geofence | — | View Master | View Assigned |
| **Zone Operational** | Full | — | Activate & Select | View Active |
| **DSS Master (BWM)** | Configure Best/Worst | — | View Weights Only | — |
| **DSS Execution** | Run & View | — | Run TOPSIS & Recommend | View Top 1-3 |
| **Fleet Management** | Full Master CRUD | Full CRUD & Servis | Live Monitor Status | Claim & Return |
| **Catalog Management** | Full CRUD | Full CRUD & Pricing | View Reference | View POS Products |
| **Rider Plotting** | Master Distribution | View Plotting | Full Assignment Workspace| View Assignment |
| **Sales & POS** | View Analytics | View Revenue Reports | View Zone Sales | POS Input Transaksi |
| **Attendance / Checkin**| System Audit | View Records | Monitor Check-in | GPS Geofence Check-in |
| **Monitoring Map** | Full 9 Layers | Fleet & Rider Layer | Operational Command | My Nav + Protocol Alert |
| **Reports** | Full System Reports | Business Reports | Operational Reports | Personal Shift History |
| **System Settings/Cron**| Full Control | — | — | — |

---

## 4. Peta Struktur File Dokumentasi Layout (`layout_md/`)

```text
layout_md/
├── README.md                           # Master Design System, Tokens, & RBAC Matrix
├── auth/                               # Modul Autentikasi & Onboarding Terpandu
│   ├── login.md                        # Form Login & Role Redirection
│   ├── activation.md                   # Aktivasi Akun Pertama Kali (First Login / Token)
│   ├── password_recovery.md            # Lupa & Reset Password
│   └── errors.md                       # Inactive Account (403), Forbidden, & 404
├── superadmin/                         # Role: Super Admin (System Administrator)
│   ├── dashboard.md                    # System Health & Multi-metric Dashboard
│   ├── user_management.md              # Full Account CRUD, Password Reset, Audit Log
│   ├── zone_management.md              # Master Geofence CRUD & Spatial Restriction
│   ├── dss_management.md               # BWM Best/Worst Matrix, Weight & TOPSIS History
│   ├── fleet_management.md             # Master Data Armada, Maintenance Schedule
│   ├── distribution_plotting.md        # Master Plotting Rider Oversight
│   ├── catalog_management.md           # Master Katalog Produk & Pricing CRUD
│   ├── monitoring_map.md               # Peta Global Multi-Layer Real-time
│   ├── reports.md                      # Laporan Komprehensif Sistem & Ekspor
│   └── system_settings.md              # Audit Trail & Pengaturan Cron Otomatis
├── management/                         # Role: Management (Resource & Account Administrator)
│   ├── dashboard.md                    # Business Overview Dashboard
│   ├── user_management.md              # User Provisioning (Mgmt, Spv, Rider)
│   ├── fleet_management.md             # Fleet Operations & Utilization
│   ├── catalog_management.md           # Product Catalog, Pricing & Status
│   ├── monitoring_map.md               # Business Fleet & Active Rider Map
│   └── reports.md                      # Management Business & Revenue Reports
├── supervisor/                         # Role: Supervisor (Operational Decision & Control)
│   ├── dashboard.md                    # Operational Command Dashboard
│   ├── zone_operational.md             # Operational Zone Selection & Geofence
│   ├── dss_execution.md                # Eksekusi DSS TOPSIS & Rekomendasi Zona
│   ├── rider_plotting.md               # Rider Assignment & Plotting Workspace
│   ├── fleet_monitoring.md             # Fleet Status Monitoring (Read-Only)
│   ├── catalog_view.md                 # Product Catalog Reference (Read-Only)
│   ├── operational_map.md              # Peta Komando Real-time & Geofence Tracker
│   └── reports.md                      # Laporan Kinerja Operasional & Absensi
└── rider/                              # Role: Rider (Operational Execution - Mobile PWA)
    ├── dashboard.md                    # Mobile Shift Dashboard
    ├── attendance_checkin.md           # GPS-Verified Check-in/Check-out Zona
    ├── fleet_claim.md                  # Klaim Armada, Odometer & Konfirmasi Return
    ├── sales_entry.md                  # Mobile POS Kasir Penjualan Produk
    ├── operational_map.md              # Peta Navigasi & Peringatan Jalan Protokol
    └── personal_reports.md             # Riwayat Absensi, Penjualan & Statistik
```
