// Obsidian Kinetic: "New in your program" exercise intro. Derived from
// the glass-card pattern. EXERCISES[slug]-driven content unchanged.
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button, ScreenHeader } from '@/components/obsidian';
import { EXERCISES } from '@/lib/exercises';
import { color, radius, spacing, type } from '@/lib/obsidian/tokens';
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

function patternLabels(ex: ExerciseTemplate): [string, string] {
  if (ex.slug.startsWith('reverse')) return ['RELEASE', 'EXPAND'];
  if (ex.phases.some((p) => p.kind === 'hold')) return ['SQUEEZE', 'HOLD'];
  return ['PULSE', 'RELEASE'];
}

export default function ExerciseIntro() {
  const router = useRouter();
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const ex = EXERCISES[slug ?? 'reverse_kegels'] ?? EXERCISES.reverse_kegels;
  const [primary, secondary] = patternLabels(ex);
  const isRelease = ex.slug.startsWith('reverse');

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: color.background }}>
      <ScreenHeader
        variant="back"
        title="New exercise"
        onPress={() => router.back()}
      />
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          flexGrow: 1,
          paddingHorizontal: spacing.containerPadding,
          paddingTop: spacing.stackMd,
          paddingBottom: spacing.stackLg + spacing.stackMd,
          gap: spacing.stackMd,
        }}
      >
        <View
          style={{
            backgroundColor: color.surfaceContainerLow,
            borderColor: isRelease
              ? color.secondaryContainer
              : color.primaryContainer,
            borderWidth: 1.5,
            borderRadius: radius.xl,
            padding: spacing.containerPadding,
            gap: spacing.stackSm,
          }}
        >
          <Text
            style={{
              ...type.labelCaps,
              color: isRelease
                ? color.secondaryContainer
                : color.primaryFixedDim,
            }}
          >
            NEW IN YOUR PROGRAM
          </Text>
          <Text style={{ ...type.headlineLg, color: color.onSurface }}>
            {ex.name}
          </Text>
          <View style={{ flexDirection: 'row', gap: 8, marginTop: 4 }}>
            {Array.from({ length: 7 }, (_, i) => (
              <View
                key={i}
                style={{
                  width: 10,
                  height: 10,
                  borderRadius: radius.full,
                  borderWidth: 1.5,
                  borderColor: isRelease
                    ? color.secondaryContainer
                    : color.primaryContainer,
                  backgroundColor: 'transparent',
                }}
              />
            ))}
          </View>
          <Text style={{ ...type.labelCaps, color: color.onSurfaceVariant }}>
            {primary} · {secondary}
          </Text>
        </View>

        <Text style={{ ...type.labelCaps, color: color.onSurfaceVariant }}>
          WHY IT MATTERS
        </Text>
        <Text style={{ ...type.bodyMd, color: color.onSurface }}>
          {ex.description}
        </Text>

        <Text style={{ ...type.labelCaps, color: color.onSurfaceVariant }}>
          HOW TO DO IT
        </Text>
        <View style={{ gap: spacing.stackSm }}>
          {[
            POSITION_FIRST_STEP[ex.position ?? 'any'],
            isRelease
              ? 'Inhale and gently bear down — like the start of a bowel movement.'
              : 'Squeeze the pelvic-floor muscles cleanly, no breath holding.',
            `Stop if you feel pressure or strain. Aim for ${ex.sets} × ${ex.reps}; less is more here.`,
          ].map((step, i) => (
            <View key={i} style={{ flexDirection: 'row', gap: spacing.gutter }}>
              <Text
                style={{ ...type.labelButton, color: color.primaryFixedDim }}
              >
                {i + 1}.
              </Text>
              <Text
                style={{ ...type.bodyMd, color: color.onSurface, flex: 1 }}
              >
                {step}
              </Text>
            </View>
          ))}
        </View>

        <View style={{ flex: 1 }} />
        <Button
          label="I get it — let's try"
          onPress={() => router.replace(`/program/exercise/${ex.slug}`)}
          style={{ width: '100%' }}
        />
      </ScrollView>
    </SafeAreaView>
  );
}
