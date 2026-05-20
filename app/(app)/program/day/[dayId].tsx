// Figma: 24 · day detail — node 109:345
// https://www.figma.com/design/qgY3Qcf7gP7w5V5A6uQTL4/?node-id=109-345
//
// Detail of a single program day. Reached by tapping a day cell on /program.
// Hero (kicker + title + meta chips) + exercise list + Start session.
//
// FIGMA-DIFF (stub):
//   - Data is hardcoded (no fetch of program_day by dayId yet); promote to
//     real query against program_days table using params.dayId.
//   - 40×40 accent-soft exercise glyph rendered as bullet; full build uses
//     per-exercise illustration.
//   - 4 state variants (today/completed/upcoming/rest) not implemented;
//     stub renders only the "today" variant.
//   - Start CTA play glyph rendered as text "▶"; promote to lucide Play.
import { Link, useLocalSearchParams, useRouter } from 'expo-router';
import { Play } from 'lucide-react-native';
import { ChevronRight } from 'lucide-react-native';
import { Pressable, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Body, Button, Pill, SectionLabel } from '@/components/ui';
import { semantic } from '@/lib/theme';

type Exercise = {
  id: string;
  name: string;
  descriptor: string;
  reps: string;
};

const STUB_EXERCISES: Exercise[] = [
  { id: 'quick_flicks', name: 'Quick flicks', descriptor: 'Fast contractions', reps: '3 × 10 reps' },
  { id: 'long_holds', name: 'Long holds', descriptor: 'Sustained contractions', reps: '2 × 30 s' },
  { id: 'reverse_kegels', name: 'Reverse Kegels', descriptor: 'Active relaxation', reps: '2 × 20 s' },
];

export default function DayDetail() {
  const router = useRouter();
  const { dayId } = useLocalSearchParams<{ dayId: string }>();

  return (
    <SafeAreaView className="flex-1 bg-surface-canvas">
      {/* Detail header — back + centered title */}
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
            Day {dayId ?? '?'}
          </Body>
        </View>
      </View>

      <ScrollView className="flex-1" contentContainerClassName="px-6 pb-32">
        {/* Hero block — Figma `109:301` */}
        <SectionLabel tracking="wide" className="text-interactive-primary">
          TODAY · WEEK 1
        </SectionLabel>
        <Body
          weight="semibold"
          color="primary"
          className="mt-3"
          style={{ fontSize: 30, lineHeight: 38 }}
        >
          Coordination
        </Body>
        <Body color="muted" size="sm" className="mt-3">
          Sharpens fast-twitch control. Best done seated.
        </Body>
        <View className="flex-row gap-2 mt-4">
          <Pill label="5 min" tone="surface" size="sm" bordered textColor="primary" />
          <Pill label="3 exercises" tone="surface" size="sm" bordered textColor="primary" />
          <Pill label="30 reps total" tone="surface" size="sm" bordered textColor="primary" />
        </View>

        <SectionLabel tracking="wide" className="mt-8">
          TODAY&rsquo;S EXERCISES
        </SectionLabel>
        <View className="gap-2.5 mt-3">
          {STUB_EXERCISES.map((ex) => (
            <Link key={ex.id} href={`/program/exercise/${ex.id}`} asChild>
              <Pressable
                className="flex-row items-center bg-surface-raised rounded-[14px] px-3.5 py-3.5 active:opacity-80"
                accessibilityLabel={`${ex.name}, ${ex.reps}`}
              >
                <View
                  className="w-10 h-10 rounded-full items-center justify-center"
                  style={{ backgroundColor: semantic.interactivePrimaryPressed }}
                >
                  <View
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: semantic.interactivePrimary }}
                  />
                </View>
                <View className="ml-3.5 flex-1">
                  <Body weight="semibold" color="primary" style={{ fontSize: 15, lineHeight: 22 }}>
                    {ex.name}
                  </Body>
                  <Body color="muted" style={{ fontSize: 13, lineHeight: 18 }}>
                    {ex.descriptor}
                  </Body>
                </View>
                <Body color="muted" style={{ fontSize: 13, lineHeight: 18 }} className="mr-2">
                  {ex.reps}
                </Body>
                <ChevronRight size={16} color={semantic.textMuted} />
              </Pressable>
            </Link>
          ))}
        </View>
      </ScrollView>

      <View className="absolute bottom-0 left-0 right-0 px-6 pb-8">
        <Button
          label="Start session"
          variant="primary"
          size="lg"
          radius="cta"
          leadingIcon={<Play size={14} color={semantic.textPrimary} fill={semantic.textPrimary} />}
          onPress={() => router.push('/session/today')}
        />
      </View>
    </SafeAreaView>
  );
}
