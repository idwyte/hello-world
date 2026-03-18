import { create } from 'zustand';
import { OwnerProfile } from '../types/OwnerTypes';

interface OwnerState {
  profile: OwnerProfile | null;
  isOnboarded: boolean;
  setProfile: (profile: OwnerProfile) => void;
  updateProfile: (partial: Partial<OwnerProfile>) => void;
  resetProfile: () => void;
}

const DEFAULT_PROFILE: Partial<OwnerProfile> = {
  name: '',
  pronouns: 'she/her',
  ageRange: '20s',
  skinTone: 3,
  hairType: 'straight',
  hairLength: 'medium',
  hairColor: '#3B1F0D',
  eyeShape: 'almond',
  eyeColor: '#5C3317',
  accessories: [],
  bodyType: 'average',
  nailLength: 'medium',
  nailShape: 'oval',
  nailAesthetic: 'clean_nude',
  skincareRoutine: 'minimal',
  skinType: 'normal',
  skinConcern: 'hydration',
  skincarePhilosophy: 'science_backed',
  signatureProduct: 'hyaluronic_acid',
  personalStyle: 'minimalist',
  colorPalette: 'warm_neutrals',
  accessoryVibe: 'gold',
  traits: [],
  hobbies: [],
  backstory: 'grandmother',
  shopName: '',
  shopVibe: 'warm_cozy',
};

export const useOwnerStore = create<OwnerState>((set) => ({
  profile: null,
  isOnboarded: false,

  setProfile: (profile) => set({ profile, isOnboarded: true }),

  updateProfile: (partial) =>
    set((state) => ({
      profile: state.profile
        ? { ...state.profile, ...partial }
        : ({ ...DEFAULT_PROFILE, ...partial } as OwnerProfile),
    })),

  resetProfile: () => set({ profile: null, isOnboarded: false }),
}));
