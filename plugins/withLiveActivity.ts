import { type ConfigPlugin, withInfoPlist } from 'expo/config-plugins';

/**
 * Enables Live Activities in the host app's Info.plist.
 *
 * **Widget extension target is a manual step.** Auto-generating a
 * PBXNativeTarget through Expo's `withXcodeProject` modifier is fragile and
 * breaks on Xcode major versions. We document the one-time setup at the top
 * of `modules/live-activity/ios/widget/HoneLiveActivityWidget.swift` instead.
 *
 * Apply by adding `'./plugins/withLiveActivity'` to the `plugins` array in
 * `app.config.ts`.
 */
const withLiveActivity: ConfigPlugin = (config) => {
  return withInfoPlist(config, (c) => {
    type Plist = Record<string, unknown>;
    const plist = c.modResults as Plist;
    if (plist.NSSupportsLiveActivities !== true) {
      plist.NSSupportsLiveActivities = true;
    }
    // Frequent updates can drain battery; opting out keeps Hone within the
    // standard ActivityKit budgets (sufficient for our second-tick UI).
    if (typeof plist.NSSupportsLiveActivitiesFrequentUpdates !== 'boolean') {
      plist.NSSupportsLiveActivitiesFrequentUpdates = false;
    }
    return c;
  });
};

export default withLiveActivity;
