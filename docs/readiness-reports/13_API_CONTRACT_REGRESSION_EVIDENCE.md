# F-13: API Contract Regression Matrix (OpenAPI v4.2.0) Evidence Pack
**MOVA Platform — Release Candidate 1 (`v1.0.0-rc.1`)**  
**Audit Gate**: `F-13` — API Contract Regression Matrix  
**Date**: 2026-09-08  
**Status**: **PASS / CLOSED (22/22 Services Mapped & Qualified)**  
**Specification Baseline**: OpenAPI Specification `v4.2.0` (OAS 3.0.3)

---

## 1. Executive Summary

Gate **F-13** certifies that 100% of frontend API consumption across all 22 domain services maps strictly, cleanly, and predictably to the authoritative backend **OpenAPI Specification v4.2.0** without undocumented endpoints, client data fabrication, or bypasses.

---

## 2. Comprehensive 22-Domain Service Contract Regression Matrix

| # | Domain Service File | Primary OAS v4.2.0 Endpoints | Enforced Invariants & Envelope Unwrapping | Status |
| :-: | :--- | :--- | :--- | :---: |
| **1** | [`authService.ts`](file:///d:/project_alpha/koling-app/bun_svelte/frontend/src/services/authService.ts) | `POST /api/auth/login`<br>`POST /api/auth/refresh`<br>`POST /api/auth/logout`<br>`GET /api/auth/me`<br>`POST /api/auth/first-login` | JWT Bearer authentication, 401 refresh queue, first-login password update. | **PASS** |
| **2** | [`dashboardService.ts`](file:///d:/project_alpha/koling-app/bun_svelte/frontend/src/services/dashboardService.ts) | `GET /api/dashboard/summary`<br>`GET /api/dashboard/sales-trend`<br>`GET /api/dashboard/product-performance`<br>`GET /api/dashboard/zone-performance` | Macro KPIs, financial aggregation, nullish coalescing `?? 0`, `Promise.allSettled`. | **PASS** |
| **3** | [`zoneService.ts`](file:///d:/project_alpha/koling-app/bun_svelte/frontend/src/services/zoneService.ts) | `GET /api/zones`<br>`POST /api/zones`<br>`PUT /api/zones/:id`<br>`DELETE /api/zones/:id`<br>`POST /api/zones/validate` | PostGIS spatial validation, toll road corridor collision checks, GeoJSON polygons. | **PASS** |
| **4** | [`armadaService.ts`](file:///d:/project_alpha/koling-app/bun_svelte/frontend/src/services/armadaService.ts) | `GET /api/fleets`<br>`POST /api/fleets`<br>`PUT /api/fleets/:id`<br>`DELETE /api/fleets/:id`<br>`GET /api/fleets/:id` | 5 canonical fleet states (`ACTIVE/RESERVED/IN_USE/MAINTENANCE/RETIRED`). | **PASS** |
| **5** | [`riderService.ts`](file:///d:/project_alpha/koling-app/bun_svelte/frontend/src/services/riderService.ts) | `GET /api/rider/hub-armadas`<br>`POST /api/rider/hold-armada`<br>`POST /api/rider/claim-armada`<br>`POST /api/rider/checkout`<br>`POST /api/lbs/track` | 5-minute ticket-booking hold lock, 5-point physical checklist, 409 conflict safety. | **PASS** |
| **6** | [`dssService.ts`](file:///d:/project_alpha/koling-app/bun_svelte/frontend/src/services/dssService.ts) | `GET /api/dss/criteria`<br>`POST /api/dss/evaluate`<br>`POST /api/dss/bwm/calculate`<br>`GET /api/dss/bwm/active`<br>`GET /api/dss/snapshots` | 6 canonical criteria ($C_1-C_3$ Benefit, $C_4-C_6$ Cost), BWM $CR=0.0029$, TOPSIS matrix. | **PASS** |
| **7** | [`historicalAnalyticsService.ts`](file:///d:/project_alpha/koling-app/bun_svelte/frontend/src/services/historicalAnalyticsService.ts) | `GET /api/analytics/historical/presence/summary`<br>`GET /timeline`<br>`GET /deviations`<br>`GET /zones`<br>`GET /riders`<br>`GET /comparison` | Half-open `[start, end)` semantics, zero-fake-data (null compliance), episode reconstruction. | **PASS** |
| **8** | [`reportExportService.ts`](file:///d:/project_alpha/koling-app/bun_svelte/frontend/src/services/reportExportService.ts) | `POST /api/reports/export`<br>`GET /api/reports/export/:id`<br>`GET /api/reports/export`<br>`GET /api/reports/export/:id/download` | Async `POST 202` job lifecycle, bounded poller, `SALES_SETTLEMENT` locked `DEFERRED`. | **PASS** |
| **9** | [`reportService.ts`](file:///d:/project_alpha/koling-app/bun_svelte/frontend/src/services/reportService.ts) | `GET /api/reports/riders/performance`<br>`GET /zones/effectiveness`<br>`GET /fleet/lifecycle`<br>`GET /dss/accuracy`<br>`GET /executive-summary` | 4 Pillar analytical reports, multi-sheet workbook & executive summaries. | **PASS** |
| **10** | [`userService.ts`](file:///d:/project_alpha/koling-app/bun_svelte/frontend/src/services/userService.ts) | `GET /api/users`<br>`POST /api/users`<br>`PUT /api/users/:id`<br>`DELETE /api/users/:id` | Multi-tenant RBAC account management, password hashing, role assignment. | **PASS** |
| **11** | [`productService.ts`](file:///d:/project_alpha/koling-app/bun_svelte/frontend/src/services/productService.ts) | `GET /api/products`<br>`POST /api/products`<br>`PUT /api/products/:id`<br>`DELETE /api/products/:id` | Menu catalog CRUD, pricing, beverage inventory mapping. | **PASS** |
| **12** | [`distributionService.ts`](file:///d:/project_alpha/koling-app/bun_svelte/frontend/src/services/distributionService.ts) | `GET /api/distribution/overview`<br>`POST /api/distribution/assign`<br>`DELETE /api/distribution/unassign` | Rider-to-zone operational duty assignment and schedule plotting. | **PASS** |
| **13** | [`poiService.ts`](file:///d:/project_alpha/koling-app/bun_svelte/frontend/src/services/poiService.ts) | `GET /api/pois`<br>`POST /api/pois`<br>`DELETE /api/pois/:id`<br>`POST /api/pois/sync` | PostGIS POI spatial queries, Overpass background proxy synchronization. | **PASS** |
| **14** | [`poiCategoryService.ts`](file:///d:/project_alpha/koling-app/bun_svelte/frontend/src/services/poiCategoryService.ts) | `GET /api/poi-categories`<br>`POST /api/poi-categories` | POI taxonomy categorization (Commercial, Education, Transit, Office). | **PASS** |
| **15** | [`competitorService.ts`](file:///d:/project_alpha/koling-app/bun_svelte/frontend/src/services/competitorService.ts) | `GET /api/competitors`<br>`POST /api/competitors` | Competitor location tracking for $C_6$ cost criterion evaluation. | **PASS** |
| **16** | [`mapService.ts`](file:///d:/project_alpha/koling-app/bun_svelte/frontend/src/services/mapService.ts) | `GET /api/roads/protocol`<br>`GET /api/roads/toll`<br>`GET /api/map/config` | Layer restriction visualization without direct browser-to-Overpass bypasses. | **PASS** |
| **17** | [`cronService.ts`](file:///d:/project_alpha/koling-app/bun_svelte/frontend/src/services/cronService.ts) | `GET /api/cron/status`<br>`POST /api/cron/trigger` | Scheduled tasks inspection (weather refresh, POI sync, settlement purge). | **PASS** |
| **18** | [`notificationService.ts`](file:///d:/project_alpha/koling-app/bun_svelte/frontend/src/services/notificationService.ts) | `GET /api/notifications`<br>`POST /api/notifications/mark-read`<br>`POST /api/notifications/mark-all-read` | Live operational notifications, deviation alerts, and badge counters. | **PASS** |
| **19** | [`setupService.ts`](file:///d:/project_alpha/koling-app/bun_svelte/frontend/src/services/setupService.ts) | `GET /api/setup/status`<br>`POST /api/setup/initialize`<br>`POST /api/setup/seed` | Initial hub setup wizard, base dataset seeding, superadmin provisioning. | **PASS** |
| **20** | [`systemReadinessService.ts`](file:///d:/project_alpha/koling-app/bun_svelte/frontend/src/services/systemReadinessService.ts) | `GET /api/system/readiness` | Environmental diagnostic check (PostGIS, Redis, BullMQ, WebSocket). | **PASS** |
| **21** | [`dataSyncService.ts`](file:///d:/project_alpha/koling-app/bun_svelte/frontend/src/services/dataSyncService.ts) | `GET /api/data-sync/status`<br>`POST /api/data-sync/trigger` | Spatial data snapshot versioning and dataset synchronization. | **PASS** |
| **22** | [`candidateLocationService.ts`](file:///d:/project_alpha/koling-app/bun_svelte/frontend/src/services/candidateLocationService.ts) | `GET /api/candidate-locations`<br>`POST /api/candidate-locations` | Micro-location candidate evaluations and historical ranking archives. | **PASS** |

---

## 3. Audit Verdict & Conclusion

Gate **F-13: API Contract Regression Matrix** is formally certified as **`PASS / CLOSED`**.

- **Total Services**: 22
- **Passed**: 22
- **Contract Drift**: **0% (100% OAS v4.2.0 Compliant)**
- **Next Audit Gate**: **`F-14` — Production Client Build Integrity Audit**
