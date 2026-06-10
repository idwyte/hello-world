// Onboarding host for the v2 six-step battery. Stores the answers,
// computes the legacy-compatible Hone Index (continuity shim), and
// advances to the context questions.
import { useRouter } from 'expo-router';

import { AssessmentBatteryV2 } from '@/components/assessment/AssessmentBatteryV2';
import { v2ToLegacyMeasurements } from '@/lib/assessment-v2';
import { scoreIndex } from '@/lib/pelvic-floor-index';
import { useOnboardingStore } from '@/stores/onboarding';

export default function IndexTest() {
  const router = useRouter();
  const setV2 = useOnboardingStore((s) => s.setV2);
  const setIndex = useOnboardingStore((s) => s.setIndex);

  return (
    <AssessmentBatteryV2
      onExit={() => router.back()}
      onFinish={(answers) => {
        setV2('strengthOxford', answers.strengthOxford);
        setV2('enduranceSeconds', answers.enduranceSeconds);
        setV2('repCeiling', answers.repCeiling);
        setV2('fastCount', answers.fastCount);
        setV2('coordinationFlags', answers.coordinationFlags);
        setV2('release', answers.release);
        setV2('symptomFlags', answers.symptomFlags);
        // Legacy Hone Index continuity — composite + level from the two
        // overlapping measures, so trends span the v1→v2 transition.
        setIndex(scoreIndex(v2ToLegacyMeasurements(answers)));
        router.push('/assessment');
      }}
    />
  );
}
