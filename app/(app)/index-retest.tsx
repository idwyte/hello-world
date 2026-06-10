// Obsidian Kinetic: the 8-week retest — all five measures again
// (handoff §4: the retest is the multi-axis before/after, "the
// strongest version of the renewal moment").
//
// Reuses the shared v2 battery. Saving keeps the legacy persistence
// path (saveIndexRetest with the continuity-shim measurements) and
// invalidates the ['index','history'] cache so the Streaks radar
// redraws with the new polygon.
//
// Early-retest cadence stays soft: a warning intro if it's been under
// 14 days, never a block.
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert } from 'react-native';

import { AssessmentBatteryV2 } from '@/components/assessment/AssessmentBatteryV2';
import { StateScreen } from '@/components/obsidian';
import { hasSupabaseConfig } from '@/lib/env';
import { v2ToLegacyMeasurements } from '@/lib/assessment-v2';
import { saveIndexRetest } from '@/lib/persistence';
import { scoreIndex } from '@/lib/pelvic-floor-index';
import {
  daysSinceLastIndex,
  fetchIndexHistory,
  RETEST_INTERVAL_DAYS,
} from '@/lib/sessions';

export default function IndexRetest() {
  const router = useRouter();
  const qc = useQueryClient();
  const [started, setStarted] = useState(false);
  const [saving, setSaving] = useState(false);

  const historyQuery = useQuery({
    queryKey: ['index', 'history'],
    enabled: hasSupabaseConfig(),
    queryFn: () => fetchIndexHistory(12),
  });
  const daysSince = daysSinceLastIndex(historyQuery.data ?? []);
  const isEarly = daysSince !== null && daysSince < RETEST_INTERVAL_DAYS;

  if (!started) {
    return (
      <StateScreen
        onBack={() => router.back()}
        kicker={isEarly ? `LAST RETEST ${daysSince}D AGO` : 'RETEST'}
        title={isEarly ? 'Retesting early?' : 'Time to remeasure'}
        body={
          isEarly
            ? `The trend reads cleanest at ${RETEST_INTERVAL_DAYS}-day intervals — day-to-day noise can hide real change. You can still go ahead.`
            : "All five measures again — about four minutes. Your next phase is built from what changes."
        }
        primaryLabel={saving ? 'Saving…' : 'Begin retest'}
        primaryDisabled={saving}
        onPrimary={() => setStarted(true)}
        ghostLabel="Not now"
        onGhost={() => router.back()}
      />
    );
  }

  return (
    <AssessmentBatteryV2
      onExit={() => setStarted(false)}
      onFinish={(answers) => {
        if (saving) return;
        setSaving(true);
        const index = scoreIndex(v2ToLegacyMeasurements(answers));
        saveIndexRetest(index)
          .then(async () => {
            await qc.invalidateQueries({ queryKey: ['index', 'history'] });
            router.replace('/progress');
          })
          .catch((e) => {
            setSaving(false);
            setStarted(false);
            Alert.alert(
              'Save failed',
              e instanceof Error ? e.message : 'Try again in a moment.',
            );
          });
      }}
    />
  );
}
