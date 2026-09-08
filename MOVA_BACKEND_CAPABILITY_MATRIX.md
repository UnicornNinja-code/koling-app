# MOVA Backend Capability Matrix

> **MOVA — Geospatial Decision Intelligence & Fleet Operations Platform**
> **Single Source of Truth (SSOT) for System Capabilities, Contract Integrity & Implementation Status**

---

## 0. Document Purpose & Operational Semantics

This document serves as the **single authoritative baseline reference** for the capability status of the MOVA platform across both Backend and Frontend layers.

### Status Dimensions:
- **Backend**: Capability exists, executed deterministically in domain services/database layer.
- **Contract**: Fully documented in the authoritative OpenAPI specification (`swagger.ts` v4.1.0).
- **Tests**: Covered by automated unit/integration regression test suites.
- **Frontend**: Consumed and rendered by reactive UI components and state stores.

### Evaluation Values:
- `PASS` — Fully implemented, verified, and operational.
- `PARTIAL` — Functioning with explicitly documented scope boundaries (e.g. control-plane vs tenant-scoped UI).
- `FUTURE` — Planned architectural extension, not yet implemented.
- `N/A` — Internal architectural mechanism not exposed as a standalone frontend view.
- `PENDING` — Awaiting implementation gate.

> [!IMPORTANT]
> **Strict Governance Principle**:
> "Endpoint exists" does NOT equate to "Feature is complete". A capability is complete only when domain business logic, data persistence, contract specifications, automated tests, and client presentation maintain 100% semantic consistency.

---

## 1. Platform Infrastructure & Architectural Baseline

| Layer | Technology & Implementation Standard |
| :--- | :--- |
| **Backend Runtime** | Bun 1.4 + TypeScript (ESNext, Strict Null Checks) |
| **Frontend Runtime** | Svelte 5 (Runes `$state`, `$derived`, class-based stores) + Vite |
| **Primary Persistence** | PostgreSQL 16 + PostGIS Spatial Engine (SRID 4326) |
| **Tenant Isolation** | PostgreSQL Row-Level Security (RLS) with session-bound `app.current_tenant_id` |
| **Caching & In-Memory Spatial** | Redis (Redis GEO, temporary reservation locks, token blacklists) |
| **Realtime Telemetry** | Socket.IO (tenant/supervisor partitioned rooms, GPS ingestion) |
| **Background Processing** | BullMQ + Redis Distributed Locks |
| **API Contract Standard** | OpenAPI 3.0.3 (v4.1.0 Specification in `swagger.ts`) |
| **Frozen Foundation** | Stage 1 to Stage 6 Backend & PostGIS Boundaries |
| **Completed Intelligence** | S7-01 (Hardening), S7-02 (Live Dashboard), S7-03 (Historical Analytics), S7-04 (Explainability) |
| **Planned Extension** | S7-05 (Operational Reporting & Async Export) |

---

## 2. Comprehensive Capability Matrix

### 2.1 Authentication & Identity Management
*Status: COMPLETE / VERIFIED / FROZEN*

| Capability | Backend | Contract | Tests | Frontend | Notes / Endpoints |
| :--- | :---: | :---: | :---: | :---: | :--- |
| User Login | `PASS` | `PASS` | `PASS` | `PASS` | `POST /api/auth/login` (identifier + password + CAPTCHA) |
| User Registration | `PASS` | `PASS` | `PASS` | `PASS` | `POST /api/auth/register` (token + verification) |
| Forgot Password | `PASS` | `PASS` | `PASS` | `PASS` | `POST /api/auth/forgot-password` |
| Reset Password | `PASS` | `PASS` | `PASS` | `PASS` | `POST /api/auth/reset-password` |
| Verify Reset Token | `PASS` | `PASS` | `PASS` | `PASS` | `POST /api/auth/verify-reset-token` |
| Refresh Token Rotation | `PASS` | `PASS` | `PASS` | `PASS` | `POST /api/auth/refresh-token` (HTTP-only cookie + body) |
| Logout & Revocation | `PASS` | `PASS` | `PASS` | `PASS` | `POST /api/auth/logout` (Redis token blacklist) |
| Current Session (`/me`) | `PASS` | `PASS` | `PASS` | `PASS` | `GET /api/auth/me` |
| First-Login Workflow | `PASS` | `PASS` | `PASS` | `PASS` | `POST /api/auth/complete-first-login` |
| CAPTCHA Risk Trap | `PASS` | `PASS` | `PASS` | `PASS` | `GET /api/auth/captcha` & IP rate-limit triggers |
| RBAC Route Protection | `PASS` | `PASS` | `PASS` | `PASS` | `SUPERADMIN`, `MANAGEMENT`, `SUPERVISOR`, `RIDER` |

