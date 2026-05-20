import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { Pressable, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Body, Card, Pill, ScreenHeader } from '@/components/ui';
import { hasSupabaseConfig } from '@/lib/env';
import { EXERCISES } from '@/lib/exercises';
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

  const days = daysQuery.data ?? [];

  // Group days by week index for the week-card layout.
  const weeks: ProgramDayRow[][] = [];
  for (const day of days) {
    const w = Math.floor(day.day_index / 7);
    if (!weeks[w]) weeks[w] = [];
    weeks[w].push(day);
  }

  return (
    <SafeAreaView className="flex-1 bg-surface-canvas">
      <ScreenHeader kind="large-title" title="Plan" />

      <ScrollView
        className="flex-1"
        contentContainerClassName="pb-12 px-4"
      >
        {!hasSupabaseConfig() ? (
          <Card padding="md" radius="card-tight" bordered className="mt-2">
            <Body size="sm" color="muted">
              Sign in to see your generated plan. The hardcoded demo day appears
              on Today.
            </Body>
          </Card>
        ) : daysQuery.isLoading ? (
          <Body size="md" color="muted" className="mt-2">
            Loading…
          </Body>
        ) : weeks.length === 0 ? (
          <Card padding="md" radius="card-tight" bordered className="mt-2">
            <Body size="sm" color="muted">
              Complete the onboarding assessment to generate your plan.
            </Body>
          </Card>
        ) : (
          <View className="gap-3 mt-2">
            {weeks.map((week, wi) => {
              const completed = 0; // TODO: cross-reference sessions to compute completion
              const firstDay = week[0];
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
                >
                <Card
                  padding="md"
                  radius="card-tight"
                  className="w-[358px] self-center"
                >
                  {/* Week header */}
                  <View className="flex-row items-center justify-between">
                    <View>
                      <Body
                        weight="semibold"
                        color="primary"
                        style={{ fontSize: 17, lineHeight: 24 }}
                      >
                        Week {wi + 1}
                      </Body>
                      <Body
                        size="sm"
                        color="muted"
                        style={{ fontSize: 13, lineHeight: 18 }}
                      >
                        {prettyExercises(
                          week[0]?.exercises.map((e) => e.slug) ?? [],
                        ) || 'Recovery week'}
                      </Body>
                    </View>
                    <Pill
                      label={`${completed} / ${week.length}`}
                      tone="surface2"
                      size="xs"
                    />
                  </View>
                  {/* 7-day grid */}
                  <View className="flex-row gap-1 mt-3">
                    {WEEKDAY_LETTERS.map((letter, di) => {
                      const day = week[di];
                      return (
                        <View
                          key={di}
                          className={`flex-1 items-center justify-center py-2 rounded-[10px] ${day ? 'bg-surface-sunken' : 'bg-surface-sunken opacity-40'}`}
                        >
                          <Body
                            weight="medium"
                            color="muted"
                            style={{ fontSize: 11, lineHeight: 14 }}
                          >
                            {letter}
                          </Body>
                          <Body
                            weight="medium"
                            color="primary"
                            className="mt-0.5"
                            style={{ fontSize: 18, lineHeight: 24 }}
                          >
                            {day ? (day.day_index % 28) + 1 : '—'}
                          </Body>
                        </View>
                      );
                    })}
                  </View>
                </Card>
                </Pressable>
              );
            })}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
