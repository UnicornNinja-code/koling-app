# MOVA — Release Notes (Version: RC-1)

```text
================================================================================
                                   MOVA RC-1
                    MANTAKOPI OPERATIONAL VEHICLE ANALYTICS
                                RELEASE NOTES
================================================================================
```

## 1. Release Status & Overview

* **Version**: `Release Candidate 1 (RC-1)`
* **Status**: **`QUALIFIED WITHIN AUDITED SCOPE`**
* **Scope**: **`FROZEN`** (Feature additions locked; preparation for deployment and thesis defense)
* **Date**: September 2026

MOVA is an enterprise-grade Decision Support System (DSS) and operational analytics platform designed for mobile beverage fleet management (Koling / MantaKopi). RC-1 marks the complete stabilization of core multi-tenant security, spatial routing algorithms, LBS geofencing, historical analytics, and asynchronous reporting pipelines.

---

## 2. Major Capabilities Included in RC-1

### 🏢 Multi-Tenant Security & Tenant Isolation
* **PostgreSQL Row-Level Security (RLS)**: Enforced via `ENABLE ROW LEVEL SECURITY` and `FORCE ROW LEVEL SECURITY`.
* **Safe Context Isolation**: Database connections run under `mova_app` with `NOBYPASSRLS`, bound to `app.current_tenant_id` per transaction.
* **IDOR / BOLA Immunity**: Cross-tenant requests return `404 Not Found` to eliminate resource existence leaking.

### 🧠 Intelligent Decision Support System (DSS)
* **Best-Worst Method (BWM)**: Multi-criteria weight determination with automated consistency ratio validation ($\xi^* \le 0.1$).
* **TOPSIS Ranking Engine**: Deterministic spatial zone recommendation evaluating foot traffic, road density, weather coefficients, and competitor proximity with strict zero-division protection.

### 📍 LBS & Fleet Execution Engine
* **Realtime Ingestion**: Monotonic timestamp ordering and high-speed anomaly filtering ($>120\text{ km/h}$ rejection).
* **Geofence State Tracking**: Deterministic transitions across `ENTER`, `DWELL`, and `EXIT` states with deviation episode tracking.
* **Spatial Road Snapping**: Automatic coordinate alignment to road networks within a 20-meter tolerance.

### 📊 Historical Analytics Engine (Milestone S7-03)
* **Standardized Temporal Presets**: `today`, `yesterday`, `last7days`, `last30days`, `thisMonth`, and symmetric custom date ranges using `[start, end)` intervals.
* **Period-over-Period Comparisons**: Automated calculation of percentage deltas, trends, and change directions.
* **Zero-Fake-Data Guarantee**: Authoritative null propagation when datasets are empty or denominators are zero.

### 📑 Operational Reporting & Document Generator (Milestone S7-05)
* **Multi-Format Streaming**: High-performance streaming generators for **CSV**, **Excel (XLSX)**, and **Executive PDF**.
* **Asynchronous Offloading**: BullMQ queue worker handles CPU/IO intensive generation in background threads with live progress polling.
* **Resource Governor**: Tenant-level concurrency limit (max 2 active jobs) and strict bounds (100,000 rows, 90-day time window).
* **Artifact Security**: Cryptographic filename hashing, directory traversal defense, and spreadsheet formula injection protection.

### 💻 Modern Frontend Experience
* **Svelte 5 Reactive Runes**: State management powered by `$state` and `$derived`.
* **Interactive Mapping**: Realtime fleet positions and geofence polygons with Leaflet.
* **Telemetry Diagnostics**: Non-blocking client telemetry store tracking socket health and API metrics.

---

## 3. Security Guarantees & Invariants

1. **Strict Tenant Boundary**: Zero cross-tenant data visibility at the database engine level.
2. **Zero Information Leak**: Cross-tenant probes are indistinguishable from nonexistent resources (`404`).
3. **Formula Injection Sanitization**: All CSV and Excel outputs escape active spreadsheet formulas (`=`, `+`, `-`, `@`).
4. **Credential Brute-Force Defense**: 2-dimensional Redis rate limiter throttling unauthorized login attempts.

---

## 4. Reporting Capability Matrix

| Report Type | Formats Supported | Concurrency & Limits | State |
| :--- | :--- | :--- | :--- |
| **`PRESENCE_REPORT`** | CSV, XLSX, PDF | Max 2 concurrent / tenant, 100k rows, 90 days | **READY** |
| **`ZONE_PERFORMANCE_REPORT`** | CSV, XLSX, PDF | Max 2 concurrent / tenant, 100k rows, 90 days | **READY** |
| **`RIDER_PERFORMANCE_REPORT`** | CSV, XLSX, PDF | Max 2 concurrent / tenant, 100k rows, 90 days | **READY** |
| **`SALES_SETTLEMENT_REPORT`** | None | Locked boundary | **DEFERRED** |

---

## 5. Known Limitations & Audit Findings

* **Backup / Disaster Recovery**: Database schema and automated seeding are complete; automated live snapshot restoration in staging is cataloged as `NOT VERIFIED`.
* **Socket.IO Fallback Rooms**: Legacy global broadcast rooms remain in code for backward compatibility alongside tenant-scoped rooms.
* **BullMQ Queue Management**: Retry backoff and database failure logging are active, but a dedicated Redis Dead Letter Queue (DLQ) stream is not configured.

---

## 6. Deferred Capability

* **`SALES_SETTLEMENT_REPORT`**: Explicitly deferred because the underlying database table `shift_settlements` currently lacks an explicit `tenant_id` column. Rather than compromising RLS boundaries, this capability is formally locked as `DEFERRED` across backend services, OpenAPI schemas, and frontend UI components.

---

## 7. Post-RC Backlog

The following operational tasks are scheduled for post-RC milestones:
1. Deprecate and remove legacy un-namespaced Socket.IO fallback rooms.
2. Implement a dedicated BullMQ Redis Dead Letter Queue (DLQ) monitor.
3. Establish automated physical database backup and recovery tests in CI/CD.
4. Align legacy Express 5 Request handler typing across older endpoints.

---

## 8. Verification & Test Summary

```text
======================================================================
TEST EXECUTION BASELINE (RC-1)
======================================================================
Backend Unit Tests     : 286 / 286 PASS (17 files, 765 assertions)
Frontend Unit Tests    :  26 /  26 PASS (2 files, 118 assertions)
Total Test Suite       : 312 / 312 PASS (19 files, 883 assertions)
Test Failures          : 0 (Zero)
Svelte Check           : 0 Errors / 0 Warnings
Frontend Client Build  : PASS (Vite v8.2.2 Production Bundle)
Audit Blocker Count    : 0 (Zero)
======================================================================
```
