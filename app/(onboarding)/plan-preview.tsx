// Obsidian Kinetic: 13 · Plan Preview — Figma node 30:50 (AI/strengthening).
// Down-training variant + professional-referral interstitial follow
// docs/hone-assessment-copy-deck.md (⚠ safety-critical copy, verbatim;
// these Figma frames are Phase C "branch coverage" but the routing
// exists NOW, so the branch must have a destination).
//
// Wiring unchanged: markOnboarded → invalidate profile → reset store →
// paywall (RC configured) or home. The interstitial + referral path is
// completely static — stillness signals seriousness (motion spec §5) —
// and is NEVER paywalled (down-training spec, skeptical flag #5):
// the down-training route always exits to /home.
import { useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, Linking, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button, ScreenHeader } from '@/components/obsidian';
import {
  buildProfileV2,
  type AssessmentV2Answers,
} from '@/lib/assessment-v2';
import { markOnboarded } from '@/lib/persistence';
import { hasRevenueCatConfig } from '@/lib/revenuecat';
import { color, glass, radius, spacing, type } from '@/lib/obsidian/tokens';
import { useOnboardingStore } from '@/stores/onboarding';

function isV2Complete(
  v2: Partial<AssessmentV2Answers>,
): v2 is AssessmentV2Answers {
  return v2.release !== undefined && v2.strengthOxford !== undefined;
}