---

### 2.2 User & Profile Administration
*Status: COMPLETE / VERIFIED / FROZEN*

| Capability | Backend | Contract | Tests | Frontend | Notes / Endpoints |
| :--- | :---: | :---: | :---: | :---: | :--- |
| User Listing & Pagination | `PASS` | `PASS` | `PASS` | `PASS` | `GET /api/users` |
| User Detail Inspection | `PASS` | `PASS` | `PASS` | `PASS` | `GET /api/users/{id}` |
| User Provisioning | `PASS` | `PASS` | `PASS` | `PASS` | `POST /api/users` |
| User Update | `PASS` | `PASS` | `PASS` | `PASS` | `PUT /api/users/{id}` |
| Toggle Active Status | `PASS` | `PASS` | `PASS` | `PASS` | `PATCH /api/users/{id}/status` |
| User Deletion | `PASS` | `PASS` | `PASS` | `PASS` | `DELETE /api/users/{id}` |
| Profile Self-Service | `PASS` | `PASS` | `PASS` | `PASS` | `GET /api/users/profile` |
| Change Password | `PASS` | `PASS` | `PASS` | `PASS` | `PUT /api/users/change-password` |
| Admin Password Reset | `PASS` | `PASS` | `PASS` | `PASS` | `POST /api/users/{id}/reset-password` |

---

### 2.3 Multi-Tenant Management & Data Isolation
*Status: COMPLETE / VERIFIED / FROZEN*

| Capability | Backend | Contract | Tests | Frontend | Notes / Endpoints |
| :--- | :---: | :---: | :---: | :---: | :--- |
| Tenant Listing | `PASS` | `PASS` | `PASS` | `PENDING` | `GET /api/tenants` (SUPERADMIN control-plane) |
| Tenant Detail | `PASS` | `PASS` | `PASS` | `PENDING` | `GET /api/tenants/{id}` |
| Create Tenant | `PASS` | `PASS` | `PASS` | `PENDING` | `POST /api/tenants` |
| Quota Management | `PASS` | `PASS` | `PASS` | `PENDING` | `max_fleets`, `max_riders`, `max_zones` |
| Tenant Status Toggle | `PASS` | `PASS` | `PASS` | `PENDING` | `PATCH /api/tenants/{id}/status` |
| PostgreSQL RLS Isolation | `PASS` | `N/A` | `PASS` | `N/A` | `app.current_tenant_id` + `mova_app` role |
| Anti-IDOR / BOLA Guard | `PASS` | `N/A` | `PASS` | `N/A` | Automatic tenant context from JWT |

---

### 2.4 Zone Geofence & Spatial Restriction Management
*Status: COMPLETE / VERIFIED / FROZEN*

| Capability | Backend | Contract | Tests | Frontend | Notes / Endpoints |
| :--- | :---: | :---: | :---: | :---: | :--- |
| Zone CRUD | `PASS` | `PASS` | `PASS` | `PASS` | `GET`, `POST`, `PUT`, `DELETE /api/zones` |
| Polygon PostGIS Validation | `PASS` | `PASS` | `PASS` | `PASS` | `POST /api/zones/validate` (`ST_IsValid`, `ST_Area`) |
| Polygon Overlap Detection | `PASS` | `PASS` | `PASS` | `PASS` | `ST_Intersects` cross-zone collision detection |
| Protocol Road Buffering | `PASS` | `PASS` | `PASS` | `PASS` | 10m buffer restriction (`PROHIBITED_ROAD`) |
| Toll Road Corridor Buffering | `PASS` | `PASS` | `PASS` | `PASS` | 25m corridor restriction (`PROHIBITED_TOLL_ROAD`) |
| Zone Capacity & Status | `PASS` | `PASS` | `PASS` | `PASS` | `PATCH /api/zones/{id}/capacity`, `/status` |

---

### 2.5 Global Spatial Master & POI Intelligence
*Status: COMPLETE / VERIFIED / FROZEN*

