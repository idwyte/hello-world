/**
 * GBA pixel-art draw helpers — two art direction versions
 *
 * Version A: drawSceneA / drawStationA / drawNpcA / drawHudA  (top-down FireRed)
 * Version B: drawSceneB / drawStationB / drawNpcB / drawHudB  (front-facing Girl-Game)
 *
 * All drawing uses fillRect only — no arcs, no gradients, no shadows.
 */

const {
  PIXEL_SCALE, TILE_SIZE,
  W, H, HUD_H, SCENE_H,
  PA, PB,
  ZONE_A, ZONE_B,
  NPC_TOP_W, NPC_TOP_H, NPC_FRONT_W, NPC_FRONT_H,
} = require('./theme');

// ── Core primitives ───────────────────────────────────────────────────────────

/** Axis-aligned solid fill, integer-snapped. No anti-aliasing. */
function pxFill(ctx, x, y, w, h, color) {
  ctx.fillStyle = color;
  ctx.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h));
}

/**
 * Render a pixel sprite grid.
 * grid: 2D array — null = transparent, 'O' = outlineColor, else hex string.
 */
function pixelSprite(ctx, grid, outlineColor, x, y, scale) {
  const ox = Math.round(x);
  const oy = Math.round(y);
  const s  = scale;
  for (let ri = 0; ri < grid.length; ri++) {
    const row = grid[ri];
    for (let ci = 0; ci < row.length; ci++) {
      const cell = row[ci];
      if (!cell) continue;
      ctx.fillStyle = cell === 'O' ? outlineColor : cell;
      ctx.fillRect(ox + ci * s, oy + ri * s, s, s);
    }
  }
}

/**
 * GBA double-border dialogue box.
 * Outer border 4px → accent ring 4px → interior filled with hudBg.
 */
function drawGbaBox(ctx, x, y, w, h, palette) {
  x = Math.round(x); y = Math.round(y);
  const accent = palette.hudBorder || palette.hudAccent || palette.white;
  // Outer black border
  pxFill(ctx, x, y, w, h, palette.outline);
  // Accent fill (4px inside outer)
  pxFill(ctx, x + 4, y + 4, w - 8, h - 8, accent);
  // Interior (4px inside accent)
  pxFill(ctx, x + 8, y + 8, w - 16, h - 16, palette.hudBg);
}

/**
 * GBA HP-bar style progress bar (8 px tall).
 * Outline → track → fill.
 */
function drawGbaBar(ctx, x, y, w, pct, palette) {
  x = Math.round(x); y = Math.round(y); w = Math.round(w);
  const h = 8;
  // Outline
  pxFill(ctx, x, y, w, h, palette.outline);
  // Track
  pxFill(ctx, x + 2, y + 2, w - 4, h - 4, palette.hudBarBg);
  // Fill
  const fillW = Math.max(0, Math.round((w - 4) * Math.min(pct, 1)));
  if (fillW > 0) {
    pxFill(ctx, x + 2, y + 2, fillW, h - 4, palette.hudBar);
  }
}

/** Pixel-font text (canvas monospace, no AA tricks) */
function pxText(ctx, text, x, y, color, size, align = 'left') {
  ctx.fillStyle  = color;
  ctx.font       = `bold ${size}px monospace`;
  ctx.textAlign  = align;
  ctx.textBaseline = 'alphabetic';
  ctx.fillText(String(text), Math.round(x), Math.round(y));
}

// ── Version A: FireRed top-down ───────────────────────────────────────────────

