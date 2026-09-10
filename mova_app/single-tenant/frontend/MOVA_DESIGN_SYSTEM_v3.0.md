# MOVA --- Design System v3.0

## shadcn/ui + Tailwind CSS · Operational Intelligence Interface

> **Status:** LOCKED / Frontend Visual SSOT\
> **Product:** MOVA --- Mobile Operations & Visual Analytics\
> **Target:** Superadmin, Management, Supervisor, Rider\
> **Implementation:** React + Vite + Tailwind CSS + shadcn/ui\
> **Font:** Inter\
> **Icons:** Lucide\
> **Motion:** Motion for React, selectively\
> **Primary visual reference:** Monet Antimetal Home Hero --- visual
> language only, never copied as an operational layout

------------------------------------------------------------------------

# 0. Purpose

Dokumen ini adalah **Single Source of Truth (SSOT)** untuk visual,
layout, navigation, interaction, accessibility, dan penggunaan reusable
component pada frontend MOVA.

v3.0 mengunci dua keputusan utama:

1.  **UI foundation = shadcn/ui + Tailwind CSS**
2.  **Visual direction = Modern Operational Control Room**

Design system ini bukan sekadar kumpulan warna. Ia menjadi kontrak yang
mengatur bagaimana seluruh halaman MOVA dibangun.

### Prioritas

``` text
1. Usability
2. Information hierarchy
3. Consistency
4. Accessibility
5. Visual aesthetics
```

Jika visual yang indah mengurangi readability atau memperlambat
pekerjaan operator, **visual harus dikalahkan oleh usability**.

------------------------------------------------------------------------

# 1. Design Direction

## 1.1 Core Character

MOVA harus terasa:

-   modern
-   professional
-   operational
-   calm
-   precise
-   spatial
-   data-dense tetapi readable
-   lightweight
-   premium tanpa terasa seperti marketing website
-   map-aware
-   fast to scan

### Visual formula

``` text
Modern SaaS visual language
        +
Enterprise operational density
        +
GIS / field-operation interaction
        ↓
Clean Operational Intelligence UI
```

------------------------------------------------------------------------

## 1.2 What We Borrow From Antimetal

Referensi Antimetal digunakan sebagai **visual inspiration**, bukan
template.

Yang boleh diadopsi:

-   neutral/light foundation
-   soft blue-gray atmosphere pada konteks tertentu
-   strong typography hierarchy
-   generous whitespace
-   subtle borders
-   restrained shadows
-   compact navigation
-   controlled motion
-   modern rounded surfaces
-   dotted/grid texture pada konteks dekoratif
-   clear CTA hierarchy

Yang tidak boleh diadopsi:

-   giant marketing hero pada halaman operasional
-   typography raksasa
-   gradient sebagai background utama operational screen
-   dashboard screenshot sebagai pola UI
-   excessive pill
-   decorative illustration sebagai informasi utama
-   animation-heavy map
-   consumer-app styling

> **Antimetal memberi mood. MOVA tetap merupakan software operasional.**

------------------------------------------------------------------------

# 2. Product-Wide Principles

## 2.1 Neutral First

Target visual:

``` text
80–90% neutral
10–20% brand + semantic
```

Neutral membentuk workspace. Accent dan semantic colors memberi makna.

## 2.2 Information Before Decoration

``` text
Information
    ↓
Hierarchy
    ↓
Interaction
    ↓
Decoration
```

Tidak ada dekorasi yang boleh mengganggu data, map, form, atau action.

## 2.3 One Visual Language

Semua role menggunakan bahasa visual yang sama:

``` text
SUPERADMIN
MANAGEMENT
SUPERVISOR
RIDER
```

Yang berubah:

-   permission
-   navigation
-   data
-   available actions
-   operational context

Yang tidak berubah:

-   typography
-   spacing
-   component geometry
-   status treatment
-   interaction feedback
-   table language
-   modal language

## 2.4 Border \> Shadow

Border digunakan untuk struktur.

Shadow digunakan untuk elevation.

``` text
Normal surface → border
Floating surface → border + shadow
```

## 2.5 Component Before Page CSS

Jika sebuah pola UI muncul lebih dari sekali, pertimbangkan reusable
component sebelum membuat style page-local.

------------------------------------------------------------------------

# 3. Design Tokens

Semua token di bawah harus menjadi CSS variables/Tailwind theme tokens.
Jangan menyebarkan hardcoded hex/radius/shadow ke halaman.

------------------------------------------------------------------------