| Capability | Backend | Contract | Tests | Frontend | Notes / Endpoints |
| :--- | :---: | :---: | :---: | :---: | :--- |
| Overpass OSM Sync | `PASS` | `PASS` | `PASS` | `PASS` | `POST /api/pois/sync-city` |
| Central Hub Resolution | `PASS` | `PASS` | `PASS` | `PASS` | Fallback to `OperationalContextService` (No hardcoded city) |
| Shared Global POI Layer | `PASS` | `PASS` | `PASS` | `PASS` | `is_global = true` shared across all tenants |
| POI Category Master (51 Cats) | `PASS` | `PASS` | `PASS` | `PASS` | `GET /api/poi-categories` (Weights & Likert crowd) |
| POI Approval Workflow | `PASS` | `PASS` | `PASS` | `PASS` | `POST /api/pois/{id}/approve`, `/reject` |
| POI Deduplication Engine | `PASS` | `PASS` | `PASS` | `PASS` | PostGIS 15m radius spatial clustering |
| POI Spatial Metrics (C1/C2) | `PASS` | `PASS` | `PASS` | `PASS` | C1 Density (Benefit), C2 Diversity (Benefit) |

---

### 2.6 Weather Intelligence & Forecast Evaluation
*Status: COMPLETE / VERIFIED / FROZEN*

| Capability | Backend | Contract | Tests | Frontend | Notes / Endpoints |
| :--- | :---: | :---: | :---: | :---: | :--- |
| Open-Meteo Integration | `PASS` | `PASS` | `PASS` | `PASS` | Hourly temperature, precipitation, weather code |
| Weather Synchronization | `PASS` | `PASS` | `PASS` | `PASS` | `POST /api/weather/sync` (Hub & Zone grids) |
| Zone Weather Ingestion | `PASS` | `PASS` | `PASS` | `PASS` | `GET /api/weather/zones/{zoneId}` |
| C4 Weather Risk Metric | `PASS` | `PASS` | `PASS` | `PASS` | Rain probability & intensity (Cost Criterion) |

---

### 2.7 Competitor Intelligence (C6 Criterion)
*Status: COMPLETE / VERIFIED / FROZEN*

| Capability | Backend | Contract | Tests | Frontend | Notes / Endpoints |
| :--- | :---: | :---: | :---: | :---: | :--- |
| Competitor Profiles | `PASS` | `PASS` | `PASS` | `PASS` | `GET`, `POST`, `PUT`, `DELETE /api/competitors` |
| Field Observations | `PASS` | `PASS` | `PASS` | `PASS` | `POST /api/competitors/observations` |
| Price Overlap Engine | `PASS` | `PASS` | `PASS` | `PASS` | Min/max product pricing overlap factor |
| Category & Business Relevance | `PASS` | `PASS` | `PASS` | `PASS` | Street cart vs cafe vs chain kiosk weighting |
| Spatial & Temporal Pressure | `PASS` | `PASS` | `PASS` | `PASS` | Distance decay + peak operating hour overlap |
| C6 Relevant Impact Calculation | `PASS` | `PASS` | `PASS` | `PASS` | Aggregated relevant pressure score (Cost Criterion) |

---

### 2.8 Decision Support System (BWM + Safe TOPSIS)
*Status: COMPLETE / VERIFIED / FROZEN*

