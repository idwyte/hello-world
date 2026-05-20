// Figma: 04 · quick pulse — node 199:387 (stage 1)
//        05 · max hold     — node 199:415 (stage 2)
// https://www.figma.com/design/qgY3Qcf7gP7w5V5A6uQTL4/?node-id=199-387
// https://www.figma.com/design/qgY3Qcf7gP7w5V5A6uQTL4/?node-id=199-415
//
// Onboarding entry to the two physical measurements. Stage UI lives in
// components/assessment/PulseHoldStages.tsx (shared with /index-retest).
// This wrapper supplies the modal-header chrome and the post-measurement
// flow: compute index → setIndex → /assessment.
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Body } from '@/components/ui';
import {
  HoldIdle,
  HoldRunner,
  HOLD_CAP_S,
  PulseIdle,
  PulseRunner,
  PulseReview,
  PULSE_WINDOW_S,
} from '@/components/assessment/PulseHoldStages';
import { scoreIndex } from '@/lib/pelvic-floor-index';
import { useOnboardingStore } from '@/stores/onboarding';

type Stage =
  | 'pulse-idle'
  | 'pulse-running'
  | 'pulse-review'
  | 'hold-idle'
  | 'hold-running'
  | 'done';

export default function IndexTest() {
  const router = useRouter();
  const setIndex = useOnboardingStore((s) => s.setIndex);

  const [stage, setStage] = useState<Stage>('pulse-idle');
  const [pulsesIn30s, setPulsesIn30s] = useState<number | null>(null);
  const [maxHoldS, setMaxHoldS] = useState<number | null>(null);

  useEffect(() => {
    if (stage === 'done' && pulsesIn30s !== null && maxHoldS !== null) {
      const idx = scoreIndex({ pulsesIn30s, maxHoldS });
      setIndex(idx);
      router.replace('/assessment');
    }
  }, [stage, pulsesIn30s, maxHoldS, router, setIndex]);

  const stageNumber = stage.startsWith('pulse') ? 1 : 2;

  return (
    <SafeAreaView className="flex-1 bg-surface-canvas">
      {/* Modal header — cancel × + "Test N of 2" */}
      <View className="h-14 flex-row items-center px-4">
        <Pressable
          onPress={() => router.back()}
          hitSlop={12}
          accessibilityLabel="Cancel"
          className="w-8 h-8 items-center justify-center"
        >
          <Body color="muted" style={{ fontSize: 24, lineHeight: 24 }}>
            ×
          </Body>
        </Pressable>
        <View className="flex-1 items-center -ml-8">
          <Body
            weight="medium"
            color="muted"
            style={{ fontSize: 15, lineHeight: 22 }}
          >
            Test {stageNumber} of 2
          </Body>
        </View>
      </View>

      {stage === 'pulse-idle' && (
        <PulseIdle
          remainingS={PULSE_WINDOW_S}
          onPrimary={() => setStage('pulse-running')}
        />
      )}
      {stage === 'pulse-running' && (
        <PulseRunner
          windowS={PULSE_WINDOW_S}
          onComplete={() => setStage('pulse-review')}
        />
      )}
      {stage === 'pulse-review' && (
        <PulseReview
          onSubmit={(n) => {
            setPulsesIn30s(n);
            setStage('hold-idle');
          }}
        />
      )}
      {stage === 'hold-idle' && (
        <HoldIdle elapsedS={0} onPrimary={() => setStage('hold-running')} />
      )}
      {stage === 'hold-running' && (
        <HoldRunner
          capS={HOLD_CAP_S}
          onComplete={(elapsedS) => {
            setMaxHoldS(elapsedS);
            setStage('done');
          }}
        />
      )}
      {stage === 'done' && (
        <View className="flex-1 items-center justify-center">
          <Body color="muted">Computing your Index…</Body>
        </View>
      )}
    </SafeAreaView>
  );
}
