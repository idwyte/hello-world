import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import { create } from 'zustand';

import type { CueStyle } from '@/lib/audio/cues';
import type { DecoyCover } from '@/lib/audio/decoy-track';

export type StealthSettings = {
  hapticIntensity: number; // 0–1
  cueStyle: CueStyle;
  decoyCover: DecoyCover;
  bluetoothOnly: boolean;
  defaultMode: 'normal' | 'stealth';
  // Phase 2 — reminders
  reminderEnabled: boolean;
  /** "HH:mm" 24h, or null when disabled. */
  reminderTime: string | null;
  // Phase 3 — security & icon
  biometricLocked: boolean;
  appIconVariant: 'default' | 'focus' | 'posture' | 'health';
};

const DEFAULTS: StealthSettings = {
  hapticIntensity: 0.7,
  cueStyle: 'tone',
  decoyCover: 'minimal_violet',
  bluetoothOnly: true,
  defaultMode: 'normal',
  reminderEnabled: false,
  reminderTime: null,
  biometricLocked: false,
  appIconVariant: 'default',
};

const STORAGE_KEY = 'hone_stealth_settings_v1';

type SettingsStore = {
  hydrated: boolean;
  settings: StealthSettings;
  hydrate: () => Promise<void>;
  update: (patch: Partial<StealthSettings>) => Promise<void>;
  reset: () => Promise<void>;
};

async function readPersisted(): Promise<StealthSettings | null> {
  try {
    const raw =
      Platform.OS === 'web'
        ? null
        : await SecureStore.getItemAsync(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return { ...DEFAULTS, ...parsed };
  } catch {
    return null;
  }
}

async function writePersisted(s: StealthSettings): Promise<void> {
  if (Platform.OS === 'web') return;
  try {
    await SecureStore.setItemAsync(STORAGE_KEY, JSON.stringify(s));
  } catch {
    // best-effort
  }
}

export const useSettingsStore = create<SettingsStore>((set, get) => ({
  hydrated: false,
  settings: DEFAULTS,
  hydrate: async () => {
    const persisted = await readPersisted();
    set({ hydrated: true, settings: persisted ?? DEFAULTS });
  },
  update: async (patch) => {
    const next = { ...get().settings, ...patch };
    set({ settings: next });
    await writePersisted(next);
  },
  reset: async () => {
    set({ settings: DEFAULTS });
    await writePersisted(DEFAULTS);
  },
}));

export { DEFAULTS as STEALTH_DEFAULTS };
