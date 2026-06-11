import type { AppIntentSummary } from './types';

const AppIntentsModule = {
  isAvailable(): boolean {
    return false;
  },
  async registerIntents(): Promise<AppIntentSummary> {
    return { available: false, registered: [] };
  },
};

export default AppIntentsModule;
