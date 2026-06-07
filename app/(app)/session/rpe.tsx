// Figma: 34 · RPE slider — node 131:363
//
// Effort-rating screen between /session/player and /session/complete. The
// player logs the session row first and forwards the new id here; this
// screen patches the row's perceived_effort column (1–10 Borg CR10 — see
// migration 0007_rpe_1_10.sql) and forwards every param to /complete so
// the celebration can render without re-querying.
//
// FIGMA-DIFF (intentional):
//   - Renders as a full screen rather than a 460 px bottom sheet. A real
//     sheet would require restructuring the session navigation; the
//     visual rhythm here (sheet-like card, ample top breathing room)
//     mirrors Figma 34's affordance pair: Submit (primary) + Skip (ghost).
import { useState } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import Slider from '@react-native-community/slider';
import { ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Body, Button, SectionLabel } from '@/components/ui';
import { updateSessionRpe } from '@/lib/sessions';
import { semantic } from '@/lib/theme';

type Params = {
  sessionId?: string;
  durationS?: string;
  reps?: string;
  dayNumber?: string;
  weekNumber?: string;
};

export default function RpeSlider() {
  const router = useRouter();
  const params = useLocalSearchParams<Params>();
  const [value, setValue] = useState(7);
  const [saving, setSaving] = useState(false);

  function forwardToComplete(rpe?: number) {
    router.replace({
      pathname: '/session/complete',
      params: {
        ...(params.durationS ? { durationS: params.durationS } : {}),
        ...(params.reps ? { reps: params.reps } : {}),
        ...(params.dayNumber ? { dayNumber: params.dayNumber } : {}),
        ...(params.weekNumber ? { weekNumber: params.weekNumber } : {}),
        ...(rpe ? { rpe: rpe.toString() } : {}),
      },
    });
  }

  async function handleSubmit() {
    if (saving) return;
    setSaving(true);
    try {
      if (params.sessionId) {
        await updateSessionRpe(params.sessionId, value);
      }
      forwardToComplete(value);
    } catch {
      // Don't block the user on a sync failure — the row still exists,
      // it just won't have an RPE. Continue to celebration.
      forwardToComplete(value);
    }
  }

  return (
    <SafeAreaView className="flex-1 bg-surface-canvas">
      <ScrollView className="flex-1" contentContainerClassName="px-6 pb-12">
        <View className="items-center mt-16">
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

        <View className="items-center mt-12">
          <View className="flex-row items-end">
            <Body
              weight="semibold"
              color="primary"
              style={{ fontSize: 96, lineHeight: 104 }}
            >
              {value}
            </Body>
            <Body
              color="muted"
              style={{ fontSize: 32, lineHeight: 56 }}
              className="pb-3"
            >
              /10
            </Body>
          </View>
        </View>

        <View className="mt-10 px-2">
          <Slider
            value={value}
            onValueChange={(v) => setValue(Math.round(v))}
            minimumValue={1}
            maximumValue={10}
            step={1}
            minimumTrackTintColor={semantic.interactivePrimary}
            maximumTrackTintColor={semantic.borderDefault}
            thumbTintColor={semantic.interactivePrimary}
            accessibilityLabel={`Effort ${value} of 10`}
          />
          <View className="flex-row justify-between mt-2">
            <Body size="xs" color="muted">
              Easy
            </Body>
            <Body size="xs" color="muted">
              All-out
            </Body>
          </View>
        </View>

        <Button
          label={saving ? 'Saving…' : 'Submit'}
          variant="primary"
          size="lg"
          radius="cta"
          className="mt-12"
          disabled={saving}
          onPress={handleSubmit}
        />
        <Button
          label="Skip"
          variant="ghost"
          size="md"
          className="mt-2"
          disabled={saving}
          onPress={() => forwardToComplete()}
        />
      </ScrollView>
    </SafeAreaView>
  );
}
