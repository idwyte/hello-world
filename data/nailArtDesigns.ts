export type NailArtToolType = 'stamp' | 'gem' | 'freehand';

export interface NailArtDesign {
  id: string;
  name: string;
  tool: NailArtToolType;
  category: 'floral' | 'geometric' | 'abstract' | 'seasonal' | 'cute';
  requiresUpgrade: boolean;
  upgradeId?: string;
  priceBonus: number;
}

export const NAIL_ART_DESIGNS: NailArtDesign[] = [
  // Stamps — base unlocked
  { id: 'stamp_dot',      name: 'Polka Dots',    tool: 'stamp', category: 'geometric', requiresUpgrade: false, priceBonus: 5 },
  { id: 'stamp_stripe',   name: 'Stripes',        tool: 'stamp', category: 'geometric', requiresUpgrade: false, priceBonus: 5 },
  { id: 'stamp_heart',    name: 'Hearts',         tool: 'stamp', category: 'cute',      requiresUpgrade: false, priceBonus: 8 },
  { id: 'stamp_star',     name: 'Stars',          tool: 'stamp', category: 'cute',      requiresUpgrade: false, priceBonus: 8 },
  // Stamps — nail art kit
  { id: 'stamp_floral',   name: 'Florals',        tool: 'stamp', category: 'floral',    requiresUpgrade: true, upgradeId: 'nail_art_tools', priceBonus: 12 },
  { id: 'stamp_marble',   name: 'Marble',         tool: 'stamp', category: 'abstract',  requiresUpgrade: true, upgradeId: 'nail_art_tools', priceBonus: 15 },
  { id: 'stamp_leaf',     name: 'Botanical Leaf', tool: 'stamp', category: 'floral',    requiresUpgrade: true, upgradeId: 'nail_art_tools', priceBonus: 12 },
  { id: 'stamp_spider',   name: 'Spider Web',     tool: 'stamp', category: 'seasonal',  requiresUpgrade: true, upgradeId: 'nail_art_tools', priceBonus: 10 },
  { id: 'stamp_snowflake',name: 'Snowflake',      tool: 'stamp', category: 'seasonal',  requiresUpgrade: true, upgradeId: 'nail_art_tools', priceBonus: 10 },
  // Gems — nail art kit
  { id: 'gem_crystal',    name: 'Crystal',        tool: 'gem',   category: 'abstract',  requiresUpgrade: true, upgradeId: 'nail_art_tools', priceBonus: 10 },
  { id: 'gem_pearl',      name: 'Pearl',          tool: 'gem',   category: 'abstract',  requiresUpgrade: true, upgradeId: 'nail_art_tools', priceBonus: 10 },
  { id: 'gem_gold_stud',  name: 'Gold Stud',      tool: 'gem',   category: 'abstract',  requiresUpgrade: true, upgradeId: 'nail_art_tools', priceBonus: 12 },
  // Freehand — nail art kit
  { id: 'freehand',       name: 'Freehand',       tool: 'freehand', category: 'abstract', requiresUpgrade: true, upgradeId: 'nail_art_tools', priceBonus: 20 },
];
