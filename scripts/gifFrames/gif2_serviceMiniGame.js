/**
 * GIF 2: Service mini-game — shape picker → color picker → applying → summary
 * ~54 frames @ 100ms
 */
const { createCanvas } = require('canvas');
const { W } = require('./theme');
const { clearBg, drawHUD, roundRect } = require('./drawHelpers');
const { UI, FONT, SPACING, RADIUS } = require('./theme');

const H = 844;

function drawNailHand(ctx, nailColor, shapeLabel, cx, cy) {
  // Hand base
  ctx.fillStyle = '#D4956A';
  roundRect(ctx, cx - 30, cy, 60, 50, 8, '#D4956A', null);

  // Five fingers
  const fingers = [-22, -11, 0, 11, 22];
  fingers.forEach((dx, i) => {
    ctx.fillStyle = '#D4956A';
    ctx.beginPath();
    ctx.ellipse(cx + dx, cy - 10 - (i === 2 ? 4 : i === 1 || i === 3 ? 2 : 0), 7, 18, 0, 0, Math.PI * 2);
    ctx.fill();

    // Nail tip
    if (nailColor) {
      ctx.fillStyle = nailColor;
      ctx.beginPath();
      ctx.ellipse(cx + dx, cy - 22 - (i === 2 ? 4 : 0), 5, 8, 0, 0, Math.PI * 2);
      ctx.fill();
    }
  });
}

