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

// ─── Salon Environment ─────────────────────────────────────────────────────────
export const SALON = {
  wallRose:     '#E8C4C4',
  wallCream:    '#FAF3E0',
  floorBlush:   '#F0D5D5',
  floorGrout:   '#D4B5A0',
  furniture:    '#8B6332',
  furnitureLight: '#F5F5F0',
  accentSage:   '#A8C5A0',
  accentLavender: '#C4A8C5',
} as const;

// ─── UI Chrome ─────────────────────────────────────────────────────────────────
export const UI = {
  panelBg:        '#FFF0F5',
  panelBorder:    '#E8B4C0',
  textPrimary:    '#3D2B1F',
  textSecondary:  '#7A5C4A',
  textMuted:      '#B0967E',
  btnActive:      '#E8748A',
  btnHover:       '#C4556A',
  btnDisabled:    '#F0A0B0',
  btnText:        '#FFFFFF',
  success:        '#7CB97C',
  warning:        '#E8A85A',
  danger:         '#E87474',
  gold:           '#DAA520',
  hudBg:          '#3D2B1F',
  hudText:        '#FFF0F5',
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

export const RADIUS = {
  sm:  6,
  md:  12,
  lg:  18,
  full: 999,
} as const;
