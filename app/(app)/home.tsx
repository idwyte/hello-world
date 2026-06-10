// Obsidian Kinetic: 10 · Home (handoff §4 Phase A).
// The ambient-measurement screen: Hone Index + trend lives here daily —
// the brand promise kept visible — plus streak chip, today's session
// card, and the weekly bars.
//
// Data wiring unchanged: streak / recent sessions / today's program day /
// index history / display name queries, local Zustand fallbacks in dev.
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { Droplet } from 'lucide-react-native';
import { useMemo } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button, Card, Chip } from '@/components/obsidian';
import { hasSupabaseConfig } from '@/lib/env';
import { EXERCISES } from '@/lib/exercises';
import { color, radius, spacing, type } from '@/lib/obsidian/tokens';
import {
  RETEST_INTERVAL_DAYS,
  daysSinceLastIndex,
  fetchIndexHistory,
  fetchRecentSessions,
  fetchStreak,
  fetchTodayProgramDay,
  fetchUserDisplayName,
} from '@/lib/sessions';
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

const WEEKDAY_LETTERS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

/** Monday-anchored start of the current week. */
function weekStart(now: Date): Date {
  const d = new Date(now);
  const dow = (d.getDay() + 6) % 7; // Mon=0 … Sun=6
  d.setDate(d.getDate() - dow);
  d.setHours(0, 0, 0, 0);
  return d;
}