## 3.1 Neutral Palette

  Token           Value       Usage
  --------------- ----------- ----------------------------
  `neutral-950`   `#0F172A`   primary text
  `neutral-900`   `#111827`   strong text / dark surface
  `neutral-800`   `#1F2937`   dark secondary surface
  `neutral-700`   `#374151`   secondary strong text
  `neutral-600`   `#4B5563`   body text
  `neutral-500`   `#6B7280`   muted text
  `neutral-400`   `#9CA3AF`   placeholder / disabled
  `neutral-300`   `#D1D5DB`   strong border
  `neutral-200`   `#E5E7EB`   default border
  `neutral-100`   `#F3F4F6`   secondary surface
  `neutral-50`    `#F8FAFC`   workspace background
  `white`         `#FFFFFF`   surface

### Light foundation

``` text
Workspace   #F8FAFC
Surface     #FFFFFF
Surface 2   #F3F4F6
Border      #E5E7EB
Text        #0F172A
Secondary   #4B5563
Muted       #6B7280
```

------------------------------------------------------------------------

# 4. Brand / Accent

## 4.1 MOVA Signature Orange

MOVA menggunakan **Signature Orange** sebagai brand accent.

  Token           Value       Usage
  --------------- ----------- -----------------------
  `primary-700`   `#C2410C`   hover / strong
  `primary-600`   `#EA580C`   primary action
  `primary-500`   `#F97316`   active / selected
  `primary-100`   `#FFEDD5`   soft selected surface
  `primary-50`    `#FFF7ED`   subtle accent surface

### Primary digunakan untuk

-   primary CTA
-   active navigation
-   selected object
-   selected zone
-   focused control
-   important action
-   progress indicator
-   map selection
-   brand identity

### Primary tidak digunakan untuk

-   seluruh page background
-   semua icon
-   semua badge
-   semua card
-   dekorasi tanpa makna

> Orange adalah **identity + action**, bukan warna dominan seluruh
> interface.

------------------------------------------------------------------------

# 5. Semantic Colors

Semantic color harus memiliki arti yang konsisten antara component dan
map.

## Success

``` text
success-600  #16A34A
success-100  #DCFCE7
success-50   #F0FDF4
```

Untuk:

-   active
-   available
-   operational normal
-   completed
-   compliant
-   safe

## Warning

``` text
warning-600  #D97706
warning-100  #FEF3C7
warning-50   #FFFBEB
```

Untuk:

-   waiting
-   weather warning
-   approaching threshold
-   maintenance
-   degraded condition

## Danger

``` text
danger-600   #DC2626
danger-100   #FEE2E2
danger-50    #FEF2F2
```

Untuk:

-   critical
-   violation
-   failed operation
-   invalid
-   restricted
-   dangerous weather

## Info

``` text
info-600     #0284C7
info-100     #E0F2FE
info-50      #F0F9FF
```

Untuk:

-   informational state
-   system information
-   neutral weather information
-   explanatory context

### Rule

Status tidak boleh dikomunikasikan hanya melalui warna.

``` text
icon + color + text
```

------------------------------------------------------------------------

# 6. Typography

## 6.1 Font

``` css
font-family:
  Inter,
  system-ui,
  -apple-system,
  BlinkMacSystemFont,
  "Segoe UI",
  sans-serif;
```

Inter adalah font utama seluruh aplikasi.

Monospace hanya untuk:

-   ID
-   coordinate
-   technical value
-   API/debug information

Jangan menggunakan JetBrains Mono untuk UI normal.

## 6.2 Type Scale

  Token               Size   Weight Usage
  ----------------- ------ -------- -------------------------
  `display`           30px      700 login / welcome
  `page-title`        24px      700 main page title
  `section-title`     18px      600 section heading
  `panel-title`       15px      600 panel heading
  `body-lg`           14px      400 important body
  `body`              14px      400 default readable UI
  `body-sm`           12px      400 secondary information
  `label`             12px      500 form label
  `caption`           11px      500 metadata
  `micro`             10px      500 dense map metadata only

### Important

Default readable UI = **14px**.

12px ke bawah hanya untuk metadata, label, atau dense spatial
information.

------------------------------------------------------------------------

# 7. Font Weight

Gunakan hanya:

``` text
400 Regular
500 Medium
600 Semibold
700 Bold
```

Guideline:

``` text
400 → body
500 → label / metadata
600 → heading / navigation
700 → page title / KPI / primary numeric value
```

Hindari bold berlebihan dalam satu panel.

------------------------------------------------------------------------

# 8. Radius System

MOVA menggunakan geometry yang soft tetapi tetap enterprise.

  Token              Value Usage
  --------------- -------- ---------------------------------
  `radius-xs`          4px micro element
  `radius-sm`          6px compact control
  `radius-md`          8px button / input / list item
  `radius-lg`         12px card / panel
  `radius-xl`         16px large floating surface / dialog
  `radius-full`     9999px badge / avatar

### Non-negotiable defaults

``` text
Button      8px
Input       8px
Select      8px
List item   8px
Panel       12px
Card        12px
Dialog      16px
Badge       full
Avatar      full
```

Jangan menggunakan `rounded-2xl`, `rounded-3xl`, atau 20--32px sebagai
default application geometry.

