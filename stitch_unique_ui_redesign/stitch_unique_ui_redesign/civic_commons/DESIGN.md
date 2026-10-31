---
name: Civic Commons
colors:
  surface: '#faf8ff'
  surface-dim: '#d2d9f4'
  surface-bright: '#faf8ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f2f3ff'
  surface-container: '#eaedff'
  surface-container-high: '#e2e7ff'
  surface-container-highest: '#dae2fd'
  on-surface: '#131b2e'
  on-surface-variant: '#434655'
  inverse-surface: '#283044'
  inverse-on-surface: '#eef0ff'
  outline: '#737686'
  outline-variant: '#c3c6d7'
  surface-tint: '#0053db'
  primary: '#004ac6'
  on-primary: '#ffffff'
  primary-container: '#2563eb'
  on-primary-container: '#eeefff'
  inverse-primary: '#b4c5ff'
  secondary: '#006c49'
  on-secondary: '#ffffff'
  secondary-container: '#6cf8bb'
  on-secondary-container: '#00714d'
  tertiary: '#3e3fcc'
  on-tertiary: '#ffffff'
  tertiary-container: '#585be6'
  on-tertiary-container: '#f1eeff'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#dbe1ff'
  primary-fixed-dim: '#b4c5ff'
  on-primary-fixed: '#00174b'
  on-primary-fixed-variant: '#003ea8'
  secondary-fixed: '#6ffbbe'
  secondary-fixed-dim: '#4edea3'
  on-secondary-fixed: '#002113'
  on-secondary-fixed-variant: '#005236'
  tertiary-fixed: '#e1e0ff'
  tertiary-fixed-dim: '#c0c1ff'
  on-tertiary-fixed: '#07006c'
  on-tertiary-fixed-variant: '#2f2ebe'
  background: '#faf8ff'
  on-background: '#131b2e'
  surface-variant: '#dae2fd'
typography:
  display:
    fontFamily: Plus Jakarta Sans
    fontSize: 40px
    fontWeight: '800'
    lineHeight: 48px
    letterSpacing: -0.03em
  display-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 32px
    fontWeight: '800'
    lineHeight: 40px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 30px
    fontWeight: '700'
    lineHeight: 38px
    letterSpacing: -0.02em
  headline-lg-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 24px
    fontWeight: '700'
    lineHeight: 32px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 22px
    fontWeight: '600'
    lineHeight: 30px
    letterSpacing: -0.01em
  headline-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 18px
    fontWeight: '600'
    lineHeight: 26px
  body-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 26px
  body-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 22px
  body-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 13px
    fontWeight: '400'
    lineHeight: 18px
  label-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 20px
    letterSpacing: 0.01em
  label-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.02em
  label-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 11px
    fontWeight: '600'
    lineHeight: 14px
    letterSpacing: 0.04em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  gutter: 1.5rem
  margin: 2rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2.5rem
---

## Brand & Style

This design system establishes an open, democratic, and inviting atmosphere for municipal administration, public engagement, and campus navigation. It transforms complex civic operations and bureaucratic workflows into accessible, calm, and trustworthy digital touchpoints.

### Key Attributes
- **Civic Warmth & Transparency:** Clear, generous layouts that demystify governance, room reservations, permits, and telemetry.
- **Modern Institutional Utility:** A refined synthesis of Swiss precision and contemporary humanist design, avoiding cold bureaucracy and high-tech aggression.
- **Approachability:** Soft curved cards, balanced tonal layering, and scannable visual anchors that accommodate everyone from local residents to administrative directors.

## Colors

The palette is engineered around clean legibility, optimism, and WCAG AAA compliance across primary informational elements.

### Color Roles
- **Primary (`#2563EB` - Civic Cobalt):** Anchors primary call-to-actions, active navigation markers, key dates, and system state highlights.
- **Secondary (`#10B981` - Emerald Mint):** Represents confirmed bookings, active services, positive ecological/budget telemetry, and verified civic approvals.
- **Tertiary (`#6366F1` - Soft Indigo):** Used for auxiliary badges, departmental tags, and subtle data-viz accents.
- **Neutral (`#0F172A` - Deep Slate):** High-contrast text foundation for body typography, titles, and structural glyphs. Paired with slate mid-tones (`#334155` and `#64748B`) for secondary metadata.
- **Surfaces & Canvases:** Grounded in layered warm whites and crisp pale slates (`#FFFFFF`, `#F8FAFC`, `#F1F5F9`). Dark surfaces and neon saturations are strictly avoided. Badges leverage pastel tints with 10–12% opacity fills backed by saturated ink labels.

## Typography

The design system uses **Plus Jakarta Sans** uniformly across headlines, reading copy, and control labels. Its open counters, geometric stability, and humanist terminals provide an energetic, legible tone that minimizes cognitive friction during administrative tasks.

### Guidelines
- **Optical Hierarchy:** Restrict large display styles to welcoming dashboard headers, landing zones, or service counter wayfinding screens.
- **Telemetry Readouts:** Pair numeric stats with `label-sm` or `label-md` uppercase descriptors placed consistently above or below the figures.
- **Numbers:** Tabular figures (`tnum`) should be enabled for time pickers, operational budgets, queuing lists, and scheduling time slots.

## Layout & Spacing

Layouts follow a fluid, responsive 12-column grid system designed around clarity, uncrowded reading lines, and intuitive touch targets.

