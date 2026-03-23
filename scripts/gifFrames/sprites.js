/**
 * GBA pixel sprite arrays — 16-bit FireRed / Girl-Game aesthetic
 *
 * T = null (transparent, skip pixel)
 * O = 'O'  (outline token — replaced with palette.outline at render time)
 *
 * MAYA_FRONT   — 14 cols × 18 rows (front-facing, vB 4× scale → 56×72 px)
 * MAYA_TOPDOWN — 10 cols × 12 rows (top-down,    vA 3× scale → 30×36 px)
 * STAFF_FRONT  — 14 cols × 18 rows (front-facing, vB)
 * STAFF_TOPDOWN— 10 cols × 12 rows (top-down,    vA)
 */

const T = null;
const O = 'O';

// ── Maya color palette ────────────────────────────────────────────────────────
const MH = '#F060A0'; // hair  — candy pink
const SK = '#F8C898'; // skin  — warm peach
const MB = '#F0A0A0'; // blush — rose cheek
const MS = '#E02878'; // shirt — hot pink
const MP = '#7828A0'; // skirt — purple
const MZ = '#281018'; // shoes — near-black

// ── Maya front-facing (14 × 18) ───────────────────────────────────────────────
const MAYA_FRONT = [
  /* 0  hair top  */ [T,  T,  T,  MH, MH, MH, MH, MH, MH, MH, MH, T,  T,  T ],
  /* 1  hair wide */ [T,  MH, MH, MH, MH, MH, MH, MH, MH, MH, MH, MH, MH, T ],
  /* 2  head top  */ [T,  O,  SK, SK, SK, SK, SK, SK, SK, SK, SK, SK, O,  T ],
  /* 3  head      */ [O,  SK, SK, SK, SK, SK, SK, SK, SK, SK, SK, SK, SK, O ],
  /* 4  eyes      */ [O,  SK, SK, O,  SK, SK, SK, SK, SK, SK, O,  SK, SK, O ],
  /* 5  eyes      */ [O,  SK, SK, O,  SK, SK, SK, SK, SK, SK, O,  SK, SK, O ],
  /* 6  blush     */ [O,  SK, MB, SK, SK, SK, SK, SK, SK, SK, SK, MB, SK, O ],
  /* 7  mouth     */ [O,  SK, SK, SK, SK, O,  SK, SK, O,  SK, SK, SK, SK, O ],
  /* 8  chin      */ [T,  O,  SK, SK, SK, SK, SK, SK, SK, SK, SK, SK, O,  T ],
  /* 9  neck      */ [T,  T,  O,  MS, MS, MS, MS, MS, MS, MS, MS, O,  T,  T ],
  /* 10 torso     */ [T,  O,  MS, MS, MS, MS, MS, MS, MS, MS, MS, MS, O,  T ],
  /* 11 torso     */ [T,  O,  MS, MS, MS, MS, MS, MS, MS, MS, MS, MS, O,  T ],
  /* 12 torso     */ [T,  O,  MS, MS, MS, MS, MS, MS, MS, MS, MS, MS, O,  T ],
  /* 13 skirt     */ [T,  O,  MP, MP, MP, MP, MP, MP, MP, MP, MP, MP, O,  T ],
  /* 14 skirt     */ [T,  O,  MP, MP, MP, MP, MP, MP, MP, MP, MP, MP, O,  T ],
  /* 15 skirt bot */ [O,  MP, MP, MP, MP, MP, MP, MP, MP, MP, MP, MP, MP, O ],
  /* 16 legs      */ [O,  SK, SK, O,  T,  T,  T,  T,  T,  T,  O,  SK, SK, O ],
  /* 17 shoes     */ [O,  MZ, MZ, O,  T,  T,  T,  T,  T,  T,  O,  MZ, MZ, O ],
];

// ── Maya top-down (10 × 12) ───────────────────────────────────────────────────
const MAYA_TOPDOWN = [
  /* 0  hair back */ [T,  T,  MH, MH, MH, MH, MH, MH, T,  T ],
  /* 1  hair      */ [T,  MH, MH, MH, MH, MH, MH, MH, MH, T ],
  /* 2  face top  */ [O,  SK, SK, SK, SK, SK, SK, SK, SK, O ],
  /* 3  eyes      */ [O,  SK, O,  SK, SK, SK, SK, O,  SK, O ],
  /* 4  face mid  */ [O,  SK, SK, SK, SK, SK, SK, SK, SK, O ],
  /* 5  mouth     */ [O,  SK, SK, O,  SK, SK, O,  SK, SK, O ],
  /* 6  chin      */ [T,  O,  SK, SK, SK, SK, SK, SK, O,  T ],
  /* 7  body      */ [T,  O,  MS, MS, MS, MS, MS, MS, O,  T ],
  /* 8  skirt hi  */ [T,  O,  MS, MP, MP, MP, MP, MS, O,  T ],
  /* 9  skirt     */ [T,  O,  MP, MP, MP, MP, MP, MP, O,  T ],
  /* 10 skirt bot */ [T,  O,  MP, MP, MP, MP, MP, MP, O,  T ],
  /* 11 feet      */ [T,  T,  O,  MZ, T,  T,  MZ, O,  T,  T ],
];

