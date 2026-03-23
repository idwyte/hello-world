/**
 * GIF 3: Review Board
 * 2 existing reviews visible → service finishes → money flashes → new 5-star
 * review slides in (stepped) → rep ticks up
 *
 * buildFrames(version)
 */
const { createCanvas } = require('canvas');
const {
  W, H, HUD_H,
  PA, PB,
  ZONE_A, ZONE_B,
  getStationsA, getStationsB,
  getWaitingA, getWaitingB,
} = require('./theme');
const {
  pxFill, pixelSprite, drawGbaBox, drawGbaBar, pxText,
  drawSceneA, drawStationA, drawNpcA, drawHudA,
  drawSceneB, drawStationB, drawNpcB, drawHudB,
  drawStars,
} = require('./drawHelpers');
const { MAYA_FRONT, MAYA_TOPDOWN } = require('./sprites');

// Draw a single GBA-style review card
function drawReviewCard(ctx, x, y, { stars, reviewerName, text, p }) {
  const w = 240; const h = 52;
  drawGbaBox(ctx, x, y, w, h, p);
  drawStars(ctx, x + 12, y + 24, stars, p);
  pxText(ctx, reviewerName, x + 12, y + 36, p.hudText, 8, 'left');
  // Clip text to 22 chars
  const short = text.length > 22 ? text.slice(0, 22) + '...' : text;
  pxText(ctx, short, x + 12, y + 48, p.hudBarBg, 8, 'left');
}

function buildFrames(version = 'vA') {
  const isA     = version === 'vA';
  const p       = isA ? PA : PB;
  const drawScene   = isA ? drawSceneA  : drawSceneB;
  const drawStation = isA ? drawStationA : drawStationB;
  const drawNpc     = isA ? drawNpcA    : drawNpcB;
  const drawHud     = isA ? drawHudA    : drawHudB;
  const getStations = isA ? getStationsA : getStationsB;
  const mayaGrid    = isA ? MAYA_TOPDOWN : MAYA_FRONT;
  const npcScale    = isA ? 3 : 4;
  const npcW        = mayaGrid[0].length * npcScale;

  const STATIONS = getStations(3);
  const st0      = STATIONS[0];
  const mayaX    = st0.x + Math.round(st0.w / 2) - Math.round(npcW / 2);
  const mayaY    = isA ? st0.y + 42 : st0.y + (10 + 30);

  // Review data
  const REV1 = { stars: 3, reviewerName: 'PRIYA S.', text: 'Waited long... nails ok' };
  const REV2 = { stars: 3, reviewerName: 'KEZIA M.', text: 'Color a bit off' };
  const NEW  = { stars: 5, reviewerName: 'MAYA T.',  text: 'Perfect coffin! Love it' };

  const CARD_X = W - 256;

  const frames = [];
  function frame(fn) {
    const c = createCanvas(W, H);
    const ctx = c.getContext('2d');
    ctx.imageSmoothingEnabled = false;
    fn(ctx);
    frames.push(c);
  }

  function drawBase(ctx, money, rep, dayPct, stProgress) {
    pxFill(ctx, 0, 0, W, H, p.floorLight || p.floorDark);
    drawScene(ctx);
    drawHud(ctx, { money, rep, day: 1, dayPct, isDayActive: true });
    STATIONS.forEach((st, i) =>
      drawStation(ctx, { ...st, hasCustomer: i === 0, progress: i === 0 ? stProgress : 0 })
    );
    drawNpc(ctx, mayaX, mayaY, mayaGrid, { patienceFrac: 1 });
  }

  // ── Phase 1: 2 reviews visible, service near complete (8 frames) ─────────────
  for (let i = 0; i < 8; i++) {
    frame((ctx) => {
      drawBase(ctx, 502, 4, 0.82, 0.78);
      drawReviewCard(ctx, CARD_X, H - 120, { ...REV1, p });
      drawReviewCard(ctx, CARD_X, H - 64,  { ...REV2, p });
    });
  }

  // ── Phase 2: Service finishes — money count up (6 frames) ────────────────────
  const moneySteps = [502, 510, 520, 526, 528, 530];
  for (let i = 0; i < 6; i++) {
    frame((ctx) => {
      drawBase(ctx, moneySteps[i], 4, 0.84, 0.90 + i * 0.02);
      drawReviewCard(ctx, CARD_X, H - 120, { ...REV1, p });
      drawReviewCard(ctx, CARD_X, H - 64,  { ...REV2, p });
      // Gold "+$28" floating text
      if (i < 4) {
        const gy = isA ? ZONE_A.stationY - 20 - i * 10 : ZONE_B.stationY - 20 - i * 10;
        pxFill(ctx, W / 2 - 52, gy - 12, 104, 16, p.hudBg);
        pxText(ctx, `+$28`, W / 2, gy, p.gold, 12, 'center');
      }
    });
  }

  // ── Phase 3: New 5-star review slides in from right — stepped (10 frames) ──
  for (let i = 0; i < 10; i++) {
    // Stepped: move 24px per frame from off-right
    const startX = W + 8;
    const cardX  = Math.max(CARD_X, startX - i * Math.round((startX - CARD_X) / 9));
    frame((ctx) => {
      drawBase(ctx, 530, 4, 0.87, 1.0);
      drawReviewCard(ctx, CARD_X, H - 120, { ...REV1, p });
      drawReviewCard(ctx, CARD_X, H - 64,  { ...REV2, p });
      drawReviewCard(ctx, cardX,  H - 176, { ...NEW,  p });
    });
  }

  // ── Phase 4: Rep ticks up 4 → 6 (6 frames) ───────────────────────────────────
  const repSteps = [4, 4, 5, 5, 6, 6];
  for (let i = 0; i < 6; i++) {
    frame((ctx) => {
      pxFill(ctx, 0, 0, W, H, p.floorLight || p.floorDark);
      drawScene(ctx);
      drawHud(ctx, { money: 530, rep: repSteps[i], day: 1, dayPct: 0.90, isDayActive: true });
      STATIONS.forEach((st) => drawStation(ctx, { ...st, hasCustomer: false }));
      drawReviewCard(ctx, CARD_X, H - 176, { ...NEW,  p });
      drawReviewCard(ctx, CARD_X, H - 120, { ...REV1, p });
      drawReviewCard(ctx, CARD_X, H - 64,  { ...REV2, p });
      // Rep gain toast
      if (i < 4) {
        drawGbaBox(ctx, W / 2 - 110, 56, 220, 36, p);
        pxText(ctx, '+2 REPUTATION!', W / 2, 80, p.green, 11, 'center');
      }
    });
  }

  // ── Phase 5: Hold final state (6 frames) ─────────────────────────────────────
  for (let i = 0; i < 6; i++) {
    frame((ctx) => {
      pxFill(ctx, 0, 0, W, H, p.floorLight || p.floorDark);
      drawScene(ctx);
      drawHud(ctx, { money: 530, rep: 6, day: 1, dayPct: 0.91 + i * 0.01, isDayActive: true });
      STATIONS.forEach((st) => drawStation(ctx, { ...st, hasCustomer: false }));
      drawReviewCard(ctx, CARD_X, H - 176, { ...NEW,  p });
      drawReviewCard(ctx, CARD_X, H - 120, { ...REV1, p });
      drawReviewCard(ctx, CARD_X, H - 64,  { ...REV2, p });
    });
  }

  return frames;
}

module.exports = { buildFrames };
