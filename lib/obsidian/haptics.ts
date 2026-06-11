// Obsidian Kinetic — haptic event dispatch.
// Maps the named events in tokens.hapticEvents to expo-haptics calls.
// Haptics are a user setting (default ON, motion spec §6); callers pass
// `enabled` from the settings store rather than each screen re-checking.
import * as Haptics from 'expo-haptics';

import { hapticEvents } from './tokens';

export type HapticEvent = keyof typeof hapticEvents;

export async function fireHaptic(
  event: HapticEvent,
  enabled = true,
): Promise<void> {
  if (!enabled) return;
  const kind = hapticEvents[event];
  if (kind === null) return; // e.g. referralAcknowledged — deliberately silent
  try {
    switch (kind) {
      case 'impactLight':
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        break;
      case 'impactMedium':
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        break;
      case 'selectionClick':
        await Haptics.selectionAsync();
        break;
      case 'notificationSuccess':
        await Haptics.notificationAsync(
          Haptics.NotificationFeedbackType.Success,
        );
        break;
      case 'notificationWarning':
        await Haptics.notificationAsync(
          Haptics.NotificationFeedbackType.Warning,
        );
        break;
    }
  } catch {
    // Simulators / devices without a Taptic engine — silent no-op.
  }
}
