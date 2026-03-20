/**
 * GIF 3: Review board — 2 existing reviews, new 5-star pops in, money counter animates
 * ~38 frames @ 110ms
 */
const { createCanvas } = require('canvas');
const { W } = require('./theme');
const { clearBg, drawHUD, drawShopName, drawSectionLabel,
        drawStation, drawCustomerCard, drawReview, roundRect } = require('./drawHelpers');
const { UI, FONT, SPACING, RADIUS } = require('./theme');

const H = 844;

const EXISTING_REVIEWS = [
  { text: 'Waited a bit long... but nails look ok 😐', stars: 3, name: 'Priya S.' },
  { text: 'Nice shape, color was a bit off', stars: 3, name: 'Kezia M.' },
];

const NEW_REVIEW = { text: 'Perfect coffin shape! Cherry red is stunning 💅', stars: 5, name: 'Maya T.' };

function buildFrames() {
  const frames = [];
  function frame(fn) {
    const c = createCanvas(W, H);
    const ctx = c.getContext('2d');
    fn(ctx);
    frames.push(c);
  }

  // Phase 1: Static scene with 2 reviews (8 frames)
  for (let i = 0; i < 8; i++) {
    frame((ctx) => {
      clearBg(ctx, H);
      drawHUD(ctx, { money: 502, reputation: 4, day: 1, tickFraction: 0.4 });
      drawShopName(ctx, "Jade's Nail Studio", 130);

      // Review board
      ctx.fillStyle = UI.textSecondary;
      ctx.font = `600 ${FONT.xs}px sans-serif`;
      ctx.textAlign = 'left';
      ctx.fillText('RECENT REVIEWS', 16, 155);

      drawReview(ctx, { ...EXISTING_REVIEWS[0], y: 162 });
      drawReview(ctx, { ...EXISTING_REVIEWS[1], y: 212 });

      drawSectionLabel(ctx, 'Nail Stations', 272);
      const sw = (W - 48) / 2;
      drawStation(ctx, {
        id: 'station_1', hasCustomer: true,
        customerName: 'Maya', progress: 1.0,
        y: 284, x: 16, w: sw,
      });
      drawStation(ctx, { id: 'station_2', hasCustomer: false, y: 284, x: 24 + sw, w: sw });
    });
  }

  // Phase 2: Service completes — money counter jumps (6 frames)
  const moneySteps = [502, 510, 520, 526, 528, 530];
  for (let i = 0; i < 6; i++) {
    frame((ctx) => {
      clearBg(ctx, H);
      drawHUD(ctx, { money: moneySteps[i], reputation: 4, day: 1, tickFraction: 0.42 });
      drawShopName(ctx, "Jade's Nail Studio", 130);

      ctx.fillStyle = UI.textSecondary;
      ctx.font = `600 ${FONT.xs}px sans-serif`;
      ctx.textAlign = 'left';
      ctx.fillText('RECENT REVIEWS', 16, 155);

      drawReview(ctx, { ...EXISTING_REVIEWS[0], y: 162 });
      drawReview(ctx, { ...EXISTING_REVIEWS[1], y: 212 });

      // Cash register flash
      if (i < 3) {
        ctx.fillStyle = `rgba(212,160,23,${0.4 - i * 0.12})`;
        ctx.fillRect(0, 44, W, 56);

        // Floating +$28
        ctx.fillStyle = UI.gold;
        ctx.font = `700 ${FONT.xl}px sans-serif`;
        ctx.textAlign = 'center';
        ctx.globalAlpha = 1 - i * 0.2;
        ctx.fillText(`+$28 💰`, W / 2, 240 - i * 20);
        ctx.globalAlpha = 1;
      }

      drawSectionLabel(ctx, 'Nail Stations', 272);
      const sw = (W - 48) / 2;
      drawStation(ctx, { id: 'station_1', hasCustomer: false, y: 284, x: 16, w: sw });
      drawStation(ctx, { id: 'station_2', hasCustomer: false, y: 284, x: 24 + sw, w: sw });
    });
  }

  // Phase 3: New review slides in from bottom (10 frames)
  for (let i = 0; i < 10; i++) {
    const slideY = Math.round((1 - i / 9) * 60);
    const opacity = i / 9;
    frame((ctx) => {
      clearBg(ctx, H);
      drawHUD(ctx, { money: 530, reputation: 6, day: 1, tickFraction: 0.43 });
      drawShopName(ctx, "Jade's Nail Studio", 130);

      ctx.fillStyle = UI.textSecondary;
      ctx.font = `600 ${FONT.xs}px sans-serif`;
      ctx.textAlign = 'left';
      ctx.fillText('RECENT REVIEWS', 16, 155);

      // New 5-star slides in at top
      drawReview(ctx, { ...NEW_REVIEW, y: 162 + slideY, opacity });
      drawReview(ctx, { ...EXISTING_REVIEWS[0], y: 212 + slideY * 0.5 });
      drawReview(ctx, { ...EXISTING_REVIEWS[1], y: 262, opacity: 1 - i * 0.06 });

      drawSectionLabel(ctx, 'Nail Stations', 322);
      const sw = (W - 48) / 2;
      drawStation(ctx, { id: 'station_1', hasCustomer: false, y: 334, x: 16, w: sw });
      drawStation(ctx, { id: 'station_2', hasCustomer: false, y: 334, x: 24 + sw, w: sw });
    });
  }

  // Phase 4: Rep tick up from 4 → 6 (6 frames)
  const repSteps = [4, 4, 5, 5, 6, 6];
  for (let i = 0; i < 6; i++) {
    frame((ctx) => {
      clearBg(ctx, H);
      drawHUD(ctx, { money: 530, reputation: repSteps[i], day: 1, tickFraction: 0.44 });
      drawShopName(ctx, "Jade's Nail Studio", 130);

      ctx.fillStyle = UI.textSecondary;
      ctx.font = `600 ${FONT.xs}px sans-serif`;
      ctx.textAlign = 'left';
      ctx.fillText('RECENT REVIEWS', 16, 155);

      drawReview(ctx, { ...NEW_REVIEW, y: 162 });
      drawReview(ctx, { ...EXISTING_REVIEWS[0], y: 212 });
      drawReview(ctx, { ...EXISTING_REVIEWS[1], y: 262, opacity: 0.55 });

      // Rep gain toast
      if (i < 4) {
        roundRect(ctx, W / 2 - 70, 310, 140, 32, RADIUS.sm, UI.hudBg, null);
        ctx.fillStyle = UI.success;
        ctx.font = `600 ${FONT.sm}px sans-serif`;
        ctx.textAlign = 'center';
        ctx.fillText(`+2 Reputation ⭐`, W / 2, 330);
      }

      drawSectionLabel(ctx, 'Nail Stations', 355);
      const sw = (W - 48) / 2;
      drawStation(ctx, { id: 'station_1', hasCustomer: false, y: 367, x: 16, w: sw });
      drawStation(ctx, { id: 'station_2', hasCustomer: false, y: 367, x: 24 + sw, w: sw });
    });
  }

  // Phase 5: Hold on final state (8 frames)
  for (let i = 0; i < 8; i++) {
    frame((ctx) => {
      clearBg(ctx, H);
      drawHUD(ctx, { money: 530, reputation: 6, day: 1, tickFraction: 0.45 + i * 0.01 });
      drawShopName(ctx, "Jade's Nail Studio", 130);

      ctx.fillStyle = UI.textSecondary;
      ctx.font = `600 ${FONT.xs}px sans-serif`;
      ctx.textAlign = 'left';
      ctx.fillText('RECENT REVIEWS', 16, 155);

      drawReview(ctx, { ...NEW_REVIEW, y: 162 });
      drawReview(ctx, { ...EXISTING_REVIEWS[0], y: 212 });
      drawReview(ctx, { ...EXISTING_REVIEWS[1], y: 262, opacity: 0.55 });

      drawSectionLabel(ctx, 'Nail Stations', 320);
      const sw = (W - 48) / 2;
      drawStation(ctx, { id: 'station_1', hasCustomer: false, y: 332, x: 16, w: sw });
      drawStation(ctx, { id: 'station_2', hasCustomer: false, y: 332, x: 24 + sw, w: sw });
    });
  }

  return frames;
}

module.exports = { buildFrames };
