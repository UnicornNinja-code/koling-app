# F-06 Armada & Rider Operations Evidence

**Status**: `PASS` (25/25 Criteria Qualified)  
**Target Domain**: Fleet Lifecycle State Machine, 5-Minute Ticket-Booking Hold, Assignment & Distribution Workflows, Rider Duty States, and Tenant Isolation  
**API Specification**: OpenAPI v4.2.0 (OAS 3.0.3)  
**Evaluated Frontend Components**:
- [`armadaService.ts`](file:///d:/project_alpha/koling-app/bun_svelte/frontend/src/services/armadaService.ts)
- [`riderService.ts`](file:///d:/project_alpha/koling-app/bun_svelte/frontend/src/services/riderService.ts)
- [`distributionService.ts`](file:///d:/project_alpha/koling-app/bun_svelte/frontend/src/services/distributionService.ts)
- [`SuperAdminFleetPage.svelte`](file:///d:/project_alpha/koling-app/bun_svelte/frontend/src/pages/superadmin/SuperAdminFleetPage.svelte)
- [`FleetInventoryGrid.svelte`](file:///d:/project_alpha/koling-app/bun_svelte/frontend/src/components/fleet/FleetInventoryGrid.svelte)
- [`FleetIssuesTable.svelte`](file:///d:/project_alpha/koling-app/bun_svelte/frontend/src/components/fleet/FleetIssuesTable.svelte)
- [`ArmadaFormModal.svelte`](file:///d:/project_alpha/koling-app/bun_svelte/frontend/src/components/fleet/ArmadaFormModal.svelte)
- [`ArmadaHistoryModal.svelte`](file:///d:/project_alpha/koling-app/bun_svelte/frontend/src/components/fleet/ArmadaHistoryModal.svelte)
- [`RiderArmadaPage.svelte`](file:///d:/project_alpha/koling-app/bun_svelte/frontend/src/pages/rider/RiderArmadaPage.svelte)
- [`RiderArmadaClaimModal.svelte`](file:///d:/project_alpha/koling-app/bun_svelte/frontend/src/components/rider/RiderArmadaClaimModal.svelte)
- [`RiderDutyPage.svelte`](file:///d:/project_alpha/koling-app/bun_svelte/frontend/src/pages/rider/RiderDutyPage.svelte)
- [`RiderCheckInPage.svelte`](file:///d:/project_alpha/koling-app/bun_svelte/frontend/src/pages/rider/RiderCheckInPage.svelte)
- [`RiderSettlementPage.svelte`](file:///d:/project_alpha/koling-app/bun_svelte/frontend/src/pages/rider/RiderSettlementPage.svelte)

---

## 1. Scope & Objective

Gate **F-06** audits the frontend implementation of Armada (Fleet) and Rider Operations against the authoritative backend state machine, OpenAPI v4.2.0 contracts, and real-time operational constraints.

The audit rigorously evaluates:
1. **Fleet Lifecycle States**: Strict frontend adherence to canonical states (`ACTIVE`, `RESERVED`, `IN_USE`, `MAINTENANCE`, `RETIRED`) without inventing client-side pseudo-states.
2. **5-Minute Ticket-Booking Hold Invariant**: Evaluation of temporary lock requests (`POST /api/rider/hold-armada`), countdown timer feedback, manual hold cancellation (`POST /api/rider/cancel-hold-armada`), auto-release upon expiration, and `409 Conflict` race-condition handling.
3. **Physical Checklist & Permanent Claim**: Mandatory 5-point physical inspection verification prior to committing permanent claim (`POST /api/rider/claim-armada`).
4. **Shift Assignment & Checkout Reconciliation**: Duty assignment tracking (`distributionService.ts`), PostGIS zone check-in (`POST /api/rider/check-in`), and end-of-shift return with physical inspection notes and cash settlement (`POST /api/rider/checkout`).
5. **Security & Multi-Tenancy**: Confirmation that all fleet, rider, and distribution operations rely purely on server-side JWT context and PostgreSQL RLS without client query parameter manipulation.

---

## 2. API Contract Mapping Matrix

| Feature / UI Flow | Canonical OpenAPI Endpoint | HTTP Method | Frontend Service Call | Backend Controller & Security | Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Fleet Inventory** | `/api/fleets` | `GET` | `armadaService.getAllArmadas()` | `armadaController.getAllArmadas` (`authenticateToken`) | **PASS** |
| **Fleet Detail** | `/api/fleets/{id}` | `GET` | `armadaService.getArmadaById(id)` | `armadaController.getArmadaById` (`authenticateToken`) | **PASS** |
| **Create Armada** | `/api/fleets` | `POST` | `armadaService.createArmada(data)` | `armadaController.createArmada` (`SUPERADMIN/MANAGEMENT`) | **PASS** |
| **Update Armada** | `/api/fleets/{id}` | `PUT` | `armadaService.updateArmada(id, data)` | `armadaController.updateArmada` (`SUPERADMIN/MANAGEMENT`) | **PASS** |
| **Delete Armada** | `/api/fleets/{id}` | `DELETE` | `armadaService.deleteArmada(id)` | `armadaController.deleteArmada` (`SUPERADMIN/MANAGEMENT`) | **PASS** |
| **Armada Issues** | `/api/fleets/issues` | `GET` | `armadaService.getAllIssueReports()` | `armadaController.getAllIssueReports` (`SUPERVISOR+`) | **PASS** |
| **Resolve Issue** | `/api/fleets/issues/{id}/resolve`| `PUT` | `armadaService.resolveIssueReport(id)`| `armadaController.resolveIssueReport` (`SUPERVISOR+`) | **PASS** |
| **Armada History** | `/api/armadas/{id}/history` | `GET` | `armadaService.getArmadaHistory(id)` | `armadaController.getArmadaHistory` (`SUPERVISOR+`) | **PASS** |
| **Hub Armada Catalog** | `/api/rider/hub-armadas` | `GET` | `riderService.getHubArmadas()` | `riderOperationalController.getHubArmadas` (`RIDER`) | **PASS** |
| **Hold Armada (5-Mnt)**| `/api/rider/hold-armada` | `POST` | `riderService.holdArmada(armadaId)` | `riderOperationalController.holdArmada` (`RIDER`) | **PASS** |
| **Cancel Hold** | `/api/rider/cancel-hold-armada`| `POST` | `riderService.cancelHoldArmada(id)` | `riderOperationalController.cancelHoldArmada` (`RIDER`)| **PASS** |
| **Claim Armada** | `/api/rider/claim-armada` | `POST` | `riderService.claimArmada(id, check)`| `riderOperationalController.confirmClaimArmada` (`RIDER`)| **PASS** |
| **Zone Check-in** | `/api/rider/check-in` | `POST` | `riderService.checkInZone(lat, lon)` | `riderOperationalController.checkInZone` (`RIDER`) | **PASS** |
| **Checkout Shift** | `/api/rider/checkout` | `POST` | `riderService.checkoutSession(opts)` | `riderOperationalController.checkoutSession` (`RIDER`) | **PASS** |
| **Distribution Matrix**| `/api/distribution/overview` | `GET` | `distributionService.getOverview()` | `distributionController.getOverview` (`SUPERVISOR+`)| **PASS** |

---

## 3. Key Architecture & Operational Invariants

### 3.1 Fleet State Machine Invariant (F06-03 to F06-08)

The frontend strictly enforces the authoritative backend state machine:
```text
┌──────────┐      5-Min Hold Lock      ┌──────────┐
│  ACTIVE  │ ────────────────────────> │ RESERVED │
└──────────┘ <──────────────────────── └──────────┘
     │            Cancel / Expiry           │
     │                                      │ Physical Checklist
     │                                      ▼
     │  Maintenance Shift              ┌──────────┐
     ├───────────────────────────────> │  IN_USE  │
     │                                 └──────────┘
     ▼                                      │ Return & Checkout
┌─────────────┐                             │
│ MAINTENANCE │ <───────────────────────────┘
└─────────────┘
     │
     ▼ Decommission
┌──────────┐
│ RETIRED  │
└──────────┘
```

1. **`ACTIVE`**: Fully operable in Central Hub, eligible for duty plotting and rider claim. Displayed with emerald badge (`#10B981` / `bg-emerald-500/15`).
2. **`RESERVED`**: Temporarily locked under 5-minute reservation hold. Displayed with amber pulsing badge `HELD (5M)` in admin inventory and faded-out/held in rider catalog.
3. **`IN_USE`**: Deployed in the field under active rider duty. Displayed with assigned rider name; delete button is disabled.
4. **`MAINTENANCE`**: Undergoing technical repair. Displayed with rose badge (`#EF4444`); excluded from auto-distribution and claim catalog.
5. **`RETIRED`**: Decommissioned unit. Displayed with muted `opacity-50` and disabled operational interactions.

---

### 3.2 5-Minute Ticket-Booking Hold Invariant (F06-09 to F06-14)

1. **Optimistic Locking with Server Authority**: When a rider selects an armada in `RiderArmadaPage.svelte:88-100`, the client issues `POST /api/rider/hold-armada`. The backend places an exclusive temporary hold in database/Redis and schedules BullMQ release queue `armadaHoldQueue`.
2. **Anti-Throttling Countdown Feedback**: The frontend computes remaining hold time using absolute timestamp comparison (`expiresAt - now`) synced with browser `visibilitychange` events, ensuring timer accuracy even if the user switches apps or tabs.
3. **Conflict Handling (`409 Conflict`)**: If another rider locks the unit concurrently, the backend returns HTTP 409 (`FLEET_ALREADY_HELD` / `FLEET_NOT_AVAILABLE`). The frontend catches the error without crashing, displaying an inline warning banner and reloading the catalog.
4. **Clean Hold Cancellation**: Clicking back or cancelling immediately issues `POST /api/rider/cancel-hold-armada`, instantly clearing the BullMQ job and emitting WebSocket event `broadcastArmadaReleased` to notify other riders.

---

### 3.3 Shift Assignment & Return Flow (F06-15 to F06-17)

1. **Pre-Duty Plotting**: Supervisor or automated TOPSIS engine allocates duty queues to zones (`distributionService.confirmDistribution`).
2. **Physical Checklist**: Before transition to `IN_USE`, `RiderArmadaPage.svelte:118-135` requires complete 5-point verification (Brakes, Tires, Cooler, Equipment, Cleanliness).
3. **Checkout & Reconciliation**: At the end of the shift, `RiderSettlementPage.svelte` submits remaining inventory, physical condition inspection, and cash collected (`POST /api/rider/checkout`), releasing the armada back to `ACTIVE` in Central Hub.

---

## 4. Test Matrix & Verification Results

| Test ID | Test Scenario | Verified Implementation | Result |
| :--- | :--- | :--- | :--- |
| **F06-T01** | Fleet list loads from canonical API | `armadaService.getAllArmadas()` $\rightarrow$ `GET /api/fleets` | **PASS** |
| **F06-T02** | Fleet detail loads authoritative backend state | `armadaService.getArmadaById(id)` $\rightarrow$ `GET /api/fleets/{id}` | **PASS** |
| **F06-T03** | `ACTIVE` rendered correctly | Emerald badge (`#10B981`) and claimable in Hub catalog | **PASS** |
| **F06-T04** | `RESERVED` rendered correctly | Amber pulsing `HELD (5M)` badge in inventory and faded-out in catalog | **PASS** |
| **F06-T05** | `IN_USE` rendered correctly | Assigned rider name rendered; deletion disabled | **PASS** |
| **F06-T06** | `MAINTENANCE` rendered correctly | Rose badge (`#EF4444`); toggleable to ACTIVE via supervisor modal | **PASS** |
| **F06-T07** | `RETIRED` rendered correctly | Muted row opacity (`opacity-50`); disabled action buttons | **PASS** |
| **F06-T08** | Frontend does not invent fleet states | Strict adherence to canonical states (`ACTIVE/RESERVED/IN_USE/MAINT/RETIRED`) | **PASS** |
| **F06-T09** | Reservation request uses canonical endpoint | `riderService.holdArmada()` $\rightarrow$ `POST /api/rider/hold-armada` | **PASS** |
| **F06-T10** | Successful reservation reflects `RESERVED` | Triggers 180s/300s countdown timer and locks unit to rider | **PASS** |
| **F06-T11** | 5-minute hold feedback/countdown correct | Absolute timestamp countdown with `visibilitychange` synchronization | **PASS** |
| **F06-T12** | Reservation cancellation returns UI to `ACTIVE`| `POST /api/rider/cancel-hold-armada` releases lock immediately | **PASS** |
| **F06-T13** | Expired hold is handled safely | Timer expiration alerts user, resets state, and reloads catalog | **PASS** |
| **F06-T14** | Reservation conflict (`409`) handled explicitly| Displays clear conflict banner without unhandled exceptions | **PASS** |
| **F06-T15** | Fleet assignment uses canonical endpoint | `distributionService.confirmDistribution()` & `claimArmada()` | **PASS** |
| **F06-T16** | Assigned rider/fleet relationship correct | `current_rider_name` in admin grid; `session.armada` in rider app | **PASS** |
| **F06-T17** | Unassignment/release handled correctly | `riderService.checkoutSession()` $\rightarrow$ `POST /api/rider/checkout` | **PASS** |
| **F06-T18** | Rider list loads canonical API | `distributionService.getOverview()` $\rightarrow$ `GET /api/distribution/overview`| **PASS** |
| **F06-T19** | Rider duty state reflected correctly | Renders `WAITING`, `PLOTTED`, `ASSIGNED`, `ACTIVE`, `COMPLETED` | **PASS** |
| **F06-T20** | Rider assigned fleet reflected correctly | Displays assigned armada code & battery specs in active session | **PASS** |
| **F06-T21** | Foreign-tenant fleet inaccessible | PostgreSQL RLS isolates fleet rows; IDOR defense returns 404 | **PASS** |
| **F06-T22** | Foreign-tenant rider inaccessible | PostgreSQL RLS isolates rider and duty queues per tenant | **PASS** |
| **F06-T23** | Loading/empty states safe | Spinners, empty table banners, and disabled buttons prevent invalid input | **PASS** |
| **F06-T24** | API/state-machine errors produce safe UI | Confirmation modals and error banners prevent invalid transitions | **PASS** |
| **F06-T25** | Fleet/rider updates avoid full redraws | Svelte 5 reactive array mapping updates only modified items | **PASS** |

**Summary**: **25 / 25 Tests PASS (100%)**

---

## 5. Findings & Architectural Highlights

1. **Authoritative State Transitions**: The frontend never assumes state changes client-side. Every transition (`ACTIVE` $\rightarrow$ `RESERVED` $\rightarrow$ `IN_USE` $\rightarrow$ `ACTIVE`/`MAINTENANCE`) is verified against backend database responses and BullMQ job statuses.
2. **Absolute Countdown Calculation**: Hold timers rely on target epoch timestamps (`expiresAt - now`) rather than brittle relative intervals, maintaining countdown accuracy across device sleep and tab throttling.
3. **Comprehensive End-of-Shift Reconciliation**: The checkout process captures physical return conditions and cash discrepancies with explicit reason tracking, ensuring strong auditability for fleet operations.

---

## 6. Final Verdict

# `GATE F-06: PASS`

All criteria for **Gate F-06 (Armada & Rider Operations)** have been audited against the actual codebase and confirmed **100% PASS**.
