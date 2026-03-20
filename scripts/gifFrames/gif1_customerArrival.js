/**
 * GIF 1: Customer arrival → patience bar → player taps "Seat →" → assigned to station
 * ~42 frames @ 80ms
 */
const { createCanvas } = require('canvas');
const { W, H } = require('./theme');
const {
  clearBg, drawHUD, drawShopName, drawSectionLabel,
  drawStation, drawCustomerCard, roundRect,
} = require('./drawHelpers');
const { UI, FONT, SPACING, RADIUS } = require('./theme');

function buildFrames() {
  const frames = [];
  const shopH  = H;

  function frame(fn) {
    const c = createCanvas(W, shopH);
    const ctx = c.getContext('2d');
    fn(ctx);
    frames.push(c);
  }

  // Phase 1: Empty shop, day active (8 frames)
  for (let i = 0; i < 8; i++) {
    frame((ctx) => {
      clearBg(ctx, shopH);
      drawHUD(ctx, { money: 500, reputation: 0, day: 1, tickFraction: i / 40 });
      drawShopName(ctx, "Jade's Nail Studio", 130);
      drawSectionLabel(ctx, 'Nail Stations', 156);

      const sw = (W - 48) / 2;
      drawStation(ctx, { id: 'station_1', hasCustomer: false, y: 168, x: 16, w: sw });
      drawStation(ctx, { id: 'station_2', hasCustomer: false, y: 168, x: 24 + sw, w: sw });

      drawSectionLabel(ctx, 'Waiting Queue (0)', 310);
      ctx.fillStyle = UI.textMuted;
      ctx.font = `${FONT.md}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.fillText('No customers waiting yet...', W / 2, 360);
    });
  }

  // Phase 2: Customer walks in — slide from off-screen left (10 frames)
  for (let i = 0; i < 10; i++) {
    const slideX = Math.round((i / 9) * 0) + (i === 9 ? 0 : -(1 - i / 9) * (W + 50));
    frame((ctx) => {
      clearBg(ctx, shopH);
      drawHUD(ctx, { money: 500, reputation: 0, day: 1, tickFraction: (8 + i) / 40 });
      drawShopName(ctx, "Jade's Nail Studio", 130);
      drawSectionLabel(ctx, 'Nail Stations', 156);

      const sw = (W - 48) / 2;
      drawStation(ctx, { id: 'station_1', hasCustomer: false, y: 168, x: 16, w: sw });
      drawStation(ctx, { id: 'station_2', hasCustomer: false, y: 168, x: 24 + sw, w: sw });

      drawSectionLabel(ctx, 'Waiting Queue (1)', 310);

      // Sliding card
      ctx.save();
      ctx.translate(slideX, 0);
      drawCustomerCard(ctx, {
        name: 'Maya',
        service: 'Basic Manicure • $15',
        patienceFraction: 1.0,
        y: 322,
      });
      ctx.restore();

      // Sound icon appears on arrival
      if (i === 9) {
        ctx.fillStyle = UI.btnActive;
        ctx.font = `${FONT.xxl}px sans-serif`;
        ctx.textAlign = 'left';
        ctx.fillText('🔔', 16, 420);
      }
    });
  }

  // Phase 3: Customer waits, patience draining slightly (10 frames)
  for (let i = 0; i < 10; i++) {
    const patience = 1.0 - i * 0.015; // barely drains (Maya has 999 patience)
    frame((ctx) => {
      clearBg(ctx, shopH);
      drawHUD(ctx, { money: 500, reputation: 0, day: 1, tickFraction: (18 + i) / 40 });
      drawShopName(ctx, "Jade's Nail Studio", 130);
      drawSectionLabel(ctx, 'Nail Stations', 156);

      const sw = (W - 48) / 2;
      drawStation(ctx, { id: 'station_1', hasCustomer: false, y: 168, x: 16, w: sw });
      drawStation(ctx, { id: 'station_2', hasCustomer: false, y: 168, x: 24 + sw, w: sw });

      drawSectionLabel(ctx, 'Waiting Queue (1)', 310);
      drawCustomerCard(ctx, {
        name: 'Maya',
        service: 'Basic Manicure • $15',
        patienceFraction: patience,
        y: 322,
      });

      // Tutorial tooltip
      roundRect(ctx, 16, 400, W - 32, 50, RADIUS.md, UI.hudBg, null);
      ctx.fillStyle = UI.hudText;
      ctx.font = `${FONT.sm}px sans-serif`;
      ctx.textAlign = 'left';
      ctx.fillText('👋 A customer arrived! Tap "Seat →" to assign them.', 26, 430);
    });
  }

  // Phase 4: Tap animation + transition (6 frames)
  for (let i = 0; i < 6; i++) {
    const scale = i < 3 ? 1 - i * 0.05 : 0.85 + (i - 3) * 0.05;
    frame((ctx) => {
      clearBg(ctx, shopH);
      drawHUD(ctx, { money: 500, reputation: 0, day: 1, tickFraction: 0.7 });
      drawShopName(ctx, "Jade's Nail Studio", 130);
      drawSectionLabel(ctx, 'Nail Stations', 156);

      const sw = (W - 48) / 2;
      // Station 1 now has customer
      if (i >= 3) {
        drawStation(ctx, {
          id: 'station_1', hasCustomer: true,
          customerName: 'Maya', progress: 0,
          y: 168, x: 16, w: sw,
        });
      } else {
        drawStation(ctx, { id: 'station_1', hasCustomer: false, y: 168, x: 16, w: sw });
      }
      drawStation(ctx, { id: 'station_2', hasCustomer: false, y: 168, x: 24 + sw, w: sw });

      // Queue empties after tap
      if (i < 3) {
        drawSectionLabel(ctx, 'Waiting Queue (1)', 310);
        ctx.save();
        ctx.globalAlpha = 1 - i / 3;
        drawCustomerCard(ctx, {
          name: 'Maya',
          service: 'Basic Manicure • $15',
          patienceFraction: 0.85,
          y: 322,
        });
        ctx.restore();
      } else {
        drawSectionLabel(ctx, 'Waiting Queue (0)', 310);
        ctx.fillStyle = UI.textMuted;
        ctx.font = `${FONT.md}px sans-serif`;
        ctx.textAlign = 'center';
        ctx.fillText('No customers waiting...', W / 2, 360);
      }
    });
  }

  // Phase 5: Service progressing (8 frames)
  for (let i = 0; i < 8; i++) {
    const progress = i / 7 * 0.35;
    frame((ctx) => {
      clearBg(ctx, shopH);
      drawHUD(ctx, { money: 500, reputation: 0, day: 1, tickFraction: 0.7 + i * 0.01 });
      drawShopName(ctx, "Jade's Nail Studio", 130);
      drawSectionLabel(ctx, 'Nail Stations', 156);

      const sw = (W - 48) / 2;
      drawStation(ctx, {
        id: 'station_1', hasCustomer: true,
        customerName: 'Maya', progress,
        staffName: null,
        y: 168, x: 16, w: sw,
      });
      drawStation(ctx, { id: 'station_2', hasCustomer: false, y: 168, x: 24 + sw, w: sw });
      drawSectionLabel(ctx, 'Waiting Queue (0)', 310);
    });
  }

  return frames;
}

module.exports = { buildFrames };
