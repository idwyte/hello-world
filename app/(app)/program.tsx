import { useQuery } from '@tanstack/react-query';
import { ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Body, Card, Heading, SectionLabel } from '@/components/ui';
import { hasSupabaseConfig } from '@/lib/env';
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

function prettyName(slug: string): string {
  return slug
    .split('_')
    .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
    .join(' ');
}

export default function Program() {
  const daysQuery = useQuery({
    queryKey: ['program-days'],
    enabled: hasSupabaseConfig(),
    queryFn: fetchActiveProgramDays,
  });

  const days = daysQuery.data ?? [];

  // Group days by week for the calendar grid (Figma 09·program).
  const weeks: ProgramDayRow[][] = [];
  for (const day of days) {
    const w = Math.floor(day.day_index / 7);
    if (!weeks[w]) weeks[w] = [];
    weeks[w].push(day);
  }

  return (
    <SafeAreaView className="flex-1 bg-surface-canvas">
      <ScrollView
        className="flex-1 px-4 pt-3"
        contentContainerClassName="pb-12"
      >
        <View>
          <SectionLabel>Plan</SectionLabel>
          <Heading level="display-lg" className="mt-1">
            Your 8-week program
          </Heading>
          <Body size="md" color="muted" className="mt-2">
            Day by day. Each session adapts to your daily-minute target.
          </Body>
        </View>

        {!hasSupabaseConfig() ? (
          <Card padding="md" className="mt-6" bordered>
            <Body size="sm" color="muted">
              Sign in to see your generated plan. The hardcoded demo day appears
              on Today.
            </Body>
          </Card>
        ) : daysQuery.isLoading ? (
          <Body size="md" color="muted" className="mt-6">
            Loading…
          </Body>
        ) : days.length === 0 ? (
          <Card padding="md" className="mt-6" bordered>
            <Body size="sm" color="muted">
              Complete the onboarding assessment to generate your plan.
            </Body>
          </Card>
        ) : (
          <View className="gap-4 mt-6">
            {weeks.map((week, wi) => (
              <View key={wi} className="gap-2">
                <SectionLabel>Week {wi + 1}</SectionLabel>
                {week.map((d) => (
                  <Card key={d.id} padding="md" bordered>
                    <View className="flex-row justify-between">
                      <SectionLabel>Day {(d.day_index % 7) + 1}</SectionLabel>
                      <Body size="xs" color="muted">
                        ~{Math.round(d.target_duration_s / 60)} min
                      </Body>
                    </View>
                    <Body
                      size="md"
                      weight="semibold"
                      color="primary"
                      className="mt-1"
                    >
                      {d.exercises.map((e) => prettyName(e.slug)).join(' · ')}
                    </Body>
                  </Card>
                ))}
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
