import type { EventSubscription } from 'expo-modules-core';

import FocusFilterModule from './FocusFilterModule';

export type { FocusAuthorization, FocusStatus } from './types';

type FocusEventsMap = {
  FocusStatusChanged: (evt: { isFocus: boolean }) => void;
};

// As of Expo SDK 52 the native module is itself an EventEmitter; no need to
// wrap it. Cast through unknown so TS treats addListener as event-typed.
const emitter = FocusFilterModule as unknown as {
  addListener<EventName extends keyof FocusEventsMap>(
    eventName: EventName,
    listener: FocusEventsMap[EventName],
  ): EventSubscription;
};

export function isAvailable(): boolean {
  try {
    return FocusFilterModule.isAvailable();
  } catch {
    return false;
  }
}

export async function requestAuthorization() {
  try {
    return await FocusFilterModule.requestAuthorization();
  } catch {
    return 'denied' as const;
  }
}

export async function getStatus() {
  try {
    return await FocusFilterModule.getStatus();
  } catch {
    return { isFocus: false, authorization: 'denied' as const };
  }
}

/**
 * Subscribe to Focus mode changes. Returns an unsubscribe handle.
 * Auto-starts the native listener; the last unsubscribe stops it.
 */
export function subscribe(
  callback: (status: { isFocus: boolean }) => void,
): EventSubscription {
  try {
    void FocusFilterModule.startListening?.();
  } catch {
    // module not linked (Expo Go, web, Jest) — return a no-op subscription
    return { remove: () => undefined };
  }
  const sub = emitter.addListener('FocusStatusChanged', (evt) => {
    callback({ isFocus: Boolean(evt?.isFocus) });
  });
  return {
    remove: () => {
      sub.remove();
      try {
        void FocusFilterModule.stopListening?.();
      } catch {
        // ignore
      }
    },
  };
}

export default FocusFilterModule;
