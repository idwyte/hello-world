import { useRouter } from 'expo-router';
import { Alert, Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ProgressDots } from '@/components/assessment/ProgressDots';
import { QuestionCard } from '@/components/assessment/QuestionCard';
import { QUESTIONS } from '@/lib/assessment-questions';
import { useOnboardingStore } from '@/stores/onboarding';

export default function Assessment() {
  const router = useRouter();
  const { step, draft, setAnswer, next, prev } = useOnboardingStore();

  const question = QUESTIONS[step];
  const value = draft[question.id];
  const hasValue =
    question.kind === 'multi'
      ? Array.isArray(value) && (value as unknown[]).length > 0
      : value !== undefined;

  function handleNext() {
    if (!hasValue) return;
    if (question.id === 'recentMedical' && value === true) {
      Alert.alert(
        'Medical note',
        'Pelvic surgery, prolapse, or related conditions need clinician oversight. Continue only if you have been cleared to train. This app is not medical advice.',
        [
          { text: 'Go back', style: 'cancel' },
          {
            text: 'I understand',
            onPress: () => proceed(),
          },
        ],
      );
      return;
    }
    proceed();
  }

  function proceed() {
    if (step < QUESTIONS.length - 1) {
      next();
    } else {
      router.replace('/generating');
    }
  }

  return (
    <SafeAreaView className="flex-1 bg-bg">
      <View className="flex-1 px-6 pt-4 pb-6">
        <View className="flex-row items-center justify-between">
          <Pressable
            onPress={() => (step === 0 ? router.back() : prev())}
            className="py-3 px-3 -ml-3 active:opacity-60"
            hitSlop={12}
            accessibilityRole="button"
            accessibilityLabel="Previous question"
          >
            <Text className="text-muted">← Back</Text>
          </Pressable>
          <Text className="text-muted text-xs">
            {step + 1} / {QUESTIONS.length}
          </Text>
        </View>

        <View className="mt-3">
          <ProgressDots total={QUESTIONS.length} current={step} />
        </View>

        <ScrollView
          className="flex-1 mt-8"
          contentContainerClassName="pb-6"
          showsVerticalScrollIndicator={false}
        >
          <QuestionCard
            question={question}
            value={value}
            onSelect={(v) => setAnswer(question.id, v as never)}
          />
        </ScrollView>

        <Pressable
          onPress={handleNext}
          disabled={!hasValue}
          accessibilityRole="button"
          accessibilityLabel={
            step === QUESTIONS.length - 1 ? 'Finish assessment' : 'Next question'
          }
          accessibilityState={{ disabled: !hasValue }}
          className={`rounded-xl py-4 items-center active:opacity-80 ${
            hasValue ? 'bg-accent' : 'bg-surface2'
          }`}
        >
          <Text className="text-ink font-semibold">
            {step === QUESTIONS.length - 1 ? 'See my plan' : 'Continue'}
          </Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
