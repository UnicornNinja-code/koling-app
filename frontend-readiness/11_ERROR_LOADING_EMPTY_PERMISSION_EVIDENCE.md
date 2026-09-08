# F-11: Error, Loading, Empty & Permission States Audit Evidence Pack
**MOVA Platform — Release Candidate 1 (`v1.0.0-rc.1`)**  
**Audit Gate**: `F-11` — Error, Loading, Empty & Permission States Audit  
**Date**: 2026-09-08  
**Status**: **PASS / CLOSED (20/20 Criteria Verified)**  
**Target Surface**: Global App Shell, Router, HTTP Interceptors, and Domain Pages

---

## 1. Executive Summary

Gate **F-11** certifies that the MOVA frontend application delivers a resilient, defensive, and user-friendly experience across all lifecycle boundary states:
1. **HTTP Error Hierarchy**: Comprehensive dedicated pages for `404 Not Found` ([`NotFoundPage.svelte`](file:///d:/project_alpha/koling-app/bun_svelte/frontend/src/pages/error/NotFoundPage.svelte)), `403 Forbidden` ([`ForbiddenPage.svelte`](file:///d:/project_alpha/koling-app/bun_svelte/frontend/src/pages/error/ForbiddenPage.svelte)), and `500 Internal Server Error` ([`ServerErrorPage.svelte`](file:///d:/project_alpha/koling-app/bun_svelte/frontend/src/pages/error/ServerErrorPage.svelte)), complete with contextual recovery actions.
2. **Skeleton & Granular Loading Lifecycle**: Pages use pulse-animated CSS skeleton placeholders during initial loads (`isInitialLoading: true`), preventing layout shifts (CLS), and transition to non-destructive background spinners during periodic syncs (`isRefreshing: true`).
3. **Zero-Fake-Data Empty States**: Empty datasets display tailored empty state illustrations and guidance (e.g., advising date range expansion), strictly avoiding the synthesis of fake metrics or synthetic `0.0%` ratios.
4. **Role & Permission Guards (RBAC)**: Fine-grained role checks filter navigation items and block unauthorized direct route access, providing a clear comparison between the user's role and the required permissions.
5. **Global Toast & Form Feedback**: Synchronous form validations prevent invalid submissions, while asynchronous errors are broadcast through a non-intrusive reactive toast store ([`toast.svelte.ts`](file:///d:/project_alpha/koling-app/bun_svelte/frontend/src/lib/stores/toast.svelte.ts)).

---

## 2. Comprehensive 20-Criteria Verification Matrix

| ID | State Domain | Verification Method & Source Location | Result |
| :--- | :--- | :--- | :---: |
| **F11-T01** | 404 Unmatched Route Trap | [`App.svelte:213-217`](file:///d:/project_alpha/koling-app/bun_svelte/frontend/src/App.svelte#L213-L217) & [`NotFoundPage.svelte:1-86`](file:///d:/project_alpha/koling-app/bun_svelte/frontend/src/pages/error/NotFoundPage.svelte#L1-L86)<br>Unmatched routes render `NotFoundPage` with route path echo and recovery button. | **PASS** |
| **F11-T02** | 403 Forbidden RBAC Page | [`ForbiddenPage.svelte:48-63`](file:///d:/project_alpha/koling-app/bun_svelte/frontend/src/pages/error/ForbiddenPage.svelte#L48-L63)<br>Renders role mismatch comparison (Current Role vs Required Role) with navigation back. | **PASS** |
| **F11-T03** | 500 Server Error Recovery | [`ServerErrorPage.svelte:1-115`](file:///d:/project_alpha/koling-app/bun_svelte/frontend/src/pages/error/ServerErrorPage.svelte#L1-L115)<br>Displays error explanation, collapsible technical debug stack, and retry action. | **PASS** |
| **F11-T04** | 401 Session Eviction & Redirect | [`axios.ts:182-192`](file:///d:/project_alpha/koling-app/bun_svelte/frontend/src/lib/axios.ts#L182-L192)<br>Expired/revoked tokens clear storage and emit `auth:expired` redirecting to `/login`. | **PASS** |
| **F11-T05** | Initial Load Skeleton Shimmer | [`HistoricalAnalyticsPage.svelte:48-60`](file:///d:/project_alpha/koling-app/bun_svelte/frontend/src/pages/analytics/HistoricalAnalyticsPage.svelte#L48-L60)<br>Renders pulse-animated grid placeholders matching the exact card aspect ratios. | **PASS** |
| **F11-T06** | Non-Destructive Refresh State | [`historicalAnalyticsStore.svelte.ts:469-496`](file:///d:/project_alpha/koling-app/bun_svelte/frontend/src/lib/stores/historicalAnalyticsStore.svelte.ts#L469-L496)<br>`isRefreshing: true` animates header spinner without blanking active data. | **PASS** |
| **F11-T07** | Button Loading Spinners | [`ExportReportModal.svelte:340-347`](file:///d:/project_alpha/koling-app/bun_svelte/frontend/src/components/reporting/ExportReportModal.svelte#L340-L347)<br>Action buttons disable and display spinner during active async execution. | **PASS** |
| **F11-T08** | Analytics Empty State Card | [`AnalyticsStateAlerts.svelte:58-70`](file:///d:/project_alpha/koling-app/bun_svelte/frontend/src/components/analytics/AnalyticsStateAlerts.svelte#L58-L70)<br>Renders inbox icon and descriptive prompt to expand date range when `hasData === false`. | **PASS** |
| **F11-T09** | Zone Table Empty State | [`ZoneAnalyticsTable.svelte:53-58`](file:///d:/project_alpha/koling-app/bun_svelte/frontend/src/components/analytics/ZoneAnalyticsTable.svelte#L53-L58)<br>Displays clear message when no active zones or search results exist. | **PASS** |
| **F11-T10** | Rider Table Empty State | [`RiderAnalyticsTable.svelte:54-59`](file:///d:/project_alpha/koling-app/bun_svelte/frontend/src/components/analytics/RiderAnalyticsTable.svelte#L54-L59)<br>Displays clear message when no active riders or search results exist. | **PASS** |
| **F11-T11** | Episodes Empty State | [`DeviationEpisodesCard.svelte:80-86`](file:///d:/project_alpha/koling-app/bun_svelte/frontend/src/components/analytics/DeviationEpisodesCard.svelte#L80-L86)<br>Displays green checkmark icon when no deviation episodes were recorded. | **PASS** |
| **F11-T12** | Export History Empty State | [`ExportJobHistoryDrawer.svelte:108-127`](file:///d:/project_alpha/koling-app/bun_svelte/frontend/src/components/reporting/ExportJobHistoryDrawer.svelte#L108-L127)<br>Displays "Belum Ada Export Laporan" with direct call-to-action button. | **PASS** |
| **F11-T13** | Zero-Fake-Data Null Rendering | [`HistoricalKpiCard.svelte:31-38`](file:///d:/project_alpha/koling-app/bun_svelte/frontend/src/components/analytics/HistoricalKpiCard.svelte#L31-L38)<br>Formats `null` values as `"N/A"`, eliminating misleading `0.0%` synthetic calculations. | **PASS** |
| **F11-T14** | Partial API Failure Warning | [`AnalyticsStateAlerts.svelte:30-55`](file:///d:/project_alpha/koling-app/bun_svelte/frontend/src/components/analytics/AnalyticsStateAlerts.svelte#L30-L55)<br>Isolates failing endpoints and provides selective retry button. | **PASS** |
| **F11-T15** | Real-time Form Validation | [`ExportReportModal.svelte:66-76`](file:///d:/project_alpha/koling-app/bun_svelte/frontend/src/components/reporting/ExportReportModal.svelte#L66-L76)<br>Validates date range in real time and disables submit button if constraints fail. | **PASS** |
| **F11-T16** | Global Reactive Toast Store | [`toast.svelte.ts:1-55`](file:///d:/project_alpha/koling-app/bun_svelte/frontend/src/lib/stores/toast.svelte.ts#L1-L55)<br>Provides unified toast notifications (`info`, `success`, `error`, `warning`). | **PASS** |
| **F11-T17** | First-Login Password Guard | [`FirstLoginPage.svelte:1-120`](file:///d:/project_alpha/koling-app/bun_svelte/frontend/src/pages/auth/FirstLoginPage.svelte#L1-L120)<br>Forces mandatory password update for first-time login users. | **PASS** |
| **F11-T18** | Role-Based Navigation Filter | [`AppShell.svelte:72-105`](file:///d:/project_alpha/koling-app/bun_svelte/frontend/src/components/layout/AppShell.svelte#L72-L105)<br>Dynamically filters sidebar menus based on `authStore.user.role`. | **PASS** |
| **F11-T19** | Modal & Drawer Dismissal Safety | [`ExportReportModal.svelte:120-125`](file:///d:/project_alpha/koling-app/bun_svelte/frontend/src/components/reporting/ExportReportModal.svelte#L120-L125) & [`ExportJobHistoryDrawer.svelte:59-65`](file:///d:/project_alpha/koling-app/bun_svelte/frontend/src/components/reporting/ExportJobHistoryDrawer.svelte#L59-L65)<br>Backdrop and escape dismissals cleanly reset local form states. | **PASS** |
| **F11-T20** | Static Type Check Integrity | `svelte-check --tsconfig ./tsconfig.json`<br>0 errors and 0 warnings across all error/loading/empty components. | **PASS** |

---

## 3. Audit Verdict & Conclusion

Gate **F-11: Error, Loading, Empty & Permission States Audit** is formally certified as **`PASS / CLOSED`**.

- **Total Criteria**: 20
- **Passed**: 20
- **Failed**: 0
- **Status**: **100% Qualified**
- **Next Audit Gate**: **`F-12` — Responsive & Accessibility (A11y) Audit**
