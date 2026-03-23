const { UI, SALON, FONT, SPACING, RADIUS, W, H, HUD_H, SCENE_H, ZONE, NPC_W, NPC_H } = require('./theme');

/** Rounded rectangle */
function roundRect(ctx, x, y, w, h, r, fill, stroke) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
  if (fill)  { ctx.fillStyle = fill; ctx.fill(); }
  if (stroke){ ctx.strokeStyle = stroke; ctx.lineWidth = 1.5; ctx.stroke(); }
}

/** Draw landscape HUD (single 44px row) */
function drawHUD(ctx, { money, reputation, day, tickFraction, isDayActive = true }) {
  // Background
  ctx.fillStyle = UI.hudBg;
  ctx.fillRect(0, 0, W, HUD_H);
  // Bottom border (deep purple accent)
  ctx.fillStyle = '#2D1B69';
  ctx.fillRect(0, HUD_H - 1, W, 1);

  ctx.fillStyle = UI.hudText;
  ctx.font = `600 ${FONT.sm}px sans-serif`;

  // Money
  ctx.textAlign = 'left';
  ctx.fillText(`💰 $${money}`, 14, 28);

  // Rep
  ctx.textAlign = 'left';
  ctx.fillText(`⭐ ${reputation}`, 130, 28);

  // Day
  ctx.fillText(`📅 Day ${day}`, 210, 28);

  // Progress bar (center fill)
  const barX = 300, barW = isDayActive ? 360 : 260, barH = 6, barY = 19;
  ctx.fillStyle = 'rgba(255,255,255,0.15)';
  roundRect(ctx, barX, barY, barW, barH, 3, 'rgba(255,255,255,0.15)', null);
  if (isDayActive && tickFraction > 0) {
    ctx.fillStyle = UI.btnActive;
    roundRect(ctx, barX, barY, barW * Math.min(tickFraction, 1), barH, 3, UI.btnActive, null);
  }

  // Open Shop button (right side, when not active)
  if (!isDayActive) {
    roundRect(ctx, barX + barW + 12, 10, 80, 24, RADIUS.full, UI.btnActive, null);
    ctx.fillStyle = '#FFFFFF';
    ctx.font = `700 ${FONT.sm}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.fillText('Open 💅', barX + barW + 52, 26);
  }
}

/** Draw the full salon floor background */
function drawFloor(ctx) {
  const wallBottom = ZONE.floorY;

  // Back wall
  ctx.fillStyle = SALON.wallRose;
  ctx.fillRect(0, HUD_H, W, wallBottom - HUD_H);

  // Ceiling cornice
  ctx.fillStyle = SALON.floorGrout;
  ctx.globalAlpha = 0.4;
  ctx.fillRect(0, HUD_H, W, 6);
  ctx.globalAlpha = 1;

  // Baseboard
  ctx.fillStyle = SALON.floorGrout;
  ctx.globalAlpha = 0.6;
  ctx.fillRect(0, wallBottom, W, 4);
  ctx.globalAlpha = 1;

  // Floor
  ctx.fillStyle = SALON.floorBlush;
  ctx.fillRect(0, wallBottom, W, H - wallBottom);

  // Floor grout lines — horizontal
  ctx.strokeStyle = SALON.floorGrout;
  ctx.lineWidth = 1;
  ctx.globalAlpha = 0.35;
  [0.3, 0.65, 0.9].forEach((f) => {
    const gy = wallBottom + (H - wallBottom) * f;
    ctx.beginPath(); ctx.moveTo(0, gy); ctx.lineTo(W, gy); ctx.stroke();
  });
  // Floor grout lines — vertical
  for (let i = 1; i < 8; i++) {
    const gx = (W / 8) * i;
    ctx.beginPath(); ctx.moveTo(gx, wallBottom); ctx.lineTo(gx, H); ctx.stroke();
  }
  ctx.globalAlpha = 1;

  // ── Door (left wall) ────────────────────────────────────────────────────────
  ctx.fillStyle = SALON.furniture;
  ctx.fillRect(ZONE.doorX, ZONE.doorY, ZONE.doorW, ZONE.doorH);
  // Door panel
  ctx.fillStyle = SALON.wallCream;
  ctx.fillRect(ZONE.doorX + 4, ZONE.doorY + 8, ZONE.doorW - 8, ZONE.doorH - 10);
  // Glass pane
  ctx.fillStyle = '#AED6F1';
  ctx.globalAlpha = 0.5;
  ctx.fillRect(ZONE.doorX + 6, ZONE.doorY + 10, ZONE.doorW - 12, (ZONE.doorH - 10) * 0.45);
  ctx.globalAlpha = 1;
  // OPEN sign
  roundRect(ctx, ZONE.doorX + 6, ZONE.doorY + 14, ZONE.doorW - 12, 14, 3, UI.success, null);
  ctx.fillStyle = '#FFFFFF';
  ctx.font = `700 8px sans-serif`;
  ctx.textAlign = 'center';
  ctx.fillText('OPEN', ZONE.doorX + ZONE.doorW / 2, ZONE.doorY + 24);
  // Handle
  ctx.fillStyle = SALON.furniture;
  ctx.beginPath();
  ctx.arc(ZONE.doorX + ZONE.doorW - 8, ZONE.doorY + ZONE.doorH * 0.5, 4, 0, Math.PI * 2);
  ctx.fill();

  // ── Windows ─────────────────────────────────────────────────────────────────
  [[W * 0.35, HUD_H + SCENE_H * 0.18], [W * 0.60, HUD_H + SCENE_H * 0.18]].forEach(([wx, wy]) => {
    const ww = 60, wh = 74;
    // Frame
    roundRect(ctx, wx - ww / 2 - 3, wy - 2, ww + 6, wh + 4, 2, SALON.furniture, null);
    // Pane
    ctx.fillStyle = '#D6EAF8';
    ctx.fillRect(wx - ww / 2, wy, ww, wh);
    // Cross
    ctx.strokeStyle = 'rgba(255,255,255,0.7)';
    ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.moveTo(wx, wy); ctx.lineTo(wx, wy + wh); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(wx - ww / 2, wy + wh / 2); ctx.lineTo(wx + ww / 2, wy + wh / 2); ctx.stroke();
    // Sill
    ctx.fillStyle = SALON.furniture;
    ctx.fillRect(wx - ww / 2 - 4, wy + wh, ww + 8, 5);
  });

  // ── Reception counter ───────────────────────────────────────────────────────
  roundRect(ctx, ZONE.recepX, ZONE.recepY, ZONE.recepW, ZONE.recepH, 4, SALON.furniture, null);
  // Surface
  ctx.fillStyle = SALON.furnitureLight;
  ctx.fillRect(ZONE.recepX + 2, ZONE.recepY, ZONE.recepW - 4, 8);
  // Monitor
  ctx.fillStyle = '#1E1B4B';
  roundRect(ctx, ZONE.recepX + 10, ZONE.recepY + 12, 28, 20, 2, '#1E1B4B', null);
  ctx.fillStyle = '#6EE7B7';
  ctx.fillRect(ZONE.recepX + 12, ZONE.recepY + 14, 24, 15);
  // Flower
  ctx.fillStyle = SALON.accentSage;
  ctx.beginPath();
  ctx.arc(ZONE.recepX + ZONE.recepW * 0.7, ZONE.recepY + 20, 8, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = UI.btnActive;
  ctx.globalAlpha = 0.7;
  ctx.beginPath();
  ctx.arc(ZONE.recepX + ZONE.recepW * 0.7 - 5, ZONE.recepY + 14, 5, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(ZONE.recepX + ZONE.recepW * 0.7 + 5, ZONE.recepY + 14, 5, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = 1;
  // Vase stem
  ctx.fillStyle = SALON.accentLavender;
  ctx.fillRect(ZONE.recepX + ZONE.recepW * 0.7 - 3, ZONE.recepY + 24, 6, 16);
}

/** Draw a nail station fixture at given canvas position */
function drawStation(ctx, { fixtureX, fixtureW, stationY, hasCustomer, progress, tier = 1 }) {
  const tableTop = stationY;
  const tableH = 22;
  const tableBotY = tableTop + tableH;

  // Legs
  ctx.fillStyle = SALON.furniture;
  ctx.fillRect(fixtureX + 4, tableBotY, 6, 14);
  ctx.fillRect(fixtureX + fixtureW - 10, tableBotY, 6, 14);

  // Tabletop
  roundRect(ctx, fixtureX, tableTop, fixtureW, tableH, 3, SALON.furnitureLight, SALON.furniture);

  // Tier 2+ extras (UV lamp)
  if (tier >= 2) {
    ctx.fillStyle = '#85C1E9';
    roundRect(ctx, fixtureX + 4, tableTop + 5, fixtureW * 0.22, 10, 2, '#85C1E9', null);
  }

  // Chair seat
  const chairX = fixtureX + fixtureW * 0.2;
  const chairW = fixtureW * 0.6;
  const chairY = tableBotY + 14;
  ctx.fillStyle = SALON.accentLavender;
  roundRect(ctx, chairX, chairY, chairW, 12, 4, SALON.accentLavender, null);
  // Chair back
  roundRect(ctx, chairX, chairY - 10, chairW, 12, 3, SALON.accentLavender, null);
  // Chair legs
  ctx.fillStyle = SALON.furniture;
  ctx.fillRect(chairX, chairY + 10, 4, 6);
  ctx.fillRect(chairX + chairW - 4, chairY + 10, 4, 6);

  // Progress bar if occupied
  if (hasCustomer && progress !== undefined) {
    const pbX = fixtureX + 4;
    const pbW = fixtureW - 8;
    ctx.fillStyle = 'rgba(255,255,255,0.4)';
    roundRect(ctx, pbX, tableTop - 10, pbW, 5, 2, 'rgba(255,255,255,0.4)', null);
    ctx.fillStyle = UI.btnActive;
    roundRect(ctx, pbX, tableTop - 10, pbW * progress, 5, 2, UI.btnActive, null);
  }
}

/** Draw a simplified NPC character at canvas x,y */
function drawNpc(ctx, { x, y, skinTone = '#D4956A', hairColor = '#3B1F0D', shirtColor = '#EC4899', name, showPatience = false, patienceFrac = 1, isVip = false }) {
  const w = NPC_W, h = NPC_H;

  // Body
  ctx.fillStyle = skinTone;
  roundRect(ctx, x + w * 0.25, y + h * 0.38, w * 0.5, h * 0.35, 4, skinTone, null);

  // Shirt
  ctx.fillStyle = shirtColor;
  roundRect(ctx, x + w * 0.18, y + h * 0.42, w * 0.64, h * 0.28, 4, shirtColor, null);

  // Arms
  ctx.fillStyle = skinTone;
  roundRect(ctx, x + w * 0.04, y + h * 0.44, w * 0.16, h * 0.22, 4, skinTone, null);
  roundRect(ctx, x + w * 0.80, y + h * 0.44, w * 0.16, h * 0.22, 4, skinTone, null);

  // Head
  ctx.fillStyle = skinTone;
  ctx.beginPath();
  ctx.ellipse(x + w / 2, y + h * 0.25, w * 0.22, h * 0.22, 0, 0, Math.PI * 2);
  ctx.fill();

  // Hair
  ctx.fillStyle = hairColor;
  ctx.beginPath();
  ctx.ellipse(x + w / 2, y + h * 0.14, w * 0.22, h * 0.16, 0, 0, Math.PI * 2);
  ctx.fill();
  // Hair sides
  ctx.fillRect(x + w * 0.20, y + h * 0.10, w * 0.10, h * 0.22);
  ctx.fillRect(x + w * 0.70, y + h * 0.10, w * 0.10, h * 0.22);

  // Eyes
  ctx.fillStyle = '#18181B';
  ctx.beginPath(); ctx.arc(x + w * 0.40, y + h * 0.24, 2, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(x + w * 0.60, y + h * 0.24, 2, 0, Math.PI * 2); ctx.fill();

  // Smile
  ctx.strokeStyle = '#18181B';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.arc(x + w / 2, y + h * 0.27, 5, 0.2, Math.PI - 0.2);
  ctx.stroke();

  // VIP badge
  if (isVip) {
    roundRect(ctx, x + w - 14, y + 4, 20, 12, 3, UI.gold, null);
    ctx.fillStyle = '#18181B';
    ctx.font = `700 7px sans-serif`;
    ctx.textAlign = 'center';
    ctx.fillText('VIP', x + w - 4, y + 13);
  }

  // Patience bar
  if (showPatience) {
    const pbW = w + 4;
    ctx.fillStyle = 'rgba(0,0,0,0.2)';
    roundRect(ctx, x - 2, y - 8, pbW, 5, 2, 'rgba(0,0,0,0.2)', null);
    const pColor = patienceFrac > 0.6 ? UI.success : patienceFrac > 0.25 ? UI.warning : UI.danger;
    ctx.fillStyle = pColor;
    roundRect(ctx, x - 2, y - 8, pbW * patienceFrac, 5, 2, pColor, null);
  }

  // Name label
  if (name) {
    ctx.fillStyle = 'rgba(255,255,255,0.9)';
    const textW = name.length * 5.5 + 8;
    roundRect(ctx, x + w / 2 - textW / 2, y + h + 1, textW, 13, 3, 'rgba(255,255,255,0.9)', null);
    ctx.fillStyle = UI.textPrimary;
    ctx.font = `600 9px sans-serif`;
    ctx.textAlign = 'center';
    ctx.fillText(name, x + w / 2, y + h + 11);
  }
}

/** Draw a waiting area bench */
function drawBench(ctx, { x, y, width }) {
  // Back
  ctx.fillStyle = SALON.accentLavender;
  roundRect(ctx, x + 12, y - 18, width - 24, 16, 4, SALON.accentLavender, null);
  // Seat
  roundRect(ctx, x + 8, y - 4, width - 16, 20, 5, SALON.accentLavender, SALON.furniture);
  // Armrests
  ctx.fillStyle = SALON.furniture;
  roundRect(ctx, x, y - 16, 12, 28, 3, SALON.furniture, null);
  roundRect(ctx, x + width - 12, y - 16, 12, 28, 3, SALON.furniture, null);
  // Legs
  ctx.fillStyle = SALON.furniture;
  ctx.fillRect(x + 12, y + 15, 5, 8);
  ctx.fillRect(x + width - 17, y + 15, 5, 8);
}

/** Draw a review card in bottom-right corner overlay */
function drawReviewCard(ctx, { text, stars, name, x, y, opacity = 1 }) {
  ctx.globalAlpha = opacity;
  const cardW = 230, cardH = 44;
  roundRect(ctx, x, y, cardW, cardH, RADIUS.sm, UI.panelBg, UI.panelBorder);
  ctx.fillStyle = UI.gold;
  ctx.font = `${FONT.sm}px sans-serif`;
  ctx.textAlign = 'left';
  ctx.fillText('★'.repeat(stars) + '☆'.repeat(5 - stars), x + 10, y + 18);
  ctx.fillStyle = UI.textSecondary;
  ctx.font = `9px sans-serif`;
  const short = text.length > 28 ? text.slice(0, 28) + '…' : text;
  ctx.fillText(`${name}: "${short}"`, x + 10, y + 34);
  ctx.globalAlpha = 1;
}

/** Draw the day-end modal overlay */
function drawDayEndModal(ctx, { slideY = 0, earnings, wages, net, showWages, showNet, btnLabel }) {
  ctx.fillStyle = 'rgba(24,16,58,0.65)';
  ctx.fillRect(0, 0, W, H);

  const mw = W * 0.55;
  const mh = showWages ? 220 : 180;
  const mx = (W - mw) / 2;
  const my = (H - mh) / 2 + slideY;

  roundRect(ctx, mx, my, mw, mh, RADIUS.lg, UI.panelBg, null);
  // pink glow
  ctx.shadowColor = UI.btnActive;
  ctx.shadowBlur = 20;
  ctx.shadowOffsetX = 0; ctx.shadowOffsetY = 0;
  roundRect(ctx, mx, my, mw, mh, RADIUS.lg, null, UI.panelBorder);
  ctx.shadowBlur = 0;

  // Title
  ctx.fillStyle = UI.textPrimary;
  ctx.font = `700 ${FONT.lg}px sans-serif`;
  ctx.textAlign = 'center';
  ctx.fillText(`Day 1 Complete! 💅`, W / 2, my + 36);

  // Rows
  const rows = [
    ['Earnings', `$${earnings}`],
    showWages ? ['Staff Wages', `-$${wages}`] : null,
    showNet   ? ['Net Profit',  `$${net}`]   : null,
    ['Customers', '4'],
  ].filter(Boolean);

  rows.forEach(([label, val], i) => {
    const ry = my + 62 + i * 28;
    const isNet = label.startsWith('Net');
    const isWage = label.startsWith('Staff');
    ctx.fillStyle = isNet ? UI.success : isWage ? UI.danger : UI.textSecondary;
    ctx.font = isNet ? `700 ${FONT.md}px sans-serif` : `${FONT.sm}px sans-serif`;
    ctx.textAlign = 'left';
    ctx.fillText(label, mx + 24, ry);
    ctx.textAlign = 'right';
    ctx.fillText(val, mx + mw - 24, ry);
  });

  // Button
  const btnY = my + mh - 48;
  roundRect(ctx, mx + 24, btnY, mw - 48, 36, RADIUS.md, UI.btnActive, null);
  ctx.fillStyle = '#FFFFFF';
  ctx.font = `700 ${FONT.md}px sans-serif`;
  ctx.textAlign = 'center';
  ctx.fillText(btnLabel, W / 2, btnY + 22);
}

/** Clear canvas to landscape background */
function clearBg(ctx) {
  ctx.clearRect(0, 0, W, H);
  ctx.fillStyle = UI.hudBg;
  ctx.fillRect(0, 0, W, H);
}

module.exports = {
  roundRect, drawHUD, drawFloor, drawStation, drawNpc,
  drawBench, drawReviewCard, drawDayEndModal, clearBg,
};
