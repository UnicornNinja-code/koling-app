# MOVA System Monorepo (Decision Support System & Fleet GIS Engine)

Repositori ini memuat implementasi sistem **MOVA (Mobile Operational Vehicle Analytics & Decision Support System)** yang terdiri dari aplikasi Multi-Tenant Platform, edisi Single-Tenant (Lite / Skripsi), aset desain, serta dokumentasi komprehensif.

---

## 📁 Struktur Direktori Repositori

```text
project_zero/
├── apps/                               # Modul Aplikasi Utama
│   ├── multi-tenant/                   # MOVA Multi-Tenant Platform (Bun + Svelte 5 + Elysia/Hono)
│   │   ├── backend/                    # Backend API, Engine Spasial LBS, BWM & TOPSIS DSS, Database RLS
│   │   ├── frontend/                   # Frontend Svelte 5 SPA, Tailwind CSS, Leaflet GIS, Recharts
│   │   ├── dev.ts                      # Runner script dev server terintegrasi
│   │   ├── ecosystem.config.cjs        # Konfigurasi PM2 production runner
│   │   └── package.json                # Dependencies multi-tenant
│   └── single-tenant/                  # MOVA Lite / Single-Tenant Edition (Penelitian Skripsi)
│       ├── README.md                   # Blueprint & panduan profil single tenant
│       └── nodejs_react/               # Codebase Node.js + Express & React
│           ├── backend_old/
│           └── frontend_old/
│
├── docs/                               # Seluruh Dokumentasi & Laporan Teknis
│   ├── architecture/                   # Arsitektur sistem, RLS, Spesifikasi Matematika DSS, Engine LBS, OpenAPI
│   ├── thesis/                         # Draft skripsi PDF, Matriks Ketelusuran, Runbook Sidang, Bank Q&A Penguji
│   ├── readiness-reports/              # Laporan Kesiapan Frontend (F-01 s/d F-15), Production Readiness, Release Notes RC1
│   ├── workflows-and-flows/            # Peta Alur Workflow E2E, Flow Armada, Auth, Operasional Rider, Onboarding
│   ├── ui-design/                      # Wireframes, Spesifikasi Layout per Role, Alignment UI/UX
│   └── analytics-reporting/            # Panduan Analitik Historis & Reporting
│
├── assets/                             # Aset Statis & Desain
│   └── boxicons-free/                  # Library ikon Boxicons
│
├── package.json                        # Monorepo Runner Scripts (root-level orchestration)
├── start.sh                            # Helper script eksekusi instan dev server
└── README.md                           # Master navigasi repositori (dokumen ini)
```

---

## 🚀 Quick Start (Development & Production)

### 1. Menjalankan Server Development (Multi-Tenant)
Dari root repositori:
```bash
# Menjalankan Backend & Frontend secara bersamaan (Port: 9967 Backend, 9968 Frontend)
bun run dev

# Atau jalankan salah satu secara terpisah:
bun run dev:backend
bun run dev:frontend
```

### 2. Membangun & Menjalankan Production Bundle
```bash
# Build frontend
bun run build

# Start dengan PM2 ecosystem
bun run prod:start

# Monitoring log
bun run prod:logs

# Menghentikan server
bun run prod:stop
```

---

## 📚 Panduan Navigasi Dokumentasi (`docs/`)

| Kategori Folder | Deskripsi & File Kunci |
|---|---|
| [`docs/architecture/`](./docs/architecture/) | Arsitektur RLS ([`01_SYSTEM_ARCHITECTURE_AND_RLS.md`](./docs/architecture/01_SYSTEM_ARCHITECTURE_AND_RLS.md)), Matematika DSS ([`02_DSS_MATHEMATICAL_SPECIFICATION.md`](./docs/architecture/02_DSS_MATHEMATICAL_SPECIFICATION.md)), Engine LBS ([`03_LBS_SPATIAL_AND_GEOFENCE_ENGINE.md`](./docs/architecture/03_LBS_SPATIAL_AND_GEOFENCE_ENGINE.md)), OpenAPI ([`05_OPENAPI_INTEGRATION_MANUAL.md`](./docs/architecture/05_OPENAPI_INTEGRATION_MANUAL.md)), Runbook ([`06_OPERATIONS_AND_DEPLOYMENT_RUNBOOK.md`](./docs/architecture/06_OPERATIONS_AND_DEPLOYMENT_RUNBOOK.md)). |
| [`docs/thesis/`](./docs/thesis/) | Draft Skripsi PDF, Traceability Matrix ([`01_THESIS_TRACEABILITY_MATRIX.md`](./docs/thesis/01_THESIS_TRACEABILITY_MATRIX.md)), Demo Runbook ([`02_THESIS_DEMO_SCENARIO_RUNBOOK.md`](./docs/thesis/02_THESIS_DEMO_SCENARIO_RUNBOOK.md)), Bank Q&A ([`03_EXAMINER_QA_DEFENSE_BANK.md`](./docs/thesis/03_EXAMINER_QA_DEFENSE_BANK.md)), Rencana Single-Tenant ([`rencana_single_tenant.md`](./docs/thesis/rencana_single_tenant.md)). |
| [`docs/readiness-reports/`](./docs/readiness-reports/) | Master Readiness Report ([`FRONTEND_READINESS_REPORT.md`](./docs/readiness-reports/FRONTEND_READINESS_REPORT.md)), Production Audit ([`MOVA_PRODUCTION_READINESS_EVIDENCE_REPORT.md`](./docs/readiness-reports/MOVA_PRODUCTION_READINESS_EVIDENCE_REPORT.md)), Release Manifest ([`RC1_RELEASE_MANIFEST.md`](./docs/readiness-reports/RC1_RELEASE_MANIFEST.md)), Release Notes ([`RELEASE_NOTES_RC1.md`](./docs/readiness-reports/RELEASE_NOTES_RC1.md)). |
| [`docs/workflows-and-flows/`](./docs/workflows-and-flows/) | Peta Workflow E2E ([`E2E_WORKFLOW_MAP.md`](./docs/workflows-and-flows/E2E_WORKFLOW_MAP.md)), Alur Armada, Auth, Plotting, DSS, Zona Spasial. |
| [`docs/ui-design/`](./docs/ui-design/) | Wireframe UI & Interaksi ([`docs/ui-design/wireframes/`](./docs/ui-design/wireframes/)), Spesifikasi Layout per Role (Auth, Management, Rider, Superadmin, Supervisor). |
| [`docs/analytics-reporting/`](./docs/analytics-reporting/) | Panduan Analitik & Reporting Engine ([`04_ANALYTICS_AND_REPORTING_GUIDE.md`](./docs/analytics-reporting/04_ANALYTICS_AND_REPORTING_GUIDE.md)). |
