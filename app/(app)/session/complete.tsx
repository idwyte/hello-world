// Figma: 14 · session/complete — node 100:273
// https://www.figma.com/design/qgY3Qcf7gP7w5V5A6uQTL4/?node-id=100-273
//
// Post-session celebration: success badge + name greeting + 3-up stats
// (DURATION / REPS / STREAK) + RatingPrompt + Done CTA.
//
// FIGMA-DIFF (stub):
//   - Hero check badge (96 px success-green + 120 px halo) rendered as a
//     simple emoji placeholder; promote to SVG check + halo in full build.
//   - RatingPrompt: full Figma component renders 5 stars + state machine
//     for 1-3/4-5-star branches. Stub renders the headline only.
//   - Name is hardcoded "friend"; promote with auth profile name.
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Body, Button, Card, SectionLabel } from '@/components/ui';

export default function SessionComplete() {
  const router = useRouter();
  const params = useLocalSearchParams<{ duration?: string; reps?: string }>();
  const duration = params.duration ?? '—';
  const reps = params.reps ?? '—';

  return (
    <SafeAreaView className="flex-1 bg-surface-canvas">
      <ScrollView
        className="flex-1"
        contentContainerClassName="px-4 pb-12"
      >
        {/* Hero — Figma `100:243`. Stub uses centered text; full build needs SVG check + halo. */}
        <View className="items-center mt-12">
          <View className="w-24 h-24 rounded-full bg-feedback-success items-center justify-center">
            <Body
              weight="semibold"
              color="primary"
              style={{ fontSize: 42, lineHeight: 48 }}
            >
              ✓
            </Body>
          </View>
          <Body
            weight="semibold"
            color="primary"
            className="mt-5"
            style={{ fontSize: 26, lineHeight: 32 }}
          >
            Nice work, friend
          </Body>
          <Body
            color="muted"
            className="mt-2"
            style={{ fontSize: 15, lineHeight: 22 }}
          >
            Session complete.
          </Body>
        </View>

        {/* 3-up stats — Figma `100:250` (p-14, rounded-14, kicker tight-1.2) */}
        <View className="flex-row gap-2.5 mt-8">
          <Card padding="sm" radius="card-tight" className="flex-1 items-center">
            <SectionLabel tracking="tight">DURATION</SectionLabel>
            <Body
              weight="semibold"
              color="primary"
              className="mt-1"
              style={{ fontSize: 22, lineHeight: 28 }}
            >
              {duration}
            </Body>
          </Card>
          <Card padding="sm" radius="card-tight" className="flex-1 items-center">
            <SectionLabel tracking="tight">REPS</SectionLabel>
            <Body
              weight="semibold"
              color="primary"
              className="mt-1"
              style={{ fontSize: 22, lineHeight: 28 }}
            >
              {reps}
            </Body>
          </Card>
          <Card padding="sm" radius="card-tight" className="flex-1 items-center">
            <SectionLabel tracking="tight">STREAK</SectionLabel>
            <Body
              weight="semibold"
              color="success"
              className="mt-1"
              style={{ fontSize: 22, lineHeight: 28 }}
            >
              +1
            </Body>
          </Card>
        </View>

        {/* RatingPrompt — Figma `55:765`. Stub renders headline only. */}
        <Card padding="lg" radius="card-hero" bordered className="mt-8 items-center">
          <Body
            weight="semibold"
            color="primary"
            style={{ fontSize: 18, lineHeight: 26 }}
            className="text-center"
          >
            How was your session?
          </Body>
          <Body size="sm" color="muted" className="text-center mt-2">
            Tap a star to rate. It helps us tune the program.
          </Body>
          {/* TODO: 5-star tappable row + 4-5 → App Store CTA / 1-3 → thanks branch */}
        </Card>

        {/* Done — Figma `100:270` (accent, h-56, rounded-14) */}
        <Button
          label="Done"
          variant="primary"
          size="lg"
          radius="cta"
          className="mt-8"
          onPress={() => router.replace('/home')}
        />
      </ScrollView>
    </SafeAreaView>
  );
}
