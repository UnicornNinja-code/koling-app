# MantaKopi DSS - Project State

## 1. Project Overview

Project:
MantaKopi DSS

Purpose:
Sistem Pendukung Keputusan Penentuan Zona Operasional Penjualan Kopi Keliling.

Current Development Phase:
Production Ready & System Maintenance (Phase 8 Complete)

Development Order:

Auth
→ User/Profile
→ Zone
→ POI/Weather
→ DSS
→ Distribution
→ Armada/Rider
→ LBS/Socket.IO
→ Audit/Cron
→ Dashboard


## 2. Current Status

Overall Status:
Backend complete & running on Port 9000. Frontend complete & running on Vite. Full end-to-end integration for Auth, User/Profile, Zone Management, POI/Weather, DSS BWM/TOPSIS Engine (Phases 1-8), Fleet Management, Distribution, Rider Operational Workflow, LBS Socket.IO Real-time Tracking, Audit Log & Dynamic Cron Engine completed and verified PASS.

Current Phase:
Phase 8 — Final Audit & System Maintenance

Completed:
- Auth (Login, Register, Forgot Password, Reset Password, JWT Refresh Token, Route Guard, Role Guard)
- User Management (List, Detail, Create, Edit, Change Status, Delete)
- My Profile (Profile View, Edit Profile, Change Password with Zod Validation)
- Zone Management (Interactive Leaflet map, GeoJSON rendering, Drawing canvas, 409 PostGIS Overlap conflict handling, Edit Polygon, Status Update, Capacity Update, Delete Zone)
- Zone Spatial Map Optimization (100% backend configuration driven, Zero hardcoded production coordinates)
- POI / Weather Integration (Open-Meteo hub weather forecast, C4 Precipitation Probability primary metric, POI markers map layer on selected zone, C1/C2 metrics panel, Overpass POI approval workflow tab)
- Leaflet Spatial Layer Control & Map Visual Hierarchy (Custom Leaflet Panes z-index hierarchy, centralized mapLayers state, POI master default OFF, in-memory zero-API category sub-filters, compact popover layer control)
- Protected Road & Toll Road Prohibited Area Integration (`jalan_protokol.geojson` red dashed layer, OpenStreetMap Overpass `highway=motorway` / `highway=motorway_link` toll road layer with 692 segments in PostGIS, PostGIS `ST_Intersects` validation, HTTP 409 Conflict rejection for `ZONE_INTERSECTS_TOLL_ROAD` and `ZONE_INTERSECTS_RESTRICTED_AREA`)
- Centralized Operational Rule Configuration & Dynamic Spatial Enforcement (`system_settings` dynamic rules `OPERATIONAL_RULE_PROTOCOL_ROAD` and `OPERATIONAL_RULE_TOLL_ROAD`, BLOCKING vs ADVISORY-only enforcement, PostGIS-scalable zone re-evaluation, multi-reason invalidation safety, zero polygon geometry deletion, audit log integration `OPERATIONAL_RULE_CHANGED`, settings UI & confirmation modal)
- DSS Engine (Phases 1-8: Spatial deduplication, BWM criteria weighting, Candidate Selling Locations spatial grid scoring, TOPSIS ranking, Recommendation audit & historical cron logs)
- Distribution Management (Auto/Manual TOPSIS allocation, 5-minute hold queue via BullMQ)
- Fleet & Armada Management (Electric motor & cart fleet management, 5-min claim lock, Hold expiry queue)
- Rider Operational Workflow (Claim armada, spatial check-in polygon validation, sale entry recording, checkout)
- LBS & Real-time Tracking (Redis GEO spatial indexing, Socket.IO live position broadcast to SuperAdmin dashboard)
- Audit Logs & Dynamic Cron Engine (Centralized audit logging, Redlock Redis distributed lock, dynamic cron job management)
- Code Splitting & Lazy Loading (React Router v7 route-based lazy loading with Suspense for FCP performance optimization)

In Progress:
- Maintenance & System Optimization

Not Started:
- None



## 3. Architecture

### Frontend

Framework:
React 18 + Vite 6 + TailwindCSS + Lucide Icons + TanStack Query v5 + React Hook Form + Zod

Main structure:

frontend/
├── src/
│   ├── components/
│   │   ├── common/
│   │   ├── guards/
│   │   ├── layout/
│   │   └── ui/
│   ├── context/
│   │   └── AuthContext.jsx
│   ├── lib/
│   │   └── axios.js
│   ├── pages/
│   │   ├── auth/
│   │   ├── errors/
│   │   ├── profile/
│   │   ├── rider/
│   │   └── superadmin/
│   └── services/
│       ├── armadaService.js
│       ├── auditService.js
│       ├── authService.js
│       ├── cronService.js
│       ├── distributionService.js
│       ├── dssService.js
│       ├── fleetService.js
│       ├── lbsService.js
│       ├── poiService.js
│       ├── riderService.js
│       ├── userService.js
│       ├── weatherService.js
│       └── zoneService.js

State Management:
React Context (`AuthContext`), TanStack React Query v5 (`useQuery`, `useMutation`), React Component State