export default function PlanPreview() {
  const router = useRouter();
  const generated = useOnboardingStore((s) => s.generated);
  const index = useOnboardingStore((s) => s.index);
  const v2 = useOnboardingStore((s) => s.v2);
  const reset = useOnboardingStore((s) => s.reset);
  const queryClient = useQueryClient();
  const [busy, setBusy] = useState(false);
  const [interstitialDone, setInterstitialDone] = useState(false);

  const archetype = isV2Complete(v2)
    ? buildProfileV2(v2 as AssessmentV2Answers).archetype
    : 'strengthening';

  if (!generated || !index) {
    return (
      <SafeAreaView
        style={{
          flex: 1,
          backgroundColor: color.background,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Text style={{ ...type.bodyMd, color: color.onSurfaceVariant }}>
          Loading…
        </Text>
      </SafeAreaView>
    );
  }

  async function handleStart(opts: { skipPaywall?: boolean } = {}) {
    if (busy) return;
    setBusy(true);
    try {
      await markOnboarded();
      await queryClient.invalidateQueries({ queryKey: ['profile'] });
      reset();
      router.replace(
        !opts.skipPaywall && hasRevenueCatConfig() ? '/paywall' : '/home',
      );
    } catch (e) {
      const msg =
        e instanceof Error
          ? e.message
          : "Couldn't finalize your plan. Try again.";
      Alert.alert('Save failed', msg);
      setBusy(false);
    }
  }

  // — Down-training: referral interstitial first (once, tap-through) —
  if (archetype === 'down_training' && !interstitialDone) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: color.background }}>
        <View
          style={{
            flex: 1,
            paddingHorizontal: spacing.containerPadding,
            paddingTop: spacing.stackLg * 2,
            paddingBottom: spacing.stackLg + spacing.stackMd,
            gap: spacing.containerPadding,
          }}
        >
          <Text style={{ ...type.headlineLg, color: color.onSurface }}>
            First — one honest thing
          </Text>
          <Text style={{ ...type.bodyLg, color: color.onSurfaceVariant }}>
            What you told us is common, and it&rsquo;s nothing to worry
            about on its own. But the people who assess this properly are
            pelvic floor physiotherapists, and if your symptoms are
            bothering you, seeing one is the best step you can take.
          </Text>
          <Text style={{ ...type.bodyLg, color: color.onSurfaceVariant }}>
            Hone will give you safe, gentle work to start with in the
            meantime — but we&rsquo;re not a substitute for a professional,
            and we&rsquo;ll never push you to strengthen through pain.
          </Text>
          <View style={{ flex: 1 }} />
          <Button
            label="I understand — continue"
            onPress={() => setInterstitialDone(true)}
            haptics={false}
            style={{ width: '100%' }}
          />
          <Button
            label="How to find a pelvic floor PT"
            variant="ghost"
            haptics={false}
            onPress={() =>
              void Linking.openURL(
                'https://www.google.com/search?q=pelvic+floor+physiotherapist+near+me',
              )
            }
            style={{ width: '100%' }}
          />
        </View>
      </SafeAreaView>
    );
  }

  // — Down-training plan preview (copy deck, verbatim) —
  if (archetype === 'down_training') {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: color.background }}>
        <ScreenHeader variant="close" title="Your plan" onPress={() => {}} />
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{
            flexGrow: 1,
            paddingHorizontal: spacing.containerPadding,
            paddingTop: spacing.stackLg,
            paddingBottom: spacing.stackLg + spacing.stackMd,
            gap: spacing.stackMd,
          }}
        >
          <Text style={{ ...type.labelCaps, color: color.secondaryContainer }}>
            A DIFFERENT STARTING POINT
          </Text>
          <Text style={{ ...type.display, color: color.onSurface }}>
            Release &amp; Restore
          </Text>
          <Text style={{ ...type.bodyLg, color: color.onSurfaceVariant }}>
            Based on your answers, we&rsquo;re starting you somewhere
            different — with work that helps your pelvic floor release,
            not just contract. For a tight or overactive pelvic floor,
            that&rsquo;s the right first step, and pushing into
            strengthening too early can make things worse.
          </Text>
          <Text style={{ ...type.bodyLg, color: color.onSurfaceVariant }}>
            This is gentle, proven work: breathing, relaxation and
            lengthening. No forcing, no &ldquo;harder each week&rdquo; —
            we&rsquo;re looking for ease, not effort.
          </Text>
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
            <Text
              style={{ ...type.labelCaps, color: color.onSurfaceVariant }}
            >
              WHAT THIS PHASE IS
            </Text>
            {[
              'Daily pelvic-floor breathing, 5–10 minutes',
              'Gentle lengthening and relaxation work',
              'Simple habits for everyday tension',
            ].map((line) => (
              <Text
                key={line}
                style={{ ...type.bodyMd, color: color.onSurface }}
              >
                · {line}
              </Text>
            ))}
          </View>
          <View style={{ flexDirection: 'row', gap: spacing.gutter }}>
            <StatTile label="WEEKS" value="8" />
            <StatTile label="CADENCE" value="Daily" />
            <StatTile label="MINS" value="~10" />
          </View>
          <View
            style={{
              backgroundColor: color.surfaceContainerLow,
              borderColor: color.secondaryContainer,
              borderWidth: 1,
              borderRadius: radius.xl,
              padding: spacing.stackMd,
              gap: 4,
            }}
          >
            <Text
              style={{ ...type.labelCaps, color: color.secondaryContainer }}
            >
              WEEK 8
            </Text>
            <Text style={{ ...type.bodyMd, color: color.onSurface }}>
              We&rsquo;ll recheck — and if things have eased, we&rsquo;ll
              move you on gently.
            </Text>
          </View>
          <View style={{ flex: 1 }} />
          <Button
            label={busy ? 'Saving…' : 'Start release work'}
            disabled={busy}
            haptics={false}
            // Safety content must not gate behind the paywall.
            onPress={() => void handleStart({ skipPaywall: true })}
            style={{ width: '100%' }}
          />
          <Button
            label="Talk to a professional"
            variant="ghost"
            haptics={false}
            onPress={() =>
              void Linking.openURL(
                'https://www.google.com/search?q=pelvic+floor+physiotherapist+near+me',
              )
            }
            style={{ width: '100%' }}
          />
        </ScrollView>
      </SafeAreaView>
    );
  }

  // — Strengthening / foundation preview (Figma 30:50) —
  const composite = Math.round(index.composite);
  const phaseName =
    archetype === 'foundation' ? 'Foundation Phase' : 'Build Phase';
  const phaseBlurb =
    archetype === 'foundation'
      ? `Your starting index is ${composite}. This phase rebuilds awareness and clean technique before adding load.`
      : `Your starting index is ${composite}. This phase rebuilds responsiveness before adding endurance load.`;
  const perWeek = 5;
  const minutes = Math.max(
    5,
    Math.round(
      (generated.program[0]?.targetDurationS ?? 600) / 60,
    ),
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: color.background }}>
      <ScreenHeader variant="close" title="Your plan" onPress={() => {}} />
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          flexGrow: 1,
          paddingHorizontal: spacing.containerPadding,
          paddingTop: spacing.stackLg,
          paddingBottom: spacing.stackLg + spacing.stackMd,
          gap: spacing.stackMd,
        }}
      >
        {/* BUILT FROM YOUR INDEX chip */}
        <View
          style={{
            alignSelf: 'flex-start',
            backgroundColor: color.primaryContainer,
            borderRadius: radius.full,
            paddingHorizontal: 10,
            paddingVertical: 4,
          }}
        >
          <Text style={{ ...type.labelCaps, color: color.onPrimaryFixed }}>
            BUILT FROM YOUR INDEX
          </Text>
        </View>
        <Text style={{ ...type.display, color: color.onSurface }}>
          {phaseName}
        </Text>
        <Text style={{ ...type.bodyLg, color: color.onSurfaceVariant }}>
          {phaseBlurb}
        </Text>

        <View style={{ flexDirection: 'row', gap: spacing.gutter }}>
          <StatTile label="WEEKS" value="8" />
          <StatTile label="PER WEEK" value={String(perWeek)} />
          <StatTile label="MINS" value={String(minutes)} />
        </View>

        {/* Program emphases from the generator */}
        {generated.focuses.length > 0 && (
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
            <Text
              style={{ ...type.labelCaps, color: color.primaryFixedDim }}
            >
              YOUR EMPHASES
            </Text>
            {generated.focuses.map((f) => (
              <Text key={f} style={{ ...type.bodyMd, color: color.onSurface }}>
                · {f}
              </Text>
            ))}
          </View>
        )}

        <View
          style={{
            backgroundColor: color.surfaceContainerLow,
            borderColor: color.secondaryContainer,
            borderWidth: 1,
            borderRadius: radius.xl,
            padding: spacing.stackMd,
            gap: 4,
          }}
        >
          <Text
            style={{ ...type.labelCaps, color: color.secondaryContainer }}
          >
            WEEK 8
          </Text>
          <Text style={{ ...type.bodyMd, color: color.onSurface }}>
            Forced retest — your index gets remeasured and the next phase
            is built from the result.
          </Text>
        </View>

        <View style={{ flex: 1 }} />
        <Button
          label={busy ? 'Saving…' : 'Start training'}
          disabled={busy}
          onPress={() => void handleStart()}
          style={{ width: '100%' }}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

function StatTile({ label, value }: { label: string; value: string }) {
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
      <Text style={{ ...type.labelCaps, color: color.onSurfaceVariant }}>
        {label}
      </Text>
      <Text
        style={{
          ...type.metricLg,
          fontSize: 32,
          lineHeight: 36,
          color: color.onSurface,
        }}
      >
        {value}
      </Text>
    </View>
  );
}
