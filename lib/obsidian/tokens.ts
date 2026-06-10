// Obsidian Kinetic — design tokens.
// Canonical contract for the presentation-layer rebuild (June 2026).
//
// Source of truth: DESIGN.md → mirrored 1:1 by the Figma variable
// collections in file 9j7Lhai90BdMe7xwK4aPbF ("Hone — Obsidian Kinetic").
//
// ⚠ PROVENANCE (review me): DESIGN.md was not present in the repo or the
// upload set, and the shared Figma file exposes only the Cover page. The
// values below are therefore assembled from three sources, marked inline:
//   [F] confirmed from Figma variables on the cover node (9:2)
//   [H] specified verbatim in docs/hone-claude-code-handoff.md §2–3
//   [D] DERIVED — M3 dark-scheme convention anchored on [F]/[H] values.
//       Reconcile against DESIGN.md as soon as it lands; every [D] is a
//       candidate for correction and nothing else may depend on its
//       exact hex.
//
// Naming follows the Material-3-style keys the handoff confirms
// (`surface-container-high`, `on-primary-container`, …), camelCased for
// TS. The NativeWind/Tailwind config maps from this file — never inline
// a raw hex in a component.

export const color = {
  // — Surfaces (Obsidian) —
  background: '#131314', // [F]
  surface: '#131314', // [D] = background per M3 dark
  surfaceContainerLowest: '#0e0e0f', // [D]
  surfaceContainerLow: '#1b1b1d', // [D] · glass-card base, see glass below
  surfaceContainer: '#1f1f21', // [D]
  surfaceContainerHigh: '#28282b', // [D]
  surfaceContainerHighest: '#333336', // [D]
  onSurface: '#e6e3da', // [D] lime-tinted near-white
  onSurfaceVariant: '#c4c9ac', // [F] muted text — lime-tinted grey
  outline: '#8f937f', // [D]
  outlineVariant: '#43463a', // [D] hairlines, inactive ring track

  // — Primary (Electric Lime) —
  primary: '#d9ff4d', // [D] lighter lime for text/icons on dark
  onPrimary: '#1a1c00', // [D]
  primaryContainer: '#c3f400', // [H][F] Electric Lime — button fill, ring arc
  onPrimaryContainer: '#131400', // [H] "near-black text" on lime

  // — Secondary (Cyan Pulse) —
  secondary: '#7df3ff', // [D]
  onSecondary: '#00363b', // [D]
  secondaryContainer: '#00eefc', // [H] Cyan Pulse — ghost border/text, breathing ring
  onSecondaryContainer: '#001417', // [D]

  // — Error (Coral) —
  error: '#ff7a66', // [H] "coral" input error border; exact hex [D]
  onError: '#2d0600', // [D]
  errorContainer: '#5c1505', // [D]
  onErrorContainer: '#ffd9d1', // [D]
} as const;

// Glow is a STATE, not a style (motion spec §4): only the single most
// active element glows. Opacities per spec §3.1 (30% resting → 45%
// approaching completion).
export const glow = {
  primary: color.primaryContainer,
  restingOpacity: 0.3, // [H]
  peakOpacity: 0.45, // [H]
} as const;

// Glass card recipe — [H] §3: surface-container-low @85% + 1px
// 10%-white inner border.
export const glass = {
  fill: 'rgba(27, 27, 29, 0.85)', // surfaceContainerLow @ 85%
  border: 'rgba(255, 255, 255, 0.10)',
  borderWidth: 1,
} as const;

// Modal/sheet backdrop ("blur/overlay" per motion spec §3.5). [D] depth.
export const overlay = {
  scrim: 'rgba(0, 0, 0, 0.6)',
} as const;

// — Spacing — [H] §2, complete.
export const spacing = {
  base: 4,
  gutter: 12,
  containerPadding: 20,
  stackSm: 8,
  stackMd: 16,
  stackLg: 24,
} as const;

// — Radius — [H] §2, complete. Buttons/cards use `xl` (12) per the
// mocks/variables (the DESIGN.md prose's 4px is overruled by the
// handoff note).
export const radius = {
  sm: 2,
  default: 4,
  md: 6,
  lg: 8,
  xl: 12,
  full: 9999,
} as const;

// — Type — [H] §2: Archivo Narrow (display/headlines/body) + JetBrains
// Mono (labels). Family strings match @expo-google-fonts exports; load
// them in the root layout via useFonts. Metrics render UPRIGHT (the
// YAML/mocks win over the DESIGN.md italic prose). Line-heights [D].
export const font = {
  display: 'ArchivoNarrow_700Bold',
  headline: 'ArchivoNarrow_600SemiBold',
  body: 'ArchivoNarrow_400Regular',
  bodyMedium: 'ArchivoNarrow_500Medium',
  mono: 'JetBrainsMono_500Medium',
} as const;

export const type = {
  display: { fontFamily: font.display, fontSize: 48, lineHeight: 52 },
  headlineLg: { fontFamily: font.headline, fontSize: 32, lineHeight: 38 },
  headlineMd: { fontFamily: font.headline, fontSize: 24, lineHeight: 30 },
  bodyLg: { fontFamily: font.body, fontSize: 18, lineHeight: 26 },
  bodyMd: { fontFamily: font.body, fontSize: 16, lineHeight: 24 },
  // [H] mono caps, +10% tracking (12 × 0.10 = 1.2)
  labelCaps: {
    fontFamily: font.mono,
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 1.2,
    textTransform: 'uppercase' as const,
  },
  metricLg: { fontFamily: font.display, fontSize: 40, lineHeight: 44 },
  labelButton: { fontFamily: font.headline, fontSize: 18, lineHeight: 24 },
} as const;

// — Motion — hone-motion-haptic-spec.md §1, complete. Reanimated takes
// the bezier arrays via Easing.bezier(...EASE_OUT).
export const motion = {
  instant: 100,
  base: 250,
  slow: 600,
} as const;

export const easing = {
  out: [0.2, 0, 0, 1] as const, // arriving / responding to touch
  inOut: [0.4, 0, 0.2, 1] as const, // moving between two states
} as const;

// — Haptics — spec §2, the full event table. Components reference these
// names; the mapping to expo-haptics calls lives in lib/obsidian/haptics.ts.
// Down-training screens use AT MOST selectionClick (spec §2 exception).
export const hapticEvents = {
  primaryPress: 'impactLight',
  selection: 'selectionClick',
  contractionRegistered: 'impactMedium',
  phaseChange: 'impactMedium',
  sessionComplete: 'notificationSuccess',
  error: 'notificationWarning',
  referralAcknowledged: null, // deliberately silent — gravity, not gamification
} as const;

// Breathing-ring cycle (down-training) — spec §3.2: clinically-correct
// longer exhale.
export const breathingCycle = {
  inhaleMs: 4000,
  holdMs: 2000,
  exhaleMs: 6000,
} as const;
