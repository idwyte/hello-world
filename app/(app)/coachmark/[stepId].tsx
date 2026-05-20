// Figma: 35 · coachmark overlay — node 134:353
// https://www.figma.com/design/qgY3Qcf7gP7w5V5A6uQTL4/?node-id=134-353
// Spec: docs/hone-roadmap-state.md line 106 (Figma-derived).
//
// First-launch home-screen tour. 75% scrim drawn as 4 surrounding
// rectangles cutting a spotlight around a target · 2 px accent ring on
// the target · tooltip card with up-pointing pointer aligned to target
// centre · 3-dot step indicator (current widened to 20×6 pill) + Skip
// tour link · in-card accent Next CTA.
//
// FIGMA-DIFF (stub):
//   - No spotlight cut-out or actual overlay behaviour — stub renders as a
//     standalone screen with the tooltip content centered.
//   - No target-position math; full build needs measureLayout() on the
//     real target element and absolute-position the cut-outs accordingly.
//   - 3-dot step indicator rendered, current widened.
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Pressable, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Body, Button, Card, SectionLabel } from '@/components/ui';
import { semantic } from '@/lib/theme';

const STEPS: Record<string, { title: string; body: string; next: string }> = {
  '1': {
    title: 'Your daily streak lives here',
    body: 'Tap the drop chip to see how many days you\'ve trained.',
    next: '2',
  },
  '2': {
    title: 'Start a session in one tap',
    body: 'The day\'s exercises are pre-loaded — just hit Start.',
    next: '3',
  },
  '3': {
    title: 'Track your progress weekly',
    body: 'Re-test your Pelvic Floor Index from the Progress tab.',
    next: 'done',
  },
};

const STEP_ORDER = ['1', '2', '3'] as const;

export default function Coachmark() {
  const router = useRouter();
  const { stepId } = useLocalSearchParams<{ stepId: string }>();
  const id = stepId ?? '1';
  const step = STEPS[id] ?? STEPS['1'];
  const idx = STEP_ORDER.indexOf(id as (typeof STEP_ORDER)[number]);

  const handleNext = () => {
    if (step.next === 'done') router.replace('/home');
    else router.replace(`/coachmark/${step.next}`);
  };

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: '#000000B3' /* 70% scrim */ }}>
      <View className="flex-1 justify-end px-6 pb-16">
        <Card padding="lg" radius="card-hero" className="bg-surface-raised">
          <SectionLabel tracking="wide" className="text-interactive-primary">
            STEP {idx + 1} OF 3
          </SectionLabel>
          <Body
            weight="semibold"
            color="primary"
            className="mt-2"
            style={{ fontSize: 22, lineHeight: 28 }}
          >
            {step.title}
          </Body>
          <Body color="muted" className="mt-2">
            {step.body}
          </Body>
          <View className="flex-row items-center justify-between mt-6">
            <View className="flex-row gap-1.5 items-center">
              {STEP_ORDER.map((s, i) => (
                <View
                  key={s}
                  style={{
                    width: i === idx ? 20 : 6,
                    height: 6,
                    borderRadius: 3,
                    backgroundColor:
                      i === idx
                        ? semantic.interactivePrimary
                        : semantic.borderDefault,
                  }}
                />
              ))}
            </View>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Skip tour"
              onPress={() => router.replace('/home')}
            >
              <Body size="sm" weight="medium" color="muted">
                Skip tour
              </Body>
            </Pressable>
          </View>
          <Button
            label={step.next === 'done' ? 'Got it' : 'Next'}
            variant="primary"
            size="lg"
            radius="cta"
            className="mt-5"
            onPress={handleNext}
          />
        </Card>
      </View>
    </SafeAreaView>
  );
}
