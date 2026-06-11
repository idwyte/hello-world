// Obsidian Kinetic: Settings · Security. No dedicated Figma frame —
// derived from the glass card + Button patterns. Biometric toggle and
// identity-linking wiring unchanged.
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, ScrollView, Switch, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button, ScreenHeader } from '@/components/obsidian';
import { linkIdentityToCurrent } from '@/lib/auth';
import { useAuth } from '@/lib/auth';
import { color, glass, radius, spacing, type } from '@/lib/obsidian/tokens';
import { useSettingsStore } from '@/stores/settings';

async function biometricsAvailable(): Promise<boolean> {
  try {
    const m = await import('expo-local-authentication');
    if (!(await m.hasHardwareAsync())) return false;
    return await m.isEnrolledAsync();
  } catch {
    return false;
  }
}

export default function SecurityScreen() {
  const router = useRouter();
  const { settings, hydrated, hydrate, update } = useSettingsStore();
  const auth = useAuth();
  const [biometricSupported, setBiometricSupported] = useState<boolean | null>(
    null,
  );
  const [linking, setLinking] = useState<null | 'apple' | 'google'>(null);

  useEffect(() => {
    if (!hydrated) void hydrate();
  }, [hydrated, hydrate]);

  useEffect(() => {
    void biometricsAvailable().then(setBiometricSupported);
  }, []);

  async function toggleBiometric(next: boolean) {
    if (next && biometricSupported === false) {
      Alert.alert(
        'Biometrics unavailable',
        'No Face ID, Touch ID, or device passcode is set up on this device.',
      );
      return;
    }
    await update({ biometricLocked: next });
  }

  async function link(provider: 'apple' | 'google') {
    setLinking(provider);
    try {
      await linkIdentityToCurrent(provider);
      Alert.alert(
        'Account linked',
        'Your data is now synced across devices when you sign in.',
      );
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Something went wrong.';
      Alert.alert("Couldn't link", message);
    } finally {
      setLinking(null);
    }
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: color.background }}>
      <ScreenHeader
        variant="back"
        title="Security"
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
              Require Face ID / Touch ID
            </Text>
            <Text
              style={{
                ...type.bodyMd,
                fontSize: 14,
                lineHeight: 20,
                color: color.onSurfaceVariant,
              }}
            >
              {biometricSupported === false
                ? 'No biometrics or passcode set on this device.'
                : 'Unlock Hone with Face ID, Touch ID, or your device passcode every time you open the app.'}
            </Text>
          </View>
          <Switch
            value={settings.biometricLocked}
            onValueChange={toggleBiometric}
            disabled={!hydrated || biometricSupported === false}
            accessibilityLabel="Biometric lock"
            trackColor={{
              true: color.primaryContainer,
              false: color.surfaceContainerHigh,
            }}
            thumbColor="#fff"
          />
        </View>

        {auth.isAnonymous ? (
          <>
            <Text
              style={{
                ...type.labelCaps,
                color: color.onSurfaceVariant,
                marginTop: spacing.stackSm,
              }}
            >
              Save your data
            </Text>
            <View
              style={{
                backgroundColor: color.surfaceContainerLow,
                borderColor: glass.border,
                borderWidth: glass.borderWidth,
                borderRadius: radius.xl,
                padding: spacing.stackMd,
                gap: spacing.stackSm,
              }}
            >
              <Text style={{ ...type.bodyLg, color: color.onSurface }}>
                Link an account
              </Text>
              <Text
                style={{
                  ...type.bodyMd,
                  fontSize: 14,
                  lineHeight: 20,
                  color: color.onSurfaceVariant,
                }}
              >
                Your training history lives only on this device today. Link
                Apple or Google to sync across devices — no email required.
              </Text>
              <View style={{ gap: spacing.stackSm, marginTop: spacing.stackSm }}>
                <Button
                  label={linking === 'apple' ? 'Linking…' : 'Link Apple ID'}
                  onPress={() => link('apple')}
                  disabled={linking !== null}
                  accessibilityLabel="Link Apple ID"
                  style={{ width: '100%' }}
                />
                <Button
                  label={
                    linking === 'google' ? 'Linking…' : 'Link Google account'
                  }
                  variant="ghost"
                  onPress={() => link('google')}
                  disabled={linking !== null}
                  accessibilityLabel="Link Google account"
                  style={{ width: '100%' }}
                />
              </View>
              <Text
                style={{
                  ...type.bodyMd,
                  fontSize: 12,
                  lineHeight: 16,
                  color: color.onSurfaceVariant,
                  marginTop: spacing.stackSm,
                }}
              >
                If the chosen account is already linked to a different Hone
                profile we&apos;ll surface a friendly error — conflict-merging
                is a v1.2 feature.
              </Text>
            </View>
          </>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}
