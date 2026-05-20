// Figma: 30 · session pause — node 114:336
// https://www.figma.com/design/qgY3Qcf7gP7w5V5A6uQTL4/?node-id=114-336
// Spec: docs/hone-roadmap-state.md line 114 (Figma-derived).
//
// Sub-state of active session. 55% scrim · 440 px sheet · PAUSED kicker +
// 64/72 elapsed 2:14 · 3-stat row (SET 2/3 · REP 5/10 · PHASE Hold) ·
// oversized Resume CTA + muted End session link.
//
// FIGMA-DIFF (stub):
//   - Rendered as a full screen, not a 440 px bottom sheet with scrim.
//     Promote with @gorhom/bottom-sheet or RN Modal once route surface is
//     correct.
//   - Elapsed time / stats hardcoded; promote with useLocalSearchParams
//     ?elapsed=&set=&rep=&phase=.
import { useLocalSearchParams, useRouter } from 'expo-router';
import { View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Body, Button, SectionLabel, Stat } from '@/components/ui';

export default function SessionPause() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    elapsed?: string;
    set?: string;
    rep?: string;
    phase?: string;
  }>();
  return (
    <SafeAreaView className="flex-1 bg-surface-canvas">
      <View className="flex-1 px-4 pt-12">
        <View className="items-center">
          <SectionLabel tracking="wide">PAUSED</SectionLabel>
          <Body
            weight="semibold"
            color="primary"
            className="mt-2"
            style={{ fontSize: 64, lineHeight: 72 }}
          >
            {params.elapsed ?? '0:00'}
          </Body>
        </View>

        <View className="flex-row gap-3 mt-8 self-center">
          <Stat kicker="SET" value={params.set ?? '—'} />
          <Stat kicker="REP" value={params.rep ?? '—'} />
        </View>
        <Body color="muted" className="text-center mt-3">
          Phase · {params.phase ?? '—'}
        </Body>

        <View className="flex-1 justify-end pb-12">
          <Button
            label="Resume"
            variant="primary"
            size="lg"
            radius="cta"
            onPress={() => router.back()}
          />
          <Button
            label="End session"
            variant="ghost"
            size="md"
            className="mt-3"
            onPress={() => router.replace('/home')}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}
