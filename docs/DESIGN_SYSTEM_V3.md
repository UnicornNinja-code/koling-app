# 🎨 MOVA Design System v3.0 Specification (SSOT)

> **Status:** Production Standard (Version 3.0)  
> **Product:** MOVA — Coffee Operational Zone Intelligence System  
> **Typography:** **STRICTLY INTER ONLY** (`Inter, system-ui, sans-serif`)  
> **Visual Reference:** Clean Modern SaaS Control Room (`assets/img/*.png`)

---

## 1. Color Palette (Design System v3.0)

| Token Name | Hex / Value | Usage & Meaning |
| :--- | :--- | :--- |
| **Primary** | `#2563EB` (Blue 600) | Warna utama sistem, active nav items, primary buttons, maps highlight |
| **Primary Hover** | `#1D4ED8` (Blue 700) | State hover tombol primary |
| **Primary Soft** | `rgba(37, 99, 235, 0.1)` | Tinted background icon container, highlight rows |
| **Accent Orange** | `#F97316` (Orange 500) | Brand accent MOVA, tombol CTA utama (*+ Tambah Zona, + Penugasan*), high-priority badges |
| **Accent Hover** | `#EA580C` (Orange 600) | State hover tombol accent |
| **Success** | `#10B981` (Emerald 500) | Status *Aktif, Selesai, On-Time, Compliant, Sangat Baik* |
| **Warning** | `#F59E0B` (Amber 500) | Status *Tugas, Pending, Degradasi, Cukup, Maintenance* |
| **Danger** | `#EF4444` (Red 500) | Status *Offline, Deviasi, Ditolak, Hapus, Critical Alert* |
| **Info** | `#3B82F6` (Blue 500) | Status *Tersedia, Info logs, Sedang Berjalan* |
| **Neutral 50** | `#FAFAFA` | Background canvas mode terang |
| **Neutral 900** | `#171717` / `#0B0F17` | Background canvas mode gelap |
| **Surface Light** | `#FFFFFF` | Background Card, Modal, Panel pada mode terang |
| **Surface Dark** | `#131822` / `#1E293B` | Background Card, Modal, Panel pada mode gelap |
| **Border Light** | `#E2E8F0` | Border pembatas tipis pada mode terang |
| **Border Dark** | `#1E293B` | Border pembatas tipis pada mode gelap |

---

## 2. Tipografi (Typography)

> **Aturan Mutlak:** Seluruh antarmuka hanya menggunakan font **Inter** (`font-family: 'Inter', system-ui, sans-serif`).

| Tipe Teks | Ukuran | Weight | Line Height | Penggunaan |
| :--- | :--- | :--- | :--- | :--- |
| **H1** | `22px` (`text-[22px]`) | Bold (700) | `30px` | Judul Halaman Utama (*Dashboard, Map Ops, Distribusi*) |
| **H2** | `20px` (`text-[20px]`) | Bold (700) | `28px` | Judul Section & Modal Besar |
| **H3** | `16px` (`text-base`) | Semibold (600) | `24px` | Judul Card, Widget, Dialog Header |
| **Metric Large** | `24px–28px` | Bold (700/800) | `32px` | Angka Utama KPI Metric Cards |
| **Body (Default)**| `14px` (`text-sm`) | Regular (400) / Medium (500) | `20px` | Teks paragraf, form input, tabel cells |
| **Small** | `12px` (`text-xs`) | Medium (500) / Semibold (600) | `16px` | Label form, subteks, breadcrumb, tags |
| **Caption** | `11px` (`text-[11px]`) | Regular (400) / Medium (500) | `14px` | Micro timestamps, table column headers, helper text |

---

## 3. Geometry & Radius System

- **`radius-sm` (4px)**: Checkbox, badge status tipis, input dropdown kecil.
- **`radius-md` (8px)**: Standard buttons, text inputs, selects, table container.
- **`radius-lg` (12px)**: Dashboard cards, modal dialogs, side panels, slide-over drawer.
- **`radius-xl` (16px)**: Container hero showcase, large floating map overlays.
- **`radius-full` (9999px)**: Status pill badges, round avatars, icon toggle buttons.

---

## 4. Spacing System (Kelipatan 4px)

- `p-1` (4px), `p-2` (8px), `p-3` (12px), `p-4` (16px), `p-5` (20px), `p-6` (24px), `p-8` (32px).
- **Layout Shell**:
  - Sidebar Width: `240px` (Expanded) / `68px` (Collapsed)
  - Topbar Height: `56px`
  - Workspace Padding: `p-6` (24px)
