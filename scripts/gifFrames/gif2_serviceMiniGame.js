/**
 * GIF 2: Service mini-game — shape picker → color picker → applying → summary
 * ~54 frames @ 100ms — landscape with service panel overlay at bottom
 */
const { createCanvas } = require('canvas');
const { W, H, NPC_W, NPC_H, ZONE, getStationPositions } = require('./theme');
const { clearBg, drawHUD, drawFloor, drawStation, drawNpc, roundRect } = require('./drawHelpers');
const { UI, FONT, RADIUS, SALON } = require('./theme');

const STATIONS = getStationPositions(2);

function drawNailHand(ctx, nailColor, cx, cy) {
  const skinTone = '#EBB882';
  ctx.fillStyle = skinTone;
  roundRect(ctx, cx - 28, cy, 56, 44, 8, skinTone, null);
  const fingers = [-20, -10, 0, 10, 20];
  fingers.forEach((dx, i) => {
    ctx.fillStyle = skinTone;
    ctx.beginPath();
    ctx.ellipse(cx + dx, cy - 8 - (i === 2 ? 3 : i === 1 || i === 3 ? 1 : 0), 6, 15, 0, 0, Math.PI * 2);
    ctx.fill();
    if (nailColor) {
      ctx.fillStyle = nailColor;
      ctx.beginPath();
      ctx.ellipse(cx + dx, cy - 18 - (i === 2 ? 3 : 0), 4, 7, 0, 0, Math.PI * 2);
      ctx.fill();
    }
  });
}

function drawServicePanel(ctx, { title, panelY }) {
  // Frosted panel overlay
  ctx.fillStyle = 'rgba(253,242,248,0.96)';
  roundRect(ctx, 0, panelY, W, H - panelY, RADIUS.lg, 'rgba(253,242,248,0.96)', null);
  ctx.strokeStyle = UI.panelBorder;
  ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(0, panelY); ctx.lineTo(W, panelY); ctx.stroke();

  // Drag handle
  ctx.fillStyle = UI.panelBorder;
  roundRect(ctx, W / 2 - 20, panelY + 8, 40, 4, 2, UI.panelBorder, null);

  ctx.fillStyle = UI.textPrimary;
  ctx.font = `700 ${FONT.lg}px sans-serif`;
  ctx.textAlign = 'center';
  ctx.fillText(title, W / 2, panelY + 36);
}

