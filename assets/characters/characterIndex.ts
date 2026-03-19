/**
 * characterIndex.ts
 *
 * Maps CustomerConfig style IDs to their layer components.
 */

import React from 'react';
import { BodyArchetype, HairStyleId } from '../../types/CustomerTypes';

// ─── Body Bases ───────────────────────────────────────────────────────────────
import { BodyBaseA } from './layers/body/BodyBaseA';
import { BodyBaseB } from './layers/body/BodyBaseB';
import { BodyBaseC } from './layers/body/BodyBaseC';
import { BodyBaseD } from './layers/body/BodyBaseD';

export type BodyComponent = React.ComponentType<{ fill: string; nailFill?: string; width?: number; height?: number }>;

export const BODY_COMPONENTS: Partial<Record<BodyArchetype, BodyComponent>> = {
  A: BodyBaseA,
  B: BodyBaseB,
  C: BodyBaseC,
  D: BodyBaseD,
};

// ─── Hair Styles ──────────────────────────────────────────────────────────────
import { HairStyle01Back, HairStyle01Front } from './layers/hair/HairStyle01';
import { HairStyle02Back, HairStyle02Front } from './layers/hair/HairStyle02';
import { HairStyle03Back, HairStyle03Front } from './layers/hair/HairStyle03';
import { HairStyle04Back, HairStyle04Front } from './layers/hair/HairStyle04';
import { HairStyle05Back, HairStyle05Front } from './layers/hair/HairStyle05';
import { HairStyle06Back, HairStyle06Front } from './layers/hair/HairStyle06';
import { HairStyle07Back, HairStyle07Front } from './layers/hair/HairStyle07';
import { HairStyle08Back, HairStyle08Front } from './layers/hair/HairStyle08';

export type HairComponent = React.ComponentType<{ fill: string; width?: number; height?: number }>;

export interface HairLayerPair {
  Back:  HairComponent;
  Front: HairComponent;
}

export const HAIR_COMPONENTS: Partial<Record<HairStyleId, HairLayerPair>> = {
  style01: { Back: HairStyle01Back, Front: HairStyle01Front },
  style02: { Back: HairStyle02Back, Front: HairStyle02Front },
  style03: { Back: HairStyle03Back, Front: HairStyle03Front },
  style04: { Back: HairStyle04Back, Front: HairStyle04Front },
  style05: { Back: HairStyle05Back, Front: HairStyle05Front },
  style06: { Back: HairStyle06Back, Front: HairStyle06Front },
  style07: { Back: HairStyle07Back, Front: HairStyle07Front },
  style08: { Back: HairStyle08Back, Front: HairStyle08Front },
};

// ─── Clothing Tops ────────────────────────────────────────────────────────────
import { ClothingTop01  } from './layers/clothing/ClothingTop01';
import { ClothingTop02  } from './layers/clothing/ClothingTop02';
import { ClothingTop03  } from './layers/clothing/ClothingTop03';
import { ClothingTop04  } from './layers/clothing/ClothingTop04';
import { ClothingTop05  } from './layers/clothing/ClothingTop05';
import { ClothingTop06  } from './layers/clothing/ClothingTop06';
import { ClothingTop07  } from './layers/clothing/ClothingTop07';
import { ClothingTop08  } from './layers/clothing/ClothingTop08';
import { ClothingTop09  } from './layers/clothing/ClothingTop09';
import { ClothingTop10  } from './layers/clothing/ClothingTop10';
import { ClothingTop11  } from './layers/clothing/ClothingTop11';
import { ClothingTop12  } from './layers/clothing/ClothingTop12';

export type ClothingComponent = React.ComponentType<{ fill: string; width?: number; height?: number }>;

export const CLOTHING_TOP_COMPONENTS: Partial<Record<number, ClothingComponent>> = {
  1:  ClothingTop01,
  2:  ClothingTop02,
  3:  ClothingTop03,
  4:  ClothingTop04,
  5:  ClothingTop05,
  6:  ClothingTop06,
  7:  ClothingTop07,
  8:  ClothingTop08,
  9:  ClothingTop09,
  10: ClothingTop10,
  11: ClothingTop11,
  12: ClothingTop12,
};

// ─── Clothing Bottoms ─────────────────────────────────────────────────────────
import { ClothingBottom01  } from './layers/clothing/ClothingBottom01';
import { ClothingBottom02  } from './layers/clothing/ClothingBottom02';
import { ClothingBottom03  } from './layers/clothing/ClothingBottom03';
import { ClothingBottom04  } from './layers/clothing/ClothingBottom04';
import { ClothingBottom05  } from './layers/clothing/ClothingBottom05';
import { ClothingBottom06  } from './layers/clothing/ClothingBottom06';
import { ClothingBottom07  } from './layers/clothing/ClothingBottom07';
import { ClothingBottom08  } from './layers/clothing/ClothingBottom08';
import { ClothingBottom09  } from './layers/clothing/ClothingBottom09';
import { ClothingBottom10  } from './layers/clothing/ClothingBottom10';

export const CLOTHING_BOTTOM_COMPONENTS: Partial<Record<number, ClothingComponent>> = {
  1:  ClothingBottom01,
  2:  ClothingBottom02,
  3:  ClothingBottom03,
  4:  ClothingBottom04,
  5:  ClothingBottom05,
  6:  ClothingBottom06,
  7:  ClothingBottom07,
  8:  ClothingBottom08,
  9:  ClothingBottom09,
  10: ClothingBottom10,
};
