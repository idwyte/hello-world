// Figma: 12 · index-retest — node 98:279
// https://www.figma.com/design/qgY3Qcf7gP7w5V5A6uQTL4/?node-id=98-279
//
// Bi-weekly retest of the Pelvic Floor Index. Same 2-stage measurement
// UI as onboarding /index-test (Figma 04+05), wired here to save the
// result and invalidate the index-history React Query cache so the
// IndexTrendChart on /progress refreshes.
//
// Cadence is soft: the recommended interval is 14 days
// (RETEST_INTERVAL_DAYS in lib/sessions.ts). If the user retests
// earlier we show a warning banner on the intro stage but still allow
// them to proceed.
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, Pressable, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import {
  HoldIdle,
  HoldRunner,
  HOLD_CAP_S,
  PulseIdle,
  PulseRunner,
  PulseReview,
  PULSE_WINDOW_S,
} from '@/components/assessment/PulseHoldStages';
import { Body, Button, Card, SectionLabel } from '@/components/ui';
import { hasSupabaseConfig } from '@/lib/env';
import { saveIndexRetest } from '@/lib/persistence';
import { scoreIndex, type PelvicFloorIndex } from '@/lib/pelvic-floor-index';
import {
  daysSinceLastIndex,
  fetchIndexHistory,
  RETEST_INTERVAL_DAYS,
} from '@/lib/sessions';

type Stage =
  | 'intro'
  | 'pulse-idle'
  | 'pulse-running'
  | 'pulse-review'
  | 'hold-idle'
  | 'hold-running'
  | 'saving'
  | 'done';

export default function IndexRetest() {
  const router = useRouter();
  const qc = useQueryClient();

  const historyQuery = useQuery({
    queryKey: ['index', 'history'],
    enabled: hasSupabaseConfig(),
    queryFn: () => fetchIndexHistory(12),
  });
  const daysSince = daysSinceLastIndex(historyQuery.data ?? []);
  const isEarly = daysSince !== null && daysSince < RETEST_INTERVAL_DAYS;

  const [stage, setStage] = useState<Stage>('intro');
  const [pulsesIn30s, setPulsesIn30s] = useState<number | null>(null);
  const [maxHoldS, setMaxHoldS] = useState<number | null>(null);
  const [result, setResult] = useState<PelvicFloorIndex | null>(null);

  useEffect(() => {
    if (stage === 'saving' && pulsesIn30s !== null && maxHoldS !== null) {
      const idx = scoreIndex({ pulsesIn30s, maxHoldS });
      (async () => {
        try {
          await saveIndexRetest(idx);
          await qc.invalidateQueries({ queryKey: ['index', 'history'] });
          setResult(idx);
          setStage('done');
        } catch (e) {
          const msg = e instanceof Error ? e.message : 'Save failed.';
          Alert.alert('Save failed', msg);
          setStage('intro');
        }
      })();
    }
  }, [stage, pulsesIn30s, maxHoldS, qc]);

  return (
    <SafeAreaView className="flex-1 bg-surface-canvas">
      {/* Header — back nav + "Retest" kicker */}
      <View className="h-14 flex-row items-center justify-between px-4">
        <Pressable
          onPress={() => router.back()}
          hitSlop={12}
          accessibilityLabel="Back"
          className="w-11 h-11 items-center justify-center -ml-2"
        >
          <Body color="primary" style={{ fontSize: 20 }}>
            ←
          </Body>
        </Pressable>
        <SectionLabel tracking="wide">RETEST</SectionLabel>
        <View className="w-11" />
      </View>

      {stage === 'intro' && (
        <IntroStage
          daysSince={daysSince}
          isEarly={isEarly}
          onStart={() => setStage('pulse-idle')}
        />
      )}
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
            setStage('saving');
          }}
        />
      )}
      {stage === 'saving' && (
        <View className="flex-1 items-center justify-center">
          <Body color="muted">Saving your retest…</Body>
        </View>
      )}
      {stage === 'done' && result ? (
        <DoneStage
          result={result}
          onClose={() => router.replace('/progress')}
        />
      ) : null}
    </SafeAreaView>
  );
}

function IntroStage({
  daysSince,
  isEarly,
  onStart,
}: {
  daysSince: number | null;
  isEarly: boolean;
  onStart: () => void;
}) {
  return (
    <View className="flex-1 px-6 pb-8">
      <View className="flex-1 justify-center">
        <Body
          weight="semibold"
          color="primary"
          style={{ fontSize: 28, lineHeight: 36 }}
        >
          Retest your Index
        </Body>
        <Body size="md" color="muted" className="mt-3">
          Two short tests — a 30-second pulse and one max hold. About a minute
          total. We recommend retesting every 2 weeks to track your trend
          reliably.
        </Body>

        {isEarly ? (
          // Soft-enforcement banner — never blocks the user, just informs.
          <Card
            padding="md"
            radius="card-tight"
            bordered
            className="mt-6"
            style={{ borderColor: '#E5484D33', backgroundColor: '#E5484D14' }}
          >
            <Body weight="semibold" color="primary">
              Your last retest was {daysSince} {daysSince === 1 ? 'day' : 'days'} ago.
            </Body>
            <Body size="sm" color="muted" className="mt-1">
              Results are most reliable when you wait at least{' '}
              {RETEST_INTERVAL_DAYS} days between tests — same-day variance
              (sleep, hydration, time of day) dominates the trend signal at
              shorter intervals. You can still proceed.
            </Body>
          </Card>
        ) : null}

        {daysSince !== null && !isEarly ? (
          <Body color="muted" size="sm" className="mt-6">
            Last retest: {daysSince} {daysSince === 1 ? 'day' : 'days'} ago.
          </Body>
        ) : null}
      </View>

      <Button
        label="Begin"
        variant="primary"
        size="lg"
        radius="cta"
        onPress={onStart}
      />
    </View>
  );
}

function DoneStage({
  result,
  onClose,
}: {
  result: PelvicFloorIndex;
  onClose: () => void;
}) {
  return (
    <View className="flex-1 px-6 pb-8">
      <View className="flex-1 justify-center items-center">
        <SectionLabel tracking="wide">UPDATED INDEX</SectionLabel>
        <Body
          weight="semibold"
          color="primary"
          className="mt-3"
          style={{ fontSize: 64, lineHeight: 72 }}
        >
          {Math.round(result.composite)}
        </Body>
        <Body color="muted" className="mt-1">
          {result.level.charAt(0).toUpperCase() + result.level.slice(1)}
        </Body>
        <Body color="muted" size="sm" className="mt-6 text-center px-6">
          Check your trend on Progress. Your next retest is available in{' '}
          {RETEST_INTERVAL_DAYS} days.
        </Body>
      </View>
      <Button
        label="Back to Progress"
        variant="primary"
        size="lg"
        radius="cta"
        onPress={onClose}
      />
    </View>
  );
}
