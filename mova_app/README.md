# MOVA App (Mobile Operational Vehicle Analytics & Decision Support System)

Sub-workspace khusus untuk seluruh ekosistem **MOVA**, mencakup implementasi Multi-Tenant Platform, Single-Tenant Edition, dokumentasi teknis komprehensif, dan aset visual master.

---

## 📁 Struktur Direktori `mova_app`

```text
mova_app/
├── multi-tenant/                   # MOVA Multi-Tenant SaaS Platform (Bun + Svelte 5 + Elysia/Hono)
│   ├── backend/                    # Backend API, Engine Spasial LBS, BWM & TOPSIS DSS, Database RLS
│   ├── frontend/                   # Frontend Svelte 5 SPA, Tailwind CSS, Leaflet GIS, Recharts
│   ├── dev.ts                      # Runner script dev server multi-tenant terintegrasi
│   ├── ecosystem.config.cjs        # Konfigurasi PM2 production runner
│   └── package.json                # Dependencies multi-tenant
│
├── single-tenant/                  # MOVA Lite / Single-Tenant Edition (Penelitian Skripsi)
│   ├── backend/                    # Express API, DSS TOPSIS, Swagger docs (Node.js)
│   ├── frontend/                   # React 18, Tailwind CSS, Leaflet, Axios, Recharts
│   ├── assets/                     # Aset spesifik single-tenant
│   └── README.md                   # Blueprint & panduan profil single tenant
│
├── docs/                           # Dokumentasi Master & Laporan Teknis MOVA
│   ├── architecture/               # Arsitektur sistem, RLS, Spesifikasi Matematika DSS, Engine LBS, OpenAPI
│   ├── thesis/                     # Draft skripsi PDF, Matriks Ketelusuran, Runbook Sidang, Bank Q&A Penguji
│   ├── readiness-reports/          # Laporan Kesiapan Frontend, Production Audit, Release Notes
│   ├── workflows-and-flows/        # Peta Alur Workflow E2E, Flow Armada, Auth, Operasional Rider
│   ├── ui-design/                  # Wireframes, Spesifikasi Layout per Role, Alignment UI/UX
│   └── analytics-reporting/        # Panduan Analitik Historis & Reporting
│
├── assets/                         # Aset Statis & Desain MOVA
│   ├── boxicons-free/              # Library ikon Boxicons
│   └── img/                        # Diagram & Ilustrasi
│
├── package.json                    # Script runner terpadu MOVA
└── README.md                       # Dokumentasi modul MOVA (dokumen ini)
```

---

## 🚀 Menjalankan MOVA

### 1. Multi-Tenant Edition
```bash
# Dari folder mova_app:
npm run dev:multi

# Atau jalankan backend/frontend terpisah:
npm run dev:multi:backend
npm run dev:multi:frontend
```

### 2. Single-Tenant Edition
```bash
# Backend (Port 5000):
npm run dev:single:backend

# Frontend (Port 5173 / 3000):
npm run dev:single:frontend

# Validasi Kontrak API & Swagger Audit:
npm run audit:single
```

---

## 📚 Panduan Navigasi Dokumentasi (`docs/`)

| Direktori | Deskripsi & File Kunci |
|---|---|
| [`docs/architecture/`](./docs/architecture/) | Arsitektur RLS, Spesifikasi Matematika DSS BWM/TOPSIS, Engine LBS & Geofence, Integrasi OpenAPI, Deployment Runbook. |
| [`docs/thesis/`](./docs/thesis/) | Traceability Matrix Skripsi, Demo Scenario Runbook, Bank Q&A Ujian Sidang. |
| [`docs/readiness-reports/`](./docs/readiness-reports/) | Master Readiness Report, Production Readiness Audit, Release Manifest RC1. |
| [`docs/workflows-and-flows/`](./docs/workflows-and-flows/) | Peta Workflow End-to-End, Lifecycle Armada, Geofence Plotting & Dispatch. |
| [`docs/ui-design/`](./docs/ui-design/) | Wireframe UI & Interaksi, Spesifikasi Layout per Role. |
| [`docs/analytics-reporting/`](./docs/analytics-reporting/) | Panduan Analitik & Reporting Engine. |
