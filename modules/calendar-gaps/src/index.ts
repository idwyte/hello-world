import CalendarGapsModule from './CalendarGapsModule';
import type { CalendarGap, FindGapOptions } from './types';

export type { CalendarAuthorization, CalendarGap, FindGapOptions } from './types';

export function isAvailable(): boolean {
  if (!CalendarGapsModule) return false;
  try {
    return CalendarGapsModule.isAvailable();
  } catch {
    return false;
  }
}

export async function requestAuthorization() {
  if (!CalendarGapsModule) return 'denied' as const;
  try {
    return await CalendarGapsModule.requestAuthorization();
  } catch {
    return 'denied' as const;
  }
}

/**
 * Find the next free interval in the user's primary calendar that lasts
 * at least `minMinutes` and starts within `within` (seconds, default 2 h).
 * Returns null if no gap qualifies, the user denied permission, or the
 * module isn't available.
 */
export async function findNextGap(
  options: FindGapOptions = {},
): Promise<CalendarGap | null> {
  const minMinutes = Math.max(1, options.minMinutes ?? 3);
  const withinSeconds = Math.max(60, options.withinSeconds ?? 2 * 60 * 60);
  if (!CalendarGapsModule) return null;
  try {
    return await CalendarGapsModule.findNextGap(minMinutes, withinSeconds);
  } catch {
    return null;
  }
}

export default CalendarGapsModule;