API Client:
src/lib/axios.js (Centralized Axios with `withCredentials: true`, JWT Request Interceptor, 401 Auto-Logout Response Interceptor)

Authentication:
AuthContext

Routing:
React Router v7 (`BrowserRouter`, `Routes`, `Route`, `Navigate`)


### Backend

Runtime:
Node.js (ESM)

Framework:
Express.js

Database:
PostgreSQL

Spatial Database:
PostGIS

Cache:
Redis

Queue:
BullMQ

Realtime:
Socket.IO

Scheduler:
Cron

API Base URL:
http://localhost:9000/api


## 4. Roles

Available roles:

SUPERADMIN
MANAGEMENT
SUPERVISOR
RIDER

Role responsibilities:

SUPERADMIN:
Kontrol penuh sistem, manajemen user (tambah, edit, ubah status, hapus), manajemen zona, evaluasi DSS, armada, audit log, cron management.

MANAGEMENT:
Pengawasan strategis, manajemen zona, evaluasi pembobotan DSS BWM/TOPSIS, manajemen armada, melihat daftar user.

SUPERVISOR:
Pengawasan operasional lapangan, alokasi zona rider, konfirmasi tugas rider.

RIDER:
Mitra jualan keliling, melihat peta jualan spasial, claim armada (hold 5 menit), check-in zona (spasial PostGIS), pencatatan transaksi penjualan, checkout sesi.


## 5. Authentication State

Implemented:

- Login
- Logout
- Refresh Token
- /auth/me
- Register
- Forgot Password
- Reset Password
- Change Password

Authentication storage:
`localStorage` untuk token JWT access & profil user, HTTP-Only Cookie untuk `refreshToken`

Token:
Dual-token architecture (JWT Access Token via HTTP Bearer Header + HTTP-Only Cookie via `refreshToken`)

Important:
Backend is the authentication authority.


## 6. Backend API Contract

### Auth

POST /api/auth/login
POST /api/auth/register
GET /api/auth/me
POST /api/auth/forgot-password
POST /api/auth/reset-password
GET /api/auth/verify-reset-token/:token
POST /api/auth/refresh-token
POST /api/auth/logout


### User

GET /api/users/profile
PUT /api/users/change-password
GET /api/users
POST /api/users
GET /api/users/:id
PUT /api/users/:id
PATCH /api/users/:id/status
DELETE /api/users/:id


### Zone

GET /api/zones
GET /api/zones/:id
POST /api/zones
PUT /api/zones/:id
PATCH /api/zones/:id/status
PATCH /api/zones/:id/capacity
DELETE /api/zones/:id


### POI

POST /api/pois/sync-city
GET /api/pois/pending
POST /api/pois/approve
GET /api/pois/approval-logs
GET /api/pois/zone/:zone_id
GET /api/pois/scores/c1-c2/:zone_id


### Weather

GET /api/weathers/zone/:zone_id
GET /api/weathers/hub/:city_name
POST /api/weathers/sync


### DSS

POST /api/dss/bwm/calculate
GET /api/dss/bwm/active
GET /api/dss/recommendations


### Distribution

POST /api/distribution/duty-confirm
GET /api/distribution/overview
POST /api/distribution/auto
POST /api/distribution/manual


### Armada

GET /api/armadas
GET /api/armadas/:id
POST /api/armadas
PUT /api/armadas/:id
DELETE /api/armadas/:id


### Rider Operational

GET /api/rider/active-session
GET /api/rider/hub-armadas
POST /api/rider/hold-armada
POST /api/rider/cancel-hold-armada
POST /api/rider/claim-armada
POST /api/rider/check-in
POST /api/rider/record-sale
POST /api/rider/checkout


### LBS

GET /api/lbs/nearby
GET /api/lbs/distance
GET /api/lbs/riders/:rider_id


### Audit Logs

GET /api/audit-logs


### Cron Management

GET /api/cron-management/configs
GET /api/cron-management/logs
PUT /api/cron-management/toggle/:cronKey
POST /api/cron-management/trigger/:cronKey


## 7. User/Profile Current State

### Completed

- User list
- User detail
- Create user
- Edit user
- Change user status
- Delete user
- My profile
- Edit profile
- Change password

### In Progress

None

### Not Implemented

None

### Known Issues

None


## 8. Zone Current State

Backend:
Complete (PostGIS ST_Contains, ST_Intersects, Polygon Overlap validation, Protocol Roads Restriction)

Frontend:
Complete (Interactive Leaflet canvas, GeoJSON rendering, polygon editing, 409 Conflict toast alert)

Polygon:
Interactive drawing with Leaflet Draw & GeoJSON formatting

Leaflet:
Library installed (`leaflet^1.9.4`)

GeoJSON:
API responses support PostGIS GeoJSON output format

Overlap validation:
Validated by backend PostGIS spatial query engine


## 9. POI / Overpass

Backend status:
Complete with BullMQ queue (`overpassWorker.js`) & OverpassApiClient

Frontend status:
Complete (`ZoneManagementPage.jsx` POI Tab & Overpass Approval Queue)

