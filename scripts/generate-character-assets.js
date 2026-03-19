#!/usr/bin/env node
/**
 * generate-character-assets.js
 *
 * Calls the Recraft V4 Vector API to generate all CharacterAvatar SVG layer
 * components and writes them directly into assets/characters/layers/.
 *
 * Run from the project root (requires Node 18+, no extra dependencies):
 *
 *   node scripts/generate-character-assets.js                  # all batches
 *   node scripts/generate-character-assets.js --batch=body     # body only
 *   node scripts/generate-character-assets.js --batch=hair     # hair only
 *   node scripts/generate-character-assets.js --batch=tops
 *   node scripts/generate-character-assets.js --batch=bottoms
 *   node scripts/generate-character-assets.js --batch=face
 *   node scripts/generate-character-assets.js --batch=accessories
 *   node scripts/generate-character-assets.js --force          # overwrite existing
 *
 * API key can be set via RECRAFT_API_KEY env var or defaults to the key below.
 */

'use strict';

const fs   = require('fs');
const path = require('path');

// ─── Config ──────────────────────────────────────────────────────────────────

const API_KEY  = process.env.RECRAFT_API_KEY || '9Ab9VlcQmeCGUmJibnUnmFq0lXqZshHsGbX8gUX8cVFpfBi2pNTpngutWtIS64al';
const API_BASE = 'https://external.api.recraft.ai/v1';

// Generation size — 3:4 matches the 48×64 character canvas.
// viewBox is preserved; RN SVG scales it automatically to width/height props.
const GEN_SIZE = '768x1024';

// Single placeholder fill used in all prompts — replaced with the fill prop.
const PLACEHOLDER = '#FF0000';

// Where generated .tsx files are written
const LAYERS_DIR = path.join(__dirname, '..', 'assets', 'characters', 'layers');

// Delay between API calls (ms) to avoid rate-limit errors
const CALL_DELAY = 800;

// ─── Asset Manifests ─────────────────────────────────────────────────────────

const BODY_BASES = [
  { id: 'A', desc: 'standard proportions, average female build, medium frame' },
  { id: 'B', desc: 'curvy proportions, wider hips, fuller figure, rounded silhouette' },
  { id: 'C', desc: 'petite and slim proportions, small narrow frame, short stature' },
  { id: 'D', desc: 'athletic and muscular proportions, broad shoulders, toned arms' },
];

const HAIR_STYLES = [
  { id: '01', back: 'long straight hair hanging behind head, falls to mid-back',         front: 'long straight hair fringe, center-parted curtain bangs framing face' },
  { id: '02', back: 'short bob, chin-length hair behind head, blunt ends',               front: 'short bob side-swept fringe, no bangs, ear-length' },
  { id: '03', back: 'large full natural afro behind head, rounded dome silhouette',       front: 'natural afro front crown, small puff shape, no distinct fringe' },
  { id: '04', back: 'medium bouncy curly hair behind head, shoulder length',             front: 'medium curly hair fringe and ringlets at sides framing face' },
  { id: '05', back: 'long thick box braids behind head falling to waist',                front: 'box braids front, two braids framing either side of face' },
  { id: '06', back: 'shoulder-length freeform locs behind head',                         front: 'locs fringe, a few locs hanging at sides of face' },
  { id: '07', back: 'long beachy wavy hair behind head, loose S-shaped waves',           front: 'long wavy hair fringe, loose waves sweeping across forehead' },
  { id: '08', back: 'very short pixie cut, close cropped to head, minimal volume',      front: 'pixie cut front crown, short wispy side-swept fringe' },
];

