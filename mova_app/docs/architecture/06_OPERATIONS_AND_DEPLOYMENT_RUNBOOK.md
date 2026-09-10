# MOVA Operations & Deployment Runbook (RC-1 Native Baseline)

```text
================================================================================
                    MOVA PLATFORM TECHNICAL SPECIFICATION
             06. OPERATIONS, INSTALLATION & DEPLOYMENT RUNBOOK
================================================================================
```

---

## 1. Purpose

This document provides the authoritative operational runbook, local environment bootstrap procedure, database migration guide, test verification protocol, and troubleshooting instructions for **MOVA `v1.0.0-rc.1`**. It serves as the primary technical guide for system operators, academic evaluators, and developers.

---

## 2. Scope

* **Runtime Environments**: Native Bun v1.4.0+ (Backend Engine), Node.js v22.0+ & Vite v8.2.2 (Frontend Client), PostgreSQL 16+ with PostGIS Spatial Extension, and Redis 7+ (In-memory spatial store & BullMQ queue).
* **Operational Tasks**: Clean repository setup, database schema migration execution (`001` through `019`), demo data seeding, test suite execution (312 tests / 883 assertions), and production frontend bundling.
* **Deployment Model**: Native host process deployment (Systemd / Process Manager).

---

## 3. Deployment Prerequisites & System Requirements

| Dependency | Minimum Version | Purpose |
| :--- | :--- | :--- |
| **Bun** | `v1.4.0+` | High-performance JavaScript/TypeScript runtime for Backend API |
| **Node.js & npm** | `v22.0.0+` | Build environment and dependency manager for Frontend |
| **PostgreSQL** | `16.0+` | Relational database engine with Row-Level Security (RLS) |
| **PostGIS Extension** | `3.4+` | Geospatial extension for spatial indexing and polygon containment |
| **Redis** | `7.0+` | Ephemeral spatial index (`GEOADD`) and BullMQ background queue |

> ### [!NOTE]
> **CONTAINERIZATION STATUS (AUDIT FINDING P2-02 / P2-03)**  
> In accordance with the Pillar 2 deployment audit, `Dockerfile` and `docker-compose.yml` are currently **NOT PRESENT** in the repository. Production deployment is executed directly on native host environments.

---

## 4. Step-by-Step Installation & Bootstrap Runbook

### Step 1: Clone and Prepare Workspace
```bash
git clone <repository_url> d:/project_alpha/koling-app
cd d:/project_alpha/koling-app/bun_svelte
```

### Step 2: Backend Dependency Installation
```bash
cd backend
bun install
```

### Step 3: Frontend Dependency Installation
```bash
cd ../frontend
bun install
```

---

## 5. Database Setup & Migration Execution

### Step 1: Create Database & Enable PostGIS
```sql
-- Connect to PostgreSQL superuser (postgres)
CREATE DATABASE my_db;
\c my_db;
CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS pgcrypto;
```

### Step 2: Configure Backend Environment (`.env`)
Copy `.env.example` to `.env` in `bun_svelte/backend/`:
```env
PORT=9000
NODE_ENV=development
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=your_secure_password
DB_NAME=my_db
REDIS_HOST=localhost
REDIS_PORT=6379
JWT_SECRET=your_super_secret_jwt_key_here
REFRESH_TOKEN_DAYS=30
FRONTEND_URL=http://localhost:5173
```

### Step 3: Execute Full Schema Migrations (001–019)
```bash
cd d:/project_alpha/koling-app/bun_svelte/backend
bun run db:migrate
```

### Step 4: Seed Initial Spatial & Demo Dataset
```bash
bun run db:seed:fresh
```

---

## 6. Automated Test & Quality Verification Protocol

Execute the full verification baseline to confirm that the environment is completely operational:

