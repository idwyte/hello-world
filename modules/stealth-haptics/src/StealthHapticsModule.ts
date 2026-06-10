import { requireOptionalNativeModule } from 'expo-modules-core';

import type { AudioRoute, ScheduleHandle, StealthPattern } from './types';

type StealthHapticsModuleType = {
  prepareEngine(): Promise<void>;
  playPattern(pattern: StealthPattern, intensity: number): Promise<void>;
  schedulePattern(
    pattern: StealthPattern,
    atMs: number,
    intensity: number,
  ): Promise<ScheduleHandle>;
  cancelScheduled(handle: ScheduleHandle): Promise<void>;
  cancelAll(): Promise<void>;
  /** Snapshot of the current audio route — used to gate cue playback. */
  currentAudioRoute(): Promise<AudioRoute>;
  isBluetoothAudioConnected(): Promise<boolean>;
};

// Optional: null when the native module isn't linked (Expo Go, web,
// Jest). The lib/haptics/native.ts wrapper null-guards before use.
export default requireOptionalNativeModule<StealthHapticsModuleType>(
  'StealthHapticsModule',
);