const CLOTHING_TOPS = [
  { id: '01', desc: 'fitted crew-neck t-shirt, short sleeves' },
  { id: '02', desc: 'cropped top, short hem ending above waist, short sleeves' },
  { id: '03', desc: 'sleeveless tank top, thin spaghetti straps, relaxed fit' },
  { id: '04', desc: 'button-down blouse, collar, chest buttons visible, long sleeves rolled up' },
  { id: '05', desc: 'zip-up hoodie sweatshirt, front zipper, kangaroo pocket, long sleeves' },
  { id: '06', desc: 'off-shoulder top, wide elastic neckline dropped off both shoulders, short' },
  { id: '07', desc: 'ribbed turtleneck sweater, high neck, fitted long sleeves' },
  { id: '08', desc: 'open-front cardigan, draped panels, long sleeves, no buttons showing' },
  { id: '09', desc: 'athletic racerback sports top, sleeveless, fitted, cutout back visible from front' },
  { id: '10', desc: 'wrap top, fabric crossed at chest forming V, tied at side, short sleeves' },
  { id: '11', desc: 'puff sleeve blouse, dramatically puffy balloon sleeves, smocked cuffs' },
  { id: '12', desc: 'oversized baggy t-shirt, very loose boxy fit, drops past hips' },
];

const CLOTHING_BOTTOMS = [
  { id: '01', desc: 'flowy midi skirt, falls below knee, gathered fabric' },
  { id: '02', desc: 'mini skirt, short hemline well above knee, fitted' },
  { id: '03', desc: 'high-waist jeans, straight leg, belt loops, front pockets' },
  { id: '04', desc: 'tight fitted leggings, ankle length, smooth fabric' },
  { id: '05', desc: 'wide-leg palazzo pants, very wide flowy legs, floor length' },
  { id: '06', desc: 'denim cutoff shorts, frayed hem, mid-thigh length' },
  { id: '07', desc: 'pleated tennis skirt, swishy pleats, mid-thigh length' },
  { id: '08', desc: 'pencil skirt, form-fitting, knee length, straight silhouette' },
  { id: '09', desc: 'flare bell-bottom pants, fitted at top, dramatically wide flared hem' },
  { id: '10', desc: 'asymmetric draped wrap skirt, one side longer, overlapping fabric' },
];

const EXPRESSIONS = [
  { id: 'neutral',      desc: 'calm neutral face, relaxed closed mouth, open neutral eyes, still brows' },
  { id: 'happy',        desc: 'happy face, slight warm smile with closed mouth, soft friendly eyes, slightly raised brows' },
  { id: 'excited',      desc: 'excited face, big open-mouth smile, wide bright eyes, raised high brows, energetic' },
  { id: 'impatient',    desc: 'impatient annoyed face, flat pressed tight lips, narrowed frowning brows, slight scowl' },
  { id: 'disappointed', desc: 'disappointed sad face, downturned mouth corners, droopy sad eyes, furrowed brows' },
  { id: 'delighted',    desc: 'delighted overjoyed face, huge wide smile showing teeth, crescent curved happy eyes, very raised brows' },
  { id: 'thinking',     desc: 'thinking contemplative face, mouth pursed to one side, one eyebrow slightly raised, looking sideways' },
];

const ACCESSORIES = [
  { id: 'glasses',      desc: 'round thin wire-frame eyeglasses, simple circles, no face or head' },
  { id: 'studs',        desc: 'small round stud earrings, one pair, tiny simple dots' },
  { id: 'hoops',        desc: 'medium hoop earrings, open circle shape, one pair' },
  { id: 'chain',        desc: 'delicate thin chain necklace, tiny round pendant, simple graceful loop' },
  { id: 'nosering',     desc: 'small nose ring, tiny thin hoop on left nostril' },
  { id: 'stackedrings', desc: 'three stacked finger rings, simple bands, worn together on one finger' },
];

// ─── API ─────────────────────────────────────────────────────────────────────

async function generateImage(prompt, retries = 3) {
  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      const res = await fetch(`${API_BASE}/images/generations`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt,
          model: 'recraftv4_vector',
          size: GEN_SIZE,
          n: 1,
        }),
      });

      if (!res.ok) {
        const body = await res.text();
        throw new Error(`HTTP ${res.status}: ${body}`);
      }

      const json = await res.json();
      const url  = json?.data?.[0]?.url;
      if (!url) throw new Error(`No URL in response: ${JSON.stringify(json)}`);

      const svgRes = await fetch(url);
      if (!svgRes.ok) throw new Error(`SVG fetch failed: ${svgRes.status}`);

      return await svgRes.text();

    } catch (err) {
      if (attempt < retries - 1) {
        const wait = Math.pow(2, attempt + 1) * 1000;
        console.log(`    Retry ${attempt + 1} in ${wait / 1000}s… (${err.message})`);
        await sleep(wait);
      } else {
        throw err;
      }
    }
  }
}

