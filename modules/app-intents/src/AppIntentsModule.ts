import { requireNativeModule } from 'expo-modules-core';

import type { AppIntentSummary } from './types';

type AppIntentsModuleType = {
  /**
   * Whether AppIntents are available on this OS (iOS 16+; Android is a stub).
   */
  isAvailable(): boolean;
  /**
   * Idempotent — registers all 4 Hone intents (start session, quick discreet,
   * mark today complete, show streak) with the system. Safe to call on every
   * cold start; the system de-duplicates internally.
   */
  registerIntents(): Promise<AppIntentSummary>;
};

export default requireNativeModule<AppIntentsModuleType>('HoneAppIntentsModule');
