/**
 * Resolved color constants matching `tailwind.config.js` brand primitives
 * and semantic aliases. Use these in places that can't consume Tailwind
 * classes — primarily SVG attributes (`fill`, `stroke`) and Reanimated
 * interpolators that need raw hex values.
 *
 * Source of truth: Figma `0:1 Foundations` page. Keep in sync if Figma
 * changes — there's no automatic codegen yet.
 */

export const brand = {
  bg: '#0B0B0F',
  surface: '#15151C',
  surface2: '#1E1E27',
  border: '#2A2A36',
  ink: '#F5F5F7',
  muted: '#8A8A95',
  accent: '#7C5CFF',
  accentSoft: '#5B45C4',
  success: '#3FB984',
  danger: '#E5484D',
} as const;

export const semantic = {
  textPrimary: brand.ink,
  textMuted: brand.muted,
  textInverse: brand.bg,
  surfaceCanvas: brand.bg,
  surfaceRaised: brand.surface,
  surfaceSunken: brand.surface2,
  borderDefault: brand.border,
  interactivePrimary: brand.accent,
  interactivePrimaryPressed: brand.accentSoft,
  feedbackSuccess: brand.success,
  feedbackDanger: brand.danger,
} as const;