// ─── SVG → TSX conversion ────────────────────────────────────────────────────

// Elements supported by react-native-svg that can appear in Recraft output
const ELEMENT_MAP = {
  path:            'Path',
  rect:            'Rect',
  circle:          'Circle',
  ellipse:         'Ellipse',
  line:            'Line',
  polyline:        'Polyline',
  polygon:         'Polygon',
  g:               'G',
  mask:            'Mask',
  defs:            'Defs',
  clipPath:        'ClipPath',
  linearGradient:  'LinearGradient',
  radialGradient:  'RadialGradient',
  stop:            'Stop',
  use:             'Use',
  symbol:          'Symbol',
};

// Hyphenated SVG attrs → camelCase for JSX
const ATTR_MAP = {
  'stroke-width':       'strokeWidth',
  'stroke-linecap':     'strokeLinecap',
  'stroke-linejoin':    'strokeLinejoin',
  'stroke-dasharray':   'strokeDasharray',
  'stroke-dashoffset':  'strokeDashoffset',
  'stroke-opacity':     'strokeOpacity',
  'stroke-miterlimit':  'strokeMiterlimit',
  'fill-opacity':       'fillOpacity',
  'fill-rule':          'fillRule',
  'clip-rule':          'clipRule',
  'clip-path':          'clipPath',
  'stop-color':         'stopColor',
  'stop-opacity':       'stopOpacity',
  'font-size':          'fontSize',
  'font-family':        'fontFamily',
  'text-anchor':        'textAnchor',
  'letter-spacing':     'letterSpacing',
};

function extractViewBox(svg) {
  const m = svg.match(/viewBox\s*=\s*["']([^"']+)["']/);
  return m ? m[1] : '0 0 768 1024';
}

function extractInner(svg) {
  const m = svg.match(/<svg[^>]*>([\s\S]*?)<\/svg>\s*$/);
  return m ? m[1].trim() : '';
}

/**
 * Convert SVG inner content to JSX-compatible react-native-svg markup.
 * fillReplacements: { '#FF0000': 'fill' } — maps placeholder hex → prop name.
 */
function convertInner(inner, fillReplacements = {}) {
  // Strip <defs>, <style>, <title>, <desc> blocks
  inner = inner
    .replace(/<defs[\s\S]*?<\/defs>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<title[\s\S]*?<\/title>/gi, '')
    .replace(/<desc[\s\S]*?<\/desc>/gi, '');

  // Replace fill placeholder colors with prop references
  for (const [hex, propName] of Object.entries(fillReplacements)) {
    const esc = hex.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    inner = inner.replace(new RegExp(`fill=["']${esc}["']`, 'gi'), `fill={${propName}}`);
    inner = inner.replace(new RegExp(`fill:\\s*${esc}`, 'gi'), `fill: {${propName}}`);
  }

  // Convert element names to PascalCase
  for (const [svgEl, rnEl] of Object.entries(ELEMENT_MAP)) {
    // Opening tags: <g  or <g>  or <g/> — match element name followed by space, / or >
    inner = inner.replace(new RegExp(`<${svgEl}([ \\t\\n\\/\\>])`, 'g'), `<${rnEl}$1`);
    // Closing tags
    inner = inner.replace(new RegExp(`<\\/${svgEl}>`, 'g'), `</${rnEl}>`);
  }

  // Convert hyphenated attrs to camelCase
  for (const [from, to] of Object.entries(ATTR_MAP)) {
    inner = inner.replace(new RegExp(`${from}=`, 'g'), `${to}=`);
  }

  // Strip XML namespace attrs and class (not valid in RN SVG)
  inner = inner
    .replace(/\s+xmlns:[a-z]+=["'][^"']*["']/g, '')
    .replace(/\s+xlink:[a-z]+=["'][^"']*["']/g, '')
    .replace(/\s+xml:[a-z]+=["'][^"']*["']/g, '')
    .replace(/\s+data-[^=\s]+=["'][^"']*["']/g, '')
    .replace(/\s+class=["'][^"']*["']/g, '');

  return inner;
}

