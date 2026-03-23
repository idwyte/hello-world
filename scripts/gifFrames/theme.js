// Mirror of constants/theme.ts + sceneLayout.ts for the Node.js GIF generator
// Updated for Gen Z palette + landscape dimensions

const UI = {
  hudBg:        '#18103A',  // deep purple-black
  hudText:      '#F5F3FF',  // violet-50
  panelBg:      '#FFFFFF',
  panelBorder:  '#FBCFE8',
  btnActive:    '#EC4899',  // hot pink
  btnHover:     '#BE185D',
  btnDisabled:  '#FBCFE8',
  btnText:      '#FFFFFF',
  textPrimary:  '#18181B',  // zinc-900
  textSecondary:'#71717A',  // zinc-500
  textMuted:    '#A1A1AA',  // zinc-400
  success:      '#10B981',  // emerald
  warning:      '#F59E0B',  // amber
  danger:       '#F43F5E',  // rose
  gold:         '#FBBF24',  // amber-400
  bg:           '#FAFAFA',
};

const SALON = {
  wallRose:       '#FDF2F8',
  wallCream:      '#FFFFFF',
  floorBlush:     '#FCE7F3',
  floorGrout:     '#F9A8D4',
  furniture:      '#7C3AED',  // vivid violet
  furnitureLight: '#EDE9FE',  // pale lavender
  accentSage:     '#6EE7B7',  // mint
  accentLavender: '#C4B5FD',  // lavender
};

const FONT = {
  xs: 10, sm: 12, md: 14, lg: 16, xl: 20, xxl: 24, heading: 28,
};

const SPACING = {
  xs: 4, sm: 8, md: 12, lg: 16, xl: 20, xxl: 32,
};

const RADIUS = {
  sm: 8, md: 16, lg: 24, full: 999,
};

// ── Landscape iPhone 14 dimensions ────────────────────────────────────────────
const W = 844;   // landscape width
const H = 390;   // landscape height

// Scene dimensions (below HUD, no tab bar rendered in GIFs)
const HUD_H   = 44;
const SCENE_W = W;
const SCENE_H = H - HUD_H;   // 346px

// Scene zones (canvas-absolute: add HUD_H to all y values)
const ZONE = {
  wallH:     Math.round(SCENE_H * 0.72),  // 249
  floorY:    HUD_H + Math.round(SCENE_H * 0.72),  // 293

  waitingX:   60,
  waitingY:   HUD_H + Math.round(SCENE_H * 0.52),  // 224
  slotSpacing: 64,

  stationStartX: Math.round(W * 0.22),    // 186
  stationEndX:   Math.round(W * 0.76),    // 641
  stationY:      HUD_H + Math.round(SCENE_H * 0.25), // 131

  doorX: 0,
  doorY: HUD_H + Math.round(SCENE_H * 0.18),  // 106
  doorH: Math.round(SCENE_H * 0.58),           // 201
  doorW: 52,

  recepX: Math.round(W * 0.80),   // 675
  recepY: HUD_H + Math.round(SCENE_H * 0.15), // 96
  recepW: Math.round(W * 0.19),   // 160
  recepH: Math.round(SCENE_H * 0.50), // 173
};

// NPC sprite size
const NPC_W = 56;
const NPC_H = 72;

// Station positions for N stations (returns canvas x/y for NPC placement + fixture dims)
function getStationPositions(count) {
  const usable = ZONE.stationEndX - ZONE.stationStartX;
  const spacing = usable / Math.max(1, count);
  return Array.from({ length: count }, (_, i) => ({
    npcX:     ZONE.stationStartX + spacing * i + spacing / 2 - NPC_W / 2,
    npcY:     ZONE.stationY,
    fixtureX: ZONE.stationStartX + spacing * i,
    fixtureW: spacing - 8,
  }));
}

function getWaitingPos(slotIndex) {
  return {
    x: ZONE.waitingX + slotIndex * ZONE.slotSpacing,
    y: ZONE.waitingY,
  };
}

module.exports = { UI, SALON, FONT, SPACING, RADIUS, W, H, HUD_H, SCENE_H, ZONE, NPC_W, NPC_H, getStationPositions, getWaitingPos };
