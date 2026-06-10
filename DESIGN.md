---
name: Obsidian Kinetic
colors:
  surface: '#131314'
  surface-dim: '#131314'
  surface-bright: '#3a393a'
  surface-container-lowest: '#0e0e0f'
  surface-container-low: '#1c1b1c'
  surface-container: '#201f20'
  surface-container-high: '#2a2a2b'
  surface-container-highest: '#353436'
  on-surface: '#e5e2e3'
  on-surface-variant: '#c4c9ac'
  inverse-surface: '#e5e2e3'
  inverse-on-surface: '#313031'
  outline: '#8e9379'
  outline-variant: '#444933'
  surface-tint: '#abd600'
  primary: '#ffffff'
  on-primary: '#283500'
  primary-container: '#c3f400'
  on-primary-container: '#556d00'
  inverse-primary: '#506600'
  secondary: '#d3fbff'
  on-secondary: '#00363a'
  secondary-container: '#00eefc'
  on-secondary-container: '#00686f'
  tertiary: '#ffffff'
  on-tertiary: '#2f2e43'
  tertiary-container: '#e2e0fc'
  on-tertiary-container: '#63627a'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#c3f400'
  primary-fixed-dim: '#abd600'
  on-primary-fixed: '#161e00'
  on-primary-fixed-variant: '#3c4d00'
  secondary-fixed: '#7df4ff'
  secondary-fixed-dim: '#00dbe9'
  on-secondary-fixed: '#002022'
  on-secondary-fixed-variant: '#004f54'
  tertiary-fixed: '#e2e0fc'
  tertiary-fixed-dim: '#c6c4df'
  on-tertiary-fixed: '#1a1a2e'
  on-tertiary-fixed-variant: '#45455b'
  background: '#131314'
  on-background: '#e5e2e3'
  surface-variant: '#353436'
typography:
  display:
    fontFamily: Archivo Narrow
    fontSize: 48px
    fontWeight: '700'
    lineHeight: 52px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Archivo Narrow
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 36px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Archivo Narrow
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 28px
  body-lg:
    fontFamily: Archivo Narrow
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 26px
  body-md:
    fontFamily: Archivo Narrow
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  label-caps:
    fontFamily: JetBrains Mono
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: 0.1em
  metric-lg:
    fontFamily: Archivo Narrow
    fontSize: 40px
    fontWeight: '700'
    lineHeight: 40px
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  base: 4px
  container-padding: 20px
  stack-sm: 8px
  stack-md: 16px
  stack-lg: 24px
  gutter: 12px
---

## Brand & Style
The design system is engineered for high-performance mobile environments, prioritizing focus, speed, and immediate legibility. It targets an audience that values efficiency and athletic precision, evoking an emotional response of "flow state" and technical mastery.

The visual style is a hybrid of **Dark Minimalism** and **Glassmorphism**. By using deep, light-absorbing obsidian surfaces as the foundation, we allow vibrant, glowing accents to guide the user's eye to primary actions and progress metrics. The interface feels like a high-end digital cockpit—precise, immersive, and premium.

## Colors
This design system utilizes a "Super-Dark" palette to maximize the luminance of its accent colors. 

- **Primary (Electric Lime):** Used exclusively for critical path actions, success states, and active progress indicators. It is designed to "glow" against the dark background.
- **Secondary (Cyan Pulse):** Used for interactive data points, secondary information, and system-level feedback.
- **Surface (Obsidian & Midnight):** The base is `#0A0A0B`. Higher elevation elements use `#1A1A2E` with subtle transparency to create depth.
- **Contrast:** Maintain a high contrast ratio for all text elements to ensure readability "at arm's length" during high-activity scenarios.

## Typography
The typography is built around **Archivo Narrow**, a condensed sans-serif that provides a sporty, high-performance aesthetic while maximizing horizontal screen real estate on mobile. 

- **Headlines:** Set with tight leading and slight negative letter-spacing to create a sense of urgency and density.
- **Metrics:** For performance data, use the "Metric" style which leverages italics to imply speed.
- **Labels:** Technical data and metadata utilize **JetBrains Mono** in all-caps to reinforce the precise, developer-grade feel of the interface.

## Layout & Spacing
This design system utilizes a **Fluid Mobile Grid** optimized for thumb-reach and glanceable data.

- **Grid:** A 4-column mobile grid with 20px outer margins.
- **Rhythm:** All spacing is based on a 4px baseline grid. 16px is the standard unit for component internal padding.
- **Safe Zones:** Ensure all primary CTA buttons are placed within the "Natural Thumb Zone" (bottom 1/3 of the screen).
- **Verticality:** Use generous vertical stack spacing (`stack-lg`) between distinct content groups to prevent visual clutter in dark mode.

## Elevation & Depth
Depth is expressed through **Glassmorphism** and **Tonal Luminance** rather than traditional drop shadows.

- **Base Layer:** Pure Obsidian (`#0A0A0B`).
- **Mid Layer (Cards/Lists):** Midnight Navy (`#1A1A2E`) with a 1px inner border of 10% white to define edges.
- **Overlays (Modals/Drawers):** 70% opacity backgrounds with a 20px Backdrop Blur. This keeps the user grounded in their previous context.
- **Glow:** Primary interactive elements (like active progress bars) should have a soft `0px 0px 12px` outer glow using the Primary color at 30% opacity.

## Shapes
The shape language is "Technical-Soft." We use subtle rounding to maintain a modern feel without losing the aggressive, precision-oriented character of the brand.

- **Components:** Standard buttons and cards use `0.25rem` (Soft) corners.
- **Data Indicators:** Progress bars and slider tracks should use fully rounded (pill-shaped) ends to contrast against the rectangular structure of the layout.

## Components
- **Buttons:** Primary buttons are solid Electric Lime with black text. Secondary buttons are "Ghost" style with a 1px Cyan Pulse border.
- **Progress Bars:** Use a "Glow" effect. The filled portion should be a gradient from Secondary to Primary color, with a faint trail effect.
- **Input Fields:** Dark backgrounds with a 1px border that shifts to Cyan Pulse on focus. Labels sit above the field in the "label-caps" mono font.
- **Cards:** Use a subtle glass effect (low opacity fill + blur) to separate content from the deep black background.
- **Chips/Status:** Small, high-contrast badges using monochromatic variants of the primary color to indicate status (e.g., "Active", "Complete").
- **Haptic Feedback:** Every primary action should be accompanied by a "Light" or "Medium" haptic tap to reinforce the tactile nature of the UI.