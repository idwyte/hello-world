/**
 * characterOptions.ts
 * Single source of truth for all onboarding option labels, values,
 * effect descriptions, and emoji. Screens import from here — no
 * magic strings scattered across 10 files.
 */

import {
  PronounsType, AgeRange, HairType, HairLength, EyeShape, BodyType,
  SkincareRoutine, SkinType, SkinConcern, SkincarePhilosophy, SignatureProduct,
  PersonalStyle, ColorPalette, AccessoryVibe,
  PersonalityTraitId, HobbyId, BackstoryId, ShopVibe,
} from '../types/OwnerTypes';
import { NailLength, NailShape, NailAesthetic } from '../types/NailTypes';

// ─── Generic option type ───────────────────────────────────────────────────
export interface Option<T extends string> {
  value: T;
  label: string;
  emoji?: string;
  description?: string;   // shown as subtitle in cards
  effect?: string;        // gameplay effect shown inline (traits, backstory)
}

// ─── Identity ─────────────────────────────────────────────────────────────
export const PRONOUNS_OPTIONS: Option<string>[] = [
  { value: 'she/her',   label: 'she/her' },
  { value: 'he/him',   label: 'he/him' },
  { value: 'they/them',label: 'they/them' },
];

export const AGE_RANGE_OPTIONS: Option<AgeRange>[] = [
  { value: '20s',  label: '20s' },
  { value: '30s',  label: '30s' },
  { value: '40s',  label: '40s' },
  { value: '50s+', label: '50s+' },
];

// ─── Appearance ───────────────────────────────────────────────────────────
export const HAIR_TYPE_OPTIONS: Option<HairType>[] = [
  { value: 'straight',    label: 'Straight',       emoji: '💇' },
  { value: 'wavy',        label: 'Wavy',            emoji: '🌊' },
  { value: 'curly',       label: 'Curly',           emoji: '🌀' },
  { value: 'coily',       label: 'Coily',           emoji: '🌀' },
  { value: 'locs',        label: 'Locs',            emoji: '🌿' },
  { value: 'braids',      label: 'Braids',          emoji: '✨' },
  { value: 'natural_afro',label: 'Natural / Afro',  emoji: '☁️' },
  { value: 'shaved',      label: 'Shaved',          emoji: '⚡' },
];

export const HAIR_LENGTH_OPTIONS: Option<HairLength>[] = [
  { value: 'bald',   label: 'Bald / Shaved' },
  { value: 'short',  label: 'Short' },
  { value: 'medium', label: 'Medium' },
  { value: 'long',   label: 'Long' },
];

export const EYE_SHAPE_OPTIONS: Option<EyeShape>[] = [
  { value: 'almond',    label: 'Almond' },
  { value: 'round',     label: 'Round' },
  { value: 'monolid',   label: 'Monolid' },
  { value: 'hooded',    label: 'Hooded' },
  { value: 'upturned',  label: 'Upturned' },
  { value: 'downturned',label: 'Downturned' },
];

export const BODY_TYPE_OPTIONS: Option<BodyType>[] = [
  { value: 'slim',      label: 'Slim' },
  { value: 'average',   label: 'Average' },
  { value: 'curvy',     label: 'Curvy' },
  { value: 'plus',      label: 'Plus' },
  { value: 'muscular',  label: 'Muscular' },
  { value: 'petite',    label: 'Petite' },
];

export interface AccessoryOption {
  id: string;
  label: string;
  emoji: string;
}

export const ACCESSORY_OPTIONS: AccessoryOption[] = [
  { id: 'glasses',      label: 'Glasses',       emoji: '👓' },
  { id: 'studs',        label: 'Studs',          emoji: '✦' },
  { id: 'hoops',        label: 'Hoops',          emoji: '○' },
  { id: 'chain',        label: 'Necklace',       emoji: '📿' },
  { id: 'nose_ring',    label: 'Nose Ring',      emoji: '◦' },
  { id: 'stacked_rings',label: 'Stacked Rings',  emoji: '💍' },
];

export const HAIR_COLOR_PRESETS: { label: string; hex: string }[] = [
  { label: 'Black',        hex: '#1A1A1A' },
  { label: 'Dark Brown',   hex: '#3B1F0D' },
  { label: 'Warm Brown',   hex: '#8B4513' },
  { label: 'Auburn',       hex: '#A0522D' },
  { label: 'Golden',       hex: '#DAA520' },
  { label: 'Blonde',       hex: '#F5DEB3' },
  { label: 'Red',          hex: '#CC2200' },
  { label: 'Pink',         hex: '#FF69B4' },
  { label: 'Purple',       hex: '#9B59B6' },
  { label: 'Blue',         hex: '#4169E1' },
  { label: 'Silver',       hex: '#C0C0C0' },
  { label: 'Strawberry',   hex: '#FFB347' },
];

