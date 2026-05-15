import { useQuery } from '@tanstack/react-query';
import { ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

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

  return (
    <SafeAreaView className="flex-1 bg-bg">
      <ScrollView
        className="flex-1 px-6 pt-6"
        contentContainerClassName="pb-12"
      >
        <Text className="text-muted text-sm">Plan</Text>
        <Text className="text-ink text-3xl font-semibold mt-1">
          Your 8-week program
        </Text>
        <Text className="text-muted mt-2 leading-5">
          Day by day. Each session adapts to your daily-minute target.
        </Text>

        {!hasSupabaseConfig() ? (
          <View className="bg-surface border border-border rounded-xl p-4 mt-6">
            <Text className="text-muted text-sm">
              Sign in to see your generated plan. The hardcoded demo day
              appears on Today.
            </Text>
          </View>
        ) : daysQuery.isLoading ? (
          <Text className="text-muted mt-6">Loading…</Text>
        ) : days.length === 0 ? (
          <View className="bg-surface border border-border rounded-xl p-4 mt-6">
            <Text className="text-muted text-sm">
              Complete the onboarding assessment to generate your plan.
            </Text>
          </View>
        ) : (
          <View className="gap-2 mt-6">
            {days.map((d) => (
              <View
                key={d.id}
                className="bg-surface rounded-xl p-4 border border-border"
              >
                <View className="flex-row justify-between">
                  <Text className="text-muted text-xs uppercase tracking-wider">
                    Week {Math.floor(d.day_index / 7) + 1} · Day {(d.day_index % 7) + 1}
                  </Text>
                  <Text className="text-muted text-xs">
                    ~{Math.round(d.target_duration_s / 60)} min
                  </Text>
                </View>
                <Text className="text-ink font-semibold mt-1">
                  {d.exercises.map((e) => prettyName(e.slug)).join(' · ')}
                </Text>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
