import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import { Platform, Pressable, Switch, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import type { CueStyle } from '@/lib/audio/cues';
import type { DecoyCover } from '@/lib/audio/decoy-track';
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
    <SafeAreaView className="flex-1 bg-bg">
      <View className="flex-1 px-6 pt-4">
        <Pressable
          onPress={() => router.back()}
          className="self-start py-3 px-3 -ml-3 active:opacity-60"
          hitSlop={12}
          accessibilityRole="button"
          accessibilityLabel="Back"
        >
          <Text className="text-muted">← Back</Text>
        </Pressable>

        <Text className="text-ink text-3xl font-semibold mt-2">
          Stealth Mode
        </Text>
        <Text className="text-muted mt-2 leading-5">
          These preferences stay on this device and never sync.
        </Text>

        {Platform.OS === 'android' ? (
          <View
            className="bg-surface2 border border-border rounded-xl p-3 mt-4"
            accessibilityRole="alert"
          >
            <Text className="text-ink text-sm font-semibold">Beta on Android</Text>
            <Text className="text-muted text-xs mt-1 leading-5">
              Stealth Mode works best on iPhone. Android haptic precision
              varies by device — VibrationEffect amplitude control isn't
              universal. Audio cues and the lockscreen disguise work the
              same on both platforms.
            </Text>
          </View>
        ) : null}

        <View className="mt-6">
          <Text className="text-muted text-xs uppercase tracking-wider">
            Default mode
          </Text>
          <View className="flex-row gap-2 mt-2">
            {(['normal', 'stealth'] as const).map((m) => {
              const active = settings.defaultMode === m;
              return (
                <Pressable
                  key={m}
                  onPress={() => update({ defaultMode: m })}
                  accessibilityRole="radio"
                  accessibilityState={{ checked: active }}
                  accessibilityLabel={`Default to ${m} mode`}
                  className={`flex-1 py-3 px-4 rounded-xl border active:opacity-80 ${
                    active ? 'bg-accent border-accent' : 'bg-surface border-border'
                  }`}
                >
                  <Text
                    className={`text-center ${active ? 'text-ink font-semibold' : 'text-ink'}`}
                  >
                    {m === 'normal' ? 'Normal' : 'Stealth'}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        <View className="mt-6">
          <Text className="text-muted text-xs uppercase tracking-wider">
            Haptic intensity
          </Text>
          <View className="flex-row gap-2 mt-2">
            {INTENSITIES.map((i) => {
              const active = Math.abs(settings.hapticIntensity - i) < 0.05;
              return (
                <Pressable
                  key={i}
                  onPress={() => update({ hapticIntensity: i })}
                  accessibilityRole="radio"
                  accessibilityState={{ checked: active }}
                  accessibilityLabel={`Haptic intensity ${Math.round(i * 100)} percent`}
                  className={`flex-1 py-3 rounded-xl border active:opacity-80 ${
                    active ? 'bg-accent border-accent' : 'bg-surface border-border'
                  }`}
                >
                  <Text className="text-ink text-center">
                    {Math.round(i * 100)}%
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        <View className="mt-6">
          <Text className="text-muted text-xs uppercase tracking-wider">
            Audio cues
          </Text>
          <View className="gap-2 mt-2">
            {CUE_STYLES.map((c) => {
              const active = settings.cueStyle === c.key;
              return (
                <Pressable
                  key={c.key}
                  onPress={() => update({ cueStyle: c.key })}
                  accessibilityRole="radio"
                  accessibilityState={{ checked: active }}
                  accessibilityLabel={c.label}
                  className={`py-3 px-4 rounded-xl border active:opacity-80 ${
                    active ? 'bg-accent border-accent' : 'bg-surface border-border'
                  }`}
                >
                  <Text className="text-ink">{c.label}</Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        <View className="mt-6 flex-row items-center justify-between bg-surface border border-border rounded-xl p-4">
          <View className="flex-1 pr-4">
            <Text className="text-ink">Block speaker output</Text>
            <Text className="text-muted text-xs mt-1 leading-5">
              Audio cues only play through AirPods or wired headphones, never
              the phone speaker.
            </Text>
          </View>
          <Switch
            value={settings.bluetoothOnly}
            onValueChange={(v) => update({ bluetoothOnly: v })}
            trackColor={{ true: '#7C5CFF', false: '#2A2A36' }}
            accessibilityLabel="Block speaker output"
          />
        </View>

        <View className="mt-6">
          <Text className="text-muted text-xs uppercase tracking-wider">
            Lockscreen cover
          </Text>
          <View className="flex-row gap-3 mt-2">
            {COVERS.map((c) => {
              const active = settings.decoyCover === c.key;
              return (
                <Pressable
                  key={c.key}
                  onPress={() => update({ decoyCover: c.key })}
                  accessibilityRole="radio"
                  accessibilityState={{ checked: active }}
                  accessibilityLabel={c.label}
                  className={`flex-1 rounded-xl border ${active ? 'border-accent' : 'border-border'} p-2 active:opacity-80`}
                >
                  <View
                    style={{ backgroundColor: c.color, aspectRatio: 1 }}
                    className="rounded-lg"
                  />
                  <Text className="text-ink text-xs text-center mt-2">
                    {c.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}
