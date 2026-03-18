import { NailShape, NailLength, NailAesthetic } from './NailTypes';

export type PronounsType = 'she/her' | 'he/him' | 'they/them' | string;
export type AgeRange = '20s' | '30s' | '40s' | '50s+';
export type HairType =
  | 'straight' | 'wavy' | 'curly' | 'coily'
  | 'locs' | 'braids' | 'natural_afro' | 'shaved';
export type HairLength = 'bald' | 'short' | 'medium' | 'long';
export type EyeShape = 'almond' | 'round' | 'monolid' | 'hooded' | 'upturned' | 'downturned';
export type BodyType = 'slim' | 'average' | 'curvy' | 'plus' | 'muscular' | 'petite';

export type SkincareRoutine = 'none' | 'minimal' | 'basic_3step' | 'full_routine' | 'obsessed_10step';
export type SkinType = 'oily' | 'dry' | 'combination' | 'sensitive' | 'normal';
export type SkinConcern = 'hyperpigmentation' | 'anti_aging' | 'acne' | 'hydration' | 'glow' | 'redness';
export type SkincarePhilosophy = 'natural_clean' | 'science_backed' | 'luxury' | 'drugstore_dupe';
export type SignatureProduct = 'vitamin_c' | 'retinol' | 'spf' | 'hyaluronic_acid' | 'aha_bha' | 'niacinamide';

export type PersonalStyle =
  | 'streetwear' | 'business_casual' | 'glam_baddie'
  | 'cottagecore_boho' | 'minimalist' | 'eclectic_alt';
export type ColorPalette = 'warm_neutrals' | 'cool_tones' | 'bright_bold' | 'black_white' | 'earth_tones' | 'pastel';
export type AccessoryVibe = 'gold' | 'silver' | 'pearls' | 'stacked_rings' | 'no_accessories' | 'mixed_metals';

export type PersonalityTraitId =
  | 'perfectionist' | 'people_pleaser' | 'boss_energy' | 'chatterbox'
  | 'introvert' | 'trendsetter' | 'hustler' | 'nurturer' | 'analytical' | 'creative';

export type HobbyId =
  | 'fitness' | 'cooking' | 'reading' | 'travel' | 'music'
  | 'gaming' | 'fashion' | 'skincare_beauty' | 'social_media'
  | 'wellness' | 'sports_watching' | 'gardening' | 'art_painting' | 'dancing';

export type BackstoryId = 'grandmother' | 'corporate_escape' | 'self_taught' | 'community';

export type ShopVibe =
  | 'modern_minimalist' | 'glam_gold' | 'kawaii_cute'
  | 'edgy_alt' | 'warm_cozy' | 'clinical_pro';

export interface OwnerProfile {
  // Identity
  name: string;
  pronouns: PronounsType;
  ageRange: AgeRange;

  // Appearance
  skinTone: number;
  hairType: HairType;
  hairLength: HairLength;
  hairColor: string;
  eyeShape: EyeShape;
  eyeColor: string;
  accessories: string[];
  bodyType: BodyType;

  // Nails
  nailLength: NailLength;
  nailShape: NailShape;
  nailAesthetic: NailAesthetic;

  // Skincare
  skincareRoutine: SkincareRoutine;
  skinType: SkinType;
  skinConcern: SkinConcern;
  skincarePhilosophy: SkincarePhilosophy;
  signatureProduct: SignatureProduct;

  // Fashion
  personalStyle: PersonalStyle;
  colorPalette: ColorPalette;
  accessoryVibe: AccessoryVibe;

  // Personality & story
  traits: PersonalityTraitId[];
  hobbies: HobbyId[];
  backstory: BackstoryId;

  // Shop
  shopName: string;
  shopVibe: ShopVibe;
}
