import type { ExpoConfig } from 'expo/config';

const config: ExpoConfig = {
  name: 'SQZ',
  slug: 'sqz-clone',
  version: '0.1.0',
  scheme: 'sqzclone',
  orientation: 'portrait',
  icon: './assets/icon.png',
  userInterfaceStyle: 'automatic',
  newArchEnabled: true,
  splash: {
    image: './assets/splash-icon.png',
    resizeMode: 'contain',
    backgroundColor: '#0B0B0F',
  },
  ios: {
    supportsTablet: false,
    bundleIdentifier: 'com.sqzclone.app',
    infoPlist: {
      ITSAppUsesNonExemptEncryption: false,
    },
  },
  android: {
    package: 'com.sqzclone.app',
    adaptiveIcon: {
      foregroundImage: './assets/adaptive-icon.png',
      backgroundColor: '#0B0B0F',
    },
    edgeToEdgeEnabled: true,
    predictiveBackGestureEnabled: false,
  },
  web: {
    favicon: './assets/favicon.png',
    bundler: 'metro',
  },
  plugins: [
    'expo-router',
    './plugins/withStealthAudioBackground',
    [
      'expo-notifications',
      {
        // Health-adjacent content: never sound the device speaker for cues.
        // The notification's `sound: false` is set per-message in
        // `lib/notifications.ts`.
        color: '#7C5CFF',
      },
    ],
  ],
  experiments: {
    typedRoutes: true,
  },
  extra: {
    supabaseUrl: process.env.EXPO_PUBLIC_SUPABASE_URL ?? '',
    supabaseAnonKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? '',
    revenuecatIosKey: process.env.EXPO_PUBLIC_RC_IOS_KEY ?? '',
    revenuecatAndroidKey: process.env.EXPO_PUBLIC_RC_ANDROID_KEY ?? '',
    googleWebClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID ?? '',
    googleIosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID ?? '',
  },
};

export default config;
