import { NailColor, CollectionId } from '../types/NailTypes';

export const NAIL_COLORS: NailColor[] = [
  // Spring Pastels
  { id: 'sp_01', name: 'Petal Pink',     hex: '#FFB5C8', family: 'pinks',    collectionId: 'spring_pastels' },
  { id: 'sp_02', name: 'Lavender Mist',  hex: '#D8B4E2', family: 'purples',  collectionId: 'spring_pastels' },
  { id: 'sp_03', name: 'Mint Breeze',    hex: '#B4E2C8', family: 'greens',   collectionId: 'spring_pastels' },
  { id: 'sp_04', name: 'Baby Blue',      hex: '#B4D4E2', family: 'blues',    collectionId: 'spring_pastels' },
  { id: 'sp_05', name: 'Peach Blossom',  hex: '#FFD4B4', family: 'corals',   collectionId: 'spring_pastels' },
  { id: 'sp_06', name: 'Butter Yellow',  hex: '#FFF0B4', family: 'brights',  collectionId: 'spring_pastels' },
  { id: 'sp_07', name: 'Rose Quartz',    hex: '#F4C2C2', family: 'pinks',    collectionId: 'spring_pastels' },
  { id: 'sp_08', name: 'Lilac Dream',    hex: '#C8B4E2', family: 'purples',  collectionId: 'spring_pastels' },

  // Summer Brights
  { id: 'sb_01', name: 'Hot Coral',      hex: '#FF6B6B', family: 'corals',   collectionId: 'summer_brights' },
  { id: 'sb_02', name: 'Electric Blue',  hex: '#4ECDC4', family: 'blues',    collectionId: 'summer_brights' },
  { id: 'sb_03', name: 'Neon Yellow',    hex: '#FFE66D', family: 'brights',  collectionId: 'summer_brights' },
  { id: 'sb_04', name: 'Mango Tango',    hex: '#FF8C42', family: 'corals',   collectionId: 'summer_brights' },
  { id: 'sb_05', name: 'Berry Pop',      hex: '#C9184A', family: 'reds',     collectionId: 'summer_brights' },
  { id: 'sb_06', name: 'Lime Zest',      hex: '#8BC34A', family: 'greens',   collectionId: 'summer_brights' },
  { id: 'sb_07', name: 'Ocean Dive',     hex: '#0077B6', family: 'blues',    collectionId: 'summer_brights' },
  { id: 'sb_08', name: 'Hibiscus',       hex: '#FF006E', family: 'pinks',    collectionId: 'summer_brights' },

  // Autumn Warmth
  { id: 'aw_01', name: 'Burnt Sienna',   hex: '#CC5500', family: 'reds',     collectionId: 'autumn_warmth' },
  { id: 'aw_02', name: 'Spiced Plum',    hex: '#7B2D8B', family: 'purples',  collectionId: 'autumn_warmth' },
  { id: 'aw_03', name: 'Maple Leaf',     hex: '#C84B00', family: 'corals',   collectionId: 'autumn_warmth' },
  { id: 'aw_04', name: 'Mocha Latte',    hex: '#9B6E4E', family: 'nudes',    collectionId: 'autumn_warmth' },
  { id: 'aw_05', name: 'Forest Moss',    hex: '#5A6E2A', family: 'greens',   collectionId: 'autumn_warmth' },
  { id: 'aw_06', name: 'Pumpkin Spice',  hex: '#E8882A', family: 'corals',   collectionId: 'autumn_warmth' },
  { id: 'aw_07', name: 'Dusty Rose',     hex: '#B56576', family: 'pinks',    collectionId: 'autumn_warmth' },
  { id: 'aw_08', name: 'Caramel Apple',  hex: '#C4773B', family: 'nudes',    collectionId: 'autumn_warmth' },

  // Winter Glam
  { id: 'wg_01', name: 'Midnight',       hex: '#1A1A2E', family: 'darks',    collectionId: 'winter_glam' },
  { id: 'wg_02', name: 'Ice Queen',      hex: '#E0F4FF', family: 'blues',    collectionId: 'winter_glam' },
  { id: 'wg_03', name: 'Champagne',      hex: '#F7E7CE', family: 'metallics', collectionId: 'winter_glam' },
  { id: 'wg_04', name: 'Ruby Red',       hex: '#9B111E', family: 'reds',     collectionId: 'winter_glam' },
  { id: 'wg_05', name: 'Midnight Plum',  hex: '#4A0E4E', family: 'purples',  collectionId: 'winter_glam' },
  { id: 'wg_06', name: 'Silver Frost',   hex: '#C0C0C8', family: 'metallics', collectionId: 'winter_glam' },
  { id: 'wg_07', name: 'Gold Rush',      hex: '#DAA520', family: 'metallics', collectionId: 'winter_glam' },
  { id: 'wg_08', name: 'Velvet Noir',    hex: '#2D1B2E', family: 'darks',    collectionId: 'winter_glam' },

  // Nudes & Classics
  { id: 'nc_01', name: 'Bare Skin',      hex: '#FDDBB4', family: 'nudes',    collectionId: 'nudes_classics' },
  { id: 'nc_02', name: 'Cotton Candy',   hex: '#FFB6C1', family: 'pinks',    collectionId: 'nudes_classics' },
  { id: 'nc_03', name: 'Blush Nude',     hex: '#E8B4A0', family: 'nudes',    collectionId: 'nudes_classics' },
  { id: 'nc_04', name: 'Ballet Slipper', hex: '#F4A7B9', family: 'pinks',    collectionId: 'nudes_classics' },
  { id: 'nc_05', name: 'Taupe Dream',    hex: '#C4AA8A', family: 'nudes',    collectionId: 'nudes_classics' },
  { id: 'nc_06', name: 'French White',   hex: '#FAFAF0', family: 'nudes',    collectionId: 'nudes_classics' },
  { id: 'nc_07', name: 'Classic Red',    hex: '#CC0000', family: 'reds',     collectionId: 'nudes_classics' },
  { id: 'nc_08', name: 'Berry Stain',    hex: '#8B2252', family: 'purples',  collectionId: 'nudes_classics' },

  // Dark Collection
  { id: 'dc_01', name: 'Obsidian',       hex: '#0D0D0D', family: 'darks',    collectionId: 'dark_collection' },
  { id: 'dc_02', name: 'Blood Moon',     hex: '#6B0000', family: 'reds',     collectionId: 'dark_collection' },
  { id: 'dc_03', name: 'Void',           hex: '#1C1C3A', family: 'darks',    collectionId: 'dark_collection' },
  { id: 'dc_04', name: 'Toxic',          hex: '#39FF14', family: 'greens',   collectionId: 'dark_collection' },
  { id: 'dc_05', name: 'Witch Hour',     hex: '#4B0082', family: 'purples',  collectionId: 'dark_collection' },
  { id: 'dc_06', name: 'Rust Decay',     hex: '#6B3A2A', family: 'darks',    collectionId: 'dark_collection' },
  { id: 'dc_07', name: 'Absinthe',       hex: '#1B5E20', family: 'greens',   collectionId: 'dark_collection' },
  { id: 'dc_08', name: 'Bruise',         hex: '#4A235A', family: 'purples',  collectionId: 'dark_collection' },
];

export const getColorsByCollection = (id: CollectionId) =>
  NAIL_COLORS.filter((c) => c.collectionId === id);

export const COLLECTION_NAMES: Record<CollectionId, string> = {
  spring_pastels:  'Spring Pastels',
  summer_brights:  'Summer Brights',
  autumn_warmth:   'Autumn Warmth',
  winter_glam:     'Winter Glam',
  nudes_classics:  'Nudes & Classics',
  dark_collection: 'Dark Collection',
};

export const COLLECTION_ORDER: CollectionId[] = [
  'nudes_classics',
  'spring_pastels',
  'summer_brights',
  'autumn_warmth',
  'winter_glam',
  'dark_collection',
];
