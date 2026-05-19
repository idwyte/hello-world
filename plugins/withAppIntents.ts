import { type ConfigPlugin, withInfoPlist } from 'expo/config-plugins';

/**
 * Wires the three Phase 2 native iOS modules into Info.plist:
 *
 *  - `app-intents` — registers the four `AppIntent` class names under
 *    `NSUserActivityTypes` so Spotlight / Siri can route to them.
 *  - `focus-filter` — adds `NSFocusStatusUsageDescription` so the system
 *    knows why we read `INFocusStatusCenter.focusStatus`.
 *  - `calendar-gaps` — adds `NSCalendarsUsageDescription` so the EventKit
 *    free-time lookup can prompt for access.
 *
 * Apply by adding `'./plugins/withAppIntents'` to the `plugins` array in
 * `app.config.ts`.
 */
const APP_INTENT_USER_ACTIVITY_TYPES = [
  // Class names exposed by modules/app-intents/ios/HoneAppIntents.swift.
  // System uses these to wake the app for an intent invocation.
  'StartSessionIntent',
  'Start3MinDiscreetIntent',
  'MarkTodayCompleteIntent',
  'ShowStreakIntent',
];

const withAppIntents: ConfigPlugin = (config) => {
  config = withInfoPlist(config, (c) => {
    type Plist = Record<string, unknown>;
    const plist = c.modResults as Plist;

    // NSUserActivityTypes — additive merge so we don't trample anything an
    // earlier plugin added.
    const existing: string[] = Array.isArray(plist.NSUserActivityTypes)
      ? (plist.NSUserActivityTypes as string[])
      : [];
    for (const type of APP_INTENT_USER_ACTIVITY_TYPES) {
      if (!existing.includes(type)) existing.push(type);
    }
    plist.NSUserActivityTypes = existing;

    // Focus status usage description (iOS 15+).
    if (typeof plist.NSFocusStatusUsageDescription !== 'string') {
      plist.NSFocusStatusUsageDescription =
        'Hone uses your Focus status to surface a discreet session when you’re heads-down.';
    }

    // EventKit usage description — read-only access to find a free 3 min.
    if (typeof plist.NSCalendarsUsageDescription !== 'string') {
      plist.NSCalendarsUsageDescription =
        'Hone looks for a quiet few minutes between your calendar events. It never reads event titles.';
    }

    return c;
  });

  return config;
};

export default withAppIntents;
