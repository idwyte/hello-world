// Figma: 11 · plan-preview — node 199:584
// https://www.figma.com/design/qgY3Qcf7gP7w5V5A6uQTL4/?node-id=199-584
//
// Reveal of the generated 8-week program. Composite hero + 3 emphasis
// bullets + week 1 preview + Start training CTA.
//
// Data sources:
//   composite + level  → onboardingStore.index (scoreIndex output)
//   focuses            → onboardingStore.generated.focuses (Edge Function
//                        returns 3, or level-based fallback in dev mode)
//   week 1 cells       → onboardingStore.generated.program[0..6]
import { useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Body, Button, Card, Pill, SectionLabel } from '@/components/ui';
import { markOnboarded } from '@/lib/persistence';
import { hasRevenueCatConfig } from '@/lib/revenuecat';
import { semantic } from '@/lib/theme';
import type { ProgramDay } from '@/lib/types';
import { useOnboardingStore } from '@/stores/onboarding';

const WEEKDAY_LETTERS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'] as const;

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export default function PlanPreview() {
  const router = useRouter();
  const generated = useOnboardingStore((s) => s.generated);
  const index = useOnboardingStore((s) => s.index);
  const reset = useOnboardingStore((s) => s.reset);
  const queryClient = useQueryClient();
  const [busy, setBusy] = useState(false);

  if (!generated || !index) {
    return (
      <SafeAreaView className="flex-1 bg-surface-canvas items-center justify-center">
        <Body color="muted">Loading…</Body>
      </SafeAreaView>
    );
  }

  const firstWeek = generated.program.slice(0, 7);

  async function handleStart() {
    if (busy) return;
    setBusy(true);
    try {
      await markOnboarded();
      await queryClient.invalidateQueries({ queryKey: ['profile'] });
      reset();
      // Paywall is a hard gate post-onboarding when RC is configured;
      // otherwise drop straight to home.
      router.replace(hasRevenueCatConfig() ? '/paywall' : '/home');
    } catch (e) {
      const msg =
        e instanceof Error
          ? e.message
          : "Couldn't finalize your plan. Try again.";
      Alert.alert('Save failed', msg);
      setBusy(false);
    }
  }

  return (
    <SafeAreaView className="flex-1 bg-surface-canvas">
      <ScrollView className="flex-1" contentContainerClassName="px-4 pb-32">
        {/* Large-title header */}
        <View className="h-20 justify-end mb-4">
          <Body
            weight="semibold"
            color="primary"
            style={{ fontSize: 28, lineHeight: 36 }}
          >
            Your plan
          </Body>
        </View>

        {/* Composite hero — Figma `92:95` (radius 16, p-20, gap-16) */}
        <Card padding="xl" radius="card">
          <SectionLabel tracking="wide">STRENGTH BASELINE</SectionLabel>
          <View className="mt-4 flex-row items-end" style={{ gap: 12 }}>
            <Body
              weight="semibold"
              color="primary"
              style={{ fontSize: 56, lineHeight: 60 }}
            >
              {Math.round(index.composite)}
            </Body>
            <View className="pb-1.5">
              <Pill label={capitalize(generated.level)} tone="accent" size="sm" />
            </View>
          </View>
          <Body
            color="muted"
            className="mt-3"
            style={{ fontSize: 13, lineHeight: 18 }}
          >
            / 100 · refreshed every 2 weeks via retest
          </Body>
        </Card>

        {/* Focuses */}
        <SectionLabel tracking="wide" className="mt-8">
          YOUR PLAN FOCUSES ON
        </SectionLabel>
        <View className="mt-3 gap-2">
          {generated.focuses.map((focus, i) => (
            <View key={i} className="flex-row items-center">
              <View
                className="w-1.5 h-1.5 rounded-full mr-3"
                style={{ backgroundColor: semantic.interactivePrimary }}
              />
              <Body
                color="primary"
                style={{ fontSize: 14, lineHeight: 20 }}
                className="flex-1"
              >
                {focus}
              </Body>
            </View>
          ))}
        </View>

        {/* Week 1 preview */}
        <SectionLabel tracking="wide" className="mt-8">
          WEEK 1 PREVIEW
        </SectionLabel>
        <View className="mt-3 flex-row gap-2">
          {firstWeek.map((day, i) => (
            <DayCell key={day.dayIndex} day={day} letter={WEEKDAY_LETTERS[i]} dayNumber={i + 1} />
          ))}
        </View>
      </ScrollView>

      <View className="absolute bottom-0 left-0 right-0 px-6 pb-8">
        <Button
          label={busy ? '…' : 'Start training'}
          variant="primary"
          size="lg"
          radius="cta"
          disabled={busy}
          onPress={handleStart}
        />
        {busy ? (
          <View className="items-center mt-2">
            <ActivityIndicator color={semantic.interactivePrimary} />
          </View>
        ) : null}
      </View>
    </SafeAreaView>
  );
}

function DayCell({
  day,
  letter,
  dayNumber,
}: {
  day: ProgramDay;
  letter: string;
  dayNumber: number;
}) {
  const isRest = day.exercises.length === 0;
  // Day 1 is today in this preview (user just onboarded). Subsequent
  // days haven't happened yet — show as upcoming/rest, not "done".
  const isToday = dayNumber === 1;

  const bgColor = isToday
    ? semantic.interactivePrimaryPressed
    : semantic.surfaceSunken;

  return (
    <View
      className="flex-1 rounded-[14px] items-center justify-center py-2.5"
      style={{ backgroundColor: bgColor, minHeight: 88 }}
    >
      <Body
        weight="medium"
        color="muted"
        style={{ fontSize: 11, lineHeight: 14, letterSpacing: 1.2 }}
      >
        {letter}
      </Body>
      <Body
        weight="semibold"
        color="primary"
        className="mt-1"
        style={{ fontSize: 22, lineHeight: 28 }}
      >
        {dayNumber}
      </Body>
      <Body
        weight="medium"
        color={isRest ? 'muted' : isToday ? 'primary' : 'muted'}
        className="mt-1"
        style={{ fontSize: 11, lineHeight: 14 }}
      >
        {isRest ? 'rest' : isToday ? 'today' : 'up next'}
      </Body>
    </View>
  );
}
