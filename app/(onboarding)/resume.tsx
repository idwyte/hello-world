// Obsidian Kinetic: onboarding bail-out / resume. Timeline derived from
// the Zustand onboarding store (which step the user actually reached);
// Start over keeps its destructive confirm.
import { useRouter } from 'expo-router';
import { Alert, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '@/components/obsidian';
import { isAssessmentComplete } from '@/lib/assessment-questions';
import { color, glass, radius, spacing, type } from '@/lib/obsidian/tokens';
import { useOnboardingStore } from '@/stores/onboarding';

type Status = 'done' | 'current' | 'upcoming';
type ResumeStep = { label: string; status: Status; route: string };

const STATUS_COLOR: Record<Status, string> = {
  done: color.primaryFixedDim,
  current: color.primaryContainer,
  upcoming: color.surfaceContainerHigh,
};

function buildSteps(
  draft: object,
  hasV2: boolean,
  hasGenerated: boolean,
): { steps: ResumeStep[]; resumeRoute: string; doneCount: number } {
  const assessmentDone = isAssessmentComplete(
    draft as Parameters<typeof isAssessmentComplete>[0],
  );
  const steps: ResumeStep[] = [
    { label: 'Welcome', status: 'done', route: '/welcome' },
    { label: 'Baseline intro', status: 'done', route: '/assessment-intro' },
    {
      label: 'Six measurements',
      status: hasV2 ? 'done' : 'current',
      route: '/index-test',
    },
    {
      label: 'Context questions',
      status: assessmentDone ? 'done' : hasV2 ? 'current' : 'upcoming',
      route: '/assessment',
    },
    {
      label: 'Build plan',
      status: hasGenerated
        ? 'done'
        : assessmentDone && hasV2
          ? 'current'
          : 'upcoming',
      route: '/generating',
    },
  ];
  const current = steps.find((s) => s.status === 'current');
  return {
    steps,
    resumeRoute: current?.route ?? '/home',
    doneCount: steps.filter((s) => s.status === 'done').length,
  };
}

export default function Resume() {
  const router = useRouter();
  const draft = useOnboardingStore((s) => s.draft);
  const v2 = useOnboardingStore((s) => s.v2);
  const generated = useOnboardingStore((s) => s.generated);
  const reset = useOnboardingStore((s) => s.reset);

  const { steps, resumeRoute, doneCount } = buildSteps(
    draft,
    v2.release !== undefined,
    !!generated,
  );

  function handleStartOver() {
    Alert.alert(
      'Start over?',
      "You'll lose your answers and retake the measurements.",
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Start over',
          style: 'destructive',
          onPress: () => {
            reset();
            router.replace('/welcome');
          },
        },
      ],
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: color.background }}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          flexGrow: 1,
          paddingHorizontal: spacing.containerPadding,
          paddingTop: spacing.stackLg * 2,
          paddingBottom: spacing.stackLg + spacing.stackMd,
          gap: spacing.stackMd,
        }}
      >
        <Text style={{ ...type.labelCaps, color: color.onSurfaceVariant }}>
          WELCOME BACK
        </Text>
        <Text style={{ ...type.headlineLg, color: color.onSurface }}>
          Pick up where you left off
        </Text>
        <Text style={{ ...type.bodyMd, color: color.onSurfaceVariant }}>
          You&rsquo;re {doneCount} of {steps.length} steps into setup.
        </Text>

        <View
          style={{
            backgroundColor: color.surfaceContainerLow,
            borderColor: glass.border,
            borderWidth: glass.borderWidth,
            borderRadius: radius.xl,
            padding: spacing.containerPadding,
          }}
        >
          {steps.map((s, i) => {
            const isLast = i === steps.length - 1;
            return (
              <View key={s.label} style={{ flexDirection: 'row' }}>
                <View style={{ alignItems: 'center', width: 24 }}>
                  <View
                    style={{
                      width: 16,
                      height: 16,
                      borderRadius: radius.full,
                      backgroundColor: STATUS_COLOR[s.status],
                    }}
                  />
                  {!isLast && (
                    <View
                      style={{
                        width: 2,
                        flex: 1,
                        minHeight: 22,
                        marginVertical: 2,
                        backgroundColor:
                          s.status === 'done'
                            ? color.primaryFixedDim
                            : color.surfaceContainerHigh,
                      }}
                    />
                  )}
                </View>
                <Text
                  style={{
                    ...(s.status === 'current'
                      ? type.labelButton
                      : type.bodyLg),
                    color:
                      s.status === 'upcoming'
                        ? color.onSurfaceVariant
                        : color.onSurface,
                    marginLeft: spacing.gutter,
                    paddingBottom: isLast ? 0 : spacing.containerPadding,
                  }}
                >
                  {s.label}
                </Text>
              </View>
            );
          })}
        </View>

        <View style={{ flex: 1 }} />
        <Button
          label="Resume"
          onPress={() =>
            router.replace(
              resumeRoute as Parameters<typeof router.replace>[0],
            )
          }
          style={{ width: '100%' }}
        />
        <Button
          label="Start over"
          variant="ghost"
          onPress={handleStartOver}
          style={{ width: '100%' }}
        />
      </ScrollView>
    </SafeAreaView>
  );
}
