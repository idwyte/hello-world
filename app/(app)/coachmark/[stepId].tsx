// Obsidian Kinetic: first-launch coachmark tour. Dimmed scrim + bottom
// card + step pills. (Spotlight cut-out via measureLayout stays
// deferred — visual nicety, not blocking.)
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '@/components/obsidian';
import { color, overlay, radius, spacing, type } from '@/lib/obsidian/tokens';

const STEPS: Record<string, { title: string; body: string; next: string }> = {
  '1': {
    title: 'Your Hone Index lives here',
    body: 'The number on Home is your measured baseline — it moves with every retest.',
    next: '2',
  },
  '2': {
    title: 'Start a session in one tap',
    body: "The day's phases are pre-loaded — just hit Start.",
    next: '3',
  },
  '3': {
    title: 'Track your trend',
    body: 'Retest every 8 weeks from the Streaks tab and watch the polygon move.',
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
    <SafeAreaView style={{ flex: 1, backgroundColor: overlay.scrim }}>
      <View
        style={{
          flex: 1,
          justifyContent: 'flex-end',
          paddingHorizontal: spacing.containerPadding,
          paddingBottom: spacing.stackLg * 2,
        }}
      >
        <View
          style={{
            backgroundColor: color.surfaceContainerLow,
            borderColor: 'rgba(255,255,255,0.1)',
            borderWidth: 1,
            borderRadius: radius.xl,
            padding: spacing.containerPadding,
            gap: spacing.stackSm,
          }}
        >
          <Text style={{ ...type.labelCaps, color: color.primaryFixedDim }}>
            STEP {idx + 1} OF 3
          </Text>
          <Text style={{ ...type.headlineMd, color: color.onSurface }}>
            {step.title}
          </Text>
          <Text style={{ ...type.bodyMd, color: color.onSurfaceVariant }}>
            {step.body}
          </Text>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginTop: spacing.stackSm,
            }}
          >
            <View style={{ flexDirection: 'row', gap: 6 }}>
              {STEP_ORDER.map((s, i) => (
                <View
                  key={s}
                  style={{
                    width: i === idx ? 20 : 6,
                    height: 6,
                    borderRadius: 3,
                    backgroundColor:
                      i === idx
                        ? color.primaryContainer
                        : color.surfaceContainerHigh,
                  }}
                />
              ))}
            </View>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Skip tour"
              onPress={() => router.replace('/home')}
            >
              <Text
                style={{ ...type.labelCaps, color: color.onSurfaceVariant }}
              >
                SKIP TOUR
              </Text>
            </Pressable>
          </View>
          <Button
            label={step.next === 'done' ? 'Got it' : 'Next'}
            onPress={handleNext}
            style={{ width: '100%', marginTop: spacing.stackSm }}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}
