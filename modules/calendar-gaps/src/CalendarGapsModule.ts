import { requireNativeModule } from 'expo-modules-core';

import type { CalendarAuthorization, CalendarGap } from './types';

type CalendarGapsModuleType = {
  isAvailable(): boolean;
  requestAuthorization(): Promise<CalendarAuthorization>;
  findNextGap(
    minMinutes: number,
    withinSeconds: number,
  ): Promise<CalendarGap | null>;
};

export default requireNativeModule<CalendarGapsModuleType>(
  'HoneCalendarGapsModule',
);
