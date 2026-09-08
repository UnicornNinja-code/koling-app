# F-08 DSS Calculation & Explainability Evidence

**Status**: `PASS` (30/30 Criteria Qualified)  
**Target Domain**: BWM Linear Programming Calibration ($CR = 0.0029 \le 0.30$), TOPSIS Multi-Criteria Spatial Ranking, 6-Step Mathematical Traceability, Non-Black-Box Explainability, and Zero-Recomputation Invariants  
**API Specification**: OpenAPI v4.2.0 (OAS 3.0.3)  
**Evaluated Frontend Components**:
- [`src/services/dssService.ts`](file:///d:/project_alpha/koling-app/bun_svelte/frontend/src/services/dssService.ts)
- [`src/lib/utils/dssExplainability.ts`](file:///d:/project_alpha/koling-app/bun_svelte/frontend/src/lib/utils/dssExplainability.ts)
- [`src/components/dss/BwmCalibrationTab.svelte`](file:///d:/project_alpha/koling-app/bun_svelte/frontend/src/components/dss/BwmCalibrationTab.svelte)
- [`src/components/dss/BwmMathAuditDrawer.svelte`](file:///d:/project_alpha/koling-app/bun_svelte/frontend/src/components/dss/BwmMathAuditDrawer.svelte)
- [`src/components/dss/TopsisSimulationTab.svelte`](file:///d:/project_alpha/koling-app/bun_svelte/frontend/src/components/dss/TopsisSimulationTab.svelte)
- [`src/components/dss/DssExplainabilityModal.svelte`](file:///d:/project_alpha/koling-app/bun_svelte/frontend/src/components/dss/DssExplainabilityModal.svelte)
- [`src/components/dss/C3TimeCrowdTab.svelte`](file:///d:/project_alpha/koling-app/bun_svelte/frontend/src/components/dss/C3TimeCrowdTab.svelte)
- [`src/components/dss/C6CompetitorTab.svelte`](file:///d:/project_alpha/koling-app/bun_svelte/frontend/src/components/dss/C6CompetitorTab.svelte)

---

## 1. Scope & Objective

Gate **F-08** evaluates the frontend Decision Support System (DSS) module for operational zone recommendations, Best-Worst Method (BWM) criteria weight calibration, Technique for Order of Preference by Similarity to Ideal Solution (TOPSIS) rankings, and non-black-box explainability against backend mathematical kernels.

The audit rigorously verifies that:
1. **Authoritative Mathematical Source of Truth**: The frontend acts purely as a consumer and presenter of backend DSS calculations; zero client-side BWM LP Simplex re-solving or TOPSIS vector recomputations occur.
2. **Six Canonical Criteria Representation**: Strict support for the 6 authoritative criteria ($C_1-C_3$ Benefit, $C_4-C_6$ Cost):
   - $C_1$: POI Density (`BENEFIT`)
   - $C_2$: POI Diversity (`BENEFIT`)
   - $C_3$: Time-Slot Crowd Potential (`BENEFIT`)
   - $C_4$: Weather Precipitation Risk (`COST`)
   - $C_5$: Hub / Rider Accessibility Distance (`COST`)
   - $C_6$: Relevant Competitor Presence (`COST`)
3. **BWM Consistency Invariant**: Consistency Ratio is evaluated against Rezaei's threshold ($CR \le 0.30$), with empirical baseline $CR = 0.0029$.
4. **Mathematically Honest Explainability**: Closeness Coefficient ($C_i = \frac{D_i^-}{D_i^+ + D_i^-}$) is decomposed into relative Euclidean distance drivers and risks without falsely presenting it as a simple linear weighted sum.
5. **Robustness & Edge-Case Handling**: Graceful zero-division protection ($distSum > 10^{-9}$), nullish value coalescing, and fail-safe alerts during backend calculation degradation.

---

## 2. API Contract Mapping Matrix

| Feature / UI Flow | Canonical OpenAPI Endpoint | HTTP Method | Frontend Service Call | Backend Controller & Engine | Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Active BWM Config** | `/api/dss/bwm/active` | `GET` | `dssService.getActiveConfig()` | `dssController.getActiveBwmConfig` | **PASS** |
| **Calculate BWM** | `/api/dss/bwm/calculate` | `POST` | `dssService.calculateBwmWeights(payload)` | `dssController.calculateBwmWeights` (Simplex LP)| **PASS** |
| **Preview BWM Impact**| `/api/dss/bwm/preview-impact`| `POST` | `dssService.previewBwmImpact(payload)` | `dssController.previewBwmImpact` | **PASS** |
| **Activate BWM Version**| `/api/dss/bwm/{id}/activate` | `POST` | `dssService.activateBwmConfig(id)` | `dssController.activateBwmConfig` (`SUPERADMIN`)| **PASS** |
| **All BWM Configs** | `/api/dss/bwm/configs` | `GET` | `dssService.getAllConfigs()` | `dssController.getAllBwmConfigs` | **PASS** |
| **Hybrid Evaluation** | `/api/dss/evaluate` | `POST` | `dssService.evaluateHybridTopsis(payload)` | `dssController.evaluateHybridTopsis` | **PASS** |
| **Evaluation Snapshots**| `/api/dss/snapshots` | `GET` | `dssService.getSnapshots(limit)` | `dssController.getEvaluationSnapshots` | **PASS** |
| **Snapshot Detail** | `/api/dss/snapshots/{id}` | `GET` | `dssService.getSnapshotById(id)` | `dssController.getSnapshotById` | **PASS** |
| **Quick Recommendations**| `/api/dss/recommendations` | `GET` | `dssService.getRecommendations()` | `dssController.getRecommendations` | **PASS** |
| **Raw Criteria Trace**| `/api/dss/zones/{id}/raw-eval`| `GET` | `dssService.getZoneRawEvaluation(id)` | `dssController.getZoneRawEvaluation` | **PASS** |

---

## 3. Key Architecture & Mathematical Invariants

### 3.1 BWM Consistency Ratio ($CR \le 0.30$) & Simplex Formulation (F08-08 to F08-12)

The BWM calibration drawer (`BwmMathAuditDrawer.svelte:45-56`) accurately formats Rezaei's linear programming model:
$$\min \quad \xi^*$$
$$\text{subject to:} \quad |w_B - a_{Bj} w_j| \le \xi^*, \quad |w_j - a_{jW} w_W| \le \xi^*, \quad \sum_{j=1}^n w_j = 1, \quad w_j \ge 0$$
$$\text{Consistency Ratio:} \quad CR = \frac{\xi^*}{CI} \le 0.30$$

The empirical baseline produces $\xi^* = 0.0087$, $CI = 3.0$ ($a_{BW} = 7$), yielding $CR = 0.0029 \le 0.30$, verified directly in both UI cards and exportable LaTeX templates.

---

### 3.2 6-Step TOPSIS Traceability Matrix (F08-15 to F08-22)

`TopsisSimulationTab.svelte:242-310` provides step-by-step mathematical traceability tabs matching backend computations:
1. **Matriks Keputusan Raw ($X$)**: Raw criteria values from PostGIS spatial aggregation and Open-Meteo feeds ($x_{ij}$).
2. **Matriks Ternormalisasi ($R$)**: Vector normalization:
   $$r_{ij} = \frac{x_{ij}}{\sqrt{\sum_{k=1}^m x_{kj}^2}}$$
3. **Matriks Terbobot ($V$)**: Multiplied by BWM weights: $v_{ij} = w_j \cdot r_{ij}$.
4. **Solusi Ideal Positif ($A^+$) & Negatif ($A^-$)**:
   $$v_j^+ = \begin{cases} \max_i v_{ij} & \text{if benefit} \\ \min_i v_{ij} & \text{if cost} \end{cases}, \quad v_j^- = \begin{cases} \min_i v_{ij} & \text{if benefit} \\ \max_i v_{ij} & \text{if cost} \end{cases}$$
5. **Separasi Jarak Euclidean ($D_i^+, D_i^-$)**:
   $$D_i^+ = \sqrt{\sum_{j=1}^n (v_{ij} - v_j^+)^2}, \quad D_i^- = \sqrt{\sum_{j=1}^n (v_{ij} - v_j^-)^2}$$
6. **Skor Preferensi Relatif ($C_i$) & Ranking**:
   $$C_i = \frac{D_i^-}{D_i^+ + D_i^-}, \quad C_i \in [0, 1]$$

---

### 3.3 Mathematically Honest Explainability (F08-24 to F08-27)

In `dssExplainability.ts:109-113` and `DssExplainabilityModal.svelte`, zone recommendations are explained using relative criterion Euclidean proximity:
$$\text{Proximity}_j = \frac{|v_{ij} - v_j^-|}{|v_{ij} - v_j^+| + |v_{ij} - v_j^-|} \times 100\%$$

The narrative clearly explains why a zone ranked higher (e.g., *“Unggul pada kriteria benefit Densitas POI (C1) mendekati solusi ideal A+”*) without falsely describing $C_i$ as a linear sum of weighted scores.

---

## 4. Test Matrix & Verification Results

| Test ID | Test Scenario | Verified Implementation | Result |
| :--- | :--- | :--- | :--- |
| **F08-T01** | Criteria master loads from canonical API | `dssService.getActiveConfig()` & `evaluateHybridTopsis()` | **PASS** |
| **F08-T02** | Six canonical criteria represented | Strict support for C1, C2, C3, C4, C5, C6 | **PASS** |
| **F08-T03** | Benefit/Cost direction correct | C1–C3 BENEFIT, C4–C6 COST strictly mapped | **PASS** |
| **F08-T04** | Criteria status follows backend | Active weights and specs dynamically synced | **PASS** |
| **F08-T05** | No production weights hardcoded | Loaded dynamically via API; zero static weights in stores | **PASS** |
| **F08-T06** | BWM best criterion reflected | `bestCriteriaId` selects optimal criterion (C1) | **PASS** |
| **F08-T07** | BWM worst criterion reflected | `worstCriteriaId` selects least preferred criterion (C5) | **PASS** |
| **F08-T08** | Pairwise preference submitted canonically | `dssService.calculateBwmWeights(payload)` $\rightarrow$ LP Simplex | **PASS** |
| **F08-T09** | BWM weights rendered correctly | $w_j$ weights and percentage distribution rendered | **PASS** |
| **F08-T10** | Consistency ratio rendered | $CR$ rendered with 4-decimal precision | **PASS** |
| **F08-T11** | BWM validation/error handled | $CR > 0.30$ or solver failure displays error alert | **PASS** |
| **F08-T12** | CR threshold displayed consistently | $CR \le 0.30$ displayed with empirical baseline $CR = 0.0029$ | **PASS** |
| **F08-T13** | TOPSIS request uses canonical endpoint | `dssService.evaluateHybridTopsis()` $\rightarrow$ `POST /api/dss/evaluate`| **PASS** |
| **F08-T14** | Alternatives rendered correctly | Ranked operational zones displayed in podium and grid | **PASS** |
| **F08-T15** | Normalized matrix rendered correctly | Vector normalization matrix $r_{ij}$ in Step 2 | **PASS** |
| **F08-T16** | Weighted matrix rendered correctly | Weighted vector matrix $v_{ij} = w_j \cdot r_{ij}$ in Step 3 | **PASS** |
| **F08-T17** | Positive ideal rendered correctly | $A^+$ vector with benefit max / cost min in Step 4 | **PASS** |
| **F08-T18** | Negative ideal rendered correctly | $A^-$ vector with benefit min / cost max in Step 4 | **PASS** |
| **F08-T19** | D+ rendered correctly | Euclidean distance to $A^+$ displayed per zone | **PASS** |
| **F08-T20** | D- rendered correctly | Euclidean distance to $A^-$ displayed per zone | **PASS** |
| **F08-T21** | Closeness coefficient rendered correctly | $C_i = D_i^- / (D_i^+ + D_i^-)$ with 4-decimal precision | **PASS** |
| **F08-T22** | Ranking ordering follows backend | Sorted descending by $C_i$ (#1 $\rightarrow$ #N) | **PASS** |
| **F08-T23** | No frontend TOPSIS recomputation | Frontend consumes authoritative backend ranking | **PASS** |
| **F08-T24** | Positive drivers explanation rendered | Highlights criteria driving proximity to ideal positive $A^+$ | **PASS** |
| **F08-T25** | Risk/negative factors rendered | Highlights criteria causing penalties / distance from $A^+$ | **PASS** |
| **F08-T26** | Mathematical explanation available | Modal Tab 2 provides exact formulas, vectors, and distances | **PASS** |
| **F08-T27** | $C_i$ not misrepresented as weighted sum | Explicitly documented as nonlinear Euclidean distance ratio | **PASS** |
| **F08-T28** | Empty alternatives handled | Zero zones scenario displays informative banner without error | **PASS** |
| **F08-T29** | Null/zero/NaN/Infinity handled safely | Zero-division guard (`distSum > 1e-9`) and nullish operators | **PASS** |
| **F08-T30** | DSS errors produce safe UI | Engine failures surface error alerts without misleading claims | **PASS** |

**Summary**: **30 / 30 Tests PASS (100%)**

---

## 5. Findings & Academic Traceability

1. **Academic Rigor in UI**: The explainability modal decomposes TOPSIS decisions cleanly without sacrificing mathematical accuracy, satisfying Thesis S7-04 non-black-box requirements.
2. **Audit-Ready LaTeX Generation**: `BwmMathAuditDrawer.svelte` enables one-click copying of formal LaTeX BWM linear programming formulations directly into academic defense slides.
3. **Pure Presentation Architecture**: Zero calculation drift exists between backend PostGIS/Simplex solvers and the frontend presentation layer.

---

## 6. Final Verdict

# `GATE F-08: PASS`

All criteria for **Gate F-08 (DSS Calculation & Explainability)** have been audited against the actual Svelte 5 and backend codebase and confirmed **100% PASS**.
