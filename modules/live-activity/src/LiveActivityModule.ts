import { requireOptionalNativeModule } from 'expo-modules-core';

import type {
  LiveActivityHandle,
  LiveActivityStart,
  LiveActivityUpdate,
} from './types';

type LiveActivityModuleType = {
  isAvailable(): boolean;
  startActivity(input: LiveActivityStart): Promise<LiveActivityHandle | null>;
  updateActivity(activityId: string, update: LiveActivityUpdate): Promise<void>;
  endActivity(activityId: string): Promise<void>;
};

// Optional: null when not linked (Expo Go / web / Jest).
export default requireOptionalNativeModule<LiveActivityModuleType>(
  'HoneLiveActivityModule',
);
