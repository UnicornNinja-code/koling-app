# MOVA Multi-Tenant Component Audit
## Multi-Tenant Frontend Reverse Engineering & Component Parity with Single-Tenant Domain Adaptation

> **Document Type:** Architecture, Component Parity & Endpoint Mapping Audit (SSOT)  
> **Target Scope:** Single-Tenant MOVA Frontend (`apps/single-tenant/nodejs_react/frontend`)  
> **Reference System:** Multi-Tenant MOVA Frontend (`apps/multi-tenant/frontend`)  
> **Backend SSOT Authority:** Single-Tenant Backend Contracts B-08..B-12 (`apps/single-tenant/nodejs_react/backend`)  
> **Visual SSOT:** `MOVA_DESIGN_SYSTEM.md` v2.0 (Enterprise Fleet & Operations Control Room standard)

---

## 1. Repository Overview

### 1.1 Multi-Tenant Repository Structure
- **Root Path:** `f:/project_zero/apps/multi-tenant/frontend`
- **Framework & Tooling:** Svelte 5 / TypeScript / Vite / TailwindCSS
- **Component Count:** ~62 Svelte components in `src/components/` across 18 domains:
  - `analytics/` (11 components)
  - `auth/` (2 components)
  - `catalog/` (4 components)
  - `dashboard/` (10 components)
  - `distribution/` (3 components)
  - `dss/` (6 components)
  - `fleet/` (4 components)
  - `layout/` (2 components)
  - `map/` (6 components + 8 panel components)
  - `onboarding/` (1 component)
  - `presence/` (7 components + 2 drawer components)
  - `reporting/` (2 components)
  - `reports/` (5 components)
  - `rider/` (7 components)
  - `system/` (2 components)
  - `ui/` (14 primitive components + subdirectories)
  - `users/` (3 components)
  - `zones/` (2 components)
- **Pages:** 28 Svelte pages in `src/pages/` (`superadmin/`, `supervisor/`, `rider/`, `analytics/`, `presence/`, `setup/`, `auth/`, `error/`).
- **Services:** 22 API services in `src/services/`.

### 1.2 Single-Tenant Repository Structure
- **Root Path:** `f:/project_zero/apps/single-tenant/nodejs_react/frontend`
- **Framework & Tooling:** React 19 / JSX / Vite / TailwindCSS / TanStack React Query v5 / Axios
- **Component Count:** UI primitives (`Panel`, `Card`, `Button`, `Input`, `Select`, `Table`, `Tabs`, `Badge`, `StatusBadge`, `SemanticMetric`, `EmptyState`, `ErrorFallbackBanner`, `LoadingSkeleton`, `Alert`, `ErrorBoundary`), layout shells (`AppLayout`, `Sidebar`, `Topbar`), and feature modules (`dss/`, `dashboard/`, `common/`, `guards/`).
- **Pages:** 12 pages in `src/pages/` (`superadmin/`, `rider/`, `reports/`, `catalog/`, `distribution/`, `profile/`, `auth/`, `errors/`).
- **Services:** 20 centralized Axios services in `src/services/` (`analyticsService.js`, `dssService.js`, `zoneService.js`, `armadaService.js`, `riderService.js`, `lbsService.js`, `salesService.js`, etc.).
- **Backend API Contract:** Node.js Express + PostgreSQL + PostGIS (B-08..B-12 Frozen API endpoints + OpenAPI 3.0 Swagger SSOT).

---

## 2. Multi-Tenant Component Inventory

