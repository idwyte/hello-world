// Figma: 23 · onboarding bail-out — node 106:342
// https://www.figma.com/design/qgY3Qcf7gP7w5V5A6uQTL4/?node-id=106-342
// Spec: docs/hone-roadmap-state.md line 101 (Figma-derived).
//
// Resume screen for mid-funnel drop-offs. "Welcome back, Jamie" + 5-step
// vertical timeline (3 done success-green / 1 current accent / 1 upcoming
// muted) · connecting line acts as a progress bar · Resume primary CTA
// routes to first incomplete step + Start over (destructive-confirm).
//
// FIGMA-DIFF (stub):
//   - Vertical timeline rendered as flat list; no connecting line or
//     coloured step badges.
//   - Resume always pushes to /assessment; full build inspects which step
//     the user actually bailed on (persisted in onboarding store).
//   - Start over is currently destructive; no Alert.confirm shown.
import { useRouter } from 'expo-router';
import { ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Body, Button, Card, SectionLabel } from '@/components/ui';
import { semantic } from '@/lib/theme';

const STEPS = [
  { label: 'Welcome', status: 'done' as const },
  { label: 'Assessment', status: 'done' as const },
  { label: 'Index test', status: 'done' as const },
  { label: 'Generate plan', status: 'current' as const },
  { label: 'Choose plan', status: 'upcoming' as const },
];

const STATUS_COLOR = {
  done: semantic.feedbackSuccess,
  current: semantic.interactivePrimary,
  upcoming: semantic.textMuted,
};

export default function Resume() {
  const router = useRouter();
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
            You&rsquo;re 3 of 5 steps into setup.
          </Body>
        </View>

        <Card padding="lg" radius="card" className="mt-6 gap-3">
          {STEPS.map((s) => (
            <View key={s.label} className="flex-row items-center">
              <View
                className="w-6 h-6 rounded-full mr-3"
                style={{ backgroundColor: STATUS_COLOR[s.status] }}
              />
              <Body
                weight={s.status === 'current' ? 'semibold' : 'regular'}
                color={s.status === 'upcoming' ? 'muted' : 'primary'}
              >
                {s.label}
              </Body>
            </View>
          ))}
        </Card>

        <Button
          label="Resume"
          variant="primary"
          size="lg"
          radius="cta"
          className="mt-6"
          onPress={() => router.replace('/assessment')}
        />
        <Button
          label="Start over"
          variant="ghost"
          size="md"
          className="mt-3"
          onPress={() => router.replace('/welcome')}
        />
      </ScrollView>
    </SafeAreaView>
  );
}
