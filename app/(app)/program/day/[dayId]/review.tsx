// Figma: 31 · session review — node 124:378
// https://www.figma.com/design/qgY3Qcf7gP7w5V5A6uQTL4/?node-id=124-378
//
// Real wiring: pulls the program day + the user's most recent completed
// session for that day. Renders duration/reps/RPE meta chips and the per-
// exercise list (✓ when a completed session exists). Shows a retest nudge
// when the bi-weekly cadence (RETEST_INTERVAL_DAYS) has elapsed.
//
// Deferred:
//   - Per-set status dots (no per-set log persisted yet; would need a
//     session_exercises join table).
import { useQuery } from '@tanstack/react-query';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Check } from 'lucide-react-native';
import { ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Body, Button, Card, Pill, ScreenHeader, SectionLabel } from '@/components/ui';
import { hasSupabaseConfig } from '@/lib/env';
import {
  RETEST_INTERVAL_DAYS,
  daysSinceLastIndex,
  fetchIndexHistory,
  fetchLastSessionForDay,
  fetchProgramDay,
} from '@/lib/sessions';
import { semantic } from '@/lib/theme';
import type { ExerciseTemplate } from '@/lib/types';

function formatDuration(s: number): string {
  if (s <= 0) return '—';
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${m}:${String(r).padStart(2, '0')}`;
}

function formatDate(iso: string | null): string {
  if (!iso) return '';
  const d = new Date(iso);
  return d
    .toLocaleString(undefined, { month: 'short', day: 'numeric' })
    .toUpperCase();
}

function exerciseDescriptor(ex: ExerciseTemplate): string {
  const holdPhase = ex.phases.find((p) => p.kind === 'hold');
  if (holdPhase) {
    return `${ex.sets} × ${Math.round(holdPhase.durationMs / 1000)}s`;
  }
  return `${ex.sets} × ${ex.reps}`;
}

export default function DayReview() {
  const router = useRouter();
  const { dayId } = useLocalSearchParams<{ dayId: string }>();

  const dayQuery = useQuery({
    queryKey: ['program-day', dayId],
    enabled: !!dayId && hasSupabaseConfig(),
    queryFn: () => fetchProgramDay(dayId as string),
  });
  const sessionQuery = useQuery({
    queryKey: ['program-day', dayId, 'last-session'],
    enabled: !!dayId && hasSupabaseConfig(),
    queryFn: () => fetchLastSessionForDay(dayId as string),
  });
  const indexQuery = useQuery({
    queryKey: ['index', 'history'],
    enabled: hasSupabaseConfig(),
    queryFn: () => fetchIndexHistory(12),
  });

  const day = dayQuery.data ?? null;
  const sess = sessionQuery.data ?? null;
  const exercises = day?.exercises ?? [];
  const daysSince = daysSinceLastIndex(indexQuery.data ?? []);
  const showRetestNudge =
    daysSince !== null && daysSince >= RETEST_INTERVAL_DAYS;

  return (
    <SafeAreaView className="flex-1 bg-surface-canvas">
      <ScreenHeader
        kind="detail"
        title={day ? `Day ${day.dayNumber} review` : 'Review'}
        onBack={() => router.back()}
      />

      <ScrollView className="flex-1" contentContainerClassName="px-4 pb-32">
        {!hasSupabaseConfig() ? (
          <Body color="muted" className="mt-4 px-2">
            Sign in to review past sessions.
          </Body>
        ) : dayQuery.isLoading ? (
          <Body color="muted" className="mt-4 px-2">
            Loading…
          </Body>
        ) : !day ? (
          <Body color="muted" className="mt-4 px-2">
            We couldn&rsquo;t find this day.
          </Body>
        ) : (
          <>
            <SectionLabel tracking="wide" className="text-feedback-success">
              {sess?.endedAt
                ? `COMPLETED · ${formatDate(sess.endedAt)}`
                : `DAY ${day.dayNumber}`}
            </SectionLabel>
            <Body
              weight="semibold"
              color="primary"
              className="mt-2"
              style={{ fontSize: 28, lineHeight: 36 }}
            >
              {sess ? 'Nice work.' : "You haven't done this one yet."}
            </Body>

            {sess && (
              <View className="flex-row gap-2 mt-3 flex-wrap">
                <Pill
                  label={formatDuration(sess.durationS)}
                  tone="surface"
                  size="sm"
                  bordered
                />
                <Pill
                  label={`${sess.repsCompleted} reps`}
                  tone="surface"
                  size="sm"
                  bordered
                />
                {sess.perceivedEffort != null && (
                  <Pill
                    label={`RPE ${sess.perceivedEffort}`}
                    tone="surface"
                    size="sm"
                    bordered
                  />
                )}
              </View>
            )}

            <SectionLabel tracking="wide" className="mt-6">
              PER EXERCISE
            </SectionLabel>
            <View className="gap-2 mt-3">
              {exercises.map((ex) => (
                <Card key={ex.slug} padding="md" radius="card-tight">
                  <View className="flex-row items-center justify-between">
                    <View className="flex-1 pr-2">
                      <Body
                        weight="semibold"
                        color="primary"
                        style={{ fontSize: 15, lineHeight: 22 }}
                      >
                        {ex.name}
                      </Body>
                      <Body
                        color="muted"
                        style={{ fontSize: 13, lineHeight: 18 }}
                      >
                        {exerciseDescriptor(ex)}
                      </Body>
                    </View>
                    {sess && (
                      <View
                        className="w-7 h-7 rounded-full items-center justify-center"
                        style={{ backgroundColor: semantic.feedbackSuccess + '22' }}
                      >
                        <Check size={16} color={semantic.feedbackSuccess} />
                      </View>
                    )}
                  </View>
                </Card>
              ))}
            </View>

            {showRetestNudge && (
              <Card
                padding="md"
                radius="card-tight"
                className="mt-6"
                style={{
                  backgroundColor: semantic.interactivePrimaryPressed,
                  borderColor: semantic.interactivePrimary + '55',
                  borderWidth: 1,
                }}
              >
                <SectionLabel tracking="wide" className="text-interactive-primary">
                  TIME FOR A RETEST
                </SectionLabel>
                <Body color="primary" className="mt-2" size="sm">
                  It&rsquo;s been {daysSince} days since your last measurement.
                  Two minutes will refresh the trend.
                </Body>
                <Button
                  label="Retest now"
                  variant="primary"
                  size="md"
                  className="mt-3 self-start"
                  onPress={() => router.push('/index-retest')}
                />
              </Card>
            )}
          </>
        )}
      </ScrollView>

      <View className="absolute bottom-0 left-0 right-0 px-4 pb-8">
        <Button
          label="Back to today"
          variant="primary"
          size="lg"
          radius="cta"
          onPress={() => router.replace('/home')}
        />
        <Button
          label="Repeat session"
          variant="ghost"
          size="md"
          className="mt-2"
          onPress={() => router.push('/session/today')}
        />
      </View>
    </SafeAreaView>
  );
}