/**
 * Collect all RN SVG component names actually used in converted inner content.
 */
function collectUsedElements(inner) {
  const used = new Set();
  const rnNames = new Set(Object.values(ELEMENT_MAP));
  for (const m of inner.matchAll(/<([A-Z][a-zA-Z]+)[\s\/>]/g)) {
    if (rnNames.has(m[1])) used.add(m[1]);
  }
  return [...used].sort();
}

/**
 * Build a single-fill component (body, clothing, etc.)
 */
function buildSingleFillComponent(svg, componentName, fillPropDesc) {
  const viewBox = extractViewBox(svg);
  const inner   = convertInner(extractInner(svg), { [PLACEHOLDER]: 'fill' });
  const used    = collectUsedElements(inner);

  return `import React from 'react';
import Svg, { ${used.join(', ')} } from 'react-native-svg';

interface Props {
  /** ${fillPropDesc} */
  fill: string;
  width?: number;
  height?: number;
}

export const ${componentName} = ({ fill, width = 48, height = 64 }: Props) => (
  <Svg viewBox="${viewBox}" width={width} height={height}>
    ${inner}
  </Svg>
);
`;
}

/**
 * Build a hair component with Back + Front named exports in one file.
 */
function buildHairComponent(styleId, backSvg, frontSvg) {
  const name     = `HairStyle${styleId}`;
  const viewBox  = extractViewBox(backSvg);
  const backInner  = convertInner(extractInner(backSvg),  { [PLACEHOLDER]: 'fill' });
  const frontInner = convertInner(extractInner(frontSvg), { [PLACEHOLDER]: 'fill' });

  const usedBack  = collectUsedElements(backInner);
  const usedFront = collectUsedElements(frontInner);
  const allUsed   = [...new Set([...usedBack, ...usedFront])].sort();

  return `import React from 'react';
import Svg, { ${allUsed.join(', ')} } from 'react-native-svg';

interface Props {
  /** Hair color hex */
  fill: string;
  width?: number;
  height?: number;
}

/** Back hair layer — renders behind the face */
export const ${name}Back = ({ fill, width = 48, height = 64 }: Props) => (
  <Svg viewBox="${viewBox}" width={width} height={height}>
    ${backInner}
  </Svg>
);

/** Front hair layer — renders over the face (fringe / side strands) */
export const ${name}Front = ({ fill, width = 48, height = 64 }: Props) => (
  <Svg viewBox="${viewBox}" width={width} height={height}>
    ${frontInner}
  </Svg>
);
`;
}

/**
 * Build the FaceFeatures component with all 7 expressions.
 */
function buildFaceFeaturesComponent(expressionSvgMap) {
  // Use the first valid SVG for the viewBox
  const firstSvg = Object.values(expressionSvgMap).find(Boolean) || '';
  const viewBox  = extractViewBox(firstSvg);

  const cases = EXPRESSIONS.map(({ id }) => {
    const svg = expressionSvgMap[id];
    if (!svg) {
      return `    case '${id}':
      return null; // generation failed — add SVG paths manually`;
    }
    const inner = convertInner(extractInner(svg));
    return `    case '${id}':
      return (
        <>
          ${inner}
        </>
      );`;
  }).join('\n\n');

  // Collect all used elements across all expressions
  const allUsed = new Set();
  for (const svg of Object.values(expressionSvgMap)) {
    if (!svg) continue;
    for (const el of collectUsedElements(convertInner(extractInner(svg)))) {
      allUsed.add(el);
    }
  }
  allUsed.add('G');
  const imports = [...allUsed].sort().join(', ');

  return `import React from 'react';
import Svg, { ${imports} } from 'react-native-svg';
import { ExpressionType } from '../../types/CustomerTypes';

interface Props {
  expression: ExpressionType;
  width?: number;
  height?: number;
}

const ExpressionPaths = ({ expression }: { expression: ExpressionType }) => {
  switch (expression) {
${cases}
    default:
      return null;
  }
};

export const FaceFeatures = ({ expression, width = 48, height = 64 }: Props) => (
  <Svg viewBox="${viewBox}" width={width} height={height}>
    <ExpressionPaths expression={expression} />
  </Svg>
);
`;
}

