// Figma: 25 · exercise detail — node 110:348
// https://www.figma.com/design/qgY3Qcf7gP7w5V5A6uQTL4/?node-id=110-348
//
// Real wiring: tempo summary computed from EXERCISES[exerciseId].phases
// instead of hardcoded "1s ON · 1s OFF". Falls back to a "not found" view
// when the slug is unknown.
//
// Deferred:
//   - Per-rep illustration (still 7 accent dots; Figma calls for a small
//     square pulse visualisation).
//   - Solo-mode session (Practice solo CTA currently lands on /session/today).
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Body, Button, Card, ScreenHeader, SectionLabel } from '@/components/ui';

import { EXERCISES } from '@/lib/exercises';
import type { ExerciseTemplate } from '@/lib/types';

function tempoSummary(ex: ExerciseTemplate): string {
  // ON = active work (squeeze + hold), OFF = rest (release).
  const onMs = ex.phases
    .filter((p) => p.kind === 'squeeze' || p.kind === 'hold')
    .reduce((a, p) => a + p.durationMs, 0);
  const offMs = ex.phases
    .filter((p) => p.kind === 'release')
    .reduce((a, p) => a + p.durationMs, 0);
  const fmt = (ms: number) => {
    const s = ms / 1000;
    return Number.isInteger(s) ? `${s}s` : `${s.toFixed(1)}s`;
  };
  return `${fmt(onMs)} ON · ${fmt(offMs)} OFF`;
}

const POSITION_LABEL: Record<
  NonNullable<ExerciseTemplate['position']>,
  string
> = {
  seated: 'Best done seated.',
  standing: 'Best done standing.',
  supine: 'Lying on your back.',
  quadruped: 'On hands and knees.',
  any: 'Sit upright, shoulders relaxed.',
};

export default function ExerciseDetail() {
  const router = useRouter();
  const { exerciseId } = useLocalSearchParams<{ exerciseId: string }>();
  const ex = exerciseId ? EXERCISES[exerciseId] : undefined;

  if (!ex) {
    return (
      <SafeAreaView className="flex-1 bg-surface-canvas">
        <ScreenHeader
          kind="detail"
          title="Exercise"
          onBack={() => router.back()}
        />
        <View className="flex-1 px-6 py-8">
          <Body color="muted">
            We don&rsquo;t recognise this exercise. It may have been removed
            from the catalog.
          </Body>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-surface-canvas">
      <ScreenHeader
        kind="detail"
        title={ex.name}
        onBack={() => router.back()}
      />

      <ScrollView className="flex-1" contentContainerClassName="px-6 pb-32">
        {/* Tempo visualisation card */}
        <Card padding="lg" radius="card" className="mt-2 items-center">
          <Body color="primary" style={{ fontSize: 28, letterSpacing: 4 }}>
            ● ● ● ● ● ● ●
          </Body>
          <Body size="sm" color="muted" className="mt-2">
            {tempoSummary(ex)}
          </Body>
          <Body size="sm" color="muted" className="mt-3 text-center">
            {ex.description}
          </Body>
        </Card>

        <SectionLabel tracking="wide" className="mt-6">
          HOW IT WORKS
        </SectionLabel>
        <View className="gap-2 mt-3">
          {[
            ex.position
              ? POSITION_LABEL[ex.position]
              : 'Sit upright, shoulders relaxed.',
            'Squeeze the pelvic-floor muscles cleanly — no breath holding.',
            'Release fully between reps. Quality beats count.',
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
            "Breathe normally — don't hold your breath.",
            'Only the pelvic-floor muscles should move.',
            `Aim for ${ex.sets} ${ex.sets === 1 ? 'set' : 'sets'} × ${ex.reps} reps; stop early if form slips.`,
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