function drawShapeSelector(ctx, selectedShape, frameIdx) {
  clearBg(ctx, H);
  drawHUD(ctx, { money: 512, reputation: 2, day: 1, tickFraction: 0.3 });

  // Header
  ctx.fillStyle = UI.textPrimary;
  ctx.font = `700 ${FONT.xl}px sans-serif`;
  ctx.textAlign = 'center';
  ctx.fillText('💅 Choose a Shape', W / 2, 130);

  // Customer hint
  roundRect(ctx, 16, 148, W - 32, 36, RADIUS.sm, UI.panelBg, UI.panelBorder);
  ctx.fillStyle = UI.textSecondary;
  ctx.font = `${FONT.sm}px sans-serif`;
  ctx.textAlign = 'center';
  ctx.fillText('Maya seems to like clean, structured looks... 🤔', W / 2, 170);

  // Nail preview hand
  drawNailHand(ctx, '#E8748A', selectedShape, W / 2, 220);

  // Shape options row
  const shapes = ['Square', 'Round', 'Oval', 'Almond', 'Coffin'];
  const bw = 62;
  const startX = (W - (shapes.length * bw + (shapes.length - 1) * 8)) / 2;
  shapes.forEach((shape, i) => {
    const bx = startX + i * (bw + 8);
    const isSelected = shape === selectedShape;
    roundRect(ctx, bx, 310, bw, 36, RADIUS.sm,
      isSelected ? UI.btnActive : UI.panelBg,
      isSelected ? null : UI.panelBorder);
    ctx.fillStyle = isSelected ? UI.btnText : UI.textPrimary;
    ctx.font = `${FONT.xs}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.fillText(shape, bx + bw / 2, 332);
  });
}

function drawColorPicker(ctx, selectedColor, selectedLabel, frameIdx) {
  clearBg(ctx, H);
  drawHUD(ctx, { money: 512, reputation: 2, day: 1, tickFraction: 0.3 });

  ctx.fillStyle = UI.textPrimary;
  ctx.font = `700 ${FONT.xl}px sans-serif`;
  ctx.textAlign = 'center';
  ctx.fillText('🎨 Choose a Color', W / 2, 130);

  // Collection tabs
  const tabs = ['Nudes', 'Reds', 'Pinks', 'Blues', 'Darks', 'Special'];
  const tw = (W - 32) / tabs.length;
  tabs.forEach((tab, i) => {
    const isActive = tab === 'Reds';
    ctx.fillStyle = isActive ? UI.btnActive : '#E0D4CC';
    ctx.fillRect(16 + i * tw, 148, tw, 28);
    ctx.fillStyle = isActive ? UI.btnText : UI.textPrimary;
    ctx.font = `${FONT.xs}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.fillText(tab, 16 + i * tw + tw / 2, 166);
  });

  // Color swatches (Reds collection)
  const reds = ['#C41E3A', '#DC143C', '#FF0000', '#B22222', '#8B0000', '#FF6B6B',
                 '#FF4500', '#E63946', '#9B2335', '#FF7F7F', '#CC3333', '#FF3333'];
  const swSize = 44;
  const cols = 6;
  reds.forEach((color, i) => {
    const col = i % cols;
    const row = Math.floor(i / cols);
    const sx = 16 + col * (swSize + 8);
    const sy = 188 + row * (swSize + 8);
    const isSelected = color === selectedColor;
    roundRect(ctx, sx, sy, swSize, swSize, RADIUS.sm, color, isSelected ? UI.textPrimary : null);
    if (isSelected) {
      ctx.strokeStyle = UI.textPrimary;
      ctx.lineWidth = 3;
      ctx.strokeRect(sx - 1, sy - 1, swSize + 2, swSize + 2);
      ctx.fillStyle = '#FFFFFF';
      ctx.font = `bold ${FONT.lg}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.fillText('✓', sx + swSize / 2, sy + swSize / 2 + 5);
    }
  });

  // Preview hand with selected color
  drawNailHand(ctx, selectedColor || '#D4D4D4', 'Coffin', W / 2, 380);

  if (selectedLabel) {
    ctx.fillStyle = UI.textSecondary;
    ctx.font = `${FONT.sm}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.fillText(selectedLabel, W / 2, 450);
  }
}

function drawApplying(ctx, progress) {
  clearBg(ctx, H);
  drawHUD(ctx, { money: 512, reputation: 2, day: 1, tickFraction: 0.32 });

  ctx.fillStyle = UI.textPrimary;
  ctx.font = `700 ${FONT.xxl}px sans-serif`;
  ctx.textAlign = 'center';
  ctx.fillText('✨ Applying...', W / 2, 320);

  // Spinner dots
  const dots = 8;
  for (let i = 0; i < dots; i++) {
    const angle = (i / dots) * Math.PI * 2 + progress * Math.PI * 2;
    const x = W / 2 + Math.cos(angle) * 30;
    const y = 380 + Math.sin(angle) * 30;
    ctx.fillStyle = i === 0 ? UI.btnActive : `rgba(232,116,138,${0.2 + i * 0.1})`;
    ctx.beginPath();
    ctx.arc(x, y, 6, 0, Math.PI * 2);
    ctx.fill();
  }

  drawNailHand(ctx, '#DC143C', 'Coffin', W / 2, 440);
}

function drawSummary(ctx) {
  clearBg(ctx, H);
  drawHUD(ctx, { money: 530, reputation: 4, day: 1, tickFraction: 0.35 });

  ctx.fillStyle = UI.textPrimary;
  ctx.font = `700 ${FONT.xxl}px sans-serif`;
  ctx.textAlign = 'center';
  ctx.fillText('💅 Service Complete!', W / 2, 130);

  // Satisfaction ring
  const cx = W / 2, cy = 230, r = 50;
  ctx.strokeStyle = '#E0D4CC';
  ctx.lineWidth = 10;
  ctx.beginPath();
  ctx.arc(cx, cy, r, -Math.PI / 2, Math.PI * 2 * 0.94 - Math.PI / 2);
  ctx.stroke();
  ctx.strokeStyle = UI.success;
  ctx.beginPath();
  ctx.arc(cx, cy, r, -Math.PI / 2, Math.PI * 2 * 0.94 - Math.PI / 2);
  ctx.stroke();

  ctx.fillStyle = UI.textPrimary;
  ctx.font = `700 ${FONT.xxl}px sans-serif`;
  ctx.textAlign = 'center';
  ctx.fillText('94%', cx, cy + 8);
  ctx.fillStyle = UI.textSecondary;
  ctx.font = `${FONT.sm}px sans-serif`;
  ctx.fillText('satisfaction', cx, cy + 26);

  // Breakdown
  const lines = [
    ['Service:', '$15'],
    ['Nail Art Bonus:', '+$8'],
    ['Tip (player done):', '+$5'],
    ['Total:', '$28'],
  ];
  lines.forEach(([label, val], i) => {
    const y = 320 + i * 30;
    ctx.fillStyle = i === 3 ? UI.success : UI.textSecondary;
    ctx.font = i === 3 ? `700 ${FONT.lg}px sans-serif` : `${FONT.md}px sans-serif`;
    ctx.textAlign = 'left';
    ctx.fillText(label, 60, y);
    ctx.textAlign = 'right';
    ctx.fillText(val, W - 60, y);
  });

  // Review generated
  roundRect(ctx, 16, 450, W - 32, 50, RADIUS.md, UI.panelBg, UI.panelBorder);
  ctx.fillStyle = UI.gold;
  ctx.font = `${FONT.md}px sans-serif`;
  ctx.textAlign = 'left';
  ctx.fillText('★★★★★', 26, 470);
  ctx.fillStyle = UI.textSecondary;
  ctx.font = `${FONT.sm}px sans-serif`;
  ctx.fillText('"Perfect coffin shape! The cherry red is stunning 💅"', 26, 488);

  // Done button
  roundRect(ctx, 40, 524, W - 80, 44, RADIUS.md, UI.btnActive, null);
  ctx.fillStyle = UI.btnText;
  ctx.font = `700 ${FONT.lg}px sans-serif`;
  ctx.textAlign = 'center';
  ctx.fillText('Done ✓', W / 2, 550);
}

function buildFrames() {
  const frames = [];
  function frame(fn) {
    const c = createCanvas(W, H);
    const ctx = c.getContext('2d');
    fn(ctx);
    frames.push(c);
  }

  // Phase 1: Shape selector — cycling through options (12 frames)
  const shapeSel = ['Square', 'Square', 'Round', 'Round', 'Oval', 'Oval',
                    'Almond', 'Almond', 'Coffin', 'Coffin', 'Coffin', 'Coffin'];
  shapeSel.forEach((shape, i) => {
    frame((ctx) => drawShapeSelector(ctx, shape, i));
  });

  // Phase 2: Color picker — landing on cherry red (14 frames)
  const colors = [null, null, '#FF0000', '#FF0000', '#C41E3A', '#DC143C',
                  '#DC143C', '#DC143C', '#DC143C', '#DC143C', '#DC143C', '#DC143C', '#DC143C', '#DC143C'];
  const labels = [null, null, 'Valentine Red', 'Valentine Red', 'Crimson', 'Cherry Red',
                  'Cherry Red', 'Cherry Red', 'Cherry Red', 'Cherry Red', 'Cherry Red', 'Cherry Red', 'Cherry Red', 'Cherry Red'];
  colors.forEach((color, i) => {
    frame((ctx) => drawColorPicker(ctx, color, labels[i], i));
  });

  // Phase 3: Applying spinner (8 frames)
  for (let i = 0; i < 8; i++) {
    frame((ctx) => drawApplying(ctx, i / 8));
  }

  // Phase 4: Summary (20 frames — hold on it)
  for (let i = 0; i < 20; i++) {
    frame((ctx) => drawSummary(ctx));
  }

  return frames;
}

module.exports = { buildFrames };
