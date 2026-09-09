# MOVA SINGLE-TENANT FRONTEND CONVERGENCE & SSOT AUDIT

**Target Version:** Single-Tenant Production Baseline (F-01 through F-07)  
**Status:** **LOCKED & FULLY CONVERGED (PASS)**  
**Backend Status:** **100% Frozen (0 modifications)**  
**Zero-Mock Policy:** **100% Compliant (Zero dummy/mock business data)**  
**Design System:** **100% MOVA Design System Compliant (Inter, 4–8px radius, #E5E5E5 border, #2563EB primary, compact rectangular layout)**  

---

## 1. Executive Summary

This document establishes the authoritative convergence audit of the MOVA Single-Tenant frontend application across all operational, commercial, spatial, and analytical workspaces:

- **F-01:** Analytics Service, Query Keys & Semantic Metadata Preservation
- **F-02:** SuperAdmin Dashboard & MOVA UI Primitives Foundation
- **F-03:** Map Ops Spatial Canvas Reconstruction
- **F-04 / F-04.1:** Operational Page Composition & Endpoint Canonical Reconciliation
- **F-05:** DSS Intelligence Workspace & C3 Crowd Configuration
- **F-05.1:** Multi-Tenant Reference Audit & Lineage Trace
- **F-06.0:** Contract Reconciliation & Preflight (26/26 PASS)
- **F-06.1:** POI Intelligence & Moderation Workspace (27/27 PASS)
- **F-06.2:** Product Catalog & Commercial Workspace (14/14 PASS)
- **F-06.3:** User Directory & RBAC Workspace (13/13 PASS)
- **F-06.4:** Competitor Intelligence & Spatial Workspace (17/17 PASS)
- **F-07:** Reports & Historical Analytics Workspace (26/26 PASS)

All business data rendered in the UI originates directly from authoritative PostgreSQL/PostGIS databases and frozen Express REST API endpoints through the centralized TanStack Query cache. **Zero client-side business calculations** (BWM, TOPSIS, C1–C6 criteria, financial aggregations) exist in React components.

---

## 2. Page & Workspace Inventory

| Page Component | Route Path | Authorized Roles | Primary Capabilities | Query Keys Consumed |
| :--- | :--- | :--- | :--- | :--- |
| `SuperAdminDashboardPage.jsx` | `/dashboard` | `SUPERADMIN`, `SUPERVISOR` | KPI overview, active BWM weights, operational session summary, spatial compliance summary | `queryKeys.analytics.overview()`, `queryKeys.dss.activeConfig()` |
| `MapOpsPage.jsx` | `/map-ops` | `SUPERADMIN`, `SUPERVISOR`, `RIDER` | Live PostGIS spatial canvas, real-time rider tracking, polygon geofences, POI layers, weather HUD | `queryKeys.distribution.overview()`, `queryKeys.lbs.liveRiders()`, `queryKeys.zones.all`, `queryKeys.dss.recommendations()`, `queryKeys.roads.protocol`, `queryKeys.weather.hub()` |
| `DistributionPage.jsx` | `/distribution` | `SUPERADMIN`, `SUPERVISOR` | FIFO queue monitoring, automated rider-to-zone assignment, active shift management | `queryKeys.distribution.overview()`, `queryKeys.lbs.liveRiders()`, `queryKeys.zones.all` |
| `FleetManagementPage.jsx` | `/fleets` | `SUPERADMIN`, `SUPERVISOR` | Armada inventory, battery/vehicle telemetry, spatial hold tracking | `queryKeys.armadas.all` |
| `ZoneManagementPage.jsx` | `/zones` | `SUPERADMIN`, `SUPERVISOR` | PostGIS polygon boundary management, zone capacity, C4 weather telemetry | `queryKeys.zones.all`, `queryKeys.weather.hub()` |
| `DssManagementPage.jsx` | `/dss` | `SUPERADMIN`, `SUPERVISOR` | TOPSIS recommendation rankings, provenance inspector, 58-category C3 crowd matrix, weather context, plan vs actual analytics | `queryKeys.dss.recommendations()`, `queryKeys.poiCategories.crowdScores`, `queryKeys.weather.hub()`, `queryKeys.analytics.dssPerformance()` |
| `PoiManagementPage.jsx` | `/pois` | `SUPERADMIN`, `SUPERVISOR` | Approved operational POIs, pending moderation queue, approval logs, OSM Overpass sync | `queryKeys.pois.operationalArea`, `queryKeys.pois.pending`, `queryKeys.pois.approvalLogs`, `queryKeys.poiCategories.crowdScores`, `queryKeys.zones.all` |
| `CatalogPage.jsx` | `/catalog` | `SUPERADMIN`, `SUPERVISOR` | Commercial menu items, pricing, HPP/base price, product activation status | `queryKeys.products.all` |
| `UserManagementPage.jsx` | `/users` | `SUPERADMIN` | User directory, role assignment, account status toggle, RBAC hierarchy guard | `queryKeys.users.all` |
| `CompetitorManagementPage.jsx` | `/competitors` | `SUPERADMIN`, `SUPERVISOR` | Zone-scoped competitor survey, PostGIS coordinate capture, server-calculated C6 density score | `queryKeys.competitors.byZone()`, `queryKeys.competitors.score()`, `queryKeys.roads.protocol`, `queryKeys.zones.all` |
| `ReportsPage.jsx` | `/reports` | `SUPERADMIN`, `SUPERVISOR` | Overview & sales breakdown, fleet utilization, geofence compliance, DSS plan vs actual, daily CSV export | `queryKeys.analytics.overview()`, `queryKeys.analytics.operational()`, `queryKeys.analytics.compliance()`, `queryKeys.analytics.sales()`, `queryKeys.analytics.dssPerformance()`, `queryKeys.analytics.dailyReport()` |
| `RiderOperationalPage.jsx` | `/rider-ops` | `RIDER` | Personal shift check-in, live GPS beacon, geofence status, sales registration | `queryKeys.lbs.liveRiders()`, `queryKeys.distribution.overview()` |

---

## 3. End-to-End Data Lineage Matrix (Forward Lineage)

| UI Workspace | UI Field | Frontend Service Method | REST API Endpoint | Backend Controller | Domain Service / Pipeline | Repository | Database Table | Source Type |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **POI Intelligence** | POI Name & Location | `poiService.getOperationalAreaPois()` | `GET /api/pois/operational-area` | `poiController.getOperationalAreaPois` | `poiService.getOperationalAreaPois` | `poiRepository` | `pois` (PostGIS) | `DB_BACKED` |
| **POI Intelligence** | Moderation Queue | `poiService.getPendingPois()` | `GET /api/pois/pending` | `poiController.getPendingPois` | `poiService.getPendingPois` | `poiRepository` | `pois_raw` | `DB_BACKED` |
| **POI Intelligence** | Approval History | `poiService.getApprovalLogs()` | `GET /api/pois/approval-logs` | `poiController.getApprovalLogs` | `poiService.getApprovalLogs` | `poiRepository` | `poi_approval_logs` | `DB_BACKED` |
| **POI Intelligence** | Category Master (58) | `poiService.getCrowdScores()` | `GET /api/poi-categories/crowd-scores` | `poiCategoryController.getCrowdScores` | `poiCategoryService.getCrowdScores` | `poiCategoryModel` | `poi_categories` | `DB_BACKED` |
| **POI Intelligence** | City OSM Sync | `poiService.syncCityPois()` | `POST /api/pois/sync-city` | `poiController.syncCityPois` | `PoiEltPipelineService` / BullMQ | `poiRepository` | `pois_raw` / `sync_runs` | `BACKEND_DERIVED` |
| **Product Catalog** | Product Name & Price | `productService.getProducts()` | `GET /api/products` | `productController.getAll` | `productService.getAll` | `productRepository` | `products` | `DB_BACKED` |
| **Product Catalog** | Status Toggle | `productService.updateStatus()` | `PATCH /api/products/:id/status` | `productController.updateStatus` | `productService.updateStatus` | `productRepository` | `products` | `DB_BACKED` |
| **User Directory** | User List & Role | `userService.getUsers()` | `GET /api/users` | `userController.getAllUsers` | `userService.getAllUsers` | `userRepository` | `users` | `DB_BACKED` |
| **User Directory** | User Status Toggle | `userService.updateStatus()` | `PATCH /api/users/:id/status` | `userController.updateStatus` | `userService.updateStatus` | `userRepository` | `users` | `DB_BACKED` |
| **Competitors** | Competitor Locations | `competitorService.getByZone()` | `GET /api/competitors/zone/:zone_id` | `competitorController.getByZone` | `competitorService.getByZone` | `competitorRepository` | `competitor_locations` | `DB_BACKED` |
| **Competitors** | C6 Density Score | `competitorService.getScoreByZone()` | `GET /api/competitors/score/:zone_id` | `competitorController.getScoreByZone` | `competitorService.getScoreByZone` | `competitorRepository` | `competitor_locations` (ST_Buffer) | `BACKEND_DERIVED` |
| **Reports** | Macro Revenue | `analyticsService.getOverview()` | `GET /api/analytics/overview` | `analyticsController.getOverview` | `AnalyticsDomainService` | `analyticsRepository` | `sales_logs` | `BACKEND_DERIVED` |
| **Reports** | Fleet Utilization | `analyticsService.getOperationalSummary()` | `GET /api/analytics/operational/summary` | `analyticsController.getOperationalSummary` | `AnalyticsDomainService` | `operationalSessionRepository` | `operational_sessions` | `BACKEND_DERIVED` |
| **Reports** | Geofence Compliance | `analyticsService.getComplianceSummary()` | `GET /api/analytics/compliance/summary` | `analyticsController.getComplianceSummary` | `AnalyticsDomainService` | `operationalSessionRepository` | `rider_geofence_logs` | `BACKEND_DERIVED` |
| **Reports** | TOPSIS Plan vs Actual | `analyticsService.getDssPlanVsActual()` | `GET /api/analytics/dss/plan-vs-actual` | `analyticsController.getDssPlanVsActual` | `AnalyticsDomainService` | `analyticsRepository` | `dss_recommendations` / `sales_logs` | `BACKEND_DERIVED` |
| **Reports** | CSV Report Stream | `analyticsService.exportDailyReport()` | `GET /api/analytics/reports/daily-summary?format=csv` | `analyticsController.getDailyReport` | `AnalyticsDomainService` | `analyticsRepository` | Aggregated Views | `BACKEND_DERIVED` |

---

## 4. Reverse Endpoint Mapping & Coverage

| Endpoint | Method | Consuming Service | Consuming Pages / Components | Action Type | Orphan Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `/api/pois/operational-area` | GET | `poiService.getOperationalAreaPois` | `PoiManagementPage.jsx`, `MapOpsPage.jsx` | Read (Query) | **CONSUMED** |
| `/api/pois/pending` | GET | `poiService.getPendingPois` | `PoiManagementPage.jsx` | Read (Query) | **CONSUMED** |
| `/api/pois/approval-logs` | GET | `poiService.getApprovalLogs` | `PoiManagementPage.jsx` | Read (Query) | **CONSUMED** |
| `/api/pois/approve` | POST | `poiService.approveOrRejectPoi` | `PoiManagementPage.jsx` | Write (Mutation) | **CONSUMED** |
| `/api/pois/sync-city` | POST | `poiService.syncCityPois` | `PoiManagementPage.jsx` | Write (Mutation) | **CONSUMED** |
| `/api/pois/zone/:zone_id` | GET | `poiService.getPoisByZone` | `ZoneManagementPage.jsx` | Read (Query) | **CONSUMED** |
| `/api/poi-categories/crowd-scores` | GET | `poiService.getCrowdScores` | `PoiManagementPage.jsx`, `DssManagementPage.jsx` | Read (Query) | **CONSUMED** |
| `/api/poi-categories/crowd-scores` | PUT | `dssService.updateBulkC3Scores` | `DssManagementPage.jsx` | Write (Mutation) | **CONSUMED** |
| `/api/products` | GET | `productService.getProducts` | `CatalogPage.jsx` | Read (Query) | **CONSUMED** |
| `/api/products/:id` | GET | `productService.getProductById` | `CatalogPage.jsx` | Read (Query) | **CONSUMED** |
| `/api/products` | POST | `productService.createProduct` | `CatalogPage.jsx` | Write (Mutation) | **CONSUMED** |
| `/api/products/:id` | PUT | `productService.updateProduct` | `CatalogPage.jsx` | Write (Mutation) | **CONSUMED** |
| `/api/products/:id/status` | PATCH | `productService.updateStatus` | `CatalogPage.jsx` | Write (Mutation) | **CONSUMED** |
| `/api/products/:id` | DELETE | `productService.deleteProduct` | `CatalogPage.jsx` | Write (Mutation) | **CONSUMED** |
| `/api/users` | GET | `userService.getUsers` | `UserManagementPage.jsx` | Read (Query) | **CONSUMED** |
| `/api/users/:id` | GET | `userService.getUserById` | `UserManagementPage.jsx` | Read (Query) | **CONSUMED** |
| `/api/users/profile` | GET | `userService.getProfile` | `ProfilePage.jsx`, `AppLayout.jsx` | Read (Query) | **CONSUMED** |
| `/api/users/:id` | PUT | `userService.updateUser` | `UserManagementPage.jsx` | Write (Mutation) | **CONSUMED** |
| `/api/users/:id/status` | PATCH | `userService.updateStatus` | `UserManagementPage.jsx` | Write (Mutation) | **CONSUMED** |
| `/api/competitors/zone/:zone_id` | GET | `competitorService.getByZone` | `CompetitorManagementPage.jsx` | Read (Query) | **CONSUMED** |
| `/api/competitors/score/:zone_id` | GET | `competitorService.getScoreByZone` | `CompetitorManagementPage.jsx` | Read (Query) | **CONSUMED** |
| `/api/competitors` | POST | `competitorService.create` | `CompetitorManagementPage.jsx` | Write (Mutation) | **CONSUMED** |
| `/api/competitors/:id` | DELETE | `competitorService.delete` | `CompetitorManagementPage.jsx` | Write (Mutation) | **CONSUMED** |
| `/api/roads/protocol` | GET | `roadService.getProtocolRoads` | `MapOpsPage.jsx`, `CompetitorManagementPage.jsx` | Read (Query) | **CONSUMED** |
| `/api/analytics/overview` | GET | `analyticsService.getOverview` | `SuperAdminDashboardPage.jsx`, `ReportsPage.jsx` | Read (Query) | **CONSUMED** |
| `/api/analytics/operational/summary` | GET | `analyticsService.getOperationalSummary` | `ReportsPage.jsx` | Read (Query) | **CONSUMED** |
| `/api/analytics/operational/fleet-utilization` | GET | `analyticsService.getFleetUtilization` | `ReportsPage.jsx` | Read (Query) | **CONSUMED** |
| `/api/analytics/compliance/summary` | GET | `analyticsService.getComplianceSummary` | `ReportsPage.jsx` | Read (Query) | **CONSUMED** |
| `/api/analytics/sales/performance` | GET | `analyticsService.getSalesPerformance` | `ReportsPage.jsx` | Read (Query) | **CONSUMED** |
| `/api/analytics/dss/plan-vs-actual` | GET | `analyticsService.getDssPlanVsActual` | `DssManagementPage.jsx`, `ReportsPage.jsx` | Read (Query) | **CONSUMED** |
| `/api/analytics/reports/daily-summary` | GET | `analyticsService.getDailyReport` | `ReportsPage.jsx` | Read (Query) | **CONSUMED** |
| `/api/analytics/reports/daily-summary?format=csv` | GET | `analyticsService.exportDailyReport` | `ReportsPage.jsx`, `SuperAdminDashboardPage.jsx` | Stream Download | **CONSUMED** |

---

## 5. UI Primitives & Design System Verification

All components adhere strictly to `frontend/MOVA_DESIGN_SYSTEM.md`:

- **Font Family:** `Inter, -apple-system, BlinkMacSystemFont, sans-serif` only.
- **Color Tokens:**
  - Page Background: `#FAFAFA`
  - Panel Background: `#FFFFFF`
  - Border: `1px solid #E5E5E5`
  - Primary Accent: `#2563EB` (Blue 600)
  - Semantic Status: Active/Valid (`#16A34A`), Warning/Pending (`#D97706`), Danger/Inactive (`#DC2626`), Neutral/Disabled (`#6B7280`).
- **Geometry:** 4px control radius, 8px panel radius, 12px modal/drawer radius. Dense enterprise control room layouts (4px base grid).
- **Zero Decorative Anti-Patterns:** Zero gradients, zero glassmorphism, zero unnecessary shadows, zero decorative orange.

---

## 6. Zero-Mock & Pure Consumer Invariants

1. **Zero Mock Business Constants:** No mock POI arrays, mock product lists, mock user arrays, or fake competitor coordinates exist in frontend components.
2. **Zero In-Browser Business Calculations:** 
   - No client-side BWM pairwise matrix math.
   - No client-side TOPSIS vector normalization.
   - No client-side C1/C2/C3/C6 calculation.
   - No client-side financial aggregation.
3. **Semantic Status Handling:**
   - `NO_DATA` is rendered as `"N/A"` / `"NO DATA"`, never collapsed to `0`.
   - `PROTECTED_ROLE` is rendered as `"Protected"`, never masked to `0` or `Rp0`.
   - Valid numeric zeros (`0`, `0.00%`, `Rp0`) are strictly preserved.

---

## 7. RBAC & Field-Level Masking Verification

- **Role Hierarchy Enforcement:** Backend Role Hierarchy Guard is strictly respected.
- **SuperAdmin:** Full unmasked visibility across sales, revenue, operational KPIs, and administrative settings.
- **Supervisor:** Operational KPIs and geofence telemetry are unmasked; financial revenue aggregates receive `PROTECTED_ROLE` masking from the backend.
- **Rider:** Scoped strictly to personal operational shift and telemetry registration.

---

## 8. Test Suite Verification Summary

| Test Suite File | Domain | Assertions | Status |
| :--- | :--- | :--- | :--- |
| `test-f06-contract-preflight.js` | Contract Verification | 26/26 | **PASS (100%)** |
| `test-f06-1-poi-intelligence.js` | F-06.1 POI Intelligence | 27/27 | **PASS (100%)** |
| `test-f06-2-product-catalog.js` | F-06.2 Product Catalog | 14/14 | **PASS (100%)** |
| `test-f06-3-user-directory.js` | F-06.3 User Directory & RBAC | 13/13 | **PASS (100%)** |
| `test-f06-4-competitor-intelligence.js` | F-06.4 Competitor Intelligence | 17/17 | **PASS (100%)** |
| `test-f07-reports.js` | F-07 Reports & Historical Analytics | 26/26 | **PASS (100%)** |
| `test-f01-frontend-analytics-integration.js` | F-01 Analytics Integration | 28/28 | **PASS (100%)** |
| `test-f02-superadmin-dashboard-integration.js` | F-02 Dashboard & UI Primitives | 19/19 | **PASS (100%)** |
| `test-f04-operational-pages-composition.js` | F-04 Operational Pages Composition | 23/23 | **PASS (100%)** |
| `test-f05-intelligence-workspace.js` | F-05 DSS Intelligence Workspace | 44/44 | **PASS (100%)** |
| `test-freeze-audit-b08-to-b11.js` | Backend Architecture & Contract Freeze | 18/18 | **PASS (100%)** |
| **Vite Frontend Build** | Production Bundling (`bun run build`) | 1815 modules | **PASS (Exit 0)** |

---

## 9. Final Convergence Sign-Off

- **Backend Modified:** **NO (0 lines changed)**
- **New Backend Endpoints Created:** **NO (0 created)**
- **Database Schema Modified:** **NO (0 schema migrations added)**
- **Swagger Modified:** **NO (0 edits)**
- **Frontend DSS Business Calculations:** **0**
- **Mock Production POI / Business Data:** **0**
- **Unverified Business Fields:** **0**
- **Build Status:** **PASS**
- **Convergence Result:** **LOCKED & PRODUCTION READY**
