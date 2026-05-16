import type { Session, User } from '@supabase/supabase-js';
import * as AppleAuthentication from 'expo-apple-authentication';
import { useEffect, useState } from 'react';
import { Platform } from 'react-native';

import { env, hasGoogleConfig, hasSupabaseConfig } from './env';
import { getSupabase } from './supabase';

export type AuthState = {
  loading: boolean;
  session: Session | null;
  user: User | null;
};

/**
 * Subscribe to Supabase auth state. Returns `{ loading, session, user }`.
 */
export function useAuth(): AuthState {
  const [state, setState] = useState<AuthState>({
    loading: true,
    session: null,
    user: null,
  });

  useEffect(() => {
    if (!hasSupabaseConfig()) {
      setState({ loading: false, session: null, user: null });
      return;
    }
    const supabase = getSupabase();
    let mounted = true;

    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return;
      setState({
        loading: false,
        session: data.session ?? null,
        user: data.session?.user ?? null,
      });
    });

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!mounted) return;
      setState({
        loading: false,
        session: session ?? null,
        user: session?.user ?? null,
      });
    });

    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  return state;
}

/**
 * Sign in with Apple (iOS only). Exchanges the native Apple ID token with
 * Supabase via `signInWithIdToken({ provider: 'apple' })`.
 */
export async function signInWithApple(): Promise<void> {
  if (Platform.OS !== 'ios') {
    throw new Error('Sign in with Apple is only available on iOS.');
  }
  const credential = await AppleAuthentication.signInAsync({
    requestedScopes: [
      AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
      AppleAuthentication.AppleAuthenticationScope.EMAIL,
    ],
  });
  if (!credential.identityToken) {
    throw new Error('Apple sign-in returned no identity token.');
  }
  const supabase = getSupabase();
  const { error } = await supabase.auth.signInWithIdToken({
    provider: 'apple',
    token: credential.identityToken,
  });
  if (error) throw error;
}

/**
 * Sign in with Google.
 *
 * We dynamic-import `@react-native-google-signin/google-signin` because it
 * pulls in native modules that aren't available in Jest/Node environments
 * (the unit-test runner will then never load this code path).
 */
export async function signInWithGoogle(): Promise<void> {
  if (!hasGoogleConfig()) {
    throw new Error(
      'Google sign-in is not configured. Set EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID.',
    );
  }
  const { GoogleSignin } = await import(
    '@react-native-google-signin/google-signin'
  );
  GoogleSignin.configure({
    webClientId: env.googleWebClientId,
    iosClientId: env.googleIosClientId || undefined,
  });
  await GoogleSignin.hasPlayServices();
  const result = await GoogleSignin.signIn();
  // v15 returns { type: 'cancelled', data: null } if the user dismisses the
  // sheet; treat as a no-op rather than crashing.
  if (!result?.data) return;
  const idToken =
    (result.data as { idToken?: string | null }).idToken ?? null;
  if (!idToken) throw new Error('Google sign-in returned no idToken.');
  const supabase = getSupabase();
  const { error } = await supabase.auth.signInWithIdToken({
    provider: 'google',
    token: idToken,
  });
  if (error) throw error;
}

/**
 * Send a magic-link email. Supabase emails a deeplink that opens the app
 * back into the (auth) group; the deep link finalizes the session.
 */
export async function sendMagicLink(email: string): Promise<void> {
  const trimmed = email.trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
    throw new Error('Please enter a valid email address.');
  }
  const supabase = getSupabase();
  const { error } = await supabase.auth.signInWithOtp({
    email: trimmed,
    options: {
      shouldCreateUser: true,
      emailRedirectTo: 'hone://auth/callback',
    },
  });
  if (error) throw error;
}

export async function signOut(): Promise<void> {
  if (!hasSupabaseConfig()) return;
  const supabase = getSupabase();
  await supabase.auth.signOut();
}

/**
 * Delete the user's account. Calls the `delete-account` Edge Function which
 * uses the service role to call `auth.admin.deleteUser`. Data in owner-scoped
 * tables cascades off auth.users on delete (see 0001_init.sql).
 * Required by App Store guideline 5.1.1(v).
 *
 * The function source lives at `supabase/functions/delete-account/index.ts`
 * and is deployed via `supabase functions deploy delete-account`.
 */
export async function deleteAccount(): Promise<void> {
  const supabase = getSupabase();
  const { data, error } = await supabase.functions.invoke('delete-account', {});
  if (error) throw error;
  if ((data as { ok?: boolean } | null)?.ok !== true) {
    throw new Error('Account deletion failed.');
  }
  await supabase.auth.signOut();
}