| Group | Component Name | Multi-Tenant Path | Primary Visual / Operational Role | Svelte State & Dependencies |
|---|---|---|---|---|
| **A. Shell** | `AppShell.svelte` | `src/components/layout/` | Root application layout wrapper with responsive sidebars & viewport | Tenant Context, Toast, Modals |
| **B. Navigation** | `AppSidebar.svelte` | `src/components/layout/` | Vertical dark icon & label navigation bar | Active route, Tenant branding, RBAC |
| **C. Header** | `RiderTopBar.svelte` | `src/components/rider/` | Mobile/Rider operational topbar with duty state & quick actions | Rider duty state, GPS sync status |
| **D. Dashboard** | `StatCard.svelte` | `src/components/dashboard/` | KPI block with title, value, delta, sparkline/trend | Metric props, semantic colors |
| **D. Dashboard** | `SalesChart.svelte` | `src/components/dashboard/` | Revenue & transactions area/bar chart with time filter | Recharts/Chart.js, dashboardService |
| **D. Dashboard** | `TopSellingProductsCard.svelte` | `src/components/dashboard/` | Top SKUs rank list with revenue & unit breakdown | Catalog/Sales data |
| **D. Dashboard** | `DssStatusCard.svelte` | `src/components/dashboard/` | Active BWM consistency & TOPSIS execution badge | dssService.getActiveDssConfig |
| **D. Dashboard** | `HubAtmosphericRadarCard.svelte` | `src/components/dashboard/` | Hub weather conditions & atmospheric telemetry | weatherService, OpenWeather |
| **D. Dashboard** | `ActivityFeed.svelte` | `src/components/dashboard/` | Real-time operational event stream | Socket.io / Audit event stream |
| **D. Dashboard** | `DashboardMiniMap.svelte` | `src/components/dashboard/` | Embedded Leaflet overview of active rider positions | Leaflet, zone/rider coordinates |
| **E. Map** | `MonitoringMap.svelte` | `src/components/map/` | Comprehensive spatial control room map canvas | Leaflet, PostGIS GeoJSON, LBS Socket |
| **E. Map** | `MapFloatingToolbar.svelte` | `src/components/map/panels/` | Floating map controls (zoom, reset, layers, measure) | Map viewport controls |
| **E. Map** | `MapLayersPanel.svelte` | `src/components/map/panels/` | Multi-layer toggle (Zones, POIs, Riders, Weather, Heatmap) | Layer state store |
| **E. Map** | `MapLegendPanel.svelte` | `src/components/map/panels/` | Dynamic GIS legend for zones, clusters, and rider pins | GeoJSON styling specs |
| **E. Map** | `MapRidersPanel.svelte` | `src/components/map/panels/` | Compact rider duty list directly attached to map | riderService, LBS store |
| **E. Map** | `MapWeatherPanel.svelte` | `src/components/map/panels/` | Floating atmospheric radar & rain forecast overlay | weatherService |
| **E. Map** | `MapSearchPanel.svelte` | `src/components/map/panels/` | Spatial search & geocoding filter | Nominatim/Photon geocoding |
| **E. Map** | `MapTimeSlotBar.svelte` | `src/components/map/panels/` | Temporal crowd slider (Morning, Lunch, Afternoon, Evening) | C3 Time Slot store |
| **E. Map** | `RadiusPreviewMap.svelte` | `src/components/map/` | Dynamic geofence radius visualizer (100m, 250m, 500m) | Leaflet Circle overlay |
| **E. Map** | `MapPreferencePreview.svelte` | `src/components/map/` | TOPSIS relative preference score heatmap over zones | dssService ranking GeoJSON |
| **E. Map** | `HubLocationPicker.svelte` | `src/components/map/` | Interactive pin drag-and-drop for Hub base coordinate | Leaflet marker event |
| **F. Rider** | `RiderDutyModal.svelte` | `src/components/rider/` | Duty start/stop modal with operational validation | distributionService |
| **F. Rider** | `RiderArmadaClaimModal.svelte` | `src/components/rider/` | 5-minute armada vehicle hold & claim modal | armadaService |
| **F. Rider** | `RiderCheckInModal.svelte` | `src/components/rider/` | Zone spatial check-in via PostGIS ST_Covers | lbsService, Geolocation |
| **F. Rider** | `RiderCheckoutModal.svelte` | `src/components/rider/` | Daily operational checkout & shift summary | lbsService.checkout |
| **F. Rider** | `RiderPosModal.svelte` | `src/components/rider/` | Mobile Point-of-Sale transaction entry for field riders | salesService, productService |
| **F. Rider** | `RiderQuickActionModal.svelte` | `src/components/rider/` | Emergency alert, out-of-stock, and help trigger | Socket notification |
| **G. Fleet** | `FleetInventoryGrid.svelte` | `src/components/fleet/` | Grid of mobile coffee carts with battery & status badge | armadaService.getArmadas |
| **G. Fleet** | `FleetIssuesTable.svelte` | `src/components/fleet/` | Maintenance log & damaged equipment issue tracker | armadaService |
| **G. Fleet** | `ArmadaFormModal.svelte` | `src/components/fleet/` | Add/Edit armada modal (plate, capacity, status) | armadaService (POST/PUT) |
| **G. Fleet** | `ArmadaHistoryModal.svelte` | `src/components/fleet/` | Vehicle assignment & maintenance history log | armadaService history |
| **H. Zone** | `ZoneFormModal.svelte` | `src/components/zones/` | Polygon geofence editor modal with Leaflet Draw | zoneService, GeoJSON |
| **H. Zone** | `ZoneDetailDrawer.svelte` | `src/components/zones/` | Sliding drawer displaying zone specs, POIs & metrics | zoneService, poiService |
| **H. Zone** | `ZoneComplianceDrawer.svelte` | `src/components/presence/drawers/` | Zone real-time compliance rate & violation history | analyticsService, lbsService |
| **I. POI** | `C3TimeCrowdTab.svelte` | `src/components/dss/` | Master POI category crowd weight matrix (58 categories) | poiCategoryService |
| **J. Weather** | `SyncWeatherModal.svelte` | `src/components/dashboard/` | Manual BMKG/OpenWeather trigger modal | weatherService.sync |
| **K. DSS** | `BwmCalibrationTab.svelte` | `src/components/dss/` | Best-to-Others & Others-to-Worst pairwise comparison matrix | dssService BWM config |
| **K. DSS** | `BwmMathAuditDrawer.svelte` | `src/components/dss/` | Mathematical consistency ratio (CR) step-by-step audit | dssService BWM math proof |
| **K. DSS** | `C6CompetitorTab.svelte` | `src/components/dss/` | Competitor coffee stall pricing & radius weighting | competitorService |
| **K. DSS** | `TopsisSimulationTab.svelte` | `src/components/dss/` | TOPSIS positive/negative ideal solution & zone ranking table | dssService calculation |
| **K. DSS** | `DssExplainabilityModal.svelte` | `src/components/dss/` | Decomposition of zone ranking into C1–C6 raw values | dssService explainability |
| **K. DSS** | `RecalculateDssModal.svelte` | `src/components/dashboard/` | One-click manual DSS recommendation batch recalculation | dssService.recalculate |
| **L. Analytics** | `AnalyticsHeader.svelte` | `src/components/analytics/` | Period date picker (Today, 7D, 30D, Custom) & Export CTA | analyticsService |
| **L. Analytics** | `AnalyticsFilterBar.svelte` | `src/components/analytics/` | Filter by Zone, Rider, Compliance Level, Shift | Filter state store |
| **L. Analytics** | `HistoricalKpiStrip.svelte` | `src/components/analytics/` | 4-column KPI strip (Check-in %, Compliance %, Rev, Dur) | analyticsService.getOverview |
| **L. Analytics** | `PeriodComparisonMatrix.svelte`| `src/components/analytics/` | This Period vs Previous Period comparison table | analyticsService |
| **L. Analytics** | `ComplianceDistributionCard.svelte`| `src/components/analytics/` | Doughnut/Bar chart of compliant vs deviated sessions | analyticsService.getCompliance |
| **L. Analytics** | `PresenceTimelineCard.svelte`| `src/components/analytics/` | Gantt/Timeline view of rider operating hours | analyticsService.getOperational |
| **L. Analytics** | `DeviationEpisodesCard.svelte`| `src/components/analytics/` | Log of out-of-bounds geofence and prohibited road alerts | lbsService / analyticsService |
| **L. Analytics** | `RiderAnalyticsTable.svelte`| `src/components/analytics/` | Detailed per-rider performance & compliance table | analyticsService |
| **L. Analytics** | `ZoneAnalyticsTable.svelte` | `src/components/analytics/` | Detailed per-zone sales & recommendation efficacy table | analyticsService |
| **L. Analytics** | `AnalyticsStateAlerts.svelte` | `src/components/analytics/` | Quality (`DEGRADED`) and Freshness (`CACHED`) alerts | Analytics contract metadata |
| **M. Reports** | `AuditLogTab.svelte` | `src/components/reports/` | System audit trail table with actor, action, timestamp | auditService.getLogs |
| **M. Reports** | `SalesReportTab.svelte` | `src/components/reports/` | Financial ledger & product sales tabular report | salesService, analyticsService |
| **M. Reports** | `DssReportTab.svelte` | `src/components/reports/` | Historical DSS decision matrix & assignment plan report | dssService |
| **M. Reports** | `ExportReportModal.svelte` | `src/components/reporting/` | CSV/PDF export configuration modal | analyticsService.exportDailyReport |
| **N. Presence** | `OperationalMap.svelte` | `src/components/presence/` | Live supervisor map with real-time breadcrumbs & geofences| Leaflet, Socket.io |
| **N. Presence** | `TransitionFeed.svelte` | `src/components/presence/` | Live geofence enter/exit transition event ticker | LBS Socket events |
| **N. Presence** | `DeviationAlertPanel.svelte` | `src/components/presence/` | Supervisor high-priority alert panel for live violations | LBS Socket alerts |
| **O. Users** | `UserFormModal.svelte` | `src/components/users/` | Create/Edit user modal with RBAC role dropdown | userService |
| **O. Users** | `UserInvitationModal.svelte` | `src/components/users/` | User invite with activation link | userService.invite |
| **O. Users** | `UserResetPasswordModal.svelte`| `src/components/users/` | Admin force password reset modal | userService.resetPassword |
| **P. System** | `SystemSettingsModal.svelte`| `src/components/system/` | System operational rules & threshold tuning modal | systemSettingService |
| **P. System** | `SystemReadinessWidget.svelte`| `src/components/system/` | Health check widget (PostGIS, Redis, Socket, BullMQ) | systemReadinessService |

