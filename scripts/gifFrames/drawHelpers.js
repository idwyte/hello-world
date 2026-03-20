const { UI, FONT, SPACING, RADIUS, W } = require('./theme');

/** Draw a rounded rectangle */
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
  if (fill) { ctx.fillStyle = fill; ctx.fill(); }
  if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = 1.5; ctx.stroke(); }
}

/** Draw HUD bar at top */
function drawHUD(ctx, { money, reputation, day, tickFraction }) {
  // HUD background
  ctx.fillStyle = UI.hudBg;
  ctx.fillRect(0, 44, W, 56);

  ctx.fillStyle = UI.hudText;
  ctx.font = `700 ${FONT.sm}px sans-serif`;
  ctx.textAlign = 'left';
  ctx.fillText(`💰 $${money}`, 16, 76);

  ctx.textAlign = 'center';
  ctx.fillText(`⭐ Rep: ${reputation}`, W / 2, 76);

  ctx.textAlign = 'right';
  ctx.fillText(`📅 Day ${day}`, W - 16, 76);

  // Time progress bar
  const barW = W - 32;
  const barH = 4;
  const barY = 88;
  ctx.fillStyle = '#2A2A4E';
  ctx.fillRect(16, barY, barW, barH);
  ctx.fillStyle = UI.btnActive;
  ctx.fillRect(16, barY, barW * tickFraction, barH);
}

/** Draw a customer card in the waiting queue */
function drawCustomerCard(ctx, { name, service, patienceFraction, y }) {
  const cardH = 60;
  roundRect(ctx, 16, y, W - 32, cardH, RADIUS.md, UI.panelBg, UI.panelBorder);

  // Avatar circle
  ctx.fillStyle = '#C68642';
  ctx.beginPath();
  ctx.arc(44, y + 22, 14, 0, Math.PI * 2);
  ctx.fill();
  // Hair suggestion
  ctx.fillStyle = '#3D2B1F';
  ctx.fillRect(30, y + 8, 28, 8);

  ctx.fillStyle = UI.textPrimary;
  ctx.font = `600 ${FONT.md}px sans-serif`;
  ctx.textAlign = 'left';
  ctx.fillText(name, 68, y + 22);

  ctx.fillStyle = UI.textSecondary;
  ctx.font = `${FONT.sm}px sans-serif`;
  ctx.fillText(service, 68, y + 38);

  // Patience bar
  const barX = 68;
  const barY2 = y + 48;
  const barW = W - 32 - 68 - 60;
  ctx.fillStyle = '#E0D4CC';
  ctx.fillRect(barX, barY2, barW, 5);
  const pColor = patienceFraction > 0.6 ? UI.success : patienceFraction > 0.3 ? UI.warning : UI.danger;
  ctx.fillStyle = pColor;
  ctx.fillRect(barX, barY2, barW * patienceFraction, 5);

  // Seat button
  roundRect(ctx, W - 32 - 52, y + 14, 52, 30, RADIUS.sm, UI.btnActive, null);
  ctx.fillStyle = UI.btnText;
  ctx.font = `600 ${FONT.xs}px sans-serif`;
  ctx.textAlign = 'center';
  ctx.fillText('Seat →', W - 32 - 26, y + 33);
}