function drawSceneA(ctx) {
  const p  = PA;
  const zA = ZONE_A;

  // Back wall band
  pxFill(ctx, 0, HUD_H, W, zA.wallH, p.wall);
  // Baseboard at wall bottom
  pxFill(ctx, 0, HUD_H + zA.wallH - 4, W, 4, p.wallDark);

  // Checkerboard floor — 32×32 canvas tiles (= 8×8 GBA tiles at 4×)
  const tW = TILE_SIZE * 2;
  const tH = TILE_SIZE * 2;
  const fy = zA.floorY;
  for (let ty = fy; ty < H; ty += tH) {
    for (let tx = 0; tx < W; tx += tW) {
      const even = ((tx / tW + (ty - fy) / tH) & 1) === 0;
      pxFill(ctx, tx, ty, tW, tH, even ? p.floorLight : p.floorDark);
    }
  }
  // Tile grid lines (4px, dark)
  for (let tx = 0; tx <= W; tx += tW) {
    pxFill(ctx, tx, fy, 4, H - fy, p.wallDark);
  }
  for (let ty = fy; ty <= H; ty += tH) {
    pxFill(ctx, 0, ty, W, 4, p.wallDark);
  }

  // Door (top-right, top-down view)
  const dz = zA;
  pxFill(ctx, dz.doorX, dz.doorY, dz.doorW, dz.doorH, p.woodDark);
  pxFill(ctx, dz.doorX + 4, dz.doorY + 4, dz.doorW - 8, dz.doorH - 8, p.floorLight);
  pxFill(ctx, dz.doorX + 4, dz.doorY + 4, dz.doorW - 8, 4, p.woodLight);
  pxText(ctx, 'EXIT', dz.doorX + dz.doorW / 2, dz.doorY + dz.doorH / 2 + 4, p.woodDark, 8, 'center');

  // Waiting bench (bottom-left, top-down rectangle)
  const bx = dz.waitingX, by = dz.waitingY, bw = 200;
  pxFill(ctx, bx, by, bw, 28, p.woodDark);
  pxFill(ctx, bx + 4, by + 4, bw - 8, 20, p.woodLight);
  pxFill(ctx, bx, by, 12, 28, p.woodDark);
  pxFill(ctx, bx + bw - 12, by, 12, 28, p.woodDark);
}

function drawStationA(ctx, { x, y, w, hasCustomer = false, progress = 0, tier = 1 }) {
  const p = PA;
  const h = 32;
  // Table top (top-down rectangle)
  pxFill(ctx, x, y, w, h, p.woodDark);
  pxFill(ctx, x + 4, y + 4, w - 8, h - 8, p.woodLight);
  // UV lamp for tier 2+
  if (tier >= 2) pxFill(ctx, x + 4, y + 4, 18, 8, '#8080F8');
  // Chair indicator (below table)
  const cw = Math.round(w * 0.55);
  const cx = x + Math.round((w - cw) / 2);
  const cy = y + h + 8;
  pxFill(ctx, cx, cy, cw, 18, p.woodDark);
  pxFill(ctx, cx + 3, cy + 3, cw - 6, 12, p.chairColor);
  // Progress bar above table
  if (hasCustomer && progress > 0) {
    drawGbaBar(ctx, x, y - 12, w, progress, p);
  }
}

function drawNpcA(ctx, x, y, grid, { patienceFrac = 1, isVip = false, label = '' } = {}) {
  const scale = 3;
  pixelSprite(ctx, grid, PA.outline, x, y, scale);
  const sprW = grid[0].length * scale;
  const sprH = grid.length * scale;
  drawGbaBar(ctx, x, y - 12, sprW, patienceFrac, PA);
  if (isVip) {
    pxFill(ctx, x + sprW - 4, y - 2, 24, 10, PA.gold);
    pxText(ctx, 'VIP', x + sprW + 8, y + 7, PA.outline, 7, 'center');
  }
  if (label) {
    pxFill(ctx, x, y + sprH + 1, sprW, 11, PA.hudBg);
    pxText(ctx, label, x + sprW / 2, y + sprH + 10, PA.hudText, 8, 'center');
  }
}

