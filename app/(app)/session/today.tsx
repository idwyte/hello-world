import { useQuery } from '@tanstack/react-query';
import { Link, useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect } from 'react';
import { Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { hasSupabaseConfig } from '@/lib/env';
import { hasRevenueCatConfig, useEntitlement } from '@/lib/revenuecat';
import { fetchTodayProgramDay } from '@/lib/sessions';
import { useSettingsStore } from '@/stores/settings';

const VALID_PRESETS = new Set(['quick_discreet']);

export default function SessionPreview() {
  const router = useRouter();
  const { entitlement } = useEntitlement();
  const blockedBySubscription = hasRevenueCatConfig() && !entitlement.isPro;
  const { settings, hydrated, hydrate } = useSettingsStore();
  const params = useLocalSearchParams<{ preset?: string }>();
  const preset =
    typeof params.preset === 'string' && VALID_PRESETS.has(params.preset)
      ? params.preset
      : null;

  // Hydrate so we can honor `defaultMode` and pre-select the user's chosen
  // entry point.
  useEffect(() => {
    if (!hydrated) void hydrate();
  }, [hydrate, hydrated]);

  // ?preset=quick_discreet — deep-linked from the Siri/AppIntents "Quick
  // discreet" shortcut. Skip the mode picker; route straight to stealth.
  // Subscription gate still applies (paywall, not the player).
  useEffect(() => {
    if (!preset || blockedBySubscription) return;
    router.replace(`/session/stealth?preset=${preset}`);
  }, [preset, blockedBySubscription, router]);

  const todayQuery = useQuery({
    queryKey: ['program-day', 'today'],
    enabled: hasSupabaseConfig(),
    queryFn: fetchTodayProgramDay,
  });

  const exercises =
    todayQuery.data?.exercises ?? ['short_holds', 'quick_flicks'];
  const targetMin = Math.round(
    (todayQuery.data?.targetDurationS ?? 240) / 60,
  );
  const title = todayQuery.data ? 'Today' : 'Foundation Day 1';

  return (
    <SafeAreaView className="flex-1 bg-bg">
      <View className="flex-1 px-6 pt-6">
        <Pressable
          onPress={() => router.back()}
          className="self-start py-3 px-3 -ml-3 active:opacity-60"
          hitSlop={12}
          accessibilityRole="button"
          accessibilityLabel="Back"
        >
          <Text className="text-muted">← Back</Text>
        </Pressable>

        <Text className="text-ink text-3xl font-semibold mt-4">{title}</Text>
        <Text className="text-muted mt-2">
          {exercises.map(prettyName).join(' · ')} · ~{targetMin} min
        </Text>

        <View className="bg-surface rounded-2xl p-5 mt-8 border border-border">
          <Text className="text-muted text-xs uppercase tracking-wider">
            Choose mode
          </Text>

          {blockedBySubscription ? (
            <View className="mt-4 bg-surface2 rounded-xl p-4 border border-border">
              <Text className="text-ink font-semibold">
                Subscribe to start a session
              </Text>
              <Text className="text-muted text-sm mt-1">
                Your trial or subscription has ended. Resume access to keep
                training.
              </Text>
              <Pressable
                onPress={() => router.push('/paywall')}
                accessibilityRole="button"
                accessibilityLabel="See plans"
                className="bg-accent rounded-xl mt-3 py-3 items-center active:opacity-80"
              >
                <Text className="text-ink font-semibold">See plans</Text>
              </Pressable>
            </View>
          ) : (
            <ModePicker
              stealthFirst={hydrated && settings.defaultMode === 'stealth'}
            />
          )}
        </View>
      </View>
    </SafeAreaView>
  );
}

function prettyName(slug: string): string {
  return slug
    .split('_')
    .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
    .join(' ');
}

function NormalCard({ primary }: { primary: boolean }) {
  return (
    <Link href="/session/player" asChild>
      <Pressable
        className={`rounded-xl py-4 px-5 active:opacity-80 ${
          primary ? 'bg-accent' : 'bg-surface2 border border-border'
        }`}
        accessibilityRole="button"
        accessibilityLabel="Start session in Normal mode with on-screen pacer and haptics"
      >
        <Text className="text-ink font-semibold text-lg">Normal</Text>
        <Text
          className={`text-sm mt-1 ${primary ? 'text-ink/70' : 'text-muted'}`}
        >
          On-screen pacer + haptics
        </Text>
      </Pressable>
    </Link>
  );
}

function StealthCard({ primary }: { primary: boolean }) {
  return (
    <Link href="/session/stealth" asChild>
      <Pressable
        className={`rounded-xl py-4 px-5 active:opacity-80 ${
          primary ? 'bg-accent' : 'bg-surface2 border border-border'
        }`}
        accessibilityRole="button"
        accessibilityLabel="Start a Stealth session — AirPods and haptics, podcast-style lockscreen"
      >
        <Text className="text-ink font-semibold text-lg">Stealth</Text>
        <Text
          className={`text-sm mt-1 ${primary ? 'text-ink/70' : 'text-muted'}`}
        >
          AirPods + haptics, podcast-decoy lockscreen
        </Text>
      </Pressable>
    </Link>
  );
}

function ModePicker({ stealthFirst }: { stealthFirst: boolean }) {
  if (stealthFirst) {
    return (
      <View className="mt-4 gap-3">
        <StealthCard primary />
        <NormalCard primary={false} />
      </View>
    );
  }
  return (
    <View className="mt-4 gap-3">
      <NormalCard primary />
      <StealthCard primary={false} />
    </View>
  );
}
