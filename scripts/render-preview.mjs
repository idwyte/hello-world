import { Resvg } from '@resvg/resvg-js';
import { writeFileSync, mkdirSync } from 'fs';

mkdirSync('/tmp/previews', { recursive: true });

// ── Theme colours (from constants/theme.ts) ───────────────────────────────────
const C = {
  hudBg:       '#3D2B1F',
  hudText:     '#FFF0F5',
  panelBg:     '#FFF0F5',
  panelBorder: '#E8B4C0',
  btnActive:   '#E8748A',
  btnDisabled: '#F0A0B0',
  btnText:     '#FFFFFF',
  textPrimary: '#3D2B1F',
  textSecondary:'#7A5C4A',
  textMuted:   '#B0967E',
  wallRose:    '#E8C4C4',
  wallCream:   '#FAF3E0',
  floorBlush:  '#F0D5D5',
  success:     '#7CB97C',
  warning:     '#E8A85A',
  danger:      '#E87474',
  gold:        '#DAA520',
  white:       '#FFFFFF',
  sage:        '#A8C5A0',
  lavender:    '#C4A8C5',
};

// ── SVG text helper ────────────────────────────────────────────────────────────
const t = (x, y, text, opts = {}) => {
  const {
    size = 13, fill = C.textPrimary, weight = 'normal',
    anchor = 'start', family = 'sans-serif',
  } = opts;
  return `<text x="${x}" y="${y}" font-size="${size}" fill="${fill}" font-weight="${weight}" text-anchor="${anchor}" font-family="${family}">${text}</text>`;
};

const rect = (x, y, w, h, fill, opts = {}) => {
  const { rx = 0, stroke = 'none', sw = 1, opacity = 1 } = opts;
  return `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${fill}" rx="${rx}" stroke="${stroke}" stroke-width="${sw}" opacity="${opacity}"/>`;
};