function drawHudA(ctx, { money, rep, day, dayPct = 0, isDayActive = true }) {
  const p = PA;
  pxFill(ctx, 0, 0, W, HUD_H, p.hudBg);
  pxFill(ctx, 0, HUD_H - 4, W, 4, p.outline);
  // Accent bar inside HUD
  pxFill(ctx, 8, 6, W - 16, 4, p.hudAccent);
  // Stats
  pxText(ctx, `$${money}`,    16,  28, p.hudText, 11, 'left');
  pxText(ctx, `REP:${rep}`,  160,  28, p.hudText, 11, 'left');
  pxText(ctx, `DAY ${day}`,  280,  28, p.hudText, 11, 'left');
  // Day bar or open button
  if (isDayActive) {
    drawGbaBar(ctx, 380, 16, 340, dayPct, p);
    pxText(ctx, 'TIME', 728, 28, p.hudAccent, 9, 'left');
  } else {
    pxFill(ctx, 380, 10, 196, HUD_H - 20, p.outline);
    pxFill(ctx, 384, 14, 188, HUD_H - 28, p.hudAccent);
    pxFill(ctx, 388, 18, 180, HUD_H - 36, p.hudBg);
    pxText(ctx, 'OPEN SHOP', 478, 28, p.hudAccent, 10, 'center');
  }
}

// ── Version B: GBA Girl Game front-facing ─────────────────────────────────────

function drawSceneB(ctx) {
  const p  = PB;
  const zB = ZONE_B;

  // Wall fill (tall candy pink)
  pxFill(ctx, 0, HUD_H, W, zB.wallH, p.wall);

  // Dado rail — top strip
  pxFill(ctx, 0, HUD_H, W, 8, p.wallDark);
  // Wall accent horizontal lines (3 evenly spaced)
  for (let i = 1; i <= 3; i++) {
    pxFill(ctx, 0, HUD_H + Math.round(zB.wallH * i / 4), W, 4, p.wallAccent);
  }
  // Wainscoting — lower 28% of wall, darker
  const wainY = HUD_H + Math.round(zB.wallH * 0.68);
  pxFill(ctx, 0, wainY, W, zB.floorY - wainY, p.wallDark);
  // Wainscoting rail
  pxFill(ctx, 0, wainY, W, 4, p.outline);

  // Floor (flat lavender + tile lines)
  const fy = zB.floorY;
  const fh = H - fy;
  pxFill(ctx, 0, fy, W, fh, p.floorLight);
  // Horizontal tile seams
  for (let gy = fy + 20; gy < H; gy += 20) {
    pxFill(ctx, 0, gy, W, 2, p.floorDark);
  }
  // Vertical tile seams
  for (let gx = 0; gx < W; gx += 80) {
    pxFill(ctx, gx, fy, 2, fh, p.floorDark);
  }

  // Door (left wall, front-facing)
  const dz = zB;
  // Frame
  pxFill(ctx, dz.doorX, dz.doorY - 4, dz.doorW + 8, dz.doorH + 8, p.wallDark);
  // Door panel
  pxFill(ctx, dz.doorX + 4, dz.doorY, dz.doorW, dz.doorH, p.furnitureDark);
  // Glass pane (upper half, lighter)
  pxFill(ctx, dz.doorX + 8, dz.doorY + 8, dz.doorW - 16, Math.round(dz.doorH * 0.38), p.floorLight);
  // Door handle
  pxFill(ctx, dz.doorX + dz.doorW - 6, dz.doorY + Math.round(dz.doorH * 0.48), 4, 12, p.outline);
  // Cross bar on glass
  pxFill(ctx, dz.doorX + 8, dz.doorY + Math.round(dz.doorH * 0.20), dz.doorW - 16, 4, p.wallDark);

  // Pixel heart decorations on wall
  _pixelHeart(ctx, W * 0.38, HUD_H + 30, p.wallAccent);
  _pixelHeart(ctx, W * 0.62, HUD_H + 30, p.wallAccent);
  _pixelHeart(ctx, W * 0.50, HUD_H + 20, p.wallAccent);

  // Waiting bench (bottom-left, front-facing 3/4)
  const bx = dz.waitingX + 52;
  const by = dz.waitingY;
  drawBenchB(ctx, bx, by, 220);
}

function drawBenchB(ctx, x, y, w) {
  const p = PB;
  // Back rest
  pxFill(ctx, x + 8,  y - 30, w - 16, 14, p.furnitureDark);
  pxFill(ctx, x + 12, y - 26, w - 24, 6,  p.furnitureLight);
  // Seat
  pxFill(ctx, x,      y - 10, w,      22, p.furnitureDark);
  pxFill(ctx, x + 4,  y - 6,  w - 8,  14, p.furnitureLight);
  // Armrests
  pxFill(ctx, x,             y - 30, 8, 38, p.furnitureDark);
  pxFill(ctx, x + w - 8,    y - 30, 8, 38, p.furnitureDark);
  // Legs
  pxFill(ctx, x + 8,         y + 12, 8, 12, p.outline);
  pxFill(ctx, x + w - 16,   y + 12, 8, 12, p.outline);
}

