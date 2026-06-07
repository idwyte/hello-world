// Figma: 32 · exercise intro — node 126:363
//
// Generic "New in your program" intro shell. Driven by EXERCISES[slug]:
// title, description, position-aware "HOW TO DO IT" step 1, sets/reps
// surfaced as a TIP. Falls back to the reverse-Kegel copy if the slug
// is unknown so this stays a useful preview when the user lands here
// from an old deeplink.
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Body, Button, Card, ScreenHeader, SectionLabel } from '@/components/ui';
import { EXERCISES } from '@/lib/exercises';
import type { ExerciseTemplate } from '@/lib/types';

const POSITION_FIRST_STEP: Record<
  NonNullable<ExerciseTemplate['position']>,
  string
> = {
  seated: 'Sit upright, shoulders relaxed.',
  standing: 'Stand tall, weight even across both feet.',
  supine: 'Lie on your back, knees bent.',
  quadruped: 'On hands and knees, neutral spine.',
  any: 'Get comfortable, shoulders relaxed.',
};

function descriptorPhasePattern(ex: ExerciseTemplate): {
  primary: string;
  secondary: string;
} {
  const hasHold = ex.phases.some((p) => p.kind === 'hold');
  if (ex.slug.startsWith('reverse')) {
    return { primary: 'RELEASE', secondary: 'EXPAND' };
  }
  if (hasHold) {
    return { primary: 'SQUEEZE', secondary: 'HOLD' };
  }
  return { primary: 'PULSE', secondary: 'RELEASE' };
}

export default function ExerciseIntro() {
  const router = useRouter();
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const safeSlug = slug ?? 'reverse_kegels';
  const ex = EXERCISES[safeSlug] ?? EXERCISES.reverse_kegels;

  const pattern = descriptorPhasePattern(ex);
  const positionStep =
    POSITION_FIRST_STEP[ex.position ?? 'any'];

  return (
    <SafeAreaView className="flex-1 bg-surface-canvas">
      <ScreenHeader
        kind="detail"
        title="New exercise"
        onBack={() => router.back()}
      />

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
            {ex.name}
          </Body>
          <View className="flex-row items-center justify-between mt-4">
            <Body color="muted" style={{ fontSize: 28, letterSpacing: 4 }}>
              ○ ○ ○ ○ ○ ○ ○
            </Body>
          </View>
          <View className="flex-row items-center mt-2 gap-3">
            <Body size="xs" weight="medium" color="muted">
              {pattern.primary}
            </Body>
            <Body size="xs" weight="medium" color="muted">
              ·
            </Body>
            <Body size="xs" weight="medium" color="muted">
              {pattern.secondary}
            </Body>
          </View>
        </Card>

        <SectionLabel tracking="wide" className="mt-6">
          WHY IT MATTERS
        </SectionLabel>
        <Body color="primary" className="mt-3">
          {ex.description}
        </Body>

        <SectionLabel tracking="wide" className="mt-6">
          HOW TO DO IT
        </SectionLabel>
        <View className="gap-3 mt-3">
          {[
            positionStep,
            ex.slug.startsWith('reverse')
              ? 'Inhale and gently bear down — like the start of a bowel movement.'
              : 'Squeeze the pelvic-floor muscles cleanly, no breath holding.',
            `Stop if you feel pressure or strain. Aim for ${ex.sets} × ${ex.reps}; less is more here.`,
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
          onPress={() =>
            router.replace(`/program/exercise/${ex.slug}`)
          }
        />
      </View>
    </SafeAreaView>
  );
}
