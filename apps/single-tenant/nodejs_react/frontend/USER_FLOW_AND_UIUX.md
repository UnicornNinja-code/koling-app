# USER FLOW & UI/UX SPECIFICATION DOCUMENT — MANTAKOPI DSS

**Application:** MantaKopi DSS (`koling-app`)  
**Design System:** Operational Minimalist  
**Target Platform:** Dual Persona (Desktop/Tablet Management Portal & Mobile-First Field Rider App)  
**Status:** Backend Frozen & 100% Available. Operational User Flow Verified.

---

# 1. EXECUTIVE SUMMARY & DESIGN PHILOSOPHY

Dokumen ini mendefinisikan secara menyeluruh **Arsitektur Pengalaman Pengguna (UX Architecture)**, **Sistem Desain Visual (Design System)**, **Pemetaan Alur Pengguna (User Flow Mapping)**, serta **Spesifikasi Layar demi Layar (Screen-by-Screen Specification)** untuk aplikasi web MantaKopi Decision Support System (DSS).

### Prinsip Utama Utilitas & Desain:
> **"Change the presentation, preserve the evidence."**

1. **Strictly Functional Aesthetics:** Menghindari dekorasi berlebihan. Antarmuka mengutamakan kejelasan data operasional, keterlacakan bukti matematis (*auditability*), dan kemudahan operasi di lapangan.
2. **Decoupled 2-Tier Architecture:** Memisahkan *Decision View* (tampilan cepat untuk keputusan operasional) dari *Evidence Audit Drawer* (tampilan bukti akademis lengkap $R, V, A^+, A^-$) agar keputusan dapat diambil dalam hitungan detik tanpa kehilangan transparansi.
3. **Mobile-First Rider State Machine:** Alur kerja *Rider* di lapangan menggunakan prinsip *single primary action per state* untuk meminimalkan beban kognitif saat bergerak.

---

# 2. DESIGN SYSTEM & DESIGN TOKENS (OPERATIONAL MINIMALIST)

## 2.1 Color Tokens & Semantic Assignments

| Color Token | Hex Code | Purpose & Semantic Rule |
|---|---|---|
| **Primary Brand** | `#FF5052` / `#B61725` | Khusus untuk brand identity, tombol CTA utama, dan item navigasi aktif. **Tidak digunakan untuk pesan error.** |
| **Surface Background** | `#F8FAFC` / `#F8F9FF` | Kanvas latar belakang utama untuk mengelompokkan konten tanpa garis batas tebal. |
| **Surface Container** | `#FFFFFF` | Latar belakang kartu, modal, dan tabel dengan border tipis `1px #E2E8F0`. |
| **On-Surface Text** | `#0B1C30` / `#0F172A` | Warna teks utama untuk keterbacaan tinggi (*high-contrast legibility*). |
| **Status Health (Green)**| `#10B981` / `#006856` | Mengindikasikan status operasional sehat, *Compliant*, atau zona aktif. |
| **Status Warning (Amber)**| `#F59E0B` / `#D97706` | Mengindikasikan status reservasi *Hold* sementara (5 menit) atau *Deviated*. |
| **Status Error (Red)** | `#DC2626` / `#BA1A1A` | Khusus untuk alert bahaya, pelanggaran batas jalan terlarang, atau gagal sistem. |

## 2.2 Typography Rules
- **Primary Font Family:** `Work Sans` (Menjamin profesionalitas, kepadatan data tinggi, dan kompatibilitas lintas platform).
- **Headings (Display/Headline):** `Work Sans` weight **ExtraBold (800)** untuk jangkar visual yang kuat.
- **Body & Controls:** Standardized `14px` (`fontWeight: 400/600`) untuk kepadatan data profesional.
- **Table Headers & Labels:** `Work Sans` `12px` **Uppercase** dengan *letter spacing* `0.05em`.
- **Monospace Alignment:** `JetBrains Mono` / `Courier New` khusus untuk ID Snapshot, UUID, dan koordinat GPS.

## 2.3 Layout & Elevation
- **Desktop Layout:** Fixed left sidebar ($260\text{px}$) + fluid main canvas (max width $1440\text{px}$).
- **Mobile Layout:** Fixed bottom navigation bar ($64\text{px}$) dengan 4 ikon inti + pull-up bottom sheets.
- **Elevation:** Menghindari drop shadow tebal. Kedalaman visual dicapai melalui *Tonal Layering* (`#F8FAFC` canvas $\rightarrow$ `#FFFFFF` cards dengan border `1px #E2E8F0`).

