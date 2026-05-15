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
