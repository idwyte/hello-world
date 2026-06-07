// Figma: 14 · session/complete — node 100:273
// https://www.figma.com/design/qgY3Qcf7gP7w5V5A6uQTL4/?node-id=100-273
//
// Post-session celebration: success badge + name greeting + 3-up stats
// (DURATION / REPS / STREAK) + RatingPrompt + Done CTA.
//
// Entry params (from /session/player onComplete):
//   durationS  — total elapsed seconds for the session
//   reps       — total reps completed
//   dayNumber  — 1-indexed day within the 8-week program (1-56)
//   weekNumber — 1-8
//
// FIGMA-DIFF (remaining):
//   - 4+ star App Store rating CTA is not wired to native review
//     (handled in Batch C — expo-store-review). 1-3 stars currently
//     just swaps the headline to "Thanks for the feedback".
//   - Streak delta is read from params verbatim — caller (player.tsx)
//     computes the change.
import { useQuery } from '@tanstack/react-query';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as StoreReview from 'expo-store-review';
import { Check } from 'lucide-react-native';
import { useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Body, Button, Card, SectionLabel } from '@/components/ui';
import { hasSupabaseConfig } from '@/lib/env';
import { fetchUserDisplayName } from '@/lib/sessions';
import { semantic } from '@/lib/theme';

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
  }>();
  const durationS = Number(params.durationS);
  const reps = Number(params.reps);
  const dayNumber = Number(params.dayNumber);
  const weekNumber = Number(params.weekNumber);
  // Default streak delta = +1 (session completed extends today's streak).
  const streakDelta = Number(params.streakDelta ?? '1');

  const subhead = Number.isFinite(dayNumber) && Number.isFinite(weekNumber)
    ? `Day ${dayNumber} of Week ${weekNumber} · complete.`
    : 'Session complete.';

  const nameQuery = useQuery({
    queryKey: ['user', 'name'],
    enabled: hasSupabaseConfig(),
    queryFn: fetchUserDisplayName,
  });
  const userName = nameQuery.data || 'friend';

  const durationLabel = formatDuration(durationS);
  const repsLabel = Number.isFinite(reps) && reps > 0 ? reps.toString() : '—';
  const streakLabel = streakDelta > 0 ? `+${streakDelta}` : streakDelta === 0 ? '—' : streakDelta.toString();
  const streakIsPositive = streakDelta > 0;

  return (
    <SafeAreaView className="flex-1 bg-surface-canvas">
      <ScrollView className="flex-1" contentContainerClassName="px-4 pb-12">
        {/* Hero — 96 × 96 success-green check + 120 × 120 halo + greeting */}
        <View className="items-center mt-16">
          {/* Halo: 120×120 success-tinted disc behind the check */}
          <View
            className="w-[120px] h-[120px] rounded-full items-center justify-center"
            style={{ backgroundColor: semantic.feedbackSuccess + '40' /* ~25% */ }}
          >
            {/* Badge: 96×96 success-green disc with lucide Check */}
            <View
              className="w-24 h-24 rounded-full items-center justify-center"
              style={{ backgroundColor: semantic.feedbackSuccess }}
            >
              <Check
                size={48}
                color={semantic.textPrimary}
                strokeWidth={3}
              />
            </View>
          </View>
          <Body
            weight="semibold"
            color="primary"
            className="mt-5 text-center"
            style={{ fontSize: 26, lineHeight: 32 }}
          >
            Nice work, {userName}
          </Body>
          <Body
            color="muted"
            className="mt-2 text-center"
            style={{ fontSize: 15, lineHeight: 22 }}
          >
            {subhead}
          </Body>
        </View>

        {/* 3-up stats — Figma `100:250` (gap-10, p-14, rounded-14) */}
        <View className="flex-row mt-10" style={{ gap: 10 }}>
          <StatTile kicker="DURATION" value={durationLabel} />
          <StatTile kicker="REPS" value={repsLabel} />
          <StatTile
            kicker="STREAK"
            value={streakLabel}
            valueColor={streakIsPositive ? 'success' : 'primary'}
          />
        </View>

        {/* RatingPrompt — Figma `55:765` (320×auto, surface + border, radius 20) */}
        <View className="items-center mt-8">
          <RatingPrompt />
        </View>
      </ScrollView>

      {/* Done CTA — accent, w-342, h-56, rounded-14 */}
      <View className="absolute bottom-0 left-0 right-0 px-6 pb-8">
        <Button
          label="Done"
          variant="primary"
          size="lg"
          radius="cta"
          onPress={() => router.replace('/home')}
        />
      </View>
    </SafeAreaView>
  );
}

