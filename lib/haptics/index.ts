import { playFallback } from './expo-fallback';
import {
  nativeCancelAll,
  nativeIsAvailable,
  nativePlay,
  nativePrepare,
} from './native';
import type { HapticPattern } from './patterns';

let preferNative = false;
let intensity = 1;

export type HapticsBackend = 'native' | 'fallback';

export function setHapticsIntensity(value: number) {
  intensity = Math.max(0, Math.min(1, value));
}

export function getHapticsIntensity(): number {
  return intensity;
}

/**
 * Stealth Mode entry point. Probes the native module; on success subsequent
 * `play()` calls route to Core Haptics (iOS) or VibrationEffect waveforms
 * (Android). The fallback path remains for normal-mode sessions and for
 * devices where the native module isn't available.
 */
export async function enableNativeHaptics(): Promise<HapticsBackend> {
  const ok = await nativeIsAvailable();
  preferNative = ok;
  if (ok) await nativePrepare();
  return ok ? 'native' : 'fallback';
}

export function disableNativeHaptics() {
  preferNative = false;
  void nativeCancelAll();
}

export async function play(p: HapticPattern, scale = intensity): Promise<void> {
  if (preferNative) {
    const ok = await nativePlay(p, scale);
    if (ok) return;
    preferNative = false; // fall through to fallback on first native failure
  }
  try {
    await playFallback(p, scale);
  } catch {
    // Haptics may be unavailable on simulator/web — never let the session error out.
  }
}

export async function cancelAllHaptics(): Promise<void> {
  await nativeCancelAll();
}

export { type HapticPattern, patternForPhase } from './patterns';
