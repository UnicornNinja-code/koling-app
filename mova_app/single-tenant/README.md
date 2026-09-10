# MOVA Lite / Single-Tenant Edition

Modul ini memuat edisi **MOVA Single-Tenant (Lite / Artefak Penelitian Skripsi)** dengan arsitektur Node.js Express & React.

## 📁 Struktur Folder Single-Tenant

```text
single-tenant/
├── backend/                # Express API Server, DSS TOPSIS, Swagger Docs (Port 5000)
├── frontend/               # React 18, Tailwind CSS, Leaflet GIS, Axios (Port 5173)
├── assets/                 # Aset spesifik single-tenant
└── README.md               # Panduan modul single-tenant (dokumen ini)
```

## 🚀 Menjalankan Single-Tenant

```bash
# Menjalankan Backend (Port 5000):
npm run dev --prefix backend

# Menjalankan Frontend (Port 5173):
npm run dev --prefix frontend

# Menjalankan Audit Keselarasan Kontrak API:
node backend/src/scripts/audit_ui_requirements.js
```

## 📚 Referensi Dokumentasi Terkait
- Dokumen Rencana & Strategi: [rencana_single_tenant.md](../docs/thesis/rencana_single_tenant.md)
- Dokumen Skripsi: [docs/thesis/](../docs/thesis/)
- Master Dokumentasi MOVA: [mova_app/README.md](../README.md)
