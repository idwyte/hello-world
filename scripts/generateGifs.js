#!/usr/bin/env node
/**
 * Nail Shop Simulator — Gameplay GIF Generator
 *
 * Generates 4 animated GIFs showing key gameplay moments.
 * Uses Node.js canvas (2D rendering) + omggif (pure-JS GIF encoding).
 *
 * Usage: node scripts/generateGifs.js
 * Output: scripts/output/*.gif
 */

const path = require('path');
const fs   = require('fs');

const { encodeGif } = require('./gifFrames/encodeGif');

const OUT_DIR = path.join(__dirname, 'output');
if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });

async function main() {
  console.log('\n🎬 Nail Shop Simulator — GIF Generator\n');

  const gifs = [
    {
      name: 'gif1_customer_arrival',
      label: 'GIF 1: Customer Arrival',
      module: './gifFrames/gif1_customerArrival',
      delayMs: 80,
    },
    {
      name: 'gif2_service_minigame',
      label: 'GIF 2: Service Mini-Game',
      module: './gifFrames/gif2_serviceMiniGame',
      delayMs: 100,
    },
    {
      name: 'gif3_review_board',
      label: 'GIF 3: Review Board',
      module: './gifFrames/gif3_reviewBoard',
      delayMs: 110,
    },
    {
      name: 'gif4_day_end',
      label: 'GIF 4: Day End Summary',
      module: './gifFrames/gif4_dayEnd',
      delayMs: 90,
    },
  ];

  for (const gif of gifs) {
    console.log(`Rendering ${gif.label}...`);
    try {
      const { buildFrames } = require(gif.module);
      const frames  = buildFrames();
      const outPath = path.join(OUT_DIR, `${gif.name}.gif`);
      encodeGif(frames, outPath, gif.delayMs);
    } catch (err) {
      console.error(`  ✗ Failed: ${err.message}`);
    }
  }

  console.log('\n✅ Done! Check scripts/output/ for the GIF files.\n');
}

main().catch((err) => { console.error(err); process.exit(1); });
