import { SkinToneId } from '../types/CustomerTypes';

// ─── Skin Tones ────────────────────────────────────────────────────────────────
export const SKIN_TONES: Record<SkinToneId, string> = {
  tone01: '#FDDBB4',
  tone02: '#F5C89A',
  tone03: '#EBB882',
  tone04: '#D4956A',
  tone05: '#C68642',
  tone06: '#B5714A',
  tone07: '#9B6040',
  tone08: '#7A4A2A',
  tone09: '#5C3317',
  tone10: '#4A2010',
  tone11: '#3D1A0A',
  tone12: '#2A0F05',
};

export const HAIR_COLOR_PRESETS: Record<string, string> = {
  black:       '#1A1A1A',
  darkBrown:   '#3B1F0D',
  warmBrown:   '#8B4513',
  auburn:      '#A0522D',
  golden:      '#DAA520',
  blonde:      '#F5DEB3',
  strawberry:  '#FFB347',
  red:         '#CC2200',
  pink:        '#FF69B4',
  purple:      '#9B59B6',
  blue:        '#4169E1',
  silver:      '#C0C0C0',
};

// ─── Salon Environment — Gen Z palette ─────────────────────────────────────────
export const SALON = {
  wallRose:       '#FDF2F8',  // barely-pink wall
  wallCream:      '#FFFFFF',  // pure white accents
  floorBlush:     '#FCE7F3',  // baby pink floor
  floorGrout:     '#F9A8D4',  // bright pink grout
  furniture:      '#7C3AED',  // vivid violet furniture
  furnitureLight: '#EDE9FE',  // pale lavender surfaces
  accentSage:     '#6EE7B7',  // mint green
  accentLavender: '#C4B5FD',  // vivid lavender
} as const;

// ─── UI Chrome — Gen Z palette ──────────────────────────────────────────────────
export const UI = {
  panelBg:        '#FFFFFF',  // clean white cards
  panelBorder:    '#FBCFE8',  // pink-200
  textPrimary:    '#18181B',  // zinc-900 near-black
  textSecondary:  '#71717A',  // zinc-500
  textMuted:      '#A1A1AA',  // zinc-400
  btnActive:      '#EC4899',  // hot pink (pink-500)
  btnHover:       '#BE185D',  // deep hot pink
  btnDisabled:    '#FBCFE8',  // pink-200
  btnText:        '#FFFFFF',
  success:        '#10B981',  // emerald-500
  warning:        '#F59E0B',  // amber-500
  danger:         '#F43F5E',  // rose-500
  gold:           '#FBBF24',  // amber-400
  hudBg:          '#18103A',  // deep purple-black
  hudText:        '#F5F3FF',  // violet-50
  bg:             '#FAFAFA',  // zinc-50 app background
} as const;

// ─── Typography ────────────────────────────────────────────────────────────────
export const FONT = {
  xs:   10,
  sm:   12,
  md:   14,
  lg:   16,
  xl:   20,
  xxl:  24,
  heading: 28,
} as const;

export const SPACING = {
  xs:  4,
  sm:  8,
  md:  12,
  lg:  16,
  xl:  24,
  xxl: 32,
} as const;

// Rounder radii for Gen Z bubble aesthetic
export const RADIUS = {
  sm:  8,
  md:  16,
  lg:  24,
  full: 999,
} as const;
