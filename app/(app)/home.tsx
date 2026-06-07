import { useQuery } from '@tanstack/react-query';
import { Link } from 'expo-router';
import { Droplet, Play } from 'lucide-react-native';
import { useMemo } from 'react';
import { View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import {
  Body,
  Button,
  Card,
  Pill,
  ScreenHeader,
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
  fetchUserDisplayName,
} from '@/lib/sessions';
import { semantic } from '@/lib/theme';
import { useSessionStore } from '@/stores/session';

function greetingFor(now: Date): string {
  const h = now.getHours();
  if (h >= 5 && h < 12) return 'Good morning';
  if (h >= 12 && h < 18) return 'Good afternoon';
  return 'Good evening';
}

function exerciseLabel(slug: string): string {
  const ex = EXERCISES[slug];
  if (!ex) return slug;
  // For hold-dominant exercises, surface the hold duration in seconds
  // rather than rep count — matches the Figma pattern "Long Holds · 2 × 30 s"
  // / "Quick Flicks · 2 × 10 reps".
  const holdPhase = ex.phases.find((p) => p.kind === 'hold');
  if (holdPhase) {
    const seconds = Math.round(holdPhase.durationMs / 1000);
    return `${ex.name} · ${ex.sets} × ${seconds} s`;
  }
  return `${ex.name} · ${ex.sets} × ${ex.reps} reps`;
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
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
  const nameQuery = useQuery({
    queryKey: ['user', 'name'],
    enabled: hasSupabaseConfig(),
    queryFn: fetchUserDisplayName,
  });
  const userName = nameQuery.data || 'friend';

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
  const todayExercises = today?.exercises ?? [];
  const todayMinutes = today ? Math.round(today.targetDurationS / 60) : 5;
  const todayTitle = today
    ? todayExercises.map((s) => EXERCISES[s]?.name ?? s).slice(0, 2).join(' + ') ||
      'Foundation session'
    : 'Foundation Day 1';

  const hasStreak = streak.current > 0;
  const streakIconColor = hasStreak
    ? semantic.interactivePrimary
    : semantic.textMuted;

  return (
    <SafeAreaView className="flex-1 bg-surface-canvas">
      <View className="flex-1 px-4">
        {/* Figma 08·home `80:847` — h-14 greeting + streak chip */}
        <ScreenHeader
          kind="greeting"
          greeting={`${greeting},`}
          name={userName}
          trailing={
            <Pill
              label={hasStreak ? `${streak.current} days` : 'Start your streak'}
              tone="surface"
              size="md"
              bordered
              leadingIcon={
                <Droplet
                  size={14}
                  color={streakIconColor}
                  fill={hasStreak ? streakIconColor : 'transparent'}
                />
              }
            />
          }
        />

        {/* Hero session card — Figma `72:45` (radius 20, p-24, gap-20) */}
        <Card padding="lg" radius="card-hero" className="mt-6">
          <SectionLabel tracking="wide">
            {today ? `TODAY · DAY ${today.dayNumber}` : 'TODAY'}
          </SectionLabel>
          <Body
            weight="semibold"
            color="primary"
            className="mt-5"
            style={{ fontSize: 24, lineHeight: 32 }}
          >
            {todayTitle} · {todayMinutes} min
          </Body>
          {todayExercises.length > 0 ? (
            <View className="mt-5">
              {todayExercises.map((slug, i) => (
                <View
                  key={slug}
                  className={`flex-row items-center ${i > 0 ? 'mt-1.5' : ''}`}
                >
                  <View className="w-1 h-1 rounded-full bg-text-muted mr-2.5" />
                  <Body size="sm" color="muted">
                    {exerciseLabel(slug)}
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
              radius="cta"
              className={`self-center w-[294px] ${todayExercises.length > 0 ? 'mt-5' : 'mt-8'}`}
              leadingIcon={
                <Play
                  size={14}
                  color={semantic.textPrimary}
                  fill={semantic.textPrimary}
                />
              }
            />
          </Link>
        </Card>

        {/* 2-up stat cards — Figma `72:61` (w-173 each, gap-12) */}
        <View className="flex-row gap-3 mt-4">
          <Stat
            kicker="THIS WEEK"
            value={`${sessionsThisWeek} / 7`}
            sub={sessionsThisWeek >= 7 ? 'Done' : `${7 - sessionsThisWeek} to go`}
          />
          <Stat
            kicker="LATEST INDEX"
            value={
              latestIndex ? Math.round(latestIndex.composite).toString() : '—'
            }
            sub={
              latestIndex ? capitalize(latestIndex.level) : 'No measurement yet'
            }
          />
        </View>
      </View>
    </SafeAreaView>
  );
}
