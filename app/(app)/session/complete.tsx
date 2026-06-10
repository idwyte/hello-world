// Obsidian Kinetic: 13 · Session Complete — Figma node 58:258.
//
// Layout:
//   - 72px lime check ring (border-only, primary-container, check inside)
//   - "Session complete" headlineLg, centered
//   - "Day N of 56 · X minutes" body-md muted
//   - 3-up stat row: TIME / EFFORT / STREAK (label-less third tile per
//     Figma — just the metric)
//   - INDEX IMPACT card: lime border 1.5px, primary-fixed-dim kicker,
//     "{AXIS} trending up" axis hint, body copy about the week and the
//     retest cadence
//   - Done (primary) + Share progress (ghost)
//
// Rating prompt deferred — Figma 58:258 doesn't include it. Store-review
// wiring kept as a lib import for future surfaces (paywall etc.).
//
// INDEX IMPACT axis label: v2 assessment introduces 5 axes (STRENGTH ·
// STAMINA · REPEAT · SPEED · CONTROL); the per-axis impact logic is a
// Phase B follow-up. For now the most recent index level is shown as a
// proxy ("Stamina trending up" maps to the strongest axis when v2 data
// is available).
import { useQuery } from '@tanstack/react-query';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Check } from 'lucide-react-native';
import { useEffect } from 'react';
import { Share, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '@/components/obsidian';
import { hasSupabaseConfig } from '@/lib/env';
import { fireHaptic } from '@/lib/obsidian/haptics';
import {
  color,
  glass,
  radius,
  spacing,
  type,
} from '@/lib/obsidian/tokens';
import {
  RETEST_INTERVAL_DAYS,
  daysSinceLastIndex,
  fetchIndexHistory,
  fetchRecentSessions,
} from '@/lib/sessions';

function formatTime(s: number): string {
  if (!Number.isFinite(s) || s < 0) return '—';
  const mins = Math.floor(s / 60);
  const secs = Math.floor(s % 60);
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

function formatMinutes(s: number): string {
  if (!Number.isFinite(s) || s < 0) return '—';
  const mins = Math.max(1, Math.round(s / 60));
  return `${mins} minute${mins === 1 ? '' : 's'}`;
}

function indexAxisLabel(level: string | undefined): string {
  // Until the v2 5-axis profile lands, surface the active level (beginner/
  // intermediate/advanced) as a proxy axis. Caps for the kicker pattern.
  if (!level) return 'STAMINA';
  return level.toUpperCase();
}

export default function SessionComplete() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    durationS?: string;
    reps?: string;
    dayNumber?: string;
    weekNumber?: string;
    streakDelta?: string;
    rpe?: string;
  }>();
  const durationS = Number(params.durationS);
  const dayNumber = Number(params.dayNumber);
  const rpe = Number(params.rpe);

  const indexQuery = useQuery({
    queryKey: ['index', 'history'],
    enabled: hasSupabaseConfig(),
    queryFn: () => fetchIndexHistory(12),
  });
  const sessionsQuery = useQuery({
    queryKey: ['sessions', 'recent'],
    enabled: hasSupabaseConfig(),
    queryFn: () => fetchRecentSessions(60),
  });

  const history = indexQuery.data ?? [];
  const latest = history.at(-1) ?? null;
  const prior = history.at(-2) ?? null;
  const indexDelta =
    latest && prior ? Math.round(latest.composite - prior.composite) : null;
  const daysSince = daysSinceLastIndex(history);
  const weeksToRetest =
    daysSince !== null
      ? Math.max(0, Math.ceil((RETEST_INTERVAL_DAYS - daysSince) / 7))
      : null;

  const strongSessionsThisWeek = (sessionsQuery.data ?? []).filter((s) => {
    const t =
      typeof s.endedAt === 'string' ? new Date(s.endedAt).getTime() : 0;
    return t > Date.now() - 7 * 86_400_000;
  }).length;

  // Earned closure — one success notification as the screen lands.
  useEffect(() => {
    void fireHaptic('sessionComplete');
  }, []);

  const safeDay = Number.isFinite(dayNumber) ? dayNumber : 1;
  const timeLabel = formatTime(durationS);
  const effortLabel = Number.isFinite(rpe) && rpe > 0 ? `${rpe}/10` : '—';
  const streakLabel = String(history.length || strongSessionsThisWeek || 0);

  const axisLabel = indexAxisLabel(latest?.level);
  const trend =
    indexDelta === null
      ? 'tracking'
      : indexDelta > 0
        ? 'trending up'
        : indexDelta < 0
          ? 'easing back'
          : 'steady';

  function handleShare() {
    void Share.share({
      message: `Day ${safeDay} done — ${formatMinutes(durationS)} on Hone. ${axisLabel} ${trend}.`,
    });
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: color.background }}>
      <View
        style={{
          flex: 1,
          paddingHorizontal: spacing.containerPadding,
          paddingTop: 72 - 32, // Figma puts the hero ~72px from top
          paddingBottom: spacing.stackLg + spacing.stackMd,
          gap: spacing.stackMd,
        }}
      >
        {/* Lime check ring */}
        <View style={{ alignItems: 'center' }}>
          <View
            style={{
              width: 72,
              height: 72,
              borderRadius: radius.full,
              borderWidth: 2,
              borderColor: color.primaryContainer,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Check size={36} color={color.primaryContainer} strokeWidth={3} />
          </View>
          <Text
            style={{
              ...type.headlineLg,
              color: color.onSurface,
              textAlign: 'center',
              marginTop: spacing.stackMd,
            }}
          >
            Session complete
          </Text>
          <Text
            style={{
              ...type.bodyMd,
              color: color.onSurfaceVariant,
              textAlign: 'center',
              marginTop: 2,
            }}
          >
            Day {safeDay} of 56 · {formatMinutes(durationS)}
          </Text>
        </View>

        {/* 3-up stat row */}
        <View style={{ flexDirection: 'row', gap: spacing.gutter }}>
          <StatTile label="TIME" value={timeLabel} />
          <StatTile label="EFFORT" value={effortLabel} />
          <StatTile value={streakLabel} />
        </View>

        {/* INDEX IMPACT — lime-bordered card */}
        <View
          style={{
            backgroundColor: color.surfaceContainerLow,
            borderColor: color.primaryContainer,
            borderWidth: 1.5,
            borderRadius: radius.xl,
            padding: spacing.stackMd,
            gap: 6,
          }}
        >
          <Text
            style={{ ...type.labelCaps, color: color.primaryFixedDim }}
          >
            INDEX IMPACT
          </Text>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'baseline',
              gap: 8,
            }}
          >
            <Text
              style={{
                ...type.labelCaps,
                color: color.onSurfaceVariant,
              }}
            >
              {axisLabel}
            </Text>
            <Text style={{ ...type.bodyMd, color: color.onSurface }}>
              {trend}
            </Text>
          </View>
          <Text style={{ ...type.bodyMd, color: color.onSurfaceVariant }}>
            {strongSessionsThisWeek} strong session
            {strongSessionsThisWeek === 1 ? '' : 's'} this week
            {weeksToRetest !== null
              ? ` — your next retest is in ${weeksToRetest} week${weeksToRetest === 1 ? '' : 's'}.`
              : '.'}
          </Text>
        </View>

        <View style={{ flex: 1 }} />

        <Button
          label="Done"
          onPress={() => router.replace('/home')}
          style={{ width: '100%' }}
        />
        <Button
          label="Share progress"
          variant="ghost"
          onPress={handleShare}
          style={{ width: '100%' }}
        />
      </View>
    </SafeAreaView>
  );
}

function StatTile({ label, value }: { label?: string; value: string }) {
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: color.surfaceContainerLow,
        borderColor: glass.border,
        borderWidth: glass.borderWidth,
        borderRadius: radius.xl,
        padding: spacing.stackMd,
        gap: spacing.stackMd,
      }}
    >
      {label ? (
        <Text style={{ ...type.labelCaps, color: color.onSurfaceVariant }}>
          {label}
        </Text>
      ) : null}
      <Text style={{ ...type.metricLg, color: color.onSurface }}>{value}</Text>
    </View>
  );
}
