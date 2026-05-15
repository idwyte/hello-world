import { Platform } from 'react-native';

export type AudioRouteKind =
  | 'bluetooth'
  | 'wired'
  | 'speaker'
  | 'silent'
  | 'unknown';

/**
 * Lazy module loader. The native `stealth-haptics` module throws at import
 * time when not linked (Expo Go, web, Jest). All access goes through this
 * lazy wrapper so simply importing this file is safe everywhere.
 */
async function loadModule() {
  try {
    return await import('../../modules/stealth-haptics/src');
  } catch {
    return null;
  }
}

export async function currentAudioRoute(): Promise<AudioRouteKind> {
  const m = await loadModule();
  if (!m) return 'unknown';
  try {
    return (await m.currentAudioRoute()) as AudioRouteKind;
  } catch {
    return 'unknown';
  }
}

/**
 * Stealth Mode never plays through the phone's built-in speaker. Cues are
 * only audible when the user has Bluetooth audio (AirPods etc.) or wired
 * headphones connected. If neither is connected, cues are silently
 * suppressed and the user gets haptics only.
 */
export async function shouldPlayAudioCue(): Promise<boolean> {
  const r = await currentAudioRoute();
  return r === 'bluetooth' || r === 'wired';
}

export function isAudioRoutingSupported(): boolean {
  return Platform.OS === 'ios' || Platform.OS === 'android';
}
