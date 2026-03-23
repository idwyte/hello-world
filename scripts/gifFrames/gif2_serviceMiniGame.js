/**
 * GIF 2: Service Mini-Game
 * Maya seated → shape picker (GBA menu) → color picker (pixel swatches)
 * → applying (pixel progress) → service complete summary
 *
 * buildFrames(version)
 */
const { createCanvas } = require('canvas');
const {
  W, H, HUD_H,
  PA, PB,
  getStationsA, getStationsB,
} = require('./theme');
const {
  pxFill, pixelSprite, drawGbaBox, drawGbaBar, pxText,
  drawSceneA, drawStationA, drawNpcA, drawHudA,
  drawSceneB, drawStationB, drawNpcB, drawHudB,
  drawDialogueBox, drawStars,
} = require('./drawHelpers');
const { MAYA_FRONT, MAYA_TOPDOWN } = require('./sprites');

// 5×5 pixel nail tip shape (shown on a hand silhouette in the panel)
function drawPixelNail(ctx, cx, cy, color, shape = 'square') {
  const nailW = shape === 'coffin' ? 14 : shape === 'oval' ? 12 : shape === 'almond' ? 10 : 14;
  const nailH = shape === 'oval' ? 20 : shape === 'almond' ? 22 : shape === 'coffin' ? 24 : 16;
  const sx = cx - Math.round(nailW / 2);
  const sy = cy - nailH;
  // Nail body
  pxFill(ctx, sx, sy, nailW, nailH, color);
  // Outline
  pxFill(ctx, sx, sy, nailW, 4, '#181010');
  pxFill(ctx, sx, sy, 4, nailH, '#181010');
  pxFill(ctx, sx + nailW - 4, sy, 4, nailH, '#181010');
  pxFill(ctx, sx, sy + nailH - 4, nailW, 4, '#181010');
  // Shine pixel
  pxFill(ctx, sx + 4, sy + 4, 4, 4, '#F8F8F8');
}