| Capability | Backend | Contract | Tests | Frontend | Notes / Endpoints |
| :--- | :---: | :---: | :---: | :---: | :--- |
| Criteria Master Definition | `PASS` | `PASS` | `PASS` | `PASS` | C1-C6 criteria taxonomy |
| BWM Weight Calculation | `PASS` | `PASS` | `PASS` | `PASS` | `POST /api/dss/bwm/calculate` (SUPERADMIN ONLY) |
| Consistency Ratio Verification | `PASS` | `PASS` | `PASS` | `PASS` | $\xi^*$ threshold validation ($CR \le 0.10$) |
| BWM Weight Activation | `PASS` | `PASS` | `PASS` | `PASS` | `POST /api/dss/bwm/{id}/activate` (SUPERADMIN ONLY) |
| BWM Impact Preview | `PASS` | `PASS` | `PASS` | `PASS` | `POST /api/dss/bwm/preview-impact` |
| TOPSIS Vector Normalization | `PASS` | `PASS` | `PASS` | `PASS` | Euclidean norm normalization ($r_{ij}$) |
| Positive & Negative Ideals | `PASS` | `PASS` | `PASS` | `PASS` | $A^+$ and $A^-$ boundary calculation |
| Closeness Coefficient ($C_i$) | `PASS` | `PASS` | `PASS` | `PASS` | $C_i = \frac{D_i^-}{D_i^+ + D_i^-}$ |
| Zero Variance Protection | `PASS` | `PASS` | `PASS` | `PASS` | Equal-value denominator guards |
| Recommendation Generation | `PASS` | `PASS` | `PASS` | `PASS` | `GET /api/dss/recommendations` |
| Evaluation Snapshot Persistence | `PASS` | `PASS` | `PASS` | `PASS` | `POST /api/dss/evaluate`, `GET /api/dss/snapshots` |
| DSS Explainability | `PASS` | `PASS` | `PASS` | `PASS` | Non-linear closeness distance breakdown |

---

### 2.9 Distribution & Rider Allocation
*Status: COMPLETE / VERIFIED / FROZEN*

| Capability | Backend | Contract | Tests | Frontend | Notes / Endpoints |
| :--- | :---: | :---: | :---: | :---: | :--- |
| Automatic DSS Distribution | `PASS` | `PASS` | `PASS` | `PASS` | Rank-ordered assignment to active zones |
| Manual Allocation | `PASS` | `PASS` | `PASS` | `PASS` | `POST /api/distribution/manual` (`assignments[]`) |
| Batch Commit Confirmation | `PASS` | `PASS` | `PASS` | `PASS` | `POST /api/distribution/confirm` (`allocations[]`) |
| Emergency Swap Workflow | `PASS` | `PASS` | `PASS` | `PASS` | `POST /api/distribution/emergency-swap` |
| Allocation Validation | `PASS` | `PASS` | `PASS` | `PASS` | Zone capacity & active duty constraints |
| Distribution History | `PASS` | `PASS` | `PASS` | `PASS` | `GET /api/distribution/history` |

---

### 2.10 Fleet / Armada State Machine
*Status: COMPLETE / VERIFIED / FROZEN*

| Capability | Backend | Contract | Tests | Frontend | Notes / Endpoints |
| :--- | :---: | :---: | :---: | :---: | :--- |
| Fleet Inventory CRUD | `PASS` | `PASS` | `PASS` | `PASS` | `GET`, `POST`, `PUT`, `DELETE /api/armadas` |
| 5-Minute Hold Lock | `PASS` | `PASS` | `PASS` | `PASS` | `POST /api/rider/hold-armada` (Redis key + TTL) |
| Hold Expiry Auto-Reconciliation | `PASS` | `PASS` | `PASS` | `PASS` | Automatic release back to `AVAILABLE` |
| Physical Checklist & Claim | `PASS` | `PASS` | `PASS` | `PASS` | `POST /api/rider/claim-armada` (`IN_USE`) |
| State Transition Integrity | `PASS` | `PASS` | `PASS` | `PASS` | `AVAILABLE` $\rightarrow$ `HOLD` $\rightarrow$ `IN_USE` $\rightarrow$ `AVAILABLE` |
| Issue Reporting & Maintenance | `PASS` | `PASS` | `PASS` | `PASS` | `MAINTENANCE`, `RETIRED` lifecycle management |

---

### 2.11 Rider Operational Lifecycle
*Status: COMPLETE / VERIFIED / FROZEN*

| Capability | Backend | Contract | Tests | Frontend | Notes / Endpoints |
| :--- | :---: | :---: | :---: | :---: | :--- |
| Active Duty Session Lookup | `PASS` | `PASS` | `PASS` | `PASS` | `GET /api/rider/active-session` |
| Available Fleet Retrieval | `PASS` | `PASS` | `PASS` | `PASS` | `GET /api/rider/hub-armadas` |
| Geofence GPS Check-In | `PASS` | `PASS` | `PASS` | `PASS` | `POST /api/rider/check-in` (`latitude`, `longitude`) |
| Mobile POS Sales Recording | `PASS` | `PASS` | `PASS` | `PASS` | `POST /api/rider/record-sale` (Cash & QRIS) |
| Shift Checkout & Settlement | `PASS` | `PASS` | `PASS` | `PASS` | `POST /api/rider/checkout` (Physical audit + Cash) |