---

# 3. PERSONA-BASED DUAL USER FLOWS

Aplikasi ini dibagi secara tegas menjadi dua persona utama:

```mermaid
flowchart TD
    subgraph BACKEND_SERVICES_100_PERCENT_AVAILABLE
        API["Backend REST APIs & Socket.IO WebSockets"]
    end

    subgraph PERSONA_1_SUPERVISOR_PORTAL
        S0["AUTH (/login)"] --> S1["HOME (/superadmin/dashboard)"]
        S1 --> S2["DECIDE (/dss)"]
        S2 --> S3["OPERATE (/distribution, /zones, /fleet)"]
        S3 --> S4["MONITOR (/rider/map - Supervisor View)"]
        S4 --> S5["REPORT (/users, /settings)"]
    end

    subgraph PERSONA_2_FIELD_RIDER_APP
        R0["AUTH (/login)"] --> R1["TODAY'S OPERATION (/rider/zone)"]
        R1 --> R2["HUB FLEET SELECTION & CLAIM"]
        R2 --> R3["SPATIAL CHECK-IN & LIVE MAP (/rider/map)"]
        R3 --> R4["SALES LOGGER & CHECKOUT"]
    end

    S1 & S2 & S3 & S4 & S5 --> API
    R1 & R2 & R3 & R4 --> API
```

---

# 4. CANONICAL END-TO-END USER FLOW DIAGRAM

```mermaid
flowchart TD
    A["LOGIN (/login)"] --> B["DASHBOARD (/superadmin/dashboard)"]
    
    B --> C1["DECIDE: DSS Recommendation (/dss)"]
    B --> C2["OPERATE: Distribution Workspace (/distribution)"]
    B --> C3["MONITOR: Live Spatial Map (/rider/map)"]

    C1 -->|"1. Select Time Slot (Pagi/Siang/Sore/Malam)"| D1["Run BWM-TOPSIS Evaluation"]
    D1 -->|"2. Rank #1 Zone Highlight Card"| D2["Review Preference Score Ci & Key Drivers"]
    D2 -->|"3. Click 'Plot / Use Zone'"| C2

    C2 -->|"Mode Auto (FIFO + TOPSIS)"| E1["POST /api/distribution/auto"]
    C2 -->|"Mode Manual Plotting"| E2["POST /api/distribution/manual"]

    E1 & E2 --> F["RIDER TODAY'S OPERATION (/rider/zone)"]

    F -->|"State 1: Duty Confirm"| G1["POST /api/distribution/duty-confirm"]
    G1 -->|"State 2: Hold Fleet (5-min Lock)"| G2["POST /api/rider-operational/hold-armada"]
    G2 -->|"State 3: Confirm Claim (IN_USE)"| G3["POST /api/rider-operational/claim-armada"]
    G3 -->|"State 4: PostGIS ST_Contains Check-in"| G4["POST /api/rider-operational/check-in"]
    G4 -->|"State 5: Active Shift & Live LBS Ping"| G5["POST /api/lbs/track & Socket.IO"]
    G5 -->|"State 6: Record Sales"| G6["POST /api/rider-operational/record-sale"]
    G6 -->|"State 7: Checkout & Return Fleet"| G7["POST /api/rider-operational/checkout"]
```

---

# 5. RIDER OPERATIONAL STATE MACHINE FLOW

Setiap status operasional Rider pada `/rider/zone` memiliki acuan status backend dan aksi tunggal yang jelas:

```mermaid
stateDiagram-v2
    [*] --> STATE_1_UNASSIGNED: Open /rider/zone
    STATE_1_UNASSIGNED --> STATE_2_HELD: Tap "Kunci Armada (Hold 5 Mnt)"\nPOST /hold-armada
    STATE_2_HELD --> STATE_3_CLAIMED: Tap "Konfirmasi Klaim Armada"\nPOST /claim-armada
    STATE_2_HELD --> STATE_1_UNASSIGNED: Timer Expires (00:00) / Tap "Batal Hold"\nPOST /cancel-hold-armada
    STATE_3_CLAIMED --> STATE_4_CHECKED_IN: Arrive at Zone & Tap "Check-in Spasial"\nPOST /check-in (ST_Contains Check)
    STATE_4_CHECKED_IN --> STATE_5_CHECKOUT: End Shift & Tap "Selesai Shift & Checkout"\nPOST /checkout
    STATE_5_CHECKOUT --> [*]: Armada Returned to ACTIVE
```

