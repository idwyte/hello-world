/**
 * GIF 4: Day end — tick bar fills to 100%, modal slides up, earnings tally, net profit
 * ~46 frames @ 90ms — landscape spatial floor view
 */
const { createCanvas } = require('canvas');
const { W, H, NPC_W, NPC_H, ZONE, getStationPositions } = require('./theme');
const { clearBg, drawHUD, drawFloor, drawStation, drawBench, drawReviewCard, drawDayEndModal, roundRect } = require('./drawHelpers');
const { UI, FONT, RADIUS, SALON } = require('./theme');

const STATIONS = getStationPositions(2);
const BENCH_X  = ZONE.waitingX - 4;
const BENCH_W  = ZONE.slotSpacing * 4;

function drawEndScene(ctx, money, rep, tick) {
  clearBg(ctx);
  drawFloor(ctx);
  drawHUD(ctx, { money, reputation: rep, day: 1, tickFraction: tick, isDayActive: true });
  drawStation(ctx, { fixtureX: STATIONS[0].fixtureX, fixtureW: STATIONS[0].fixtureW, stationY: STATIONS[0].npcY - 24, hasCustomer: false });
  drawStation(ctx, { fixtureX: STATIONS[1].fixtureX, fixtureW: STATIONS[1].fixtureW, stationY: STATIONS[1].npcY - 24, hasCustomer: false });
  drawBench(ctx, { x: BENCH_X, y: ZONE.waitingY + NPC_H, width: BENCH_W });
  drawReviewCard(ctx, { text: 'Perfect! Cherry red is stunning 💅', stars: 5, name: 'Maya T.', x: W - 248, y: H - 58 });
}

function buildFrames() {
  const frames = [];
  function frame(fn) {
    const c = createCanvas(W, H);
    const ctx = c.getContext('2d');
    fn(ctx);
    frames.push(c);
  }

  // ── Phase 1: Day ending — progress bar fills to 100% (8 frames) ──────────
  for (let i = 0; i < 8; i++) {
    const tick = 0.88 + i * 0.015;
    frame((ctx) => {
      drawEndScene(ctx, 530, 6, Math.min(tick, 1.0));

      if (i >= 5) {
        // "Day ending" chip
        roundRect(ctx, W / 2 - 80, H - 44, 160, 28, RADIUS.sm, UI.hudBg, null);
        ctx.fillStyle = UI.hudText;
        ctx.font = `600 ${FONT.sm}px sans-serif`;
        ctx.textAlign = 'center';
        ctx.fillText('Day ending... 🌙', W / 2, H - 24);
      }
    });
  }

  // ── Phase 2: Modal slides up from bottom (10 frames) ─────────────────────
  for (let i = 0; i < 10; i++) {
    const t = i / 9;
    const ease = 1 - Math.pow(1 - t, 2.5);
    const slideY = Math.round((1 - ease) * (H / 2));
    frame((ctx) => {
      drawEndScene(ctx, 530, 6, 1.0);
      drawDayEndModal(ctx, {
        slideY,
        earnings: 187, wages: 0, net: 0,
        showWages: false, showNet: false,
        btnLabel: 'Start Day 2 →',
      });
    });
  }

  // ── Phase 3: Earnings animate $0 → $187 (10 frames) ──────────────────────
  for (let i = 0; i < 10; i++) {
    const e = Math.round((i / 9) * 187);
    frame((ctx) => {
      drawEndScene(ctx, 530, 6, 1.0);
      drawDayEndModal(ctx, {
        slideY: 0,
        earnings: e, wages: 0, net: 0,
        showWages: false, showNet: false,
        btnLabel: 'Start Day 2 →',
      });
    });
  }

  // ── Phase 4: Wages appear with red flash (6 frames) ──────────────────────
  for (let i = 0; i < 6; i++) {
    frame((ctx) => {
      drawEndScene(ctx, 530, 6, 1.0);
      drawDayEndModal(ctx, {
        slideY: 0,
        earnings: 187, wages: 40, net: 0,
        showWages: true, showNet: false,
        btnLabel: 'Start Day 2 →',
      });
      // Red flash overlay on HUD
      if (i < 2) {
        ctx.fillStyle = `rgba(244,63,94,${0.15 - i * 0.07})`;
        ctx.fillRect(0, 0, W, 44);
      }
    });
  }

  // ── Phase 5: Net profit revealed in emerald (6 frames) ───────────────────
  for (let i = 0; i < 6; i++) {
    frame((ctx) => {
      drawEndScene(ctx, 490, 6, 1.0);
      drawDayEndModal(ctx, {
        slideY: 0,
        earnings: 187, wages: 40, net: 147,
        showWages: true, showNet: true,
        btnLabel: 'Start Day 2 →',
      });
    });
  }

  // ── Phase 6: Hold final state (6 frames) ─────────────────────────────────
  for (let i = 0; i < 6; i++) {
    frame((ctx) => {
      drawEndScene(ctx, 490, 6, 1.0);
      drawDayEndModal(ctx, {
        slideY: 0,
        earnings: 187, wages: 40, net: 147,
        showWages: true, showNet: true,
        btnLabel: 'Start Day 2 →',
      });
    });
  }

  return frames;
}

module.exports = { buildFrames };
