/**
 * GIF 4: Day end modal slides up, earnings tally animates, wage deduction, net shown
 * ~46 frames @ 90ms
 */
const { createCanvas } = require('canvas');
const { W } = require('./theme');
const { clearBg, drawHUD, drawShopName, drawSectionLabel, drawStation, roundRect } = require('./drawHelpers');
const { UI, FONT, SPACING, RADIUS } = require('./theme');

const H = 844;

function drawShopFloor(ctx, money, rep, tick) {
  clearBg(ctx, H);
  drawHUD(ctx, { money, reputation: rep, day: 1, tickFraction: tick });
  drawShopName(ctx, "Jade's Nail Studio", 130);

  ctx.fillStyle = UI.textSecondary;
  ctx.font = `600 ${FONT.xs}px sans-serif`;
  ctx.textAlign = 'left';
  ctx.fillText('RECENT REVIEWS', 16, 155);

  roundRect(ctx, 16, 162, W - 32, 44, RADIUS.sm, UI.panelBg, UI.panelBorder);
  ctx.fillStyle = UI.gold;
  ctx.font = `${FONT.md}px sans-serif`;
  ctx.textAlign = 'left';
  ctx.fillText('★★★★★  "Perfect! Cherry red is stunning 💅"', 26, 182);
  ctx.fillStyle = UI.textMuted;
  ctx.font = `${FONT.xs}px sans-serif`;
  ctx.fillText('— Maya T.', 26, 198);

  drawSectionLabel(ctx, 'Nail Stations', 222);
  const sw = (W - 48) / 2;
  drawStation(ctx, { id: 'station_1', hasCustomer: false, y: 234, x: 16, w: sw });
  drawStation(ctx, { id: 'station_2', hasCustomer: false, y: 234, x: 24 + sw, w: sw });

  drawSectionLabel(ctx, 'Waiting Queue (0)', 374);
  ctx.fillStyle = UI.textMuted;
  ctx.font = `${FONT.md}px sans-serif`;
  ctx.textAlign = 'center';
  ctx.fillText('No customers waiting...', W / 2, 420);
}

function drawDayEndModal(ctx, { slideY, earnings, wages, net, showWages, showNet, btnLabel }) {
  ctx.fillStyle = `rgba(0,0,0,0.5)`;
  ctx.fillRect(0, 0, W, H);

  const mw = W - 48;
  const mx = 24;
  const mh = 340;
  const my = (H - mh) / 2 + slideY;

  roundRect(ctx, mx, my, mw, mh, RADIUS.lg, '#FAF3E0', null);

  // Title
  ctx.fillStyle = UI.textPrimary;
  ctx.font = `700 ${FONT.xxl}px sans-serif`;
  ctx.textAlign = 'center';
  ctx.fillText('Day 1 Complete! 🎉', W / 2, my + 48);

  // Stats
  const rows = [
    ['Earnings:', `$${earnings}`],
    showWages ? ['Staff Wages:', `-$${wages}`] : null,
    showNet ? ['Net Profit:', `$${net}`] : null,
    ['Customers served:', '4'],
  ].filter(Boolean);

  rows.forEach(([label, val], i) => {
    const y = my + 90 + i * 36;
    const isNet = label.startsWith('Net');
    const isWages = label.startsWith('Staff');
    ctx.fillStyle = isNet ? UI.success : isWages ? UI.danger : UI.textSecondary;
    ctx.font = isNet ? `700 ${FONT.lg}px sans-serif` : `${FONT.md}px sans-serif`;
    ctx.textAlign = 'left';
    ctx.fillText(label, mx + 24, y);
    ctx.textAlign = 'right';
    ctx.fillText(val, mx + mw - 24, y);
  });

  // Divider before net
  if (showWages) {
    const divY = my + 90 + rows.length * 36 - 46;
    ctx.strokeStyle = UI.panelBorder;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(mx + 16, divY);
    ctx.lineTo(mx + mw - 16, divY);
    ctx.stroke();
  }

  // Reputation gain indicator
  roundRect(ctx, mx + 24, my + 250, mw - 48, 36, RADIUS.sm, '#E8F5E9', null);
  ctx.fillStyle = UI.success;
  ctx.font = `600 ${FONT.sm}px sans-serif`;
  ctx.textAlign = 'center';
  ctx.fillText('⭐ Reputation +6 → Now: 6 / 100', W / 2, my + 272);

  // Button
  roundRect(ctx, mx + 24, my + mh - 56, mw - 48, 44, RADIUS.md, UI.btnActive, null);
  ctx.fillStyle = UI.btnText;
  ctx.font = `700 ${FONT.lg}px sans-serif`;
  ctx.textAlign = 'center';
  ctx.fillText(btnLabel, W / 2, my + mh - 28);
}

