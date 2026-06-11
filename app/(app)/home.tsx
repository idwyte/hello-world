// Obsidian Kinetic: 10 · Home — Figma node 53:207.
//
// Layout, top → bottom:
//   - HONE wordmark (headlineMd 24/28 SemiBold) + 32px avatar (right)
//   - Today HERO card: lime border 1.5px, TODAY · DAY N OF 56 kicker
//     (primary-fixed-dim lime), 32/36 Bold title, "X min · Y phases"
//     body-md muted, full-width lime Start session button
//   - 2-up stat row:
//       HONE INDEX card (cyan caps kicker) — 40px composite + ▲/▼ delta
//       STREAK card — 40px day count + "days running" muted
//   - THIS WEEK card with right-aligned "N / 7" lime — chunky bars (22px
//     wide, heights scale with intensity), surface-container-high for
//     untrained days
//   - TOMORROW card — TOMORROW · HH:MM kicker, title 24/28, body muted
//
// All data wiring preserved: index/streak/today/sessions/name queries,
// local Zustand fallbacks in dev.
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { useMemo } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '@/components/obsidian';
import { hasSupabaseConfig } from '@/lib/env';
import { EXERCISES } from '@/lib/exercises';
import { color, glass, radius, spacing, type } from '@/lib/obsidian/tokens';
import {
  fetchIndexHistory,
  fetchRecentSessions,
  fetchStreak,
  fetchTodayProgramDay,
  fetchUserDisplayName,
} from '@/lib/sessions';
import { useSessionStore } from '@/stores/session';

const WEEKDAY_LETTERS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

function weekStart(now: Date): Date {
  const d = new Date(now);
  const dow = (d.getDay() + 6) % 7; // Mon=0 … Sun=6
  d.setDate(d.getDate() - dow);
  d.setHours(0, 0, 0, 0);
  return d;
}

function tomorrow8am(): string {
  return '08:00';
}

