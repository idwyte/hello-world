// Obsidian Kinetic: 12 · Generating — Figma node 29:64.
// PhaseRing with % + cycling mono caption, headline + calibration line.
// Captions cycle per the copy deck; the down-training route swaps the
// caption set to the release-work variant.
//
// Logic: builds the v2 profile vector (archetype routing is
// deterministic and runs BEFORE any AI call), passes it to
// buildProgram(), persists, then routes to /plan-preview.
import { useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Alert, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { PhaseRing } from '@/components/obsidian';
import { isAssessmentComplete } from '@/lib/assessment-questions';
import {
  buildProfileV2,
  type AssessmentV2Answers,
} from '@/lib/assessment-v2';
import { saveAssessmentAndProgram } from '@/lib/persistence';
import { buildProgram, recommendLevel } from '@/lib/program';
import { color, spacing, type } from '@/lib/obsidian/tokens';
import { useOnboardingStore } from '@/stores/onboarding';

const CAPTIONS_STANDARD = [
  'READING YOUR PROFILE',
  'MATCHING YOUR PHASE',
  'SETTING YOUR DOSES',
] as const;
const CAPTIONS_DOWN_TRAINING = [
  'READING YOUR PROFILE',
  'SHAPING YOUR RELEASE WORK',
] as const;

const TOTAL_MS = 5600; // matches the prior 4×1.4s cadence

function isV2Complete(
  v2: Partial<AssessmentV2Answers>,
): v2 is AssessmentV2Answers {
  return (
    v2.strengthOxford !== undefined &&
    v2.enduranceSeconds !== undefined &&
    v2.repCeiling !== undefined &&
    v2.fastCount !== undefined &&
    v2.coordinationFlags !== undefined &&
    v2.release !== undefined &&
    v2.symptomFlags !== undefined
  );
}

export default function Generating() {
  const router = useRouter();
  const draft = useOnboardingStore((s) => s.draft);
  const v2 = useOnboardingStore((s) => s.v2);
  const index = useOnboardingStore((s) => s.index);
  const setGenerated = useOnboardingStore((s) => s.setGenerated);

  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const startRef = useRef(Date.now());

  // Profile vector — deterministic; null when the user somehow skipped
  // the battery (we bounce them back in that case).
  const profile = isV2Complete(v2)
    ? buildProfileV2(v2, {
        ageBand: draft.ageBand,
        trainFreq:
          draft.strengthDaysPerWeek !== undefined
            ? String(draft.strengthDaysPerWeek)
            : undefined,
        flags: [],
      })
    : null;

  const captions =
    profile?.archetype === 'down_training'
      ? CAPTIONS_DOWN_TRAINING
      : CAPTIONS_STANDARD;
  const captionIndex = Math.min(
    captions.length - 1,
    Math.floor(progress * captions.length),
  );

  useEffect(() => {
    let cancelled = false;
    if (!isAssessmentComplete(draft) || !index || !profile) {
      router.replace('/welcome');
      return;
    }
    const level = recommendLevel(index);

    const ringTimer = setInterval(() => {
      setProgress(
        Math.min(1, (Date.now() - startRef.current) / TOTAL_MS),
      );
    }, 100);

    (async () => {
      const minDelay = new Promise((r) => setTimeout(r, TOTAL_MS));
      try {
        const { days, focuses } = await buildProgram({
          level,
          measurements: {
            pulsesIn30s: index.pulsesIn30s,
            maxHoldS: index.maxHoldS,
          },
          answers: draft,
          profile,
        });
        if (cancelled) return;
        setGenerated({ level, program: days, stealthDefault: false, focuses });
        await Promise.all([
          saveAssessmentAndProgram({
            answers: draft,
            index,
            level,
            program: days,
          }),
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
      clearInterval(ringTimer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: color.background }}>
      <View
        style={{
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          paddingHorizontal: spacing.containerPadding,
          gap: spacing.containerPadding,
        }}
      >
        <PhaseRing
          progress={progress}
          glow
          time={`${Math.round(progress * 100)}%`}
          caption={captions[captionIndex]}
          size={280}
          strokeWidth={6}
          durationMs={TOTAL_MS}
        />
        <Text style={{ ...type.headlineLg, color: color.onSurface }}>
          Building your program
        </Text>
        <Text
          style={{
            ...type.bodyMd,
            color: color.onSurfaceVariant,
            textAlign: 'center',
          }}
        >
          {profile?.archetype === 'down_training'
            ? 'Calibrating release work to what you just told us.'
            : 'Calibrating strength, stamina, speed and control to what you just measured.'}
        </Text>
        {error ? (
          <Text style={{ ...type.bodyMd, color: color.error }}>{error}</Text>
        ) : null}
      </View>
    </SafeAreaView>
  );
}
