// Figma: 32 · reverse-Kegel intro — node 126:363
// https://www.figma.com/design/qgY3Qcf7gP7w5V5A6uQTL4/?node-id=126-363
// Spec: docs/hone-roadmap-state.md line 103 (Figma-derived).
//
// Generic exercise-intro shell ("New in your program"). Parameterised by
// slug so future intros reuse this surface. Hero card with NEW IN YOUR
// PROGRAM accent kicker + title + inverse 7-dot tempo + RELEASE · EXPAND
// label · WHY IT MATTERS body · HOW TO DO IT 3 steps (warning folded into
// step 3) · "I get it · let's try" CTA.
//
// FIGMA-DIFF (stub):
//   - Inverse 7-dot tempo (RELEASE · EXPAND) rendered as text dots.
//   - Step warning callout merged into plain step text; promote to
//     accent-soft callout in full build.
//   - Slug doesn't yet drive content lookup — stub uses reverse-Kegel
//     copy regardless.
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Body, Button, Card, SectionLabel } from '@/components/ui';

export default function ExerciseIntro() {
  const router = useRouter();
  const { slug } = useLocalSearchParams<{ slug: string }>();

  return (
    <SafeAreaView className="flex-1 bg-surface-canvas">
      <View className="h-14 flex-row items-center px-4">
        <Body color="primary" style={{ fontSize: 20 }} onPress={() => router.back()}>
          ←
        </Body>
        <View className="flex-1 items-center -ml-5">
          <Body weight="semibold" color="primary" style={{ fontSize: 17, lineHeight: 24 }}>
            New exercise
          </Body>
        </View>
      </View>

      <ScrollView className="flex-1" contentContainerClassName="px-4 pb-32">
        <Card padding="lg" radius="card" className="mt-2">
          <SectionLabel tracking="wide" className="text-interactive-primary">
            NEW IN YOUR PROGRAM
          </SectionLabel>
          <Body
            weight="semibold"
            color="primary"
            className="mt-2"
            style={{ fontSize: 28, lineHeight: 36 }}
          >
            Reverse Kegels
          </Body>
          <View className="flex-row items-center justify-between mt-4">
            <Body color="muted" style={{ fontSize: 28, letterSpacing: 4 }}>
              ○ ○ ○ ○ ○ ○ ○
            </Body>
          </View>
          <View className="flex-row items-center mt-2 gap-3">
            <Body size="xs" weight="medium" color="muted">
              RELEASE
            </Body>
            <Body size="xs" weight="medium" color="muted">
              ·
            </Body>
            <Body size="xs" weight="medium" color="muted">
              EXPAND
            </Body>
          </View>
        </Card>

        <SectionLabel tracking="wide" className="mt-6">
          WHY IT MATTERS
        </SectionLabel>
        <Body color="primary" className="mt-3">
          Most pelvic-floor training focuses on contracting. Reverse Kegels
          train the opposite — full relaxation and downward expansion. Builds
          control in both directions.
        </Body>

        <SectionLabel tracking="wide" className="mt-6">
          HOW TO DO IT
        </SectionLabel>
        <View className="gap-3 mt-3">
          {[
            'Lie on your back with knees bent.',
            'Inhale and gently bear down — like the start of a bowel movement.',
            'Stop if you feel pressure or strain. Less is more here.',
          ].map((step, i) => (
            <View key={i} className="flex-row gap-3">
              <Body weight="semibold" color="accent">
                {i + 1}.
              </Body>
              <Body color="primary" className="flex-1">
                {step}
              </Body>
            </View>
          ))}
        </View>
      </ScrollView>

      <View className="absolute bottom-0 left-0 right-0 px-4 pb-8">
        <Button
          label="I get it · let's try"
          variant="primary"
          size="lg"
          radius="cta"
          onPress={() => router.replace(`/program/exercise/${slug ?? 'reverse_kegels'}`)}
        />
      </View>
    </SafeAreaView>
  );
}
