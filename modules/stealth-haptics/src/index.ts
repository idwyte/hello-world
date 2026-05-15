import StealthHapticsModule from './StealthHapticsModule';

export type { StealthPattern, ScheduleHandle, AudioRoute } from './types';

export function prepareEngine(): Promise<void> {
  return StealthHapticsModule.prepareEngine();
}
export function playPattern(
  pattern: import('./types').StealthPattern,
  intensity = 1,
): Promise<void> {
  return StealthHapticsModule.playPattern(pattern, intensity);
}
export function schedulePattern(
  pattern: import('./types').StealthPattern,
  atMs: number,
  intensity = 1,
): Promise<import('./types').ScheduleHandle> {
  return StealthHapticsModule.schedulePattern(pattern, atMs, intensity);
}
export function cancelScheduled(handle: import('./types').ScheduleHandle) {
  return StealthHapticsModule.cancelScheduled(handle);
}
export function cancelAll(): Promise<void> {
  return StealthHapticsModule.cancelAll();
}
export function currentAudioRoute() {
  return StealthHapticsModule.currentAudioRoute();
}
export function isBluetoothAudioConnected(): Promise<boolean> {
  return StealthHapticsModule.isBluetoothAudioConnected();
}

export default StealthHapticsModule;