export default function Home() {
  const router = useRouter();
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

  // End timestamps (ms) for every completed session — shared by the
  // weekly-bars + this-week count.
  const sessionEnds = useMemo(() => {
    const list = sessionsQuery.data ?? localHistory;
    return list
      .map((s) =>
        typeof s.endedAt === 'string'
          ? new Date(s.endedAt).getTime()
          : (s.endedAt ?? 0),
      )
      .filter((t) => t > 0);
  }, [sessionsQuery.data, localHistory]);

  // Sessions per weekday (Mon..Sun) of the CURRENT week.
  const weekCounts = useMemo(() => {
    const start = weekStart(new Date()).getTime();
    const counts = [0, 0, 0, 0, 0, 0, 0];
    for (const t of sessionEnds) {
      if (t < start) continue;
      const idx = Math.min(6, Math.floor((t - start) / 86_400_000));
      counts[idx] += 1;
    }
    return counts;
  }, [sessionEnds]);
  const sessionsThisWeek = weekCounts.reduce((a, b) => a + (b > 0 ? 1 : 0), 0);
  const todayBarIndex = (new Date().getDay() + 6) % 7;

  const history = indexQuery.data ?? [];
  const latestIndex = history.at(-1) ?? null;
  const priorIndex = history.at(-2) ?? null;
  const indexDelta =
    latestIndex && priorIndex
      ? Math.round(latestIndex.composite - priorIndex.composite)
      : null;
  const daysSince = daysSinceLastIndex(history);
  const retestDue = daysSince !== null && daysSince >= RETEST_INTERVAL_DAYS;

  const greeting = greetingFor(new Date());
  const today = todayQuery.data;
  const todayExercises = today?.exercises ?? [];
  const todayMinutes = today ? Math.round(today.targetDurationS / 60) : 5;
  const todayTitle = today
    ? todayExercises
        .map((s) => EXERCISES[s]?.name ?? s)
        .slice(0, 2)
        .join(' + ') || 'Foundation session'
    : 'Foundation Day 1';

  const hasStreak = streak.current > 0;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: color.background }}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          paddingHorizontal: spacing.containerPadding,
          paddingBottom: spacing.stackLg * 2,
        }}
      >
        {/* Greeting + streak chip */}
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'flex-end',
            justifyContent: 'space-between',
            marginTop: spacing.stackMd,
          }}
        >
          <View>
            <Text style={{ ...type.labelCaps, color: color.onSurfaceVariant }}>
              {greeting}
            </Text>
            <Text
              style={{
                ...type.headlineLg,
                color: color.onSurface,
                marginTop: 2,
              }}
            >
              {userName}
            </Text>
          </View>
          <Chip
            label={hasStreak ? `${streak.current} days` : 'Start streak'}
            variant={hasStreak ? 'active' : 'muted'}
            leading={
              <Droplet
                size={12}
                color={
                  hasStreak ? color.primaryContainer : color.onSurfaceVariant
                }
                fill={hasStreak ? color.primaryContainer : 'transparent'}
              />
            }
          />
        </View>

        {/* Ambient measurement — the Hone Index, visible daily */}
        <Card label="Hone Index" style={{ marginTop: spacing.stackLg }}>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'flex-end',
              justifyContent: 'space-between',
              marginTop: spacing.stackSm,
            }}
          >
            <Text style={{ ...type.metricLg, color: color.onSurface }}>
              {latestIndex ? String(Math.round(latestIndex.composite)) : '—'}
            </Text>
            {indexDelta !== null ? (
              <Text
                style={{
                  ...type.labelCaps,
                  color:
                    indexDelta >= 0
                      ? color.primaryContainer
                      : color.onSurfaceVariant,
                  paddingBottom: 4,
                }}
              >
                {indexDelta >= 0 ? `▲ +${indexDelta}` : `▼ ${indexDelta}`}
              </Text>
            ) : null}
          </View>
          <Text
            style={{
              ...type.bodyMd,
              fontSize: 14,
              lineHeight: 20,
              color: color.onSurfaceVariant,
              marginTop: spacing.stackSm,
            }}
          >
            {latestIndex
              ? retestDue
                ? `${capitalize(latestIndex.level)} · retest due`
                : `${capitalize(latestIndex.level)} · next retest in ${Math.max(0, RETEST_INTERVAL_DAYS - (daysSince ?? 0))} days`
              : 'No measurement yet — your baseline starts the trend.'}
          </Text>
        </Card>

        {/* Today's session */}
        <Card
          label={today ? `Today · Day ${today.dayNumber}` : 'Today'}
          style={{ marginTop: spacing.gutter }}
        >
          <Text
            style={{
              ...type.headlineMd,
              color: color.onSurface,
              marginTop: spacing.stackSm,
            }}
          >
            {todayTitle} · {todayMinutes} min
          </Text>
          {todayExercises.length > 0 ? (
            <View style={{ marginTop: spacing.stackMd, gap: 6 }}>
              {todayExercises.map((slug) => (
                <View
                  key={slug}
                  style={{ flexDirection: 'row', alignItems: 'center' }}
                >
                  <View
                    style={{
                      width: 4,
                      height: 4,
                      borderRadius: radius.full,
                      backgroundColor: color.outline,
                      marginRight: 10,
                    }}
                  />
                  <Text
                    style={{
                      ...type.bodyMd,
                      fontSize: 14,
                      lineHeight: 20,
                      color: color.onSurfaceVariant,
                    }}
                  >
                    {exerciseLabel(slug)}
                  </Text>
                </View>
              ))}
            </View>
          ) : null}
          <Button
            label="Start session"
            onPress={() => router.push('/session/today')}
            style={{ marginTop: spacing.stackLg }}
          />
        </Card>

        {/* Weekly bars */}
        <Card label="This week" style={{ marginTop: spacing.gutter }}>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'flex-end',
              justifyContent: 'space-between',
              marginTop: spacing.stackMd,
            }}
          >
            {weekCounts.map((count, i) => {
              const filled = count > 0;
              const isToday = i === todayBarIndex;
              const barHeight = 12 + Math.min(count, 3) * 12;
              return (
                <View key={i} style={{ alignItems: 'center', gap: 6, flex: 1 }}>
                  <View
                    style={{
                      width: 10,
                      height: filled ? barHeight : 12,
                      borderRadius: radius.full,
                      backgroundColor: filled
                        ? color.primaryContainer
                        : color.outlineVariant,
                      opacity: filled || isToday ? 1 : 0.6,
                    }}
                  />
                  <Text
                    style={{
                      ...type.labelCaps,
                      fontSize: 10,
                      lineHeight: 14,
                      color: isToday
                        ? color.onSurface
                        : color.onSurfaceVariant,
                    }}
                  >
                    {WEEKDAY_LETTERS[i]}
                  </Text>
                </View>
              );
            })}
          </View>
          <Text
            style={{
              ...type.labelCaps,
              color: color.onSurfaceVariant,
              marginTop: spacing.stackMd,
            }}
          >
            {sessionsThisWeek} / 7 days trained
          </Text>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}
