import { useQuery } from '@tanstack/react-query';
import { Link } from 'expo-router';
import { Flame, Play } from 'lucide-react-native';
import { useMemo } from 'react';
import { View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import {
  Body,
  Button,
  Card,
  Heading,
  Pill,
  SectionLabel,
  Stat,
} from '@/components/ui';
import { hasSupabaseConfig } from '@/lib/env';
import { EXERCISES } from '@/lib/exercises';
import {
  fetchIndexHistory,
  fetchRecentSessions,
  fetchStreak,
  fetchTodayProgramDay,
} from '@/lib/sessions';
import { semantic } from '@/lib/theme';
import { useSessionStore } from '@/stores/session';

function greetingFor(now: Date): string {
  const h = now.getHours();
  if (h >= 5 && h < 12) return 'Good morning';
  if (h >= 12 && h < 18) return 'Good afternoon';
  return 'Good evening';
}

function exerciseName(slug: string): string {
  return EXERCISES[slug]?.name ?? slug;
}

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
  const todayQuery = useQuery({
    queryKey: ['program', 'today'],
    enabled: hasSupabaseConfig(),
    queryFn: fetchTodayProgramDay,
  });
  const indexQuery = useQuery({
    queryKey: ['index', 'history'],
    enabled: hasSupabaseConfig(),
    queryFn: () => fetchIndexHistory(12),
  });

  const streak = streakQuery.data ?? {
    current: localStreak.current,
    longest: localStreak.longest,
  };

  const sessionsThisWeek = useMemo(() => {
    const list = sessionsQuery.data ?? localHistory;
    const cutoff = Date.now() - 7 * 86_400_000;
    return list.filter((s) => {
      const end =
        typeof s.endedAt === 'string'
          ? new Date(s.endedAt).getTime()
          : (s.endedAt ?? 0);
      return end >= cutoff;
    }).length;
  }, [sessionsQuery.data, localHistory]);

  const latestIndex = indexQuery.data?.at(-1) ?? null;

  const greeting = greetingFor(new Date());

  const today = todayQuery.data;
  const todayDayNumber = today?.programDayId ? null : null;
  const todayExercises = today?.exercises ?? [];
  const todayMinutes = today ? Math.round(today.targetDurationS / 60) : 5;
  const todayTitle = today
    ? todayExercises.map(exerciseName).slice(0, 2).join(' + ') ||
      'Foundation session'
    : 'Foundation Day 1';

  return (
    <SafeAreaView className="flex-1 bg-surface-canvas">
      <View className="flex-1 px-4 pt-3">
        {/* Header — greeting + streak chip per Figma 08·home `80:847` */}
        <View className="flex-row items-end justify-between h-14 py-1.5">
          <View>
            <Body size="sm" color="muted">
              {greeting},
            </Body>
            <Heading level="heading-sm">
              {/* TODO: read name from auth profile when available */}
              friend
            </Heading>
          </View>
          <Pill
            label={streak.current > 0 ? `${streak.current} days` : 'Start your streak'}
            tone="neutral"
            leadingIcon={
              <Flame
                size={14}
                color={
                  streak.current > 0
                    ? semantic.feedbackDanger
                    : semantic.textMuted
                }
              />
            }
          />
        </View>

        {/* Today's session card — Figma `72:45` */}
        <Card padding="lg" radius="2xl" className="mt-6 gap-5">
          <SectionLabel>
            {todayDayNumber ? `TODAY · DAY ${todayDayNumber}` : 'TODAY'}
          </SectionLabel>
          <Heading level="heading-md">
            {todayTitle} · {todayMinutes} min
          </Heading>
          {todayExercises.length > 0 ? (
            <View className="gap-1.5">
              {todayExercises.map((slug) => (
                <View key={slug} className="flex-row items-center gap-2.5">
                  <View
                    className="w-1 h-1 rounded-full bg-text-muted"
                  />
                  <Body size="sm" color="muted">
                    {exerciseName(slug)}
                  </Body>
                </View>
              ))}
            </View>
          ) : null}
          <Link href="/session/today" asChild>
            <Button
              label="Start session"
              variant="primary"
              size="lg"
              leadingIcon={<Play size={16} color={semantic.textPrimary} fill={semantic.textPrimary} />}
            />
          </Link>
        </Card>

        {/* 2-up stat cards — Figma `72:61` */}
        <View className="flex-row gap-3 mt-4">
          <Stat
            kicker="This week"
            value={`${sessionsThisWeek} / 7`}
            sub={sessionsThisWeek >= 7 ? 'Done' : `${7 - sessionsThisWeek} to go`}
          />
          <Stat
            kicker="Latest index"
            value={
              latestIndex ? Math.round(latestIndex.composite).toString() : '—'
            }
            sub={latestIndex ? latestIndex.level : 'No measurement yet'}
          />
        </View>

        {/* Secondary row: streak history (kept for parity with prior screen) */}
        <View className="flex-row gap-3 mt-3">
          <Stat
            kicker="Streak"
            value={`${streak.current}d`}
            sub={`Longest: ${streak.longest}d`}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}