------------------------------------------------------------------------

# 9. Spacing System

Base unit:

``` text
4px
```

  Token          Value
  ------------ -------
  `space-1`        4px
  `space-2`        8px
  `space-3`       12px
  `space-4`       16px
  `space-5`       20px
  `space-6`       24px
  `space-8`       32px
  `space-10`      40px
  `space-12`      48px

### Common usage

``` text
Input internal padding      12px
Button horizontal padding   12–16px
Panel padding               16px
Large panel padding         20–24px
Section gap                 24px
Page section gap            24–32px
```

------------------------------------------------------------------------

# 10. Border & Elevation

## Border

``` text
default  #E5E7EB
subtle   #F3F4F6
strong   #D1D5DB
```

Default:

``` css
border: 1px solid var(--border);
```

## Shadow

``` text
shadow-sm:
0 1px 2px rgba(15, 23, 42, 0.05)

shadow-md:
0 4px 12px rgba(15, 23, 42, 0.08)

shadow-lg:
0 8px 24px rgba(15, 23, 42, 0.10)
```

### Use shadow for

-   Dialog
-   Drawer
-   Dropdown
-   Popover
-   Floating map card
-   Tooltip
-   Overlay control

Regular panel:

``` text
surface + border
```

------------------------------------------------------------------------

# 11. shadcn/ui Foundation

shadcn/ui menjadi **primitive foundation**, bukan visual template yang
harus diterima mentah-mentah.

Gunakan dan customize:

``` text
Button
Input
Label
Textarea
Select
Checkbox
Switch
RadioGroup
Tabs
Badge
Dialog
AlertDialog
DropdownMenu
Popover
Tooltip
Sheet
Table
Skeleton
Separator
ScrollArea
Command
```

MOVA-specific components dibangun di atas primitive tersebut.

### Layering

``` text
shadcn primitive
        ↓
MOVA UI wrapper
        ↓
feature component
        ↓
page
```

Contoh:

``` text
Button
  ↓
MOVAButton
  ↓
SyncWeatherButton
  ↓
MapOpsPage
```

Tidak membuat button baru di setiap page.

------------------------------------------------------------------------

# 12. Tailwind Rules

Tailwind digunakan sebagai implementation layer.

### Prefer

``` tsx
bg-background
text-foreground
border-border
rounded-md
shadow-sm
```

atau token semantic yang sudah ditetapkan.

### Hindari

``` tsx
bg-[#EA580C]
rounded-[13px]
shadow-[...]
text-[#123456]
```

Hardcoded values hanya diperbolehkan jika:

1.  benar-benar spatial/map-specific,
2.  berasal dari external visualization specification,
3.  atau sudah ditetapkan sebagai token.

------------------------------------------------------------------------

# 13. Application Shell

Desktop shell:

``` text
┌──────────────────────────────────────────────────────────────┐
│                         Topbar                               │
├───────────┬──────────────────────────────────────────────────┤
│           │                                                  │
│ Sidebar   │                  Main Workspace                  │
│           │                                                  │
└───────────┴──────────────────────────────────────────────────┘
```

Recommended:

``` text
Sidebar  68–72px
Topbar   56–64px
```

Shell harus stabil.

Jangan mengubah lebar main content hanya karena sidebar di-hover.

------------------------------------------------------------------------

# 14. Sidebar

## Character

-   dark
-   fixed
-   icon-first
-   compact
-   stable
-   clear active state
-   no hover-induced layout shift

Base:

``` text
width      72px
background #111827
```

Expanded navigation hanya melalui explicit action, drawer, atau mode
toggle.

### Sidebar item

``` text
default:
icon muted

hover:
surface dark-secondary

active:
dark surface + orange indicator/icon
```

Active item tidak dibuat menjadi pill besar.

------------------------------------------------------------------------

# 15. Navigation Information Architecture

Navigation mengikuti **user task**, bukan database table.

``` text
HOME
└── Dashboard

OPERATIONS
├── Map Ops
├── Zone Operations
├── Rider Operations
├── Fleet Operations
└── Distribution

INTELLIGENCE
├── DSS & Recommendations
├── Weather Intelligence
└── POI Intelligence

REPORTING
├── Operational Reports
├── DSS Reports
├── Sales & Revenue
└── Audit Reports

DATA
├── Zones
├── Riders
├── Fleet
├── Products
└── POI

ADMINISTRATION
├── Users
├── Settings
└── System Audit
```

### Rules

-   maksimum 6 top-level groups
-   ideal 5--7 item per group
-   current page harus jelas
-   group state dipertahankan
-   unauthorized route tidak ditampilkan
-   icon menunjukkan kategori, bukan dekorasi
-   reporting selalu dikelompokkan
-   label UI konsisten menggunakan Bahasa Indonesia

------------------------------------------------------------------------