function StatTile({
  kicker,
  value,
  valueColor = 'primary',
}: {
  kicker: string;
  value: string;
  valueColor?: 'primary' | 'success';
}) {
  return (
    <Card padding="sm" radius="card-tight" className="flex-1 items-center">
      <SectionLabel tracking="tight">{kicker}</SectionLabel>
      <Body
        weight="semibold"
        color={valueColor}
        className="mt-1"
        style={{ fontSize: 22, lineHeight: 28 }}
      >
        {value}
      </Body>
    </Card>
  );
}

// Rating widget — value 0 = awaiting tap; 1-3 = thanks; 4-5 = App Store
// CTA. Full state machine per Figma `55:765` notes.
function RatingPrompt() {
  const [value, setValue] = useState(0);
  const isSubmitted = value > 0;
  const isHighRating = value >= 4;

  return (
    <Card
      padding="lg"
      radius="card-hero"
      bordered
      className="w-[320px] items-center"
      style={{ paddingVertical: 28 }}
    >
      {!isSubmitted ? (
        <>
          <Body
            weight="semibold"
            color="primary"
            className="text-center"
            style={{ fontSize: 18, lineHeight: 26 }}
          >
            How was your session?
          </Body>
          <Body
            color="muted"
            className="mt-2 text-center"
            style={{ fontSize: 14, lineHeight: 20 }}
          >
            Tap a star to rate. It helps us tune the program.
          </Body>
        </>
      ) : isHighRating ? (
        <>
          <Body
            weight="semibold"
            color="primary"
            className="text-center"
            style={{ fontSize: 18, lineHeight: 26 }}
          >
            Glad it landed.
          </Body>
          <Body
            color="muted"
            className="mt-2 text-center"
            style={{ fontSize: 14, lineHeight: 20 }}
          >
            Would you mind rating Hone on the App Store? Takes 10 seconds.
          </Body>
        </>
      ) : (
        <>
          <Body
            weight="semibold"
            color="primary"
            className="text-center"
            style={{ fontSize: 18, lineHeight: 26 }}
          >
            Thanks for the feedback.
          </Body>
          <Body
            color="muted"
            className="mt-2 text-center"
            style={{ fontSize: 14, lineHeight: 20 }}
          >
            We&rsquo;ll keep tuning the program from your retest data.
          </Body>
        </>
      )}

      {/* 5 stars — interactive even after submit so users can change */}
      <View className="flex-row mt-6 gap-2">
        {[1, 2, 3, 4, 5].map((n) => (
          <Pressable
            key={n}
            onPress={() => setValue(n)}
            hitSlop={6}
            accessibilityRole="button"
            accessibilityLabel={`${n} star${n === 1 ? '' : 's'}`}
            accessibilityState={{ selected: n <= value }}
          >
            <Body
              style={{
                fontSize: 28,
                lineHeight: 32,
                color:
                  n <= value
                    ? semantic.interactivePrimary
                    : semantic.borderDefault,
              }}
            >
              {n <= value ? '★' : '☆'}
            </Body>
          </Pressable>
        ))}
      </View>

      {isHighRating ? (
        <Button
          // Cross-platform: expo-store-review opens the App Store rating
          // sheet on iOS (SKStoreReviewController) and the Play in-app
          // review sheet on Android. Both surfaces silently no-op if
          // their per-user / per-version throttle has been hit, so
          // there's no need to gate this call ourselves.
          label="Rate on the App Store"
          variant="primary"
          size="md"
          radius="cta"
          className="mt-5 self-stretch"
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
        />
      ) : null}
    </Card>
  );
}