export const EYE_COLOR_PRESETS: { label: string; hex: string }[] = [
  { label: 'Dark Brown', hex: '#3D2B1F' },
  { label: 'Brown',      hex: '#7A5230' },
  { label: 'Hazel',      hex: '#8E7A45' },
  { label: 'Amber',      hex: '#C68642' },
  { label: 'Green',      hex: '#4A7C4E' },
  { label: 'Blue',       hex: '#5B8DB8' },
  { label: 'Grey',       hex: '#8A9BA8' },
  { label: 'Violet',     hex: '#7B68B0' },
];

// ─── Nails ────────────────────────────────────────────────────────────────
export const NAIL_LENGTH_OPTIONS: Option<NailLength>[] = [
  { value: 'bitten',     label: 'Bitten',      emoji: '😬' },
  { value: 'short',      label: 'Short',       emoji: '✂️' },
  { value: 'medium',     label: 'Medium',      emoji: '💅' },
  { value: 'long',       label: 'Long',        emoji: '✨' },
  { value: 'extra_long', label: 'Extra Long',  emoji: '👑' },
];

export const NAIL_SHAPE_OPTIONS: Option<NailShape>[] = [
  { value: 'square',    label: 'Square' },
  { value: 'round',     label: 'Round' },
  { value: 'oval',      label: 'Oval' },
  { value: 'almond',    label: 'Almond' },
  { value: 'coffin',    label: 'Coffin' },
  { value: 'stiletto',  label: 'Stiletto' },
  { value: 'ballerina', label: 'Ballerina' },
  { value: 'flare',     label: 'Flare' },
];

export const NAIL_AESTHETIC_OPTIONS: Option<NailAesthetic>[] = [
  { value: 'clean_nude',  label: 'Clean / Nude',  emoji: '🤍', description: 'Polished, minimal' },
  { value: 'bold_color',  label: 'Bold Color',     emoji: '💄', description: 'Statement shades' },
  { value: 'nail_art',    label: 'Nail Art',       emoji: '🎨', description: 'Designs & details' },
  { value: 'french_tip',  label: 'French Tip',     emoji: '🌙', description: 'Classic & crisp' },
  { value: 'dark_edgy',   label: 'Dark / Edgy',    emoji: '🖤', description: 'Moody & bold' },
  { value: 'natural',     label: 'Natural',        emoji: '🌿', description: 'Barely-there look' },
];

// ─── Skincare ─────────────────────────────────────────────────────────────
export const SKINCARE_ROUTINE_OPTIONS: Option<SkincareRoutine>[] = [
  { value: 'none',           label: 'None',               emoji: '🚿', effect: 'No bonus' },
  { value: 'minimal',        label: 'Minimal',             emoji: '🧴', effect: '+5% tip boost' },
  { value: 'basic_3step',    label: 'Basic 3-step',        emoji: '✨', effect: 'Unlocks skin prep add-on at Rep 20' },
  { value: 'full_routine',   label: 'Full Routine (6+)',   emoji: '🌟', effect: 'Facial add-on unlocks sooner (Rep 30)' },
  { value: 'obsessed_10step',label: '10-Step Obsessed',    emoji: '👑', effect: 'Full spa services + skincare decor at Rep 40' },
];

export const SKIN_TYPE_OPTIONS: Option<SkinType>[] = [
  { value: 'oily',        label: 'Oily' },
  { value: 'dry',         label: 'Dry' },
  { value: 'combination', label: 'Combination' },
  { value: 'sensitive',   label: 'Sensitive' },
  { value: 'normal',      label: 'Normal' },
];

export const SKIN_CONCERN_OPTIONS: Option<SkinConcern>[] = [
  { value: 'hyperpigmentation', label: 'Hyperpigmentation' },
  { value: 'anti_aging',        label: 'Anti-aging' },
  { value: 'acne',              label: 'Acne' },
  { value: 'hydration',         label: 'Hydration' },
  { value: 'glow',              label: 'Glow' },
  { value: 'redness',           label: 'Redness' },
];

export const SKINCARE_PHILOSOPHY_OPTIONS: Option<SkincarePhilosophy>[] = [
  { value: 'natural_clean',  label: 'Natural / Clean', emoji: '🌿' },
  { value: 'science_backed', label: 'Science-backed',  emoji: '🔬' },
  { value: 'luxury',         label: 'Luxury',           emoji: '💎' },
  { value: 'drugstore_dupe', label: 'Drugstore Dupe',  emoji: '🛒' },
];

