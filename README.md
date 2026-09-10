# Koling App Multi-Project Workspace

Workspace monorepo untuk menampung dan mendeploy berbagai project aplikasi, dengan manajemen modular terisolasi per aplikasi.

---

## 📁 Struktur Workspace

```text
koling-app/
├── mova_app/                           # [PROJECT] Ekosistem MOVA DSS & GIS Engine
│   ├── multi-tenant/                   # MOVA Multi-Tenant SaaS Platform (Bun + Svelte 5)
│   ├── single-tenant/                  # MOVA Single-Tenant Edition (Node.js Express + React)
│   ├── docs/                           # Dokumentasi Arsitektur, Skripsi, & Laporan Teknis MOVA
│   ├── assets/                         # Aset Desain, Boxicons, dan Image Master MOVA
│   ├── package.json                    # Script runner internal MOVA
│   └── README.md                       # Dokumentasi lengkap MOVA App
│
├── <app_lain>/                         # [PROJECT BARU] Tempat deployment aplikasi lain di masa mendatang
│   └── ...
│
├── package.json                        # Root Workspace Orchestrator
├── start.sh                            # Quickstart runner script
└── README.md                           # Panduan Workspace (dokumen ini)
```

---

## 🚀 Orchestrator Command (Root Level)

Anda dapat menjalankan project apa pun langsung dari root folder `koling-app`:

### 🔹 MOVA App

#### Multi-Tenant Edition
```bash
# Menjalankan Backend + Frontend MOVA Multi-Tenant secara terpadu
npm run dev:mova
# atau:
npm run dev:mova:multi

# Menjalankan servis terpisah:
npm run dev:mova:multi:backend
npm run dev:mova:multi:frontend
```

#### Single-Tenant Edition
```bash
# Menjalankan Backend (Node.js Express):
npm run dev:mova:single:backend

# Menjalankan Frontend (React + Vite):
npm run dev:mova:single:frontend

# Validasi Kontrak API Single-Tenant:
npm run audit:mova:single
```

---

## ➕ Menambahkan Aplikasi Baru (`app lain`)

Untuk menambahkan project/aplikasi baru di masa depan:
1. Buat folder baru di root `koling-app/` (contoh: `koling-app/billing_service` atau `koling-app/driver_mobile_app`).
2. Taruh source code, aset, dan dokumentasi spesifik aplikasi di dalam folder tersebut.
3. Tambahkan script delegasi di root [package.json](./package.json) untuk kemudahan kontrol terpusat.