function buildFrames() {
  const frames = [];
  function frame(fn) {
    const c = createCanvas(W, H);
    const ctx = c.getContext('2d');
    fn(ctx);
    frames.push(c);
  }

  // Phase 1: Day ending — tick bar fills to 100% (8 frames)
  for (let i = 0; i < 8; i++) {
    frame((ctx) => {
      drawShopFloor(ctx, 530, 6, 0.9 + i * 0.012);
      if (i >= 6) {
        // "Day ending" label appears
        roundRect(ctx, W / 2 - 80, 500, 160, 36, RADIUS.md, UI.hudBg, null);
        ctx.fillStyle = UI.hudText;
        ctx.font = `600 ${FONT.sm}px sans-serif`;
        ctx.textAlign = 'center';
        ctx.fillText('Day ending... 🌙', W / 2, 522);
      }
    });
  }

  // Phase 2: Modal slides up from bottom (10 frames)
  for (let i = 0; i < 10; i++) {
    const slideY = Math.round((1 - i / 9) * 300);
    frame((ctx) => {
      drawShopFloor(ctx, 530, 6, 1.0);
      drawDayEndModal(ctx, {
        slideY,
        earnings: 187,
        wages: 0,
        net: 0,
        showWages: false,
        showNet: false,
        btnLabel: 'Start Day 2 →',
      });
    });
  }

  // Phase 3: Earnings tally animates $0 → $187 (10 frames)
  for (let i = 0; i < 10; i++) {
    const earningsShown = Math.round((i / 9) * 187);
    frame((ctx) => {
      drawShopFloor(ctx, 530, 6, 1.0);
      drawDayEndModal(ctx, {
        slideY: 0,
        earnings: earningsShown,
        wages: 0,
        net: 0,
        showWages: false,
        showNet: false,
        btnLabel: 'Start Day 2 →',
      });
    });
  }

  // Phase 4: Wages appear with red flash (6 frames)
  for (let i = 0; i < 6; i++) {
    frame((ctx) => {
      drawShopFloor(ctx, 530, 6, 1.0);
      drawDayEndModal(ctx, {
        slideY: 0,
        earnings: 187,
        wages: 40,
        net: 0,
        showWages: true,
        showNet: false,
        btnLabel: 'Start Day 2 →',
      });
    });
  }

  // Phase 5: Net profit revealed (6 frames)
  for (let i = 0; i < 6; i++) {
    frame((ctx) => {
      drawShopFloor(ctx, 530, 6, 1.0);
      drawDayEndModal(ctx, {
        slideY: 0,
        earnings: 187,
        wages: 40,
        net: 147,
        showWages: true,
        showNet: true,
        btnLabel: 'Start Day 2 →',
      });
    });
  }

  // Phase 6: Hold on final state (6 frames)
  for (let i = 0; i < 6; i++) {
    frame((ctx) => {
      drawShopFloor(ctx, 490, 6, 1.0);
      drawDayEndModal(ctx, {
        slideY: 0,
        earnings: 187,
        wages: 40,
        net: 147,
        showWages: true,
        showNet: true,
        btnLabel: 'Start Day 2 →',
      });
    });
  }

  return frames;
}

module.exports = { buildFrames };
