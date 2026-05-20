// Figma: 28 · check email — node 112:318
// https://www.figma.com/design/qgY3Qcf7gP7w5V5A6uQTL4/?node-id=112-318
//
// Shown after Send magic link on sign-in (02) or sign-up (16). Holds
// until user taps the link in their inbox; deep-link returns them home.
//
// FIGMA-DIFF (stub):
//   - 96×96 envelope tile (accent-soft fill, stroked envelope outline,
//     14×14 accent notification ping) rendered as a lucide Mail icon.
//     Promote to dedicated SVG in full build.
//   - Resend cooldown countdown (30 s timer "Resend in 0:23" → tappable
//     "Resend" at 0) not implemented; stub shows static "Resend".
//   - Open Mail does NOT actually launch Mail app; stub no-ops to home.
//   - "Use a different email" returns to /sign-in but doesn't pre-fill
//     the email field — promote with a query param or store-backed value.
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Mail } from 'lucide-react-native';
import { Pressable, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Body, Button } from '@/components/ui';
import { semantic } from '@/lib/theme';

export default function CheckEmail() {
  const router = useRouter();
  const { email } = useLocalSearchParams<{ email?: string }>();
  const displayEmail = email ?? 'your email';

  return (
    <SafeAreaView className="flex-1 bg-surface-canvas">
      <ScrollView className="flex-1" contentContainerClassName="px-6 pb-12">
        {/* Back chev — Figma `112:302` (at 12,56). */}
        <Pressable
          onPress={() => router.back()}
          hitSlop={12}
          accessibilityLabel="Back"
          className="w-11 h-11 items-center justify-center"
        >
          <Body color="primary" style={{ fontSize: 20 }}>
            ←
          </Body>
        </Pressable>

        {/* Hero envelope — Figma `112:304` (96×96 accent-soft) */}
        <View className="items-center mt-10">
          <View
            className="w-24 h-24 rounded-[20px] items-center justify-center"
            style={{ backgroundColor: semantic.interactivePrimaryPressed }}
          >
            <Mail size={44} color={semantic.textPrimary} strokeWidth={1.5} />
          </View>
        </View>

        {/* Headline + body — Figma `112:308` */}
        <View className="items-center mt-7">
          <Body
            weight="semibold"
            color="primary"
            style={{ fontSize: 26, lineHeight: 32 }}
          >
            Check your email
          </Body>
          <View className="flex-row mt-2.5 px-6">
            <Body color="muted" style={{ fontSize: 15, lineHeight: 22 }}>
              We sent a link to{' '}
            </Body>
            <Body
              weight="semibold"
              color="primary"
              style={{ fontSize: 15, lineHeight: 22 }}
            >
              {displayEmail}
            </Body>
          </View>
          <Body color="muted" style={{ fontSize: 15, lineHeight: 22 }} className="mt-1">
            Tap it to sign in.
          </Body>
        </View>

        <Button
          label="Open Mail"
          variant="primary"
          size="lg"
          radius="cta"
          className="mt-8"
          onPress={() => router.replace('/home')}
        />

        <View className="items-center mt-6 gap-3">
          <Body size="sm" color="muted">
            Didn&rsquo;t get it? Resend
          </Body>
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
