// Figma: 21 · maintenance — node 104:551
// https://www.figma.com/design/qgY3Qcf7gP7w5V5A6uQTL4/?node-id=104-551
// Spec: docs/hone-roadmap-state.md line 99 (Figma-derived).
//
// End-of-program celebration. 120 px medal hero + halo · 8-week complete
// kicker · before/after stats (50 → 78 in green) · 3 next-up cards with the
// RECOMMENDED maintenance option getting an accent stroke.
//
// FIGMA-DIFF (stub):
//   - 120 px medal SVG hero + halo glow rendered as text emoji.
//   - 3 next-up cards collapsed to a single CTA.
//   - Before/after delta chip not rendered visually; stub shows scores only.
import { useRouter } from 'expo-router';
import { ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Body, Button, Card, SectionLabel, Stat } from '@/components/ui';

export default function Maintenance() {
  const router = useRouter();
  return (
    <SafeAreaView className="flex-1 bg-surface-canvas">
      <ScrollView className="flex-1" contentContainerClassName="px-4 pb-12">
        <View className="items-center mt-16">
          <Body weight="semibold" color="primary" style={{ fontSize: 64, lineHeight: 80 }}>
            🏅
          </Body>
          <SectionLabel tracking="wide" className="mt-4">
            8 WEEKS COMPLETE
          </SectionLabel>
          <Body
            weight="semibold"
            color="primary"
            className="mt-2 text-center"
            style={{ fontSize: 26, lineHeight: 32 }}
          >
            You finished your program.
          </Body>
        </View>

        <View className="flex-row gap-3 mt-8 self-center">
          <Stat kicker="THEN" value="50" />
          <Stat kicker="NOW" value="78" sub="+28 in 8 weeks" />
        </View>

        <Card padding="lg" radius="card" className="mt-6">
          <SectionLabel tracking="wide">WHAT&rsquo;S NEXT</SectionLabel>
          <Body
            weight="semibold"
            color="primary"
            className="mt-2"
            style={{ fontSize: 18, lineHeight: 26 }}
          >
            Maintenance schedule (recommended)
          </Body>
          <Body size="sm" color="muted" className="mt-2">
            3 sessions / week instead of 7. Keeps strength without burnout.
          </Body>
        </Card>

        <Button
          label="Continue with maintenance"
          variant="primary"
          size="lg"
          radius="cta"
          className="mt-6"
          onPress={() => router.replace('/home')}
        />
      </ScrollView>
    </SafeAreaView>
  );
}
