import { requireOptionalNativeModule } from 'expo-modules-core';

import type { CalendarAuthorization, CalendarGap } from './types';

type CalendarGapsModuleType = {
  isAvailable(): boolean;
  requestAuthorization(): Promise<CalendarAuthorization>;
  findNextGap(
    minMinutes: number,
    withinSeconds: number,
  ): Promise<CalendarGap | null>;
};

// Optional: null when not linked (Expo Go / web / Jest).
export default requireOptionalNativeModule<CalendarGapsModuleType>(
  'HoneCalendarGapsModule',
);