# 16. Role Navigation

## Superadmin

``` text
Home
Operations
Intelligence
Reporting
Data
Administration
```

## Management

``` text
Home
Operations
Intelligence
Reporting
Data (permission-limited)
```

## Supervisor

``` text
Home
Operations
Intelligence
Reporting (operational subset)
Data (operational subset)
```

## Rider

Rider tidak menggunakan stakeholder sidebar.

``` text
Today
My Zone
Sales
Operational Session
Profile
```

------------------------------------------------------------------------

# 17. Page Header

Semua non-map page menggunakan compact header.

``` text
Page Title
Supporting description

[Context] [Filter] [Refresh] [Primary Action]
```

Guideline:

``` text
Title       24px / 700
Description 14px / 400 / muted
```

Tidak menggunakan giant hero header pada operational page.

------------------------------------------------------------------------

# 18. Surface Hierarchy

Jangan semua konten menjadi card.

## Level 0 --- Workspace

Contoh:

-   map
-   primary table
-   large analytical area

Tidak membutuhkan card wrapper dekoratif.

## Level 1 --- Panel

Untuk:

-   filters
-   summary
-   weather
-   object details
-   operational controls

``` text
surface + border + radius-lg
```

## Level 2 --- Card

Untuk content yang memiliki hierarchy independen:

-   KPI
-   recommendation
-   compact summary
-   analytic block

## Level 3 --- Floating Surface

Untuk:

-   map popup
-   dropdown
-   filter popover
-   quick detail
-   legend

``` text
surface + border + shadow
```

### Anti-pattern

``` text
Card
└── Card
    └── Card
```

Jika nested card muncul, evaluasi ulang hierarchy.

------------------------------------------------------------------------

# 19. Button System

Variants:

``` text
Primary
Secondary
Outline
Ghost
Destructive
```

### Primary

``` text
bg       primary-600
text     white
height   36–40px
radius   8px
```

### Secondary

``` text
bg       white
border   neutral-200
text     neutral-800
```

### Outline

``` text
bg       transparent
border   neutral-200
```

### Ghost

``` text
bg       transparent
text     neutral-600
```

### Destructive

``` text
danger
```

### Action hierarchy

Dalam satu action group:

``` text
1 primary
1–2 secondary/outline
rest ghost/icon
```

Jangan membuat semua tombol primary.

------------------------------------------------------------------------

# 20. Form Controls

Standard:

``` text
height    36–40px
radius    8px
font      14px
padding   0 12px
border    neutral-200
```

Focus:

``` text
border/ring → primary
```

Setiap field substantial harus memiliki:

-   label
-   control
-   validation state
-   helper/error text bila perlu

Jangan mengandalkan placeholder sebagai label.

------------------------------------------------------------------------

# 21. Form Architecture

Form baru menggunakan:

``` text
React Hook Form
+
Zod
+
shadcn/MOVA form components
```

Jangan memperkenalkan manual `useState` orchestration untuk form
kompleks baru.

Struktur:

``` text
Form
├── Section
│   ├── Field
│   ├── Field
│   └── Field
├── Section
│   └── Field
└── Footer
    ├── Cancel
    └── Save
```

------------------------------------------------------------------------

# 22. Badge & Status

Status badge:

``` text
radius      full
font        11–12px
weight      500
padding     3px 8px
```

Format:

``` text
icon + color + text
```

Contoh:

``` text
● Aktif
● Menunggu
● Terdegradasi
● Kritis
● Compliant
● Deviated
● Outside Zone
```

Status semantic harus konsisten di seluruh aplikasi.

------------------------------------------------------------------------

# 23. KPI / Metric

KPI harus compact.

Recommended:

``` text
height   72–88px
padding  12–16px
radius   12px
```

Anatomy:

``` text
LABEL
Primary value
Supporting context
Optional trend/status
```

Jangan membuat KPI menjadi hero card besar kecuali metric tersebut
memang merupakan fokus utama halaman.

------------------------------------------------------------------------

# 24. Data Table

Table adalah first-class operational component.

``` text
Header  12px / 600
Body    14px / 400
Row     44–52px
```

Gunakan row separator.

Hindari border pada setiap cell.

Table harus mampu menangani:

-   loading
-   empty
-   error
-   sorting
-   filtering
-   pagination
-   row selection
-   status badge
-   contextual action

### Density

``` text
compact
default
comfortable
```

Default MOVA = `default`.

------------------------------------------------------------------------

# 25. Dialog / Confirmation

Gunakan shadcn `Dialog` / `AlertDialog`.

Size:

``` text
small   360–480px
medium  480–640px
large   640–900px
```

Anatomy:

``` text
Title
Description
────────────
Content
────────────
Cancel   Confirm
```

Mutation penting harus menggunakan contextual confirmation.

Destructive confirmation wajib menjelaskan:

-   object yang terkena dampak
-   tindakan
-   consequence
-   irreversible state jika ada

Jangan menggunakan `window.confirm()` untuk business operation.

------------------------------------------------------------------------

# 26. Drawer / Sheet

Gunakan untuk contextual detail.

Cocok untuk:

-   zone detail
-   rider detail
-   POI detail
-   DSS explanation
-   audit detail
-   mobile filter

Jangan menggunakan drawer untuk form editing yang panjang dan kompleks.

------------------------------------------------------------------------

# 27. Toast & Feedback

Gunakan centralized ToastProvider / `useToast()`.

Jangan menggunakan:

``` js
window.alert()
```

untuk feedback normal.

Semantic:

``` text
success
info
warning
danger
```

Recommended:

``` text
max-width 360px
radius    8px
padding   12px
position  top-right
```

Toast harus menjelaskan:

``` text
what happened
+
what the user can do next (if needed)
```

------------------------------------------------------------------------

# 28. Loading / Empty / Error / Success

Setiap page/feature harus memiliki empat state:

``` text
Loading
Empty
Error
Success
```

### Loading

Gunakan skeleton pada area yang loading.

Jangan blank entire page jika hanya satu widget yang loading.

### Empty

Contoh:

``` text
Belum ada rider aktif

Tidak ada rider aktif pada area yang dipilih.

[Reset Filter]
```

### Error

Contoh:

``` text
Data cuaca belum tersedia

Data cuaca belum dapat diperbarui.
Terakhir diperbarui: 08:42

[ Coba Lagi ]
```

Error harus actionable.

------------------------------------------------------------------------

# 29. Error Boundary

Global architecture:

``` text
App
└── ErrorBoundary
    └── AppLayout
        └── Page
```

Map/analytics-heavy feature boleh memiliki local boundary.

``` text
Page
├── ErrorBoundary
│   └── Map
└── ErrorBoundary
    └── Analytics
```

Kegagalan satu widget tidak boleh membuat seluruh aplikasi blank.

------------------------------------------------------------------------

# 30. Dark Mode

Dark mode adalah **complete theme**, bukan patch per component.

## Dark foundation

``` text
background   #0B0F17
surface      #131822
surface-2    #1A2230
border       #263244
foreground   #F8FAFC
muted        #94A3B8
primary      #FB923C
```

Setiap reusable component harus memiliki token-aware:

``` text
surface
border
foreground
muted
primary
semantic states
```

Jangan menulis:

``` tsx
bg-white text-white
```

pada component reusable.

### Dark mode QA

Setiap component wajib diverifikasi:

-   text contrast
-   border visibility
-   input contrast
-   badge readability
-   map overlay readability
-   hover/focus state
-   disabled state

------------------------------------------------------------------------

# 31. Icons

Icon family:

**Lucide**

Default:

``` text
16px
```

Navigation:

``` text
18px
```

Primary map control:

``` text
18–20px
```

Icon-only action wajib memiliki tooltip/accessible label.

Jangan mencampur icon family.

------------------------------------------------------------------------

# 32. Motion

Motion harus memperjelas hierarchy, bukan menarik perhatian.

Default:

``` text
duration 150–200ms
ease-out
```

Allowed:

-   page entrance
-   drawer
-   dialog
-   toast
-   selected state
-   hover
-   onboarding spotlight

Avoid:

-   bouncing KPI
-   constant animation
-   decorative loops
-   large parallax
-   aggressive map movement

Respect:

``` text
prefers-reduced-motion
```

------------------------------------------------------------------------

# 33. Antimetal Atmosphere

Soft blue atmosphere dan dotted grid adalah **contextual decoration**.

Allowed:

``` text
Login
Onboarding
Showcase
Empty state
Welcome state
Selected dashboard intro
```

Not allowed as default background:

``` text
Dense table
Operational form
Map workspace
Monitoring screen
Report
Settings
```

Decorative layer tidak boleh menangkap pointer event atau mengganggu
accessibility.

------------------------------------------------------------------------

# 34. Onboarding Spotlight

Onboarding boleh menggunakan cinematic spotlight.

``` text
dark translucent overlay
+
circular/rounded spotlight
+
subtle edge
+
contextual tooltip
```

Contoh:

``` text
████████████████████████
████████      ██████████
████████ TARGET █████████
████████      ██████████
████████████████████████
```

Ini adalah **onboarding-only pattern**.

Tidak boleh digunakan sebagai normal operational interaction.

------------------------------------------------------------------------

# 35. Map / GIS Visual Language

Map adalah primary workspace pada Map Ops.

## Map layers

``` text
Zones
Riders
POI
Weather
Protocol Roads
Toll Roads
```

Layer dense harus default OFF bila diperlukan.

POI wajib memiliki:

-   clustering
-   category filtering
-   zoom-aware visibility
-   selected detail

