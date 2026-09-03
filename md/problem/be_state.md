Nah, ini justru **sudah ketemu bukti root cause yang sangat kuat** dari source yang kamu kasih. Jadi bukan sekadar dugaan lagi.

Ada **dua fallback `Sidoarjo` yang eksplisit** di jalur POI.

### 1. Root cause pertama: `SpatialETLPipelineService`

Di `syncPoisPipeline()`:

```ts
hubCity: string = "Sidoarjo"
```

Artinya kalau caller tidak mengirim `hubCity`, pipeline otomatis berjalan dengan **Sidoarjo**. 

Dan pipeline kemudian benar-benar memakai `hubCity` itu untuk:

* resolve bounding box
* query Overpass
* metadata dataset

Jadi ini bukan dummy/default yang tidak terpakai.

---

### 2. Yang lebih fatal: `overpassWorker`

Worker melakukan:

```ts
job.data?.cityName || "Sidoarjo"
```

Kemudian nilai itu langsung dikirim ke:

```ts
syncPoisPipeline(...)
```



Jadi kalau job queue tidak membawa `cityName`, flow-nya secara deterministik menjadi:

```text
BullMQ Job
   ↓
job.data.cityName
   ↓
undefined / null
   ↓
"Sidoarjo"             ← FALLBACK
   ↓
syncPoisPipeline()
   ↓
resolveBoundingBox("Sidoarjo")
   ↓
Overpass
   ↓
POI Sidoarjo
```

**Ini sangat mungkin persis menjelaskan bug yang kamu lihat.**

---

### 3. Tapi ada hal yang lebih menarik

Queue sebenarnya **memang punya `cityName`**.

Dari hasil search:

```ts
const job = await overpassSyncQueue.add(JOB_TYPE_SYNC_POI, {
    ...
    cityName,
    userId,
    bbox,
    ...
});
```



Jadi sekarang pertanyaan pentingnya bukan lagi:

> "Kenapa Overpass mengambil Sidoarjo?"

Kita sudah tahu salah satu mekanismenya.

Pertanyaan berikutnya:

> **"Dari mana `cityName` saat enqueue job berasal, dan apakah nilai tersebut benar-benar berasal dari `HUB_CITY_NAME` onboarding?"**

Itu yang harus kita trace.

---

## Ada masalah arsitektur kedua

Sekarang pipeline menerima:

```ts
hubCity
customBbox
```

dan worker menerima:

```ts
job.data.cityName
job.data.bbox
```

Artinya ada **dua kemungkinan geographic source**:

```text
cityName
   +
bbox
```

Ini berpotensi dangerous.

Misalnya:

```text
cityName = Surabaya
bbox = Sidoarjo
```

Maka:

```text
Overpass → bbox Sidoarjo
Validation → bbox Sidoarjo
Manifest metadata → Surabaya
```

Dan database bisa terlihat seolah dataset Surabaya, padahal geometrinya Sidoarjo.

Itu **data integrity problem**, bukan cuma UI bug.

---

## Bahkan pipeline sekarang sebenarnya sudah cukup bagus

Aku tidak akan menyuruh agent membongkar seluruh pipeline.

Karena secara alur dia sudah melakukan:

```text
FETCH
 ↓
RAW SNAPSHOT
 ↓
NORMALIZE
 ↓
CLASSIFY
 ↓
DEDUPLICATE
 ↓
SPATIAL VALIDATION
 ↓
STAGING
 ↓
QUALITY GATE
 ↓
ATOMIC PROMOTION
 ↓
ACTIVE DATASET
```

Dan `activeBbox` juga dipakai untuk spatial validation. 

Jadi problem utamanya lebih ke **source of geographic configuration**, bukan algoritma ETL-nya.

---

# Jadi prompt untuk AI agent sekarang sebaiknya lebih spesifik

Jangan lagi pakai prompt audit yang panjang tadi. Setelah menemukan bukti ini, kasih agent **targeted remediation prompt**:

```text
CRITICAL FIX — ELIMINATE HARDCODED GEOGRAPHIC FALLBACK AND MAKE HUB_CITY_NAME THE AUTHORITATIVE OPERATIONAL SCOPE

We have confirmed a critical geographic scope bug in the POI synchronization pipeline.

CURRENT FINDINGS:

1. SpatialETLPipelineService.syncPoisPipeline() currently has:

hubCity: string = "Sidoarjo"

2. overpassWorker.ts currently passes:

job.data?.cityName || "Sidoarjo"

3. POI queue does contain cityName:

job.data.cityName

4. syncPoisPipeline() uses hubCity to resolve bounding box and construct the Overpass query.

Therefore, the current architecture can silently retrieve Sidoarjo data whenever cityName is missing.

This MUST be fixed.

==================================================
OBJECTIVE
==================================================

HUB_CITY_NAME configured during onboarding must become the authoritative operational geographic scope.

Example:

Onboarding:
HUB_CITY_NAME = "Surabaya"

Expected:

Surabaya
 ↓
Operational Configuration
 ↓
POI Sync Job
 ↓
Overpass Query
 ↓
Surabaya POIs
 ↓
Spatial Validation
 ↓
POI Dataset

NOT:

Surabaya
 ↓
undefined cityName
 ↓
"Sidoarjo" fallback
 ↓
Sidoarjo POIs

==================================================
STEP 1 — TRACE THE SOURCE
==================================================

Before modifying anything, trace:

HUB_CITY_NAME
 ↓
onboarding persistence
 ↓
configuration retrieval
 ↓
POI sync trigger
 ↓
enqueuePoiSyncJob()
 ↓
job.data.cityName
 ↓
overpassWorker
 ↓
syncPoisPipeline()

Find exactly where cityName is generated.

Verify whether it actually comes from the persisted onboarding HUB_CITY_NAME.

DO NOT assume it does.

==================================================
STEP 2 — REMOVE SILENT SIDOARJO FALLBACK
==================================================

Remove all operational POI fallback behavior such as:

"Sidoarjo"

from:

- syncPoisPipeline()
- overpassWorker
- POI queue
- POI cron
- manual sync
- API controllers
- services
- scripts

IMPORTANT:

Do NOT replace:

"Sidoarjo"

with another hardcoded city.

Instead, if operational city is unavailable:

FAIL EXPLICITLY.

Example behavior:

Missing operational HUB_CITY_NAME

→ throw configuration error

→ do not enqueue POI sync

→ do not execute Overpass request

→ do not use old/default city

==================================================
STEP 3 — USE AUTHORITATIVE OPERATIONAL CONFIGURATION
==================================================

The POI sync trigger must obtain the current persisted operational configuration.

Conceptually:

const operationalContext =
    await operationalConfigurationService.getCurrent();

const cityName = operationalContext.hubCityName;

Then:

enqueuePoiSyncJob({
    cityName,
    ...
});

Do not obtain the city from:

- frontend localStorage
- frontend state
- arbitrary request body
- hardcoded value
- environment fallback

unless the existing architecture explicitly defines it as the authoritative configuration source.

==================================================
STEP 4 — WORKER MUST NOT INVENT OPERATIONAL SCOPE
==================================================

The worker should consume the geographic scope from the job payload.

However, it must NOT silently fallback:

job.data?.cityName || "Sidoarjo"

is NOT acceptable.

If cityName is missing:

throw explicit error:

POI_SYNC_MISSING_OPERATIONAL_SCOPE

The job must fail safely.

==================================================
STEP 5 — PIPELINE MUST NOT HAVE A CITY DEFAULT
==================================================

Change the pipeline contract so that operational city is required.

Do NOT use:

hubCity: string = "Sidoarjo"

Use a required value instead.

If the architecture supports a richer operational context, prefer:

OperationalContext

containing at minimum:

- hubCityName
- latitude
- longitude
- bbox / geographic scope if applicable

Do not create a new abstraction if an existing configuration service already provides the same information.

==================================================
STEP 6 — CITY AND BBOX CONSISTENCY
==================================================

Audit the current:

cityName
customBbox

relationship.

Current function accepts both:

hubCity
customBbox

Determine whether customBbox can represent a different city from hubCity.

Prevent inconsistent combinations.

Example INVALID:

hubCity = Surabaya
bbox = Sidoarjo

The system must either:

A. derive bbox from the authoritative operational scope

OR

B. explicitly validate that customBbox belongs to the configured operational scope.

Do NOT allow:

city metadata = Surabaya
geometry = Sidoarjo

==================================================
STEP 7 — DATASET METADATA
==================================================

The active POI dataset metadata currently records:

metadata: {
    city: hubCity
}

Ensure this metadata represents the SAME geographic scope actually queried.

Dataset metadata must never claim:

city = Surabaya

while actual fetched geometry belongs to Sidoarjo.

==================================================
STEP 8 — CACHE / QUEUE / CRON
==================================================

Audit all POI sync triggers:

- manual sync
- cron
- worker
- BullMQ
- retry
- startup sync
- scripts/sync-poi.ts

All must use the same operational scope.

No trigger may contain:

"Sidoarjo"

as an operational default.

==================================================
STEP 9 — MULTI-CITY SAFETY
==================================================

Do not assume MOVA will forever operate only in Sidoarjo.

The implementation should work for:

Surabaya
Sidoarjo
Malang
Bandung
Jakarta
etc.

The city is DATA, not CODE.

==================================================
STEP 10 — TESTS
==================================================

Add regression tests.

TEST 1:

HUB_CITY_NAME = Surabaya

Expected:
POI job cityName = Surabaya

Expected:
Overpass query targets Surabaya

Expected:
No Sidoarjo fallback

--------------------------------

TEST 2:

HUB_CITY_NAME = Sidoarjo

Expected:
POI query targets Sidoarjo

--------------------------------

TEST 3:

HUB_CITY_NAME = Surabaya
job.data.cityName = undefined

Expected:
JOB FAILS

Expected:
NO Sidoarjo fallback

Expected:
NO Overpass request

--------------------------------

TEST 4:

hubCity = Surabaya
customBbox = Sidoarjo bbox

Expected:
Reject inconsistent geographic scope.

--------------------------------

TEST 5:

Change operational configuration:

Sidoarjo → Surabaya

Expected next POI sync:
Surabaya

Expected:
No stale Sidoarjo scope.

==================================================
STEP 11 — DATABASE CONTAMINATION CHECK
==================================================

DO NOT delete anything automatically.

Audit current POI data and determine whether the active POI dataset contains geographic data inconsistent with the current HUB_CITY_NAME.

Example:

Current HUB_CITY_NAME:
Surabaya

Active POI dataset:
contains significant Sidoarjo geometry

If found, report:

- affected dataset version
- affected record count
- geographic extent
- suspected source
- cleanup recommendation

Do NOT perform destructive cleanup without explicit approval.

==================================================
STEP 12 — PRESERVE EXISTING ETL
==================================================

Do NOT rewrite:

- POI classification
- clustering
- deduplication
- spatial validation
- staging
- atomic promotion
- CAS
- distributed lock

unless required to fix geographic scope.

This task is primarily a geographic configuration / data integrity fix.

==================================================
STEP 13 — FINAL VERIFICATION
==================================================

After implementation, provide:

1. ROOT CAUSE
2. EXACT FILES CHANGED
3. OLD FLOW
4. NEW FLOW
5. ALL REMAINING HARDCODED GEOGRAPHIC VALUES
6. TEST RESULTS
7. DATA CONTAMINATION STATUS
8. REGRESSION STATUS

Final flow must be:

ONBOARDING
 ↓
Persisted HUB_CITY_NAME
 ↓
Authoritative Operational Configuration
 ↓
POI Sync Trigger
 ↓
BullMQ Job
 ↓
POI Worker
 ↓
SpatialETLPipelineService
 ↓
Geographic Scope
 ↓
Overpass
 ↓
Spatial Validation
 ↓
POI Dataset

There must be NO silent:

"Sidoarjo"

fallback anywhere in the operational POI pipeline.

==================================================
STOP CONDITION
==================================================

If the authoritative HUB_CITY_NAME cannot currently be retrieved from the backend persistence layer:

DO NOT invent a new configuration system.

STOP and report:

- where HUB_CITY_NAME is currently stored
- why it cannot be accessed
- which service/controller needs to expose it
- proposed minimal architecture change

Then wait for further instruction.
```

Dan menurutku **jangan dulu suruh agent memperbaiki clustering kategori POI**.

Kita sekarang punya urutan yang jauh lebih aman:

**1. Geographic scope → 2. POI retrieval → 3. Data contamination → 4. POI classification → 5. clustering → 6. DSS.**

Karena kalau scope-nya masih salah, seberapa bagus pun regex dan clustering kita, hasil akhirnya tetap **salah secara spasial**. Bahkan C1 Density, C2 Diversity, C3 Crowd Score, dan akhirnya TOPSIS bisa ikut terkontaminasi.