---

## 3. Multi-Tenant Endpoint Usage vs 4. Single-Tenant Endpoint Inventory

| Multi-Tenant Frontend Call | MT HTTP Method & Path | Single-Tenant Backend Equivalent | ST Method & Path | Architectural Decision |
|---|---|---|---|---|
| `authService.login` | `POST /api/auth/login` | `POST /api/auth/login` | `POST /api/auth/login` | **DIRECT REUSE** |
| `authService.logout` | `POST /api/auth/logout` | `POST /api/auth/logout` | `POST /api/auth/logout` | **DIRECT REUSE** |
| `authService.refreshToken` | `POST /api/auth/refresh` | `POST /api/auth/refresh-token` | `POST /api/auth/refresh-token` | **ADAPT** (URL mapping) |
| `authService.getProfile` | `GET /api/auth/me` | `GET /api/users/profile` | `GET /api/users/profile` | **ADAPT** (URL mapping) |
| `userService.getUsers` | `GET /api/users` | `GET /api/users` | `GET /api/users` | **DIRECT REUSE** |
| `userService.createUser` | `POST /api/users` | `POST /api/users` | `POST /api/users` | **DIRECT REUSE** |
| `userService.updateUser` | `PUT /api/users/:id` | `PUT /api/users/:id` | `PUT /api/users/:id` | **DIRECT REUSE** |
| `userService.deleteUser` | `DELETE /api/users/:id` | `DELETE /api/users/:id` | `DELETE /api/users/:id` | **DIRECT REUSE** |
| `armadaService.getArmadas` | `GET /api/armadas` | `GET /api/armadas` (alias `/api/fleets`) | `GET /api/armadas` | **DIRECT REUSE** |
| `armadaService.createArmada` | `POST /api/armadas` | `POST /api/armadas` | `POST /api/armadas` | **DIRECT REUSE** |
| `armadaService.updateArmada` | `PUT /api/armadas/:id` | `PUT /api/armadas/:id` | `PUT /api/armadas/:id` | **DIRECT REUSE** |
| `armadaService.claimArmada` | `POST /api/armadas/:id/claim` | `POST /api/armadas/:id/claim` | `POST /api/armadas/:id/claim` | **DIRECT REUSE** |
| `armadaService.releaseArmada` | `POST /api/armadas/:id/release` | `POST /api/armadas/:id/release` | `POST /api/armadas/:id/release` | **DIRECT REUSE** |
| `zoneService.getZones` | `GET /api/zones` | `GET /api/zones` | `GET /api/zones` | **DIRECT REUSE** |
| `zoneService.getZoneById` | `GET /api/zones/:id` | `GET /api/zones/:id` | `GET /api/zones/:id` | **DIRECT REUSE** |
| `zoneService.createZone` | `POST /api/zones` | `POST /api/zones` | `POST /api/zones` | **DIRECT REUSE** |
| `zoneService.updateZone` | `PUT /api/zones/:id` | `PUT /api/zones/:id` | `PUT /api/zones/:id` | **DIRECT REUSE** |
| `zoneService.deleteZone` | `DELETE /api/zones/:id` | `DELETE /api/zones/:id` | `DELETE /api/zones/:id` | **DIRECT REUSE** |
| `poiService.getPois` | `GET /api/pois` | `GET /api/pois` | `GET /api/pois` | **DIRECT REUSE** |
| `poiCategoryService.getCrowd` | `GET /api/poi-categories/crowd-scores` | `GET /api/poi-categories/crowd-scores` | `GET /api/poi-categories/crowd-scores` | **DIRECT REUSE** |
| `poiCategoryService.updateCrowd` | `PUT /api/poi-categories/crowd-scores` | `PUT /api/poi-categories/crowd-scores` | `PUT /api/poi-categories/crowd-scores` | **DIRECT REUSE** |
| `dssService.getActiveConfig` | `GET /api/dss/config/active` | `GET /api/dss/config/active` | `GET /api/dss/config/active` | **DIRECT REUSE** |
| `dssService.updateBwm` | `PUT /api/dss/config/bwm` | `PUT /api/dss/config/bwm` | `PUT /api/dss/config/bwm` | **DIRECT REUSE** |
| `dssService.calculateTopsis` | `POST /api/dss/calculate` | `POST /api/dss/calculate` | `POST /api/dss/calculate` | **DIRECT REUSE** |
| `dssService.getRecommendations` | `GET /api/dss/recommendation` | `GET /api/dss/recommendation` | `GET /api/dss/recommendation` | **DIRECT REUSE** (B-08 SSOT) |
| `distributionService.generate` | `POST /api/distribution/generate` | `POST /api/distribution/generate` | `POST /api/distribution/generate` | **DIRECT REUSE** (B-10 SSOT) |
| `distributionService.assign` | `POST /api/distribution/assign` | `POST /api/distribution/assign` | `POST /api/distribution/assign` | **DIRECT REUSE** |
| `riderService.getDutyStatus` | `GET /api/distribution/duty/status` | `GET /api/distribution/duty/status` | `GET /api/distribution/duty/status` | **DIRECT REUSE** |
| `lbsService.checkIn` | `POST /api/lbs/check-in` | `POST /api/lbs/check-in` | `POST /api/lbs/check-in` | **DIRECT REUSE** (B-11 SSOT) |
| `lbsService.checkout` | `POST /api/lbs/checkout` | `POST /api/lbs/checkout` | `POST /api/lbs/checkout` | **DIRECT REUSE** |
| `lbsService.sendTelemetry` | `POST /api/lbs/telemetry` | `POST /api/lbs/telemetry` | `POST /api/lbs/telemetry` | **DIRECT REUSE** |
| `lbsService.getLivePositions` | `GET /api/lbs/live-positions` | `GET /api/lbs/live-positions` | `GET /api/lbs/live-positions` | **DIRECT REUSE** |
| `salesService.recordSale` | `POST /api/sales` | `POST /api/sales` | `POST /api/sales` | **DIRECT REUSE** |
| `analyticsService.getOverview` | `GET /api/analytics/overview` | `GET /api/analytics/overview` | `GET /api/analytics/overview` | **DIRECT REUSE** (B-12 SSOT) |
| `analyticsService.getOperational` | `GET /api/analytics/operational` | `GET /api/analytics/operational/summary` | `GET /api/analytics/operational/summary` | **ADAPT** |
| `analyticsService.getCompliance` | `GET /api/analytics/compliance` | `GET /api/analytics/compliance/summary` | `GET /api/analytics/compliance/summary` | **ADAPT** |
| `analyticsService.getSales` | `GET /api/analytics/sales` | `GET /api/analytics/sales/performance` | `GET /api/analytics/sales/performance` | **ADAPT** |
| `analyticsService.getDssPerf` | `GET /api/analytics/dss` | `GET /api/analytics/dss/plan-vs-actual` | `GET /api/analytics/dss/plan-vs-actual` | **ADAPT** |
| `analyticsService.getDailyReport`| `GET /api/analytics/reports/daily` | `GET /api/analytics/reports/daily-summary`| `GET /api/analytics/reports/daily-summary`| **ADAPT** |
| `tenantService.*` | `/api/tenants/*` | **NONE** | **NONE** | **REMOVE** (Multi-Tenant Only) |
| `billingService.*` | `/api/billing/*` | **NONE** | **NONE** | **REMOVE** (Multi-Tenant Only) |
| `organizationService.*` | `/api/organizations/*` | **NONE** | **NONE** | **REMOVE** (Multi-Tenant Only) |

