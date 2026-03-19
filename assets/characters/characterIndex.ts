/**
 * characterIndex.ts
 *
 * Maps CustomerConfig style IDs to their layer components.
 * Populated automatically after running:
 *   node scripts/generate-character-assets.js
 *
 * Until a style ID has a generated component, the system falls back to
 * the placeholder shapes in CharacterAvatar.tsx.
 */

import React from 'react';
import { BodyArchetype, HairStyleId } from '../../types/CustomerTypes';

// ─── Body Bases ───────────────────────────────────────────────────────────────
// Uncomment each import as the corresponding file is generated.

// import { BodyBaseA } from './layers/body/BodyBaseA';
// import { BodyBaseB } from './layers/body/BodyBaseB';
// import { BodyBaseC } from './layers/body/BodyBaseC';
// import { BodyBaseD } from './layers/body/BodyBaseD';

export type BodyComponent = React.ComponentType<{ fill: string; nailFill?: string; width?: number; height?: number }>;

export const BODY_COMPONENTS: Partial<Record<BodyArchetype, BodyComponent>> = {
  // A: BodyBaseA,
  // B: BodyBaseB,
  // C: BodyBaseC,
  // D: BodyBaseD,
};

// ─── Hair Styles ──────────────────────────────────────────────────────────────

// import { HairStyle01Back, HairStyle01Front } from './layers/hair/HairStyle01';
// import { HairStyle02Back, HairStyle02Front } from './layers/hair/HairStyle02';
// import { HairStyle03Back, HairStyle03Front } from './layers/hair/HairStyle03';
// import { HairStyle04Back, HairStyle04Front } from './layers/hair/HairStyle04';
// import { HairStyle05Back, HairStyle05Front } from './layers/hair/HairStyle05';
// import { HairStyle06Back, HairStyle06Front } from './layers/hair/HairStyle06';
// import { HairStyle07Back, HairStyle07Front } from './layers/hair/HairStyle07';
// import { HairStyle08Back, HairStyle08Front } from './layers/hair/HairStyle08';

export type HairComponent = React.ComponentType<{ fill: string; width?: number; height?: number }>;

export interface HairLayerPair {
  Back:  HairComponent;
  Front: HairComponent;
}

export const HAIR_COMPONENTS: Partial<Record<HairStyleId, HairLayerPair>> = {
  // style01: { Back: HairStyle01Back, Front: HairStyle01Front },
  // style02: { Back: HairStyle02Back, Front: HairStyle02Front },
  // style03: { Back: HairStyle03Back, Front: HairStyle03Front },
  // style04: { Back: HairStyle04Back, Front: HairStyle04Front },
  // style05: { Back: HairStyle05Back, Front: HairStyle05Front },
  // style06: { Back: HairStyle06Back, Front: HairStyle06Front },
  // style07: { Back: HairStyle07Back, Front: HairStyle07Front },
  // style08: { Back: HairStyle08Back, Front: HairStyle08Front },
};

// ─── Clothing Tops ────────────────────────────────────────────────────────────

// import { ClothingTop01 } from './layers/clothing/ClothingTop01';
// … (add as generated)

export type ClothingComponent = React.ComponentType<{ fill: string; width?: number; height?: number }>;

export const CLOTHING_TOP_COMPONENTS: Partial<Record<number, ClothingComponent>> = {
  // 1: ClothingTop01,
  // 2: ClothingTop02,
  // …
};

// ─── Clothing Bottoms ─────────────────────────────────────────────────────────

// import { ClothingBottom01 } from './layers/clothing/ClothingBottom01';
// … (add as generated)

export const CLOTHING_BOTTOM_COMPONENTS: Partial<Record<number, ClothingComponent>> = {
  // 1: ClothingBottom01,
  // …
};
