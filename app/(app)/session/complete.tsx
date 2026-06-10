// Obsidian Kinetic: 13 · Session Complete (handoff §4 Phase A).
// Success hero + DURATION/REPS/STREAK glass stats + the post-session
// Index-impact card (ambient measurement: the Hone Index surfaced at
// the moment of payoff) + rating prompt + Done.
//
// Wiring (unchanged): params from player→RPE→here; user display name
// from auth metadata; expo-store-review for the 4+ star path;
// notificationSuccess haptic on mount = "earned closure" (spec §2).
import { useQuery } from '@tanstack/react-query';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as StoreReview from 'expo-store-review';
import { Check } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button, Card } from '@/components/obsidian';
import { hasSupabaseConfig } from '@/lib/env';
import { fireHaptic } from '@/lib/obsidian/haptics';
import { color, glass, radius, spacing, type } from '@/lib/obsidian/tokens';
import {
  RETEST_INTERVAL_DAYS,
  daysSinceLastIndex,
  fetchIndexHistory,
  fetchUserDisplayName,
} from '@/lib/sessions';

function formatDuration(s: number): string {
  if (!Number.isFinite(s) || s < 0) return '—';
  const mins = Math.floor(s / 60);
  const secs = Math.floor(s % 60);
  return `${mins}:${String(secs).padStart(2, '0')}`;
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
  const reps = Number(params.reps);
  const dayNumber = Number(params.dayNumber);
  const weekNumber = Number(params.weekNumber);
  // Default streak delta = +1 (session completed extends today's streak).
  const streakDelta = Number(params.streakDelta ?? '1');

  const nameQuery = useQuery({
    queryKey: ['user', 'name'],
    enabled: hasSupabaseConfig(),
    queryFn: fetchUserDisplayName,
  });
  const userName = nameQuery.data || 'friend';

  const indexQuery = useQuery({
    queryKey: ['index', 'history'],
    enabled: hasSupabaseConfig(),
    queryFn: () => fetchIndexHistory(12),
  });
  const history = indexQuery.data ?? [];
  const latest = history.at(-1) ?? null;
  const prior = history.at(-2) ?? null;
  const indexDelta =
    latest && prior ? Math.round(latest.composite - prior.composite) : null;
  const daysSince = daysSinceLastIndex(history);
  const retestDue = daysSince !== null && daysSince >= RETEST_INTERVAL_DAYS;

  // Earned closure — one success notification as the screen lands.
  useEffect(() => {
    void fireHaptic('sessionComplete');
  }, []);

  const subhead =
    Number.isFinite(dayNumber) && Number.isFinite(weekNumber)
      ? `Day ${dayNumber} of Week ${weekNumber} · complete.`
      : 'Session complete.';

  const durationLabel = formatDuration(durationS);
  const repsLabel = Number.isFinite(reps) && reps > 0 ? reps.toString() : '—';
  const streakLabel =
    streakDelta > 0
      ? `+${streakDelta}`
      : streakDelta === 0
        ? '—'
        : streakDelta.toString();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: color.background }}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          paddingHorizontal: spacing.containerPadding,
          paddingBottom: 120,
        }}
      >
        {/* Hero — lime success disc + halo (glow = the one live element) */}
        <View style={{ alignItems: 'center', marginTop: spacing.stackLg * 2 }}>
          <View
            style={{
              width: 120,
              height: 120,
              borderRadius: radius.full,
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: 'rgba(195, 244, 0, 0.18)',
            }}
          >
            <View
              style={{
                width: 96,
                height: 96,
                borderRadius: radius.full,
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: color.primaryContainer,
              }}
            >
              <Check size={48} color={color.onPrimaryFixed} strokeWidth={3} />
            </View>
          </View>
          <Text
            style={{
              ...type.headlineLg,
              color: color.onSurface,
              marginTop: spacing.stackLg,
              textAlign: 'center',
            }}
          >
            Nice work, {userName}
          </Text>
          <Text
            style={{
              ...type.bodyMd,
              color: color.onSurfaceVariant,
              marginTop: spacing.stackSm,
              textAlign: 'center',
            }}
          >
            {subhead}
          </Text>
        </View>

        {/* 3-up glass stats */}
        <View
          style={{
            flexDirection: 'row',
            gap: spacing.gutter,
            marginTop: spacing.stackLg + spacing.stackSm,
          }}
        >
          <Card label="Duration" value={durationLabel} compact style={{ flex: 1 }} />
          <Card label="Reps" value={repsLabel} compact style={{ flex: 1 }} />
          <Card label="Streak" value={streakLabel} compact style={{ flex: 1 }} />
        </View>

        {/* Post-session Index-impact card — ambient measurement. Shown
            only when there's at least one real measurement. */}
        {latest && (
          <Card label="Hone Index" style={{ marginTop: spacing.gutter }}>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'flex-end',
                justifyContent: 'space-between',
                marginTop: spacing.stackSm,
              }}
            >
              <Text style={{ ...type.metricLg, color: color.onSurface }}>
                {Math.round(latest.composite)}
              </Text>
              {indexDelta !== null && (
                <Text
                  style={{
                    ...type.labelCaps,
                    color:
                      indexDelta >= 0
                        ? color.primaryContainer
                        : color.onSurfaceVariant,
                    paddingBottom: 6,
                  }}
                >
                  {indexDelta >= 0 ? `▲ +${indexDelta}` : `▼ ${indexDelta}`}
                </Text>
              )}
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
              {retestDue
                ? 'Retest due — two minutes refreshes your trend.'
                : daysSince !== null
                  ? `Next retest in ${Math.max(0, RETEST_INTERVAL_DAYS - daysSince)} days. Consistent sessions move this number.`
                  : 'Consistent sessions move this number.'}
            </Text>
          </Card>
        )}

        <View style={{ alignItems: 'center', marginTop: spacing.stackLg }}>
          <RatingPrompt />
        </View>
      </ScrollView>

      <View
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: 0,
          paddingHorizontal: spacing.containerPadding,
          paddingBottom: spacing.stackLg + spacing.stackSm,
        }}
      >
        <Button label="Done" onPress={() => router.replace('/home')} />
      </View>
    </SafeAreaView>
  );
}

