// Obsidian Kinetic: session review. Derived from the stat-tile +
// list-row patterns. fetchProgramDay/fetchLastSessionForDay wiring and
// the bi-weekly retest nudge are unchanged.
import { useQuery } from '@tanstack/react-query';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Check } from 'lucide-react-native';
import { ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button, ScreenHeader } from '@/components/obsidian';
import { hasSupabaseConfig } from '@/lib/env';
import { color, glass, radius, spacing, type } from '@/lib/obsidian/tokens';
import {
  RETEST_INTERVAL_DAYS,
  daysSinceLastIndex,
  fetchIndexHistory,
  fetchLastSessionForDay,
  fetchProgramDay,
} from '@/lib/sessions';
import type { ExerciseTemplate } from '@/lib/types';

function formatDuration(s: number): string {
  if (s <= 0) return '—';
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${m}:${String(r).padStart(2, '0')}`;
}

function formatDate(iso: string | null): string {
  if (!iso) return '';
  return new Date(iso)
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
    <SafeAreaView style={{ flex: 1, backgroundColor: color.background }}>
      <ScreenHeader
        variant="back"
        title={day ? `Day ${day.dayNumber} review` : 'Review'}
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
        {!hasSupabaseConfig() ? (
          <Text style={{ ...type.bodyMd, color: color.onSurfaceVariant }}>
            Sign in to review past sessions.
          </Text>
        ) : dayQuery.isLoading ? (
          <Text style={{ ...type.bodyMd, color: color.onSurfaceVariant }}>
            Loading…
          </Text>
        ) : !day ? (
          <Text style={{ ...type.bodyMd, color: color.onSurfaceVariant }}>
            We couldn&rsquo;t find this day.
          </Text>
        ) : (
          <>
            <Text
              style={{ ...type.labelCaps, color: color.primaryFixedDim }}
            >
              {sess?.endedAt
                ? `COMPLETED · ${formatDate(sess.endedAt)}`
                : `DAY ${day.dayNumber}`}
            </Text>
            <Text style={{ ...type.headlineLg, color: color.onSurface }}>
              {sess ? 'Nice work.' : "You haven't done this one yet."}
            </Text>

            {sess && (
              <View style={{ flexDirection: 'row', gap: spacing.gutter }}>
                <StatTile label="TIME" value={formatDuration(sess.durationS)} />
                <StatTile label="REPS" value={String(sess.repsCompleted)} />
                <StatTile
                  label="EFFORT"
                  value={
                    sess.perceivedEffort != null
                      ? `${sess.perceivedEffort}/10`
                      : '—'
                  }
                />
              </View>
            )}

            <View style={{ gap: spacing.stackSm }}>
              {exercises.map((ex) => (
                <View
                  key={ex.slug}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: spacing.gutter,
                    backgroundColor: color.surfaceContainerLow,
                    borderColor: glass.border,
                    borderWidth: glass.borderWidth,
                    borderRadius: radius.xl,
                    padding: spacing.stackMd,
                  }}
                >
                  <View style={{ flex: 1, gap: 2 }}>
                    <Text
                      style={{ ...type.labelButton, color: color.onSurface }}
                    >
                      {ex.name}
                    </Text>
                    <Text
                      style={{
                        ...type.labelCaps,
                        color: color.onSurfaceVariant,
                      }}
                    >
                      {exerciseDescriptor(ex)}
                    </Text>
                  </View>
                  {sess && (
                    <View
                      style={{
                        width: 28,
                        height: 28,
                        borderRadius: radius.full,
                        borderWidth: 1.5,
                        borderColor: color.primaryContainer,
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Check
                        size={16}
                        color={color.primaryContainer}
                        strokeWidth={3}
                      />
                    </View>
                  )}
                </View>
              ))}
            </View>

            {showRetestNudge && (
              <View
                style={{
                  backgroundColor: color.surfaceContainerLow,
                  borderColor: color.secondaryContainer,
                  borderWidth: 1.5,
                  borderRadius: radius.xl,
                  padding: spacing.stackMd,
                  gap: spacing.stackSm,
                }}
              >
                <Text
                  style={{
                    ...type.labelCaps,
                    color: color.secondaryContainer,
                  }}
                >
                  TIME FOR A RETEST
                </Text>
                <Text style={{ ...type.bodyMd, color: color.onSurface }}>
                  It&rsquo;s been {daysSince} days since your last
                  measurement. Four minutes refreshes the trend.
                </Text>
                <Button
                  label="Retest now"
                  onPress={() => router.push('/index-retest')}
                  style={{ width: '100%', marginTop: 4 }}
                />
              </View>
            )}

            <View style={{ flex: 1 }} />
            <Button
              label="Back to today"
              onPress={() => router.replace('/home')}
              style={{ width: '100%' }}
            />
            <Button
              label="Repeat session"
              variant="ghost"
              onPress={() => router.push('/session/today')}
              style={{ width: '100%' }}
            />
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function StatTile({ label, value }: { label: string; value: string }) {
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: color.surfaceContainerLow,
        borderColor: glass.border,
        borderWidth: glass.borderWidth,
        borderRadius: radius.xl,
        padding: spacing.stackMd,
        gap: spacing.stackSm,
      }}
    >
      <Text style={{ ...type.labelCaps, color: color.onSurfaceVariant }}>
        {label}
      </Text>
      <Text
        style={{
          ...type.metricLg,
          fontSize: 28,
          lineHeight: 32,
          color: color.onSurface,
        }}
      >
        {value}
      </Text>
    </View>
  );
}
