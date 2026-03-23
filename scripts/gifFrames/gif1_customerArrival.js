/**
 * GIF 1: Customer Arrival
 * Empty shop → day opens → Maya walks in (stepped 8px) → idles with patience bar
 * → station picker dialogue → walks to station (stepped)
 *
 * buildFrames(version) — 'vA' = top-down FireRed, 'vB' = front-facing Girl-Game
 */
const { createCanvas } = require('canvas');
const {
  W, H, HUD_H,
  PA, PB,
  ZONE_A, ZONE_B,
  NPC_TOP_W, NPC_TOP_H,
  NPC_FRONT_W, NPC_FRONT_H,
  getStationsA, getStationsB,
  getWaitingA, getWaitingB,
} = require('./theme');
const {
  pxFill, pixelSprite, drawGbaBox, drawGbaBar, pxText,
  drawSceneA, drawStationA, drawNpcA, drawHudA,
  drawSceneB, drawStationB, drawNpcB, drawHudB,
  drawDialogueBox,
} = require('./drawHelpers');
const { MAYA_FRONT, MAYA_TOPDOWN, STAFF_FRONT, STAFF_TOPDOWN } = require('./sprites');

function buildFrames(version = 'vA') {
  const isA   = version === 'vA';
  const p     = isA ? PA : PB;
  const drawScene   = isA ? drawSceneA  : drawSceneB;
  const drawStation = isA ? drawStationA : drawStationB;
  const drawNpc     = isA ? drawNpcA    : drawNpcB;
  const drawHud     = isA ? drawHudA    : drawHudB;
  const getStations = isA ? getStationsA : getStationsB;
  const getWaiting  = isA ? getWaitingA  : getWaitingB;
  const mayaGrid    = isA ? MAYA_TOPDOWN : MAYA_FRONT;
  const npcScale    = isA ? 3 : 4;
  const npcW        = mayaGrid[0].length * npcScale;
  const npcH        = mayaGrid.length   * npcScale;

  const STATIONS = getStations(3);
  const slot0    = getWaiting(0);
  // Station 1 NPC anchor (centre of station minus half sprite width)
  const st0 = STATIONS[0];
  const stNpcX = st0.x + Math.round(st0.w / 2) - Math.round(npcW / 2);
  const stNpcY = isA ? st0.y + 32 + 8 : st0.y + (10 + 30); // below table

  const frames = [];
  function frame(fn) {
    const c = createCanvas(W, H);
    const ctx = c.getContext('2d');
    ctx.imageSmoothingEnabled = false;
    fn(ctx);
    frames.push(c);
  }

  // Helper: draw scene base (bg + all stations + bench already inside drawScene)
  function drawBase(ctx, money, rep, dayPct, isDayActive = true) {
    pxFill(ctx, 0, 0, W, H, p.floorLight || p.floorDark);
    drawScene(ctx);
    drawHud(ctx, { money, rep, day: 1, dayPct, isDayActive });
    STATIONS.forEach((st) => drawStation(ctx, { ...st, hasCustomer: false }));
  }

  // ── Phase 1: Empty shop, day closed (5 frames) ──────────────────────────────
  for (let i = 0; i < 5; i++) {
    frame((ctx) => {
      drawBase(ctx, 500, 0, 0, false);
    });
  }

  // ── Phase 2: Day opens (3 frames) ───────────────────────────────────────────
  for (let i = 0; i < 3; i++) {
    frame((ctx) => {
      drawBase(ctx, 500, 0, i / 40, true);
    });
  }

  // ── Phase 3: Maya walks in — stepped 8px per frame (10 frames) ──────────────
  // Start: off-screen left (vB) or off-screen top (vA)
  for (let i = 0; i < 10; i++) {
    let npcX, npcY;
    if (isA) {
      // Enter from top (door is top-right, but let's walk from off-top-left)
      npcX = slot0.x;
      npcY = isA
        ? HUD_H + 4 + i * Math.round((slot0.y - HUD_H - 4) / 9)
        : slot0.y;
    } else {
      // Enter from left door
      npcX = -npcW + i * Math.round((slot0.x + npcW) / 9);
      npcY = slot0.y;
    }
    frame((ctx) => {
      drawBase(ctx, 500, 0, (3 + i) / 40, true);
      drawNpc(ctx, npcX, npcY, mayaGrid, {
        patienceFrac: 1.0,
        label: i === 9 ? 'MAYA' : '',
      });
      // Arrival notification (GBA dialogue box style)
      if (i === 9) {
        drawGbaBox(ctx, W / 2 - 100, H - 44, 200, 36, p);
        pxText(ctx, 'MAYA ARRIVED!', W / 2, H - 20, p.hudText, 10, 'center');
      }
    });
  }

  // ── Phase 4: Maya idles at waiting spot, patience ticking (10 frames) ────────
  for (let i = 0; i < 10; i++) {
    const bounce   = (i % 2) * 2; // GBA-style 2px bounce every other frame
    const patience = 1.0 - i * 0.012;
    frame((ctx) => {
      drawBase(ctx, 500, 0, (13 + i) / 40, true);
      drawNpc(ctx, slot0.x, slot0.y + bounce, mayaGrid, {
        patienceFrac: patience,
        label: 'MAYA',
      });
      // Tutorial hint box
      if (i < 8) {
        drawGbaBox(ctx, W / 2 - 140, H - 48, 280, 40, p);
        pxText(ctx, 'TAP MAYA TO SEAT HER', W / 2, H - 24, p.hudText, 9, 'center');
      }
    });
  }

  // ── Phase 5: Station picker dialogue appears (5 frames) ──────────────────────
  for (let i = 0; i < 5; i++) {
    const boxH = Math.round((i / 4) * 100);
    frame((ctx) => {
      drawBase(ctx, 500, 0, 0.6, true);
      drawNpc(ctx, slot0.x, slot0.y, mayaGrid, { patienceFrac: 0.88, label: 'MAYA' });
      // Dialogue box slides up
      if (boxH > 20) {
        const bx = W / 2 - 200;
        const by = H - boxH - 8;
        drawGbaBox(ctx, bx, by, 400, boxH, p);
        if (boxH > 60) {
          pxText(ctx, 'SEAT MAYA AT...',  bx + 16, by + 26, p.gold,    10, 'left');
          pxText(ctx, '>  STATION 1',     bx + 16, by + 44, p.hudText, 10, 'left');
          pxText(ctx, '   STATION 2',     bx + 16, by + 58, p.hudText, 10, 'left');
          pxText(ctx, '   STATION 3',     bx + 16, by + 72, p.hudText, 10, 'left');
        }
      }
    });
  }

  // ── Phase 6: Maya walks to station — stepped (10 frames) ─────────────────────
  for (let i = 0; i < 10; i++) {
    const t    = i / 9;
    const npcX = Math.round(slot0.x + t * (stNpcX - slot0.x));
    const npcY = Math.round(slot0.y + t * (stNpcY - slot0.y));
    const progress = i > 7 ? (i - 7) / 2 * 0.06 : 0;
    frame((ctx) => {
      pxFill(ctx, 0, 0, W, H, p.floorLight || p.floorDark);
      drawScene(ctx);
      drawHud(ctx, { money: 500, rep: 0, day: 1, dayPct: 0.65, isDayActive: true });
      STATIONS.forEach((st, idx) =>
        drawStation(ctx, { ...st, hasCustomer: idx === 0 && i > 8, progress })
      );
      drawNpc(ctx, npcX, npcY, mayaGrid, { patienceFrac: 0.86 });
    });
  }

  return frames;
}

module.exports = { buildFrames };