---

### 2.12 LBS Ingestion & GPS Telemetry Protection
*Status: COMPLETE / VERIFIED / FROZEN*

| Capability | Backend | Contract | Tests | Frontend | Notes / Endpoints |
| :--- | :---: | :---: | :---: | :---: | :--- |
| High-Frequency GPS Ingestion | `PASS` | `PASS` | `PASS` | `PASS` | Canonical `POST /api/lbs/positions` |
| Legacy Endpoint Compatibility | `PASS` | `PASS` | `PASS` | `PASS` | `POST /api/lbs/track` (Marked `deprecated: true`) |
| Anti-Replay & Sequence Guard | `PASS` | `N/A` | `PASS` | `N/A` | Discards stale or duplicate sequence numbers |
| Distance & Rate Throttling | `PASS` | `N/A` | `PASS` | `N/A` | 5-meter delta & 5-second burst threshold |
| Coordinate Range Validation | `PASS` | `N/A` | `PASS` | `N/A` | Latitude $[-90, 90]$, Longitude $[-180, 180]$ |
| Redis GEO Live Location Cache | `PASS` | `N/A` | `PASS` | `PASS` | Tenant-partitioned spatial keys |
| Nearby Rider Lookup | `PASS` | `PASS` | `PASS` | `PASS` | `GET /api/lbs/nearby` (`GEORADIUS`) |

---

### 2.13 Operational Presence & Geofence Evaluation
*Status: COMPLETE / VERIFIED / FROZEN*

| Capability | Backend | Contract | Tests | Frontend | Notes / Endpoints |
| :--- | :---: | :---: | :---: | :---: | :--- |
| Transition Classification | `PASS` | `PASS` | `PASS` | `PASS` | `ENTER`, `EXIT`, `ON_SITE`, `OUTSIDE_ZONE`, `DEVIATED` |
| Compliance State Attribution | `PASS` | `PASS` | `PASS` | `PASS` | `COMPLIANT`, `DEVIATED`, `UNASSIGNED`, `OUTSIDE` |
| Event Fact Persistence | `PASS` | `N/A` | `PASS` | `N/A` | Authoritative `rider_presence_events` table |
| Presence History Retrieval | `PASS` | `PASS` | `PASS` | `PASS` | `GET /api/presence/history` |
| Live Presence Summary | `PASS` | `PASS` | `PASS` | `PASS` | `GET /api/presence/summary` |
| Active Geofence Alerts | `PASS` | `PASS` | `PASS` | `PASS` | `GET /api/presence/alerts` |

---

### 2.14 Realtime Telemetry & WebSocket Monitoring
*Status: COMPLETE / VERIFIED / FROZEN*

| Capability | Backend | Contract | Tests | Frontend | Notes / Endpoints |
| :--- | :---: | :---: | :---: | :---: | :--- |
| Socket.IO Gateway | `PASS` | `PASS` | `PASS` | `PASS` | Authenticated handshake with JWT |
| Tenant & Room Partitioning | `PASS` | `N/A` | `PASS` | `PASS` | `tenant:{id}` and `supervisor:{id}` rooms |
| Live Position Broadcast | `PASS` | `PASS` | `PASS` | `PASS` | Event `rider:position_updated` |
| Geofence Transition Events | `PASS` | `PASS` | `PASS` | `PASS` | Event `presence:transition` |
| Deviation Alert Notifications | `PASS` | `PASS` | `PASS` | `PASS` | Event `presence:deviation_alert` |
| Resync & Reconnection Fallback | `PASS` | `N/A` | `PASS` | `PASS` | Authoritative REST snapshot reconciliation |

---

### 2.15 Historical Operational Analytics (S7-03)
*Status: COMPLETE / VERIFIED / FROZEN*

