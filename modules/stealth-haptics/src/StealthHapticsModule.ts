import { requireNativeModule } from 'expo-modules-core';

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

// Will throw if the native module isn't linked (e.g., running in Expo Go,
// running on web, running under Jest). Callers use the high-level
// `lib/haptics/native.ts` wrapper which catches this.
export default requireNativeModule<StealthHapticsModuleType>('StealthHapticsModule');
