import type { CalendarAuthorization, CalendarGap } from './types';

const CalendarGapsModule = {
  isAvailable(): boolean {
    return false;
  },
  async requestAuthorization(): Promise<CalendarAuthorization> {
    return 'denied';
  },
  async findNextGap(
    _minMinutes: number,
    _withinSeconds: number,
  ): Promise<CalendarGap | null> {
    return null;
  },
};

export default CalendarGapsModule;