// ── Character SVG (48×64) — skin, hair, top, bottom ──────────────────────────
function character(skin, hair, top, bot, style = 'B') {
  // Body B (average)
  const bodyA = `
    <ellipse cx="24" cy="12" rx="8" ry="9.5" fill="${skin}"/>
    <rect x="21.5" y="20.5" width="5" height="7" rx="1" fill="${skin}"/>
    <path d="M14,27 L34,27 L32,46 L16,46 Z" fill="${skin}"/>
    <path d="M14,28 L8,29 L6,44 L11,44 L13,32 Z" fill="${skin}"/>
    <path d="M34,28 L40,29 L42,44 L37,44 L35,32 Z" fill="${skin}"/>
    <ellipse cx="8.5" cy="45" rx="3" ry="2" fill="${skin}"/>
    <ellipse cx="39.5" cy="45" rx="3" ry="2" fill="${skin}"/>`;

  const bodyC = `
    <ellipse cx="24" cy="12" rx="8" ry="9.5" fill="${skin}"/>
    <rect x="21" y="20.5" width="6" height="7" rx="1" fill="${skin}"/>
    <path d="M13,27 L18,37 L12,46 L36,46 L30,37 L35,27 Z" fill="${skin}"/>
    <path d="M13,28 L7,29 L5,44 L10,44 L12,32 Z" fill="${skin}"/>
    <path d="M35,28 L41,29 L43,44 L38,44 L36,32 Z" fill="${skin}"/>
    <ellipse cx="7" cy="45" rx="3" ry="2" fill="${skin}"/>
    <ellipse cx="41" cy="45" rx="3" ry="2" fill="${skin}"/>`;

  const body = style === 'C' ? bodyC : bodyA;

  // Clothing bottom (jeans)
  const bottom = `
    <rect x="13" y="42" width="22" height="4" rx="1" fill="${bot}"/>
    <rect x="14" y="45" width="9" height="17" rx="2" fill="${bot}"/>
    <rect x="25" y="45" width="9" height="17" rx="2" fill="${bot}"/>`;

  // Clothing top (tee)
  const topCloth = `
    <rect x="14" y="26" width="20" height="18" rx="3" fill="${top}"/>
    <rect x="8" y="27" width="6" height="10" rx="3" fill="${top}"/>
    <rect x="34" y="27" width="6" height="10" rx="3" fill="${top}"/>`;

  // Hair back (bob)
  const hairB = style === 'C'
    ? `<ellipse cx="24" cy="9" rx="9" ry="9.5" fill="${hair}"/>
       <path d="M15,13 Q11,22 14,30 Q11,38 13,46 Q15,50 17,48 Q15,42 17,34 Q15,26 17,18 Z" fill="${hair}"/>
       <path d="M33,13 Q37,22 34,30 Q37,38 35,46 Q33,50 31,48 Q33,42 31,34 Q33,26 31,18 Z" fill="${hair}"/>
       <rect x="17" y="12" width="14" height="20" fill="${hair}"/>`
    : `<ellipse cx="24" cy="10" rx="9.5" ry="10.5" fill="${hair}"/>
       <rect x="14.5" y="14" width="4" height="8" rx="2" fill="${hair}"/>
       <rect x="29.5" y="14" width="4" height="8" rx="2" fill="${hair}"/>`;

  // Face features
  const face = `
    <circle cx="20" cy="14" r="1.5" fill="#3D2B1F"/>
    <circle cx="28" cy="14" r="1.5" fill="#3D2B1F"/>
    <ellipse cx="24" cy="19" rx="2.5" ry="1" fill="#C87070"/>`;

  // Hair front
  const hairF = style === 'C'
    ? `<path d="M16,5 Q24,2 32,5 Q29,13 24,11 Q19,13 16,5 Z" fill="${hair}"/>
       <path d="M15,9 Q13,15 14,18 Q14,13 16,9 Z" fill="${hair}"/>
       <path d="M33,9 Q35,15 34,18 Q34,13 32,9 Z" fill="${hair}"/>`
    : `<path d="M15,4 Q24,0 33,4 Q29,14 24,12 Q19,14 15,4 Z" fill="${hair}"/>`;

  return `<svg xmlns="http://www.w3.org/2000/svg" width="48" height="64" viewBox="0 0 48 64">
    ${body}
    ${bottom}
    ${topCloth}
    ${hairB}
    ${face}
    ${hairF}
  </svg>`;
}

