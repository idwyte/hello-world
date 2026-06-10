// Obsidian Kinetic: 12 · RPE Capture (handoff §4 Phase A).
// 1–10 effort, big metric number, discrete slider, Submit/Skip.
//
// Wiring (unchanged): the player logs the session row and forwards its
// id; Submit patches perceived_effort (1–10 Borg CR10, migration
// 0007_rpe_1_10.sql) then forwards every param to /session/complete.
import { useState } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import Slider from '@react-native-community/slider';
import { ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '@/components/obsidian';
import { color, font, spacing, type } from '@/lib/obsidian/tokens';
import { updateSessionRpe } from '@/lib/sessions';

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
    <SafeAreaView style={{ flex: 1, backgroundColor: color.background }}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          paddingHorizontal: spacing.containerPadding,
          paddingBottom: spacing.stackLg * 2,
          flexGrow: 1,
          justifyContent: 'center',
        }}
      >
        <View style={{ alignItems: 'center' }}>
          <Text style={{ ...type.labelCaps, color: color.primaryContainer }}>
            Effort check
          </Text>
          <Text
            style={{
              ...type.headlineLg,
              color: color.onSurface,
              marginTop: spacing.gutter,
              textAlign: 'center',
            }}
          >
            How hard was that?
          </Text>
        </View>

        {/* Big number — value reveal, metric upright */}
        <View style={{ alignItems: 'center', marginTop: spacing.stackLg * 2 }}>
          <View style={{ flexDirection: 'row', alignItems: 'flex-end' }}>
            <Text
              style={{
                fontFamily: font.bold,
                fontSize: 96,
                lineHeight: 100,
                color: color.onSurface,
              }}
            >
              {value}
            </Text>
            <Text
              style={{
                fontFamily: font.regular,
                fontSize: 32,
                lineHeight: 56,
                color: color.onSurfaceVariant,
                paddingBottom: spacing.gutter,
              }}
            >
              /10
            </Text>
          </View>
        </View>

        <View
          style={{
            marginTop: spacing.stackLg + spacing.stackSm,
            paddingHorizontal: spacing.stackSm,
          }}
        >
          <Slider
            value={value}
            onValueChange={(v) => setValue(Math.round(v))}
            minimumValue={1}
            maximumValue={10}
            step={1}
            minimumTrackTintColor={color.primaryContainer}
            maximumTrackTintColor={color.outlineVariant}
            thumbTintColor={color.primaryContainer}
            accessibilityLabel={`Effort ${value} of 10`}
          />
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              marginTop: spacing.stackSm,
            }}
          >
            <Text style={{ ...type.labelCaps, color: color.onSurfaceVariant }}>
              Easy
            </Text>
            <Text style={{ ...type.labelCaps, color: color.onSurfaceVariant }}>
              All-out
            </Text>
          </View>
        </View>

        <Button
          label={saving ? 'Saving…' : 'Submit'}
          disabled={saving}
          onPress={() => void handleSubmit()}
          style={{ marginTop: spacing.stackLg * 2 }}
        />
        <Button
          label="Skip"
          variant="ghost"
          disabled={saving}
          onPress={() => forwardToComplete()}
          style={{ marginTop: spacing.gutter }}
        />
      </ScrollView>
    </SafeAreaView>
  );
}
