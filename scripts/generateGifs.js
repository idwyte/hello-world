#!/usr/bin/env node
/**
 * Nail Shop Simulator — GBA Pixel Art GIF Generator
 *
 * Renders 8 animated GIFs: two art direction versions × 4 gameplay scenes.
 *
 * Version A: "FireRed Interior"  — top-down overhead (Pokémon Center style)
 * Version B: "GBA Girl Game"     — front-facing 3/4 (Hamtaro / Magical Vacation style)
 *
 * Output files (scripts/output/):
 *   vA_gif1_customer_arrival.gif   vB_gif1_customer_arrival.gif
 *   vA_gif2_service_minigame.gif   vB_gif2_service_minigame.gif
 *   vA_gif3_review_board.gif       vB_gif3_review_board.gif
 *   vA_gif4_day_end.gif            vB_gif4_day_end.gif
 *
 * Usage: node scripts/generateGifs.js
 */

const path = require('path');
const fs   = require('fs');

const { encodeGif } = require('./gifFrames/encodeGif');

const OUT_DIR = path.join(__dirname, 'output');
if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });

const GIF_SPECS = [
  { key: 'gif1', label: 'Customer Arrival',  module: './gifFrames/gif1_customerArrival', delayMs: 90  },
  { key: 'gif2', label: 'Service Mini-Game', module: './gifFrames/gif2_serviceMiniGame', delayMs: 110 },
  { key: 'gif3', label: 'Review Board',      module: './gifFrames/gif3_reviewBoard',     delayMs: 120 },
  { key: 'gif4', label: 'Day End',           module: './gifFrames/gif4_dayEnd',          delayMs: 100 },
];

const VERSIONS = [
  { id: 'vA', label: 'FireRed Interior (top-down)' },
  { id: 'vB', label: 'GBA Girl Game (front-facing)' },
];

async function main() {
  console.log('\n🎬 Nail Shop Simulator — GBA Pixel Art GIF Generator\n');
  console.log('  Version A: FireRed Interior  (top-down, warm peachy tones)');
  console.log('  Version B: GBA Girl Game     (front-facing 3/4, candy pink-purple)');
  console.log('');

  let totalWritten = 0;

  for (const ver of VERSIONS) {
    console.log(`\n── ${ver.label} ──`);
    for (const spec of GIF_SPECS) {
      const label   = `  GIF ${spec.key.slice(-1)}: ${spec.label} [${ver.id}]`;
      const outName = `${ver.id}_${spec.key}_${spec.label.toLowerCase().replace(/ /g, '_')}.gif`;
      const outPath = path.join(OUT_DIR, outName);
      process.stdout.write(`${label}... `);
      try {
        // Fresh require on each call so the module isn't cached between versions
        delete require.cache[require.resolve(spec.module)];
        const { buildFrames } = require(spec.module);
        const frames = buildFrames(ver.id);
        encodeGif(frames, outPath, spec.delayMs);
        totalWritten++;
      } catch (err) {
        console.error(`\n  ✗ Failed: ${err.message}`);
        if (process.env.DEBUG) console.error(err.stack);
      }
    }
  }

  console.log(`\n✅ Done! ${totalWritten}/8 GIFs written to scripts/output/\n`);
  console.log('Files:');
  fs.readdirSync(OUT_DIR).filter(f => f.endsWith('.gif')).sort().forEach(f => {
    const size = (fs.statSync(path.join(OUT_DIR, f)).size / 1024).toFixed(1);
    console.log(`  ${f}  (${size} KB)`);
  });
  console.log('');
}

main().catch((err) => { console.error(err); process.exit(1); });