| Capability | Backend | Contract | Tests | Frontend | Notes / Endpoints |
| :--- | :---: | :---: | :---: | :---: | :--- |
| Presence & Compliance Summary | `PASS` | `PASS` | `PASS` | `PASS` | `GET /api/analytics/historical/presence/summary` |
| Bucketed Presence Timeseries | `PASS` | `PASS` | `PASS` | `PASS` | `GET /api/analytics/historical/presence/timeline` |
| Deterministic Deviation Episodes | `PASS` | `PASS` | `PASS` | `PASS` | `GET /api/analytics/historical/deviations` |
| Zone Historical Performance | `PASS` | `PASS` | `PASS` | `PASS` | `GET /api/analytics/historical/zones` |
| Rider Historical Performance | `PASS` | `PASS` | `PASS` | `PASS` | `GET /api/analytics/historical/riders` |
| Period-Over-Period Comparison | `PASS` | `PASS` | `PASS` | `PASS` | `GET /api/analytics/historical/comparison` |
| Zero-Fake-Data Invariant | `PASS` | `PASS` | `PASS` | `PASS` | Nullable compliance rate when denominator is 0 |
| Half-Open Temporal Window | `PASS` | `PASS` | `PASS` | `PASS` | `[start, end)` boundary semantics |
| Multi-Grain Bucketing | `PASS` | `PASS` | `PASS` | `PASS` | `hour`, `day`, `week`, `month` |
| Explicit IANA Timezone | `PASS` | `PASS` | `PASS` | `PASS` | Default `"Asia/Jakarta"`, DST-safe |
| Reactive Frontend Dashboard | `PASS` | `PASS` | `PASS` | `PASS` | S7-03-11 Dashboard (`HistoricalAnalyticsPage`) |

---

### 2.16 Audit Trail & System Forensic Logs
*Status: COMPLETE / VERIFIED / FROZEN*

| Capability | Backend | Contract | Tests | Frontend | Notes / Endpoints |
| :--- | :---: | :---: | :---: | :---: | :--- |
| Automated Audit Event Logging | `PASS` | `PASS` | `PASS` | `PASS` | Auth, DSS, and system mutations |
| Tenant-Isolated Audit Retrieval | `PASS` | `PASS` | `PASS` | `PASS` | `GET /api/audit/logs` |
| Audit Pagination & Filtering | `PASS` | `PASS` | `PASS` | `PASS` | Filter by user, action, date range |

---

### 2.17 Automation, Cron & Job Scheduling
*Status: COMPLETE / VERIFIED / FROZEN*

| Capability | Backend | Contract | Tests | Frontend | Notes / Endpoints |
| :--- | :---: | :---: | :---: | :---: | :--- |
| Dynamic Cron Job Management | `PASS` | `PASS` | `PASS` | `PASS` | `GET /api/cron/jobs` |
| Manual Job Execution Trigger | `PASS` | `PASS` | `PASS` | `PASS` | `POST /api/cron/jobs/{id}/run` |
| Execution History & Logs | `PASS` | `PASS` | `PASS` | `PASS` | `GET /api/cron/jobs/{id}/logs` |
| Overpass POI Sync Schedule | `PASS` | `PASS` | `PASS` | `PASS` | Configurable background trigger |
| Open-Meteo Weather Sync Schedule | `PASS` | `PASS` | `PASS` | `PASS` | Configurable background trigger |
| Redis Distributed Mutex Locks | `PASS` | `N/A` | `PASS` | `N/A` | Prevents concurrent duplicate runs |

---

### 2.18 Health Check & System Readiness
*Status: COMPLETE / VERIFIED / FROZEN*

| Capability | Backend | Contract | Tests | Frontend | Notes / Endpoints |
| :--- | :---: | :---: | :---: | :---: | :--- |
| Unauthenticated Health Probe | `PASS` | `PASS` | `PASS` | `PASS` | `GET /api/health` |
| System Readiness Probe | `PASS` | `PASS` | `PASS` | `PASS` | `GET /api/system/readiness` (DB & Redis check) |
| Onboarding Setup Status | `PASS` | `PASS` | `PASS` | `PASS` | `GET /api/system/setup-status` |

---

## 3. Unimplemented Capabilities & Future Milestones

### 3.1 S7-05: Operational Reporting & Async Export Engine
*Status: FUTURE / PLANNED ARCHITECTURAL EXTENSION*

> [!WARNING]
> **Boundary Distinction**:
> `S7-03 Historical Analytics` (read, aggregate, compare, visualize) is **NOT** the same as `S7-05 Operational Reporting` (async worker generation, tabular CSV/XLSX export, PDF document rendering, report download history). S7-05 remains to be implemented under strict async worker patterns.

