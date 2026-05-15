import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, Linking, Platform, Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { hasRevenueCatConfig, restorePurchases, useEntitlement } from '@/lib/revenuecat';

export default function Subscription() {
  const router = useRouter();
  const { entitlement, loading } = useEntitlement();
  const [busy, setBusy] = useState(false);

  async function onRestore() {
    if (busy) return;
    setBusy(true);
    try {
      const e = await restorePurchases();
      Alert.alert(
        e.isPro ? 'Restored' : 'Nothing to restore',
        e.isPro ? 'Your subscription is active.' : 'No active subscription found on this account.',
      );
    } catch (err) {
      Alert.alert(
        'Restore failed',
        err instanceof Error ? err.message : 'Try again.',
      );
    } finally {
      setBusy(false);
    }
  }

  function openStoreManagement() {
    const url =
      Platform.OS === 'ios'
        ? 'https://apps.apple.com/account/subscriptions'
        : 'https://play.google.com/store/account/subscriptions';
    Linking.openURL(url).catch(() => {
      Alert.alert('Could not open', 'Manage your subscription in the App Store.');
    });
  }

  const status = !hasRevenueCatConfig()
    ? 'Not configured (dev build)'
    : loading
      ? 'Loading…'
      : entitlement.isPro
        ? entitlement.isInTrial
          ? `Trial · ${entitlement.expiresAt ? `ends ${entitlement.expiresAt.toLocaleDateString()}` : ''}`
          : `Active · ${entitlement.willRenew ? 'auto-renews' : 'cancels at end of period'}`
        : 'No active subscription';

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

        <Text className="text-ink text-3xl font-semibold mt-2">Subscription</Text>

        <View className="bg-surface border border-border rounded-xl p-4 mt-6">
          <Text className="text-muted text-xs uppercase tracking-wider">
            Status
          </Text>
          <Text className="text-ink text-base mt-1">{status}</Text>
        </View>

        <View className="mt-6 gap-3">
          {!entitlement.isPro && hasRevenueCatConfig() ? (
            <Pressable
              onPress={() => router.push('/paywall')}
              accessibilityRole="button"
              accessibilityLabel="See plans"
              className="bg-accent rounded-xl py-4 items-center active:opacity-80"
            >
              <Text className="text-ink font-semibold">See plans</Text>
            </Pressable>
          ) : null}

          <Pressable
            onPress={onRestore}
            disabled={busy}
            accessibilityRole="button"
            accessibilityLabel="Restore previous purchases"
            className="bg-surface border border-border rounded-xl py-4 items-center active:opacity-80"
          >
            <Text className="text-ink">Restore purchases</Text>
          </Pressable>

          {entitlement.isPro ? (
            <Pressable
              onPress={openStoreManagement}
              accessibilityRole="button"
              accessibilityLabel="Manage subscription in the App Store"
              className="bg-surface border border-border rounded-xl py-4 items-center active:opacity-80"
            >
              <Text className="text-ink">Manage in {Platform.OS === 'ios' ? 'App Store' : 'Play Store'}</Text>
            </Pressable>
          ) : null}
        </View>
      </View>
    </SafeAreaView>
  );
}
