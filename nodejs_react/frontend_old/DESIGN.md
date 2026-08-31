name: Operational Minimalist
colors:
  surface: '#f8f9ff'
  surface-dim: '#cbdbf5'
  surface-bright: '#f8f9ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#eff4ff'
  surface-container: '#e5eeff'
  surface-container-high: '#dce9ff'
  surface-container-highest: '#d3e4fe'
  on-surface: '#0b1c30'
  on-surface-variant: '#5b403e'
  inverse-surface: '#213145'
  inverse-on-surface: '#eaf1ff'
  outline: '#8f6f6d'
  outline-variant: '#e3bebb'
  surface-tint: '#b91a27'
  primary: '#b61725'
  on-primary: '#ffffff'
  primary-container: '#d9343b'
  on-primary-container: '#fffbff'
  inverse-primary: '#ffb3af'
  secondary: '#5f5e5e'
  on-secondary: '#ffffff'
  secondary-container: '#e2dfde'
  on-secondary-container: '#636262'
  tertiary: '#006856'
  on-tertiary: '#ffffff'
  tertiary-container: '#00846d'
  on-tertiary-container: '#f4fff9'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#ffdad7'
  primary-fixed-dim: '#ffb3af'
  on-primary-fixed: '#410005'
  on-primary-fixed-variant: '#930017'
  secondary-fixed: '#e5e2e1'
  secondary-fixed-dim: '#c8c6c5'
  on-secondary-fixed: '#1c1b1b'
  on-secondary-fixed-variant: '#474746'
  tertiary-fixed: '#7df8d8'
  tertiary-fixed-dim: '#5edbbc'
  on-tertiary-fixed: '#002019'
  on-tertiary-fixed-variant: '#005142'
  background: '#f8f9ff'
  on-background: '#0b1c30'
  surface-variant: '#d3e4fe'
typography:
  display-lg:
    fontFamily: Work Sans
    fontSize: 30px
    fontWeight: '800'
    lineHeight: 38px
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Work Sans
    fontSize: 20px
    fontWeight: '700'
    lineHeight: 28px
  headline-sm:
    fontFamily: Work Sans
    fontSize: 16px
    fontWeight: '700'
    lineHeight: 24px
  body-lg:
    fontFamily: Work Sans
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-md:
    fontFamily: Work Sans
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  label-md:
    fontFamily: Work Sans
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.05em
  mono-sm:
    fontFamily: JetBrains Mono
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 18px
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  unit: 4px
  container-padding: 24px
  sidebar-width: 260px
  gutter: 16px
  stack-sm: 8px
  stack-md: 16px
  stack-lg: 32px
---

## Brand & Style
The design system focuses on high-density utility and clarity for governance and administrative tasks. The personality is disciplined, serious, and efficient, prioritizing operational data over decorative elements. 

The aesthetic follows a **Minimalist** approach with a **Corporate** finish. It utilizes ample whitespace to separate data clusters, high-contrast typography for legibility, and a restricted color palette to minimize visual noise. The goal is to create a "heads-down" environment where the interface recedes into the background, allowing system statuses and governance controls to remain the primary focus.

## Colors
The color strategy is strictly functional. 

- **Primary (#FF5052):** Reserved exclusively for primary actions, active navigation states, and brand-critical identifiers. It should be used sparingly to maintain its impact as a call-to-action.
- **Neutral Palette:** Uses a range of cool grays. Surfaces are primarily white, with `#F8FAFC` used for background grouping and sidebar containers to provide subtle separation without heavy borders.
- **Status System:** Follows the traffic-light mental model for governance. Green indicates operational health, Yellow for degraded performance, and Red for unavailable services or critical errors.
- **Interaction:** Hover states on neutral elements should use a light gray wash (`#F1F5F9`), while primary buttons utilize a slight darkening of the primary red.

## Typography
While the brand identity references Gilroy, this system utilizes **Work Sans** as the primary driver for the UI to ensure maximum cross-platform compatibility and a "Work-Horse" professional feel.

- **Headings:** Use the "ExtraBold" (800) weight for Display and Headline levels to create clear structural anchors without needing large font sizes.
- **Body:** Standardized at 14px for professional density. 16px is reserved for long-form documentation or empty state messaging.
- **Labels:** Set in uppercase with increased letter spacing for table headers and section titles to distinguish metadata from content.
- **Monospace:** Used for ID strings, API keys, and logs to ensure character alignment.

## Layout & Spacing
This design system employs a **Fixed-Fluid Hybrid** layout. 

- **Desktop:** A fixed-width left sidebar (260px) persists for global navigation. The main content area is fluid but capped at a maximum width of 1440px to prevent data tables from becoming unreadable on ultra-wide monitors.
- **Mobile:** Transitions to a top header with a hamburger menu. The sidebar content collapses into a slide-over drawer.
- **Grid:** A 12-column grid is used for dashboard layouts, while forms are typically constrained to a 6-column center-aligned container or a 2-column split for "Label | Input" pairs.
- **Rhythm:** An 8px base unit drives all spacing. Use "stack" variables to maintain vertical rhythm between sections.

## Elevation & Depth
To maintain a clean, professional aesthetic, this design system avoids heavy drop shadows and neomorphism.

- **Tonal Layering:** Depth is communicated through color rather than shadow. The base canvas is `#F8FAFC`. Active cards and containers are pure white (`#FFFFFF`) with a 1px border of `#E2E8F0`.
- **Active States:** Subtle 2px "Soft Shadows" (Opacity 5%, Blur 4px) are used only for floating elements like dropdown menus, tooltips, and modals to separate them from the underlying data.
- **Sidebar:** Uses a subtle right-hand border (`#E2E8F0`) instead of a shadow to maintain the flat, architectural feel.

## Shapes
The shape language is **Soft** and structured. 

- **Corners:** A 4px (0.25rem) radius is the standard for buttons, input fields, and small UI components. This provides a professional edge that is less aggressive than sharp corners but avoids the "consumer" feel of high-roundedness.
- **Cards/Modals:** Use an 8px (0.5rem) radius to define larger layout containers.
- **Status Indicators:** Pills and badges use a fully rounded (999px) radius to distinguish them from interactive buttons.

## Components
- **Data Tables:** The core of the governance experience. Use 1px horizontal dividers only. High-density row height (40px) with "Work Sans" 14px. Header rows should have a subtle gray background.
- **Buttons:** Primary buttons are Solid Primary Red with White text. Secondary buttons are White with a Gray-300 border. No gradients.
- **Focused Forms:** Inputs use a 1px border that turns Primary Red on focus. Use "Progressive Disclosure" (e.g., hidden fields that appear only when a checkbox is toggled) to keep forms short.
- **Status Pills:** Small, high-contrast badges (e.g., Green text on Light Green background) to indicate operational health.
- **Skeleton States:** Use flat, light gray (`#F1F5F9`) blocks that match the component's shape and size during data fetching to reduce perceived latency.
- **Sidebar Navigation:** Use icons for every top-level item. Active states are indicated by a 4px vertical bar on the far left in Primary Red and a subtle background tint.