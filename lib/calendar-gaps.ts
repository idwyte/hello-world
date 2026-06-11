/**
 * Bridge to the custom `calendar-gaps` Expo native module. Returns the
 * next free interval in the user's calendar long enough to fit a Hone
 * session. Lazy-loaded for web / Expo Go safety.
 */

type CalendarModule = typeof import('../modules/calendar-gaps/src');
import type { CalendarGap, FindGapOptions } from '../modules/calendar-gaps/src';

let modulePromise: Promise<CalendarModule | null> | null = null;

async function loadModule(): Promise<CalendarModule | null> {
  if (modulePromise) return modulePromise;
  modulePromise = (async () => {
    try {
      return (await import('../modules/calendar-gaps/src')) as CalendarModule;
    } catch {
      return null;
    }
  })();
  return modulePromise;
}

export async function calendarGapsAvailable(): Promise<boolean> {
  const m = await loadModule();
  if (!m) return false;
  try {
    return m.isAvailable();
  } catch {
    return false;
  }
}

export async function requestCalendarAuthorization(): Promise<
  'authorized' | 'denied' | 'notDetermined' | 'restricted'
> {
  const m = await loadModule();
  if (!m) return 'denied';
  try {
    return await m.requestAuthorization();
  } catch {
    return 'denied';
  }
}

export async function findNextGap(
  options: FindGapOptions = {},
): Promise<CalendarGap | null> {
  const m = await loadModule();
  if (!m) return null;
  try {
    return await m.findNextGap(options);
  } catch {
    return null;
  }
}

export type { CalendarGap, FindGapOptions };
