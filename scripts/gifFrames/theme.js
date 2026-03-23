/**
 * GBA / 16-bit pixel art theme — two art direction versions
 *
 * Version A: "FireRed Interior" — top-down, warm peachy tones
 * Version B: "GBA Girl Game"    — front-facing 3/4, candy pink-purple
 */

const PIXEL_SCALE = 4;   // canvas px per GBA pixel
const TILE_SIZE   = 16;  // GBA px per tile (→ 64 canvas px at 4×)

const W      = 844;
const H      = 390;
const HUD_H  = 40;        // 10 GBA rows × 4 px each
const SCENE_H = H - HUD_H; // 350

// ── Version A palette: FireRed Interior ─────────────────────────────────────
const PA = {
  outline:    '#181010',
  wall:       '#E8A898',
  wallDark:   '#C06850',
  floorLight: '#F8F0D0',
  floorDark:  '#D0B880',
  woodDark:   '#804020',
  woodLight:  '#B06030',
  chairColor: '#A04820',
  hudBg:      '#282848',
  hudText:    '#F8F8C8',
  hudAccent:  '#80A0F8',
  hudBar:     '#E08020',
  hudBarBg:   '#484060',
  green:      '#18B040',
  red:        '#E01818',
  gold:       '#F8C000',
  white:      '#F8F8F0',
  black:      '#181010',
};

// ── Version B palette: GBA Girl Game ─────────────────────────────────────────
const PB = {
  outline:        '#180820',
  wall:           '#D098C8',
  wallDark:       '#9860A8',
  wallAccent:     '#F0B8E0',
  floorLight:     '#F0E0F0',
  floorDark:      '#C0A0D0',
  furnitureDark:  '#502878',
  furnitureLight: '#C898F8',
  hudBg:          '#200840',
  hudText:        '#F8D8F8',
  hudBorder:      '#F020A0',
  hudBar:         '#F020A0',
  hudBarBg:       '#481858',
  green:          '#10D850',
  red:            '#F01848',
  gold:           '#F8C808',
  white:          '#F8F0F8',
  black:          '#180820',
};

// ── Zone constants ────────────────────────────────────────────────────────────

// Version A: top-down — shallow wall band, large floor area
const ZONE_A = {
  wallH:         Math.round(SCENE_H * 0.18),       // 63
  wallY:         HUD_H,
  floorY:        HUD_H + Math.round(SCENE_H * 0.18),

  stationY:      HUD_H + Math.round(SCENE_H * 0.24),
  stationStartX: 100,
  stationEndX:   W - 100,

  waitingX:      36,
  waitingY:      H - 80,
  slotSpacing:   68,

  doorX:         W - 64,
  doorY:         HUD_H + 8,
  doorW:         56,
  doorH:         Math.round(SCENE_H * 0.16),
};

// Version B: front-facing — tall wall, thin floor strip
const ZONE_B = {
  wallH:         Math.round(SCENE_H * 0.72),       // 252
  wallY:         HUD_H,
  floorY:        HUD_H + Math.round(SCENE_H * 0.72),

  stationY:      HUD_H + Math.round(SCENE_H * 0.28),
  stationStartX: 72,
  stationEndX:   W - 72,

  waitingX:      24,
  waitingY:      HUD_H + Math.round(SCENE_H * 0.52),
  slotSpacing:   80,

  doorX:         0,
  doorY:         HUD_H + Math.round(SCENE_H * 0.14),
  doorW:         44,
  doorH:         Math.round(SCENE_H * 0.56),
};

// NPC canvas pixel dimensions
const NPC_TOP_W  = 10 * 3; // 30 (3× scale for top-down)
const NPC_TOP_H  = 12 * 3; // 36
const NPC_FRONT_W = 14 * 4; // 56 (4× scale for front-facing)
const NPC_FRONT_H = 18 * 4; // 72

// ── Layout helpers ────────────────────────────────────────────────────────────

function getStationsA(count = 3) {
  const usable  = ZONE_A.stationEndX - ZONE_A.stationStartX;
  const spacing = Math.floor(usable / count);
  return Array.from({ length: count }, (_, i) => ({
    x: ZONE_A.stationStartX + spacing * i + Math.floor(spacing / 2) - 32,
    y: ZONE_A.stationY,
    w: 64,
  }));
}

function getStationsB(count = 3) {
  const usable  = ZONE_B.stationEndX - ZONE_B.stationStartX;
  const spacing = Math.floor(usable / count);
  return Array.from({ length: count }, (_, i) => ({
    x: ZONE_B.stationStartX + spacing * i,
    y: ZONE_B.stationY,
    w: spacing - 12,
  }));
}

function getWaitingA(slotIndex) {
  return {
    x: ZONE_A.waitingX + slotIndex * ZONE_A.slotSpacing,
    y: ZONE_A.waitingY,
  };
}

function getWaitingB(slotIndex) {
  return {
    x: ZONE_B.waitingX + slotIndex * ZONE_B.slotSpacing,
    y: ZONE_B.waitingY,
  };
}

module.exports = {
  PIXEL_SCALE, TILE_SIZE,
  W, H, HUD_H, SCENE_H,
  PA, PB,
  ZONE_A, ZONE_B,
  NPC_TOP_W, NPC_TOP_H, NPC_FRONT_W, NPC_FRONT_H,
  getStationsA, getStationsB,
  getWaitingA, getWaitingB,
};
