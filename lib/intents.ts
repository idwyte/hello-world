/**
 * Bridge to the custom `app-intents` Expo native module. Lazy-imports the
 * module so this file is safe to require from web, Expo Go, and Jest.
 * On iOS 16+ this registers four Siri/Spotlight shortcuts; everywhere else
 * the call is a no-op.
 */

type IntentsModule = typeof import('../modules/app-intents/src');

let modulePromise: Promise<IntentsModule | null> | null = null;

async function loadModule(): Promise<IntentsModule | null> {
  if (modulePromise) return modulePromise;
  modulePromise = (async () => {
    try {
      return (await import('../modules/app-intents/src')) as IntentsModule;
    } catch {
      return null;
    }
  })();
  return modulePromise;
}

export async function intentsAvailable(): Promise<boolean> {
  const m = await loadModule();
  if (!m) return false;
  try {
    return m.isAvailable();
  } catch {
    return false;
  }
}

/**
 * Idempotent — safe to call on every cold start. The system de-duplicates.
 */
export async function registerAppIntents(): Promise<void> {
  const m = await loadModule();
  if (!m) return;
  try {
    await m.registerIntents();
  } catch {
    // ignore
  }
}
