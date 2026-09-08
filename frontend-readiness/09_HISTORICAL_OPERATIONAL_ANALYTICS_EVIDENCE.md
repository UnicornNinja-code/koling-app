# F-09: Historical Operational Analytics Audit Evidence Pack
**MOVA Platform — Release Candidate 1 (`v1.0.0-rc.1`)**  
**Audit Gate**: `F-09` — Historical Operational Analytics (S7-03 Master Integration)  
**Date**: 2026-09-08  
**Status**: **PASS / CLOSED (30/30 Criteria Verified)**  
**API Specification Baseline**: OpenAPI `v4.2.0` (`/api/analytics/historical/*`)

---

## 1. Executive Summary

Gate **F-09** validates the frontend implementation of the **Historical Operational Analytics** domain (S7-03). In accordance with the MOVA core architecture and scientific integrity invariants:
1. **Mathematical Authority**: The frontend functions strictly as an interactive presentation, filtration, and explainability layer. It **never reconstructs historical presence states or synthesizes metrics** from raw GPS telemetries. The backend service (`HistoricalPresenceAnalyticsService`, `HistoricalDeviationEpisodeService`, `HistoricalPeriodComparisonService`) remains the sole single source of truth.
2. **Zero-Fake-Data Integrity Guarantee**: When historical datasets contain zero eligible presence events or zero observed riders, compliance rates and ratio metrics return an explicit `null` (rendered in the UI as `N/A`), preventing misleading synthetic `0.0%` representations.
3. **Strict Temporal Boundaries**: Half-open intervals `[start, end)` are strictly preserved across standard presets (`today`, `yesterday`, `last7days`, `last30days`, `thisMonth`) and custom date ranges, with default IANA timezone `Asia/Jakarta` (WIB).
4. **Deterministic Deviation Episodes**: Reconstructed deviation episodes (`ep_{tenantId}_{riderId}_{startEventId}`) preserve open/closed state, duration calculation, and associated zone assignments.
5. **Period Comparison Resilience**: Symmetrical period-over-period comparisons handle zero denominators safely with authoritative direction indicators (`UP`, `DOWN`, `UP_FROM_ZERO`, `DOWN_TO_ZERO`, `UNCHANGED`, `UNAVAILABLE`), eliminating `NaN%` or `Infinity%`.

---

## 2. Architecture & Data Flow Verification

```text
PostgreSQL 16 (PostGIS)
  ├── rider_presence_events (Primary Authority)
  └── rider_positions (Secondary Traceability)
           │
           ▼
Backend S7-03 Historical Analytics Services
  ├── HistoricalPresenceAnalyticsService
  ├── HistoricalDeviationEpisodeService
  ├── HistoricalZoneAnalyticsService
  ├── HistoricalRiderAnalyticsService
  └── HistoricalPeriodComparisonService
           │
           ▼
Canonical REST API Endpoints (/api/analytics/historical/*)
  ├── GET /presence/summary
  ├── GET /presence/timeline
  ├── GET /deviations
  ├── GET /zones
  ├── GET /riders
  └── GET /comparison
           │
           ▼
Frontend historicalAnalyticsService.ts (axiosInstance + Bearer Auth)
           │
           ▼
historicalAnalyticsStore.svelte.ts (Svelte 5 Runes Reactive Store)
  ├── Granular Per-Resource Lifecycle (summary, timeline, deviations, zones, riders, comparison)
  ├── [start, end) Half-Open Boundary Calculation
  └── Zero-Fake-Data Null State Propagation
           │
           ▼
Interactive UI & Visualization Layer
  ├── AnalyticsHeader.svelte (Title, Tenant Role, Timezone, Sync Status, Async Export Action)
  ├── AnalyticsFilterBar.svelte (Presets, Grain, Timezone, Zone/Rider Filter, [start, end) Pill)
  ├── AnalyticsStateAlerts.svelte (Partial Error Warning, Zero Data Notice)
  ├── HistoricalKpiStrip.svelte (6 Authoritative Macro KPIs with Comparison Badges)
  ├── PresenceTimelineCard.svelte (Timeseries Stacked Bars with Hover Inspection)
  ├── ComplianceDistributionCard.svelte (Geofence Distribution & Physical Event Counters)
  ├── ZoneAnalyticsTable.svelte (Deterministic TotalEvents DESC Ranking)
  ├── RiderAnalyticsTable.svelte (Deterministic TotalEvents DESC Ranking)
  ├── DeviationEpisodesCard.svelte (Deterministic Episode List with Search)
  └── PeriodComparisonMatrix.svelte (10 Symmetrical Delta Comparisons)
```