function drawStationB(ctx, { x, y, w, hasCustomer = false, progress = 0, tier = 1 }) {
  const p = PB;
  const depthH = 10;
  const tableH = 30;
  // Top face (depth illusion, darker)
  pxFill(ctx, x, y, w, depthH, p.furnitureDark);
  pxFill(ctx, x, y, w, 4, p.outline);
  // Front face (lighter)
  pxFill(ctx, x, y + depthH, w, tableH, p.furnitureLight);
  // Outline front face
  pxFill(ctx, x, y + depthH + tableH - 4, w, 4, p.outline);
  pxFill(ctx, x, y + depthH, 4, tableH, p.outline);
  pxFill(ctx, x + w - 4, y + depthH, 4, tableH, p.outline);
  // UV lamp on top
  if (tier >= 2) pxFill(ctx, x + 8, y + 2, 20, 6, '#8080F8');
  // Chair
  const cw   = Math.round(w * 0.55);
  const cx   = x + Math.round((w - cw) / 2);
  const cy   = y + depthH + tableH + 4;
  // Chair back
  pxFill(ctx, cx,     cy - 14, cw, 16, p.furnitureDark);
  pxFill(ctx, cx + 4, cy - 10, cw - 8, 8, p.furnitureLight);
  // Chair seat
  pxFill(ctx, cx,     cy,     cw, 14, p.furnitureDark);
  pxFill(ctx, cx + 4, cy + 3, cw - 8, 8, p.furnitureLight);
  // Chair legs
  pxFill(ctx, cx,         cy + 14, 6, 10, p.outline);
  pxFill(ctx, cx + cw - 6, cy + 14, 6, 10, p.outline);
  // Progress bar
  if (hasCustomer && progress > 0) {
    drawGbaBar(ctx, x, y - 14, w, progress, p);
  }
}

function drawNpcB(ctx, x, y, grid, { patienceFrac = 1, isVip = false, label = '' } = {}) {
  const scale = 4;
  pixelSprite(ctx, grid, PB.outline, x, y, scale);
  const sprW = grid[0].length * scale;
  const sprH = grid.length * scale;
  drawGbaBar(ctx, x, y - 12, sprW, patienceFrac, PB);
  if (isVip) {
    pxFill(ctx, x + sprW - 4, y - 2, 24, 10, PB.gold);
    pxText(ctx, 'VIP', x + sprW + 8, y + 7, PB.outline, 7, 'center');
  }
  if (label) {
    pxFill(ctx, x, y + sprH + 1, sprW, 11, PB.hudBg);
    pxText(ctx, label, x + sprW / 2, y + sprH + 10, PB.hudText, 8, 'center');
  }
}

function drawHudB(ctx, { money, rep, day, dayPct = 0, isDayActive = true }) {
  const p = PB;
  pxFill(ctx, 0, 0, W, HUD_H, p.hudBg);
  pxFill(ctx, 0, 0, W, 4, p.hudBorder);
  pxFill(ctx, 0, HUD_H - 4, W, 4, p.hudBorder);
  pxText(ctx, `$${money}`,   16,  28, p.hudText, 11, 'left');
  pxText(ctx, `REP:${rep}`, 155,  28, p.hudText, 11, 'left');
  pxText(ctx, `DAY ${day}`, 270,  28, p.hudText, 11, 'left');
  if (isDayActive) {
    drawGbaBar(ctx, 380, 16, 340, dayPct, p);
    pxText(ctx, 'TIME', 728, 28, p.hudText, 9, 'left');
  } else {
    pxFill(ctx, 380, 10, 196, HUD_H - 20, p.hudBorder);
    pxFill(ctx, 384, 14, 188, HUD_H - 28, p.hudBg);
    pxText(ctx, 'OPEN SHOP', 478, 28, p.hudBorder, 10, 'center');
  }
}

