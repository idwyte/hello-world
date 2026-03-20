import { PersonalityTraitId, HobbyId, OwnerProfile } from '../types/OwnerTypes';

export interface TraitModifiers {
  tipMultiplier: number;
  serviceDurationMultiplier: number;
  staffSpeedMultiplier: number;
  staffMoodDecayMultiplier: number;
  customerPatienceMultiplier: number;
  startingMoodBonus: number;
  repGainPerInteraction: number;
  quietHoursBonus: number;
  firstServiceBonusPerDay: number;
  staffStartSkillBonus: number;
  /** trendsetter: subtract this from service unlockReputation thresholds */
  serviceUnlockDiscount: number;
  /** analytical: show patience % text label on CustomerCard */
  patienceAlwaysVisible: boolean;
}

const DEFAULT_MODIFIERS: TraitModifiers = {
  tipMultiplier: 1,
  serviceDurationMultiplier: 1,
  staffSpeedMultiplier: 1,
  staffMoodDecayMultiplier: 1,
  customerPatienceMultiplier: 1,
  startingMoodBonus: 0,
  repGainPerInteraction: 0,
  quietHoursBonus: 0,
  firstServiceBonusPerDay: 0,
  staffStartSkillBonus: 0,
  serviceUnlockDiscount: 0,
  patienceAlwaysVisible: false,
};

const TRAIT_EFFECTS: Record<PersonalityTraitId, Partial<TraitModifiers>> = {
  perfectionist:   { tipMultiplier: 1.2, serviceDurationMultiplier: 1.1 },
  people_pleaser:  { staffMoodDecayMultiplier: 0.75 },
  boss_energy:     { staffSpeedMultiplier: 1.15, startingMoodBonus: 10 },
  chatterbox:      { customerPatienceMultiplier: 1.3, repGainPerInteraction: 0.5 },
  introvert:       { quietHoursBonus: 0.1 },
  trendsetter:     { serviceUnlockDiscount: 1 },
  hustler:         { firstServiceBonusPerDay: 10 },
  nurturer:        { staffStartSkillBonus: 5 },
  analytical:      { patienceAlwaysVisible: true },
  creative:        { tipMultiplier: 1.25 },
};

const MULTIPLICATIVE_KEYS = new Set<keyof TraitModifiers>([
  'tipMultiplier', 'serviceDurationMultiplier', 'staffSpeedMultiplier',
  'staffMoodDecayMultiplier', 'customerPatienceMultiplier',
]);

export const computeModifiers = (traits: PersonalityTraitId[]): TraitModifiers => {
  const mods = { ...DEFAULT_MODIFIERS };
  for (const trait of traits) {
    const effect = TRAIT_EFFECTS[trait];
    if (!effect) continue;
    for (const [key, value] of Object.entries(effect)) {
      const k = key as keyof TraitModifiers;
      if (typeof value === 'boolean') {
        (mods[k] as boolean) = (mods[k] as boolean) || value;
      } else if (typeof value === 'number') {
        if (MULTIPLICATIVE_KEYS.has(k)) {
          (mods[k] as number) *= value;
        } else {
          (mods[k] as number) += value;
        }
      }
    }
  }
  return mods;
};

export const getStartingBonus = (profile: OwnerProfile): { money: number; reputation: number; staffPreHired: boolean } => {
  switch (profile.backstory) {
    case 'grandmother':      return { money: 400, reputation: 0,  staffPreHired: false };
    case 'corporate_escape': return { money: 800, reputation: 0,  staffPreHired: false };
    case 'self_taught':      return { money: 300, reputation: 0,  staffPreHired: true  };
    case 'community':        return { money: 250, reputation: 15, staffPreHired: false };
    default:                 return { money: 500, reputation: 0,  staffPreHired: false };
  }
};