/**
 * Build the Accessories component with all 6 types as named layers.
 */
function buildAccessoriesComponent(accessorySvgMap) {
  // Collect all used elements
  const allUsed = new Set(['G']);
  for (const svg of Object.values(accessorySvgMap)) {
    if (!svg) continue;
    for (const el of collectUsedElements(convertInner(extractInner(svg)))) {
      allUsed.add(el);
    }
  }
  const imports = [...allUsed].sort().join(', ');

  const layers = ACCESSORIES.map(({ id }) => {
    const svg = accessorySvgMap[id];
    if (!svg) {
      return `  ${id}: null, // generation failed — add SVG paths manually`;
    }
    const inner = convertInner(extractInner(svg));
    return `  ${id}: (
    <G key="${id}">
      ${inner}
    </G>
  ),`;
  }).join('\n');

  // Use first valid viewBox
  const firstSvg = Object.values(accessorySvgMap).find(Boolean) || '';
  const viewBox  = extractViewBox(firstSvg) || '0 0 768 1024';

  return `import React from 'react';
import Svg, { ${imports} } from 'react-native-svg';

type AccessoryId = ${ACCESSORIES.map(a => `'${a.id}'`).join(' | ')};

const ACCESSORY_LAYERS: Partial<Record<AccessoryId, React.ReactNode>> = {
${layers}
};

interface Props {
  /** List of accessory IDs to render */
  items: string[];
  width?: number;
  height?: number;
}

export const Accessories = ({ items, width = 48, height = 64 }: Props) => (
  <Svg viewBox="${viewBox}" width={width} height={height}>
    {items.map(id => ACCESSORY_LAYERS[id as AccessoryId] ?? null)}
  </Svg>
);
`;
}

// ─── Prompt builders ─────────────────────────────────────────────────────────

function bodyPrompt(desc) {
  return [
    `flat 2D vector illustration, front-facing female figure, ${desc},`,
    `full body from neck to feet, arms at sides, hands with fingers visible,`,
    `NO HEAD visible above neck line, no hair, no clothing,`,
    `all skin areas filled with solid flat red ${PLACEHOLDER},`,
    `clean 2px black outlines, white background,`,
    `simple mobile tycoon game character art, upright neutral standing pose,`,
    `portrait orientation, centered in frame`,
  ].join(' ');
}

function hairBackPrompt(desc) {
  return [
    `flat 2D vector illustration, hair back layer, ${desc},`,
    `front view of hair silhouette ONLY behind where face would be,`,
    `NO face features, NO body, NO clothing,`,
    `hair filled with solid flat red ${PLACEHOLDER},`,
    `clean 2px black outline, white background,`,
    `simple mobile game art, portrait orientation`,
  ].join(' ');
}

function hairFrontPrompt(desc) {
  return [
    `flat 2D vector illustration, hair front fringe layer, ${desc},`,
    `ONLY the fringe and side strands that fall in front of the face,`,
    `NO face features, NO body, NO background hair,`,
    `hair filled with solid flat red ${PLACEHOLDER},`,
    `clean 2px black outline, white background,`,
    `simple mobile game art, portrait orientation`,
  ].join(' ');
}

