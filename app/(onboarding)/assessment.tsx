// Obsidian Kinetic: 10 · Assess · Age (context) — Figma node 27:33.
// One template for all four context questions (age band, strength days,
// cardio days, intimacy frequency). 2-col option grid per Figma; the
// numeric questions wrap the same option pills into rows.
//
// Flow unchanged: measurements (/index-test) happen BEFORE these; after
// the last question we route through /ai-consent then /generating.
import { useRouter } from 'expo-router';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button, ScreenHeader } from '@/components/obsidian';
import { QUESTIONS } from '@/lib/assessment-questions';
import { fireHaptic } from '@/lib/obsidian/haptics';
import { color, glass, radius, spacing, type } from '@/lib/obsidian/tokens';
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
    if (step < QUESTIONS.length - 1) {
      next();
    } else {
      // AI-consent gate before lifestyle answers can leave the device.
      router.replace('/ai-consent');
    }
  }

  // Compact numeric scales (0–7) render as a wrapping row of square
  // pills; everything else uses the Figma 2-col grid.
  const isSegmented = question.layout === 'segmented';

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: color.background }}>
      <ScreenHeader
        variant="back"
        onPress={() => (step === 0 ? router.back() : prev())}
      />
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          flexGrow: 1,
          paddingHorizontal: spacing.containerPadding,
          paddingTop: spacing.stackLg,
          paddingBottom: spacing.stackLg + spacing.stackMd,
          gap: spacing.containerPadding,
        }}
      >
        <Text
          style={{
            ...type.labelCaps,
            color: color.onSurfaceVariant,
            textAlign: 'center',
          }}
        >
          QUESTION {step + 1} OF {QUESTIONS.length}
        </Text>
        <Text
          style={{
            ...type.headlineLg,
            color: color.onSurface,
            textAlign: 'center',
          }}
        >
          {question.prompt}
        </Text>
        {question.help ? (
          <Text
            style={{
              ...type.bodyMd,
              color: color.onSurfaceVariant,
              textAlign: 'center',
            }}
          >
            {question.help}
          </Text>
        ) : null}

        <View
          style={{
            flexDirection: 'row',
            flexWrap: 'wrap',
            gap: spacing.gutter,
          }}
        >
          {question.choices.map((choice) => {
            const selected = value === choice.value;
            return (
              <Pressable
                key={String(choice.value)}
                onPress={() => {
                  void fireHaptic('selection');
                  setAnswer(question.id, choice.value as never);
                }}
                accessibilityRole="radio"
                // Pass both `selected` AND `checked` so Android
                // TalkBack announces "selected" rather than just
                // "double tap to activate" — matches the pattern in
                // AssessmentBatteryV2 OptionRow.
                accessibilityState={{ selected, checked: selected }}
                accessibilityLabel={choice.label}
                style={{
                  // Explicit width + flexShrink:0 stops RN's default
                  // flexShrink:1 from collapsing a 4-item list into one
                  // narrow row (which is what was wrapping "A few times
                  // a week" awkwardly).
                  // Segmented (0-7 scales) → 4 per row; lists → 2 per row.
                  width: isSegmented ? '22%' : '48%',
                  flexShrink: 0,
                  minHeight: 64,
                  paddingHorizontal: 8,
                  paddingVertical: 8,
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: radius.xl,
                  backgroundColor: color.surfaceContainerLow,
                  borderColor: selected
                    ? color.primaryContainer
                    : glass.border,
                  borderWidth: selected ? 2 : 1,
                }}
              >
                <Text
                  numberOfLines={2}
                  style={{
                    ...(selected ? type.labelButton : type.bodyLg),
                    // Drop one size on wide labels so "A few times a
                    // week" lands on a single line on a Pixel-7-class
                    // device.
                    ...(choice.label.length > 12
                      ? { fontSize: 15, lineHeight: 20 }
                      : null),
                    textAlign: 'center',
                    color: selected
                      ? color.primaryFixedDim
                      : color.onSurface,
                  }}
                >
                  {choice.label}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <View style={{ flex: 1 }} />
        <Button
          label={
            step === QUESTIONS.length - 1 ? 'Build my plan' : 'Continue'
          }
          disabled={!hasValue}
          onPress={handleNext}
          style={{ width: '100%' }}
        />
      </ScrollView>
    </SafeAreaView>
  );
}