Overpass flow:
Request sync -> BullMQ job -> Overpass API fetch -> POI category matching -> Pending POI approval flow


## 10. Weather / Open-Meteo

Backend status:
Complete (`OpenMeteoApiClient.js`)

Frontend status:
Complete (`HubWeatherBanner.jsx` & C3/C4 Weather Score widget)

Weather flow:
Fetch hourly & daily Open-Meteo forecast -> C3 score computation -> Zone weather status update


## 11. DSS

BWM:
Best-Worst Method weight calculation service active (`dssBwmService.js`)

TOPSIS:
Technique for Order of Preference by Similarity to Ideal Solution ranking active (`dssTopsisService.js`)

Candidate Selling Locations:
Spatial grid generation, scoring, & ranking active (`candidateSellingLocationService.js`)

Frontend:
Complete (`DssManagementPage.jsx`)


## 12. Distribution

FIFO:
5-minute hold queue managed via BullMQ (`armadaHoldWorker.js`)

Auto allocation:
Automated TOPSIS zone assignment for active riders

Manual allocation:
Supervisor manual rider-to-zone allocation override

Frontend:
Complete (`UserManagementPage.jsx` & Distribution tab)


## 13. Armada / Rider

Armada:
Gerobak & Motor Listrik fleet management complete (`FleetManagementPage.jsx`)

Rider:
5-minute hold, claim, check-in, sale entry, checkout workflow complete (`RiderMapPage.jsx` & `RiderOperationalPage.jsx`)

Operational flow:
Claim armada -> travel to zone -> check-in (spatial polygon validation) -> sell -> checkout


## 14. LBS / Socket.IO

Redis GEO:
Redis GEO commands for real-time rider coordinate indexing (`lbsService.js`)

Socket.IO:
Real-time WebSocket server integrated in Express (`socketManager.js`, `lbsHandler.js`)

Live tracking:
Real-time rider position broadcast to management dashboard


## 15. BullMQ / Redis

Redis usage:

- Cache
- Lock
- GEO
- Rate limit
- Session Token Revocation

BullMQ jobs:

- Overpass POI Sync
- Armada 5-min Hold Expiry
- Notification Dispatcher


## 16. Cron

Cron jobs:

- Open-Meteo Weather Sync
- Overpass POI Refresh
- Audit Log Cleanup

Distributed lock:

Redlock pattern via Redis Client

Current issue:

None


## 17. Frontend Pages

### Public

/login
/register
/forgot-password
/reset-password


### User

/profile


### Management

/users
/zones
/dss
/fleet
/distribution
/settings
/superadmin/dashboard


### Rider

/rider/map
/rider/zone


## 18. Existing Components

List important reusable components:

- Button
- StatusBadge
- PageHeader
- AppLayout
- AuthLayout
- Sidebar
- FormInput
- Alert
- ProtectedRoute
- RoleGuard


## 19. Existing Services

Frontend services:

- authService
- userService
- zoneService
- fleetService
- armadaService
- dssService
- distributionService
- lbsService
- poiService
- weatherService
- auditService
- cronService
- riderService


## 20. Important Design Decisions

Examples:

- Backend is Single Source of Truth.
- No production hardcoded data.
- No dummy data.
- No duplicated business logic.
- API calls go through centralized Axios (`src/lib/axios.js`).
- Frontend role guard is for UX navigation, not the final authorization authority.
- Leaflet is used for spatial interaction.
- Zone polygon is created interactively on frontend.
- Polygon overlap is validated by backend/PostGIS.
- SMTP exists only in backend.


## 21. Known Production Blockers

Current blockers:

None


## 22. Testing Status

Frontend build:
PASS

Backend integration:
PASS

Auth:
PASS

User/Profile:
PASS

Zone:
PASS

POI:
PASS

Weather:
PASS

DSS:
PASS (Phase 1-8 Automated Test Suite PASS)

Distribution:
PASS

Armada:
PASS

Rider:
PASS

LBS:
PASS

Socket.IO:
PASS

Redis:
PASS

BullMQ:
PASS

Cron:
PASS


## 23. Coding Rules

- Clean code.
- No unnecessary comments.
- No excessive symbols.
- No unnecessary emoji.
- No dummy production data.
- No hardcoded API URLs.
- No hardcoded business data.
- No duplicated business logic.
- No unnecessary console.log.
- No sensitive data in logs.
- Backend remains Single Source of Truth.
- Keep modules independent.
- Follow existing architecture.
- Do not rewrite working modules without reason.


## 24. Current Task

Current phase:
Production Ready & System Maintenance (Phase 8 Complete)

Current objective:
Full end-to-end integration and verification across all 8 DSS phases, backend services, PostGIS spatial queries, and frontend UI pages.

Current task:
Completed updating PROJECT_STATE.md with the latest system state and verified all modules PASS.


## 25. Next Phase

After current phase reaches PASS:
Maintenance, Performance Monitoring & Scalability Enhancements

Expected capabilities:
- Continuous spatial index performance monitoring on PostGIS
- Redis cache invalidation auditing
- Monitoring live WebSocket tracking connections under load

