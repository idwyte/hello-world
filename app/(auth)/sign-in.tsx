import * as AppleAuthentication from 'expo-apple-authentication';
import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Platform,
  Pressable,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import {
  sendMagicLink,
  signInAnonymously,
  signInWithApple,
  signInWithGoogle,
} from '@/lib/auth';
import { hasGoogleConfig, hasSupabaseConfig } from '@/lib/env';

export default function SignIn() {
  const [email, setEmail] = useState('');
  const [busy, setBusy] = useState<
    null | 'apple' | 'google' | 'email' | 'guest'
  >(null);
  const [emailSent, setEmailSent] = useState(false);

  const configured = hasSupabaseConfig();

  async function withBusy(
    key: 'apple' | 'google' | 'email' | 'guest',
    fn: () => Promise<void>,
  ) {
    if (busy) return;
    setBusy(key);
    try {
      await fn();
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Something went wrong. Try again.';
      Alert.alert('Sign in failed', message);
    } finally {
      setBusy(null);
    }
  }

  return (
    <SafeAreaView className="flex-1 bg-bg">
      <View className="flex-1 px-6 pt-10 pb-8">
        <View className="flex-1 justify-center">
          <Text className="text-ink text-4xl font-semibold">Hone</Text>
          <Text className="text-muted mt-2">
            Train pelvic floor strength in a few minutes a day.
          </Text>
        </View>

        <View className="gap-3">
          {!configured ? (
            <View className="bg-surface2 rounded-xl p-3 border border-border">
              <Text className="text-muted text-xs">
                Auth backend not configured yet. Set EXPO_PUBLIC_SUPABASE_URL
                and EXPO_PUBLIC_SUPABASE_ANON_KEY to enable sign-in.
              </Text>
            </View>
          ) : null}

          {configured ? (
            <Pressable
              disabled={busy !== null}
              onPress={() => withBusy('guest', signInAnonymously)}
              accessibilityRole="button"
              accessibilityLabel="Continue without signing in. Your data stays private to this device until you choose to sync."
              className="bg-accent rounded-xl py-4 items-center active:opacity-80"
            >
              {busy === 'guest' ? (
                <ActivityIndicator color="#F5F5F7" />
              ) : (
                <Text className="text-ink font-semibold">
                  Skip sign-in — start training
                </Text>
              )}
            </Pressable>
          ) : null}

          <Text className="text-muted text-xs text-center mt-1 mb-1">
            Sync across devices (optional)
          </Text>

          {Platform.OS === 'ios' && configured ? (
            <AppleAuthentication.AppleAuthenticationButton
              buttonType={
                AppleAuthentication.AppleAuthenticationButtonType.SIGN_IN
              }
              buttonStyle={
                AppleAuthentication.AppleAuthenticationButtonStyle.WHITE
              }
              cornerRadius={12}
              style={{ height: 48 }}
              onPress={() => withBusy('apple', signInWithApple)}
            />
          ) : null}

          {hasGoogleConfig() ? (
            <Pressable
              disabled={busy !== null || !configured}
              onPress={() => withBusy('google', signInWithGoogle)}
              accessibilityRole="button"
              accessibilityLabel="Sign in with Google"
              className="bg-ink rounded-xl py-3 items-center active:opacity-80"
            >
              {busy === 'google' ? (
                <ActivityIndicator color="#0B0B0F" />
              ) : (
                <Text className="text-bg font-semibold">
                  Continue with Google
                </Text>
              )}
            </Pressable>
          ) : null}

          <View className="flex-row items-center my-2">
            <View className="flex-1 h-px bg-border" />
            <Text className="text-muted text-xs mx-3">or</Text>
            <View className="flex-1 h-px bg-border" />
          </View>

          <TextInput
            placeholder="you@example.com"
            placeholderTextColor="#8A8A95"
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            autoComplete="email"
            value={email}
            editable={!busy && configured}
            onChangeText={setEmail}
            accessibilityLabel="Email address"
            className="bg-surface text-ink rounded-xl px-4 py-3 border border-border"
          />

          <Pressable
            disabled={busy !== null || !configured || email.length === 0}
            onPress={() =>
              withBusy('email', async () => {
                await sendMagicLink(email);
                setEmailSent(true);
              })
            }
            accessibilityRole="button"
            accessibilityLabel="Send magic link to email"
            className={`rounded-xl py-3 items-center active:opacity-80 ${
              busy || !configured || email.length === 0
                ? 'bg-surface2'
                : 'bg-accent'
            }`}
          >
            {busy === 'email' ? (
              <ActivityIndicator color="#F5F5F7" />
            ) : (
              <Text className="text-ink font-semibold">
                {emailSent ? 'Check your inbox' : 'Send magic link'}
              </Text>
            )}
          </Pressable>

          <Text className="text-muted text-xs text-center mt-4 px-2">
            By continuing you agree that pelvic floor training is general
            wellness, not medical advice. Consult a clinician for any
            pelvic-floor condition.
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}
