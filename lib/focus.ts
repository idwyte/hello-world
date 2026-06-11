/**
 * Bridge to the custom `focus-filter` Expo native module. Surfaces the
 * user's iOS Focus state so the session UI can auto-promote Stealth when
 * the user is heads-down. Lazy-loaded for web / Expo Go safety.
 */

type FocusModule = typeof import('../modules/focus-filter/src');

let modulePromise: Promise<FocusModule | null> | null = null;

async function loadModule(): Promise<FocusModule | null> {
  if (modulePromise) return modulePromise;
  modulePromise = (async () => {
    try {
      return (await import('../modules/focus-filter/src')) as FocusModule;
    } catch {
      return null;
    }
  })();
  return modulePromise;
}

export async function focusAvailable(): Promise<boolean> {
  const m = await loadModule();
  if (!m) return false;
  try {
    return m.isAvailable();
  } catch {
    return false;
  }
}

export async function requestFocusAuthorization(): Promise<
  'authorized' | 'denied' | 'notDetermined' | 'restricted'
> {
  const m = await loadModule();
  if (!m) return 'denied';
  try {
    return await m.requestAuthorization();
  } catch {
    return 'denied';
  }
}

export async function getFocusStatus(): Promise<{ isFocus: boolean }> {
  const m = await loadModule();
  if (!m) return { isFocus: false };
  try {
    const { isFocus } = await m.getStatus();
    return { isFocus };
  } catch {
    return { isFocus: false };
  }
}

/**
 * Subscribe to Focus mode changes. Returns an unsubscribe handle that the
 * caller MUST invoke on unmount. No-op when the module isn't linked.
 */
export async function subscribeFocus(
  cb: (isFocus: boolean) => void,
): Promise<() => void> {
  const m = await loadModule();
  if (!m) return () => undefined;
  try {
    const sub = m.subscribe((s) => cb(s.isFocus));
    return () => sub.remove();
  } catch {
    return () => undefined;
  }
}
