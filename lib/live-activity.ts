/**
 * Bridge to the custom `live-activity` Expo native module — ActivityKit
 * Live Activities for the Lock Screen and Dynamic Island. Lazy-loaded for
 * web / Expo Go / Jest safety.
 *
 * On iOS 16.1+ devices with the widget extension target wired up, a
 * Stealth session will surface a Lock Screen banner ("Focus · 00:14") and
 * a Dynamic Island countdown — no Hone branding, matching the decoy
 * lockscreen identity.
 */

type LiveActivityModule = typeof import('../modules/live-activity/src');
import type {
  LiveActivityHandle,
  LiveActivityStart,
  LiveActivityUpdate,
} from '../modules/live-activity/src';

let modulePromise: Promise<LiveActivityModule | null> | null = null;

async function loadModule(): Promise<LiveActivityModule | null> {
  if (modulePromise) return modulePromise;
  modulePromise = (async () => {
    try {
      return (await import(
        '../modules/live-activity/src'
      )) as LiveActivityModule;
    } catch {
      return null;
    }
  })();
  return modulePromise;
}

export async function liveActivityAvailable(): Promise<boolean> {
  const m = await loadModule();
  if (!m) return false;
  try {
    return m.isAvailable();
  } catch {
    return false;
  }
}

export async function startLiveActivity(
  input: LiveActivityStart,
): Promise<LiveActivityHandle | null> {
  const m = await loadModule();
  if (!m) return null;
  try {
    return await m.startActivity(input);
  } catch {
    return null;
  }
}

export async function updateLiveActivity(
  activityId: string,
  update: LiveActivityUpdate,
): Promise<void> {
  const m = await loadModule();
  if (!m) return;
  try {
    await m.updateActivity(activityId, update);
  } catch {
    // ignore
  }
}

export async function endLiveActivity(activityId: string): Promise<void> {
  const m = await loadModule();
  if (!m) return;
  try {
    await m.endActivity(activityId);
  } catch {
    // ignore
  }
}

export type { LiveActivityHandle, LiveActivityStart, LiveActivityUpdate };
