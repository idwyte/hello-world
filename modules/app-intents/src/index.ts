import AppIntentsModule from './AppIntentsModule';

export type { AppIntentShortcut, AppIntentSummary } from './types';

export function isAvailable(): boolean {
  try {
    return AppIntentsModule.isAvailable();
  } catch {
    return false;
  }
}

export async function registerIntents() {
  try {
    return await AppIntentsModule.registerIntents();
  } catch {
    return { available: false, registered: [] as never[] };
  }
}

export default AppIntentsModule;
