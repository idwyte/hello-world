/**
 * GIF 4: Day End
 * Progress bar fills → GBA modal slides up (stepped) → earnings count
 * → wages reveal → profit reveal → hold
 *
 * buildFrames(version)
 */
const { createCanvas } = require('canvas');
const {
  W, H, HUD_H,
  PA, PB,
  ZONE_A, ZONE_B,
  getStationsA, getStationsB,
} = require('./theme');
const {
  pxFill, drawGbaBox, drawGbaBar, pxText,
  drawSceneA, drawStationA, drawHudA,
  drawSceneB, drawStationB, drawHudB,
  drawDayEndModal,
} = require('./drawHelpers');

function buildFrames(version = 'vA') {
  const isA     = version === 'vA';
  const p       = isA ? PA : PB;
  const drawScene   = isA ? drawSceneA   : drawSceneB;
  const drawStation = isA ? drawStationA : drawStationB;
  const drawHud     = isA ? drawHudA     : drawHudB;
  const getStations = isA ? getStationsA  : getStationsB;

  const STATIONS = getStations(3);

  const frames = [];
  function frame(fn) {
    const c = createCanvas(W, H);
    const ctx = c.getContext('2d');
    ctx.imageSmoothingEnabled = false;
    fn(ctx);
    frames.push(c);
  }

  function drawBase(ctx, money, rep, dayPct) {
    pxFill(ctx, 0, 0, W, H, p.floorLight || p.floorDark);
    drawScene(ctx);
    drawHud(ctx, { money, rep, day: 1, dayPct, isDayActive: true });
    STATIONS.forEach((st) => drawStation(ctx, { ...st, hasCustomer: false }));
  }

  // ── Phase 1: Day bar fills to 100% (8 frames) ────────────────────────────────
  for (let i = 0; i < 8; i++) {
    const dayPct = 0.88 + i * 0.015;
    frame((ctx) => {
      drawBase(ctx, 530, 6, Math.min(dayPct, 1.0));
      if (i >= 5) {
        drawGbaBox(ctx, W / 2 - 100, H - 48, 200, 40, p);
        pxText(ctx, 'DAY ENDING...', W / 2, H - 22, p.hudText, 10, 'center');
      }
    });
  }

  // ── Phase 2: Modal slides up — stepped 12px per frame (10 frames) ────────────
  for (let i = 0; i < 10; i++) {
    // slideY starts at H/2 and goes to 0 step by step
    const slideY = Math.max(0, Math.round((H / 2) - i * Math.round(H / 2 / 9)));
    frame((ctx) => {
      drawBase(ctx, 530, 6, 1.0);
      drawDayEndModal(ctx, {
        slideY,
        earnings: 0, wages: 0, net: 0,
        showWages: false, showNet: false,
        btnLabel: 'START DAY 2 >',
        version,
      });
    });
  }

  // ── Phase 3: Earnings count up $0 → $187 (10 frames) ─────────────────────────
  for (let i = 0; i < 10; i++) {
    const e = Math.round((i / 9) * 187);
    frame((ctx) => {
      drawBase(ctx, 530, 6, 1.0);
      drawDayEndModal(ctx, {
        slideY: 0,
        earnings: e, wages: 0, net: 0,
        showWages: false, showNet: false,
        btnLabel: 'START DAY 2 >',
        version,
      });
    });
  }

  // ── Phase 4: Wages appear — red flash 2 frames (6 frames) ────────────────────
  for (let i = 0; i < 6; i++) {
    frame((ctx) => {
      drawBase(ctx, 530, 6, 1.0);
      drawDayEndModal(ctx, {
        slideY: 0,
        earnings: 187, wages: 40, net: 0,
        showWages: true, showNet: false,
        btnLabel: 'START DAY 2 >',
        version,
      });
      // Red flash on HUD for first 2 frames
      if (i < 2) {
        ctx.globalAlpha = 0.20 - i * 0.09;
        pxFill(ctx, 0, 0, W, HUD_H, p.red);
        ctx.globalAlpha = 1;
      }
    });
  }

  // ── Phase 5: Net profit revealed (6 frames) ───────────────────────────────────
  for (let i = 0; i < 6; i++) {
    frame((ctx) => {
      drawBase(ctx, 490, 6, 1.0);
      drawDayEndModal(ctx, {
        slideY: 0,
        earnings: 187, wages: 40, net: 147,
        showWages: true, showNet: true,
        btnLabel: 'START DAY 2 >',
        version,
      });
    });
  }

  // ── Phase 6: Hold final (5 frames) ───────────────────────────────────────────
  for (let i = 0; i < 5; i++) {
    frame((ctx) => {
      drawBase(ctx, 490, 6, 1.0);
      drawDayEndModal(ctx, {
        slideY: 0,
        earnings: 187, wages: 40, net: 147,
        showWages: true, showNet: true,
        btnLabel: 'START DAY 2 >',
        version,
      });
    });
  }

  return frames;
}

module.exports = { buildFrames };
