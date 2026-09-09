# MOVA — Design System
## Enterprise Fleet / Operations Control Room UI (v2.0 SSOT)

> **Status:** Production Design System Standard (Reworked v2)  
> **Product:** MOVA — Operational Zone & Fleet Intelligence  
> **Primary Experience:** Enterprise Operations Control Room (Superadmin, Management, Supervisor)  
> **Visual Reference:** Enterprise Fleet & Logistics Operations Control Room (Dense, Rectangular, Neutral, Inter-only)

---

# Visual Rework v2

## 1. Design Philosophy & Direction

MOVA is designed as an **Enterprise Fleet Management & Operations Control Room Software** for operators, managers, and supervisors monitoring continuous daily fleet execution, live spatial telemetry, DSS calculations, and multi-criteria assignments.

### Core Principles
- **DENSE + COMPACT + RECTANGULAR + STRUCTURED + NEUTRAL + OPERATIONAL**
- **Information First**: Maximizes usable information area per viewport. High data density with crisp legibility.
- **Border > Shadow**: Structural separation is achieved via subtle 1px borders (`#E5E5E5`), not heavy box shadows. Panels have `box-shadow: none` by default.
- **Zero Decorative Fluff**: No glassmorphism, no gradient operational cards, no giant rounded cards (no 12–24px radius), no decorative orange accents.
- **Full Viewport Utilization**: The application layout expands edge-to-edge (`w-full h-full`) without artificial max-width constraints (`max-w-7xl` or `max-w-1100px`) that create huge empty side gutters.

---

## 2. Application Shell & Geometry

### 2.1 Overall Layout
```text
┌──────┬──────────────────────────────────────────────────────────────────┐
│      │ Header (h-14 / 56px, compact search, breadcrumbs, actions, user) │
│ Dark ├──────────────────────────────────────────────────────────────────┤
│ Rail │                                                                  │
│ Side │ Workspace (w-full h-full, 0px gap from sidebar, 16-20px padding) │
│ bar  │                                                                  │
│(60px)│                                                                  │
└──────┴──────────────────────────────────────────────────────────────────┘
```

### 2.2 Map Ops Layout
```text
┌──────┬────────────────────────┬─────────────────────────────────────────┐
│ Side │ Operational List /     │                                         │
│ bar  │ Control Panel          │         MAP WORKSPACE                   │
│(60px)│ (300px - 360px)        │         (Remaining Width)               │
└──────┴────────────────────────┴─────────────────────────────────────────┘
```

### 2.3 Sidebar Geometry
- **Width**: `60px` (fixed compact dark rail).
- **Background**: `#171717` (`neutral-900`).
- **Sidebar-to-Workspace Gap**: `0px` (directly connected).
- **Items**: `w-9 h-9` with `rounded-[6px]`.
  - **Inactive Icon**: `#A3A3A3` (hover `#FFFFFF` on `#262626`).
  - **Active Item**: `#2563EB` background with white icon, compact rectangular surface.
- **Bottom Controls**: Compact tenant/user profile + quick actions.

---

## 3. Typography — ONLY INTER

### 3.1 Non-Negotiable Font Rule
- **Single UI Font**: `Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif` across the entire application interface.
- **Monospace Exception**: Strictly for Technical IDs, raw GPS coordinates, and debug metrics (`font-mono`).
- **Forbidden**: Roboto, Poppins, Manrope, Plus Jakarta Sans, DM Sans, Geist, Montserrat, Nunito.

### 3.2 Operational Type Scale
| Size | Weight | Line Height | Usage |
|---|---|---|---|
| `10px` (`text-[10px]`) | 500 / 600 | 12px | Micro metadata, table header captions, badge labels |
| `11px` (`text-[11px]`) | 500 / 600 | 14px | Table column headers, subtle timestamps, status notes |
| `12px` (`text-xs`) | 400 / 500 | 16px | Secondary labels, descriptions, filter controls, input text |
| `13px` (`text-[13px]`) | 400 / 500 / 600 | 18px | **Default UI body**, table cell content, buttons, tabs |
| `14px` (`text-sm`) | 500 / 600 | 20px | Section subheadings, important spec values, modal titles |
| `16px` (`text-base`) | 600 / 700 | 22px | Compact panel titles, primary metric numbers |
| `18px` (`text-lg`) | 600 / 700 | 24px | Page subheadings, main showcase headers |
| `20–22px` (`text-xl`) | 700 | 28px | Top-level page titles (used sparingly) |