/** Draw a nail station slot */
function drawStation(ctx, { id, hasCustomer, customerName, progress, staffName, y, x, w }) {
  const h = 120;
  roundRect(ctx, x, y, w, h, RADIUS.md, UI.panelBg, UI.panelBorder);

  ctx.fillStyle = UI.textSecondary;
  ctx.font = `600 ${FONT.xs}px sans-serif`;
  ctx.textAlign = 'center';
  ctx.fillText(id.toUpperCase().replace('_', ' '), x + w / 2, y + 18);

  if (hasCustomer) {
    // Customer avatar
    ctx.fillStyle = '#D4956A';
    ctx.beginPath();
    ctx.arc(x + w / 2, y + 50, 16, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = UI.textPrimary;
    ctx.font = `${FONT.xs}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.fillText(customerName, x + w / 2, y + 76);

    // Progress bar
    const bx = x + 12;
    const bw = w - 24;
    ctx.fillStyle = '#E0D4CC';
    ctx.fillRect(bx, y + 85, bw, 8);
    ctx.fillStyle = UI.btnActive;
    ctx.fillRect(bx, y + 85, bw * progress, 8);

    ctx.fillStyle = UI.textSecondary;
    ctx.font = `${FONT.xs}px sans-serif`;
    ctx.fillText(`${Math.round(progress * 100)}%`, x + w / 2, y + 108);
  } else {
    ctx.fillStyle = UI.textMuted;
    ctx.font = `${FONT.sm}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.fillText('+ tap to seat', x + w / 2, y + 60);
    if (staffName) {
      ctx.fillStyle = UI.textSecondary;
      ctx.font = `${FONT.xs}px sans-serif`;
      ctx.fillText(`👩 ${staffName}`, x + w / 2, y + 80);
    }
  }
}

/** Draw review board */
function drawReview(ctx, { text, stars, name, y, opacity = 1 }) {
  ctx.globalAlpha = opacity;
  const h = 44;
  roundRect(ctx, 16, y, W - 32, h, RADIUS.sm, UI.panelBg, UI.panelBorder);

  ctx.fillStyle = UI.textPrimary;
  ctx.font = `${FONT.xs}px sans-serif`;
  ctx.textAlign = 'left';
  ctx.fillText(`${name}: "${text}"`, 26, y + 18);

  const starStr = '★'.repeat(stars) + '☆'.repeat(5 - stars);
  ctx.fillStyle = UI.gold;
  ctx.font = `${FONT.sm}px sans-serif`;
  ctx.fillText(starStr, 26, y + 35);
  ctx.globalAlpha = 1;
}

/** Draw modal overlay */
function drawModal(ctx, { title, lines }) {
  ctx.fillStyle = 'rgba(0,0,0,0.5)';
  ctx.fillRect(0, 0, W, 844);

  const mw = W * 0.8;
  const mh = 60 + lines.length * 26 + 60;
  const mx = (W - mw) / 2;
  const my = (844 - mh) / 2;

  roundRect(ctx, mx, my, mw, mh, RADIUS.lg, '#FAF3E0', null);

  ctx.fillStyle = UI.textPrimary;
  ctx.font = `700 ${FONT.xl}px sans-serif`;
  ctx.textAlign = 'center';
  ctx.fillText(title, W / 2, my + 40);

  lines.forEach((line, i) => {
    ctx.fillStyle = UI.textSecondary;
    ctx.font = `${FONT.lg}px sans-serif`;
    ctx.fillText(line, W / 2, my + 70 + i * 26);
  });

  const btnY = my + mh - 50;
  roundRect(ctx, W / 2 - 70, btnY, 140, 36, RADIUS.md, UI.btnActive, null);
  ctx.fillStyle = UI.btnText;
  ctx.font = `700 ${FONT.md}px sans-serif`;
  ctx.fillText('Continue', W / 2, btnY + 22);
}

/** Draw shop name banner */
function drawShopName(ctx, name, y) {
  ctx.fillStyle = UI.textPrimary;
  ctx.font = `700 ${FONT.xl}px sans-serif`;
  ctx.textAlign = 'center';
  ctx.fillText(name, W / 2, y);
}

/** Draw section label */
function drawSectionLabel(ctx, label, y) {
  ctx.fillStyle = UI.textSecondary;
  ctx.font = `600 ${FONT.xs}px sans-serif`;
  ctx.textAlign = 'left';
  ctx.letterSpacing = '1px';
  ctx.fillText(label.toUpperCase(), 16, y);
}

/** Clear to background */
function clearBg(ctx, h = 844) {
  ctx.fillStyle = '#FAF3E0';
  ctx.fillRect(0, 0, W, h);
  // Status bar area
  ctx.fillStyle = UI.hudBg;
  ctx.fillRect(0, 0, W, 44);
  ctx.fillStyle = UI.hudText;
  ctx.font = `${FONT.xs}px sans-serif`;
  ctx.textAlign = 'center';
  ctx.fillText('9:41', W / 2, 32);
}

module.exports = {
  roundRect, drawHUD, drawCustomerCard, drawStation,
  drawReview, drawModal, drawShopName, drawSectionLabel, clearBg,
};
