import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import { ActivityIndicator, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { isAssessmentComplete } from '@/lib/assessment-questions';
import {
  buildProgram,
  defaultStealthFromAnswers,
  recommendLevel,
} from '@/lib/program';
import { useOnboardingStore } from '@/stores/onboarding';

/**
 * Generates the program locally from the draft answers. M3 will persist it
 * to Supabase before showing the paywall.
 */
export default function Generating() {
  const router = useRouter();
  const draft = useOnboardingStore((s) => s.draft);
  const setGenerated = useOnboardingStore((s) => s.setGenerated);

  useEffect(() => {
    if (!isAssessmentComplete(draft)) {
      router.replace('/welcome');
      return;
    }
    const level = recommendLevel(draft);
    const program = buildProgram(level, draft.dailyMinutes, draft.goal);
    const stealthDefault = defaultStealthFromAnswers(draft);
    setGenerated({ level, program, stealthDefault });

    // Brief pause for UX; the actual computation finishes synchronously.
    const id = setTimeout(() => router.replace('/plan-preview'), 1400);
    return () => clearTimeout(id);
  }, [draft, router, setGenerated]);

  return (
    <SafeAreaView className="flex-1 bg-bg">
      <View className="flex-1 items-center justify-center px-6">
        <ActivityIndicator color="#7C5CFF" size="large" />
        <Text className="text-ink text-xl font-semibold mt-6">
          Building your plan…
        </Text>
        <Text className="text-muted text-center mt-2 leading-5">
          Tuning eight weeks of sessions to your strength, goal, and daily time.
        </Text>
      </View>
    </SafeAreaView>
  );
}