---

## 5. Multi-Tenant Specific Dependencies & Removal Plan

| Multi-Tenant Feature / Component | Tenant Dependency Code / Concept | Action in Single-Tenant Architecture |
|---|---|---|
| `TenantSwitcher` / `TenantSelector` | `X-Tenant-ID`, `tenant_id` query param, multi-organization context | **REMOVE**. Single-Tenant operates with one unified operational database. |
| `TenantBillingCard` / `SubscriptionBadge` | Stripe billing, tier limits, rider count quotas | **REMOVE**. No billing or tenant quota boundaries. |
| `TenantOnboardingWizard` / `FirstRunSetupModal` | Tenant domain creation, organization name setup | **REMOVE / REBUILD** into simple First-Time Admin Seed check if needed. |
| `X-Tenant-ID` Axios Interceptor | Header injection on every outbound HTTP request | **PURGED**. Replaced with purely JWT `Authorization: Bearer <token>` interceptor. |
| Multi-tenant CSS Brand Color Injections | Dynamic CSS variables for tenant brand colors | **REMOVED**. Strictly bound to `MOVA_DESIGN_SYSTEM.md` v2 Neutral + Primary Blue `#2563EB`. |

---

## 6. Reuse / Adapt / Rebuild / Remove Matrix

```text
┌───────────────────────────┬─────────────────────────────────────────────────────────────────────────────┐
│ Category                  │ Summary & Count                                                             │
├───────────────────────────┼─────────────────────────────────────────────────────────────────────────────┤
│ A. REUSABLE AS-IS (Logic) │ 24 Domain endpoints & services (Auth, Users, Zones, POIs, Armadas, DSS, LBS)│
│ B. ADAPT (Svelte → React) │ 32 UI/UX Feature Components (Map panels, Drawers, DSS tabs, Analytics cards) │
│ C. REBUILD                │ 4 Components (AppLayout, Sidebar dark rail, SuperAdminDashboard, Table)      │
│ D. REMOVE                 │ 8 Tenant/Billing components (TenantSwitcher, TenantSettings, QuotaWidget)   │
│ E. NEW                    │ 3 Single-Tenant features (C3 58-Category Matrix, Plan-vs-Actual B-12 Strip) │
└───────────────────────────┴─────────────────────────────────────────────────────────────────────────────┘
```

