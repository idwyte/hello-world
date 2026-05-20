// Figma: 25 · exercise detail — node 110:348
// https://www.figma.com/design/qgY3Qcf7gP7w5V5A6uQTL4/?node-id=110-348
// Spec: docs/hone-roadmap-state.md line 109 (Figma-derived).
//
// Detail header "Quick flicks" · 7-dot tempo visualisation card + "1s ON ·
// 1s OFF" label + description · HOW IT WORKS 3 numbered steps · TIPS 3
// bullets · "Practice solo · 1 min" CTA (launches a single-exercise mini
// session).
//
// FIGMA-DIFF (stub):
//   - 7-dot tempo visualisation rendered as text "● ● ● ● ● ● ●".
//   - Exercise data hardcoded; promote to look up EXERCISES[exerciseId].
//   - Practice solo CTA navigates to /session/today (no solo-mode flow yet).
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Pressable, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Body, Button, Card, SectionLabel } from '@/components/ui';

import { EXERCISES } from '@/lib/exercises';

export default function ExerciseDetail() {
  const router = useRouter();
  const { exerciseId } = useLocalSearchParams<{ exerciseId: string }>();
  const ex = EXERCISES[exerciseId] ?? null;

  return (
    <SafeAreaView className="flex-1 bg-surface-canvas">
      <View className="h-14 flex-row items-center px-4">
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
        <View className="flex-1 items-center -ml-11">
          <Body weight="semibold" color="primary" style={{ fontSize: 17, lineHeight: 24 }}>
            {ex?.name ?? 'Exercise'}
          </Body>
        </View>
      </View>

      <ScrollView className="flex-1" contentContainerClassName="px-6 pb-32">
        {/* Tempo visualisation card */}
        <Card padding="lg" radius="card" className="mt-2 items-center">
          <Body color="primary" style={{ fontSize: 28, letterSpacing: 4 }}>
            ● ● ● ● ● ● ●
          </Body>
          <Body size="sm" color="muted" className="mt-2">
            1s ON · 1s OFF
          </Body>
          <Body size="sm" color="muted" className="mt-3 text-center">
            {ex?.description ?? 'A short, fast contraction.'}
          </Body>
        </Card>

        <SectionLabel tracking="wide" className="mt-6">
          HOW IT WORKS
        </SectionLabel>
        <View className="gap-2 mt-3">
          {[
            'Sit upright. Relax shoulders.',
            'Squeeze pelvic-floor muscles briefly.',
            'Release completely between reps.',
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

        <SectionLabel tracking="wide" className="mt-6">
          TIPS
        </SectionLabel>
        <View className="gap-2 mt-3">
          {[
            'Breathe normally — don\'t hold your breath.',
            'Only the pelvic-floor muscles should move.',
            'Quality of contraction > count.',
          ].map((tip, i) => (
            <View key={i} className="flex-row gap-2.5 items-start">
              <Body color="muted">·</Body>
              <Body color="primary" className="flex-1">
                {tip}
              </Body>
            </View>
          ))}
        </View>
      </ScrollView>

      <View className="absolute bottom-0 left-0 right-0 px-6 pb-8">
        <Button
          label="Practice solo · 1 min"
          variant="primary"
          size="lg"
          radius="cta"
          onPress={() => router.push('/session/today')}
        />
      </View>
    </SafeAreaView>
  );
}
