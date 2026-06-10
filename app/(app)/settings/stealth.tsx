// Obsidian Kinetic: Settings · Stealth Mode. No dedicated Figma frame —
// derived from the OptionRow + glass card patterns. Settings-store
// wiring unchanged. The COVERS swatch hexes are decoy-artwork preview
// colors (domain data tied to DecoyCover keys), not theme tokens.
import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import {
  Platform,
  Pressable,
  ScrollView,
  Switch,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ScreenHeader } from '@/components/obsidian';
import type { CueStyle } from '@/lib/audio/cues';
import type { DecoyCover } from '@/lib/audio/decoy-track';
import { color, glass, radius, spacing, type } from '@/lib/obsidian/tokens';
import { useSettingsStore } from '@/stores/settings';

const COVERS: Array<{ key: DecoyCover; label: string; color: string }> = [
  { key: 'minimal_violet', label: 'Minimal violet', color: '#3A2A6E' },
  { key: 'gradient_blue', label: 'Gradient blue', color: '#1E3A5F' },
  { key: 'paper_grain', label: 'Paper grain', color: '#3F3A2F' },
];

const CUE_STYLES: Array<{ key: CueStyle; label: string }> = [
  { key: 'tone', label: 'Soft tones' },
  { key: 'whisper', label: 'Whispered cues' },
  { key: 'none', label: 'No audio (haptics only)' },
];

const INTENSITIES = [0.3, 0.5, 0.7, 0.9, 1.0] as const;