function clothingTopPrompt(desc) {
  return [
    `flat 2D vector illustration, ${desc}, front view,`,
    `clothing item worn on a torso, all fabric filled with solid flat red ${PLACEHOLDER},`,
    `clean 2px black outline, white background,`,
    `NO face, NO hair, NO visible skin except at collar/wrist edges,`,
    `simple mobile game wardrobe art, portrait orientation`,
  ].join(' ');
}

function clothingBottomPrompt(desc) {
  return [
    `flat 2D vector illustration, ${desc}, front view,`,
    `clothing item worn on lower half, all fabric filled with solid flat red ${PLACEHOLDER},`,
    `clean 2px black outline, white background,`,
    `NO upper body visible, legs/feet visible below hem,`,
    `simple mobile game wardrobe art, portrait orientation`,
  ].join(' ');
}

function facePrompt(desc) {
  return [
    `flat 2D vector illustration, face features close-up, ${desc},`,
    `ONLY eyes, eyebrows, and mouth visible,`,
    `NO head silhouette, NO skin fill, NO hair,`,
    `black line art on white background,`,
    `simple clean symmetrical vector style, mobile game character face`,
  ].join(' ');
}

function accessoryPrompt(desc) {
  return [
    `flat 2D vector illustration, ${desc},`,
    `isolated on white background, simple minimal vector style,`,
    `small fashion accessory icon, clean black outlines,`,
    `mobile game UI art, no character visible`,
  ].join(' ');
}

// ─── Generation runners ───────────────────────────────────────────────────────

async function generateBodyBases(force) {
  console.log('\n── Body Bases (4) ──────────────────────────────────────');
  for (const { id, desc } of BODY_BASES) {
    const outPath = path.join(LAYERS_DIR, 'body', `BodyBase${id}.tsx`);
    if (!force && fs.existsSync(outPath)) { log('skip', `BodyBase${id}`); continue; }
    log('gen', `BodyBase${id} — ${desc}`);
    try {
      const svg = await generateImage(bodyPrompt(desc));
      const tsx = buildSingleFillComponent(svg, `BodyBase${id}`, 'skin tone hex from SKIN_TONES');
      writeFile(outPath, tsx);
    } catch (e) { log('fail', `BodyBase${id}: ${e.message}`); }
    await sleep(CALL_DELAY);
  }
}

async function generateHairStyles(force) {
  console.log('\n── Hair Styles (8 × back + front) ──────────────────────');
  for (const { id, back, front } of HAIR_STYLES) {
    const outPath = path.join(LAYERS_DIR, 'hair', `HairStyle${id}.tsx`);
    if (!force && fs.existsSync(outPath)) { log('skip', `HairStyle${id}`); continue; }

    log('gen', `HairStyle${id} back — ${back.slice(0, 50)}…`);
    let backSvg, frontSvg;
    try {
      backSvg = await generateImage(hairBackPrompt(back));
      await sleep(CALL_DELAY);
      log('gen', `HairStyle${id} front — ${front.slice(0, 50)}…`);
      frontSvg = await generateImage(hairFrontPrompt(front));
    } catch (e) { log('fail', `HairStyle${id}: ${e.message}`); continue; }

    const tsx = buildHairComponent(id, backSvg, frontSvg);
    writeFile(outPath, tsx);
    await sleep(CALL_DELAY);
  }
}

async function generateClothingTops(force) {
  console.log('\n── Clothing Tops (12) ──────────────────────────────────');
  for (const { id, desc } of CLOTHING_TOPS) {
    const outPath = path.join(LAYERS_DIR, 'clothing', `ClothingTop${id}.tsx`);
    if (!force && fs.existsSync(outPath)) { log('skip', `ClothingTop${id}`); continue; }
    log('gen', `ClothingTop${id} — ${desc}`);
    try {
      const svg = await generateImage(clothingTopPrompt(desc));
      const tsx = buildSingleFillComponent(svg, `ClothingTop${id}`, 'clothing color hex');
      writeFile(outPath, tsx);
    } catch (e) { log('fail', `ClothingTop${id}: ${e.message}`); }
    await sleep(CALL_DELAY);
  }
}

