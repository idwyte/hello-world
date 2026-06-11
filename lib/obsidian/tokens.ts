// Obsidian Kinetic — design tokens.
// Canonical contract for the presentation-layer rebuild (June 2026).
//
// Source of truth: DESIGN.md (repo root) — all 47 color tokens, the type
// scale, radius and spacing are transcribed verbatim from its YAML
// frontmatter. The Figma variable collections in file 9j7Lhai90BdMe7xwK4aPbF
// mirror the same values. Two deliberate overrides, both flagged in
// docs/hone-claude-code-handoff.md §2 (mocks/variables win over the
// DESIGN.md prose):
//   · buttons/cards use radius.xl (12), not the prose's 0.25rem
//   · metrics render UPRIGHT, not italic
// One addition from the handoff: the `label-button` type style (18
// SemiBold) — it isn't in DESIGN.md's frontmatter but is specified in
// the handoff's 8-style list.
//
// NativeWind/Tailwind config maps from this file — never inline a raw
// hex in a component.

export const color = {
  // — Surfaces (Obsidian) —
  surface: '#131314',
  surfaceDim: '#131314',
  surfaceBright: '#3a393a',
  surfaceContainerLowest: '#0e0e0f',
  surfaceContainerLow: '#1c1b1c',
  surfaceContainer: '#201f20',
  surfaceContainerHigh: '#2a2a2b',
  surfaceContainerHighest: '#353436',
  surfaceVariant: '#353436',
  onSurface: '#e5e2e3',
  onSurfaceVariant: '#c4c9ac',
  inverseSurface: '#e5e2e3',
  inverseOnSurface: '#313031',
  outline: '#8e9379',
  outlineVariant: '#444933',
  surfaceTint: '#abd600',
  background: '#131314',
  onBackground: '#e5e2e3',

  // — Primary (Electric Lime) —
  primary: '#ffffff',
  onPrimary: '#283500',
  primaryContainer: '#c3f400', // Electric Lime — fills, ring arc, glow
  onPrimaryContainer: '#556d00',
  inversePrimary: '#506600',
  primaryFixed: '#c3f400',
  primaryFixedDim: '#abd600',
  onPrimaryFixed: '#161e00', // near-black — the label on lime fills
  onPrimaryFixedVariant: '#3c4d00',

  // — Secondary (Cyan Pulse) —
  secondary: '#d3fbff',
  onSecondary: '#00363a',
  secondaryContainer: '#00eefc', // Cyan Pulse — ghost border/text, breathing ring
  onSecondaryContainer: '#00686f',
  secondaryFixed: '#7df4ff',
  secondaryFixedDim: '#00dbe9',
  onSecondaryFixed: '#002022',
  onSecondaryFixedVariant: '#004f54',

  // — Tertiary —
  tertiary: '#ffffff',
  onTertiary: '#2f2e43',
  tertiaryContainer: '#e2e0fc',
  onTertiaryContainer: '#63627a',
  tertiaryFixed: '#e2e0fc',
  tertiaryFixedDim: '#c6c4df',
  onTertiaryFixed: '#1a1a2e',
  onTertiaryFixedVariant: '#45455b',

  // — Error —
  error: '#ffb4ab',
  onError: '#690005',
  errorContainer: '#93000a',
  onErrorContainer: '#ffdad6',
} as const;

// Glow is a STATE, not a style (motion spec §4): only the single most
// active element glows. DESIGN.md prose: 0 0 12px outer glow, primary
// at 30%; motion spec §3.1: 30% resting → 45% approaching completion.
export const glow = {
  primary: color.primaryContainer,
  radius: 12,
  restingOpacity: 0.3,
  peakOpacity: 0.45,
} as const;

// Glass card recipe — handoff §3: surface-container-low @85% + 1px
// 10%-white inner border.
export const glass = {
  fill: 'rgba(28, 27, 28, 0.85)', // surfaceContainerLow @ 85%
  border: 'rgba(255, 255, 255, 0.10)',
  borderWidth: 1,
} as const;

// Modal/sheet backdrop — DESIGN.md prose: 70% opacity + 20px backdrop
// blur ("blur/overlay" in the motion spec §3.5).
export const overlay = {
  scrim: 'rgba(0, 0, 0, 0.7)',
  blurRadius: 20,
} as const;

// — Spacing — DESIGN.md frontmatter, complete.
export const spacing = {
  base: 4,
  gutter: 12,
  containerPadding: 20,
  stackSm: 8,
  stackMd: 16,
  stackLg: 24,
} as const;

// — Radius — DESIGN.md frontmatter (rem × 16). Buttons/cards use `xl`
// (12) per the mocks/variables.
export const radius = {
  sm: 2,
  default: 4,
  md: 6,
  lg: 8,
  xl: 12,
  full: 9999,
} as const;

// — Type — DESIGN.md frontmatter. Archivo Narrow (display/headlines/
// body) + JetBrains Mono (labels). Family strings match the
// @expo-google-fonts exports; load via useFonts in the root layout.
// letterSpacing converted em → px at the style's own font size.
// Metrics UPRIGHT (handoff override of the prose italic).
export const font = {
  bold: 'ArchivoNarrow_700Bold',
  semibold: 'ArchivoNarrow_600SemiBold',
  regular: 'ArchivoNarrow_400Regular',
  mono: 'JetBrainsMono_500Medium',
} as const;

export const type = {
  display: {
    fontFamily: font.bold,
    fontSize: 48,
    lineHeight: 52,
    letterSpacing: -0.96, // -0.02em
  },
  headlineLg: {
    fontFamily: font.bold,
    fontSize: 32,
    lineHeight: 36,
    letterSpacing: -0.32, // -0.01em
  },
  headlineMd: { fontFamily: font.semibold, fontSize: 24, lineHeight: 28 },
  bodyLg: { fontFamily: font.regular, fontSize: 18, lineHeight: 26 },
  bodyMd: { fontFamily: font.regular, fontSize: 16, lineHeight: 24 },
  labelCaps: {
    fontFamily: font.mono,
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 1.2, // 0.1em
    textTransform: 'uppercase' as const,
  },
  metricLg: { fontFamily: font.bold, fontSize: 40, lineHeight: 40 },
  // Handoff §2 addition (not in DESIGN.md frontmatter): button labels.
  labelButton: { fontFamily: font.semibold, fontSize: 18, lineHeight: 24 },
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
