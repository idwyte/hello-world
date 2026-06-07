// Figma: 28 · check email — node 112:318
//
// Shown after Send magic link on sign-in (02) or sign-up (16). Real
// wiring:
//   - "Open Mail" launches the device's default mail handler via
//     Linking.openURL('mailto:'). Cross-platform: on Android opens the
//     installed mail client picker; on iOS opens Mail.
//   - "Resend" is gated by a 30-second countdown; tapping it re-sends
//     the magic link via sendMagicLink() and restarts the timer.
//   - "Use a different email" returns to /sign-in.
//
// FIGMA-DIFF (remaining):
//   - 96×96 envelope tile + 14×14 accent ping rendered as a lucide Mail
//     in an accent-soft disc. Promote to dedicated SVG in full build.
import { useEffect, useRef, useState } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Mail } from 'lucide-react-native';
import { Alert, Linking, Pressable, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Body, Button, ScreenHeader } from '@/components/ui';
import { sendMagicLink } from '@/lib/auth';
import { semantic } from '@/lib/theme';

const RESEND_INTERVAL_S = 30;

export default function CheckEmail() {
  const router = useRouter();
  const { email } = useLocalSearchParams<{ email?: string }>();
  const displayEmail = email || 'your email';
  const [remaining, setRemaining] = useState(RESEND_INTERVAL_S);
  const [resending, setResending] = useState(false);
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    tickRef.current = setInterval(() => {
      setRemaining((r) => (r > 0 ? r - 1 : 0));
    }, 1000);
    return () => {
      if (tickRef.current) clearInterval(tickRef.current);
    };
  }, []);

  async function handleResend() {
    if (remaining > 0 || resending || !email) return;
    setResending(true);
    try {
      await sendMagicLink(email);
      setRemaining(RESEND_INTERVAL_S);
    } catch (e) {
      Alert.alert(
        'Could not resend',
        e instanceof Error ? e.message : 'Please try again in a moment.',
      );
    } finally {
      setResending(false);
    }
  }

  async function handleOpenMail() {
    try {
      await Linking.openURL('mailto:');
    } catch {
      // No handler installed — fall back to the home redirect (magic-link
      // deeplink will still finish the auth when the user reads the
      // email).
      router.replace('/home');
    }
  }

  return (
    <SafeAreaView className="flex-1 bg-surface-canvas">
      <ScreenHeader
        kind="detail"
        title="Check your email"
        onBack={() => router.back()}
      />

      <ScrollView className="flex-1" contentContainerClassName="px-6 pb-12">
        {/* Hero envelope — Figma `112:304` (96×96 accent-soft) */}
        <View className="items-center mt-10">
          <View
            className="w-24 h-24 rounded-[20px] items-center justify-center"
            style={{ backgroundColor: semantic.interactivePrimaryPressed }}
          >
            <Mail size={44} color={semantic.textPrimary} strokeWidth={1.5} />
          </View>
        </View>

        <View className="items-center mt-7">
          <Body
            weight="semibold"
            color="primary"
            style={{ fontSize: 26, lineHeight: 32 }}
          >
            Check your email
          </Body>
          <View className="mt-2.5 px-4 items-center">
            <Body
              color="muted"
              style={{ fontSize: 15, lineHeight: 22 }}
              className="text-center"
            >
              We sent a link to{' '}
              <Body
                weight="semibold"
                color="primary"
                style={{ fontSize: 15, lineHeight: 22 }}
              >
                {displayEmail}
              </Body>
              . Tap it to sign in.
            </Body>
          </View>
        </View>

        <Button
          label="Open Mail"
          variant="primary"
          size="lg"
          radius="cta"
          className="mt-8"
          onPress={handleOpenMail}
        />

        <View className="items-center mt-6 gap-3">
          {remaining > 0 ? (
            <Body size="sm" color="muted">
              Didn&rsquo;t get it? Resend in 0:{String(remaining).padStart(2, '0')}
            </Body>
          ) : (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Resend magic link"
              disabled={resending || !email}
              onPress={handleResend}
            >
              <Body
                size="sm"
                weight="medium"
                color={email ? 'accent' : 'muted'}
              >
                {resending ? 'Sending…' : 'Resend magic link'}
              </Body>
            </Pressable>
          )}
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Use a different email"
            onPress={() => router.replace('/sign-in')}
          >
            <Body size="sm" weight="medium" color="accent">
              Use a different email
            </Body>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
