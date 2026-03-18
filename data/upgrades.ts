export interface Upgrade {
  id: string;
  name: string;
  description: string;
  cost: number;
  requiresReputation?: number;
  category: 'station' | 'service' | 'decor' | 'staff';
  effect: UpgradeEffect;
}

export interface UpgradeEffect {
  type:
    | 'add_station'
    | 'upgrade_chair'
    | 'unlock_service'
    | 'unlock_nail_art'
    | 'add_staff_slot'
    | 'add_decor'
    | 'customer_patience_boost';
  value?: number | string;
}

export const UPGRADES: Upgrade[] = [
  {
    id: 'extra_station',
    name: 'Add Station',
    description: 'Adds 1 nail station slot (max 8)',
    cost: 500,
    category: 'station',
    effect: { type: 'add_station' },
  },
  {
    id: 'better_chair_t2',
    name: 'Upgrade Chair (Tier 2)',
    description: '+20% service speed at Station 1',
    cost: 300,
    category: 'station',
    effect: { type: 'upgrade_chair', value: 2 },
  },
  {
    id: 'nail_art_tools',
    name: 'Nail Art Kit',
    description: 'Unlocks nail art service + stamp/gem tools',
    cost: 200,
    category: 'service',
    effect: { type: 'unlock_nail_art' },
  },
  {
    id: 'vip_booth',
    name: 'VIP Booth',
    description: 'Unlocks VIP customers with premium tips',
    cost: 1000,
    requiresReputation: 50,
    category: 'station',
    effect: { type: 'upgrade_chair', value: 3 },
  },
  {
    id: 'extra_staff_slot',
    name: 'Hire Extra Staff',
    description: 'Unlocks 3rd staff slot',
    cost: 0,
    requiresReputation: 20,
    category: 'staff',
    effect: { type: 'add_staff_slot' },
  },
  {
    id: 'reading_corner',
    name: 'Reading Corner',
    description: 'Customer patience +20% (requires Reading hobby)',
    cost: 350,
    category: 'decor',
    effect: { type: 'customer_patience_boost', value: 0.2 },
  },
  {
    id: 'plant_corner',
    name: 'Corner Plant',
    description: 'Adds a lush plant to the waiting area',
    cost: 80,
    category: 'decor',
    effect: { type: 'add_decor', value: 'plant_corner' },
  },
  {
    id: 'wall_art',
    name: 'Wall Art',
    description: 'Nail art display poster — customer rep +2',
    cost: 150,
    category: 'decor',
    effect: { type: 'add_decor', value: 'wall_art' },
  },
];
