// Obsidian Kinetic: Program tab. No dedicated frame ("still to design")
// — derived from the week-card + bar-cell patterns. Empty state is
// st · Empty — No Program (Figma 50:238). Queries unchanged.
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Chip, StateScreen } from '@/components/obsidian';
import { hasSupabaseConfig } from '@/lib/env';
import { EXERCISES } from '@/lib/exercises';
import { color, glass, radius, spacing, type } from '@/lib/obsidian/tokens';
import { fetchCompletedDayIds } from '@/lib/sessions';
import { getSupabase } from '@/lib/supabase';

type ProgramDayRow = {
  id: string;
  day_index: number;
  target_duration_s: number;
  exercises: Array<{ slug: string }>;
};

async function fetchActiveProgramDays(): Promise<ProgramDayRow[]> {
  if (!hasSupabaseConfig()) return [];
  const supabase = getSupabase();
  const { data: user } = await supabase.auth.getUser();
  if (!user.user) return [];

  const { data: program } = await supabase
    .from('programs')
    .select('id')
    .eq('user_id', user.user.id)
    .eq('active', true)
    .maybeSingle();
  if (!program) return [];

  const { data, error } = await supabase
    .from('program_days')
    .select('id, day_index, target_duration_s, exercises')
    .eq('program_id', program.id as string)
    .order('day_index', { ascending: true })
    .limit(56);
  if (error) throw error;
  return (data as ProgramDayRow[]) ?? [];
}

function prettyExercises(slugs: string[]): string {
  return slugs
    .map((s) => EXERCISES[s]?.name ?? s.replace(/_/g, ' '))
    .join(' · ');
}

const WEEKDAY_LETTERS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

export default function Program() {
  const router = useRouter();
  const daysQuery = useQuery({
    queryKey: ['program-days'],
    enabled: hasSupabaseConfig(),
    queryFn: fetchActiveProgramDays,
  });
  const completedQuery = useQuery({
    queryKey: ['program-days', 'completed'],
    enabled: hasSupabaseConfig(),
    queryFn: fetchCompletedDayIds,
  });

  const days = daysQuery.data ?? [];
  const completedIds = completedQuery.data ?? new Set<string>();

  const weeks: ProgramDayRow[][] = [];
  for (const day of days) {
    const w = Math.floor(day.day_index / 7);
    if (!weeks[w]) weeks[w] = [];
    weeks[w].push(day);
  }

  const isEmpty =
    !daysQuery.isLoading && (!hasSupabaseConfig() || weeks.length === 0);

  if (isEmpty) {
    return (
      <StateScreen
        kicker="NO PROGRAMME YET"
        title="Let's build your plan"
        body="You haven't taken the assessment yet. It takes about four minutes and everything is built from the result."
        primaryLabel="Start assessment"
        onPrimary={() => router.push('/assessment-intro')}
      />
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: color.background }}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          paddingHorizontal: spacing.containerPadding,
          paddingTop: spacing.stackLg,
          paddingBottom: 24,
          gap: spacing.gutter,
        }}
      >
        <Text style={{ ...type.headlineMd, color: color.onSurface }}>
          Program
        </Text>

        {daysQuery.isLoading ? (
          <Text style={{ ...type.bodyMd, color: color.onSurfaceVariant }}>
            Loading…
          </Text>
        ) : (
          weeks.map((week, wi) => {
            const completed = week.filter((d) =>
              completedIds.has(d.id),
            ).length;
            const firstDay = week[0];
            const weekDone = completed === week.length && week.length > 0;
            return (
              <Pressable
                key={wi}
                accessibilityRole="button"
                accessibilityLabel={`Week ${wi + 1}`}
                onPress={() =>
                  firstDay
                    ? router.push(`/program/day/${firstDay.id}`)
                    : undefined
                }
                style={({ pressed }) => ({ opacity: pressed ? 0.8 : 1 })}
              >
                <View
                  style={{
                    backgroundColor: color.surfaceContainerLow,
                    borderColor: glass.border,
                    borderWidth: glass.borderWidth,
                    borderRadius: radius.xl,
                    padding: spacing.stackMd,
                    gap: spacing.gutter,
                  }}
                >
                  <View
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                  >
                    <View style={{ flex: 1, gap: 2 }}>
                      <Text
                        style={{ ...type.labelButton, color: color.onSurface }}
                      >
                        Week {wi + 1}
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
                        {prettyExercises(
                          week[0]?.exercises.map((e) => e.slug) ?? [],
                        ) || 'Recovery week'}
                      </Text>
                    </View>
                    <Chip
                      label={`${completed}/${week.length}`}
                      variant={weekDone ? 'complete' : 'muted'}
                    />
                  </View>
                  <View style={{ flexDirection: 'row', gap: 6 }}>
                    {WEEKDAY_LETTERS.map((letter, di) => {
                      const day = week[di];
                      const done = day ? completedIds.has(day.id) : false;
                      return (
                        <View
                          key={di}
                          style={{
                            flex: 1,
                            alignItems: 'center',
                            paddingVertical: spacing.stackSm,
                            borderRadius: 10,
                            backgroundColor: done
                              ? 'rgba(195, 244, 0, 0.14)'
                              : color.surfaceContainerHigh,
                            opacity: day ? 1 : 0.4,
                            gap: 2,
                          }}
                        >
                          <Text
                            style={{
                              ...type.labelCaps,
                              fontSize: 10,
                              letterSpacing: 1,
                              color: color.onSurfaceVariant,
                            }}
                          >
                            {letter}
                          </Text>
                          <Text
                            style={{
                              ...type.labelButton,
                              fontSize: 16,
                              lineHeight: 22,
                              color: done
                                ? color.primaryContainer
                                : color.onSurface,
                            }}
                          >
                            {day ? day.day_index + 1 : '—'}
                          </Text>
                        </View>
                      );
                    })}
                  </View>
                </View>
              </Pressable>
            );
          })
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
