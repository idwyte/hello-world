// Figma: 23 · onboarding bail-out — node 106:342
//
// Resume mid-funnel drop-offs. Reads the Zustand onboarding store to
// derive how far the user got + which step to jump back into. Start
// over is a destructive Alert confirm.
import { useRouter } from 'expo-router';
import { Alert, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Body, Button, Card, SectionLabel } from '@/components/ui';
import { isAssessmentComplete } from '@/lib/assessment-questions';
import { semantic } from '@/lib/theme';
import { useOnboardingStore } from '@/stores/onboarding';

type Status = 'done' | 'current' | 'upcoming';
type ResumeStep = { label: string; status: Status; route: string };

const STATUS_COLOR: Record<Status, string> = {
  done: semantic.feedbackSuccess,
  current: semantic.interactivePrimary,
  upcoming: semantic.textMuted,
};

function buildSteps(draft: object, hasIndex: boolean, hasGenerated: boolean): {
  steps: ResumeStep[];
  resumeRoute: string;
  doneCount: number;
} {
  // Funnel order, sortest summary copy fits the Figma timeline:
  //   1 Welcome → 2 Intro test → 3 Index test → 4 Assessment Qs → 5 Plan
  const assessmentDone = isAssessmentComplete(
    draft as Parameters<typeof isAssessmentComplete>[0],
  );
  const steps: ResumeStep[] = [
    { label: 'Welcome', status: 'done', route: '/welcome' },
    {
      label: 'Test intro',
      status: 'done',
      route: '/assessment-intro',
    },
    {
      label: 'Index test',
      status: hasIndex ? 'done' : 'current',
      route: '/index-test',
    },
    {
      label: 'Assessment',
      status: assessmentDone
        ? 'done'
        : hasIndex
          ? 'current'
          : 'upcoming',
      route: '/assessment',
    },
    {
      label: 'Generate plan',
      status: hasGenerated
        ? 'done'
        : assessmentDone && hasIndex
          ? 'current'
          : 'upcoming',
      route: '/generating',
    },
  ];

  // Resume route = the first non-done step's route. Fall back to /home
  // (no current step means onboarding is complete — uncommon entry).
  const current = steps.find((s) => s.status === 'current');
  const resumeRoute = current?.route ?? '/home';
  const doneCount = steps.filter((s) => s.status === 'done').length;
  return { steps, resumeRoute, doneCount };
}

export default function Resume() {
  const router = useRouter();
  const draft = useOnboardingStore((s) => s.draft);
  const index = useOnboardingStore((s) => s.index);
  const generated = useOnboardingStore((s) => s.generated);
  const reset = useOnboardingStore((s) => s.reset);

  const { steps, resumeRoute, doneCount } = buildSteps(
    draft,
    !!index,
    !!generated,
  );

  function handleStartOver() {
    Alert.alert(
      'Start over?',
      "You'll lose your assessment answers and have to retake the index test.",
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
    <SafeAreaView className="flex-1 bg-surface-canvas">
      <ScrollView className="flex-1" contentContainerClassName="px-6 pb-12">
        <View className="mt-12">
          <SectionLabel tracking="wide">WELCOME BACK</SectionLabel>
          <Body
            weight="semibold"
            color="primary"
            className="mt-2"
            style={{ fontSize: 30, lineHeight: 38 }}
          >
            Pick up where you left off.
          </Body>
          <Body size="md" color="muted" className="mt-2">
            You&rsquo;re {doneCount} of {steps.length} steps into setup.
          </Body>
        </View>

        <Card padding="lg" radius="card" className="mt-6">
          {steps.map((s, i) => {
            const isLast = i === steps.length - 1;
            return (
              <View key={s.label} className="flex-row items-start">
                <View className="items-center mr-3" style={{ width: 24 }}>
                  <View
                    className="w-6 h-6 rounded-full"
                    style={{ backgroundColor: STATUS_COLOR[s.status] }}
                  />
                  {!isLast && (
                    <View
                      style={{
                        width: 2,
                        flex: 1,
                        marginTop: 2,
                        minHeight: 22,
                        backgroundColor:
                          s.status === 'done'
                            ? semantic.feedbackSuccess
                            : semantic.borderDefault,
                      }}
                    />
                  )}
                </View>
                <View className="flex-1 pb-5">
                  <Body
                    weight={s.status === 'current' ? 'semibold' : 'regular'}
                    color={s.status === 'upcoming' ? 'muted' : 'primary'}
                  >
                    {s.label}
                  </Body>
                </View>
              </View>
            );
          })}
        </Card>

        <Button
          label="Resume"
          variant="primary"
          size="lg"
          radius="cta"
          className="mt-6"
          onPress={() =>
            router.replace(
              resumeRoute as Parameters<typeof router.replace>[0],
            )
          }
        />
        <Button
          label="Start over"
          variant="ghost"
          size="md"
          className="mt-3"
          onPress={handleStartOver}
        />
      </ScrollView>
    </SafeAreaView>
  );
}
