import { useQuery } from '@tanstack/react-query';
import { Link } from 'expo-router';
import { Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { hasSupabaseConfig } from '@/lib/env';
import { fetchRecentSessions, fetchStreak } from '@/lib/sessions';
import { useSessionStore } from '@/stores/session';

export default function Home() {
  const localStreak = useSessionStore((s) => s.streak);
  const localHistory = useSessionStore((s) => s.history);

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

  const streak = streakQuery.data ?? {
    current: localStreak.current,
    longest: localStreak.longest,
  };
  const sessionsCount = sessionsQuery.data?.length ?? localHistory.length;

  return (
    <SafeAreaView className="flex-1 bg-bg">
      <View className="flex-1 px-6 pt-6">
        <Text className="text-muted text-sm">Today</Text>
        <Text className="text-ink text-3xl font-semibold mt-1">SQZ</Text>

        <View className="bg-surface rounded-2xl p-5 mt-6 border border-border">
          <Text className="text-muted text-xs uppercase tracking-wider">
            Today's session
          </Text>
          <Text className="text-ink text-2xl font-semibold mt-2">
            Foundation Day 1
          </Text>
          <Text className="text-muted text-sm mt-1">
            Short Holds + Quick Flicks · ~4 min
          </Text>

          <Link href="/session/today" asChild>
            <Pressable
              className="bg-accent rounded-xl mt-5 py-4 items-center active:opacity-80"
              accessibilityRole="button"
              accessibilityLabel="Start today's session"
            >
              <Text className="text-ink font-semibold">Start session</Text>
            </Pressable>
          </Link>
        </View>

        <View className="flex-row gap-3 mt-4">
          <View className="flex-1 bg-surface rounded-2xl p-4 border border-border">
            <Text className="text-muted text-xs uppercase tracking-wider">
              Streak
            </Text>
            <Text className="text-ink text-2xl font-semibold mt-1">
              {streak.current}d
            </Text>
            <Text className="text-muted text-xs mt-1">
              Longest: {streak.longest}d
            </Text>
          </View>
          <View className="flex-1 bg-surface rounded-2xl p-4 border border-border">
            <Text className="text-muted text-xs uppercase tracking-wider">
              Sessions
            </Text>
            <Text className="text-ink text-2xl font-semibold mt-1">
              {sessionsCount}
            </Text>
            <Text className="text-muted text-xs mt-1">All time</Text>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}