// ── Shared overlay helpers ────────────────────────────────────────────────────

/**
 * Draw a filled GBA dialogue box with text lines.
 * lines: array of { text, color?, size? }
 */
function drawDialogueBox(ctx, x, y, w, h, lines, palette) {
  drawGbaBox(ctx, x, y, w, h, palette);
  lines.forEach((line, i) => {
    pxText(ctx, line.text, x + 16, y + 24 + i * 16,
      line.color || palette.hudText, line.size || 10, 'left');
  });
}

/** Star rating row */
function drawStars(ctx, x, y, stars, palette) {
  for (let i = 0; i < 5; i++) {
    pxText(ctx, i < stars ? '\u2605' : '\u2606', x + i * 18, y,
      i < stars ? palette.gold : palette.hudBarBg, 13, 'left');
  }
}

/** Day-end GBA modal (version-aware) */
function drawDayEndModal(ctx, { slideY = 0, earnings, wages, net, showWages, showNet, btnLabel, version = 'vA' }) {
  const p = version === 'vA' ? PA : PB;

  // Dim overlay (60% black)
  ctx.globalAlpha = 0.6;
  pxFill(ctx, 0, 0, W, H, p.black);
  ctx.globalAlpha = 1;

  const mw = Math.round(W * 0.52);
  const mh = showWages ? 208 : 176;
  const mx = Math.round((W - mw) / 2);
  const my = Math.round((H - mh) / 2) + Math.round(slideY);

  drawGbaBox(ctx, mx, my, mw, mh, p);

  pxText(ctx, 'DAY 1 COMPLETE!', mx + mw / 2, my + 30, p.gold, 12, 'center');

  const rows = [
    ['EARNINGS', `$${earnings}`],
    showWages ? ['WAGES', `-$${wages}`] : null,
    showNet   ? ['PROFIT', `$${net}`]   : null,
    ['CUSTOMERS', '4'],
  ].filter(Boolean);

  rows.forEach(([label, val], i) => {
    const ry  = my + 50 + i * 24;
    const col = label === 'PROFIT' ? p.green : label === 'WAGES' ? p.red : p.hudText;
    pxText(ctx, label, mx + 20, ry, col, 10, 'left');
    pxText(ctx, val,   mx + mw - 20, ry, col, 10, 'right');
  });

  // Button
  const btnY = my + mh - 40;
  pxFill(ctx, mx + 16, btnY, mw - 32, 4, p.outline);
  pxFill(ctx, mx + 16, btnY, 4, 28, p.outline);
  pxFill(ctx, mx + mw - 20, btnY, 4, 28, p.outline);
  pxFill(ctx, mx + 16, btnY + 24, mw - 32, 4, p.outline);
  const btnInner = p.hudBorder || p.hudAccent || p.hudText;
  pxFill(ctx, mx + 20, btnY + 4, mw - 40, 20, btnInner);
  pxText(ctx, btnLabel, mx + mw / 2, btnY + 18, p.hudBg, 10, 'center');
}

// ── Internal ──────────────────────────────────────────────────────────────────

function _pixelHeart(ctx, cx, cy, color) {
  // 8×7 pixel heart
  const mask = [
    [0,1,1,0,0,1,1,0],
    [1,1,1,1,1,1,1,1],
    [1,1,1,1,1,1,1,1],
    [0,1,1,1,1,1,1,0],
    [0,0,1,1,1,1,0,0],
    [0,0,0,1,1,0,0,0],
    [0,0,0,0,0,0,0,0],
  ];
  const s = PIXEL_SCALE;
  mask.forEach((row, ri) => {
    row.forEach((on, ci) => {
      if (on) pxFill(ctx, cx + ci * s - 16, cy + ri * s, s, s, color);
    });
  });
}

module.exports = {
  pxFill, pixelSprite, drawGbaBox, drawGbaBar, pxText,
  drawSceneA, drawStationA, drawNpcA, drawHudA,
  drawSceneB, drawBenchB, drawStationB, drawNpcB, drawHudB,
  drawDialogueBox, drawStars, drawDayEndModal,
};
