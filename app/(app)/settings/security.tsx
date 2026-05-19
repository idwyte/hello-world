import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, Pressable, ScrollView, Switch, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { linkIdentityToCurrent } from '@/lib/auth';
import { useAuth } from '@/lib/auth';
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

        <Text className="text-ink text-3xl font-semibold mt-4">Security</Text>

        <View className="bg-surface border border-border rounded-2xl mt-8 px-4 py-4">
          <View className="flex-row items-center justify-between">
            <View className="flex-1 pr-3">
              <Text className="text-ink text-base font-semibold">
                Require Face ID / Touch ID
              </Text>
              <Text className="text-muted text-xs mt-1 leading-5">
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
              trackColor={{ false: '#2A2A36', true: '#7C5CFF' }}
              thumbColor="#F5F5F7"
            />
          </View>
        </View>

        {auth.isAnonymous ? (
          <>
            <Text className="text-muted text-xs uppercase tracking-wider mt-10 mb-3">
              Save your data
            </Text>
            <View className="bg-surface border border-border rounded-2xl px-4 py-4">
              <Text className="text-ink text-base font-semibold">
                Link an account
              </Text>
              <Text className="text-muted text-xs mt-1 leading-5">
                Your training history lives only on this device today. Link
                Apple or Google to sync across devices — no email required.
              </Text>
              <View className="gap-2 mt-4">
                <Pressable
                  disabled={linking !== null}
                  onPress={() => link('apple')}
                  accessibilityRole="button"
                  accessibilityLabel="Link Apple ID"
                  className="bg-ink rounded-xl py-3 items-center active:opacity-80"
                >
                  <Text className="text-bg font-semibold">
                    {linking === 'apple' ? 'Linking…' : 'Link Apple ID'}
                  </Text>
                </Pressable>
                <Pressable
                  disabled={linking !== null}
                  onPress={() => link('google')}
                  accessibilityRole="button"
                  accessibilityLabel="Link Google account"
                  className="bg-surface2 border border-border rounded-xl py-3 items-center active:opacity-80"
                >
                  <Text className="text-ink font-semibold">
                    {linking === 'google' ? 'Linking…' : 'Link Google account'}
                  </Text>
                </Pressable>
              </View>
              <Text className="text-muted text-[11px] mt-3 leading-4">
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