// Translate one user's initial into the avatar (uppercase letter); falls
// back to the first character of "friend".
function avatarInitial(name: string): string {
  return (name.trim().charAt(0) || 'F').toUpperCase();
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
  const sessionsThisWeek = weekCounts.reduce(
    (a, b) => a + (b > 0 ? 1 : 0),
    0,
  );
  const todayBarIndex = (new Date().getDay() + 6) % 7;

  const history = indexQuery.data ?? [];
  const latestIndex = history.at(-1) ?? null;
  const priorIndex = history.at(-2) ?? null;
  const indexDelta =
    latestIndex && priorIndex
      ? Math.round(latestIndex.composite - priorIndex.composite)
      : null;

  const today = todayQuery.data;
  const todayPhases = today?.exercises ?? [];
  const todayMinutes = today ? Math.round(today.targetDurationS / 60) : 10;
  const todayTitle = today
    ? todayPhases
        .map((s) => EXERCISES[s]?.name ?? s)
        .slice(0, 2)
        .join(' + ') || 'Foundation session'
    : 'Foundation Day 1';
  const dayNumber = today?.dayNumber ?? 1;

  // Bar geometry: Figma uses heights between 12 (untrained, no work) and
  // 38 (a strong day). Untrained renders as a flat surface-container-high
  // 12px chip. Trained scales 28 → 38 with the count.
  function barHeight(count: number): number {
    if (count <= 0) return 12;
    return Math.min(38, 28 + count * 4);
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: color.background }}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          paddingHorizontal: spacing.containerPadding,
          paddingTop: spacing.stackLg,
          paddingBottom: 24,
          gap: spacing.stackMd,
        }}
      >
        {/* HONE wordmark + avatar */}
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <Text style={{ ...type.headlineMd, color: color.onSurface }}>
            HONE
          </Text>
          <View
            style={{
              width: 32,
              height: 32,
              borderRadius: radius.full,
              backgroundColor: color.surfaceContainerHigh,
              alignItems: 'center',
              justifyContent: 'center',
            }}
            accessibilityLabel={`Account · ${userName}`}
          >
            <Text
              style={{
                ...type.labelCaps,
                color: color.onSurface,
                letterSpacing: 0,
              }}
            >
              {avatarInitial(userName)}
            </Text>
          </View>
        </View>

        {/* Today HERO — lime-bordered, Start session embedded */}
        <View
          style={{
            backgroundColor: color.surfaceContainerLow,
            borderColor: color.primaryContainer,
            borderWidth: 1.5,
            borderRadius: radius.xl,
            padding: spacing.containerPadding,
          }}
        >
          <Text
            style={{ ...type.labelCaps, color: color.primaryFixedDim }}
          >
            TODAY · DAY {dayNumber} OF 56
          </Text>
          <Text
            style={{
              ...type.headlineLg,
              color: color.onSurface,
              marginTop: 4,
            }}
          >
            {todayTitle}
          </Text>
          <Text
            style={{
              ...type.bodyMd,
              color: color.onSurfaceVariant,
              marginTop: 2,
            }}
          >
            {todayMinutes} min · {todayPhases.length || 5} phases
          </Text>
          <Button
            label="Start session"
            onPress={() => router.push('/session/today')}
            style={{ marginTop: spacing.stackMd, width: '100%' }}
          />
        </View>

        {/* 2-up stats — Hone Index (cyan) + Streak (muted) */}
        <View style={{ flexDirection: 'row', gap: spacing.gutter }}>
          <StatTile
            kicker="HONE INDEX"
            kickerColor={color.secondaryContainer}
            value={
              latestIndex ? String(Math.round(latestIndex.composite)) : '—'
            }
            valueSuffix={
              indexDelta !== null && indexDelta !== 0
                ? indexDelta > 0
                  ? `▲ ${indexDelta}`
                  : `▼ ${Math.abs(indexDelta)}`
                : undefined
            }
            footer={latestIndex ? 'since last week' : 'no measurement yet'}
          />
          <StatTile
            kicker="STREAK"
            value={String(streak.current)}
            footer="days running"
          />
        </View>

        {/* Weekly bars */}
        <View
          style={{
            backgroundColor: color.surfaceContainerLow,
            borderColor: glass.border,
            borderWidth: glass.borderWidth,
            borderRadius: radius.xl,
            padding: spacing.stackMd,
            gap: spacing.gutter,
          }}
        >
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'flex-start',
              justifyContent: 'space-between',
            }}
          >
            <Text
              style={{ ...type.labelCaps, color: color.onSurfaceVariant }}
            >
              THIS WEEK
            </Text>
            <Text
              style={{ ...type.labelCaps, color: color.primaryFixedDim }}
            >
              {sessionsThisWeek} / 7
            </Text>
          </View>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'flex-end',
              justifyContent: 'space-between',
            }}
          >
            {weekCounts.map((count, i) => {
              const filled = count > 0;
              const isToday = i === todayBarIndex;
              return (
                <View
                  key={i}
                  style={{ alignItems: 'center', gap: 6, flex: 1 }}
                >
                  <View
                    style={{
                      width: 22,
                      height: barHeight(count),
                      borderRadius: 6,
                      backgroundColor: filled
                        ? color.primaryContainer
                        : color.surfaceContainerHigh,
                    }}
                  />
                  <Text
                    style={{
                      ...type.labelCaps,
                      fontSize: 10,
                      letterSpacing: 1,
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
        </View>

        {/* Tomorrow preview */}
        <View
          style={{
            backgroundColor: color.surfaceContainerLow,
            borderColor: glass.border,
            borderWidth: glass.borderWidth,
            borderRadius: radius.xl,
            padding: spacing.stackMd,
          }}
        >
          <Text
            style={{ ...type.labelCaps, color: color.onSurfaceVariant }}
          >
            TOMORROW · {tomorrow8am()}
          </Text>
          <Text
            style={{
              ...type.headlineMd,
              color: color.onSurface,
              marginTop: 4,
            }}
          >
            {todayTitle}
          </Text>
          <Text
            style={{
              ...type.bodyMd,
              color: color.onSurfaceVariant,
              marginTop: 2,
            }}
          >
            Advanced · {todayMinutes + 5} min
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function StatTile({
  kicker,
  kickerColor = color.onSurfaceVariant,
  value,
  valueSuffix,
  footer,
}: {
  kicker: string;
  kickerColor?: string;
  value: string;
  valueSuffix?: string;
  footer: string;
}) {
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: color.surfaceContainerLow,
        borderColor: glass.border,
        borderWidth: glass.borderWidth,
        borderRadius: radius.xl,
        padding: spacing.stackMd,
        gap: 2,
      }}
    >
      <Text style={{ ...type.labelCaps, color: kickerColor }}>{kicker}</Text>
      <View
        style={{
          flexDirection: 'row',
          gap: 6,
          alignItems: 'baseline',
        }}
      >
        <Text style={{ ...type.metricLg, color: color.onSurface }}>
          {value}
        </Text>
        {valueSuffix ? (
          <Text
            style={{
              ...type.bodyMd,
              color: color.primaryFixedDim,
            }}
          >
            {valueSuffix}
          </Text>
        ) : null}
      </View>
      <Text style={{ ...type.bodyMd, color: color.onSurfaceVariant }}>
        {footer}
      </Text>
    </View>
  );
}
