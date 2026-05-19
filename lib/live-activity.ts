/**
 * Bridge to the custom `live-activity` Expo native module — ActivityKit
 * Live Activities for the Lock Screen and Dynamic Island. Lazy-loaded for
 * web / Expo Go / Jest safety.
 *
 * iOS 16.2+ only. The 16.1 ActivityKit shipped with `Activity.request(
 * attributes:contentState:pushType:)` and `Activity.update(using:)`; 16.2
 * introduced the `ActivityContent`-based API we use here. The native
 * module uses `#available(iOS 16.2, *)` guards everywhere; the widget
 * target's deployment target should also be 16.2.
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
