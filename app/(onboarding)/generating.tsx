import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { isAssessmentComplete } from '@/lib/assessment-questions';
import { saveAssessmentAndProgram } from '@/lib/persistence';
import {
  buildProgram,
  defaultStealthFromAnswers,
  recommendLevel,
} from '@/lib/program';
import { useOnboardingStore } from '@/stores/onboarding';

/**
 * Generates the program locally from the Pelvic Floor Index + answers,
 * persists to Supabase (when configured), then navigates to plan-preview.
 */
export default function Generating() {
  const router = useRouter();
  const draft = useOnboardingStore((s) => s.draft);
  const index = useOnboardingStore((s) => s.index);
  const setGenerated = useOnboardingStore((s) => s.setGenerated);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    if (!isAssessmentComplete(draft) || !index) {
      router.replace('/welcome');
      return;
    }
    const level = recommendLevel(index);
    // Phase A: buildProgram signature simplified — `goal` and `dailyMinutes`
    // are gone from AssessmentAnswers. Phase C swaps this for an async
    // Edge-Function call; this is the dev-mode rule-based fallback path.
    const program = buildProgram(level, [], 8);
    const stealthDefault = defaultStealthFromAnswers(draft);
    setGenerated({ level, program, stealthDefault });

    (async () => {
      const minDelay = new Promise((r) => setTimeout(r, 1400));
      try {
        await Promise.all([
          saveAssessmentAndProgram({
            answers: draft,
            index,
            level,
            program,
          }),
          minDelay,
        ]);
      } catch (e) {
        if (cancelled) return;
        const msg =
          e instanceof Error
            ? e.message
            : "Couldn't save your plan. Try again.";
        setError(msg);
        Alert.alert('Save failed', msg, [
          { text: 'Retry', onPress: () => router.replace('/generating') },
          { text: 'Cancel', onPress: () => router.replace('/welcome') },
        ]);
        return;
      }
      if (!cancelled) router.replace('/plan-preview');
    })();

    return () => {
      cancelled = true;
    };
  }, [draft, index, router, setGenerated]);

  return (
    <SafeAreaView className="flex-1 bg-bg">
      <View className="flex-1 items-center justify-center px-6">
        <ActivityIndicator color="#7C5CFF" size="large" />
        <Text className="text-ink text-xl font-semibold mt-6">
          Building your plan…
        </Text>
        <Text className="text-muted text-center mt-2 leading-5">
          Tuning eight weeks of sessions to your Index, goal, and daily time.
        </Text>
        {error ? (
          <Text className="text-danger text-sm mt-6 text-center">{error}</Text>
        ) : null}
      </View>
    </SafeAreaView>
  );
}