### Breakpoints & Grid Composition
- **Desktop (1200px+):** 12 columns, 24px (`1.5rem`) gutters, 32px (`2rem`) outer margin. Maximum layout container capped at 1360px for reading comfort.
- **Tablet (768px - 1199px):** 8 columns, 20px (`1.25rem`) gutters, 24px (`1.5rem`) outer margin. Telemetry and metric overviews collapse from 4-across to 2x2 modular grids.
- **Mobile (< 768px):** 4 columns, 16px (`1rem`) gutters, 16px (`1rem`) outer margin. Action cards stack vertically with sticky navigation elements pinned to top or bottom safe areas.

### Rhythm
White space acts as an active structural element. Group related actions tightly with `space-sm` and `space-md`, while delineating independent service domains and operational sections using `space-xl`.

## Elevation & Depth

Visual hierarchy relies on quiet, atmospheric layering rather than aggressive dropshadows. Surfaces remain predominantly flat with ambient, diffuse shadows to indicate elevated interactive planes.

### Surface Tiers
- **Tier 0 (Base Canvas):** `#F8FAFC`. The foundational backdrop for desktop applications and public portals.
- **Tier 1 (Resting Cards & Modules):** `#FFFFFF` paired with a 1px border (`#E2E8F0`) and an ambient shadow: `0 1px 3px 0 rgba(15, 23, 42, 0.04), 0 1px 2px -1px rgba(15, 23, 42, 0.02)`.
- **Tier 2 (Interactive Floating / Hover):** `#FFFFFF` with border (`#CBD5E1`) and a soft elevation plume: `0 10px 15px -3px rgba(15, 23, 42, 0.06), 0 4px 6px -4px rgba(15, 23, 42, 0.03)`. Used for active room cards, interactive queue cards, and hovering list items.
- **Tier 3 (Modals, Slide-over Sheets & Dialogs):** `#FFFFFF` anchored by `0 20px 25px -5px rgba(15, 23, 42, 0.08), 0 8px 10px -6px rgba(15, 23, 42, 0.04)`, layered over a gentle backdrop tint (`rgba(15, 23, 42, 0.35)` with a 4px blur).

## Shapes

The shape vocabulary communicates approachability and civic optimism through generous corner radii. 

### Corner Scale
- **Small Controls (`rounded`, 8px / 0.5rem):** Form inputs, buttons, filter chips, and segmented controls.
- **Standard Cards (`rounded-lg`, 16px / 1rem):** Booking modules, appointment summaries, civic notifications, and telemetry stat panels.
- **Featured Surfaces & Modals (`rounded-xl`, 24px / 1.5rem):** Hero highlight containers, main onboarding dialogs, and citizen kiosk interaction zones.
- **Full Pill (`rounded-full`):** Reserved exclusively for status indicator badges, quick-tag pills, and avatar anchors.

## Components

### Buttons
- **Primary:** Background `#2563EB`, text `#FFFFFF`, 8px corner radius. Subtle hover state to `#1D4ED8` with a 150ms ease. Focus ring: 3px `#93C5FD` offset by 2px.
- **Secondary / Soft:** Background `#EFF6FF`, text `#1D4ED8`, 8px corner radius. Hover shifts to `#DBEAFE`.
- **Outline:** Transparent background, 1px solid border `#CBD5E1`, text `#334155`. Hover transitions to background `#F1F5F9`.

### Chips & Badges
- **Status Badges:** Pill-shaped (`rounded-full`), `label-sm` weight, with 6px horizontal padding and 2px vertical padding.
  - *Active / Confirmed:* Background `#ECFDF5`, text `#047857`.
  - *Pending / Processing:* Background `#FEF3C7`, text `#B45309`.
  - *Civic Program / Neutral:* Background `#F1F5F9`, text `#475569`.
- **Interactive Filter Chips:** 8px rounded corners. Unselected: background `#FFFFFF`, border `#E2E8F0`, text `#475569`. Selected: background `#EFF6FF`, border `#BFDBFE`, text `#1D4ED8`.

### Booking & Resource Cards
- Constructed with `#FFFFFF` background, 16px radius, and a 1px border (`#E2E8F0`).
- Card layout divides information clearly:
  - **Top Row:** Title (`headline-sm`), status chip pinned to the upper right.
  - **Middle Content:** Date/time intervals displayed with leading tabular figures alongside capacity meters or facility specs.
  - **Bottom Action Bar:** Full-width or right-aligned primary CTA ("Reserve Space", "View Permit") separated by a soft border divider (`#F1F5F9`).

### Input Fields
- Base height 44px with 12px horizontal padding.
- Border 1px `#CBD5E1` on `#FFFFFF` fill; 8px radius.
- Active focus state sharpens border to `#2563EB` paired with an ambient outer glow (`box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.15)`).
- Helper labels sit 6px above the field in `label-md` (`#334155`).

### Selection Controls (Checkboxes & Radios)
- Checkboxes feature a 4px corner radius; Radios are circular.
- Unchecked: `#FFFFFF` fill, 1.5px border `#94A3B8`.
- Checked: Fill `#2563EB` with `#FFFFFF` checkmark/indicator dot.

### Telemetry & Civic Metric Tiles
- Simple, unadorned surfaces designed for instant reading.
- A single high-contrast primary number (`display-mobile` or `headline-lg`) flanked by a modest percentage delta badge (`#ECFDF5` fill / `#047857` ink for positive civic metrics).
- Explicit `label-md` section headers anchored at the top in `#64748B`.