---

## 3. Comprehensive 30-Criteria Verification Matrix

| ID | Criteria Description | Verification Method & Source Location | Result |
| :--- | :--- | :--- | :---: |
| **F09-T01** | Summary endpoint integrated | [`historicalAnalyticsService.ts:31-34`](file:///d:/project_alpha/koling-app/bun_svelte/frontend/src/services/historicalAnalyticsService.ts#L31-L34)<br>`GET /analytics/historical/presence/summary` consumes canonical backend endpoint. | **PASS** |
| **F09-T02** | Timeline endpoint integrated | [`historicalAnalyticsService.ts:40-43`](file:///d:/project_alpha/koling-app/bun_svelte/frontend/src/services/historicalAnalyticsService.ts#L40-L43)<br>`GET /analytics/historical/presence/timeline` for bucketed timeseries data. | **PASS** |
| **F09-T03** | Deviations endpoint integrated | [`historicalAnalyticsService.ts:49-52`](file:///d:/project_alpha/koling-app/bun_svelte/frontend/src/services/historicalAnalyticsService.ts#L49-L52)<br>`GET /analytics/historical/deviations` for deterministic episode reconstruction. | **PASS** |
| **F09-T04** | Zones endpoint integrated | [`historicalAnalyticsService.ts:58-61`](file:///d:/project_alpha/koling-app/bun_svelte/frontend/src/services/historicalAnalyticsService.ts#L58-L61)<br>`GET /analytics/historical/zones` for spatial zone operational rankings. | **PASS** |
| **F09-T05** | Riders endpoint integrated | [`historicalAnalyticsService.ts:67-70`](file:///d:/project_alpha/koling-app/bun_svelte/frontend/src/services/historicalAnalyticsService.ts#L67-L70)<br>`GET /analytics/historical/riders` for rider operational metrics. | **PASS** |
| **F09-T06** | Comparison endpoint integrated | [`historicalAnalyticsService.ts:76-79`](file:///d:/project_alpha/koling-app/bun_svelte/frontend/src/services/historicalAnalyticsService.ts#L76-L79)<br>`GET /analytics/historical/comparison` for period-over-period delta matrix. | **PASS** |
| **F09-T07** | Tenant derived from authenticated context | [`axios.ts:31-36`](file:///d:/project_alpha/koling-app/bun_svelte/frontend/src/lib/axios.ts#L31-L36)<br>JWT bearer token injected automatically; server-side PostgreSQL RLS enforces tenant isolation. | **PASS** |
| **F09-T08** | No `tenantId` override in query | [`analytics.types.ts:64-106`](file:///d:/project_alpha/koling-app/bun_svelte/frontend/src/lib/types/analytics.types.ts#L64-L106)<br>Query interfaces (`HistoricalPresenceQuery`, etc.) omit `tenantId` parameter completely. | **PASS** |
| **F09-T09** | `[start, end)` semantics preserved | [`historicalAnalyticsStore.svelte.ts:217-277`](file:///d:/project_alpha/koling-app/bun_svelte/frontend/src/lib/stores/historicalAnalyticsStore.svelte.ts#L217-L277)<br>Half-open temporal windows strictly enforced in presets and custom ranges. | **PASS** |
| **F09-T10** | IANA timezone preserved | [`historicalAnalyticsStore.svelte.ts:60`](file:///d:/project_alpha/koling-app/bun_svelte/frontend/src/lib/stores/historicalAnalyticsStore.svelte.ts#L60)<br>Timezone string passed cleanly to backend queries without client conversion distortion. | **PASS** |
| **F09-T11** | `Asia/Jakarta` default preserved | [`historicalAnalyticsStore.svelte.ts:60`](file:///d:/project_alpha/koling-app/bun_svelte/frontend/src/lib/stores/historicalAnalyticsStore.svelte.ts#L60)<br>Default initialized to `"Asia/Jakarta"`; options for WITA, WIT, and UTC supported. | **PASS** |
| **F09-T12** | Invalid date range handled | [`AnalyticsFilterBar.svelte:83-93`](file:///d:/project_alpha/koling-app/bun_svelte/frontend/src/components/analytics/AnalyticsFilterBar.svelte#L83-L93)<br>Guards against empty inputs and ensures `endPlusOne` strictly exceeds `start`. | **PASS** |
| **F09-T13** | Initial load state correct | [`HistoricalAnalyticsPage.svelte:48-60`](file:///d:/project_alpha/koling-app/bun_svelte/frontend/src/pages/analytics/HistoricalAnalyticsPage.svelte#L48-L60)<br>`isInitialLoading` renders animated skeleton placeholder grid without content flicker. | **PASS** |
| **F09-T14** | Refresh state preserves data | [`historicalAnalyticsStore.svelte.ts:469-496`](file:///d:/project_alpha/koling-app/bun_svelte/frontend/src/lib/stores/historicalAnalyticsStore.svelte.ts#L469-L496)<br>`isRefreshing` toggles spinner in header while active UI data remains stable. | **PASS** |
| **F09-T15** | Observed riders rendered correctly | [`HistoricalKpiStrip.svelte:36-44`](file:///d:/project_alpha/koling-app/bun_svelte/frontend/src/components/analytics/HistoricalKpiStrip.svelte#L36-L44)<br>Renders exact backend count of unique active riders with valid telemetry. | **PASS** |
| **F09-T16** | Presence breakdown rendered | [`ComplianceDistributionCard.svelte:110-131`](file:///d:/project_alpha/koling-app/bun_svelte/frontend/src/components/analytics/ComplianceDistributionCard.svelte#L110-L131)<br>Renders physical geofence transition events (`ENTER`, `EXIT`, `ON_SITE`, `OUTSIDE_ZONE`, `DEVIATED`). | **PASS** |
| **F09-T17** | Compliance distribution rendered | [`ComplianceDistributionCard.svelte:59-107`](file:///d:/project_alpha/koling-app/bun_svelte/frontend/src/components/analytics/ComplianceDistributionCard.svelte#L59-L107)<br>Presents Compliant, Deviated, Outside Zone, and Unassigned breakdowns with percentages. | **PASS** |
| **F09-T18** | Compliance rate rendered safely | [`HistoricalKpiCard.svelte:31-38`](file:///d:/project_alpha/koling-app/bun_svelte/frontend/src/components/analytics/HistoricalKpiCard.svelte#L31-L38)<br>Returns `"N/A"` if `complianceRate === null`; never renders synthetic `0.0%` on empty data. | **PASS** |
| **F09-T19** | Deviation events rendered | [`HistoricalKpiStrip.svelte:58-66`](file:///d:/project_alpha/koling-app/bun_svelte/frontend/src/components/analytics/HistoricalKpiStrip.svelte#L58-L66)<br>Displays total signals detected outside assigned operational zones. | **PASS** |
| **F09-T20** | Deviation riders rendered | [`DeviationEpisodesCard.svelte:63`](file:///d:/project_alpha/koling-app/bun_svelte/frontend/src/components/analytics/DeviationEpisodesCard.svelte#L63)<br>Displays authoritative count of affected unique riders (`affectedRidersCount`). | **PASS** |
| **F09-T21** | Deviation episodes rendered | [`DeviationEpisodesCard.svelte:81-152`](file:///d:/project_alpha/koling-app/bun_svelte/frontend/src/components/analytics/DeviationEpisodesCard.svelte#L81-L152)<br>Table lists reconstructed episodes with rider, assigned zone, detected zone, and start/end times. | **PASS** |
| **F09-T22** | Deviation duration rendered | [`DeviationEpisodesCard.svelte:27-33`](file:///d:/project_alpha/koling-app/bun_svelte/frontend/src/components/analytics/DeviationEpisodesCard.svelte#L27-L33)<br>Formatted as `Xm Ys`; open episodes correctly display `"N/A (Terbuka)"`. | **PASS** |
| **F09-T23** | Zone metrics rendered correctly | [`ZoneAnalyticsTable.svelte:73-126`](file:///d:/project_alpha/koling-app/bun_svelte/frontend/src/components/analytics/ZoneAnalyticsTable.svelte#L73-L126)<br>Deterministic sorting (`totalEvents DESC`, `zoneName ASC`), compliance rate, and open episode badges. | **PASS** |
| **F09-T24** | Rider metrics rendered correctly | [`RiderAnalyticsTable.svelte:76-136`](file:///d:/project_alpha/koling-app/bun_svelte/frontend/src/components/analytics/RiderAnalyticsTable.svelte#L76-L136)<br>Deterministic sorting (`totalEvents DESC`, `riderName ASC`), active days, affected zones, compliance. | **PASS** |
| **F09-T25** | Period comparison rendered | [`PeriodComparisonMatrix.svelte:143-182`](file:///d:/project_alpha/koling-app/bun_svelte/frontend/src/components/analytics/PeriodComparisonMatrix.svelte#L143-L182)<br>Presents 10 domain metrics with current, previous, absolute delta, and trend badges. | **PASS** |
| **F09-T26** | Zero-denominator comparison guarded | [`PeriodComparisonMatrix.svelte:23-74`](file:///d:/project_alpha/koling-app/bun_svelte/frontend/src/components/analytics/PeriodComparisonMatrix.svelte#L23-L74)<br>Direction mapping handles `UP_FROM_ZERO`, `DOWN_TO_ZERO`, `UNAVAILABLE` without division-by-zero. | **PASS** |
| **F09-T27** | Unsupported metrics remain N/A | [`analytics.types.ts:262-274`](file:///d:/project_alpha/koling-app/bun_svelte/frontend/src/lib/types/analytics.types.ts#L262-L274)<br>Explicit `AnalyticsCapabilities` notes unpersisted audit metrics; UI displays `N/A`, never fake 0. | **PASS** |
| **F09-T28** | No NaN/Infinity/false zeros | [`HistoricalKpiCard.svelte:34`](file:///d:/project_alpha/koling-app/bun_svelte/frontend/src/components/analytics/HistoricalKpiCard.svelte#L34)<br>`Number.isFinite(value)` checks prevent rendering `NaN` or `Infinity`. | **PASS** |
| **F09-T29** | Empty dataset handled safely | [`AnalyticsStateAlerts.svelte:58-70`](file:///d:/project_alpha/koling-app/bun_svelte/frontend/src/components/analytics/AnalyticsStateAlerts.svelte#L58-L70)<br>`hasData === false` triggers clean empty state notice with preset expansion tip. | **PASS** |
| **F09-T30** | API failure preserves safe UI | [`AnalyticsStateAlerts.svelte:31-55`](file:///d:/project_alpha/koling-app/bun_svelte/frontend/src/components/analytics/AnalyticsStateAlerts.svelte#L31-L55)<br>`hasPartialError` triggers warning banner with per-resource breakdown and retry action. | **PASS** |

---

## 4. Test Suite Execution & Diagnostics

### Automated Store & Integration Test Results
```text
bun test v1.4.0 (34cbb9a40)

tests\historicalAnalyticsStore.test.ts:
(pass) S7-03-10: Frontend Historical Analytics Store > 1. Temporal Presets & Boundary Invariants > should initialize with 'last7days', grain 'day', and default timezone 'Asia/Jakarta' [0.08ms]
(pass) S7-03-10: Frontend Historical Analytics Store > 1. Temporal Presets & Boundary Invariants > should preserve [start, end) half-open boundaries for 'today' preset [0.08ms]
(pass) S7-03-10: Frontend Historical Analytics Store > 1. Temporal Presets & Boundary Invariants > should preserve [start, end) boundaries for 'yesterday' preset [0.04ms]
(pass) S7-03-10: Frontend Historical Analytics Store > 1. Temporal Presets & Boundary Invariants > should preserve symmetric previous period for 'last7days' preset [0.05ms]
(pass) S7-03-10: Frontend Historical Analytics Store > 1. Temporal Presets & Boundary Invariants > should preserve symmetric previous period for 'last30days' preset [0.05ms]
(pass) S7-03-10: Frontend Historical Analytics Store > 1. Temporal Presets & Boundary Invariants > should preserve calendar-month boundaries for 'thisMonth' preset [0.10ms]
(pass) S7-03-10: Frontend Historical Analytics Store > 1. Temporal Presets & Boundary Invariants > should compute custom range and auto-generate previous period of identical length [0.09ms]
(pass) S7-03-10: Frontend Historical Analytics Store > 2. Zero-Fake-Data & Null Compliance Rate Guards > should return null complianceRate when dataset is empty or denominator is 0 [0.15ms]
(pass) S7-03-10: Frontend Historical Analytics Store > 2. Zero-Fake-Data & Null Compliance Rate Guards > should preserve authoritative null complianceRate from backend [0.07ms]
(pass) S7-03-10: Frontend Historical Analytics Store > 2. Zero-Fake-Data & Null Compliance Rate Guards > should correctly populate summaryMetrics when authoritative data is present [0.09ms]
(pass) S7-03-10: Frontend Historical Analytics Store > 3. Deterministic Rankings & Comparison Cards > should deterministically sort zones by totalEvents DESC then zoneName ASC [1.28ms]
(pass) S7-03-10: Frontend Historical Analytics Store > 3. Deterministic Rankings & Comparison Cards > should deterministically sort riders by totalEvents DESC then riderName ASC [0.23ms]
(pass) S7-03-10: Frontend Historical Analytics Store > 3. Deterministic Rankings & Comparison Cards > should map authoritative period comparison deltas and directions [0.12ms]
(pass) S7-03-10: Frontend Historical Analytics Store > 4. Granular Resource Lifecycle & Error Isolation > should handle partial failures in fetchAll without breaking other resources [1.39ms]
(pass) S7-03-10: Frontend Historical Analytics Store > 4. Granular Resource Lifecycle & Error Isolation > should distinguish initial loading from background refreshing [0.24ms]
(pass) S7-03-10: Frontend Historical Analytics Store > 4. Granular Resource Lifecycle & Error Isolation > should correctly update filter setters and resetFilters [0.15ms]

 16 pass / 0 fail / 83 assertions
Ran 16 tests across 1 file. [440.00ms]
```

### Static Type Check Diagnostics
```text
bun x svelte-check --tsconfig ./tsconfig.json
Loading svelte-check in workspace: d:\project_alpha\koling-app\bun_svelte\frontend
Getting Svelte diagnostics...

svelte-check found 0 errors and 0 warnings
```

---

## 5. Audit Verdict & Conclusion

Gate **F-09: Historical Operational Analytics Audit** is formally certified as **`PASS / CLOSED`**.

- **Total Criteria**: 30
- **Passed**: 30
- **Failed**: 0
- **Status**: **100% Qualified**
- **Next Audit Gate**: **`F-10` — Reporting & Asynchronous Export Audit (S7-05)**