function buildFrames() {
  const frames = [];
  function frame(fn) {
    const c = createCanvas(W, H);
    const ctx = c.getContext('2d');
    fn(ctx);
    frames.push(c);
  }

  const PANEL_Y = H - 200;
  const stationPos = STATIONS[0];

  // ── Phase 1: Shape selector — cycling (12 frames) ─────────────────────────
  const shapes = ['Square', 'Square', 'Round', 'Round', 'Oval', 'Oval',
                  'Almond', 'Almond', 'Coffin', 'Coffin', 'Coffin', 'Coffin'];
  const nailPreviews = {
    Square:  '#EC4899', Round: '#A855F7', Oval: '#EC4899',
    Almond:  '#F59E0B', Coffin: '#EC4899',
  };

  shapes.forEach((shape, i) => {
    frame((ctx) => {
      clearBg(ctx);
      drawFloor(ctx);
      drawHUD(ctx, { money: 512, reputation: 2, day: 1, tickFraction: 0.3, isDayActive: true });

      // Station with Maya seated
      drawStation(ctx, {
        fixtureX: stationPos.fixtureX, fixtureW: stationPos.fixtureW,
        stationY: stationPos.npcY - 24, hasCustomer: true, progress: 0.15,
      });
      drawStation(ctx, {
        fixtureX: STATIONS[1].fixtureX, fixtureW: STATIONS[1].fixtureW,
        stationY: STATIONS[1].npcY - 24, hasCustomer: false,
      });
      drawNpc(ctx, {
        x: stationPos.npcX, y: stationPos.npcY,
        skinTone: '#EBB882', hairColor: '#FF69B4', shirtColor: '#EC4899', name: 'Maya',
      });

      // Service panel
      drawServicePanel(ctx, { title: '💅 Choose a Shape', panelY: PANEL_Y });

      // Hand preview
      drawNailHand(ctx, nailPreviews[shape] ?? '#EC4899', W * 0.25, PANEL_Y + 90);

      // Shape buttons
      const shapeList = ['Square', 'Round', 'Oval', 'Almond', 'Coffin'];
      const bw = 72, gap = 10;
      const totalW = shapeList.length * (bw + gap) - gap;
      const startX = W * 0.35 + (W * 0.6 - totalW) / 2;
      shapeList.forEach((s, j) => {
        const bx = startX + j * (bw + gap);
        const isSel = s === shape;
        roundRect(ctx, bx, PANEL_Y + 60, bw, 32, RADIUS.sm,
          isSel ? UI.btnActive : UI.panelBg,
          isSel ? null : UI.panelBorder);
        ctx.fillStyle = isSel ? '#FFFFFF' : UI.textPrimary;
        ctx.font = `${isSel ? '700 ' : ''}${FONT.xs}px sans-serif`;
        ctx.textAlign = 'center';
        ctx.fillText(s, bx + bw / 2, PANEL_Y + 80);
      });

      // Hint
      ctx.fillStyle = UI.textMuted;
      ctx.font = `${FONT.xs}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.fillText('Maya seems to like clean, structured looks 🤔', W / 2, PANEL_Y + 118);

      // Next button
      roundRect(ctx, W - 120, PANEL_Y + 150, 100, 32, RADIUS.md, UI.btnActive, null);
      ctx.fillStyle = '#FFFFFF';
      ctx.font = `700 ${FONT.sm}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.fillText('Next →', W - 70, PANEL_Y + 170);
    });
  });

  // ── Phase 2: Color picker — landing on cherry red (14 frames) ─────────────
  const colors = [null, null, '#FF0000', '#FF0000', '#C41E3A', '#DC143C',
                  '#DC143C', '#DC143C', '#DC143C', '#DC143C', '#DC143C', '#DC143C', '#DC143C', '#DC143C'];

  colors.forEach((color, i) => {
    frame((ctx) => {
      clearBg(ctx);
      drawFloor(ctx);
      drawHUD(ctx, { money: 512, reputation: 2, day: 1, tickFraction: 0.3, isDayActive: true });

      drawStation(ctx, {
        fixtureX: stationPos.fixtureX, fixtureW: stationPos.fixtureW,
        stationY: stationPos.npcY - 24, hasCustomer: true, progress: 0.20,
      });
      drawStation(ctx, { fixtureX: STATIONS[1].fixtureX, fixtureW: STATIONS[1].fixtureW, stationY: STATIONS[1].npcY - 24, hasCustomer: false });
      drawNpc(ctx, { x: stationPos.npcX, y: stationPos.npcY, skinTone: '#EBB882', hairColor: '#FF69B4', shirtColor: '#EC4899', name: 'Maya' });

      drawServicePanel(ctx, { title: '🎨 Pick a Color', panelY: PANEL_Y });

      // Hand with selected color
      drawNailHand(ctx, color || '#E0D4D4', W * 0.25, PANEL_Y + 90);

      // Color swatches (reds collection)
      const reds = ['#C41E3A', '#DC143C', '#FF0000', '#B22222', '#8B0000', '#FF6B6B',
                    '#FF4500', '#E63946', '#9B2335', '#FF7F7F', '#CC3333', '#FF3333'];
      const cols = 6, sw = 28, sg = 6;
      const gridX = W * 0.35 + 10;
      reds.forEach((c, ri) => {
        const col = ri % cols, row = Math.floor(ri / cols);
        const sx = gridX + col * (sw + sg);
        const sy = PANEL_Y + 58 + row * (sw + sg);
        const isSel = c === color;
        roundRect(ctx, sx, sy, sw, sw, 4, c, isSel ? '#18181B' : null);
        if (isSel) {
          ctx.fillStyle = '#FFFFFF'; ctx.font = `bold 12px sans-serif`; ctx.textAlign = 'center';
          ctx.fillText('✓', sx + sw / 2, sy + sw / 2 + 4);
        }
      });

      if (color) {
        ctx.fillStyle = UI.textMuted; ctx.font = `${FONT.xs}px sans-serif`; ctx.textAlign = 'center';
        ctx.fillText('Cherry Red', W * 0.25, PANEL_Y + 155);
      }
    });
  });

  // ── Phase 3: Applying spinner (8 frames) ──────────────────────────────────
  for (let i = 0; i < 8; i++) {
    frame((ctx) => {
      clearBg(ctx);
      drawFloor(ctx);
      drawHUD(ctx, { money: 512, reputation: 2, day: 1, tickFraction: 0.32, isDayActive: true });

      drawStation(ctx, { fixtureX: stationPos.fixtureX, fixtureW: stationPos.fixtureW, stationY: stationPos.npcY - 24, hasCustomer: true, progress: 0.3 + i * 0.05 });
      drawStation(ctx, { fixtureX: STATIONS[1].fixtureX, fixtureW: STATIONS[1].fixtureW, stationY: STATIONS[1].npcY - 24, hasCustomer: false });
      drawNpc(ctx, { x: stationPos.npcX, y: stationPos.npcY, skinTone: '#EBB882', hairColor: '#FF69B4', shirtColor: '#EC4899', name: 'Maya' });

      // Apply overlay
      ctx.fillStyle = 'rgba(253,242,248,0.96)';
      roundRect(ctx, 0, PANEL_Y, W, H - PANEL_Y, RADIUS.lg, 'rgba(253,242,248,0.96)', null);

      ctx.fillStyle = UI.textPrimary;
      ctx.font = `700 ${FONT.xl}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.fillText('✨ Applying...', W / 2, PANEL_Y + 60);

      // Spinner dots
      const dots = 8;
      for (let d = 0; d < dots; d++) {
        const angle = (d / dots) * Math.PI * 2 + (i / 8) * Math.PI * 2;
        const cx2 = W / 2 + Math.cos(angle) * 30;
        const cy2 = PANEL_Y + 110 + Math.sin(angle) * 30;
        ctx.fillStyle = d === 0 ? UI.btnActive : `rgba(236,72,153,${0.15 + d * 0.1})`;
        ctx.beginPath(); ctx.arc(cx2, cy2, 6, 0, Math.PI * 2); ctx.fill();
      }

      drawNailHand(ctx, '#DC143C', W / 2, PANEL_Y + 130);
    });
  }

  // ── Phase 4: Summary (20 frames — hold) ───────────────────────────────────
  for (let i = 0; i < 20; i++) {
    frame((ctx) => {
      clearBg(ctx);
      drawFloor(ctx);
      drawHUD(ctx, { money: 530, reputation: 4, day: 1, tickFraction: 0.35, isDayActive: true });

      drawStation(ctx, { fixtureX: stationPos.fixtureX, fixtureW: stationPos.fixtureW, stationY: stationPos.npcY - 24, hasCustomer: false });
      drawStation(ctx, { fixtureX: STATIONS[1].fixtureX, fixtureW: STATIONS[1].fixtureW, stationY: STATIONS[1].npcY - 24, hasCustomer: false });
      // Maya exits right
      if (i < 10) {
        const exitX = stationPos.npcX + Math.round((i / 9) * (W + NPC_W - stationPos.npcX));
        drawNpc(ctx, { x: exitX, y: stationPos.npcY, skinTone: '#EBB882', hairColor: '#FF69B4', shirtColor: '#EC4899', name: 'Maya' });
        // Sparkle
        ctx.fillStyle = UI.gold; ctx.font = `24px sans-serif`;
        ctx.textAlign = 'center';
        ctx.globalAlpha = Math.max(0, 1 - i * 0.12);
        ctx.fillText('✨', exitX + NPC_W / 2, stationPos.npcY - 10);
        ctx.globalAlpha = 1;
      }

      // Summary card (center)
      const cx = W / 2, cw = 380, ch = 190, cmx = cx - cw / 2;
      const cmy = H / 2 - ch / 2 - 20;
      roundRect(ctx, cmx, cmy, cw, ch, RADIUS.lg, UI.panelBg, UI.panelBorder);
      ctx.shadowColor = UI.btnActive; ctx.shadowBlur = 16;
      roundRect(ctx, cmx, cmy, cw, ch, RADIUS.lg, null, UI.btnActive);
      ctx.shadowBlur = 0;

      ctx.fillStyle = UI.textPrimary;
      ctx.font = `700 ${FONT.xl}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.fillText('💅 Service Complete!', cx, cmy + 36);

      // Satisfaction ring
      const rcx = cx - 100, rcy = cmy + 90, r = 36;
      ctx.strokeStyle = '#E9D5FF'; ctx.lineWidth = 8;
      ctx.beginPath(); ctx.arc(rcx, rcy, r, -Math.PI / 2, Math.PI * 2 - Math.PI / 2); ctx.stroke();
      ctx.strokeStyle = UI.success; ctx.lineWidth = 8;
      ctx.beginPath(); ctx.arc(rcx, rcy, r, -Math.PI / 2, Math.PI * 2 * 0.94 - Math.PI / 2); ctx.stroke();
      ctx.fillStyle = UI.textPrimary; ctx.font = `700 ${FONT.lg}px sans-serif`; ctx.textAlign = 'center';
      ctx.fillText('94%', rcx, rcy + 6);

      // Earnings breakdown
      const lines = [['Service', '$15'], ['Nail Art', '+$8'], ['Tip', '+$5'], ['Total', '$28']];
      lines.forEach(([label, val], li) => {
        const ry = cmy + 56 + li * 26;
        ctx.fillStyle = li === 3 ? UI.success : UI.textSecondary;
        ctx.font = li === 3 ? `700 ${FONT.md}px sans-serif` : `${FONT.sm}px sans-serif`;
        ctx.textAlign = 'left'; ctx.fillText(label, cx - 30, ry);
        ctx.textAlign = 'right'; ctx.fillText(val, cmx + cw - 24, ry);
      });

      // Stars
      ctx.fillStyle = UI.gold; ctx.font = `${FONT.md}px sans-serif`; ctx.textAlign = 'center';
      ctx.fillText('★★★★★', cx + 60, cmy + 90);
      ctx.fillStyle = UI.textMuted; ctx.font = `${FONT.xs}px sans-serif`;
      ctx.fillText('"Perfect coffin shape!"', cx + 60, cmy + 108);

      // Button
      roundRect(ctx, cmx + 24, cmy + ch - 48, cw - 48, 36, RADIUS.md, UI.btnActive, null);
      ctx.fillStyle = '#FFFFFF'; ctx.font = `700 ${FONT.md}px sans-serif`; ctx.textAlign = 'center';
      ctx.fillText('Done ✓', cx, cmy + ch - 24);
    });
  }

  return frames;
}

module.exports = { buildFrames };
