import * as AppleAuthentication from 'expo-apple-authentication';
import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Platform,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import {
  Body,
  Button,
  Card,
  Heading,
  TextField,
} from '@/components/ui';
import {
  sendMagicLink,
  signInAnonymously,
  signInWithApple,
  signInWithGoogle,
} from '@/lib/auth';
import { hasGoogleConfig, hasSupabaseConfig } from '@/lib/env';
import { semantic } from '@/lib/theme';

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
    <SafeAreaView className="flex-1 bg-surface-canvas">
      <View className="flex-1 px-6 pt-10 pb-8">
        <View className="flex-1 justify-center">
          <Heading level="display-lg">Hone</Heading>
          <Body size="lg" color="muted" className="mt-3">
            Train pelvic floor strength in a few minutes a day.
          </Body>
        </View>

        <View className="gap-3">
          {!configured ? (
            <Card padding="sm" bordered surface="sunken">
              <Body size="xs" color="muted">
                Auth backend not configured yet. Set EXPO_PUBLIC_SUPABASE_URL
                and EXPO_PUBLIC_SUPABASE_ANON_KEY to enable sign-in.
              </Body>
            </Card>
          ) : null}

          {configured ? (
            <Button
              label={busy === 'guest' ? '…' : 'Skip sign-in — start training'}
              variant="primary"
              size="lg"
              disabled={busy !== null}
              onPress={() => withBusy('guest', signInAnonymously)}
              accessibilityLabel="Continue without signing in"
            />
          ) : null}

          <Body size="xs" color="muted" className="text-center my-1">
            Sync across devices (optional)
          </Body>

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
            <Button
              label={busy === 'google' ? '…' : 'Continue with Google'}
              variant="secondary"
              size="lg"
              disabled={busy !== null || !configured}
              onPress={() => withBusy('google', signInWithGoogle)}
            />
          ) : null}

          <View className="flex-row items-center my-2 gap-3">
            <View className="flex-1 h-px bg-border-default" />
            <Body size="xs" color="muted">
              or
            </Body>
            <View className="flex-1 h-px bg-border-default" />
          </View>

          <TextField
            placeholder="you@example.com"
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            autoComplete="email"
            value={email}
            editable={!busy && configured}
            onChangeText={setEmail}
            accessibilityLabel="Email address"
          />

          <Button
            label={
              busy === 'email'
                ? '…'
                : emailSent
                  ? 'Check your inbox'
                  : 'Send magic link'
            }
            variant={
              busy || !configured || email.length === 0 ? 'secondary' : 'primary'
            }
            size="lg"
            disabled={busy !== null || !configured || email.length === 0}
            onPress={() =>
              withBusy('email', async () => {
                await sendMagicLink(email);
                setEmailSent(true);
              })
            }
          />

          {busy ? (
            <View className="items-center mt-2">
              <ActivityIndicator color={semantic.interactivePrimary} />
            </View>
          ) : null}

          <Body size="xs" color="muted" className="text-center mt-4 px-2">
            By continuing you agree that pelvic floor training is general
            wellness, not medical advice. Consult a clinician for any
            pelvic-floor condition.
          </Body>
        </View>
      </View>
    </SafeAreaView>
  );
}
