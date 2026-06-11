import StealthHapticsModule from './StealthHapticsModule';
import type { AudioRoute, ScheduleHandle, StealthPattern } from './types';

export type { StealthPattern, ScheduleHandle, AudioRoute } from './types';

// Every wrapper degrades to a safe no-op when the native module isn't
// linked (Expo Go / web / Jest) — StealthHapticsModule is null there.
// Consumers (lib/haptics/native.ts, lib/audio/routing.ts) additionally
// lazy-import + catch, so the app runs fully without the module.

export function prepareEngine(): Promise<void> {
  return StealthHapticsModule?.prepareEngine() ?? Promise.resolve();
}
export function playPattern(
  pattern: StealthPattern,
  intensity = 1,
): Promise<void> {
  return StealthHapticsModule?.playPattern(pattern, intensity) ?? Promise.resolve();
}
export function schedulePattern(
  pattern: StealthPattern,
  atMs: number,
  intensity = 1,
): Promise<ScheduleHandle> {
  return (
    StealthHapticsModule?.schedulePattern(pattern, atMs, intensity) ??
    Promise.resolve('')
  );
}
export function cancelScheduled(handle: ScheduleHandle): Promise<void> {
  return StealthHapticsModule?.cancelScheduled(handle) ?? Promise.resolve();
}
export function cancelAll(): Promise<void> {
  return StealthHapticsModule?.cancelAll() ?? Promise.resolve();
}
export function currentAudioRoute(): Promise<AudioRoute> {
  return (
    StealthHapticsModule?.currentAudioRoute() ??
    Promise.resolve('unknown' as AudioRoute)
  );
}
export function isBluetoothAudioConnected(): Promise<boolean> {
  return (
    StealthHapticsModule?.isBluetoothAudioConnected() ?? Promise.resolve(false)
  );
}

export default StealthHapticsModule;
