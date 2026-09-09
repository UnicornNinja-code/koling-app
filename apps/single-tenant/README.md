# MOVA Lite / Single-Tenant Edition

Modul ini dialokasikan untuk edisi **MOVA Single-Tenant (Lite / Artefak Penelitian Skripsi)**.

## Ruang Lingkup Arsitektur

Berdasarkan blueprint strategi [rencana_single_tenant.md](../../docs/thesis/rencana_single_tenant.md):

```text
MOVA Core (Shared Spatial Engine & DSS Models)
│
├── MOVA Lite (Single Tenant / Skripsi)
│   ├── Context: Single Organization (Studi Kasus: Sejuta Jiwa)
│   ├── Codebase: `apps/single-tenant/nodejs_react/`
│   │   ├── `backend_old/` (Express API Server)
│   │   └── `frontend_old/` (React Frontend)
│   ├── Tenant Management: Hidden / Default Tenant ID (`thesis-default`)
│   └── Resource Quota & UI: Sederhana & Sesuai Scope Penelitian
│
└── MOVA Platform (Multi-Tenant / Production)
    └── Berada di: `apps/multi-tenant/`
```

## Referensi Dokumentasi Terkait
- Dokumen Rencana & Strategi: [rencana_single_tenant.md](../../docs/thesis/rencana_single_tenant.md)
- Dokumen Skripsi: [docs/thesis/](../../docs/thesis/)