---

# 6. SCREEN-BY-SCREEN SPECIFICATION MATRIX (SCR-01 to SCR-11)

| Screen ID | Screen Name | Route | Primary Persona | P0 (Must See) Hierarchy | Primary CTA | API Binding |
|---|---|---|---|---|---|---|
| **SCR-01** | Login & Auth | `/login` | Public / All | Email/Password inputs, Role indicator | "Masuk ke Platform" | `POST /api/auth/login` |
| **SCR-02** | Supervisor Dashboard | `/superadmin/dashboard` | Supervisor | Active Riders, Zones, Fleet, Alerts | "Kelola Distribusi Rider" | `GET /api/distribution/overview`, `GET /api/lbs/nearby` |
| **SCR-03** | DECIDE — DSS Engine | `/dss` | Manager / Analyst | Rank #1 Card, Ci Score %, Leaderboard | "Plot / Gunakan Zona Ini" | `POST /api/dss/evaluate`, `GET /api/dss/snapshots/:id` |
| **SCR-04** | OPERATE — Distribution | `/distribution` | Supervisor | Duty Queue, Zone Capacity Board (`2/3`) | "Jalankan Alokasi Otomatis" | `POST /api/distribution/auto`, `POST /api/distribution/manual` |
| **SCR-05** | OPERATE — Zones | `/zones` | Operations Admin | Zone List, Status Badge, Geometry Popover | "+ Tambah Zona Baru" | `POST /api/zones`, `GET /api/roads/protocol` |
| **SCR-06** | OPERATE — Fleet | `/fleet` | Fleet Manager | Armada Code, Status, 5-min Countdown | "+ Tambah Unit Armada" | `GET /api/armada`, `POST /cancel-hold-armada` |
| **SCR-07** | MONITOR — Live Map | `/rider/map` (SPV) | Supervisor | Full-viewport Map, Compliance Markers | "Lihat Telemetri Rider" | `GET /api/lbs/nearby` + Socket.IO WebSockets |
| **SCR-08** | RIDER — Operational Home | `/rider/zone` | Field Rider | Stepper Progress Bar, Active State Card | Dynamic per State (Hold/Claim/Check-in) | `POST /hold-armada`, `POST /claim-armada`, `POST /check-in` |
| **SCR-09** | RIDER — Geofence Map | `/rider/map` (Rider) | Field Rider | GPS Marker, Geofence Chip, Road Banner | "Pusatkan Lokasi Saya" | `POST /api/lbs/track` + Socket.IO WebSockets |
| **SCR-10** | RIDER — Sales & Checkout | `/rider/zone` (Sales) | Field Rider | Revenue Summary, Product Stepper Cards | "Simpan Penjualan" / "Checkout" | `POST /record-sale`, `POST /checkout` |
| **SCR-11** | REPORT — Audit & Users | `/settings` / `/users` | SuperAdmin | User Roster, Cron Logs, JSON Trace Drawer | "+ Tambah User Baru" | `GET /api/users`, `GET /api/audit/logs` |

---

# 7. SPATIAL MAP VISUALIZATION HIERARCHY

Untuk mencegah kepadatan data berlebih (*map clutter*), peta spasial mengimplementasikan hirarki layer bertingkat:

```text
SPATIAL MAP LAYER HIERARCHY
│
├── DEFAULT VISIBLE LAYERS (Base Canvas)
│   ├── Base Map Tiles (OSM Light / CartoDB Positron)
│   ├── Active Operational Zone Polygons (Blue/Green Stroke)
│   ├── Live Rider Marker Pins (Green = Compliant, Orange = Deviated)
│   └── Prohibited Road Overlays (Red LineString for Protocol & Toll Roads)
│
└── OPTIONAL TOGGLEABLE LAYERS (Layer Switcher Control)
    ├── Raw POI Point Markers (Clustered)
    ├── Candidate Selling Locations (Yellow Star Markers)
    └── Historical Heatmap Density Overlay
```
