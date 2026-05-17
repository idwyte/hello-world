import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { IndexTrendChart } from '@/components/charts/IndexTrendChart';
import { StreakHeatmap } from '@/components/charts/StreakHeatmap';
import { hasSupabaseConfig } from '@/lib/env';
import {
  fetchIndexHistory,
  fetchRecentSessions,
  fetchStreak,
} from '@/lib/sessions';
import { useSessionStore } from '@/stores/session';

export default function Progress() {
  const router = useRouter();
  const local = useSessionStore();

  const streakQuery = useQuery({
    queryKey: ['streak'],
    enabled: hasSupabaseConfig(),
    queryFn: fetchStreak,
  });
  const sessionsQuery = useQuery({
    queryKey: ['sessions', 'recent'],
    enabled: hasSupabaseConfig(),
    queryFn: () => fetchRecentSessions(60),
  });
  const indexQuery = useQuery({
    queryKey: ['index', 'history'],
    enabled: hasSupabaseConfig(),
    queryFn: () => fetchIndexHistory(12),
  });

  const streak = streakQuery.data ?? {
    current: local.streak.current,
    longest: local.streak.longest,
    lastDate: local.streak.lastDate ?? null,
  };
  const sessionDates =
    sessionsQuery.data?.map((s) => s.endedAt ?? s.startedAt) ??
    local.history
      .filter((h) => h.completed)
      .map((h) => new Date(h.endedAt).toISOString());

  const indexHistory = indexQuery.data ?? [];

  return (
    <SafeAreaView className="flex-1 bg-bg">
      <ScrollView
        className="flex-1 px-6 pt-6"
        contentContainerClassName="pb-12"
      >
        <Text className="text-muted text-sm">Progress</Text>
        <Text className="text-ink text-3xl font-semibold mt-1">Your rhythm</Text>

        <View className="flex-row gap-3 mt-6">
          <View className="flex-1 bg-surface rounded-2xl p-4 border border-border">
            <Text className="text-muted text-xs uppercase tracking-wider">
              Current streak
            </Text>
            <Text className="text-ink text-3xl font-semibold mt-1">
              {streak.current}d
            </Text>
          </View>
          <View className="flex-1 bg-surface rounded-2xl p-4 border border-border">
            <Text className="text-muted text-xs uppercase tracking-wider">
              Longest
            </Text>
            <Text className="text-ink text-3xl font-semibold mt-1">
              {streak.longest}d
            </Text>
          </View>
        </View>

        <View className="mt-6 bg-surface rounded-2xl p-4 border border-border">
          <View className="flex-row items-center justify-between">
            <Text className="text-muted text-xs uppercase tracking-wider">
              Pelvic Floor Index
            </Text>
            <Pressable
              onPress={() => router.push('/index-retest')}
              hitSlop={8}
              accessibilityRole="button"
              accessibilityLabel="Retest your Pelvic Floor Index"
              className="active:opacity-60"
            >
              <Text className="text-accent text-xs font-semibold">Retest →</Text>
            </Pressable>
          </View>
          <View className="mt-3">
            <IndexTrendChart history={indexHistory} />
          </View>
        </View>

        <View className="mt-6 bg-surface rounded-2xl p-4 border border-border">
          <Text className="text-muted text-xs uppercase tracking-wider">
            Last 12 weeks
          </Text>
          <View className="mt-3">
            <StreakHeatmap dates={sessionDates} />
          </View>
        </View>

        <View className="mt-6 bg-surface rounded-2xl p-4 border border-border">
          <Text className="text-muted text-xs uppercase tracking-wider">
            Sessions completed
          </Text>
          <Text className="text-ink text-3xl font-semibold mt-1">
            {sessionDates.length}
          </Text>
          <Text className="text-muted text-xs mt-1">
            {hasSupabaseConfig()
              ? 'Synced from Supabase'
              : 'Local count (dev mode)'}
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
