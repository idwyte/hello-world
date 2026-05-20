// Figma: 10 · generating — node 199:551
// https://www.figma.com/design/qgY3Qcf7gP7w5V5A6uQTL4/?node-id=199-551
//
// 4-stage checklist while the Supabase Edge Function (generate-program)
// calls Claude. The stages advance on a fixed cadence — they reflect
// the user's expectation of what's happening, not actual sub-step
// timing from the LLM call (which streams as one opaque request).
//
// Auto-advances to /plan-preview once the program is generated AND
// persisted AND the minimum-delay timer has fired (so the user always
// sees the final "Generating program" stage tick over, never a flash).
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Body, SectionLabel } from '@/components/ui';
import { PacerRing } from '@/components/session/PacerRing';
import { isAssessmentComplete } from '@/lib/assessment-questions';
import { saveAssessmentAndProgram } from '@/lib/persistence';
import { buildProgram, recommendLevel } from '@/lib/program';
import { semantic } from '@/lib/theme';
import { useOnboardingStore } from '@/stores/onboarding';

// Fixed cadence for the 4 stages — they don't gate on real LLM events
// (the call is opaque server-side). The minimum-delay timer below
// ensures the user sees every stage, even if Claude responds fast.
const STAGE_INTERVAL_MS = 1400;
const STAGES = [
  'Analyzing pulse capacity',
  'Mapping hold endurance',
  'Cross-referencing lifestyle',
  'Generating 8-week program',
] as const;

export default function Generating() {
  const router = useRouter();
  const draft = useOnboardingStore((s) => s.draft);
  const index = useOnboardingStore((s) => s.index);
  const setGenerated = useOnboardingStore((s) => s.setGenerated);

  const [error, setError] = useState<string | null>(null);
  // 0 = nothing started; N = stage N is in progress, stages 0..N-1 done.
  // Goes to STAGES.length when all done.
  const [activeStage, setActiveStage] = useState(0);
  // Animated ring progress (0 → 1) — drives the visual loader.
  const [ringProgress, setRingProgress] = useState(0);

  useEffect(() => {
    let cancelled = false;
    if (!isAssessmentComplete(draft) || !index) {
      router.replace('/welcome');
      return;
    }
    const level = recommendLevel(index);

    // Tick the checklist forward at a fixed cadence so users see every
    // stage. Total ≈ 4 × 1.4 s = 5.6 s — slightly longer than Claude's
    // typical 3-6 s response. If the LLM is faster, we hold on the
    // last stage; if slower, the last stage just stays "active" until
    // it completes.
    const stageTimer = setInterval(() => {
      setActiveStage((s) => Math.min(s + 1, STAGES.length));
    }, STAGE_INTERVAL_MS);

    // Ring animates over the same total window — smooth indicator that
    // something is happening even between stage ticks.
    const ringTimer = setInterval(() => {
      setRingProgress((p) => Math.min(p + 0.025, 1));
    }, 100);

    (async () => {
      const minDelay = new Promise((r) =>
        setTimeout(r, STAGE_INTERVAL_MS * STAGES.length),
      );
      try {
        const program = await buildProgram({
          level,
          measurements: { pulsesIn30s: index.pulsesIn30s, maxHoldS: index.maxHoldS },
          answers: draft,
        });
        if (cancelled) return;
        setGenerated({ level, program, stealthDefault: false });
        await Promise.all([
          saveAssessmentAndProgram({ answers: draft, index, level, program }),
          minDelay,
        ]);
      } catch (e) {
        if (cancelled) return;
        const msg =
          e instanceof Error
            ? e.message
            : "Couldn't build your plan. Try again.";
        setError(msg);
        Alert.alert('Generation failed', msg, [
          { text: 'Retry', onPress: () => router.replace('/generating') },
          { text: 'Cancel', onPress: () => router.replace('/welcome') },
        ]);
        return;
      }
      if (!cancelled) router.replace('/plan-preview');
    })();

    return () => {
      cancelled = true;
      clearInterval(stageTimer);
      clearInterval(ringTimer);
    };
  }, [draft, index, router, setGenerated]);

  return (
    <SafeAreaView className="flex-1 bg-surface-canvas">
      <View className="flex-1 px-6 pb-8 items-center">
        {/* 260×260 PacerRing with 3-dot pulse loader inside — Figma `199:551` */}
        <View className="items-center mt-12">
          <PacerRing
            progress={ringProgress}
            color={semantic.interactivePrimary}
            size={260}
            strokeWidth={6}
          />
          <View
            className="absolute inset-0 items-center justify-center"
            pointerEvents="none"
          >
            <View className="flex-row gap-2">
              {[0, 1, 2].map((i) => {
                const isActive = i === Math.floor(ringProgress * 3) % 3;
                return (
                  <View
                    key={i}
                    className="w-2.5 h-2.5 rounded-full"
                    style={{
                      backgroundColor: isActive
                        ? semantic.interactivePrimary
                        : semantic.textMuted,
                      opacity: isActive ? 1 : 0.5,
                    }}
                  />
                );
              })}
            </View>
          </View>
        </View>

        <SectionLabel tracking="wide" className="mt-10">
          BUILDING YOUR PLAN
        </SectionLabel>
        <Body
          weight="semibold"
          color="primary"
          className="mt-2 text-center"
          style={{ fontSize: 22, lineHeight: 28 }}
        >
          Personalizing for your strength + lifestyle
        </Body>

        {/* 4-stage checklist */}
        <View className="mt-8 self-stretch px-6 gap-3">
          {STAGES.map((label, i) => {
            const status =
              i < activeStage
                ? 'done'
                : i === activeStage
                  ? 'active'
                  : 'pending';
            return (
              <View key={label} className="flex-row items-center">
                <View
                  className="w-4 h-4 rounded-full items-center justify-center mr-3"
                  style={{
                    backgroundColor:
                      status === 'done'
                        ? semantic.feedbackSuccess
                        : status === 'active'
                          ? semantic.interactivePrimary
                          : 'transparent',
                    borderWidth: status === 'pending' ? 1 : 0,
                    borderColor: semantic.borderDefault,
                  }}
                >
                  {status === 'done' ? (
                    <Body
                      size="xs"
                      weight="semibold"
                      color="primary"
                      style={{ fontSize: 10, lineHeight: 12 }}
                    >
                      ✓
                    </Body>
                  ) : null}
                </View>
                <Body
                  weight={status === 'active' ? 'semibold' : 'regular'}
                  color={status === 'pending' ? 'muted' : 'primary'}
                  style={{ fontSize: 14, lineHeight: 20 }}
                >
                  {label}
                </Body>
              </View>
            );
          })}
        </View>

        {error ? (
          <Body size="sm" color="danger" className="mt-8 text-center">
            {error}
          </Body>
        ) : null}
      </View>
    </SafeAreaView>
  );
}
