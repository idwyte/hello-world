// Figma: 03 · assessment intro — node 199:341
// https://www.figma.com/design/qgY3Qcf7gP7w5V5A6uQTL4/?node-id=199-341
//
// Sets expectation before the 6 data points (2 tests + 4 lifestyle
// questions). Single Continue CTA → /index-test.
import { Pressable, ScrollView, View } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Body, Button, SectionLabel } from '@/components/ui';
import { semantic } from '@/lib/theme';

const STEPS = [
  { n: '1', title: 'Quick pulse test', sub: '30 s of fast contractions' },
  { n: '2', title: 'Max hold test', sub: 'Hold as long as you can' },
  { n: '3', title: 'Your age band', sub: 'Adjusts intensity' },
  { n: '4', title: 'Strength training', sub: 'Days per week' },
  { n: '5', title: 'Cardio activity', sub: 'Days per week' },
  { n: '6', title: 'Intimacy', sub: 'Per-week frequency' },
];

export default function AssessmentIntro() {
  const router = useRouter();
  return (
    <SafeAreaView className="flex-1 bg-surface-canvas">
      {/* Back chev — large-title header pattern with chev only */}
      <View className="h-11 flex-row items-center px-4">
        <Pressable
          onPress={() => router.back()}
          hitSlop={12}
          accessibilityLabel="Back"
          className="w-11 h-11 items-center justify-center -ml-2"
        >
          <Body color="primary" style={{ fontSize: 20 }}>
            ←
          </Body>
        </Pressable>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerClassName="px-4 pb-32"
      >
        <Body
          weight="semibold"
          color="primary"
          style={{ fontSize: 28, lineHeight: 36 }}
        >
          Personalize your plan
        </Body>
        <Body color="muted" size="sm" className="mt-2">
          Six quick data points to build your 8-week program.
        </Body>

        <SectionLabel tracking="wide" className="mt-8">
          WHAT WE&rsquo;LL ASK
        </SectionLabel>

        <View className="mt-3 gap-3">
          {STEPS.map((s) => (
            <View key={s.n} className="flex-row items-start">
              <View
                className="w-7 h-7 rounded-full items-center justify-center"
                style={{ backgroundColor: semantic.interactivePrimaryPressed }}
              >
                <Body
                  weight="semibold"
                  color="primary"
                  style={{ fontSize: 13, lineHeight: 18 }}
                >
                  {s.n}
                </Body>
              </View>
              <View className="ml-3 flex-1">
                <Body
                  weight="semibold"
                  color="primary"
                  style={{ fontSize: 16, lineHeight: 22 }}
                >
                  {s.title}
                </Body>
                <Body color="muted" style={{ fontSize: 13, lineHeight: 18 }}>
                  {s.sub}
                </Body>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>

      <View className="absolute bottom-0 left-0 right-0 px-6 pb-8">
        <Button
          label="Continue"
          variant="primary"
          size="lg"
          radius="cta"
          onPress={() => router.push('/index-test')}
        />
      </View>
    </SafeAreaView>
  );
}
