import { requireOptionalNativeModule } from 'expo-modules-core';

import type { FocusAuthorization, FocusStatus } from './types';

type FocusFilterModuleType = {
  isAvailable(): boolean;
  requestAuthorization(): Promise<FocusAuthorization>;
  getStatus(): Promise<FocusStatus>;
  startListening(): Promise<void>;
  stopListening(): Promise<void>;
  addListener(eventName: string): void;
  removeListeners(count: number): void;
};

// Optional: null when not linked (Expo Go / web / Jest).
export default requireOptionalNativeModule<FocusFilterModuleType>(
  'HoneFocusFilterModule',
);
