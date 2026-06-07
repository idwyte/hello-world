import type { ExpoConfig } from 'expo/config';

const config: ExpoConfig = {
  name: 'Hone',
  slug: 'hone',
  version: '0.1.0',
  scheme: 'hone',
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
    bundleIdentifier: 'com.honeapp.mobile',
    usesAppleSignIn: true,
    infoPlist: {
      ITSAppUsesNonExemptEncryption: false,
    },
  },
  android: {
    package: 'com.honeapp.mobile',
    adaptiveIcon: {
      foregroundImage: './assets/adaptive-icon.png',
      backgroundColor: '#0B0B0F',
    },
    edgeToEdgeEnabled: true,
    predictiveBackGestureEnabled: false,
    permissions: [
      'android.permission.POST_NOTIFICATIONS',
      'android.permission.USE_BIOMETRIC',
      'android.permission.USE_FINGERPRINT',
    ],
    // FCM credentials drop in at build time. Set GOOGLE_SERVICES_JSON_PATH
    // (relative to repo root) before `eas build` once the Firebase project
    // exists — see docs/SHIP-CHECKLIST.md.
    ...(process.env.GOOGLE_SERVICES_JSON_PATH
      ? { googleServicesFile: process.env.GOOGLE_SERVICES_JSON_PATH }
      : {}),
  },
  web: {
    favicon: './assets/favicon.png',
    bundler: 'metro',
  },
  plugins: [
    'expo-router',
    './plugins/withStealthAudioBackground',
    './plugins/withAppIntents',
    './plugins/withLiveActivity',
    './plugins/withAlternateIcons',
    [
      'expo-notifications',
      {
        // Health-adjacent content: never sound the device speaker for cues.
        // The notification's `sound: false` is set per-message in
        // `lib/notifications.ts`.
        color: '#7C5CFF',
      },
    ],
    [
      'expo-local-authentication',
      {
        faceIDPermission:
          'Allow Hone to use Face ID so you can quickly unlock your training data.',
      },
    ],
  ],
  experiments: {
    typedRoutes: true,
  },
  updates: {
    url: 'https://u.expo.dev/002c8bd4-ddd2-4e48-8b3a-14fde3ca41d2',
  },
  runtimeVersion: {
    policy: 'appVersion',
  },
  extra: {
    supabaseUrl: process.env.EXPO_PUBLIC_SUPABASE_URL ?? '',
    supabaseAnonKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? '',
    revenuecatIosKey: process.env.EXPO_PUBLIC_RC_IOS_KEY ?? '',
    revenuecatAndroidKey: process.env.EXPO_PUBLIC_RC_ANDROID_KEY ?? '',
    googleWebClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID ?? '',
    googleIosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID ?? '',
    eas: {
      projectId: '002c8bd4-ddd2-4e48-8b3a-14fde3ca41d2',
    },
  },
  owner: 'dwytejs',
};

export default config;
