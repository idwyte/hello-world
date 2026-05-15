import * as Haptics from 'expo-haptics';

import type { HapticPattern } from './patterns';

/**
 * Coarse fallback used in M1 (Expo Go) and on devices without Core Haptics access.
 * Real Core Haptics patterns live in `modules/stealth-haptics` (M4).
 */
export async function playFallback(p: HapticPattern, intensity = 1): Promise<void> {
  const scale = Math.max(0, Math.min(1, intensity));
  switch (p) {
    case 'squeezeStart':
      await Haptics.impactAsync(
        scale > 0.66
          ? Haptics.ImpactFeedbackStyle.Heavy
          : scale > 0.33
            ? Haptics.ImpactFeedbackStyle.Medium
            : Haptics.ImpactFeedbackStyle.Light,
      );
      return;
    case 'hold':
      await Haptics.selectionAsync();
      return;
    case 'release':
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      return;
    case 'sessionStart':
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      return;
    case 'sessionEnd':
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      return;
    case 'reconnect':
      await Haptics.selectionAsync();
      await new Promise((r) => setTimeout(r, 120));
      await Haptics.selectionAsync();
      return;
    case 'rest':
      // intentionally silent
      return;
  }
}
