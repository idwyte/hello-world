import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, Platform, Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { setAlternateAppIcon, type AppIconVariant } from '@/lib/app-icon';
import { useSettingsStore } from '@/stores/settings';

type Variant = { key: AppIconVariant; label: string; hint: string };

const VARIANTS: Variant[] = [
  { key: 'default', label: 'Default', hint: 'Inset H violet' },
  { key: 'focus', label: 'Focus', hint: 'Timer ring' },
  { key: 'posture', label: 'Posture', hint: 'Silhouette' },
  { key: 'health', label: 'Health', hint: 'Heart' },
];

export default function AppIconScreen() {
  const router = useRouter();
  const { settings, hydrated, hydrate, update } = useSettingsStore();
  const [busy, setBusy] = useState<AppIconVariant | null>(null);

  useEffect(() => {
    if (!hydrated) void hydrate();
  }, [hydrated, hydrate]);

  async function pick(variant: AppIconVariant) {
    if (Platform.OS !== 'ios') {
      Alert.alert(
        'iOS only',
        'Alternate app icons are an iOS feature. Android support is on the v1.2 roadmap.',
      );
      return;
    }
    setBusy(variant);
    const ok = await setAlternateAppIcon(variant);
    if (!ok) {
      Alert.alert(
        "Couldn't swap icon",
        'iOS rejected the icon change. Make sure the icon assets are bundled and try again.',
      );
      setBusy(null);
      return;
    }
    await update({ appIconVariant: variant });
    setBusy(null);
  }

  return (
    <SafeAreaView className="flex-1 bg-bg">
      <ScrollView className="flex-1 px-6 pt-6" contentContainerClassName="pb-12">
        <Pressable
          onPress={() => router.back()}
          accessibilityRole="button"
          accessibilityLabel="Back"
          hitSlop={12}
          className="self-start py-3 px-3 -ml-3 active:opacity-60"
        >
          <Text className="text-muted">← Back</Text>
        </Pressable>

        <Text className="text-ink text-3xl font-semibold mt-4">App icon</Text>
        <Text className="text-muted mt-2 leading-5">
          Pick a different home-screen icon. Useful if you want Hone to read as
          a focus app at a glance.
        </Text>

        <View className="mt-6 gap-2">
          {VARIANTS.map((v) => {
            const selected = settings.appIconVariant === v.key;
            return (
              <Pressable
                key={v.key}
                onPress={() => pick(v.key)}
                disabled={busy !== null}
                accessibilityRole="radio"
                accessibilityState={{ selected }}
                accessibilityLabel={`${v.label} app icon`}
                className={`rounded-xl px-4 py-4 border flex-row items-center justify-between active:opacity-80 ${
                  selected ? 'bg-accent border-accent' : 'bg-surface border-border'
                }`}
              >
                <View>
                  <Text
                    className={`text-base ${selected ? 'text-ink font-semibold' : 'text-ink'}`}
                  >
                    {v.label}
                  </Text>
                  <Text
                    className={`text-xs mt-0.5 ${selected ? 'text-ink/80' : 'text-muted'}`}
                  >
                    {v.hint}
                  </Text>
                </View>
                {busy === v.key ? (
                  <Text className="text-ink text-sm">Applying…</Text>
                ) : selected ? (
                  <Text className="text-ink text-sm">Selected</Text>
                ) : null}
              </Pressable>
            );
          })}
        </View>

        {Platform.OS !== 'ios' ? (
          <Text className="text-muted text-xs mt-6 leading-5">
            Alternate icons are an iOS-only feature for v1.1.
          </Text>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}
