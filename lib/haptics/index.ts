import { playFallback } from './expo-fallback';
import type { HapticPattern } from './patterns';

/**
 * Single entry point for haptic playback.
 *
 * M1: routes everything to the expo-haptics fallback.
 * M4: will route stealth-mode sessions to the native `stealth-haptics` module
 *      (Core Haptics on iOS, VibrationEffect on Android) for richer waveforms.
 */
export async function play(p: HapticPattern, intensity = 1): Promise<void> {
  try {
    await playFallback(p, intensity);
  } catch {
    // Haptics may be unavailable on simulator/web — never let the session error out.
  }
}

export { type HapticPattern, patternForPhase } from './patterns';