export const SIGNATURE_PRODUCT_OPTIONS: Option<SignatureProduct>[] = [
  { value: 'vitamin_c',       label: 'Vitamin C',        emoji: '🍊' },
  { value: 'retinol',         label: 'Retinol',          emoji: '⏳' },
  { value: 'spf',             label: 'SPF',              emoji: '☀️' },
  { value: 'hyaluronic_acid', label: 'Hyaluronic Acid',  emoji: '💧' },
  { value: 'aha_bha',         label: 'AHA/BHA',          emoji: '✨' },
  { value: 'niacinamide',     label: 'Niacinamide',      emoji: '🧪' },
];

// ─── Fashion / Style ──────────────────────────────────────────────────────
export const PERSONAL_STYLE_OPTIONS: Option<PersonalStyle>[] = [
  { value: 'streetwear',       label: 'Streetwear',        emoji: '👟' },
  { value: 'business_casual',  label: 'Business Casual',   emoji: '👔' },
  { value: 'glam_baddie',      label: 'Glam / Baddie',     emoji: '💄' },
  { value: 'cottagecore_boho', label: 'Cottagecore / Boho',emoji: '🌸' },
  { value: 'minimalist',       label: 'Minimalist',        emoji: '⬜' },
  { value: 'eclectic_alt',     label: 'Eclectic / Alt',    emoji: '🎭' },
];

export const COLOR_PALETTE_OPTIONS: Option<ColorPalette>[] = [
  { value: 'warm_neutrals', label: 'Warm Neutrals', emoji: '🤎', description: 'Caramel, beige, rust' },
  { value: 'cool_tones',    label: 'Cool Tones',    emoji: '🩵', description: 'Blues, lilac, silver' },
  { value: 'bright_bold',   label: 'Bright & Bold', emoji: '🌈', description: 'Saturated, loud' },
  { value: 'black_white',   label: 'Black & White', emoji: '🖤', description: 'Classic contrast' },
  { value: 'earth_tones',   label: 'Earth Tones',   emoji: '🌿', description: 'Sage, brown, olive' },
  { value: 'pastel',        label: 'Pastel',         emoji: '🌷', description: 'Soft, dreamy' },
];

export const ACCESSORY_VIBE_OPTIONS: Option<AccessoryVibe>[] = [
  { value: 'gold',           label: 'Gold',          emoji: '✨' },
  { value: 'silver',         label: 'Silver',        emoji: '⬡' },
  { value: 'pearls',         label: 'Pearls',        emoji: '○' },
  { value: 'stacked_rings',  label: 'Stacked Rings', emoji: '💍' },
  { value: 'no_accessories', label: 'No Accessories',emoji: '🤷' },
  { value: 'mixed_metals',   label: 'Mixed Metals',  emoji: '🔀' },
];

// ─── Personality Traits ───────────────────────────────────────────────────
export interface TraitOption {
  value: PersonalityTraitId;
  label: string;
  effect: string;
}

export const TRAIT_OPTIONS: TraitOption[] = [
  { value: 'perfectionist',  label: 'Perfectionist',   effect: '+20% tips · services take 10% longer' },
  { value: 'people_pleaser', label: 'People Pleaser',   effect: 'Staff morale decays 25% slower' },
  { value: 'boss_energy',    label: 'Boss Energy',      effect: 'Staff work 15% faster · starting morale +10' },
  { value: 'chatterbox',     label: 'Chatterbox',       effect: 'Customer patience +30% · small rep gain per interaction' },
  { value: 'introvert',      label: 'Introvert',        effect: 'First 60 ticks of each day earn +10%' },
  { value: 'trendsetter',    label: 'Trendsetter',      effect: 'New services unlock 1 level earlier' },
  { value: 'hustler',        label: 'Hustler',          effect: 'First 2 services each day earn +$10 bonus' },
  { value: 'nurturer',       label: 'Nurturer',         effect: 'Staff start with +5 skill · morale floor 20' },
  { value: 'analytical',     label: 'Analytical',       effect: 'Customer patience bar always fully visible' },
  { value: 'creative',       label: 'Creative',         effect: 'Nail art services earn 25% more' },
];

// ─── Hobbies ──────────────────────────────────────────────────────────────
export interface HobbyOption {
  value: HobbyId;
  label: string;
  emoji: string;
  effect: string;
}

