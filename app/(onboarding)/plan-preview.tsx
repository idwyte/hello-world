import { useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { markOnboarded } from '@/lib/persistence';
import { hasRevenueCatConfig } from '@/lib/revenuecat';
import { useOnboardingStore } from '@/stores/onboarding';

export default function PlanPreview() {
  const router = useRouter();
  const generated = useOnboardingStore((s) => s.generated);
  const reset = useOnboardingStore((s) => s.reset);
  const queryClient = useQueryClient();
  const [busy, setBusy] = useState(false);

  if (!generated) {
    return (
      <SafeAreaView className="flex-1 bg-bg items-center justify-center">
        <Text className="text-ink">Loading…</Text>
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
    <SafeAreaView className="flex-1 bg-bg">
      <View className="flex-1 px-6 pt-4 pb-6">
        <Text className="text-muted text-xs uppercase tracking-wider">
          Your plan · {generated.level}
        </Text>
        <Text className="text-ink text-3xl font-semibold mt-1">
          Week 1, day-by-day
        </Text>
        <Text className="text-muted mt-2 leading-5">
          {generated.stealthDefault
            ? 'Stealth Mode will be on by default — you can run sessions invisibly.'
            : 'Run sessions with the on-screen pacer or switch to Stealth anytime.'}
        </Text>

        <ScrollView
          className="flex-1 mt-6"
          contentContainerClassName="gap-3 pb-4"
        >
          {firstWeek.map((day, i) => (
            <View
              key={day.dayIndex}
              className="bg-surface rounded-xl p-4 border border-border"
            >
              <Text className="text-muted text-xs uppercase tracking-wider">
                Day {i + 1}
              </Text>
              <Text className="text-ink font-semibold mt-1">
                {day.exercises.map((e) => e.name).join(' · ')}
              </Text>
              <Text className="text-muted text-xs mt-1">
                ~{Math.round(day.targetDurationS / 60)} min
              </Text>
            </View>
          ))}
        </ScrollView>

        <Pressable
          onPress={handleStart}
          disabled={busy}
          accessibilityRole="button"
          accessibilityLabel="Start training"
          accessibilityState={{ disabled: busy }}
          className={`rounded-xl py-4 items-center active:opacity-80 ${
            busy ? 'bg-surface2' : 'bg-accent'
          }`}
        >
          {busy ? (
            <ActivityIndicator color="#F5F5F7" />
          ) : (
            <Text className="text-ink font-semibold">Start training</Text>
          )}
        </Pressable>
        <Text className="text-muted text-xs text-center mt-3">
          M3 will gate this on a subscription. For now, full access.
        </Text>
      </View>
    </SafeAreaView>
  );
}
