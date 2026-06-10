// Obsidian Kinetic paywall — assembled from Price Card (handoff §3:
// "covers both pricing experiment arms"). When RC is configured the
// hosted RC paywall remains the production surface (offerings/prices
// live in the RC dashboard); the obsidian Price Card layout is the
// unconfigured/dev fallback and the design reference for the custom
// paywall arm of the pricing experiment.
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button, PriceCard, ScreenHeader } from '@/components/obsidian';
import { hasRevenueCatConfig, restorePurchases } from '@/lib/revenuecat';
import { color, spacing, type } from '@/lib/obsidian/tokens';

type Plan = 'annual' | 'monthly' | 'lifetime';

export default function Paywall() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [plan, setPlan] = useState<Plan>('annual');
  const configured = hasRevenueCatConfig();

  async function onRestore() {
    if (busy) return;
    setBusy(true);
    try {
      const e = await restorePurchases();
      if (e.isPro) {
        router.replace('/home');
      } else {
        Alert.alert(
          'No active subscription',
          'We could not find an active subscription on this account.',
        );
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
    return <ConfiguredPaywall onRestore={onRestore} busy={busy} />;
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: color.background }}>
      <ScreenHeader
        variant="close"
        title="Go further"
        onPress={() => router.replace('/home')}
      />
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          flexGrow: 1,
          paddingHorizontal: spacing.containerPadding,
          paddingTop: spacing.stackMd,
          paddingBottom: spacing.stackLg + spacing.stackMd,
          gap: spacing.stackMd,
        }}
      >
        <Text style={{ ...type.headlineLg, color: color.onSurface }}>
          Train with the full system
        </Text>
        <View style={{ gap: spacing.stackSm }}>
          {[
            'AI-personalised program, rebuilt at every retest',
            'Full five-axis measurement and trend history',
            'Stealth Mode — haptic-only training, no screen',
          ].map((b) => (
            <Text
              key={b}
              style={{ ...type.bodyMd, color: color.onSurfaceVariant }}
            >
              · {b}
            </Text>
          ))}
        </View>

        <View style={{ gap: spacing.gutter, marginTop: spacing.stackSm }}>
          <PriceCard
            period="ANNUAL"
            price="£29.99"
            sublabel="£2.50 / month — billed yearly"
            badge="BEST VALUE"
            selected={plan === 'annual'}
            onPress={() => setPlan('annual')}
          />
          <PriceCard
            period="MONTHLY"
            price="£7.99"
            sublabel="per month"
            selected={plan === 'monthly'}
            onPress={() => setPlan('monthly')}
          />
          <PriceCard
            period="LIFETIME"
            price="£49.99"
            sublabel="one-time purchase"
            selected={plan === 'lifetime'}
            onPress={() => setPlan('lifetime')}
          />
        </View>

        <View
          style={{
            backgroundColor: color.surfaceContainerLow,
            borderColor: color.outlineVariant,
            borderWidth: 1,
            borderRadius: 12,
            padding: spacing.gutter,
          }}
        >
          <Text
            style={{
              ...type.bodyMd,
              fontSize: 14,
              lineHeight: 20,
              color: color.onSurfaceVariant,
              textAlign: 'center',
            }}
          >
            Subscriptions are off in this build (RevenueCat keys not set).
            Continue without one to keep developing.
          </Text>
        </View>

        <View style={{ flex: 1 }} />
        <Button
          label="Continue"
          onPress={() => router.replace('/home')}
          style={{ width: '100%' }}
        />
        <Button
          label="Restore purchases"
          variant="ghost"
          disabled={busy}
          onPress={() => void onRestore()}
          style={{ width: '100%' }}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

type PaywallLoadState =
  | { kind: 'loading' }
  | { kind: 'ready'; module: typeof import('react-native-purchases-ui').default }
  | { kind: 'failed' };

function ConfiguredPaywall({
  onRestore,
  busy,
}: {
  onRestore: () => Promise<void>;
  busy: boolean;
}) {
  const router = useRouter();
  const [load, setLoad] = useState<PaywallLoadState>({ kind: 'loading' });

  useEffect(() => {
    let mounted = true;
    import('react-native-purchases-ui')
      .then((m) => {
        if (mounted) setLoad({ kind: 'ready', module: m.default });
      })
      .catch(() => {
        if (mounted) setLoad({ kind: 'failed' });
      });
    return () => {
      mounted = false;
    };
  }, []);

  if (load.kind === 'loading') {
    return (
      <SafeAreaView
        style={{
          flex: 1,
          backgroundColor: color.background,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <ActivityIndicator color={color.primaryContainer} />
      </SafeAreaView>
    );
  }

  if (load.kind === 'failed') {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: color.background }}>
        <View
          style={{
            flex: 1,
            paddingHorizontal: spacing.containerPadding,
            paddingTop: spacing.stackLg * 2,
            paddingBottom: spacing.stackLg,
            justifyContent: 'space-between',
          }}
        >
          <View style={{ gap: spacing.gutter }}>
            <Text
              style={{ ...type.labelCaps, color: color.onSurfaceVariant }}
            >
              SUBSCRIPTION UNAVAILABLE
            </Text>
            <Text style={{ ...type.headlineLg, color: color.onSurface }}>
              We couldn&rsquo;t load the subscription page
            </Text>
            <Text style={{ ...type.bodyMd, color: color.onSurfaceVariant }}>
              Check your connection and try again. If you already paid, tap
              Restore purchases to recover your subscription.
            </Text>
          </View>
          <View style={{ gap: spacing.gutter }}>
            <Button
              label="Restore purchases"
              disabled={busy}
              onPress={() => void onRestore()}
              style={{ width: '100%' }}
            />
            <Button
              label="Back"
              variant="ghost"
              onPress={() => router.back()}
              style={{ width: '100%' }}
            />
          </View>
        </View>
      </SafeAreaView>
    );
  }

  const PaywallUI = load.module;
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: color.background }}>
      <PaywallUI.Paywall
        onPurchaseCompleted={() => router.replace('/home')}
        onRestoreCompleted={() => router.replace('/home')}
        onDismiss={() => router.back()}
      />
    </SafeAreaView>
  );
}
