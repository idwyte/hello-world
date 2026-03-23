/**
 * GIF 3: Review board — 2 existing reviews in overlay, new 5-star pops in, money + rep animate
 * ~38 frames @ 110ms — landscape spatial floor view
 */
const { createCanvas } = require('canvas');
const { W, H, NPC_W, NPC_H, ZONE, getStationPositions, getWaitingPos } = require('./theme');
const { clearBg, drawHUD, drawFloor, drawStation, drawNpc, drawBench, drawReviewCard, roundRect } = require('./drawHelpers');
const { UI, FONT, RADIUS, SALON } = require('./theme');

const STATIONS = getStationPositions(2);
const BENCH_X  = ZONE.waitingX - 4;
const BENCH_W  = ZONE.slotSpacing * 4;

const REV1 = { text: 'Waited a bit long... nails ok 😐', stars: 3, name: 'Priya S.' };
const REV2 = { text: 'Nice shape, color a bit off', stars: 3, name: 'Kezia M.' };
const NEW_REV = { text: 'Perfect coffin shape! Cherry red 💅', stars: 5, name: 'Maya T.' };

const REVIEW_X = W - 248; // bottom-right overlay position

function buildFrames() {
  const frames = [];
  function frame(fn) {
    const c = createCanvas(W, H);
    const ctx = c.getContext('2d');
    fn(ctx);
    frames.push(c);
  }

  // Scene with Maya seated, service nearly done
  function drawBase(ctx, money, rep, tick) {
    clearBg(ctx);
    drawFloor(ctx);
    drawHUD(ctx, { money, reputation: rep, day: 1, tickFraction: tick, isDayActive: true });

    drawStation(ctx, { fixtureX: STATIONS[0].fixtureX, fixtureW: STATIONS[0].fixtureW, stationY: STATIONS[0].npcY - 24, hasCustomer: true, progress: Math.min(1, tick) });
    drawStation(ctx, { fixtureX: STATIONS[1].fixtureX, fixtureW: STATIONS[1].fixtureW, stationY: STATIONS[1].npcY - 24, hasCustomer: false });
    drawBench(ctx, { x: BENCH_X, y: ZONE.waitingY + NPC_H, width: BENCH_W });
    drawNpc(ctx, { x: STATIONS[0].npcX, y: STATIONS[0].npcY, skinTone: '#EBB882', hairColor: '#FF69B4', shirtColor: '#EC4899', name: 'Maya' });
  }

  // ── Phase 1: Static scene with 2 reviews visible (8 frames) ─────────────
  for (let i = 0; i < 8; i++) {
    frame((ctx) => {
      drawBase(ctx, 502, 4, 0.82);
      drawReviewCard(ctx, { ...REV2, x: REVIEW_X, y: H - 108 });
      drawReviewCard(ctx, { ...REV1, x: REVIEW_X, y: H - 58 });
    });
  }

  // ── Phase 2: Service completes — money flash (6 frames) ──────────────────
  const moneySteps = [502, 510, 520, 526, 528, 530];
  for (let i = 0; i < 6; i++) {
    frame((ctx) => {
      drawBase(ctx, moneySteps[i], 4, 0.85);
      drawReviewCard(ctx, { ...REV2, x: REVIEW_X, y: H - 108 });
      drawReviewCard(ctx, { ...REV1, x: REVIEW_X, y: H - 58 });

      // Gold HUD flash
      if (i < 3) {
        ctx.fillStyle = `rgba(251,191,36,${0.25 - i * 0.08})`;
        ctx.fillRect(0, 0, W, 44);
        // Floating +$28
        ctx.fillStyle = UI.gold;
        ctx.font = `700 ${FONT.xl}px sans-serif`;
        ctx.textAlign = 'center';
        ctx.globalAlpha = 1 - i * 0.3;
        ctx.fillText(`+$28 💰`, W / 2, ZONE.stationY - 20 - i * 14);
        ctx.globalAlpha = 1;
      }
    });
  }

  // ── Phase 3: New 5-star review slides in from right (10 frames) ──────────
  for (let i = 0; i < 10; i++) {
    const t = i / 9;
    const ease = 1 - Math.pow(1 - t, 2.2);
    const slideX = REVIEW_X + (W - REVIEW_X) * (1 - ease);
    frame((ctx) => {
      drawBase(ctx, 530, 6, 0.87);
      drawReviewCard(ctx, { ...REV2, x: REVIEW_X, y: H - 108, opacity: Math.max(0.3, 1 - i * 0.06) });
      drawReviewCard(ctx, { ...REV1, x: REVIEW_X, y: H - 58 });
      drawReviewCard(ctx, { ...NEW_REV, x: slideX, y: H - 158, opacity: Math.min(1, t * 1.3) });
    });
  }

  // ── Phase 4: Rep tick up 4 → 6 (6 frames) ────────────────────────────────
  const repSteps = [4, 4, 5, 5, 6, 6];
  for (let i = 0; i < 6; i++) {
    frame((ctx) => {
      drawBase(ctx, 530, repSteps[i], 0.89);
      drawReviewCard(ctx, { ...NEW_REV, x: REVIEW_X, y: H - 158 });
      drawReviewCard(ctx, { ...REV1, x: REVIEW_X, y: H - 108 });
      drawReviewCard(ctx, { ...REV2, x: REVIEW_X, y: H - 58, opacity: 0.45 });

      // Rep gain toast
      if (i < 4) {
        roundRect(ctx, W / 2 - 90, ZONE.stationY - 40, 180, 26, RADIUS.sm, UI.hudBg, null);
        ctx.fillStyle = UI.success;
        ctx.font = `600 ${FONT.sm}px sans-serif`;
        ctx.textAlign = 'center';
        ctx.fillText('+2 Reputation ⭐', W / 2, ZONE.stationY - 22);
      }
    });
  }

  // ── Phase 5: Hold on final state (8 frames) ───────────────────────────────
  for (let i = 0; i < 8; i++) {
    frame((ctx) => {
      clearBg(ctx);
      drawFloor(ctx);
      drawHUD(ctx, { money: 530, reputation: 6, day: 1, tickFraction: 0.90 + i * 0.01, isDayActive: true });
      drawStation(ctx, { fixtureX: STATIONS[0].fixtureX, fixtureW: STATIONS[0].fixtureW, stationY: STATIONS[0].npcY - 24, hasCustomer: false });
      drawStation(ctx, { fixtureX: STATIONS[1].fixtureX, fixtureW: STATIONS[1].fixtureW, stationY: STATIONS[1].npcY - 24, hasCustomer: false });
      drawBench(ctx, { x: BENCH_X, y: ZONE.waitingY + NPC_H, width: BENCH_W });

      drawReviewCard(ctx, { ...NEW_REV, x: REVIEW_X, y: H - 158 });
      drawReviewCard(ctx, { ...REV1, x: REVIEW_X, y: H - 108 });
      drawReviewCard(ctx, { ...REV2, x: REVIEW_X, y: H - 58, opacity: 0.45 });
    });
  }

  return frames;
}

module.exports = { buildFrames };
