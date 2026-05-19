const { withInfoPlist } = require('expo/config-plugins');

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
const withLiveActivity = (config) => {
  return withInfoPlist(config, (c) => {
    const plist = c.modResults;
    if (plist.NSSupportsLiveActivities !== true) {
      plist.NSSupportsLiveActivities = true;
    }
    if (typeof plist.NSSupportsLiveActivitiesFrequentUpdates !== 'boolean') {
      plist.NSSupportsLiveActivitiesFrequentUpdates = false;
    }
    return c;
  });
};

module.exports = withLiveActivity;
