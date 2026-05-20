import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { Pressable, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { IndexTrendChart } from '@/components/charts/IndexTrendChart';
import { StreakHeatmap } from '@/components/charts/StreakHeatmap';
import {
  Body,
  Card,
  Pill,
  ScreenHeader,
  SectionLabel,
} from '@/components/ui';
import { hasSupabaseConfig } from '@/lib/env';
import {
  daysSinceLastIndex,
  fetchIndexHistory,
  fetchRecentSessions,
  fetchStreak,
  RETEST_INTERVAL_DAYS,
} from '@/lib/sessions';
import { useSessionStore } from '@/stores/session';

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

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
  };
  const sessionDates =
    sessionsQuery.data?.map((s) => s.endedAt ?? s.startedAt) ??
    local.history
      .filter((h) => h.completed)
      .map((h) => new Date(h.endedAt).toISOString());

  const indexHistory = indexQuery.data ?? [];
  const latest = indexHistory.at(-1) ?? null;
  const prev = indexHistory.at(-2) ?? null;
  const delta = latest && prev ? latest.composite - prev.composite : null;

  // Bi-weekly retest cadence — show days-remaining on the pill if the
  // user has retested recently, "Retest" otherwise. Soft enforcement —
  // tapping always lets them through (the screen itself shows a warning
  // banner if it's <14 days since last retest).
  const daysSince = daysSinceLastIndex(indexHistory);
  const daysRemaining =
    daysSince !== null ? Math.max(0, RETEST_INTERVAL_DAYS - daysSince) : 0;
  const retestDue = daysSince === null || daysRemaining === 0;
  const retestLabel = retestDue ? 'Retest' : `In ${daysRemaining}d`;

  return (
    <SafeAreaView className="flex-1 bg-surface-canvas">
      <ScrollView
        className="flex-1"
        contentContainerClassName="pb-12"
      >
        {/* Figma 10·progress — title + Retest pill, h-14 */}
        <ScreenHeader
          kind="title"
          title="Progress"
          trailing={
            <Pressable
              onPress={() => router.push('/index-retest')}
              hitSlop={8}
              accessibilityRole="button"
              accessibilityLabel={
                retestDue
                  ? 'Retest your Pelvic Floor Index'
                  : `Retest available in ${daysRemaining} days`
              }
              className="active:opacity-70"
            >
              <Pill
                label={retestLabel}
                tone={retestDue ? 'accent' : 'surface2'}
                size="md"
              />
            </Pressable>
          }
        />

        <View className="px-4 mt-5">
          {/* Index card — Figma `92:83` (p-20, gap-16, radius 16) */}
          <Card padding="xl" radius="card">
            <SectionLabel tracking="wide">Pelvic Floor Index</SectionLabel>
            <View className="mt-4 flex-row items-end justify-between">
              <View className="flex-row items-end" style={{ gap: 12 }}>
                <Body
                  weight="semibold"
                  color="primary"
                  style={{ fontSize: 56, lineHeight: 60 }}
                >
                  {latest ? Math.round(latest.composite).toString() : '—'}
                </Body>
                {latest ? (
                  <View className="pb-1.5">
                    <Pill
                      label={capitalize(latest.level)}
                      tone="accent"
                      size="sm"
                    />
                  </View>
                ) : null}
              </View>
              {delta !== null ? (
                <View className="pb-1.5">
                  <Pill
                    label={`${delta > 0 ? '+' : ''}${Math.round(delta)}`}
                    tone="surface2"
                    size="sm"
                    textColor={delta >= 0 ? 'success' : 'danger'}
                  />
                </View>
              ) : null}
            </View>
            <Body size="sm" color="muted" className="mt-4">
              {indexHistory.length > 0
                ? `Since last retest. ${indexHistory.length} measurement${indexHistory.length === 1 ? '' : 's'} · bi-weekly cadence.`
                : 'Complete your first index test to start tracking trends.'}
            </Body>
            <View className="mt-4">
              <IndexTrendChart history={indexHistory} />
            </View>
          </Card>

          {/* Streak card — Figma `92:118` (same shell) */}
          <Card padding="xl" radius="card" className="mt-4">
            <SectionLabel tracking="wide">Streak</SectionLabel>
            <View className="mt-4 flex-row items-end justify-between">
              <View className="flex-row items-end" style={{ gap: 8 }}>
                <Body
                  weight="semibold"
                  color="primary"
                  style={{ fontSize: 56, lineHeight: 60 }}
                >
                  {streak.current}
                </Body>
                <Body
                  color="muted"
                  style={{ fontSize: 20, lineHeight: 28 }}
                  className="pb-2"
                >
                  days
                </Body>
              </View>
              <View className="items-end pb-2">
                <Body
                  weight="medium"
                  color="muted"
                  style={{ fontSize: 10, lineHeight: 14, letterSpacing: 1.2 }}
                >
                  BEST
                </Body>
                <Body
                  weight="semibold"
                  color="primary"
                  style={{ fontSize: 15, lineHeight: 22 }}
                >
                  {streak.longest} days
                </Body>
              </View>
            </View>
            <View className="mt-4">
              <StreakHeatmap dates={sessionDates} />
            </View>
          </Card>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
