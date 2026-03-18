export type NailShape =
  | 'square'
  | 'round'
  | 'oval'
  | 'almond'
  | 'coffin'
  | 'stiletto'
  | 'ballerina'
  | 'flare';

export type NailLength = 'bitten' | 'short' | 'medium' | 'long' | 'extra_long';

export type NailAesthetic =
  | 'clean_nude'
  | 'bold_color'
  | 'nail_art'
  | 'french_tip'
  | 'dark_edgy'
  | 'natural';

export type ColorFamily =
  | 'nudes'
  | 'pinks'
  | 'reds'
  | 'corals'
  | 'purples'
  | 'blues'
  | 'greens'
  | 'darks'
  | 'brights'
  | 'metallics';

export type CollectionId =
  | 'spring_pastels'
  | 'summer_brights'
  | 'autumn_warmth'
  | 'winter_glam'
  | 'nudes_classics'
  | 'dark_collection';

export interface NailColor {
  id: string;
  name: string;
  hex: string;
  family: ColorFamily;
  collectionId: CollectionId;
}

export interface NailColorSelection {
  collectionId: CollectionId;
  colorIndex: number;
}

export type NailArtDesignId = string;

export type ServiceId =
  | 'basic_manicure'
  | 'gel_nails'
  | 'nail_art'
  | 'pedicure'
  | 'full_set';

export interface Service {
  id: ServiceId;
  name: string;
  durationTicks: number;
  basePrice: number;
  requiresUnlock: boolean;
  unlockReputation?: number;
}
