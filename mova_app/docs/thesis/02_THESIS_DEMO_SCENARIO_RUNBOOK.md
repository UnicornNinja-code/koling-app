# MOVA Thesis Defense: Live Demonstration Scenario Runbook

```text
================================================================================
                    MOVA THESIS DEFENSE ARTIFACT (P4-10 / P4-11)
                     LIVE DEMONSTRATION & EDGE-CASE RUNBOOK
================================================================================
```

---

## 1. Demonstration Overview & Timing Budget

This runbook provides a structured, fail-safe **15-minute live demonstration protocol** designed for the undergraduate thesis defense (*Sidang Skripsi*). It proves the practical operation of all theoretical algorithms (BWM, TOPSIS, PostGIS, Geofencing, and Streaming Reporting) while showcasing edge-case handling.

```text
┌──────────────────────────────────────────────────────────┬───────────┐
│ Demonstration Phase                                      │ Duration  │
├──────────────────────────────────────────────────────────┼───────────┤
│ 1. Platform Bootstrap & Multi-Tenant Authentication      │ 2 Minutes │
│ 2. Intelligent DSS Engine (BWM Weights + TOPSIS Ranking) │ 4 Minutes │
│ 3. Realtime Fleet LBS & Geofence State Tracking          │ 3 Minutes │
│ 4. Historical Operational Analytics (S7-03)              │ 3 Minutes │
│ 5. Asynchronous Multi-Format Reporting (S7-05)           │ 2 Minutes │
│ 6. Edge-Case & Security Defense Probing (Live 404 / 429) │ 1 Minute  │
├──────────────────────────────────────────────────────────┼───────────┤
│ TOTAL DEMONSTRATION TIME                                 │ 15 MIN    │
└──────────────────────────────────────────────────────────┴───────────┘
```

---

## 2. Pre-Defense Environment Preparation

Ensure the native services are running cleanly before the committee convenes:

```bash
# Terminal 1: Launch Backend Engine (Port 9000)
cd d:/project_alpha/koling-app/bun_svelte/backend
bun run dev

# Terminal 2: Launch Frontend Client (Port 9967 / 5173)
cd d:/project_alpha/koling-app/bun_svelte/frontend
bun run dev
```

* **Frontend URL**: `http://localhost:5173` (or `http://localhost:9967`)
* **OpenAPI Docs**: `http://localhost:9000/api/docs`

---

## 3. Step-by-Step Live Demo Scenarios

### Scenario 1: Multi-Tenant Architecture & Authentication (2 Mins)
* **Goal**: Prove multi-tenant isolation and strict Role-Based Access Control (RBAC).
* **Action Steps**:
  1. Open browser to `http://localhost:5173/login`.
  2. Log in as **Supervisor**: `supervisor@kopikeliling.com` / `password123`.
  3. Point out tenant badge: `Sejuta Jiwa Coffee (SEJUTA_JIWA)`.
  4. Explain to examiners: *"All subsequent API interactions attach a Bearer JWT which automatically injects `SET LOCAL app.current_tenant_id` at the database kernel level."*

---

### Scenario 2: Intelligent DSS Engine in Action (4 Mins)
* **Goal**: Demonstrate mathematical computation of BWM optimal weights and TOPSIS spatial zone recommendation.
* **Action Steps**:
  1. Navigate to **DSS Decision Support** (`/dss`).
  2. Show the **6 Canonical Criteria**:
     * Benefit: $C_1$ (POI Density), $C_2$ (POI Diversity), $C_3$ (Crowd Potential).
     * Cost: $C_4$ (Weather Risk), $C_5$ (Accessibility Distance), $C_6$ (Competitor Proximity).
  3. Click **Recalculate BWM Weights**:
     * Highlight terminal output & UI display: Simplex LP solution yields optimal weight vector $W^*$.
     * Point out Consistency Ratio: **$CR = 0.0029 \le 0.30$** (Proving high consistency).
  4. View **TOPSIS Zone Ranking**:
     * Show raw decision matrix $X_{m \times n}$, vector-normalized matrix $R_{m \times n}$, weighted matrix $V_{m \times n}$.
     * Show positive ideal solution $A^+$ and negative ideal solution $A^-$.
     * Point out final closeness coefficients ($R_i \in [0, 1]$) and deterministic top-ranked zone.

---