// ── Staff color palette ───────────────────────────────────────────────────────
const SH = '#101820'; // hair  — dark navy
const SA = '#28A090'; // apron — teal
const SS = '#F0D8B0'; // skin  — lighter warm
const SP = '#182030'; // pants — dark navy
const SZ = '#101820'; // shoes
const SW = '#D8F0EC'; // apron highlight

// ── Staff front-facing (14 × 18) ─────────────────────────────────────────────
const STAFF_FRONT = [
  /* 0  hair      */ [T,  T,  SH, SH, SH, SH, SH, SH, SH, SH, SH, SH, T,  T ],
  /* 1  hair wide */ [T,  SH, SH, SH, SH, SH, SH, SH, SH, SH, SH, SH, SH, T ],
  /* 2  head top  */ [T,  O,  SS, SS, SS, SS, SS, SS, SS, SS, SS, SS, O,  T ],
  /* 3  head      */ [O,  SS, SS, SS, SS, SS, SS, SS, SS, SS, SS, SS, SS, O ],
  /* 4  eyes      */ [O,  SS, SS, O,  SS, SS, SS, SS, SS, SS, O,  SS, SS, O ],
  /* 5  eyes      */ [O,  SS, SS, O,  SS, SS, SS, SS, SS, SS, O,  SS, SS, O ],
  /* 6  face low  */ [O,  SS, SS, SS, SS, SS, SS, SS, SS, SS, SS, SS, SS, O ],
  /* 7  chin      */ [T,  O,  SS, SS, SS, O,  SS, SS, O,  SS, SS, SS, O,  T ],
  /* 8  apron     */ [T,  O,  SA, SA, SA, SA, SA, SA, SA, SA, SA, SA, O,  T ],
  /* 9  apron hi  */ [T,  O,  SA, SW, SA, SA, SA, SA, SA, SA, SW, SA, O,  T ],
  /* 10 apron     */ [T,  O,  SA, SA, SA, SA, SA, SA, SA, SA, SA, SA, O,  T ],
  /* 11 apron     */ [T,  O,  SA, SA, SA, SA, SA, SA, SA, SA, SA, SA, O,  T ],
  /* 12 apron     */ [T,  O,  SA, SA, SA, SA, SA, SA, SA, SA, SA, SA, O,  T ],
  /* 13 pants     */ [T,  O,  SP, SP, SP, SP, SP, SP, SP, SP, SP, SP, O,  T ],
  /* 14 pants     */ [T,  O,  SP, SP, SP, SP, SP, SP, SP, SP, SP, SP, O,  T ],
  /* 15 pants bot */ [O,  SP, SP, SP, SP, SP, SP, SP, SP, SP, SP, SP, SP, O ],
  /* 16 legs      */ [O,  SS, SS, O,  T,  T,  T,  T,  T,  T,  O,  SS, SS, O ],
  /* 17 shoes     */ [O,  SZ, SZ, O,  T,  T,  T,  T,  T,  T,  O,  SZ, SZ, O ],
];

// ── Staff top-down (10 × 12) ──────────────────────────────────────────────────
const STAFF_TOPDOWN = [
  /* 0  hair      */ [T,  T,  SH, SH, SH, SH, SH, SH, T,  T ],
  /* 1  hair wide */ [T,  SH, SH, SH, SH, SH, SH, SH, SH, T ],
  /* 2  face top  */ [O,  SS, SS, SS, SS, SS, SS, SS, SS, O ],
  /* 3  eyes      */ [O,  SS, O,  SS, SS, SS, SS, O,  SS, O ],
  /* 4  face mid  */ [O,  SS, SS, SS, SS, SS, SS, SS, SS, O ],
  /* 5  face low  */ [O,  SS, SS, SS, SS, SS, SS, SS, SS, O ],
  /* 6  chin      */ [T,  O,  SS, SS, SS, SS, SS, SS, O,  T ],
  /* 7  apron     */ [T,  O,  SA, SA, SA, SA, SA, SA, O,  T ],
  /* 8  apron hi  */ [T,  O,  SA, SW, SA, SA, SW, SA, O,  T ],
  /* 9  apron bot */ [T,  O,  SA, SA, SA, SA, SA, SA, O,  T ],
  /* 10 legs      */ [T,  O,  SP, SP, SP, SP, SP, SP, O,  T ],
  /* 11 feet      */ [T,  T,  O,  SZ, T,  T,  SZ, O,  T,  T ],
];

module.exports = { MAYA_FRONT, MAYA_TOPDOWN, STAFF_FRONT, STAFF_TOPDOWN };
