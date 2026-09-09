# Panduan & Template Config `.gitignore` Proyek Koling App

Dokumen ini berisi salinan lengkap isi file `.gitignore` yang digunakan pada proyek **Koling App** (Mobile Coffee Vendor DSS Application). 

Jika Anda ingin melakukan *setup* atau mengkloning proyek ini di komputer/perangkat lain, gunakan panduan dan template di bawah ini untuk membuat file `.gitignore` pada masing-masing direktori target.

---

## 📋 Daftar Isi
1. [Struktur File .gitignore](#1-struktur-file-gitignore)
2. [Section 1: Root Project (`.gitignore`)](#2-section-1-root-project-gitignore)
3. [Section 2: Backend (`backend/.gitignore`)](#3-section-2-backend-backendgitignore)
4. [Section 3: Frontend (`frontend/.gitignore`)](#4-section-3-frontend-frontendgitignore)
5. [Panduan Pembuatan File di Perangkat Lain](#5-panduan-pembuatan-file-di-perangkat-lain)

---

## 1. Struktur File .gitignore

Proyek ini memiliki **3 level file `.gitignore`**:
```text
mobile-coffee-vendor-dss-app/
├── .gitignore              <-- Root Project .gitignore
├── backend/
│   └── .gitignore          <-- Backend Service .gitignore
└── frontend/
    └── .gitignore          <-- Frontend Web App .gitignore
```

---

## 2. Section 1: Root Project (`.gitignore`)

File ini berada di direktori utama proyek (`/.gitignore`) untuk mengeksklusi file global, *environment variables*, dependency bundler, log, dan artefak OS/IDE.

```gitignore
# Dependencies
node_modules
**/node_modules

# Build & Output
dist
**/dist
dist-ssr
**/dist-ssr
*.local

# Environment & Secrets
.env
.env.local
.env.*.local
.env.development
.env.test
.env.production
**/.env
**/.env.*
!.env.example
!**/.env.example

# Logs & Debug
logs
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*
pnpm-debug.log*

# Test Coverage
coverage
.nyc_output

# Cache & Temporary Files
tmp/
temp/
scratch/
.cache/

# Editor & OS Files
.vscode/*
!.vscode/extensions.json
.idea
.DS_Store
Thumbs.db
*.suo
*.ntvs*
*.njsproj
*.sln
*.sw?
*.swo
*.swp

# Project Generated Artifacts
backend/public/geojson/jalan_protokol.geojson
draft-fe-mantau-kopi
```

---

## 3. Section 2: Backend (`backend/.gitignore`)

File ini berada di dalam direktori backend (`/backend/.gitignore`) khusus untuk mengamankan kredensial server backend, *logs*, dan file temporary Node.js.

```gitignore
# Environment Variables
.env
.env.*
!.env.example

# Dependencies
node_modules/

# Logs & Debugging
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*
logs/

# Scratch & Temporary files
scratch/
tmp/
temp/
.cache/

# Operating System & IDE
.DS_Store
Thumbs.db
.vscode/
.idea/
*.swp
*.swo
```

---

## 4. Section 3: Frontend (`frontend/.gitignore`)

File ini berada di dalam direktori frontend (`/frontend/.gitignore`) untuk mengeksklusi hasil *build Vite/React*, log bundler, serta dependency frontend.

```gitignore
# Logs
logs
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*
pnpm-debug.log*
lerna-debug.log*

node_modules
dist
dist-ssr
*.local

# Editor directories and files
.vscode/*
!.vscode/extensions.json
.idea
.DS_Store
*.suo
*.ntvs*
*.njsproj
*.sln
*.sw?
```

---

## 5. Panduan Pembuatan File di Perangkat Lain

Jika Anda mengkloning repository pada perangkat baru dan ingin membuat atau memulihkan file `.gitignore` secara manual:

### Opsi A: Menggunakan VS Code / Text Editor
1. Buat file bernama `.gitignore` di folder root proyek, lalu salin kode dari **Section 1**.
2. Buat file bernama `.gitignore` di dalam folder `backend/`, lalu salin kode dari **Section 2**.
3. Buat file bernama `.gitignore` di dalam folder `frontend/`, lalu salin kode dari **Section 3**.

### Opsi B: Menggunakan Command Line (Terminal / PowerShell / Bash)

**PowerShell (Windows):**
```powershell
# Buat .gitignore di Root
New-Item -Path .gitignore -ItemType File -Force

# Buat .gitignore di Backend
New-Item -Path backend\.gitignore -ItemType File -Force

# Buat .gitignore di Frontend
New-Item -Path frontend\.gitignore -ItemType File -Force
```

**Bash / Git Bash / Mac / Linux:**
```bash
# Buat .gitignore di Root
touch .gitignore

# Buat .gitignore di Backend
touch backend/.gitignore

# Buat .gitignore di Frontend
touch frontend/.gitignore
```

---
*Catatan: Pastikan tidak pernah menghapus `!.env.example` agar template environment variabel tetap dapat diakses oleh tim / perangkat lain.*
