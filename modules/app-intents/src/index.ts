import AppIntentsModule from './AppIntentsModule';

export type { AppIntentShortcut, AppIntentSummary } from './types';

export function isAvailable(): boolean {
  if (!AppIntentsModule) return false;
  try {
    return AppIntentsModule.isAvailable();
  } catch {
    return false;
  }
}

export async function registerIntents() {
  if (!AppIntentsModule) return { available: false, registered: [] as never[] };
  try {
    return await AppIntentsModule.registerIntents();
  } catch {
    return { available: false, registered: [] as never[] };
  }
}

export default AppIntentsModule;
