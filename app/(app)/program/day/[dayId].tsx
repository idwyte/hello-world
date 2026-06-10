// Obsidian Kinetic: program day detail. No dedicated frame ("still to
// design") — derived from the Today-hero + list-row patterns. The
// 4-state logic (today/completed/upcoming/rest) and fetchProgramDay
// wiring are unchanged.
import { useQuery } from '@tanstack/react-query';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ChevronRight } from 'lucide-react-native';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button, Chip, ScreenHeader } from '@/components/obsidian';
import { hasSupabaseConfig } from '@/lib/env';
import { color, glass, radius, spacing, type } from '@/lib/obsidian/tokens';
import { fetchProgramDay } from '@/lib/sessions';
import type { ExerciseTemplate } from '@/lib/types';

function dayThemeName(exercises: ExerciseTemplate[]): string {
  if (exercises.length === 0) return 'Rest';
  return exercises.slice(0, 2).map((e) => e.name).join(' + ');
}

function exerciseDescriptor(ex: ExerciseTemplate): string {
  const holdPhase = ex.phases.find((p) => p.kind === 'hold');
  if (holdPhase) {
    return `${ex.sets} × ${Math.round(holdPhase.durationMs / 1000)}s`;
  }
  return `${ex.sets} × ${ex.reps}`;
}

export default function DayDetail() {
  const router = useRouter();
  const { dayId } = useLocalSearchParams<{ dayId: string }>();

  const dayQuery = useQuery({
    queryKey: ['program-day', dayId],
    enabled: !!dayId && hasSupabaseConfig(),
    queryFn: () => fetchProgramDay(dayId as string),
  });

  const day = dayQuery.data ?? null;
  const exercises = day?.exercises ?? [];
  const status = day?.status ?? 'today';
  const minutes = day ? Math.round(day.targetDurationS / 60) : 0;
  const totalReps = exercises.reduce((acc, ex) => acc + ex.sets * ex.reps, 0);

  const kicker =
    status === 'completed'
      ? `COMPLETED · WEEK ${day?.weekNumber ?? 1}`
      : status === 'upcoming'
        ? `DAY ${day?.dayNumber ?? '?'} · WEEK ${day?.weekNumber ?? 1}`
        : status === 'rest'
          ? `REST · WEEK ${day?.weekNumber ?? 1}`
          : `TODAY · WEEK ${day?.weekNumber ?? 1}`;
  const kickerColor =
    status === 'completed'
      ? color.primaryFixedDim
      : status === 'today'
        ? color.primaryContainer
        : color.onSurfaceVariant;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: color.background }}>
      <ScreenHeader
        variant="back"
        title={day ? `Day ${day.dayNumber}` : 'Day'}
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
            Sign in to see your program.
          </Text>
        ) : dayQuery.isLoading ? (
          <Text style={{ ...type.bodyMd, color: color.onSurfaceVariant }}>
            Loading…
          </Text>
        ) : !day ? (
          <Text style={{ ...type.bodyMd, color: color.onSurfaceVariant }}>
            We couldn&rsquo;t find this day. It may have been replaced when
            your program regenerated.
          </Text>
        ) : (
          <>
            <Text style={{ ...type.labelCaps, color: kickerColor }}>
              {kicker}
            </Text>
            <Text style={{ ...type.headlineLg, color: color.onSurface }}>
              {dayThemeName(exercises)}
            </Text>
            {status === 'rest' ? (
              <Text style={{ ...type.bodyMd, color: color.onSurfaceVariant }}>
                Recovery day. No exercises scheduled — your tissues adapt
                between sessions, not during them.
              </Text>
            ) : (
              <>
                <Text
                  style={{ ...type.bodyMd, color: color.onSurfaceVariant }}
                >
                  {minutes} min · {exercises.length} exercise
                  {exercises.length === 1 ? '' : 's'} · {totalReps} reps total
                </Text>

                <View style={{ gap: 10, marginTop: spacing.stackSm }}>
                  {exercises.map((ex) => (
                    <Pressable
                      key={ex.slug}
                      onPress={() =>
                        router.push(`/program/exercise/${ex.slug}`)
                      }
                      accessibilityRole="button"
                      accessibilityLabel={`${ex.name}, ${exerciseDescriptor(ex)}`}
                      style={({ pressed }) => ({
                        flexDirection: 'row',
                        alignItems: 'center',
                        gap: spacing.gutter,
                        backgroundColor: color.surfaceContainerLow,
                        borderColor: glass.border,
                        borderWidth: glass.borderWidth,
                        borderRadius: radius.xl,
                        padding: spacing.stackMd,
                        opacity: pressed ? 0.8 : 1,
                      })}
                    >
                      <View style={{ flex: 1, gap: 2 }}>
                        <Text
                          style={{
                            ...type.labelButton,
                            color: color.onSurface,
                          }}
                        >
                          {ex.name}
                        </Text>
                        <Text
                          numberOfLines={1}
                          style={{
                            ...type.bodyMd,
                            fontSize: 14,
                            lineHeight: 20,
                            color: color.onSurfaceVariant,
                          }}
                        >
                          {ex.description.split('.')[0]}.
                        </Text>
                      </View>
                      <Text
                        style={{
                          ...type.labelCaps,
                          color: color.onSurfaceVariant,
                        }}
                      >
                        {exerciseDescriptor(ex)}
                      </Text>
                      <ChevronRight size={16} color={color.onSurfaceVariant} />
                    </Pressable>
                  ))}
                </View>
              </>
            )}

            <View style={{ flex: 1 }} />

            {status === 'today' && (
              <Button
                label="Start session"
                onPress={() => router.push('/session/today')}
                style={{ width: '100%' }}
              />
            )}
            {status === 'completed' && (
              <Button
                label="Review session"
                onPress={() =>
                  router.push(`/program/day/${day.programDayId}/review`)
                }
                style={{ width: '100%' }}
              />
            )}
            {status === 'upcoming' && (
              <View style={{ gap: spacing.stackSm, alignItems: 'center' }}>
                <Button
                  label={`Available on Day ${day.dayNumber}`}
                  disabled
                  onPress={() => undefined}
                  style={{ width: '100%' }}
                />
                <Chip label="DAYS UNLOCK AS YOU REACH THEM" variant="muted" />
              </View>
            )}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