// Rating widget — value 0 = awaiting tap; 1-3 = thanks; 4-5 = store
// review CTA via expo-store-review (SKStoreReviewController on iOS,
// Play in-app review on Android; both throttle silently).
function RatingPrompt() {
  const [value, setValue] = useState(0);
  const isSubmitted = value > 0;
  const isHighRating = value >= 4;

  const headline = !isSubmitted
    ? 'How was your session?'
    : isHighRating
      ? 'Glad it landed.'
      : 'Thanks for the feedback.';
  const body = !isSubmitted
    ? 'Tap a star to rate. It helps us tune the program.'
    : isHighRating
      ? 'Would you mind rating Hone on the App Store? Takes 10 seconds.'
      : 'We’ll keep tuning the program from your retest data.';

  return (
    <View
      style={{
        width: '100%',
        alignItems: 'center',
        backgroundColor: glass.fill,
        borderColor: glass.border,
        borderWidth: glass.borderWidth,
        borderRadius: radius.xl,
        paddingVertical: 28,
        paddingHorizontal: spacing.stackLg,
      }}
    >
      <Text
        style={{
          ...type.headlineMd,
          fontSize: 18,
          lineHeight: 26,
          color: color.onSurface,
          textAlign: 'center',
        }}
      >
        {headline}
      </Text>
      <Text
        style={{
          ...type.bodyMd,
          fontSize: 14,
          lineHeight: 20,
          color: color.onSurfaceVariant,
          marginTop: spacing.stackSm,
          textAlign: 'center',
        }}
      >
        {body}
      </Text>

      {/* 5 stars — interactive even after submit so users can change */}
      <View
        style={{
          flexDirection: 'row',
          marginTop: spacing.stackLg,
          gap: spacing.stackSm,
        }}
      >
        {[1, 2, 3, 4, 5].map((n) => (
          <Pressable
            key={n}
            onPress={() => setValue(n)}
            hitSlop={6}
            accessibilityRole="button"
            accessibilityLabel={`${n} star${n === 1 ? '' : 's'}`}
            accessibilityState={{ selected: n <= value }}
          >
            <Text
              style={{
                fontSize: 28,
                lineHeight: 32,
                color:
                  n <= value ? color.primaryContainer : color.outlineVariant,
              }}
            >
              {n <= value ? '★' : '☆'}
            </Text>
          </Pressable>
        ))}
      </View>

      {isHighRating ? (
        <Button
          label="Rate on the App Store"
          onPress={() => {
            void (async () => {
              try {
                if (await StoreReview.isAvailableAsync()) {
                  await StoreReview.requestReview();
                }
              } catch {
                // Native sheet unavailable — silent no-op.
              }
            })();
          }}
          style={{ marginTop: spacing.stackLg, alignSelf: 'stretch' }}
        />
      ) : null}
    </View>
  );
}
