// Figma: 31 · session review — node 124:378
// https://www.figma.com/design/qgY3Qcf7gP7w5V5A6uQTL4/?node-id=124-378
// Spec: docs/hone-roadmap-state.md line 102 (Figma-derived).
//
// Detail header "Day 3 review" · success-green completion kicker + summary
// banner with meta pills · PER EXERCISE list with checked badges and
// per-set status dots · accent-soft retest nudge card · Back to today CTA
// + muted Repeat session secondary.
//
// FIGMA-DIFF (stub):
//   - Per-exercise list with per-set status dots not rendered; stub shows
//     name + reps only.
//   - Retest nudge card omitted; promote with index-history check.
//   - Real data hookup deferred — currently shows hardcoded exercise list.
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Pressable, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Body, Button, Card, Pill, SectionLabel } from '@/components/ui';

export default function DayReview() {
  const router = useRouter();
  const { dayId } = useLocalSearchParams<{ dayId: string }>();

  return (
    <SafeAreaView className="flex-1 bg-surface-canvas">
      <View className="h-14 flex-row items-center px-4">
        <Pressable
          onPress={() => router.back()}
          hitSlop={12}
          accessibilityLabel="Back"
          className="w-11 h-11 items-center justify-center"
        >
          <Body color="primary" style={{ fontSize: 20 }}>
            ←
          </Body>
        </Pressable>
        <View className="flex-1 items-center -ml-11">
          <Body weight="semibold" color="primary" style={{ fontSize: 17, lineHeight: 24 }}>
            Day {dayId ?? '?'} review
          </Body>
        </View>
      </View>

      <ScrollView className="flex-1" contentContainerClassName="px-4 pb-32">
        <SectionLabel tracking="wide" className="text-feedback-success">
          COMPLETED · MAR 4
        </SectionLabel>
        <Body
          weight="semibold"
          color="primary"
          className="mt-2"
          style={{ fontSize: 28, lineHeight: 36 }}
        >
          Nice work.
        </Body>
        <View className="flex-row gap-2 mt-3">
          <Pill label="5:12" tone="surface" size="sm" bordered />
          <Pill label="30 reps" tone="surface" size="sm" bordered />
          <Pill label="Set 3 of 3" tone="surface" size="sm" bordered />
        </View>

        <SectionLabel tracking="wide" className="mt-6">
          PER EXERCISE
        </SectionLabel>
        <View className="gap-2 mt-3">
          {['Quick flicks · 3 × 10', 'Long holds · 2 × 30s', 'Reverse Kegels · 2 × 20s'].map(
            (e) => (
              <Card key={e} padding="md" radius="card-tight">
                <View className="flex-row items-center justify-between">
                  <Body color="primary">{e}</Body>
                  <Body color="success">✓</Body>
                </View>
              </Card>
            ),
          )}
        </View>
      </ScrollView>

      <View className="absolute bottom-0 left-0 right-0 px-4 pb-8">
        <Button
          label="Back to today"
          variant="primary"
          size="lg"
          radius="cta"
          onPress={() => router.replace('/home')}
        />
        <Button
          label="Repeat session"
          variant="ghost"
          size="md"
          className="mt-2"
          onPress={() => router.push('/session/today')}
        />
      </View>
    </SafeAreaView>
  );
}