// ── Screen 1: Shop Floor ───────────────────────────────────────────────────────
function shopFloor() {
  const W = 390, H = 844;
  const SAFE_TOP = 44;

  // Characters embedded as nested SVGs
  const char1 = character('#D4956A', '#3B1F0D', '#E8748A', '#4169E1', 'B');
  const char2 = character('#EBB882', '#1A1A1A', '#7CB97C', '#3D2B1F', 'C');
  const char3 = character('#9B6040', '#CC2200', '#C4A8C5', '#4A2010', 'B');

  // Patience bar helper
  const patience = (x, y, w, pct, colour) =>
    `${rect(x, y, w, 6, 'rgba(0,0,0,0.1)', { rx: 3 })}
     ${rect(x, y, w * pct, 6, colour, { rx: 3 })}`;

  return `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs>
    <clipPath id="screen"><rect width="${W}" height="${H}" rx="40"/></clipPath>
    <filter id="shadow"><feDropShadow dx="0" dy="2" stdDeviation="4" flood-color="#00000033"/></filter>
  </defs>
  <g clip-path="url(#screen)">

  <!-- Status bar notch -->
  ${rect(0, 0, W, H, C.wallRose)}

  <!-- Floor tiles -->
  ${rect(0, 380, W, H - 380, C.floorBlush)}
  ${[...Array(8)].map((_, i) => `<line x1="${i * 50}" y1="380" x2="${i * 50}" y2="${H}" stroke="${C.wallRose}" stroke-width="1" opacity="0.5"/>`).join('')}
  ${[...Array(6)].map((_, i) => `<line x1="0" y1="${380 + i * 75}" x2="${W}" y2="${380 + i * 75}" stroke="${C.wallRose}" stroke-width="1" opacity="0.5"/>`).join('')}

  <!-- Back wall -->
  ${rect(0, 0, W, 220, C.wallCream)}
  <!-- Wainscotting -->
  ${rect(0, 195, W, 5, C.wallRose)}
  ${rect(0, 200, W, 20, C.wallRose, { opacity: 0.5 })}

  <!-- Wall decor: two framed mirrors -->
  ${rect(40, 30, 80, 100, C.white, { rx: 6, stroke: C.gold, sw: 3 })}
  ${rect(60, 50, 40, 60, C.wallCream, { rx: 3 })}
  ${rect(270, 30, 80, 100, C.white, { rx: 6, stroke: C.gold, sw: 3 })}
  ${rect(290, 50, 40, 60, C.wallCream, { rx: 3 })}

  <!-- HUD bar -->
  ${rect(0, SAFE_TOP, W, 52, C.hudBg)}
  ${t(20, SAFE_TOP + 22, '💰 $427', { fill: C.hudText, size: 15, weight: '600' })}
  ${t(W/2, SAFE_TOP + 22, '⭐ Rep 12', { fill: C.hudText, size: 15, weight: '600', anchor: 'middle' })}
  ${t(W - 20, SAFE_TOP + 22, '📅 Day 3', { fill: C.hudText, size: 15, weight: '600', anchor: 'end' })}
  <!-- Day progress bar -->
  ${rect(16, SAFE_TOP + 34, W - 32, 4, 'rgba(255,255,255,0.2)', { rx: 2 })}
  ${rect(16, SAFE_TOP + 34, (W - 32) * 0.48, 4, C.btnActive, { rx: 2 })}

  <!-- Shop name -->
  ${t(W/2, 128, "Jade's Nail Studio", { size: 20, weight: '700', fill: C.textPrimary, anchor: 'middle' })}

  <!-- Review board bubble -->
  ${rect(20, 140, 350, 42, C.white, { rx: 12, stroke: C.sage, sw: 1.5 })}
  ${t(36, 158, '💬 "Perfect almond shape! Really love the colour ⭐⭐⭐⭐⭐"', { size: 11, fill: C.textSecondary })}
  ${t(36, 174, '— Priya S.', { size: 10, fill: C.textMuted })}

  <!-- Section label -->
  ${t(20, 210, 'Nail Stations', { size: 13, weight: '700', fill: C.textSecondary })}

  <!-- Station 1 — occupied -->
  ${rect(16, 218, 172, 155, C.white, { rx: 16, stroke: C.btnActive, sw: 2 })}
  ${rect(16, 218, 172, 32, C.btnActive, { rx: 16 })}
  ${rect(16, 234, 172, 16, C.btnActive)}
  ${t(102, 239, 'STATION 1', { size: 12, weight: '700', fill: C.white, anchor: 'middle' })}
  ${t(102, 256, 'Comfort Chair', { size: 10, fill: C.textMuted, anchor: 'middle' })}
  <!-- Nail table -->
  ${rect(40, 260, 124, 60, C.wallCream, { rx: 10, stroke: C.panelBorder, sw: 1 })}
  <!-- Customer at station -->
  <image href="data:image/svg+xml;base64,${Buffer.from(char1).toString('base64')}" x="76" y="258" width="48" height="64"/>
  ${t(102, 332, 'Priya K.', { size: 11, weight: '600', fill: C.textPrimary, anchor: 'middle' })}
  ${t(102, 347, 'Gel Nails', { size: 10, fill: C.textMuted, anchor: 'middle' })}
  <!-- Progress -->
  ${rect(36, 353, 130, 6, '#E5D5DC', { rx: 3 })}
  ${rect(36, 353, 90, 6, C.btnActive, { rx: 3 })}
  ${t(102, 368, '69%', { size: 10, fill: C.textMuted, anchor: 'middle' })}

  <!-- Station 2 — empty -->
  ${rect(202, 218, 172, 155, C.white, { rx: 16, stroke: C.panelBorder, sw: 1.5 })}
  ${rect(202, 218, 172, 32, C.panelBorder, { rx: 16 })}
  ${rect(202, 234, 172, 16, C.panelBorder)}
  ${t(288, 239, 'STATION 2', { size: 12, weight: '700', fill: C.textSecondary, anchor: 'middle' })}
  ${t(288, 256, 'Basic Chair', { size: 10, fill: C.textMuted, anchor: 'middle' })}
  ${rect(226, 260, 124, 60, C.wallCream, { rx: 10, stroke: C.panelBorder, sw: 1 })}
  ${t(288, 298, '+ Seat a customer', { size: 11, fill: C.textMuted, anchor: 'middle' })}

  <!-- Section label -->
  ${t(20, 392, 'Waiting Queue  (2)', { size: 13, weight: '700', fill: C.textSecondary })}

  <!-- Customer card 1 -->
  ${rect(16, 400, 358, 76, C.white, { rx: 14, stroke: C.panelBorder, sw: 1 })}
  <!-- Avatar swatch -->
  ${rect(28, 412, 40, 52, '#D4956A', { rx: 10 })}
  <image href="data:image/svg+xml;base64,${Buffer.from(char2).toString('base64')}" x="28" y="412" width="40" height="52"/>
  ${t(80, 428, 'Aaliyah J.', { size: 13, weight: '600', fill: C.textPrimary })}
  ${rect(80, 432, 65, 16, C.panelBg, { rx: 6, stroke: C.panelBorder, sw: 1 })}
  ${t(112, 443, 'Basic Mani', { size: 10, fill: C.textSecondary, anchor: 'middle' })}
  ${t(80, 460, 'Tip: $8', { size: 11, fill: C.gold })}
  ${patience(260, 428, 90, 0.72, C.success)}
  ${t(305, 423, '⏳', { size: 10, anchor: 'middle' })}
  ${t(260, 462, 'Tap to seat >', { size: 10, fill: C.textMuted })}

  <!-- Customer card 2 -->
  ${rect(16, 484, 358, 76, C.white, { rx: 14, stroke: C.panelBorder, sw: 1 })}
  ${rect(28, 496, 40, 52, '#C68642', { rx: 10 })}
  <image href="data:image/svg+xml;base64,${Buffer.from(char3).toString('base64')}" x="28" y="494" width="40" height="52"/>
  ${t(80, 512, 'Sophie M.', { size: 13, weight: '600', fill: C.textPrimary })}
  ${rect(80, 516, 60, 16, '#FFF4D6', { rx: 6, stroke: C.gold, sw: 1 })}
  ${t(110, 527, 'Gel Nails', { size: 10, fill: C.gold, anchor: 'middle' })}
  ${t(80, 544, 'Tip: $15', { size: 11, fill: C.gold })}
  ${patience(260, 512, 90, 0.35, C.warning)}
  ${t(305, 507, '⏳', { size: 10, anchor: 'middle' })}
  ${t(260, 546, 'Tap to seat >', { size: 10, fill: C.textMuted })}

  <!-- Start Day button (inactive, day running) -->
  ${rect(80, 580, W - 160, 44, C.btnDisabled, { rx: 14 })}
  ${t(W/2, 607, 'Day in progress…', { size: 14, fill: C.white, weight: '600', anchor: 'middle' })}

  <!-- Bottom tab bar -->
  ${rect(0, H - 83, W, 83, C.white, { stroke: C.panelBorder, sw: 1 })}
  ${['🏠', '👥', '🛍', '📊'].map((icon, i) => {
    const tx = 49 + i * 98;
    const labels = ['Shop', 'Staff', 'Upgrades', 'Stats'];
    const isActive = i === 0;
    return `
      ${isActive ? rect(tx - 30, H - 78, 60, 48, C.panelBg, { rx: 12 }) : ''}
      ${t(tx, H - 52, icon, { size: 22, anchor: 'middle' })}
      ${t(tx, H - 32, labels[i], { size: 10, fill: isActive ? C.btnActive : C.textMuted, weight: isActive ? '700' : 'normal', anchor: 'middle' })}
    `;
  }).join('')}

  <!-- Phone frame overlay shadow -->
  <rect width="${W}" height="${H}" rx="40" fill="none" stroke="#00000022" stroke-width="2"/>

  </g>
  </svg>`;
}

