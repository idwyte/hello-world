// Obsidian Kinetic: Settings · Subscription. No dedicated Figma frame —
// derived from the glass card + Button patterns. RevenueCat wiring and
// store-management deep links unchanged.
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  Alert,
  Linking,
  Platform,
  ScrollView,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button, ScreenHeader } from '@/components/obsidian';
import { color, glass, radius, spacing, type } from '@/lib/obsidian/tokens';
import {
  hasRevenueCatConfig,
  restorePurchases,
  useEntitlement,
} from '@/lib/revenuecat';

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
        e.isPro
          ? 'Your subscription is active.'
          : 'No active subscription found on this account.',
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
    <SafeAreaView style={{ flex: 1, backgroundColor: color.background }}>
      <ScreenHeader
        variant="back"
        title="Subscription"
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
            gap: spacing.stackSm,
          }}
        >
          <Text style={{ ...type.labelCaps, color: color.onSurfaceVariant }}>
            Status
          </Text>
          <Text style={{ ...type.bodyLg, color: color.onSurface }}>
            {status}
          </Text>
        </View>

        {!entitlement.isPro && hasRevenueCatConfig() ? (
          <Button
            label="See plans"
            onPress={() => router.push('/paywall')}
            accessibilityLabel="See plans"
            style={{ width: '100%' }}
          />
        ) : null}

        <Button
          label="Restore purchases"
          variant="ghost"
          onPress={onRestore}
          disabled={busy}
          accessibilityLabel="Restore previous purchases"
          style={{ width: '100%' }}
        />

        {entitlement.isPro ? (
          <Button
            label={`Manage in ${Platform.OS === 'ios' ? 'App Store' : 'Play Store'}`}
            variant="ghost"
            onPress={openStoreManagement}
            accessibilityLabel="Manage subscription in the App Store"
            style={{ width: '100%' }}
          />
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}