```bash
# 1. Run Backend Unit & Domain Test Suites (17 files, 286 tests, 765 assertions)
cd d:/project_alpha/koling-app/bun_svelte/backend
bun test tests/unit_analytics_math.test.ts tests/unit_analytics_time.test.ts tests/unit_artifact_security.test.ts tests/unit_deviation_episode.test.ts tests/unit_executive_pdf_exporter.test.ts tests/unit_period_comparison.test.ts tests/unit_presence_aggregation.test.ts tests/unit_report_data_assembler.test.ts tests/unit_report_job_repository.test.ts tests/unit_report_worker_governor.test.ts tests/unit_reporting_full_abuse_regression.test.ts tests/unit_reporting_openapi_contract.test.ts tests/unit_reporting_state_machine.test.ts tests/unit_rider_historical_analytics.test.ts tests/unit_streaming_csv_exporter.test.ts tests/unit_streaming_xlsx_exporter.test.ts tests/unit_zone_historical_analytics.test.ts

# 2. Run Frontend Store Test Suites (2 files, 26 tests, 118 assertions)
cd d:/project_alpha/koling-app/bun_svelte/frontend
bun test

# 3. Run Svelte Type & Template Diagnostics (0 errors, 0 warnings)
bun run check

# 4. Compile Production Frontend Bundle (Vite v8.2.2)
bun run build
```

---

## 7. Starting the Platform Services

### Development Mode (with Live Reload)
```bash
# Terminal 1: Start Backend API (Port 9000)
cd d:/project_alpha/koling-app/bun_svelte/backend
bun run dev

# Terminal 2: Start Frontend Client (Port 9967 / 5173)
cd d:/project_alpha/koling-app/bun_svelte/frontend
bun run dev
```

### Production Mode (Compiled Static Client + Bun Server)
```bash
# Terminal 1: Launch Backend Engine
cd d:/project_alpha/koling-app/bun_svelte/backend
NODE_ENV=production bun start

# Terminal 2: Serve Compiled Frontend Bundle
cd d:/project_alpha/koling-app/bun_svelte/frontend
bun run preview -- --port 5173
```

---

## 8. Operational Monitoring, Health Checks & Troubleshooting

### Health Probe
* **HTTP Endpoint**: `GET http://localhost:9000/api/health`
* **Expected Response**: `200 OK` `{ "status": "ok", "service": "Koling DSS Backend", "runtime": "Bun + TypeScript" }`

### Common Operational Issues & Remediation

| Issue / Symptom | Probable Cause | Remediation Procedure |
| :--- | :--- | :--- |
| `ECONNREFUSED 127.0.0.1:6379` | Redis server not running | Start Redis service (`redis-server` or `services.msc`) |
| `relation "tenants" does not exist` | Migrations not executed | Run `bun run db:migrate` in backend directory |
| `PostGIS extension not found` | Missing spatial package | Execute `CREATE EXTENSION postgis;` as PostgreSQL superuser |
| `CORS error in browser console` | Frontend port mismatch | Verify frontend port is in `allowedOrigins` in `backend/index.ts` |
| `Export job stuck in QUEUED` | BullMQ worker thread interrupted | Restart backend process to re-initialize worker listeners |

---

## 9. Known Operational Limitations

1. **Physical Backup Drills**: Database backups currently rely on standard `pg_dump`; automated physical restore drills in CI/CD are cataloged as `NOT VERIFIED`.
2. **Container Orchestration**: Docker containerization is scheduled for the post-RC release engineering phase.

---

## 10. Academic Demonstration Quick-Guide (Thesis Defense)

For academic evaluators reviewing the live system:
1. **Access Swagger UI**: Open `http://localhost:9000/api/docs` to inspect active OpenAPI v4.2.0 contracts.
2. **Login Credentials**:
   * **Superadmin**: `superadmin@kopikeliling.com` / `password123`
   * **Supervisor**: `supervisor@kopikeliling.com` / `password123`
   * **Rider**: `rider@kopikeliling.com` / `password123`
3. **Live Demonstration Sequence**:
   - Navigate to **DSS Recommendations** $\rightarrow$ Verify BWM weight calculation and TOPSIS rank ordering.
   - Navigate to **Fleet Tracking** $\rightarrow$ Inspect real-time GPS position markers and geofence boundaries.
   - Navigate to **Historical Analytics** $\rightarrow$ Toggle date presets (`last7days`, `thisMonth`) and inspect period comparisons.
   - Navigate to **Report Generator** $\rightarrow$ Trigger XLSX/PDF export $\rightarrow$ Monitor background polling $\rightarrow$ Download and verify artifact.