---

## 4. Geometry & Radius System

All elements adhere to an **Enterprise Rectangular System**:

| Token | CSS Variable | Value | Implementation Target |
|---|---|---|---|
| `radius-xs` | `--radius-xs` | `2px` | Micro indicator bars, tick marks |
| `radius-sm` | `--radius-sm` | `4px` | Buttons, text inputs, selects, tab triggers, search boxes |
| `radius-md` | `--radius-md` | `6px` | Operational panels, cards, dropdown menus, dialogs |
| `radius-lg` | `--radius-lg` | `8px` | Floating map panels, primary hero showcase containers |
| `radius-xl` | `--radius-xl` | `10px` | Heavy modal overlays (rare) |
| `radius-full` | `--radius-full` | `9999px` | Status badges, status dot indicators, user avatars |

**Strict Constraints**:
- NO `12px`, `16px`, `24px` radius on panels or cards.
- NO `rounded-full` on search bars or rectangular input fields.

---

## 5. Spacing System (4px Base Unit)

| Token | CSS Variable | Value | Usage |
|---|---|---|---|
| `space-1` | `--space-1` | `4px` | Micro gaps, icon-to-label gaps, badge padding |
| `space-2` | `--space-2` | `8px` | Control gap, compact row gap, inline item spacing |
| `space-3` | `--space-3` | `12px` | Panel internal padding, grid gap, section stack |
| `space-4` | `--space-4` | `16px` | Standard panel padding, page padding (mobile/tablet) |
| `space-5` | `--space-5` | `20px` | Standard page padding (desktop), hero section padding |
| `space-6` | `--space-6` | `24px` | Major section division (max operational spacing) |

**Constraints**:
- Avoid `32px`, `40px`, `48px` whitespace inside operational zones.

---

## 6. Color System

### 6.1 Neutral Foundation (85–90% of Surface Area)
- `--color-bg`: `#FAFAFA` (Main app workspace canvas)
- `--color-surface`: `#FFFFFF` (Operational panels & cards)
- `--color-surface-subtle`: `#F5F5F5` (Table headers, spec boxes, secondary bars)
- `--color-border`: `#E5E5E5` (Standard panel & control 1px border)
- `--color-border-strong`: `#D4D4D4` (Active or focused borders)
- `--color-text`: `#111111` (Primary text & prominent values)
- `--color-text-secondary`: `#525252` (Secondary labels & descriptions)
- `--color-text-muted`: `#737373` (Captions, timestamps, disabled items)

### 6.2 Primary Accent
- `--color-primary`: `#2563EB` (Primary buttons, active rail icons, main highlights)
- `--color-primary-hover`: `#1D4ED8`
- `--color-primary-soft`: `#DBEAFE` (Active pill backgrounds, selection tints)

### 6.3 Semantic Colors
- **Success**: `#16A34A` / Soft: `#DCFCE7` (Operational, compliant, on-the-way, optimal)
- **Warning**: `#D97706` / Soft: `#FEF3C7` (Waiting, degraded, near threshold)
  - *Strict Rule: Orange is EXCLUSIVELY a semantic warning color. It is never used as decorative brand color.*
- **Danger**: `#DC2626` / Soft: `#FEE2E2` (Violation, offline, out-of-bounds, critical error)
- **Info**: `#0284C7` / Soft: `#E0F2FE` (Telemetry note, neutral notice)

---

## 7. Panel & Card Architecture

### Level 1: Workspace Canvas
- Direct viewport container (`w-full h-full bg-[#FAFAFA]`). No nested card wrappers.

### Level 2: Operational Panel (`Panel` / `Card`)
- `background: #FFFFFF`
- `border: 1px solid #E5E5E5`
- `border-radius: 6px`
- `box-shadow: none`
- `padding: 12px – 16px`

