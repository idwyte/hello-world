import 'react-native-url-polyfill/auto';

import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';

import { env, hasSupabaseConfig } from './env';

/**
 * Storage adapter for the Supabase auth session.
 *
 * AsyncStorage (not SecureStore) because Supabase session blobs — especially
 * with Apple/Google OAuth provider tokens — routinely exceed the iOS
 * SecureStore 2 KB per-value cap and would silently fail to persist. This is
 * also the pattern Supabase's RN docs recommend.
 *
 * `expo-secure-store` is still used for device-local sensitive prefs (haptic
 * intensity, stealth cue style, decoy cover) — see `stores/settings.ts`.
 */
const supabaseStorage = {
  getItem: (key: string) => AsyncStorage.getItem(key),
  setItem: (key: string, value: string) => AsyncStorage.setItem(key, value),
  removeItem: (key: string) => AsyncStorage.removeItem(key),
};

let client: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient {
  if (!hasSupabaseConfig()) {
    throw new Error(
      'Supabase is not configured. Set EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY.',
    );
  }
  if (!client) {
    client = createClient(env.supabaseUrl, env.supabaseAnonKey, {
      auth: {
        storage: supabaseStorage,
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
      },
    });
  }
  return client;
}

/**
 * Test-only: reset the cached client. Not exported from the module index.
 */
export function _resetSupabaseClientForTest() {
  client = null;
}
