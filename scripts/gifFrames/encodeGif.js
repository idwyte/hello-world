/**
 * GIF encoder using omggif (pure JS, no native deps)
 * Takes an array of canvas frames and writes an animated GIF file.
 */
const fs = require('fs');
const GifWriter = require('omggif').GifWriter;

/**
 * @param {import('canvas').Canvas[]} canvases
 * @param {string} outPath
 * @param {number} delayMs  centiseconds per frame (omggif uses cs, not ms)
 */
function encodeGif(canvases, outPath, delayMs = 100) {
  const width  = canvases[0].width;
  const height = canvases[0].height;

  const buf = Buffer.alloc(width * height * canvases.length * 6 + 1024);
  const gw  = new GifWriter(buf, width, height, { loop: 0 });

  const delayCentiseconds = Math.round(delayMs / 10);

  for (const canvas of canvases) {
    const ctx  = canvas.getContext('2d');
    const data = ctx.getImageData(0, 0, width, height);
    const rgba = data.data;

    // Build palette + indexed pixels (simple median-cut-ish via 256-color palette)
    const { palette, indexed } = quantize(rgba, width * height);

    gw.addFrame(0, 0, width, height, indexed, {
      palette,
      delay: delayCentiseconds,
      disposal: 2,
    });
  }

  const len = gw.end();
  fs.writeFileSync(outPath, buf.slice(0, len));
  console.log(`✓ Wrote ${outPath} (${canvases.length} frames, ${(len / 1024).toFixed(1)} KB)`);
}

/**
 * Very simple 256-color quantizer: collect unique colors up to 255,
 * then map remaining pixels to nearest. Good enough for UI GIFs.
 */
function isPow2(n) { return n >= 2 && (n & (n - 1)) === 0; }

function quantize(rgba, pixelCount) {
  const colorMap = new Map();
  const palette  = [];

  // First pass: collect unique colors (capped at 255, leaving 1 for transparency)
  for (let i = 0; i < pixelCount; i++) {
    const r = rgba[i * 4];
    const g = rgba[i * 4 + 1];
    const b = rgba[i * 4 + 2];
    const key = (r << 16) | (g << 8) | b;
    if (!colorMap.has(key) && palette.length < 255) {
      colorMap.set(key, palette.length);
      palette.push([r, g, b]);
    }
  }

  // Ensure palette is power-of-2 length (omggif requirement: 2,4,8,...256)
  while (!isPow2(palette.length)) palette.push([0, 0, 0]);
  if (palette.length > 256) palette.length = 256;

  // omggif expects palette as array of 24-bit ints (0xRRGGBB)
  const flatPalette = palette.map(([r, g, b]) => (r << 16) | (g << 8) | b);

  // Second pass: map pixels to palette indices
  const indexed = new Uint8Array(pixelCount);
  for (let i = 0; i < pixelCount; i++) {
    const r = rgba[i * 4];
    const g = rgba[i * 4 + 1];
    const b = rgba[i * 4 + 2];
    const key = (r << 16) | (g << 8) | b;
    if (colorMap.has(key)) {
      indexed[i] = colorMap.get(key);
    } else {
      // Find nearest color in palette
      let best = 0;
      let bestDist = Infinity;
      for (let j = 0; j < 255; j++) {
        const dr = r - palette[j][0];
        const dg = g - palette[j][1];
        const db = b - palette[j][2];
        const dist = dr * dr + dg * dg + db * db;
        if (dist < bestDist) { bestDist = dist; best = j; }
      }
      indexed[i] = best;
    }
  }

  return { palette: flatPalette, indexed };
}

module.exports = { encodeGif };