export default function StealthSettings() {
  const router = useRouter();
  const { settings, hydrate, update, hydrated } = useSettingsStore();

  useEffect(() => {
    if (!hydrated) void hydrate();
  }, [hydrate, hydrated]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: color.background }}>
      <ScreenHeader
        variant="back"
        title="Stealth Mode"
        onPress={() => router.back()}
      />
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          paddingHorizontal: spacing.containerPadding,
          paddingTop: spacing.stackMd,
          paddingBottom: 40,
          gap: spacing.stackMd,
        }}
      >
        <Text style={{ ...type.bodyMd, color: color.onSurfaceVariant }}>
          These preferences stay on this device and never sync.
        </Text>

        {Platform.OS === 'android' ? (
          <View
            accessibilityRole="alert"
            style={{
              backgroundColor: color.surfaceContainerLow,
              borderColor: glass.border,
              borderWidth: glass.borderWidth,
              borderRadius: radius.xl,
              padding: spacing.stackMd,
              gap: 4,
            }}
          >
            <Text style={{ ...type.labelButton, color: color.onSurface }}>
              Beta on Android
            </Text>
            <Text
              style={{
                ...type.bodyMd,
                fontSize: 14,
                lineHeight: 20,
                color: color.onSurfaceVariant,
              }}
            >
              Stealth Mode works best on iPhone. Android haptic precision
              varies by device — VibrationEffect amplitude control isn&apos;t
              universal. Audio cues and the lockscreen disguise work the
              same on both platforms.
            </Text>
          </View>
        ) : null}

        <View style={{ gap: spacing.stackSm }}>
          <Text style={{ ...type.labelCaps, color: color.onSurfaceVariant }}>
            Default mode
          </Text>
          <View style={{ flexDirection: 'row', gap: spacing.stackSm }}>
            {(['normal', 'stealth'] as const).map((m) => {
              const active = settings.defaultMode === m;
              return (
                <Pressable
                  key={m}
                  onPress={() => update({ defaultMode: m })}
                  accessibilityRole="radio"
                  accessibilityState={{ checked: active }}
                  accessibilityLabel={`Default to ${m} mode`}
                  style={({ pressed }) => ({
                    flex: 1,
                    backgroundColor: color.surfaceContainerLow,
                    borderColor: active
                      ? color.primaryContainer
                      : glass.border,
                    borderWidth: active ? 2 : 1,
                    borderRadius: radius.xl,
                    paddingVertical: 14,
                    paddingHorizontal: spacing.stackMd,
                    opacity: pressed ? 0.8 : 1,
                  })}
                >
                  <Text
                    style={{
                      ...(active ? type.labelButton : type.bodyLg),
                      color: active ? color.primaryFixedDim : color.onSurface,
                      textAlign: 'center',
                    }}
                  >
                    {m === 'normal' ? 'Normal' : 'Stealth'}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        <View style={{ gap: spacing.stackSm }}>
          <Text style={{ ...type.labelCaps, color: color.onSurfaceVariant }}>
            Haptic intensity
          </Text>
          <View style={{ flexDirection: 'row', gap: spacing.stackSm }}>
            {INTENSITIES.map((i) => {
              const active = Math.abs(settings.hapticIntensity - i) < 0.05;
              return (
                <Pressable
                  key={i}
                  onPress={() => update({ hapticIntensity: i })}
                  accessibilityRole="radio"
                  accessibilityState={{ checked: active }}
                  accessibilityLabel={`Haptic intensity ${Math.round(i * 100)} percent`}
                  style={({ pressed }) => ({
                    flex: 1,
                    backgroundColor: color.surfaceContainerLow,
                    borderColor: active
                      ? color.primaryContainer
                      : glass.border,
                    borderWidth: active ? 2 : 1,
                    borderRadius: radius.xl,
                    paddingVertical: 14,
                    opacity: pressed ? 0.8 : 1,
                  })}
                >
                  <Text
                    style={{
                      ...type.bodyMd,
                      color: active ? color.primaryFixedDim : color.onSurface,
                      textAlign: 'center',
                    }}
                  >
                    {Math.round(i * 100)}%
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        <View style={{ gap: spacing.stackSm }}>
          <Text style={{ ...type.labelCaps, color: color.onSurfaceVariant }}>
            Audio cues
          </Text>
          <View style={{ gap: spacing.stackSm }}>
            {CUE_STYLES.map((c) => {
              const active = settings.cueStyle === c.key;
              return (
                <Pressable
                  key={c.key}
                  onPress={() => update({ cueStyle: c.key })}
                  accessibilityRole="radio"
                  accessibilityState={{ checked: active }}
                  accessibilityLabel={c.label}
                  style={({ pressed }) => ({
                    backgroundColor: color.surfaceContainerLow,
                    borderColor: active
                      ? color.primaryContainer
                      : glass.border,
                    borderWidth: active ? 2 : 1,
                    borderRadius: radius.xl,
                    paddingVertical: 14,
                    paddingHorizontal: spacing.stackMd,
                    opacity: pressed ? 0.8 : 1,
                  })}
                >
                  <Text
                    style={{
                      ...(active ? type.labelButton : type.bodyLg),
                      color: active ? color.primaryFixedDim : color.onSurface,
                    }}
                  >
                    {c.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        <View
          style={{
            backgroundColor: color.surfaceContainerLow,
            borderColor: glass.border,
            borderWidth: glass.borderWidth,
            borderRadius: radius.xl,
            padding: spacing.stackMd,
            flexDirection: 'row',
            alignItems: 'center',
            gap: spacing.gutter,
          }}
        >
          <View style={{ flex: 1, gap: 2 }}>
            <Text style={{ ...type.bodyLg, color: color.onSurface }}>
              Block speaker output
            </Text>
            <Text
              style={{
                ...type.bodyMd,
                fontSize: 14,
                lineHeight: 20,
                color: color.onSurfaceVariant,
              }}
            >
              Audio cues only play through AirPods or wired headphones, never
              the phone speaker.
            </Text>
          </View>
          <Switch
            value={settings.bluetoothOnly}
            onValueChange={(v) => update({ bluetoothOnly: v })}
            trackColor={{
              true: color.primaryContainer,
              false: color.surfaceContainerHigh,
            }}
            thumbColor="#fff"
            accessibilityLabel="Block speaker output"
          />
        </View>

        <View style={{ gap: spacing.stackSm }}>
          <Text style={{ ...type.labelCaps, color: color.onSurfaceVariant }}>
            Lockscreen cover
          </Text>
          <View style={{ flexDirection: 'row', gap: spacing.gutter }}>
            {COVERS.map((c) => {
              const active = settings.decoyCover === c.key;
              return (
                <Pressable
                  key={c.key}
                  onPress={() => update({ decoyCover: c.key })}
                  accessibilityRole="radio"
                  accessibilityState={{ checked: active }}
                  accessibilityLabel={c.label}
                  style={({ pressed }) => ({
                    flex: 1,
                    backgroundColor: color.surfaceContainerLow,
                    borderColor: active
                      ? color.primaryContainer
                      : glass.border,
                    borderWidth: active ? 2 : 1,
                    borderRadius: radius.xl,
                    padding: spacing.stackSm,
                    opacity: pressed ? 0.8 : 1,
                  })}
                >
                  <View
                    style={{
                      backgroundColor: c.color,
                      aspectRatio: 1,
                      borderRadius: radius.lg,
                    }}
                  />
                  <Text
                    style={{
                      ...type.bodyMd,
                      fontSize: 12,
                      lineHeight: 16,
                      color: active ? color.primaryFixedDim : color.onSurface,
                      textAlign: 'center',
                      marginTop: spacing.stackSm,
                    }}
                  >
                    {c.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
