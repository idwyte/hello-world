// Figma: 34 · RPE slider — node 131:363
// https://www.figma.com/design/qgY3Qcf7gP7w5V5A6uQTL4/?node-id=131-363
// Spec: docs/hone-roadmap-state.md line 105 (Figma-derived).
//
// Effort-rating sheet between /session/active and /session/complete. Faint
// success halo + 55% scrim + 460 px sheet · EFFORT CHECK accent kicker ·
// "How hard was that?" + 96/104 big "7" with "/10" suffix · 326 px
// discrete slider at 70% with 10 ticks · Easy / All-out anchor labels ·
// Submit + Skip CTAs.
//
// FIGMA-DIFF (stub):
//   - Renders as full screen (not 460 px bottom sheet + scrim).
//   - No discrete slider with ticks; stub uses a button row 1-10.
//   - Submit captures the value into route params; full build persists
//     RPE into session row.
import { useState } from 'react';
import { useRouter } from 'expo-router';
import { Pressable, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Body, Button, SectionLabel } from '@/components/ui';
import { semantic } from '@/lib/theme';

export default function RpeSlider() {
  const router = useRouter();
  const [value, setValue] = useState(7);

  return (
    <SafeAreaView className="flex-1 bg-surface-canvas">
      <ScrollView className="flex-1" contentContainerClassName="px-4 pb-12">
        <View className="items-center mt-12">
          <SectionLabel tracking="wide" className="text-interactive-primary">
            EFFORT CHECK
          </SectionLabel>
          <Body
            weight="semibold"
            color="primary"
            className="mt-3 text-center"
            style={{ fontSize: 26, lineHeight: 32 }}
          >
            How hard was that?
          </Body>
        </View>

        <View className="items-center mt-10">
          <View className="flex-row items-end">
            <Body weight="semibold" color="primary" style={{ fontSize: 96, lineHeight: 104 }}>
              {value}
            </Body>
            <Body color="muted" style={{ fontSize: 32, lineHeight: 56 }} className="pb-3">
              /10
            </Body>
          </View>
        </View>

        <View className="flex-row gap-1.5 mt-10 justify-center">
          {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => {
            const active = n <= value;
            return (
              <Pressable
                key={n}
                onPress={() => setValue(n)}
                hitSlop={4}
                accessibilityLabel={`${n} of 10`}
              >
                <View
                  className="w-7 h-10 rounded-md"
                  style={{
                    backgroundColor: active
                      ? semantic.interactivePrimary
                      : semantic.surfaceSunken,
                  }}
                />
              </Pressable>
            );
          })}
        </View>

        <View className="flex-row justify-between mt-3 px-4">
          <Body size="xs" color="muted">
            Easy
          </Body>
          <Body size="xs" color="muted">
            All-out
          </Body>
        </View>

        <Button
          label="Submit"
          variant="primary"
          size="lg"
          radius="cta"
          className="mt-12"
          onPress={() => router.replace({ pathname: '/session/complete', params: { rpe: value.toString() } })}
        />
        <Button
          label="Skip"
          variant="ghost"
          size="md"
          className="mt-2"
          onPress={() => router.replace('/session/complete')}
        />
      </ScrollView>
    </SafeAreaView>
  );
}
