import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { hasRevenueCatConfig, restorePurchases } from '@/lib/revenuecat';

/**
 * Hosted RC Paywall UI is the production target — we wire up
 * `react-native-purchases-ui` for that. When RC isn't configured, a
 * placeholder paywall is shown with a "Continue without subscription" CTA so
 * dev / unconfigured builds aren't dead-ended.
 *
 * Plan §8: $5.99/wk with 3-day trial, $24.99/yr. These prices are configured
 * in App Store Connect + RC dashboard, not in client code.
 */
export default function Paywall() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const configured = hasRevenueCatConfig();

  async function onRestore() {
    if (busy) return;
    setBusy(true);
    try {
      const e = await restorePurchases();
      if (e.isPro) {
        router.replace('/home');
      } else {
        Alert.alert('No active subscription', 'We could not find an active subscription on this account.');
      }
    } catch (err) {
      Alert.alert(
        'Restore failed',
        err instanceof Error ? err.message : 'Try again.',
      );
    } finally {
      setBusy(false);
    }
  }

  if (configured) {
    // In production, render the hosted RC paywall. The bundled offerings
    // (weekly w/ 3-day trial, annual) come from the RC dashboard.
    // We dynamic-import to keep the native-only module out of Jest / web.
    return <ConfiguredPaywall onRestore={onRestore} busy={busy} />;
  }

  return (
    <SafeAreaView className="flex-1 bg-bg">
      <View className="flex-1 px-6 pt-8 pb-6 justify-between">
        <View>
          <Text className="text-muted text-xs uppercase tracking-wider">
            Subscribe
          </Text>
          <Text className="text-ink text-3xl font-semibold mt-1 leading-9">
            Unlock your full plan
          </Text>
          <Text className="text-muted mt-3 leading-6">
            3-day free trial, then $5.99 / week. Or save 90% with $24.99 / year.
            Cancel anytime in the App Store.
          </Text>
          <View className="gap-3 mt-8">
            {[
              'Personalized 8-week program',
              'Stealth Mode (haptics + AirPods, no screen)',
              'Progress, streaks, and reminders',
              'Private — your data stays on-device unless you opt in',
            ].map((b) => (
              <View key={b} className="flex-row items-start gap-3">
                <View className="w-1.5 h-1.5 rounded-full bg-accent mt-2.5" />
                <Text className="text-ink flex-1">{b}</Text>
              </View>
            ))}
          </View>
        </View>

        <View>
          <View className="bg-surface2 rounded-xl p-3 border border-border mb-3">
            <Text className="text-muted text-xs text-center">
              Subscriptions are off in this build (RevenueCat keys not set).
              Continue without a subscription to keep developing.
            </Text>
          </View>
          <Pressable
            onPress={() => router.replace('/home')}
            accessibilityRole="button"
            accessibilityLabel="Continue without subscription"
            className="bg-accent rounded-xl py-4 items-center active:opacity-80"
          >
            <Text className="text-ink font-semibold">Continue</Text>
          </Pressable>
          <Pressable
            onPress={onRestore}
            disabled={busy}
            accessibilityRole="button"
            accessibilityLabel="Restore previous purchases"
            className="py-3 mt-2 items-center"
          >
            <Text className="text-muted">Restore purchases</Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}

function ConfiguredPaywall({
  onRestore,
  busy,
}: {
  onRestore: () => Promise<void>;
  busy: boolean;
}) {
  const router = useRouter();
  const [PaywallUI, setPaywallUI] = useState<
    null | typeof import('react-native-purchases-ui').default
  >(null);

  useEffect(() => {
    let mounted = true;
    import('react-native-purchases-ui')
      .then((m) => {
        if (mounted) setPaywallUI(m.default);
      })
      .catch(() => {
        if (mounted) setPaywallUI(null);
      });
    return () => {
      mounted = false;
    };
  }, []);

  if (!PaywallUI) {
    return (
      <SafeAreaView className="flex-1 bg-bg items-center justify-center">
        <ActivityIndicator color="#7C5CFF" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-bg">
      <PaywallUI.Paywall
        onPurchaseCompleted={() => router.replace('/home')}
        onRestoreCompleted={() => router.replace('/home')}
        onDismiss={() => router.back()}
      />
      <Pressable
        onPress={onRestore}
        disabled={busy}
        accessibilityRole="button"
        accessibilityLabel="Restore previous purchases"
        className="absolute bottom-6 self-center py-3"
      >
        <Text className="text-muted">Restore purchases</Text>
      </Pressable>
    </SafeAreaView>
  );
}
