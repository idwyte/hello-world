import LiveActivityModule from './LiveActivityModule';
import type {
  LiveActivityHandle,
  LiveActivityStart,
  LiveActivityUpdate,
} from './types';

export type { LiveActivityHandle, LiveActivityStart, LiveActivityUpdate };

export function isAvailable(): boolean {
  if (!LiveActivityModule) return false;
  try {
    return LiveActivityModule.isAvailable();
  } catch {
    return false;
  }
}

export async function startActivity(
  input: LiveActivityStart,
): Promise<LiveActivityHandle | null> {
  if (!LiveActivityModule) return null;
  try {
    return await LiveActivityModule.startActivity(input);
  } catch {
    return null;
  }
}

export async function updateActivity(
  activityId: string,
  update: LiveActivityUpdate,
): Promise<void> {
  if (!LiveActivityModule) return;
  try {
    await LiveActivityModule.updateActivity(activityId, update);
  } catch {
    // ignore — non-fatal if the activity expired or the OS dropped it
  }
}

export async function endActivity(activityId: string): Promise<void> {
  if (!LiveActivityModule) return;
  try {
    await LiveActivityModule.endActivity(activityId);
  } catch {
    // ignore
  }
}

export default LiveActivityModule;
