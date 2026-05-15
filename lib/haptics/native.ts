/**
 * Bridge to the custom `stealth-haptics` Expo native module. Lazy-imports the
 * module so this file is safe to require from web, Expo Go, and Jest (where
 * the native module isn't linked).
 *
 * The native module exposes Core Haptics on iOS and VibrationEffect.createWaveform
 * on Android with per-pattern textures that the `expo-haptics` fallback can't
 * approximate. See `modules/stealth-haptics/ios/CoreHapticsEngine.swift`.
 */

import type { HapticPattern } from './patterns';

type StealthModule = typeof import('../../modules/stealth-haptics/src');

let modulePromise: Promise<StealthModule | null> | null = null;

async function loadModule(): Promise<StealthModule | null> {
  if (modulePromise) return modulePromise;
  modulePromise = (async () => {
    try {
      return (await import(
        '../../modules/stealth-haptics/src'
      )) as StealthModule;
    } catch {
      return null;
    }
  })();
  return modulePromise;
}

export async function nativeIsAvailable(): Promise<boolean> {
  const m = await loadModule();
  if (!m) return false;
  try {
    await m.prepareEngine();
    return true;
  } catch {
    return false;
  }
}

export async function nativePrepare(): Promise<void> {
  const m = await loadModule();
  if (!m) return;
  try {
    await m.prepareEngine();
  } catch {
    // ignore — caller will see this on the first playPattern attempt
  }
}

export async function nativePlay(
  pattern: HapticPattern,
  intensity = 1,
): Promise<boolean> {
  const m = await loadModule();
  if (!m) return false;
  try {
    await m.playPattern(pattern, intensity);
    return true;
  } catch {
    return false;
  }
}

export async function nativeSchedule(
  pattern: HapticPattern,
  atMs: number,
  intensity = 1,
): Promise<string | null> {
  const m = await loadModule();
  if (!m) return null;
  try {
    return await m.schedulePattern(pattern, atMs, intensity);
  } catch {
    return null;
  }
}

export async function nativeCancelAll(): Promise<void> {
  const m = await loadModule();
  if (!m) return;
  try {
    await m.cancelAll();
  } catch {
    // ignore
  }
}
