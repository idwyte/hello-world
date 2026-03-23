/**
 * GIF 1: Customer arrival → walks in from left → idles with patience bar → taps to seat → walks to station
 * ~44 frames @ 80ms — landscape spatial floor view
 */
const { createCanvas } = require('canvas');
const { W, H, NPC_W, NPC_H, ZONE, getStationPositions, getWaitingPos } = require('./theme');
const { clearBg, drawHUD, drawFloor, drawStation, drawNpc, drawBench, roundRect } = require('./drawHelpers');
const { UI, FONT, RADIUS, SALON } = require('./theme');

const STATIONS = getStationPositions(2);
const BENCH_X  = ZONE.waitingX - 4;
const BENCH_W  = ZONE.slotSpacing * 4;

function buildFrames() {
  const frames = [];
  function frame(fn) {
    const c = createCanvas(W, H);
    const ctx = c.getContext('2d');
    fn(ctx);
    frames.push(c);
  }

  // ── Phase 1: Empty shop, day not yet active (6 frames) ───────────────────
  for (let i = 0; i < 6; i++) {
    frame((ctx) => {
      clearBg(ctx);
      drawFloor(ctx);
      drawHUD(ctx, { money: 500, reputation: 0, day: 1, tickFraction: 0, isDayActive: false });

      // Empty stations
      STATIONS.forEach((pos) => {
        drawStation(ctx, { fixtureX: pos.fixtureX, fixtureW: pos.fixtureW, stationY: pos.npcY - 24, hasCustomer: false });
      });
      drawBench(ctx, { x: BENCH_X, y: ZONE.waitingY + NPC_H, width: BENCH_W });
    });
  }

  // ── Phase 2: Day opens — "Open Shop" tapped (3 frames) ───────────────────
  for (let i = 0; i < 3; i++) {
    frame((ctx) => {
      clearBg(ctx);
      drawFloor(ctx);
      drawHUD(ctx, { money: 500, reputation: 0, day: 1, tickFraction: i / 40, isDayActive: true });

      STATIONS.forEach((pos) => {
        drawStation(ctx, { fixtureX: pos.fixtureX, fixtureW: pos.fixtureW, stationY: pos.npcY - 24, hasCustomer: false });
      });
      drawBench(ctx, { x: BENCH_X, y: ZONE.waitingY + NPC_H, width: BENCH_W });
    });
  }

  // ── Phase 3: Maya walks in from left (10 frames) ──────────────────────────
  const slot0 = getWaitingPos(0);
  for (let i = 0; i < 10; i++) {
    const t = i / 9;
    // Spring-like ease: fast start, slower end
    const ease = 1 - Math.pow(1 - t, 2.5);
    const npcX = Math.round(-NPC_W + ease * (slot0.x + NPC_W));
    frame((ctx) => {
      clearBg(ctx);
      drawFloor(ctx);
      drawHUD(ctx, { money: 500, reputation: 0, day: 1, tickFraction: (3 + i) / 40, isDayActive: true });

      STATIONS.forEach((pos) => {
        drawStation(ctx, { fixtureX: pos.fixtureX, fixtureW: pos.fixtureW, stationY: pos.npcY - 24, hasCustomer: false });
      });
      drawBench(ctx, { x: BENCH_X, y: ZONE.waitingY + NPC_H, width: BENCH_W });

      // Maya walking in
      drawNpc(ctx, {
        x: npcX, y: slot0.y,
        skinTone: '#EBB882', hairColor: '#FF69B4', shirtColor: '#EC4899',
        name: 'Maya',
        showPatience: i > 6, patienceFrac: 1.0,
      });

      // Arrival notification
      if (i === 9) {
        roundRect(ctx, W / 2 - 80, H - 36, 160, 26, RADIUS.sm, UI.hudBg, null);
        ctx.fillStyle = UI.hudText;
        ctx.font = `600 ${FONT.sm}px sans-serif`;
        ctx.textAlign = 'center';
        ctx.fillText('🔔 Maya arrived!', W / 2, H - 18);
      }
    });
  }

  // ── Phase 4: Maya idle in waiting zone with patience bar (10 frames) ──────
  for (let i = 0; i < 10; i++) {
    const bounce = Math.sin(i * 0.8) * 2.5;
    const patience = 1.0 - i * 0.012;
    frame((ctx) => {
      clearBg(ctx);
      drawFloor(ctx);
      drawHUD(ctx, { money: 500, reputation: 0, day: 1, tickFraction: (13 + i) / 40, isDayActive: true });

      STATIONS.forEach((pos) => {
        drawStation(ctx, { fixtureX: pos.fixtureX, fixtureW: pos.fixtureW, stationY: pos.npcY - 24, hasCustomer: false });
      });
      drawBench(ctx, { x: BENCH_X, y: ZONE.waitingY + NPC_H, width: BENCH_W });

      drawNpc(ctx, {
        x: slot0.x, y: slot0.y + bounce,
        skinTone: '#EBB882', hairColor: '#FF69B4', shirtColor: '#EC4899',
        name: 'Maya',
        showPatience: true, patienceFrac: patience,
      });

      // Tutorial tip
      if (i < 8) {
        roundRect(ctx, W / 2 - 120, H - 38, 240, 28, RADIUS.sm, UI.hudBg, null);
        ctx.fillStyle = UI.hudText;
        ctx.font = `600 ${FONT.xs}px sans-serif`;
        ctx.textAlign = 'center';
        ctx.fillText('👆 Tap Maya to seat her at a station!', W / 2, H - 20);
      }
    });
  }

  // ── Phase 5: Tap → station picker appears (4 frames) ─────────────────────
  for (let i = 0; i < 4; i++) {
    const sheetY = H - Math.round((i / 3) * 120);
    frame((ctx) => {
      clearBg(ctx);
      drawFloor(ctx);
      drawHUD(ctx, { money: 500, reputation: 0, day: 1, tickFraction: 0.6, isDayActive: true });

      STATIONS.forEach((pos) => {
        drawStation(ctx, { fixtureX: pos.fixtureX, fixtureW: pos.fixtureW, stationY: pos.npcY - 24, hasCustomer: false });
      });
      drawBench(ctx, { x: BENCH_X, y: ZONE.waitingY + NPC_H, width: BENCH_W });

      drawNpc(ctx, {
        x: slot0.x, y: slot0.y,
        skinTone: '#EBB882', hairColor: '#FF69B4', shirtColor: '#EC4899',
        name: 'Maya', showPatience: true, patienceFrac: 0.88,
      });

      // Bottom sheet
      roundRect(ctx, 0, sheetY, W, H - sheetY, RADIUS.lg, UI.panelBg, null);
      if (sheetY < H - 80) {
        ctx.fillStyle = UI.textPrimary;
        ctx.font = `700 ${FONT.md}px sans-serif`;
        ctx.textAlign = 'left';
        ctx.fillText('Seat Maya at…', 20, sheetY + 28);

        roundRect(ctx, 20, sheetY + 42, W / 2 - 30, 32, RADIUS.md, UI.btnActive, null);
        ctx.fillStyle = '#FFFFFF';
        ctx.font = `700 ${FONT.sm}px sans-serif`;
        ctx.textAlign = 'center';
        ctx.fillText('Station 1 — Tier 1', (W / 2 - 30) / 2 + 20, sheetY + 62);

        roundRect(ctx, W / 2, sheetY + 42, W / 2 - 30, 32, RADIUS.md, UI.btnActive, null);
        ctx.fillStyle = '#FFFFFF';
        ctx.fillText('Station 2 — Tier 1', W * 0.75, sheetY + 62);
      }
    });
  }

  // ── Phase 6: Maya springs to station 1 (11 frames) ───────────────────────
  const stationPos = STATIONS[0];
  for (let i = 0; i < 11; i++) {
    const t = i / 10;
    const ease = 1 - Math.pow(1 - t, 2.2);
    const arcY = Math.sin(t * Math.PI) * -20; // slight arc upward
    const npcX = Math.round(slot0.x + ease * (stationPos.npcX - slot0.x));
    const npcY = Math.round(slot0.y + ease * (stationPos.npcY - slot0.y) + arcY);
    const progress = Math.min(1, i / 10 * 0.1);
    frame((ctx) => {
      clearBg(ctx);
      drawFloor(ctx);
      drawHUD(ctx, { money: 500, reputation: 0, day: 1, tickFraction: 0.65, isDayActive: true });

      // Station 1 shows occupied
      drawStation(ctx, {
        fixtureX: stationPos.fixtureX, fixtureW: stationPos.fixtureW,
        stationY: stationPos.npcY - 24, hasCustomer: i > 8, progress,
      });
      drawStation(ctx, {
        fixtureX: STATIONS[1].fixtureX, fixtureW: STATIONS[1].fixtureW,
        stationY: STATIONS[1].npcY - 24, hasCustomer: false,
      });
      drawBench(ctx, { x: BENCH_X, y: ZONE.waitingY + NPC_H, width: BENCH_W });

      drawNpc(ctx, {
        x: npcX, y: npcY,
        skinTone: '#EBB882', hairColor: '#FF69B4', shirtColor: '#EC4899',
        name: 'Maya',
      });
    });
  }

  return frames;
}

module.exports = { buildFrames };