function drawHandPixel(ctx, cx, cy, nailColor) {
  // Simplified pixel hand: palm + 4 finger strips
  const skin = '#F8C898';
  // Palm block
  pxFill(ctx, cx - 20, cy, 40, 28, skin);
  pxFill(ctx, cx - 20, cy, 40, 4, '#181010'); // top of palm outline
  // Fingers
  const fingers = [-16, -8, 0, 8, 16];
  fingers.forEach((dx) => {
    pxFill(ctx, cx + dx - 3, cy - 28, 6, 32, skin);
    pxFill(ctx, cx + dx - 3, cy - 28, 6, 4, '#181010');
    if (nailColor) drawPixelNail(ctx, cx + dx, cy - 12, nailColor, 'coffin');
  });
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
  // Maya at station
  const mayaX    = st0.x + Math.round(st0.w / 2) - Math.round(npcW / 2);
  const mayaY    = isA ? st0.y + 42 : st0.y + (10 + 30);

  // Panel constants
  const PANEL_Y  = Math.round(H * 0.55);
  const PANEL_H  = H - PANEL_Y;

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

  function drawPanel(ctx, title) {
    pxFill(ctx, 0, PANEL_Y, W, PANEL_H, p.hudBg);
    pxFill(ctx, 0, PANEL_Y, W, 4, p.outline);
    // Accent border
    const accentColor = p.hudBorder || p.hudAccent || p.white;
    pxFill(ctx, 0, PANEL_Y + 4, W, 4, accentColor);
    pxFill(ctx, 0, PANEL_Y + 4, 4, PANEL_H - 4, accentColor);
    pxFill(ctx, W - 4, PANEL_Y + 4, 4, PANEL_H - 4, accentColor);
    // Interior
    pxFill(ctx, 4, PANEL_Y + 8, W - 8, PANEL_H - 8, p.hudBg);
    pxText(ctx, title, W / 2, PANEL_Y + 26, p.gold, 12, 'center');
  }

  // ── Phase 1: Shape selector — 5 shapes cycling (12 frames) ──────────────────
  const shapes    = ['SQUARE','SQUARE','ROUND','ROUND','OVAL','OVAL','ALMOND','ALMOND','COFFIN','COFFIN','COFFIN','COFFIN'];
  const shapeList = ['SQUARE','ROUND','OVAL','ALMOND','COFFIN'];

  shapes.forEach((shape, i) => {
    frame((ctx) => {
      drawBase(ctx, 512, 2, 0.28, 0.12);
      drawPanel(ctx, 'CHOOSE SHAPE');

      // Hand preview on left
      drawHandPixel(ctx, 140, PANEL_Y + PANEL_H - 20, '#EC4899');

      // Shape buttons (pixel style — no rounded corners)
      const bw = 80; const gap = 8;
      const totalW = shapeList.length * (bw + gap) - gap;
      const sx = Math.round((W - totalW) / 2) + 100;

      shapeList.forEach((s, j) => {
        const bx  = sx + j * (bw + gap);
        const by  = PANEL_Y + 38;
        const sel = s === shape;
        // Button border
        pxFill(ctx, bx - 4, by - 4, bw + 8, 36, p.outline);
        pxFill(ctx, bx, by, bw, 28, sel ? (p.hudBorder || p.hudAccent) : p.hudBarBg);
        pxText(ctx, s, bx + bw / 2, by + 18, sel ? p.hudBg : p.hudText, 9, 'center');
      });

      pxText(ctx, 'MAYA LIKES CLEAN, STRUCTURED LOOKS', W / 2, PANEL_Y + 82, p.hudBarBg, 8, 'center');

      // Next button
      const nx = W - 100;
      pxFill(ctx, nx - 4, PANEL_Y + PANEL_H - 36, 96, 28, p.outline);
      pxFill(ctx, nx,     PANEL_Y + PANEL_H - 32, 88, 20, p.hudBorder || p.hudAccent);
      pxText(ctx, 'NEXT >', nx + 44, PANEL_Y + PANEL_H - 16, p.hudBg, 10, 'center');
    });
  });

  // ── Phase 2: Color picker — pixel swatches, landing on cherry red (14 frames) ─
  const reds = [
    '#C41E3A','#DC143C','#FF0000','#B22222','#8B0000',
    '#CC3333','#E63946','#9B2335','#FF4444','#CC0000',
    '#FF2222','#BB1111',
  ];
  const colorFrames = [null,null,'#FF0000','#FF0000','#C41E3A',
    '#DC143C','#DC143C','#DC143C','#DC143C','#DC143C','#DC143C','#DC143C','#DC143C','#DC143C'];

  colorFrames.forEach((selColor, i) => {
    frame((ctx) => {
      drawBase(ctx, 512, 2, 0.30, 0.20);
      drawPanel(ctx, 'PICK COLOR');

      // Hand preview on left
      drawHandPixel(ctx, 120, PANEL_Y + PANEL_H - 20, selColor || '#F0D8D8');

      // Swatch grid
      const cols = 6; const sw = 24; const sg = 6;
      const gridX = 280;
      const gridY = PANEL_Y + 36;
      reds.forEach((c, ri) => {
        const col = ri % cols;
        const row = Math.floor(ri / cols);
        const bx  = gridX + col * (sw + sg);
        const by  = gridY + row * (sw + sg);
        const sel = c === selColor;
        pxFill(ctx, bx - 2, by - 2, sw + 4, sw + 4, sel ? p.outline : p.hudBarBg);
        pxFill(ctx, bx, by, sw, sw, c);
        if (sel) {
          // Check mark pixel
          pxFill(ctx, bx + sw / 2 - 3, by + sw / 2 - 3, 6, 6, '#F8F8F8');
        }
      });

      if (selColor) {
        pxText(ctx, 'CHERRY RED', 120, PANEL_Y + PANEL_H - 4, p.hudBarBg, 8, 'center');
      }
    });
  });

  // ── Phase 3: Applying — progress fills (8 frames) ───────────────────────────
  for (let i = 0; i < 8; i++) {
    const prog = 0.30 + i * 0.06;
    frame((ctx) => {
      drawBase(ctx, 512, 2, 0.32, prog);
      drawPanel(ctx, 'APPLYING...');

      drawHandPixel(ctx, W / 2, PANEL_Y + PANEL_H - 20, '#DC143C');

      // Pixel spinner (8 rotating blocks)
      const dotCount = 8;
      const radius   = 28;
      for (let d = 0; d < dotCount; d++) {
        const angle = (d / dotCount) * Math.PI * 2 + (i / 8) * Math.PI * 2;
        const bx = Math.round(W / 2 - 40 + Math.cos(angle) * radius) - 4;
        const by = Math.round(PANEL_Y + 46 + Math.sin(angle) * radius) - 4;
        const bright = d === 0;
        pxFill(ctx, bx, by, 8, 8, bright ? (p.hudBorder || p.hudAccent) : p.hudBarBg);
      }

      // Progress bar across panel
      drawGbaBar(ctx, 20, PANEL_Y + 80, W - 40, prog, p);
    });
  }

  // ── Phase 4: Service complete summary (18 frames) ────────────────────────────
  for (let i = 0; i < 18; i++) {
    // Maya exits — stepped 8px per frame for first 8 frames
    const mayaExitX = i < 8 ? mayaX + i * 12 : mayaX + 96;
    const showMaya  = mayaExitX < W + npcW;

    frame((ctx) => {
      pxFill(ctx, 0, 0, W, H, p.floorLight || p.floorDark);
      drawScene(ctx);
      drawHud(ctx, { money: 530, rep: 4, day: 1, dayPct: 0.36, isDayActive: true });
      STATIONS.forEach((st) => drawStation(ctx, { ...st, hasCustomer: false }));
      if (showMaya) drawNpc(ctx, mayaExitX, mayaY, mayaGrid, { patienceFrac: 1 });

      // Summary GBA box (centre)
      const bw = Math.round(W * 0.5);
      const bh = 180;
      const bx = Math.round((W - bw) / 2);
      const by = Math.round((H - bh) / 2);
      drawGbaBox(ctx, bx, by, bw, bh, p);

      pxText(ctx, 'SERVICE COMPLETE!', bx + bw / 2, by + 24, p.gold, 11, 'center');

      // Stats
      const lines = [
        ['SERVICE',  '$15'],
        ['NAIL ART', '+$8'],
        ['TIP',      '+$5'],
        ['TOTAL',    '$28'],
      ];
      lines.forEach(([label, val], li) => {
        const ry  = by + 44 + li * 22;
        const col = label === 'TOTAL' ? p.green : p.hudText;
        pxText(ctx, label, bx + 20, ry, col, 10, 'left');
        pxText(ctx, val,   bx + bw - 20, ry, col, 10, 'right');
      });

      // Stars
      drawStars(ctx, bx + 20, by + 140, 5, p);
      pxText(ctx, '"PERFECT COFFIN!"', bx + 20, by + 158, p.hudBarBg, 8, 'left');

      // Button
      const btnY = by + bh - 36;
      pxFill(ctx, bx + 16, btnY, bw - 32, 4, p.outline);
      pxFill(ctx, bx + 16, btnY, 4, 26, p.outline);
      pxFill(ctx, bx + bw - 20, btnY, 4, 26, p.outline);
      pxFill(ctx, bx + 16, btnY + 22, bw - 32, 4, p.outline);
      pxFill(ctx, bx + 20, btnY + 4, bw - 40, 18, p.hudBorder || p.hudAccent);
      pxText(ctx, 'DONE', bx + bw / 2, btnY + 17, p.hudBg, 10, 'center');
    });
  }

  return frames;
}

module.exports = { buildFrames };