### Scenario 3: Realtime Fleet LBS & Geofencing (3 Mins)
* **Goal**: Prove real-time spatial ingestion, road snapping, and geofence state transitions.
* **Action Steps**:
  1. Navigate to **Monitoring & Fleet Tracking Map** (`/presence`).
  2. Point out active rider markers rendered on the Leaflet map within zone boundaries.
  3. Trigger simulated telemetry (or inspect active presence table):
     * Explain Haversine velocity filter ($<120\text{ km/h}$) rejecting telemetry teleportation.
     * Explain road snapping aligning rider coordinates to protocol road centerlines within a 20-meter threshold.
     * Show geofence state indicator: `ON_SITE` (Dwell time accumulating in real time).

---

### Scenario 4: Historical Analytics & Comparative Insights (3 Mins)
* **Goal**: Demonstrate half-open interval handling, period comparison deltas, and zero-fake-data policy.
* **Action Steps**:
  1. Navigate to **Historical Analytics** (`/analytics/historical`).
  2. Select Preset **`Last 7 Days`**:
     * Show standard half-open date range `[2026-09-01, 2026-09-08)`.
     * Show symmetric previous period baseline `[2026-08-25, 2026-09-01)`.
     * Point out Period-over-Period KPI Cards (Delta %, Trend Direction arrow).
  3. Demonstrate **Zero-Fake-Data Policy**:
     * Filter by a zone with no recorded operational sessions: Compliance rate displays explicit `null` / `N/A` rather than synthetic `0.0%`.

---

### Scenario 5: Asynchronous Multi-Format Reporting (2 Mins)
* **Goal**: Prove streaming document generation, BullMQ worker offloading, and resource governance.
* **Action Steps**:
  1. Click **Export Report** button.
  2. Select:
     * Report Type: `PRESENCE_REPORT`
     * Format: `XLSX (Excel)`
     * Date Range: `Last 30 Days`
  3. Click **Generate Export**:
     * Show immediate HTTP `202 Accepted` with live progress indicator (`0%` $\rightarrow$ `50%` $\rightarrow$ `100%`).
     * Explain that BullMQ worker streams data with $O(1)$ memory without blocking API server threads.
  4. Download generated file:
     * Open Excel file: Point out clean formatting, tenant headers, and formula injection sanitization (`'` prefix on formula triggers).

---

### Scenario 6: Edge-Case & Security Defense Demonstration (1 Min)
* **Goal**: Prove system resilience against abuse, out-of-bounds parameters, and cross-tenant probes.
* **Action Steps**:
  1. **Date Range Guard (HTTP 422)**:
     * Open Swagger UI (`/api/docs`) or curl: Request export with a 120-day range $\rightarrow$ Backend returns HTTP `422 UNPROCESSABLE_ENTITY` (*Range exceeds 90-day ceiling*).
  2. **Concurrency Ceiling Guard (HTTP 429)**:
     * Trigger 3 rapid export requests in parallel $\rightarrow$ 3rd request receives HTTP `429 TOO_MANY_REQUESTS` (*Max 2 concurrent jobs per tenant*).
  3. **IDOR / BOLA Zero-Leak Probe (HTTP 404)**:
     * Query non-existent or foreign tenant export ID: `GET /api/reports/export/00000000-0000-0000-0000-000000000000` $\rightarrow$ Returns HTTP `404 NOT_FOUND` without leaking resource state.

---

## 4. Defense Demonstration Cheatsheet (Quick Responses)

| If the Examiner Asks... | Point to Code / Concept | Demonstration Action |
| :--- | :--- | :--- |
| *"How do you prevent division by zero in TOPSIS?"* | `SafeTopsisEngine.ts` Zero-Variance & Zero-Distance guards | Show code line 72; explain fallback $R_i = 0.50$ when all alternatives are identical |
| *"Why not use AHP instead of BWM?"* | BWM requires only $2n - 3 = 9$ comparisons vs AHP's 15 for 6 criteria | Show BWM LP consistency ratio $CR = 0.0029 \le 0.30$ |
| *"How is multi-tenant security enforced?"* | PostgreSQL `FORCE ROW LEVEL SECURITY` with `mova_app NOBYPASSRLS` | Show migration `013_multi_tenant_rls_isolation.sql` and 404 response on foreign probing |
| *"What happens if a rider sends fake GPS coordinates?"* | `LbsIngestionService.ts` velocity ceiling ($<120\text{ km/h}$) | Explain Haversine distance-over-time rejection of teleportation anomalies |
| *"Why is Sales Settlement Report disabled?"* | Strict RLS integrity boundary | Explain that `shift_settlements` lacks `tenant_id`; intentionally deferred to prevent RLS bypass |
