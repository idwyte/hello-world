// Obsidian Kinetic: 02 · Sign-in — Figma node 26:15.
// White Apple/Google buttons, OR divider, cyan-focus email Input, lime
// Send magic link, terms footer. Auth wiring unchanged (Supabase OAuth +
// magic link + anonymous guest path; dev-mode notice when unconfigured).
import * as AppleAuthentication from 'expo-apple-authentication';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Platform,
  Pressable,
  ScrollView,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button, Input, ScreenHeader } from '@/components/obsidian';
import {
  sendMagicLink,
  signInAnonymously,
  signInWithApple,
  signInWithGoogle,
} from '@/lib/auth';
import { hasGoogleConfig, hasSupabaseConfig } from '@/lib/env';
import { color, radius, spacing, type } from '@/lib/obsidian/tokens';

export default function SignIn() {
  const router = useRouter();
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
    <SafeAreaView style={{ flex: 1, backgroundColor: color.background }}>
      <ScreenHeader variant="back" onPress={() => router.back()} />
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          flexGrow: 1,
          paddingHorizontal: spacing.containerPadding,
          paddingTop: spacing.stackLg,
          paddingBottom: spacing.stackLg + spacing.stackMd,
          gap: spacing.stackLg,
        }}
        keyboardShouldPersistTaps="handled"
      >
        <View style={{ gap: spacing.stackSm }}>
          <Text style={{ ...type.headlineLg, color: color.onSurface }}>
            Sign in
          </Text>
          <Text style={{ ...type.bodyMd, color: color.onSurfaceVariant }}>
            Pick up where you left off.
          </Text>
        </View>

        {!configured && (
          <View
            style={{
              backgroundColor: color.surfaceContainerLow,
              borderColor: color.outlineVariant,
              borderWidth: 1,
              borderRadius: radius.xl,
              padding: spacing.stackMd,
            }}
          >
            <Text
              style={{
                ...type.bodyMd,
                fontSize: 14,
                lineHeight: 20,
                color: color.onSurfaceVariant,
              }}
            >
              Auth backend not configured yet. Set EXPO_PUBLIC_SUPABASE_URL
              and EXPO_PUBLIC_SUPABASE_ANON_KEY to enable sign-in.
            </Text>
          </View>
        )}

        {Platform.OS === 'ios' && configured ? (
          <AppleAuthentication.AppleAuthenticationButton
            buttonType={
              AppleAuthentication.AppleAuthenticationButtonType.SIGN_IN
            }
            buttonStyle={
              AppleAuthentication.AppleAuthenticationButtonStyle.WHITE
            }
            cornerRadius={radius.xl}
            style={{ height: 56 }}
            onPress={() => withBusy('apple', signInWithApple)}
          />
        ) : null}

        {hasGoogleConfig() && configured ? (
          <Pressable
            onPress={() => withBusy('google', signInWithGoogle)}
            disabled={busy !== null}
            accessibilityRole="button"
            accessibilityLabel="Continue with Google"
            style={({ pressed }) => ({
              height: 56,
              borderRadius: radius.xl,
              backgroundColor: '#ffffff',
              alignItems: 'center',
              justifyContent: 'center',
              opacity: pressed || busy ? 0.85 : 1,
            })}
          >
            <Text style={{ ...type.labelButton, color: '#0d0d0d' }}>
              {busy === 'google' ? '…' : 'Continue with Google'}
            </Text>
          </Pressable>
        ) : null}

        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: spacing.gutter,
          }}
        >
          <View
            style={{ flex: 1, height: 1, backgroundColor: color.outlineVariant }}
          />
          <Text style={{ ...type.labelCaps, color: color.onSurfaceVariant }}>
            OR
          </Text>
          <View
            style={{ flex: 1, height: 1, backgroundColor: color.outlineVariant }}
          />
        </View>

        <Input
          label="EMAIL"
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
          disabled={busy !== null || !configured || email.length === 0}
          onPress={() =>
            void withBusy('email', async () => {
              await sendMagicLink(email);
              setEmailSent(true);
              router.push({ pathname: '/check-email', params: { email } });
            })
          }
          style={{ width: '100%' }}
        />

        {configured ? (
          <Button
            label={busy === 'guest' ? '…' : 'Continue as guest'}
            variant="ghost"
            disabled={busy !== null}
            onPress={() => void withBusy('guest', signInAnonymously)}
            style={{ width: '100%' }}
          />
        ) : null}

        {busy ? (
          <ActivityIndicator color={color.primaryContainer} />
        ) : null}

        <View style={{ flex: 1 }} />
        <Text
          style={{
            ...type.bodyMd,
            color: color.onSurfaceVariant,
            textAlign: 'center',
          }}
        >
          By continuing, you agree to our Terms and Privacy Policy.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}