async function generateClothingBottoms(force) {
  console.log('\n── Clothing Bottoms (10) ───────────────────────────────');
  for (const { id, desc } of CLOTHING_BOTTOMS) {
    const outPath = path.join(LAYERS_DIR, 'clothing', `ClothingBottom${id}.tsx`);
    if (!force && fs.existsSync(outPath)) { log('skip', `ClothingBottom${id}`); continue; }
    log('gen', `ClothingBottom${id} — ${desc}`);
    try {
      const svg = await generateImage(clothingBottomPrompt(desc));
      const tsx = buildSingleFillComponent(svg, `ClothingBottom${id}`, 'clothing color hex');
      writeFile(outPath, tsx);
    } catch (e) { log('fail', `ClothingBottom${id}: ${e.message}`); }
    await sleep(CALL_DELAY);
  }
}

async function generateFaceFeatures(force) {
  console.log('\n── Face Features (7 expressions) ──────────────────────');
  const outPath = path.join(LAYERS_DIR, 'FaceFeatures.tsx');
  if (!force && fs.existsSync(outPath)) { log('skip', 'FaceFeatures'); return; }

  const svgMap = {};
  for (const { id, desc } of EXPRESSIONS) {
    log('gen', `expression: ${id}`);
    try {
      svgMap[id] = await generateImage(facePrompt(desc));
    } catch (e) {
      log('fail', `${id}: ${e.message}`);
      svgMap[id] = null;
    }
    await sleep(CALL_DELAY);
  }

  writeFile(outPath, buildFaceFeaturesComponent(svgMap));
}

async function generateAccessories(force) {
  console.log('\n── Accessories (6 types) ───────────────────────────────');
  const outPath = path.join(LAYERS_DIR, 'Accessories.tsx');
  if (!force && fs.existsSync(outPath)) { log('skip', 'Accessories'); return; }

  const svgMap = {};
  for (const { id, desc } of ACCESSORIES) {
    log('gen', `accessory: ${id}`);
    try {
      svgMap[id] = await generateImage(accessoryPrompt(desc));
    } catch (e) {
      log('fail', `${id}: ${e.message}`);
      svgMap[id] = null;
    }
    await sleep(CALL_DELAY);
  }

  writeFile(outPath, buildAccessoriesComponent(svgMap));
}

// ─── Utilities ────────────────────────────────────────────────────────────────

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

function log(type, msg) {
  const icons = { gen: '→', skip: '↷', fail: '✗', ok: '✓' };
  console.log(`  ${icons[type] ?? type} ${msg}`);
}

function writeFile(filePath, content) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, content, 'utf8');
  log('ok', `Written: ${path.relative(process.cwd(), filePath)}`);
}

// ─── Entry point ──────────────────────────────────────────────────────────────

async function main() {
  const args  = process.argv.slice(2);
  const force = args.includes('--force');
  const batch = (args.find(a => a.startsWith('--batch=')) || '').split('=')[1] || 'all';

  console.log('╔═══════════════════════════════════════════════════════╗');
  console.log('║     Nail Shop Simulator — Character Asset Generator   ║');
  console.log('╚═══════════════════════════════════════════════════════╝');
  console.log(`  Batch : ${batch}`);
  console.log(`  Force : ${force}`);
  console.log(`  Output: ${LAYERS_DIR}`);

  if (!API_KEY || API_KEY.length < 20) {
    console.error('\nError: Set RECRAFT_API_KEY env var or update the key in this script.');
    process.exit(1);
  }

  const run = async (name, fn) => {
    if (batch === 'all' || batch === name) await fn(force);
  };

  try {
    await run('body',        generateBodyBases);
    await run('hair',        generateHairStyles);
    await run('tops',        generateClothingTops);
    await run('bottoms',     generateClothingBottoms);
    await run('face',        generateFaceFeatures);
    await run('accessories', generateAccessories);
  } catch (err) {
    console.error('\nFatal:', err);
    process.exit(1);
  }

  console.log('\n✓ All done. Run `npx expo start` to preview the results.');
}

main();
