// Obsidian Kinetic: Streaks tab. No dedicated Figma frame ("still to
// design") — derived from the system: Hone Index card with the
// five-axis Radar (the retest before/after surface, handoff §4),
// streak card with the weekly-bar pattern from Home, retest CTA.
// All data wiring unchanged.
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AxisRadar, Button, Chip, CountUp } from '@/components/obsidian';
import { hasSupabaseConfig } from '@/lib/env';
import { color, glass, radius, spacing, type } from '@/lib/obsidian/tokens';
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

// Until per-axis history persists (needs schema change — see
// SHIP-CHECKLIST), the radar approximates axes from the two stored
// measures: speed from pulses, stamina from hold, the rest from the
// composite. Replaced by real per-axis rows when migration lands.
function approximateAxes(measure: {
  pulsesIn30s: number;
  maxHoldS: number;
  composite: number;
}): Array<{ label: string; value: number }> {
  const clamp = (v: number) => Math.max(0.06, Math.min(1, v));
  const c = measure.composite / 100;
  return [
    { label: 'STRENGTH', value: clamp(c) },
    { label: 'STAMINA', value: clamp(measure.maxHoldS / 30) },
    { label: 'REPEAT', value: clamp(c * 0.9) },
    { label: 'SPEED', value: clamp(measure.pulsesIn30s / 40) },
    { label: 'CONTROL', value: clamp(c * 1.05) },
  ];
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
  const sessionsThisMonth = (
    sessionsQuery.data?.map((s) => s.endedAt ?? s.startedAt) ??
    local.history
      .filter((h) => h.completed)
      .map((h) => new Date(h.endedAt).toISOString())
  ).filter(
    (d) => Date.now() - new Date(d).getTime() < 30 * 86_400_000,
  ).length;

  const indexHistory = indexQuery.data ?? [];
  const latest = indexHistory.at(-1) ?? null;
  const prev = indexHistory.at(-2) ?? null;
  const delta =
    latest && prev ? Math.round(latest.composite - prev.composite) : null;

  const daysSince = daysSinceLastIndex(indexHistory);
  const daysRemaining =
    daysSince !== null ? Math.max(0, RETEST_INTERVAL_DAYS - daysSince) : 0;
  const retestDue = daysSince === null || daysRemaining === 0;

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
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <Text style={{ ...type.headlineMd, color: color.onSurface }}>
            Streaks
          </Text>
          <Chip
            label={retestDue ? 'RETEST DUE' : `RETEST IN ${daysRemaining}D`}
            variant={retestDue ? 'active' : 'muted'}
          />
        </View>

        {/* Hone Index + radar */}
        <View
          style={{
            backgroundColor: color.surfaceContainerLow,
            borderColor: glass.border,
            borderWidth: glass.borderWidth,
            borderRadius: radius.xl,
            padding: spacing.stackMd,
            gap: spacing.gutter,
            alignItems: 'center',
          }}
        >
          <View
            style={{
              flexDirection: 'row',
              width: '100%',
              alignItems: 'flex-start',
              justifyContent: 'space-between',
            }}
          >
            <Text style={{ ...type.labelCaps, color: color.secondaryContainer }}>
              HONE INDEX
            </Text>
            {latest ? (
              <Text
                style={{ ...type.labelCaps, color: color.onSurfaceVariant }}
              >
                {capitalize(latest.level)}
              </Text>
            ) : null}
          </View>
          <View
            style={{ flexDirection: 'row', alignItems: 'baseline', gap: 8 }}
          >
            {latest ? (
              <CountUp
                value={Math.round(latest.composite)}
                style={{ ...type.metricLg, fontSize: 56, lineHeight: 60, color: color.onSurface }}
              />
            ) : (
              <Text
                style={{
                  ...type.metricLg,
                  fontSize: 56,
                  lineHeight: 60,
                  color: color.onSurface,
                }}
              >
                —
              </Text>
            )}
            {delta !== null && delta !== 0 ? (
              <Text
                style={{
                  ...type.bodyLg,
                  color:
                    delta > 0 ? color.primaryFixedDim : color.onSurfaceVariant,
                }}
              >
                {delta > 0 ? `▲ ${delta}` : `▼ ${Math.abs(delta)}`}
              </Text>
            ) : null}
          </View>
          {/* Radar — before/after when a prior measurement exists. The
              "look what changed" beat (motion spec §3.3). */}
          {latest ? (
            <AxisRadar
              scores={approximateAxes(latest)}
              compare={prev ? approximateAxes(prev) : undefined}
              size={260}
            />
          ) : (
            <Text
              style={{
                ...type.bodyMd,
                color: color.onSurfaceVariant,
                textAlign: 'center',
              }}
            >
              Complete your first assessment to start the trend.
            </Text>
          )}
          {prev ? (
            <Text style={{ ...type.labelCaps, color: color.onSurfaceVariant }}>
              SOLID = NOW · DASHED = LAST RETEST
            </Text>
          ) : null}
        </View>

        {/* Streak card */}
        <View
          style={{
            backgroundColor: color.surfaceContainerLow,
            borderColor: glass.border,
            borderWidth: glass.borderWidth,
            borderRadius: radius.xl,
            padding: spacing.stackMd,
            gap: 4,
          }}
        >
          <Text style={{ ...type.labelCaps, color: color.onSurfaceVariant }}>
            STREAK
          </Text>
          <View
            style={{ flexDirection: 'row', alignItems: 'baseline', gap: 8 }}
          >
            <Text style={{ ...type.metricLg, color: color.onSurface }}>
              {streak.current}
            </Text>
            <Text style={{ ...type.bodyMd, color: color.onSurfaceVariant }}>
              days running · best {streak.longest}
            </Text>
          </View>
          <Text style={{ ...type.bodyMd, color: color.onSurfaceVariant }}>
            {sessionsThisMonth} session{sessionsThisMonth === 1 ? '' : 's'} in
            the last 30 days.
          </Text>
        </View>

        <Button
          label={retestDue ? 'Retest now' : 'Retest early'}
          onPress={() => router.push('/index-retest')}
          style={{ width: '100%' }}
        />
        {!retestDue && (
          <Text
            style={{
              ...type.bodyMd,
              fontSize: 14,
              lineHeight: 20,
              color: color.onSurfaceVariant,
              textAlign: 'center',
            }}
          >
            Retesting early adds noise — {daysRemaining} more day
            {daysRemaining === 1 ? '' : 's'} gives a cleaner trend.
          </Text>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
