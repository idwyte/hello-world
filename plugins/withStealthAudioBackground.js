const { withInfoPlist, withAndroidManifest } = require('expo/config-plugins');

/**
 * Adds the iOS `UIBackgroundModes: ['audio']` entry and the Android
 * FOREGROUND_SERVICE permission so the decoy track / haptic engine keep
 * running with the screen locked during Stealth Mode sessions.
 *
 * Apply by adding `'./plugins/withStealthAudioBackground'` to the
 * `plugins` array in `app.config.ts`.
 */
const withStealthAudioBackground = (config) => {
  config = withInfoPlist(config, (c) => {
    const existing = c.modResults.UIBackgroundModes ?? [];
    if (!existing.includes('audio')) {
      existing.push('audio');
    }
    c.modResults.UIBackgroundModes = existing;
    return c;
  });

  config = withAndroidManifest(config, (c) => {
    const manifest = c.modResults;
    manifest['uses-permission'] = manifest['uses-permission'] ?? [];
    const perms = manifest['uses-permission'];
    const wanted = [
      'android.permission.FOREGROUND_SERVICE',
      'android.permission.FOREGROUND_SERVICE_MEDIA_PLAYBACK',
    ];
    for (const name of wanted) {
      if (!perms.some((p) => p.$['android:name'] === name)) {
        perms.push({ $: { 'android:name': name } });
      }
    }
    return c;
  });

  return config;
};

module.exports = withStealthAudioBackground;
