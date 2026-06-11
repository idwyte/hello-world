// Obsidian Kinetic: Settings · App icon. No dedicated Figma frame —
// derived from the OptionRow pattern. Alternate-icon swap wiring
// unchanged.
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  Alert,
  Platform,
  Pressable,
  ScrollView,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ScreenHeader } from '@/components/obsidian';
import { setAlternateAppIcon, type AppIconVariant } from '@/lib/app-icon';
import { color, glass, radius, spacing, type } from '@/lib/obsidian/tokens';
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
    <SafeAreaView style={{ flex: 1, backgroundColor: color.background }}>
      <ScreenHeader
        variant="back"
        title="App icon"
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
          Pick a different home-screen icon. Useful if you want Hone to read as
          a focus app at a glance.
        </Text>

        <View style={{ gap: spacing.stackSm }}>
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
                style={({ pressed }) => ({
                  backgroundColor: color.surfaceContainerLow,
                  borderColor: selected
                    ? color.primaryContainer
                    : glass.border,
                  borderWidth: selected ? 2 : 1,
                  borderRadius: radius.xl,
                  padding: spacing.stackMd,
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: spacing.gutter,
                  opacity: pressed ? 0.8 : 1,
                })}
              >
                <View style={{ flex: 1, gap: 2 }}>
                  <Text
                    style={{
                      ...(selected ? type.labelButton : type.bodyLg),
                      color: selected
                        ? color.primaryFixedDim
                        : color.onSurface,
                    }}
                  >
                    {v.label}
                  </Text>
                  <Text
                    style={{
                      ...type.bodyMd,
                      fontSize: 14,
                      lineHeight: 20,
                      color: color.onSurfaceVariant,
                    }}
                  >
                    {v.hint}
                  </Text>
                </View>
                {busy === v.key ? (
                  <Text
                    style={{
                      ...type.bodyMd,
                      fontSize: 14,
                      color: color.onSurfaceVariant,
                    }}
                  >
                    Applying…
                  </Text>
                ) : (
                  <View
                    style={{
                      width: 20,
                      height: 20,
                      borderRadius: radius.full,
                      borderWidth: selected ? 0 : 1.5,
                      borderColor: color.outline,
                      backgroundColor: selected
                        ? color.primaryContainer
                        : 'transparent',
                    }}
                  />
                )}
              </Pressable>
            );
          })}
        </View>

        {Platform.OS !== 'ios' ? (
          <Text
            style={{
              ...type.bodyMd,
              fontSize: 14,
              lineHeight: 20,
              color: color.onSurfaceVariant,
              marginTop: spacing.stackSm,
            }}
          >
            Alternate icons are an iOS-only feature for v1.1.
          </Text>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}