---

## 7. Single-Tenant Target Component Architecture

```text
src/
├── components/
│   ├── layout/
│   │   ├── AppLayout.jsx           # Full-viewport workspace shell (w-full h-full, 0px sidebar gap)
│   │   ├── Sidebar.jsx              # 60px enterprise dark rail (#171717, w-9 h-9 rounded-md items)
│   │   └── Topbar.jsx               # 56px compact header with context & search
│   ├── ui/
│   │   ├── Panel.jsx                # Rectangular 6px radius, border-first, zero shadow
│   │   ├── Card.jsx                 # Rectangular 6px radius, compact padding
│   │   ├── Button.jsx               # Rectangular 4px radius, 32-36px height
│   │   ├── Input.jsx                # Rectangular 4px radius, 34px height
│   │   ├── Select.jsx               # Rectangular 4px radius, 34px height
│   │   ├── Table.jsx                # Dense tabular component (36-44px rows)
│   │   ├── Tabs.jsx                 # Compact tab controls (rounded 4px)
│   │   ├── Badge.jsx / StatusBadge  # Pill 9999px status badges
│   │   ├── SemanticMetric.jsx       # Compact KPI display with NO_DATA & PROTECTED states
│   │   ├── EmptyState.jsx           # Clean neutral empty state
│   │   ├── ErrorFallbackBanner.jsx  # Informative error boundary fallback
│   │   └── LoadingSkeleton.jsx      # Compact pulse skeleton
│   ├── map/
│   │   ├── LeafletMapCanvas.jsx     # Base Leaflet map component with GeoJSON rendering
│   │   ├── MapLayersControl.jsx     # Floating layer toggle (Zones, POIs, Riders, Weather)
│   │   ├── MapLegend.jsx            # Compact GIS legend (rounded 6px)
│   │   └── RiderMarkerLayer.jsx     # Live rider GPS pins & direction indicators
│   ├── operational/
│   │   ├── FleetStatusPanel.jsx     # Mobile coffee cart fleet availability & battery
│   │   ├── RiderDutyPanel.jsx       # Active shift, assigned zone, and check-in status
│   │   ├── GeofenceViolationPanel.jsx# Live deviation & road restriction alert feed
│   │   └── DailyDispatchQueue.jsx   # Sequence of zone assignments & rider schedules
│   ├── dss/
│   │   ├── BwmWeightCard.jsx        # Pairwise comparison weights & consistency ratio (CR)
│   │   ├── C3CrowdMatrix.jsx        # 58 POI master category crowd weights
│   │   ├── TopsisRankingTable.jsx   # Relative preference scores & recommended zone order
│   │   └── DssExplainabilityModal.jsx# C1–C6 raw value breakdown per zone
│   └── analytics/
│       ├── AnalyticsKpiStrip.jsx    # Overview metrics (Check-in %, Compliance %, Revenue, Duration)
│       ├── ComplianceDoughnut.jsx   # Compliant vs Deviated spatial revenue share
│       └── PlanVsActualChart.jsx    # DSS Predicted Rank vs Actual Revenue realized
```

