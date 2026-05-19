import LiveActivityModule from './LiveActivityModule';
import type {
  LiveActivityHandle,
  LiveActivityStart,
  LiveActivityUpdate,
} from './types';

export type { LiveActivityHandle, LiveActivityStart, LiveActivityUpdate };

export function isAvailable(): boolean {
  try {
    return LiveActivityModule.isAvailable();
  } catch {
    return false;
  }
}

export async function startActivity(
  input: LiveActivityStart,
): Promise<LiveActivityHandle | null> {
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
  try {
    await LiveActivityModule.updateActivity(activityId, update);
  } catch {
    // ignore — non-fatal if the activity expired or the OS dropped it
  }
}

export async function endActivity(activityId: string): Promise<void> {
  try {
    await LiveActivityModule.endActivity(activityId);
  } catch {
    // ignore
  }
}

export default LiveActivityModule;