// ── Screen 2: Character sheet ──────────────────────────────────────────────────
function characterSheet() {
  const W = 800, H = 500;

  const skins = ['#FDDBB4', '#D4956A', '#9B6040', '#3D1A0A'];
  const hairs  = ['#1A1A1A', '#8B4513', '#FF69B4', '#C0C0C0'];
  const tops   = ['#E8748A', '#4169E1', '#7CB97C', '#9B59B6'];
  const bots   = ['#3D2B1F', '#4169E1', '#A8C5A0', '#CC2200'];
  const archs  = ['B', 'C', 'B', 'C'];

  const chars = skins.map((s, i) => character(s, hairs[i], tops[i], bots[i], archs[i]));

  // Hair style strip: 8 styles all with same skin/clothes, different hair shapes
  const hairStyles = [
    (h, s) => `<ellipse cx="24" cy="10" rx="9.5" ry="10.5" fill="${h}"/>
               <rect x="14.5" y="14" width="4" height="8" rx="2" fill="${h}"/>
               <rect x="29.5" y="14" width="4" height="8" rx="2" fill="${h}"/>`,
    (h)    => `<ellipse cx="24" cy="9" rx="9" ry="9.5" fill="${h}"/>
               <rect x="17" y="12" width="14" height="22" fill="${h}"/>
               <rect x="15" y="12" width="6" height="28" rx="3" fill="${h}"/>
               <rect x="27" y="12" width="6" height="28" rx="3" fill="${h}"/>`,
    (h)    => `<ellipse cx="24" cy="8" rx="12" ry="11" fill="${h}"/>
               <ellipse cx="14" cy="14" rx="5" ry="6" fill="${h}"/>
               <ellipse cx="34" cy="14" rx="5" ry="6" fill="${h}"/>`,
    (h)    => `<ellipse cx="24" cy="9" rx="9" ry="9.5" fill="${h}"/>
               <ellipse cx="24" cy="3" rx="4" ry="4" fill="${h}"/>
               <path d="M20,14 Q17,24 17,38 Q18,44 21,44 Q25,44 27,44 Q30,44 31,38 Q31,24 28,14 Z" fill="${h}"/>`,
    (h)    => `<ellipse cx="24" cy="12" rx="8.5" ry="9" fill="${h}"/>
               <ellipse cx="24" cy="4" rx="6" ry="5" fill="${h}"/>`,
    (h)    => `<ellipse cx="24" cy="9" rx="9" ry="9.5" fill="${h}"/>
               <rect x="17" y="12" width="14" height="20" fill="${h}"/>
               <path d="M15,13 Q11,22 14,30 Q11,38 13,46 Q15,50 17,48 Q15,42 17,34 Q15,26 17,18 Z" fill="${h}"/>
               <path d="M33,13 Q37,22 34,30 Q37,38 35,46 Q33,50 31,48 Q33,42 31,34 Q33,26 31,18 Z" fill="${h}"/>`,
    (h)    => `<ellipse cx="24" cy="9" rx="9" ry="9.5" fill="${h}"/>
               <path d="M17,15 L15,22 L13,32 L11,42 L12,48 L16,47 L15,39 L16,28 L17,20 Z" fill="${h}"/>
               <path d="M31,15 L33,22 L35,32 L37,42 L36,48 L32,47 L33,39 L32,28 L31,20 Z" fill="${h}"/>`,
    (h)    => `<ellipse cx="24" cy="12" rx="9" ry="9" fill="${h}"/>
               <ellipse cx="16" cy="16" rx="3.5" ry="4" fill="${h}"/>
               <ellipse cx="32" cy="16" rx="3.5" ry="4" fill="${h}"/>`,
  ];

  const hairNames = ['Bob', 'Long Straight', 'Curly', 'Ponytail', 'Bun', 'Long Wavy', 'Braids', 'Pixie'];

  const makeHairChar = (idx) => {
    const h = '#8B4513'; const s = '#D4956A';
    const top = '#E8748A'; const bot = '#3D2B1F';
    return `<svg xmlns="http://www.w3.org/2000/svg" width="48" height="64" viewBox="0 0 48 64">
      <ellipse cx="24" cy="12" rx="8" ry="9.5" fill="${s}"/>
      <rect x="21.5" y="20.5" width="5" height="7" rx="1" fill="${s}"/>
      <path d="M14,27 L34,27 L32,46 L16,46 Z" fill="${s}"/>
      <path d="M14,28 L8,29 L6,44 L11,44 L13,32 Z" fill="${s}"/>
      <path d="M34,28 L40,29 L42,44 L37,44 L35,32 Z" fill="${s}"/>
      <ellipse cx="8.5" cy="45" rx="3" ry="2" fill="${s}"/>
      <ellipse cx="39.5" cy="45" rx="3" ry="2" fill="${s}"/>
      <rect x="13" y="42" width="22" height="4" rx="1" fill="${bot}"/>
      <rect x="14" y="45" width="9" height="17" rx="2" fill="${bot}"/>
      <rect x="25" y="45" width="9" height="17" rx="2" fill="${bot}"/>
      <rect x="14" y="26" width="20" height="18" rx="3" fill="${top}"/>
      <rect x="8" y="27" width="6" height="10" rx="3" fill="${top}"/>
      <rect x="34" y="27" width="6" height="10" rx="3" fill="${top}"/>
      ${hairStyles[idx](h, s)}
      <circle cx="20" cy="14" r="1.5" fill="#3D2B1F"/>
      <circle cx="28" cy="14" r="1.5" fill="#3D2B1F"/>
      <ellipse cx="24" cy="19" rx="2.5" ry="1" fill="#C87070"/>
    </svg>`;
  };

  return `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${W}" height="${H}">
  ${rect(0, 0, W, H, C.wallCream)}
  ${rect(0, 0, W, 50, C.hudBg)}
  ${t(W/2, 32, 'Character System — Body Types + Hair Styles', { size: 16, fill: C.hudText, weight: '700', anchor: 'middle' })}

  <!-- Body type labels -->
  ${t(100, 70, 'Body Types', { size: 13, weight: '700', fill: C.textSecondary, anchor: 'middle' })}
  ${['Slender (A)', 'Average (B)', 'Curvy (C)', 'Athletic (D)'].map((label, i) => `
    ${rect(20 + i * 90, 80, 80, 100, C.white, { rx: 12, stroke: C.panelBorder, sw: 1.5 })}
    <image href="data:image/svg+xml;base64,${Buffer.from(character(skins[i], hairs[i], tops[i], bots[i], ['A','B','C','D'][i])).toString('base64')}" x="${26 + i * 90}" y="86" width="68" height="88"/>
    ${t(60 + i * 90, 192, label, { size: 10, fill: C.textSecondary, anchor: 'middle' })}
  `).join('')}

  <!-- Skin tone swatches -->
  ${t(100, 215, 'Skin Tones (12)', { size: 13, weight: '700', fill: C.textSecondary, anchor: 'middle' })}
  ${['#FDDBB4','#F5C89A','#EBB882','#D4956A','#C68642','#B5714A',
     '#9B6040','#7A4A2A','#5C3317','#4A2010','#3D1A0A','#2A0F05'].map((col, i) =>
    `${rect(20 + i * 30, 222, 26, 26, col, { rx: 13, stroke: 'white', sw: 2 })}`
  ).join('')}

  <!-- Hair style grid -->
  ${t(490, 70, 'Hair Styles (8)', { size: 13, weight: '700', fill: C.textSecondary, anchor: 'middle' })}
  ${hairNames.map((name, i) => {
    const col = i % 4;
    const row = Math.floor(i / 4);
    const x = 360 + col * 80;
    const y = 80 + row * 115;
    return `
      ${rect(x, y, 72, 90, C.white, { rx: 10, stroke: C.panelBorder, sw: 1.5 })}
      <image href="data:image/svg+xml;base64,${Buffer.from(makeHairChar(i)).toString('base64')}" x="${x + 6}" y="${y + 6}" width="60" height="78"/>
      ${t(x + 36, y + 102, name, { size: 9, fill: C.textSecondary, anchor: 'middle' })}
    `;
  }).join('')}

  <!-- Clothing swatches row -->
  ${t(100, 260, 'Clothing Tops (12 styles)', { size: 13, weight: '700', fill: C.textSecondary, anchor: 'middle' })}
  ${Array.from({length: 12}, (_, i) => {
    const colours = ['#E8748A','#4169E1','#7CB97C','#9B59B6','#E8A85A','#DAA520',
                     '#C4A8C5','#3D2B1F','#CC2200','#1A1A1A','#FF69B4','#4A9B8E'];
    const labels  = ['Tee','Tank','L/S','Hoodie','Blazer','Crop',
                     'Off-sh','Shirt','Cardi','Sports','Ruffle','Turtle'];
    return `
      ${rect(20 + i * 28, 270, 24, 24, colours[i], { rx: 6 })}
      ${t(32 + i * 28, 306, labels[i], { size: 7, fill: C.textMuted, anchor: 'middle' })}
    `;
  }).join('')}

  <!-- Clothing bottoms row -->
  ${t(100, 325, 'Clothing Bottoms (10 styles)', { size: 13, weight: '700', fill: C.textSecondary, anchor: 'middle' })}
  ${Array.from({length: 10}, (_, i) => {
    const colours = ['#3D2B1F','#E8748A','#C4A8C5','#4169E1','#9B59B6',
                     '#1A1A1A','#7CB97C','#DAA520','#A8C5A0','#CC2200'];
    const labels  = ['Jeans','Mini','Midi','Shorts','Maxi','Dress Pnts','Joggers','D.Shorts','Wide-leg','Leggings'];
    return `
      ${rect(20 + i * 28, 332, 24, 24, colours[i], { rx: 6 })}
      ${t(32 + i * 28, 368, labels[i], { size: 7, fill: C.textMuted, anchor: 'middle' })}
    `;
  }).join('')}

  <!-- Expression strip -->
  ${t(100, 390, 'Expressions', { size: 13, weight: '700', fill: C.textSecondary, anchor: 'middle' })}
  ${['😐','😊','🤩','😤','😞','😍','🤔'].map((e, i) => `
    ${rect(20 + i * 40, 398, 34, 34, C.white, { rx: 8, stroke: C.panelBorder, sw: 1 })}
    ${t(37 + i * 40, 420, e, { size: 18, anchor: 'middle' })}
    ${t(37 + i * 40, 444, ['Neutral','Happy','Excited','Impatient','Disappointed','Delighted','Thinking'][i], { size: 7, fill: C.textMuted, anchor: 'middle' })}
  `).join('')}

  </svg>`;
}

// ── Render and save ───────────────────────────────────────────────────────────
function render(svg, filename, scale = 2) {
  const resvg = new Resvg(svg, {
    fitTo: { mode: 'zoom', value: scale },
    font: { loadSystemFonts: false },
  });
  const data = resvg.render();
  writeFileSync(`/tmp/previews/${filename}`, data.asPng());
  console.log(`Saved /tmp/previews/${filename}  (${data.width}×${data.height})`);
}

render(shopFloor(),       'shop-floor.png',   2);
render(characterSheet(),  'character-sheet.png', 1.5);

console.log('Done.');
