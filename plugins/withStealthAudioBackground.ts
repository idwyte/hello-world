import {
  type ConfigPlugin,
  withInfoPlist,
  withAndroidManifest,
} from 'expo/config-plugins';

/**
 * Adds the iOS `UIBackgroundModes: ['audio']` entry and the Android
 * FOREGROUND_SERVICE permission so the decoy track / haptic engine keep
 * running with the screen locked during Stealth Mode sessions.
 *
 * Apply by adding `'./plugins/withStealthAudioBackground'` to the
 * `plugins` array in `app.config.ts`.
 */
const withStealthAudioBackground: ConfigPlugin = (config) => {
  config = withInfoPlist(config, (c) => {
    const existing: string[] = (c.modResults.UIBackgroundModes as string[]) ?? [];
    if (!existing.includes('audio')) {
      existing.push('audio');
    }
    c.modResults.UIBackgroundModes = existing;
    return c;
  });

  config = withAndroidManifest(config, (c) => {
    type PermEntry = { $: { 'android:name': string } };
    const manifest = c.modResults as unknown as {
      'uses-permission'?: PermEntry[];
    };
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

export default withStealthAudioBackground;
