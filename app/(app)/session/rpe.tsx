// Obsidian Kinetic: 12 · RPE Capture — Figma node 58:234.
//
// Layout:
//   - ScreenHeader (× close + centered "Session done")
//   - "How hard was that?" headlineLg + body-md subhead
//   - HUGE 96px lime-fixed-dim number + cyan severity caption
//     (EASY / LIGHT / MODERATE / HARD / MAX)
//   - Slider with a 24px lime thumb on an 8px track + "1 · EASY" /
//     "MAX · 10" caps endcaps
//   - Save & finish — full-width lime
//
// Wiring (unchanged): player passes the inserted session id; Save & finish
// patches perceived_effort (1–10 Borg CR10, migration 0007_rpe_1_10.sql)
// then routes to /session/complete with every param.
import { useState } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import Slider from '@react-native-community/slider';
import { X } from 'lucide-react-native';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '@/components/obsidian';
import { fireHaptic } from '@/lib/obsidian/haptics';
import { color, font, spacing, type } from '@/lib/obsidian/tokens';
import { updateSessionRpe } from '@/lib/sessions';

type Params = {
  sessionId?: string;
  durationS?: string;
  reps?: string;
  dayNumber?: string;
  weekNumber?: string;
};

function severityCaption(v: number): string {
  if (v <= 2) return 'EASY';
  if (v <= 4) return 'LIGHT';
  if (v <= 6) return 'MODERATE';
  if (v <= 8) return 'HARD';
  return 'MAX';
}

export default function RpeSlider() {
  const router = useRouter();
  const params = useLocalSearchParams<Params>();
  const [value, setValue] = useState(6);
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

  async function handleSave() {
    if (saving) return;
    setSaving(true);
    try {
      if (params.sessionId) {
        await updateSessionRpe(params.sessionId, value);
      }
      forwardToComplete(value);
    } catch {
      // Don't block the user on a sync failure — the row still exists,
      // it just won't have an RPE.
      forwardToComplete(value);
    }
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: color.background }}>
      <View
        style={{
          height: 56,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingHorizontal: spacing.containerPadding,
        }}
      >
        <Pressable
          onPress={() => forwardToComplete()}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel="Close — skip rating"
          style={{
            width: 44,
            height: 44,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <X size={24} color={color.onSurface} />
        </Pressable>
        <Text
          style={{
            ...type.labelButton,
            color: color.onSurface,
            flex: 1,
            textAlign: 'center',
          }}
        >
          Session done
        </Text>
        <View style={{ width: 44, height: 44 }} />
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          paddingHorizontal: spacing.containerPadding,
          paddingTop: spacing.stackLg + spacing.stackMd,
          paddingBottom: spacing.stackLg,
        }}
      >
        <Text
          style={{
            ...type.headlineLg,
            color: color.onSurface,
            textAlign: 'center',
          }}
        >
          How hard was that?
        </Text>
        <Text
          style={{
            ...type.bodyMd,
            color: color.onSurfaceVariant,
            textAlign: 'center',
            marginTop: spacing.stackSm,
          }}
        >
          Rate your effort — it tunes tomorrow’s session.
        </Text>

        <View style={{ alignItems: 'center', marginTop: spacing.stackLg + spacing.stackMd }}>
          <Text
            style={{
              fontFamily: font.bold,
              fontSize: 96,
              lineHeight: 96,
              letterSpacing: -1.92,
              color: color.primaryFixedDim,
            }}
          >
            {value}
          </Text>
          <Text
            style={{
              ...type.labelCaps,
              color: color.secondaryContainer,
              marginTop: 2,
            }}
          >
            {severityCaption(value)}
          </Text>
        </View>

        <View
          style={{
            marginTop: spacing.stackLg + spacing.stackMd,
            paddingHorizontal: 4,
          }}
        >
          <Slider
            value={value}
            onValueChange={(v) => {
              const next = Math.round(v);
              if (next !== value) {
                void fireHaptic('selection');
                setValue(next);
              }
            }}
            minimumValue={1}
            maximumValue={10}
            step={1}
            minimumTrackTintColor={color.primaryContainer}
            maximumTrackTintColor={color.surfaceContainerHigh}
            thumbTintColor={color.primaryContainer}
            accessibilityLabel={`Effort ${value} of 10, ${severityCaption(value)}`}
          />
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              marginTop: spacing.stackSm,
            }}
          >
            <Text style={{ ...type.labelCaps, color: color.onSurfaceVariant }}>
              1 · EASY
            </Text>
            <Text style={{ ...type.labelCaps, color: color.onSurfaceVariant }}>
              MAX · 10
            </Text>
          </View>
        </View>
      </ScrollView>

      <View
        style={{
          paddingHorizontal: spacing.containerPadding,
          paddingBottom: spacing.stackLg + spacing.stackMd,
        }}
      >
        <Button
          label={saving ? 'Saving…' : 'Save & finish'}
          disabled={saving}
          onPress={() => void handleSave()}
          style={{ width: '100%' }}
        />
      </View>
    </SafeAreaView>
  );
}