export const HOBBY_OPTIONS: HobbyOption[] = [
  { value: 'fitness',        label: 'Fitness / Gym',      emoji: '🏋️', effect: 'Attracts athlete clients · unlocks Express Nails' },
  { value: 'cooking',        label: 'Cooking / Foodie',   emoji: '🍳', effect: 'Staff event: homemade snacks = +15 mood' },
  { value: 'reading',        label: 'Reading / Books',    emoji: '📚', effect: 'Unlocks Reading Corner · patience +20%' },
  { value: 'travel',         label: 'Travel',             emoji: '✈️', effect: 'Attracts influencer + tourist clients' },
  { value: 'music',          label: 'Music',              emoji: '🎵', effect: 'Shop playlist · all customer patience +10%' },
  { value: 'gaming',         label: 'Gaming',             emoji: '🎮', effect: 'Unlocks Gamer Girl Nails style' },
  { value: 'fashion',        label: 'Fashion / Styling',  emoji: '👗', effect: 'Fashion influencer VIPs appear earlier' },
  { value: 'skincare_beauty',label: 'Skincare & Beauty',  emoji: '🌸', effect: 'Facial add-on unlocks 1 level earlier' },
  { value: 'social_media',   label: 'Content Creation',   emoji: '📱', effect: 'Unlocks Social Media Marketing upgrade' },
  { value: 'wellness',       label: 'Wellness / Spirit',  emoji: '🧘', effect: 'Crystal decor + calmer difficult clients' },
  { value: 'sports_watching',label: 'Sports Fan',         emoji: '🏆', effect: 'Game day events: extra customers + themed nails' },
  { value: 'gardening',      label: 'Gardening / Nature', emoji: '🌿', effect: 'Botanical nail art + nature decor' },
  { value: 'art_painting',   label: 'Art & Painting',     emoji: '🎨', effect: 'Nail art quality +15% · exclusive designs' },
  { value: 'dancing',        label: 'Dancing',            emoji: '💃', effect: 'Unlocks late-night pop-up earning events' },
];

// ─── Backstory ────────────────────────────────────────────────────────────
export interface BackstoryOption {
  value: BackstoryId;
  label: string;
  quote: string;
  effects: string[];
  startingMoney: number;
  startingRep: number;
  staffPreHired: boolean;
}

export const BACKSTORY_OPTIONS: BackstoryOption[] = [
  {
    value: 'grandmother',
    label: 'Family Trade',
    quote: '"I learned from my grandmother"',
    effects: ['Services start at quality tier 2', 'Starting cash: $400'],
    startingMoney: 400,
    startingRep: 0,
    staffPreHired: false,
  },
  {
    value: 'corporate_escape',
    label: 'Corporate Escape',
    quote: '"I left my 9-to-5 for my passion"',
    effects: ['Starting cash: $800', 'Staff start at lower mood (60)'],
    startingMoney: 800,
    startingRep: 0,
    staffPreHired: false,
  },
  {
    value: 'self_taught',
    label: 'Self-Taught',
    quote: '"I\'ve been doing nails since I was a teenager"',
    effects: ['1 staff member pre-hired', 'Starting cash: $300'],
    startingMoney: 300,
    startingRep: 0,
    staffPreHired: true,
  },
  {
    value: 'community',
    label: 'Community First',
    quote: '"I opened this shop for my community"',
    effects: ['Reputation starts at 15', 'Starting cash: $250'],
    startingMoney: 250,
    startingRep: 15,
    staffPreHired: false,
  },
];

// ─── Shop Vibe ────────────────────────────────────────────────────────────
export interface ShopVibeOption {
  value: ShopVibe;
  label: string;
  emoji: string;
  description: string;
  palette: string[];  // 3 hex colors for preview strip
}

export const SHOP_VIBE_OPTIONS: ShopVibeOption[] = [
  {
    value: 'modern_minimalist',
    label: 'Modern Minimalist',
    emoji: '⬜',
    description: 'Clean, white, warm grey',
    palette: ['#FFFFFF', '#8B8680', '#FAF3E0'],
  },
  {
    value: 'glam_gold',
    label: 'Glam & Gold',
    emoji: '✨',
    description: 'Black, gold, velvet pink',
    palette: ['#1A1A1A', '#DAA520', '#C4688C'],
  },
  {
    value: 'kawaii_cute',
    label: 'Kawaii / Cute',
    emoji: '🌸',
    description: 'Pastel pink, lavender, white',
    palette: ['#FFB5C8', '#D8B4E2', '#FFFFFF'],
  },
  {
    value: 'edgy_alt',
    label: 'Edgy / Alt',
    emoji: '⚡',
    description: 'Dark purple, black, neon',
    palette: ['#2D1B2E', '#1A1A1A', '#39FF14'],
  },
  {
    value: 'warm_cozy',
    label: 'Warm & Cozy',
    emoji: '🕯️',
    description: 'Terracotta, beige, sage',
    palette: ['#CC5500', '#FAF3E0', '#A8C5A0'],
  },
  {
    value: 'clinical_pro',
    label: 'Clinical / Pro',
    emoji: '🏥',
    description: 'White, teal, chrome',
    palette: ['#FFFFFF', '#4ECDC4', '#C0C0C8'],
  },
];