---

## 8. Page Composition Plan & Single-Tenant Scope

| Page | ST Status | MT Reference Page | Single-Tenant Components Used | Endpoints Bound |
|---|---|---|---|---|
| **Dashboard** | EXISTING (Reworked) | `SuperAdminDashboardPage` | Top Hero Showcase, Live Routes mini-map, BWM distribution bar & dual working time chart | `GET /api/analytics/overview`, `GET /api/dss/config/active` |
| **Map Ops** | REWORK | `SuperAdminMapPage` / `MonitoringMap` | `LeafletMapCanvas`, `MapLayersControl`, `MapLegend`, `RiderMarkerLayer`, `ZoneDetailDrawer` | `GET /api/zones`, `GET /api/pois`, `GET /api/lbs/live-positions`, `GET /api/dss/recommendation` |
| **Zone Management** | EXISTING | `SuperAdminZonesPage` | `Panel`, `Table`, `ZoneFormModal`, `ZoneDetailDrawer` | `GET /api/zones`, `POST /api/zones`, `PUT /api/zones/:id`, `DELETE /api/zones/:id` |
| **Rider Operations**| EXISTING | `RiderDashboardPage` / `RiderArmadaPage` | `RiderDutyPanel`, `RiderArmadaClaimModal`, `RiderCheckInModal`, `RiderPosModal` | `POST /api/lbs/check-in`, `POST /api/lbs/checkout`, `POST /api/sales`, `GET /api/distribution/duty/status` |
| **Fleet Management**| EXISTING | `SuperAdminFleetPage` | `FleetStatusPanel`, `ArmadaFormModal`, `Table` | `GET /api/armadas`, `POST /api/armadas`, `PUT /api/armadas/:id`, `POST /api/armadas/:id/claim` |
| **DSS Intelligence**| EXISTING | `SuperAdminDssPage` | `BwmWeightCard`, `C3CrowdMatrix`, `TopsisRankingTable`, `DssExplainabilityModal` | `GET /api/dss/config/active`, `PUT /api/dss/config/bwm`, `GET /api/dss/recommendation`, `GET /api/poi-categories/crowd-scores` |
| **Analytics & Reports**| EXISTING | `SuperAdminReportsPage` / `HistoricalAnalyticsPage` | `AnalyticsKpiStrip`, `ComplianceDoughnut`, `PlanVsActualChart`, `Table` | `GET /api/analytics/overview`, `GET /api/analytics/operational/summary`, `GET /api/analytics/compliance/summary`, `GET /api/analytics/sales/performance`, `GET /api/analytics/dss/plan-vs-actual`, `GET /api/analytics/reports/daily-summary` |
| **User Management** | EXISTING | `SuperAdminUsersPage` | `Panel`, `Table`, `UserFormModal` | `GET /api/users`, `POST /api/users`, `PUT /api/users/:id`, `DELETE /api/users/:id` |
| **Catalog** | EXISTING | `SuperAdminCatalogPage` | `Panel`, `ProductModal`, `Table` | `GET /api/products`, `POST /api/products`, `PUT /api/products/:id` |
| **Audit Log** | EXISTING | `SuperAdminAuditPage` | `Panel`, `Table`, `AuditLogDetailModal` | `GET /api/audit-logs` |

