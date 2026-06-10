// Obsidian Kinetic: exercise detail. Derived from glass-card + numbered
// steps patterns. EXERCISES[slug] lookup + tempo computation unchanged.
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button, ScreenHeader } from '@/components/obsidian';
import { EXERCISES } from '@/lib/exercises';
import { color, glass, radius, spacing, type } from '@/lib/obsidian/tokens';
import type { ExerciseTemplate } from '@/lib/types';

function tempoSummary(ex: ExerciseTemplate): string {
  const onMs = ex.phases
    .filter((p) => p.kind === 'squeeze' || p.kind === 'hold')
    .reduce((a, p) => a + p.durationMs, 0);
  const offMs = ex.phases
    .filter((p) => p.kind === 'release')
    .reduce((a, p) => a + p.durationMs, 0);
  const fmt = (ms: number) => {
    const s = ms / 1000;
    return Number.isInteger(s) ? `${s}S` : `${s.toFixed(1)}S`;
  };
  return `${fmt(onMs)} ON · ${fmt(offMs)} OFF`;
}

const POSITION_LABEL: Record<
  NonNullable<ExerciseTemplate['position']>,
  string
> = {
  seated: 'Sit upright, shoulders relaxed.',
  standing: 'Stand tall, weight even across both feet.',
  supine: 'Lie on your back, knees bent.',
  quadruped: 'On hands and knees, neutral spine.',
  any: 'Get comfortable, shoulders relaxed.',
};

export default function ExerciseDetail() {
  const router = useRouter();
  const { exerciseId } = useLocalSearchParams<{ exerciseId: string }>();
  const ex = exerciseId ? EXERCISES[exerciseId] : undefined;

  if (!ex) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: color.background }}>
        <ScreenHeader
          variant="back"
          title="Exercise"
          onPress={() => router.back()}
        />
        <View style={{ flex: 1, padding: spacing.containerPadding }}>
          <Text style={{ ...type.bodyMd, color: color.onSurfaceVariant }}>
            We don&rsquo;t recognise this exercise. It may have been removed
            from the catalog.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: color.background }}>
      <ScreenHeader
        variant="back"
        title={ex.name}
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
        {/* Tempo card */}
        <View
          style={{
            backgroundColor: color.surfaceContainerLow,
            borderColor: glass.border,
            borderWidth: glass.borderWidth,
            borderRadius: radius.xl,
            padding: spacing.containerPadding,
            alignItems: 'center',
            gap: spacing.stackSm,
          }}
        >
          <View style={{ flexDirection: 'row', gap: 8 }}>
            {Array.from({ length: 7 }, (_, i) => (
              <View
                key={i}
                style={{
                  width: 10,
                  height: 10,
                  borderRadius: radius.full,
                  backgroundColor:
                    i % 2 === 0
                      ? color.primaryContainer
                      : color.surfaceContainerHigh,
                }}
              />
            ))}
          </View>
          <Text
            style={{ ...type.labelCaps, color: color.primaryFixedDim }}
          >
            {tempoSummary(ex)}
          </Text>
          <Text
            style={{
              ...type.bodyMd,
              color: color.onSurfaceVariant,
              textAlign: 'center',
            }}
          >
            {ex.description}
          </Text>
        </View>

        <Text style={{ ...type.labelCaps, color: color.onSurfaceVariant }}>
          HOW IT WORKS
        </Text>
        <View style={{ gap: spacing.stackSm }}>
          {[
            ex.position
              ? POSITION_LABEL[ex.position]
              : 'Sit upright, shoulders relaxed.',
            'Squeeze the pelvic-floor muscles cleanly — no breath holding.',
            'Release fully between reps. Quality beats count.',
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

        <Text style={{ ...type.labelCaps, color: color.onSurfaceVariant }}>
          TIPS
        </Text>
        <View style={{ gap: spacing.stackSm }}>
          {[
            "Breathe normally — don't hold your breath.",
            'Only the pelvic-floor muscles should move.',
            `Aim for ${ex.sets} ${ex.sets === 1 ? 'set' : 'sets'} × ${ex.reps} reps; stop early if form slips.`,
          ].map((tip, i) => (
            <Text
              key={i}
              style={{ ...type.bodyMd, color: color.onSurfaceVariant }}
            >
              · {tip}
            </Text>
          ))}
        </View>

        <View style={{ flex: 1 }} />
        <Button
          label="Practice solo · 1 min"
          onPress={() => router.push('/session/today')}
          style={{ width: '100%' }}
        />
      </ScrollView>
    </SafeAreaView>
  );
}