------------------------------------------------------------------------

# 36. Zone Visualization

Zone states:

``` text
Normal
Warning
Critical
Selected
Inactive
```

Guideline:

``` text
fill opacity  0.12–0.20
border        1–2px
selected      2–3px
```

Selected zone:

``` text
primary accent
```

Polygon harus tetap memungkinkan basemap terlihat.

------------------------------------------------------------------------

# 37. Rider Visualization

``` text
Active      success
On Duty     primary
Idle        warning
Inactive    neutral
Problem     danger
```

Marker harus berbeda jelas dari POI.

Jangan mengandalkan warna saja.

------------------------------------------------------------------------

# 38. POI Visualization

POI adalah high-volume layer.

Rules:

``` text
cluster when dense
category icon
zoom-aware visibility
category filter
selected detail
related-zone context
```

Jangan menampilkan ribuan raw marker secara default.

------------------------------------------------------------------------

# 39. Weather Visualization

Weather adalah intelligence layer.

Example:

``` text
CURRENT WEATHER

28°C
Partly cloudy

Precipitation   32%
Wind            12 km/h
Updated         08:42
```

Weather risk menggunakan semantic colors.

------------------------------------------------------------------------

# 40. Map Controls

Map controls mengikuti primitive system.

``` text
surface
+
border
+
radius-md
+
subtle shadow
```

Tidak menggunakan gradient.

------------------------------------------------------------------------

# 41. Map Ops Layout

Map Ops adalah core stakeholder experience.

Desktop:

``` text
Sidebar      72px
Control      320–380px
Map          remaining / 60–75%
```

Concept:

``` text
┌────────┬────────────────────┬─────────────────────────────┐
│        │                    │                             │
│ Sidebar│ Operational Panel  │                             │
│        │                    │            MAP              │
│        │ Search             │                             │
│        │ Filters            │                             │
│        │ Layers             │                             │
│        │ Object List        │                             │
└────────┴────────────────────┴─────────────────────────────┘
```

Map tidak dibungkus decorative oversized card.

------------------------------------------------------------------------

# 42. Map Interaction Model

## Select Zone

``` text
Select
 ↓
Highlight polygon
 ↓
Focus map
 ↓
Show detail
 ↓
Filter related riders / POI
```

## Select Rider

``` text
Select
 ↓
Focus rider
 ↓
Show detail
 ↓
Show current zone
```

## Select POI

``` text
Select
 ↓
Show POI detail
 ↓
Show related zone
```

List dan map harus synchronized.

------------------------------------------------------------------------

# 43. Page Archetypes

Semua page harus masuk salah satu archetype.

## A. Dashboard

``` text
Header
↓
Operational summary
↓
Priority alerts
↓
Spatial overview
↓
Performance / analysis
↓
Supporting intelligence
```

## B. Map Operations

``` text
Header
↓
Control panel
↓
Map
↓
Object detail
```

## C. Management CRUD

``` text
Header
↓
Summary
↓
Filter bar
↓
Table
↓
Create/Edit Dialog
```

## D. Intelligence

``` text
Header
↓
Context
↓
Key result
↓
Quality / confidence
↓
Explanation
↓
Supporting data
```

## E. Reporting

``` text
Header
↓
Report selector
↓
Filter bar
↓
KPI
↓
Visualization/Table
↓
Detail
↓
Export
```

## F. Configuration

``` text
Header
↓
Settings navigation
↓
Configuration form
↓
Validation
↓
Save state
```

## G. Rider Mobile

``` text
Today
↓
Current duty
↓
Current zone
↓
Operational actions
↓
Sales
```

------------------------------------------------------------------------

# 44. Reporting Architecture

Reporting adalah navigation group tersendiri.

``` text
Reporting
├── Operational Reports
├── DSS Reports
├── Sales & Revenue
└── Audit Reports
```

Export adalah secondary action:

``` text
[Export CSV] [Print]
```

bukan primary CTA.

------------------------------------------------------------------------

# 45. DSS Visual Architecture

DSS harus menjawab:

> "Zona mana yang direkomendasikan, seberapa kuat hasilnya, dan
> mengapa?"

Priority:

``` text
Recommendation
↓
Quality / confidence
↓
Why
↓
Criteria
↓
Calculation detail
```

Example:

``` text
CURRENT RECOMMENDATION
Zone 04
Score 0.824

Quality
VALID

Criteria
C1 ███████
C2 █████
C3 ████████
...

BWM
Consistency Ratio ≤ 0.10

TOPSIS
1. Zone 04
2. Zone 02
3. Zone 07
```

Visual hierarchy harus menjelaskan keputusan, bukan hanya menampilkan
angka.

------------------------------------------------------------------------

# 46. Settings Architecture

Settings dikelompokkan berdasarkan responsibility:

``` text
Settings
├── General
├── Hub & Operational Area
├── Spatial Rules
├── POI & Intelligence
├── Weather
├── DSS Configuration
└── Security
```

Jangan membuat satu form konfigurasi yang sangat panjang.

------------------------------------------------------------------------

# 47. Component Reuse Rules

Existing reusable components harus dipertahankan dan dimigrasikan ke
v3.0 bila masih sesuai.

Prefer:

``` text
Button
Input
Select
Panel
Card
Badge
StatusBadge
SemanticMetric
Table
Dialog
AlertDialog
Drawer / Sheet
Toast
LoadingSkeleton
EmptyState
ErrorState
```

### 80% Rule

Jika component existing memenuhi ≥80% kebutuhan:

> **Reuse dan extend. Jangan recreate.**

Component baru hanya dibuat jika terdapat:

-   behavior reusable baru,
-   visual pattern reusable baru,
-   atau domain-specific interaction yang benar-benar berbeda.

------------------------------------------------------------------------

# 48. Component API Philosophy

Gunakan semantic props.

Prefer:

``` tsx
<StatusBadge status="warning">
  Risiko Cuaca
</StatusBadge>
```

bukan:

``` tsx
<div className="bg-[#FEF3C7] text-[#D97706] ...">
```

Prefer:

``` tsx
<Panel
  title="Ringkasan Operasional"
  description="Kondisi armada hari ini"
/>
```

daripada mengulang geometry panel pada page.

------------------------------------------------------------------------

# 49. No Business Logic in Visual Components

Design system component tidak boleh menghitung business logic.

``` text
UI component
    ↓
render semantic state
```

bukan:

``` text
UI component
    ↓
calculate DSS
    ↓
transform business data
    ↓
render
```

Frontend tetap menjadi consumer dari backend contract.

------------------------------------------------------------------------

# 50. Data State Semantics

Jangan memaksa semantic state menjadi angka palsu.

Contoh:

``` text
NO_DATA → N/A
PROTECTED_ROLE → —
VALID → valid state
DEGRADED → degraded state
FRESH → fresh state
CACHED → cached state
```

Jangan mengubah `NO_DATA` menjadi `0`, `Rp 0`, atau nilai bisnis palsu.

------------------------------------------------------------------------

# 51. Accessibility

Minimum:

-   semantic HTML
-   visible keyboard focus
-   keyboard navigation
-   sufficient contrast
-   accessible labels
-   tooltip untuk icon-only control
-   status memiliki text
-   interactive desktop target sekitar 36px+
-   mobile touch target lebih besar
-   respect reduced motion

Color bukan satu-satunya carrier of meaning.

------------------------------------------------------------------------

# 52. Responsive Strategy

## Desktop

``` text
Sidebar + Topbar + Workspace
```

## Tablet

``` text
Collapsed sidebar
+
~300px control panel
+
remaining content/map
```

## Mobile

Jangan memaksa desktop layout.

Gunakan:

``` text
Top navigation
+
stacked content
+
bottom sheet / Sheet
+
drawer
```

Rider:

``` text
mobile-first
large touch targets
single-task focus
minimal navigation
```

------------------------------------------------------------------------

# 53. Hardcoded Styling Rules

Dilarang mengulang page-level:

``` text
color
radius
shadow
font
spacing
button geometry
input geometry
badge geometry
```

Gunakan:

``` text
design tokens
+
shadcn primitives
+
MOVA wrappers
+
Tailwind utilities
```

Map-specific values boleh hardcoded hanya bila merupakan bagian dari
spatial visualization specification.

------------------------------------------------------------------------

# 54. Showcase = Living Design System

`/showcase` bukan sekadar halaman demo.

Ia adalah **visual verification surface** untuk design system.

Showcase wajib memperlihatkan:

``` text
Buttons
Form Controls
Badges
Metrics
Dialogs
Cards
Tables
Alerts / Toast
Spatial / Weather
Dark Mode
Loading
Empty
Error
Responsive
```

Setiap perubahan component harus diverifikasi melalui showcase.

------------------------------------------------------------------------

# 55. Page Rewrite Strategy

Jangan redesign semua page sekaligus.

## Phase 1 --- Foundation

``` text
Design tokens
↓
globals.css
↓
shadcn foundation
↓
MOVA UI wrappers
↓
AppShell
↓
Sidebar
↓
Topbar
```

## Phase 2 --- Core Operations

``` text
Dashboard
↓
Map Ops
↓
Zone Operations
↓
Distribution
```

## Phase 3 --- Intelligence

``` text
DSS
↓
POI Intelligence
↓
Weather
```

## Phase 4 --- Reporting & Resources

``` text
Reporting
↓
Fleet
↓
Riders
↓
Catalog
↓
Users
```

## Phase 5 --- Configuration & Auth

``` text
Settings
↓
Audit
↓
Login
↓
Onboarding
```

