// Obsidian Kinetic: pre-session mode picker. No dedicated Figma frame
// ("still to design") — derived from option-card + Chip patterns.
// Logic unchanged: entitlement gate, Focus-mode stealth promotion,
// Siri quick_discreet deeplink, settings.defaultMode.
import { useQuery } from '@tanstack/react-query';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button, Chip, ScreenHeader } from '@/components/obsidian';
import { hasSupabaseConfig } from '@/lib/env';
import { getFocusStatus, subscribeFocus } from '@/lib/focus';
import { fireHaptic } from '@/lib/obsidian/haptics';
import { color, glass, radius, spacing, type } from '@/lib/obsidian/tokens';
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

  useEffect(() => {
    if (!hydrated) void hydrate();
  }, [hydrate, hydrated]);

  // ?preset=quick_discreet — Siri/AppIntents deeplink straight to stealth.
  useEffect(() => {
    if (!preset || blockedBySubscription) return;
    router.replace(`/session/stealth?preset=${preset}`);
  }, [preset, blockedBySubscription, router]);

  // Focus-mode awareness: an active Focus promotes Stealth to primary.
  const [focusActive, setFocusActive] = useState(false);
  useEffect(() => {
    let removed = false;
    let unsub: (() => void) | null = null;
    (async () => {
      const status = await getFocusStatus();
      if (removed) return;
      setFocusActive(status.isFocus);
      const handle = await subscribeFocus((isFocus) => {
        if (!removed) setFocusActive(isFocus);
      });
      if (removed) {
        handle();
      } else {
        unsub = handle;
      }
    })();
    return () => {
      removed = true;
      unsub?.();
    };
  }, []);

  const todayQuery = useQuery({
    queryKey: ['program-day', 'today'],
    enabled: hasSupabaseConfig(),
    queryFn: fetchTodayProgramDay,
  });

  const exercises =
    todayQuery.data?.exercises ?? ['short_holds', 'quick_flicks'];
  const targetMin = Math.round((todayQuery.data?.targetDurationS ?? 240) / 60);
  const dayNumber = todayQuery.data?.dayNumber ?? 1;
  const stealthFirst =
    focusActive || (hydrated && settings.defaultMode === 'stealth');

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: color.background }}>
      <ScreenHeader
        variant="back"
        title={`Day ${dayNumber}`}
        onPress={() => router.back()}
      />
      <View
        style={{
          flex: 1,
          paddingHorizontal: spacing.containerPadding,
          paddingTop: spacing.stackMd,
          paddingBottom: spacing.stackLg + spacing.stackMd,
          gap: spacing.stackMd,
        }}
      >
        <Text style={{ ...type.headlineLg, color: color.onSurface }}>
          Ready to train?
        </Text>
        <Text style={{ ...type.bodyMd, color: color.onSurfaceVariant }}>
          {exercises.map(prettyName).join(' · ')} · ~{targetMin} min
        </Text>

        {blockedBySubscription ? (
          <View
            style={{
              backgroundColor: color.surfaceContainerLow,
              borderColor: glass.border,
              borderWidth: glass.borderWidth,
              borderRadius: radius.xl,
              padding: spacing.stackMd,
              gap: spacing.stackSm,
            }}
          >
            <Text style={{ ...type.labelButton, color: color.onSurface }}>
              Subscribe to start a session
            </Text>
            <Text style={{ ...type.bodyMd, color: color.onSurfaceVariant }}>
              Your trial or subscription has ended. Resume access to keep
              training.
            </Text>
            <Button
              label="See plans"
              onPress={() => router.push('/paywall')}
              style={{ width: '100%', marginTop: spacing.stackSm }}
            />
          </View>
        ) : (
          <View style={{ gap: spacing.gutter, marginTop: spacing.stackSm }}>
            {(stealthFirst
              ? (['stealth', 'normal'] as const)
              : (['normal', 'stealth'] as const)
            ).map((mode, i) => (
              <ModeCard
                key={mode}
                mode={mode}
                primary={i === 0}
                onPress={() => {
                  void fireHaptic('selection');
                  router.push(
                    mode === 'stealth' ? '/session/stealth' : '/session/player',
                  );
                }}
              />
            ))}
            {focusActive ? (
              <Chip label="FOCUS ON · STEALTH SUGGESTED" variant="active" />
            ) : null}
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

function ModeCard({
  mode,
  primary,
  onPress,
}: {
  mode: 'normal' | 'stealth';
  primary: boolean;
  onPress: () => void;
}) {
  const title = mode === 'normal' ? 'Guided' : 'Stealth';
  const sub =
    mode === 'normal'
      ? 'On-screen ring + haptics'
      : 'AirPods + haptics, podcast-decoy lockscreen';
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`Start ${title} session — ${sub}`}
      style={({ pressed }) => ({
        backgroundColor: color.surfaceContainerLow,
        borderColor: primary ? color.primaryContainer : glass.border,
        borderWidth: primary ? 1.5 : 1,
        borderRadius: radius.xl,
        padding: spacing.stackMd,
        gap: 2,
        opacity: pressed ? 0.8 : 1,
      })}
    >
      <Text
        style={{
          ...type.labelButton,
          color: primary ? color.primaryFixedDim : color.onSurface,
        }}
      >
        {title}
      </Text>
      <Text style={{ ...type.bodyMd, color: color.onSurfaceVariant }}>
        {sub}
      </Text>
    </Pressable>
  );
}

function prettyName(slug: string): string {
  return slug
    .split('_')
    .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
    .join(' ');
}
