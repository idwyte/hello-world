import { Platform } from 'react-native';

/**
 * Local notification helpers. Lazy-loaded so importing this file is safe in
 * web / Jest where `expo-notifications` may not be linked. Notifications are
 * deliberately content-light to preserve the stealth promise — title/body
 * say "Focus Session" only, never the app name or "Kegel".
 */

async function loadModule() {
  try {
    return await import('expo-notifications');
  } catch {
    return null;
  }
}

let permissionRequested = false;

/**
 * Ask for notification permission once per app lifetime. On iOS this surfaces
 * the system prompt; on Android 13+ ditto. Errors are swallowed — failure
 * just means we won't fire the completion ping.
 */
export async function ensureNotificationPermission(): Promise<boolean> {
  if (Platform.OS === 'web') return false;
  if (permissionRequested) return true;
  const m = await loadModule();
  if (!m) return false;
  try {
    const { status } = await m.getPermissionsAsync();
    if (status === 'granted') {
      permissionRequested = true;
      return true;
    }
    const result = await m.requestPermissionsAsync();
    permissionRequested = result.status === 'granted';
    return permissionRequested;
  } catch {
    return false;
  }
}

/**
 * Fire a local notification when a Stealth session completes while the app
 * is backgrounded. The title/body intentionally read like a focus app.
 */
export async function notifySessionComplete(): Promise<void> {
  if (Platform.OS === 'web') return;
  const granted = await ensureNotificationPermission();
  if (!granted) return;
  const m = await loadModule();
  if (!m) return;
  try {
    await m.scheduleNotificationAsync({
      content: {
        title: 'Focus Session complete',
        body: 'Nice — keep your streak alive tomorrow.',
        sound: false,
      },
      trigger: null,
    });
  } catch {
    // ignore
  }
}

const DAILY_REMINDER_ID = 'hone_daily_reminder';

/**
 * Parse "HH:mm" 24-hour. Returns null on malformed input.
 */
function parseHHmm(hhmm: string): { hour: number; minute: number } | null {
  const m = /^(\d{1,2}):(\d{2})$/.exec(hhmm);
  if (!m) return null;
  const hour = Number(m[1]);
  const minute = Number(m[2]);
  if (
    !Number.isFinite(hour) ||
    !Number.isFinite(minute) ||
    hour < 0 ||
    hour > 23 ||
    minute < 0 ||
    minute > 59
  ) {
    return null;
  }
  return { hour, minute };
}

/**
 * Schedule a recurring daily reminder at `hhmm` (local time). Idempotent —
 * cancels any existing reminder before scheduling the new one. Title/body
 * preserves the stealth tone ("Focus Session", no app branding).
 *
 * Returns `true` if the reminder was scheduled, `false` if permission was
 * denied, the module isn't available, or the time string was malformed.
 */
export async function scheduleDailyReminder(hhmm: string): Promise<boolean> {
  if (Platform.OS === 'web') return false;
  const parsed = parseHHmm(hhmm);
  if (!parsed) return false;
  const granted = await ensureNotificationPermission();
  if (!granted) return false;
  const m = await loadModule();
  if (!m) return false;
  try {
    await cancelDailyReminder();
    // SDK 53+ exposes a typed `DAILY` trigger that's cross-platform. The
    // older `{ type: 'calendar', hour, minute, repeats: true }` shape was
    // iOS-only and silently rejected on this SDK.
    await m.scheduleNotificationAsync({
      identifier: DAILY_REMINDER_ID,
      content: {
        title: 'Focus Session',
        body: 'A quiet 3 minutes for yourself.',
        sound: false,
      },
      trigger: {
        type: m.SchedulableTriggerInputTypes.DAILY,
        hour: parsed.hour,
        minute: parsed.minute,
      },
    });
    return true;
  } catch {
    return false;
  }
}

/**
 * Cancel the daily reminder if it's scheduled. No-op when the module isn't
 * available or no reminder exists.
 */
export async function cancelDailyReminder(): Promise<void> {
  if (Platform.OS === 'web') return;
  const m = await loadModule();
  if (!m) return;
  try {
    await m.cancelScheduledNotificationAsync(DAILY_REMINDER_ID);
  } catch {
    // ignore — most likely "no notification with that id"
  }
}

export const _notificationsInternals = {
  parseHHmm,
  DAILY_REMINDER_ID,
};