| Planned Capability | Backend | Contract | Tests | Frontend | Implementation Blueprint |
| :--- | :---: | :---: | :---: | :---: | :--- |
| Report Definition Engine | `FUTURE` | `FUTURE` | `FUTURE` | `FUTURE` | Templated schema for Presence, Sales, Fleet |
| Async Export Worker (BullMQ) | `FUTURE` | `FUTURE` | `FUTURE` | `FUTURE` | Offloads heavy file generation from HTTP thread |
| CSV Data Stream Export | `FUTURE` | `FUTURE` | `FUTURE` | `FUTURE` | Raw tabular event data export |
| XLSX Multi-Sheet Workbook | `FUTURE` | `FUTURE` | `FUTURE` | `FUTURE` | Formatted Excel workbook with KPI summaries |
| PDF Visual Executive Summary | `FUTURE` | `FUTURE` | `FUTURE` | `FUTURE` | Print-ready PDF report generator |
| Async Export Job Status API | `FUTURE` | `FUTURE` | `FUTURE` | `FUTURE` | `GET /api/reports/jobs/{jobId}` |
| Download & Storage Lifecycle | `FUTURE` | `FUTURE` | `FUTURE` | `FUTURE` | Signed URL / temp storage with auto-cleanup |
| Report Scheduling & Delivery | `FUTURE` | `FUTURE` | `FUTURE` | `FUTURE` | Automated daily/weekly email dispatch |

---

### 3.2 Future Intelligence & Platform Extensions

| Future Module | Backend | Contract | Tests | Frontend | Target Scope |
| :--- | :---: | :---: | :---: | :---: | :--- |
| Fleet Utilization Matrix | `FUTURE` | `FUTURE` | `FUTURE` | `FUTURE` | Continuous battery wear & idle duration tracking |
| Spatial Heatmap Intelligence | `FUTURE` | `FUTURE` | `FUTURE` | `FUTURE` | Kernel density estimation for sales/presence |
| Notification Center UI | `FUTURE` | `FUTURE` | `FUTURE` | `FUTURE` | Granular webhook & push notification matrix |
| System Observability Dashboard | `FUTURE` | `FUTURE` | `FUTURE` | `FUTURE` | Redis memory, DB connection pool telemetry |

---

## 4. Overall Milestone Status Summary

```
================================================================================
STAGE / MILESTONE                                          STATUS
================================================================================
Stage 1: Multi-Tenant Architecture & PostgreSQL RLS        PASS / CLOSED / FROZEN
Stage 2: Global Spatial Master & POI Data Pipeline         PASS / CLOSED / FROZEN
Stage 3A: Competitor Spatial-Temporal Intelligence (C6)    PASS / CLOSED / FROZEN
Stage 3B: Decision Support System (BWM + Safe TOPSIS)      PASS / CLOSED / FROZEN
Stage 4: Fleet Inventory & 5-Min Hold State Machine        PASS / CLOSED / FROZEN
Stage 5: LBS High-Frequency Telemetry Ingestion            PASS / CLOSED / FROZEN
Stage 6: Operational Geofence Presence & Deviations        PASS / CLOSED / FROZEN
S7-01: Production Hardening & Anti-IDOR Security Traps     PASS / CLOSED / FROZEN
S7-02: Operational Intelligence Dashboard & Live Telemetry PASS / CLOSED / FROZEN
S7-03: Historical Operational Analytics (End-to-End)       PASS / CLOSED / FROZEN
S7-04: DSS Explainability & Non-Linear Evidence Models     PASS / CLOSED / FROZEN
S7-05: Operational Reporting & Async Export Engine         FUTURE / READY FOR SPEC
================================================================================
```

---

## 5. Architectural Invariants for Future Stages

1. **Frozen Foundations**: Stages 1–6 backend code and OpenAPI v4.1.0 specifications must not be modified or broken for frontend convenience.
2. **Zero Fabricated Metrics**: All reports and analytics must preserve `null` for non-available metrics (e.g. division by zero). Never render artificial percentages.
3. **Async Offloading**: Heavy exports (CSV, XLSX, PDF) must be queued through BullMQ background jobs to prevent HTTP thread starvation.
4. **Tenant Isolation**: RLS and session-bound JWT tenant resolution must be maintained across all export files and storage artifacts.
5. **Authoritative Sources**: PostgreSQL/PostGIS remains the single source of truth; Redis serves strictly as cache and lock coordination.