---

## 9. API Coverage Analysis

- **Single-Tenant Backend Endpoints Total:** 34
- **Used by Frontend:** 32
- **Unused Endpoints:** 2 (`GET /api/roads` raw query — road compliance computed server-side in LBS; `GET /api/sync/status` — background BullMQ worker)
- **Missing UI:** 0 (All key domains have active frontend views)
- **Dead Services:** 0 (All 20 services actively mapped to backend routes)
- **Orphan Components:** 0 (All primitives and feature components imported in application tree)

---

## 10. Risks & Architectural Decisions

### Decision 1: Absolute Elimination of Multi-Tenant Abstractions
- No `tenant_id`, `organization_id`, or `workspace_id` parameters are permitted anywhere in Single-Tenant frontend state or API payloads.
- The Axios instance strictly uses JWT tokens from `localStorage` / HTTP-Only cookies.

### Decision 2: Zero Frontend Recalculation (Server Authority)
- Mathematical operations for BWM pairwise consistency, TOPSIS Euclidean distance, C1–C6 normalization, and spatial ST_Covers geofencing remain 100% on the backend. The frontend is strictly a presentation and interaction consumer.

### Decision 3: Semantic Data Preservation
- Metadata contracts (`data_status: "NO_DATA"`, `"PROTECTED"`, `"DEGRADED"`, `"VALID"`) are preserved across all components. `NO_DATA` is rendered as `"N/A"`, never silently converted to `0` or `0.00%`.
