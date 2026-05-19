import { type ConfigPlugin, withInfoPlist } from 'expo/config-plugins';

/**
 * Wires the three Phase 2 native iOS modules into Info.plist:
 *
 *  - `focus-filter` — adds `NSFocusStatusUsageDescription` so the system
 *    knows why we read `INFocusStatusCenter.focusStatus`.
 *  - `calendar-gaps` — adds both `NSCalendarsUsageDescription` (iOS ≤16)
 *    and `NSCalendarsFullAccessUsageDescription` (iOS 17+) so EventKit
 *    can prompt for access on both eras.
 *
 * AppIntents themselves are auto-discovered from the binary by the system;
 * no plist entry is required (the `NSUserActivityTypes` key in earlier
 * iOS versions was for `NSUserActivity` / `CSSearchableItem`, not AppIntents).
 *
 * Apply by adding `'./plugins/withAppIntents'` to the `plugins` array in
 * `app.config.ts`.
 */
const withAppIntents: ConfigPlugin = (config) => {
  return withInfoPlist(config, (c) => {
    type Plist = Record<string, unknown>;
    const plist = c.modResults as Plist;

    // Focus status usage description (iOS 15+).
    if (typeof plist.NSFocusStatusUsageDescription !== 'string') {
      plist.NSFocusStatusUsageDescription =
        'Hone uses your Focus status to surface a discreet session when you’re heads-down.';
    }

    // EventKit usage descriptions. iOS 17 added the `FullAccess` key for the
    // new `requestFullAccessToEvents` API; the legacy key still applies to
    // older OSes and to `requestAccess(to: .event)`. Both are needed for a
    // build that supports iOS 15.1 through 17+.
    const calendarsCopy =
      'Hone looks for a quiet few minutes between your calendar events. It never reads event titles.';
    if (typeof plist.NSCalendarsUsageDescription !== 'string') {
      plist.NSCalendarsUsageDescription = calendarsCopy;
    }
    if (typeof plist.NSCalendarsFullAccessUsageDescription !== 'string') {
      plist.NSCalendarsFullAccessUsageDescription = calendarsCopy;
    }

    return c;
  });
};

export default withAppIntents;