### Level 3: Floating Control / Popover
- `background: #FFFFFF`
- `border: 1px solid #E5E5E5`
- `border-radius: 6px`
- `box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08)` (Subtle elevation only when floating over map)

---

## 8. Control & Form Design

- **Height**: Standard `32px` (`h-8`) or `34px` / `36px` (`h-9`). Max `40px` for special standalone hero actions.
- **Radius**: `rounded-[4px]`.
- **Search Inputs**: Compact `h-8` or `h-9` with `rounded-[4px]`, 12-13px text, search icon inside.
- **Buttons**:
  - `Primary`: `#2563EB`, white text, `rounded-[4px]`, `text-[13px]`, font-medium.
  - `Secondary / Outline`: `#FFFFFF`, border `#E5E5E5`, text `#111111`, `rounded-[4px]`.
  - `Ghost`: Transparent, text `#525252`, hover `#F5F5F5`.
- **Button Hierarchy**: Limit to 1 primary action per section; secondary and ghost for remaining controls.

---

## 9. Data Density & Visual Composition (Reference Standard)

Following the target control room reference layout:
1. **Top Section — Hero Operational Showcase**:
   - Left sub-panel: Entity title, 2x2 specification grid (`Payload`, `Load Volume`, `Length`, `Width`), license plate badge, documents link.
   - Right sub-panel: Clean neutral illustration/canvas area with subtle technical watermark.
2. **Bottom-Left Section — Live Routes & Telemetry**:
   - Header with active count & toggle history.
   - Active route card with live mini-map preview, departure/destination address, distance, time left, payload weight & volume.
   - Dense historical dispatch queue list.
3. **Bottom-Right Section — Operational Intelligence & Performance**:
   - Multi-segment color-coded distribution bar (`On the Way [39.7%]`, `Unloading [28.3%]`, `Loading [17.4%]`, `Waiting [14.6%]`).
   - Detailed metric table matching segment values.
   - Dual-bar operational timeline chart (`Working Time` vs `Average Working Time`).

---

## 10. Map Ops Integration Rules

- **Sidebar**: `60px` fixed dark rail.
- **Operational List**: `300px - 360px` dense column immediately adjacent to sidebar.
- **Map Workspace**: Fills all remaining width and height.
- **Synchronization**:
  - Clicking item in list immediately highlights map polygon/pin and opens compact floating detail panel.
  - Floating map panel is compact (`max-w-[280px]`, `rounded-[6px]`, `p-3`).

---

## 11. Anti-Patterns & Forbidden Rules

1. **NO 12px/16px/24px Panel Radii**: Use `6px` (`rounded-[6px]`) or `8px` exclusively.
2. **NO Decorative Orange**: Orange `#D97706` is reserved for semantic warnings (`WAITING`, `DEGRADED`, etc.).
3. **NO Multiple UI Fonts**: Inter is the only UI font.
4. **NO Heavy Shadows on Base Panels**: Use 1px borders for structure; reserve shadows for floating popups.
5. **NO Giant Marketing Headers or Whitespace**: Use compact 48-56px topbar and full-bleed viewport layouts.
6. **NO Unconnected Sidebar**: The sidebar is fixed directly next to the workspace with 0px margin gap.

---

## 12. Implementation Checklist & Status

- [x] Single font `Inter` loaded in `index.html` and configured across all Tailwind classes.
- [x] `tokens.css` unified with 4-8px radius, 4px spacing scale, and enterprise neutral palette.
- [x] Dark rail sidebar (`60px`, `#171717`) connected directly to workspace with 0px gap.
- [x] Compact topbar (`h-14`) with integrated context and search controls.
- [x] UI Primitives (`Button`, `Input`, `Select`, `Panel`, `Card`, `Table`, `Tabs`, `SemanticMetric`, `Badge`) updated to 4-8px rectangular standard.
- [x] SuperAdmin Dashboard updated to 3-panel operations showcase matching target reference layout.
- [x] Backend B-08..B-12 100% frozen and verified.