------------------------------------------------------------------------

# 56. Design QA Gate

Sebuah page belum dianggap selesai hanya karena tampilannya berbeda.

## Visual

``` text
[ ] Inter
[ ] token-based color
[ ] correct hierarchy
[ ] correct radius
[ ] correct border
[ ] correct spacing
[ ] semantic colors
[ ] no unnecessary gradient
[ ] restrained shadow
[ ] no oversized cards
```

## Interaction

``` text
[ ] loading
[ ] empty
[ ] error
[ ] success feedback
[ ] disabled
[ ] hover
[ ] focus
[ ] keyboard
[ ] responsive
```

## Architecture

``` text
[ ] existing component reused
[ ] no unnecessary page-local primitive
[ ] forms use RHF + Zod where applicable
[ ] API remains centralized
[ ] TanStack Query remains server-state layer
[ ] no business logic duplicated for styling
```

## Theme

``` text
[ ] light mode
[ ] dark mode
[ ] no white-on-white
[ ] no black-on-black
[ ] semantic states readable
```

------------------------------------------------------------------------

# 57. Anti-Patterns

Never introduce:

``` text
❌ giant rounded cards
❌ excessive gradients
❌ random colors
❌ random border radii
❌ page-specific typography
❌ hover-expanding sidebar
❌ native window.alert()
❌ native window.confirm()
❌ decorative KPI animation
❌ full-page spinner for partial loading
❌ raw API errors
❌ thousands of map markers
❌ nested cards without hierarchy
❌ role-specific visual redesign of the same component
❌ hardcoded business values
❌ duplicated primitive components
```

------------------------------------------------------------------------

# 58. CSS / Tailwind Token Contract

Conceptual token structure:

``` css
:root {
  --background: #F8FAFC;
  --foreground: #0F172A;

  --card: #FFFFFF;
  --card-foreground: #0F172A;

  --muted: #F3F4F6;
  --muted-foreground: #6B7280;

  --border: #E5E7EB;
  --input: #E5E7EB;
  --ring: #F97316;

  --primary: #EA580C;
  --primary-foreground: #FFFFFF;

  --secondary: #F3F4F6;
  --secondary-foreground: #1F2937;

  --destructive: #DC2626;
  --destructive-foreground: #FFFFFF;

  --radius: 8px;
}

.dark {
  --background: #0B0F17;
  --foreground: #F8FAFC;

  --card: #131822;
  --card-foreground: #F8FAFC;

  --muted: #1A2230;
  --muted-foreground: #94A3B8;

  --border: #263244;
  --input: #263244;
  --ring: #FB923C;

  --primary: #F97316;
  --primary-foreground: #0B0F17;

  --secondary: #1A2230;
  --secondary-foreground: #F8FAFC;

  --destructive: #EF4444;
  --destructive-foreground: #FFFFFF;

  --radius: 8px;
}
```

> Nilai di atas adalah token foundation. Component-specific semantic
> states tetap menggunakan token semantic masing-masing.

------------------------------------------------------------------------

# 59. Definition of Done --- Design System v3.0

Design system dianggap **LOCKED** jika:

``` text
[ ] shadcn/ui menjadi primitive foundation
[ ] Tailwind menjadi styling layer
[ ] CSS variables menjadi token SSOT
[ ] Inter menjadi font utama
[ ] Signature Orange menjadi primary brand accent
[ ] radius system 4/6/8/12/16/full
[ ] border-first elevation
[ ] spacing berbasis 4px
[ ] AppShell konsisten
[ ] sidebar tidak hover-expand
[ ] navigation grouped by task
[ ] Reporting menjadi group resmi
[ ] reusable UI components standardized
[ ] forms standardized
[ ] tables standardized
[ ] dialogs standardized
[ ] toast standardized
[ ] loading/empty/error standardized
[ ] global ErrorBoundary tersedia
[ ] light mode konsisten
[ ] dark mode konsisten
[ ] map visual language standardized
[ ] page archetypes documented
[ ] showcase menjadi living reference
[ ] page rewrite mengikuti QA gate
```

------------------------------------------------------------------------

# 60. Final Design Rule

MOVA tidak boleh terlihat seperti kumpulan page yang masing-masing
dibuat bagus.

MOVA harus terlihat seperti:

> **satu operating system untuk mengelola operasi lapangan berbasis
> lokasi.**

Target akhirnya:

``` text
Modern seperti SaaS product
+
Tertib seperti enterprise software
+
Padat seperti control room
+
Spatial seperti GIS
+
Tenang seperti Antimetal
        ↓
MOVA
```

**Design System v3.0 adalah visual contract.**

Setelah dokumen ini dikunci, page tidak boleh membuat design language
baru. Jika kebutuhan baru muncul, evaluasi dilakukan pada **design
system/component layer terlebih dahulu**, kemudian baru diterapkan ke
page.
