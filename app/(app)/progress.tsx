import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { Pressable, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { IndexTrendChart } from '@/components/charts/IndexTrendChart';
import { StreakHeatmap } from '@/components/charts/StreakHeatmap';
import {
  Body,
  Card,
  Heading,
  SectionLabel,
  Stat,
} from '@/components/ui';
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
    <SafeAreaView className="flex-1 bg-surface-canvas">
      <ScrollView
        className="flex-1 px-4 pt-3"
        contentContainerClassName="pb-12"
      >
        {/* Header with Retest CTA — Figma 10·progress */}
        <View className="flex-row items-end justify-between h-14 py-1.5">
          <View>
            <SectionLabel>Progress</SectionLabel>
            <Heading level="heading-lg" className="mt-1">
              Your rhythm
            </Heading>
          </View>
          <Pressable
            onPress={() => router.push('/index-retest')}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel="Retest your Pelvic Floor Index"
            className="active:opacity-60 px-3 py-2 rounded-full border border-border-default"
          >
            <Body size="sm" weight="semibold" color="accent">
              Retest →
            </Body>
          </Pressable>
        </View>

        {/* Streak pair */}
        <View className="flex-row gap-3 mt-6">
          <Stat kicker="Current streak" value={`${streak.current}d`} />
          <Stat kicker="Longest" value={`${streak.longest}d`} />
        </View>

        {/* Pelvic Floor Index sparkline */}
        <Card padding="lg" radius="2xl" className="mt-6 gap-3">
          <SectionLabel>Pelvic Floor Index</SectionLabel>
          <IndexTrendChart history={indexHistory} />
        </Card>

        {/* 12-week heatmap */}
        <Card padding="lg" radius="2xl" className="mt-4 gap-3">
          <SectionLabel>Last 12 weeks</SectionLabel>
          <StreakHeatmap dates={sessionDates} />
        </Card>

        {/* Sessions counter */}
        <Card padding="lg" radius="2xl" className="mt-4">
          <SectionLabel>Sessions completed</SectionLabel>
          <Heading level="heading-lg" className="mt-1">
            {sessionDates.length}
          </Heading>
          <Body size="xs" color="muted" className="mt-1">
            {hasSupabaseConfig()
              ? 'Synced from Supabase'
              : 'Local count (dev mode)'}
          </Body>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}
