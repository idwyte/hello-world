// Obsidian Kinetic: Settings · Restore purchase.
// Originally Figma node 104:479 (legacy skin); re-skinned to the
// state-screen patterns.
//
// Real wiring: kicks `restorePurchases()` from RevenueCat on mount,
// transitions through 3 states — looking → restored / nothing-found.
// Errors collapse to "nothing-found" with a Try again CTA so the user
// always has a recovery path (Figma flow notes spec a separate
// ErrorState; we collapse it here to keep state count minimal).
import { useEffect, useState } from 'react';
import { useRouter } from 'expo-router';
import { ActivityIndicator, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Check, RotateCw } from 'lucide-react-native';

import { Button, ScreenHeader } from '@/components/obsidian';
import { color, radius, spacing, type } from '@/lib/obsidian/tokens';
import { hasRevenueCatConfig, restorePurchases } from '@/lib/revenuecat';

type Status = 'looking' | 'restored' | 'nothing';

export default function Restore() {
  const router = useRouter();
  const [status, setStatus] = useState<Status>('looking');
  const [attemptKey, setAttemptKey] = useState(0);

  useEffect(() => {
    let mounted = true;
    setStatus('looking');
    // No RC configured → settle as nothing-found immediately. The dev
    // path still exercises the visual states.
    if (!hasRevenueCatConfig()) {
      const t = setTimeout(() => {
        if (mounted) setStatus('nothing');
      }, 600);
      return () => {
        mounted = false;
        clearTimeout(t);
      };
    }
    restorePurchases()
      .then((ent) => {
        if (!mounted) return;
        setStatus(ent.isPro ? 'restored' : 'nothing');
      })
      .catch(() => {
        if (!mounted) return;
        setStatus('nothing');
      });
    return () => {
      mounted = false;
    };
  }, [attemptKey]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: color.background }}>
      <ScreenHeader
        variant="back"
        title="Restore purchase"
        onPress={() => router.back()}
      />

      <View
        style={{
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          paddingHorizontal: 32,
          gap: spacing.stackMd,
        }}
      >
        {status === 'looking' && (
          <>
            <View
              style={{
                width: 72,
                height: 72,
                borderRadius: radius.full,
                borderWidth: 2,
                borderColor: color.outlineVariant,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <ActivityIndicator color={color.primaryContainer} />
            </View>
            <Text style={{ ...type.labelCaps, color: color.onSurfaceVariant }}>
              RESTORE
            </Text>
            <Text
              style={{
                ...type.headlineMd,
                color: color.onSurface,
                textAlign: 'center',
              }}
            >
              Checking your account…
            </Text>
            <Text
              style={{
                ...type.bodyMd,
                color: color.onSurfaceVariant,
                textAlign: 'center',
              }}
            >
              This takes a few seconds.
            </Text>
          </>
        )}

        {status === 'restored' && (
          <>
            <View
              style={{
                width: 72,
                height: 72,
                borderRadius: radius.full,
                borderWidth: 2,
                borderColor: color.primaryContainer,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Check size={36} color={color.primaryContainer} strokeWidth={3} />
            </View>
            <Text style={{ ...type.labelCaps, color: color.onSurfaceVariant }}>
              RESTORE
            </Text>
            <Text
              style={{
                ...type.headlineMd,
                color: color.onSurface,
                textAlign: 'center',
              }}
            >
              Purchase restored.
            </Text>
            <Text
              style={{
                ...type.bodyMd,
                color: color.onSurfaceVariant,
                textAlign: 'center',
              }}
            >
              You&rsquo;re all set — every feature is unlocked.
            </Text>
          </>
        )}

        {status === 'nothing' && (
          <>
            <View
              style={{
                width: 72,
                height: 72,
                borderRadius: radius.full,
                borderWidth: 2,
                borderColor: color.outlineVariant,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <RotateCw size={32} color={color.onSurfaceVariant} />
            </View>
            <Text style={{ ...type.labelCaps, color: color.onSurfaceVariant }}>
              RESTORE
            </Text>
            <Text
              style={{
                ...type.headlineMd,
                color: color.onSurface,
                textAlign: 'center',
              }}
            >
              No purchases to restore.
            </Text>
            <Text
              style={{
                ...type.bodyMd,
                color: color.onSurfaceVariant,
                textAlign: 'center',
              }}
            >
              We couldn&rsquo;t find a previous purchase tied to this
              account. If you bought with a different account, sign in
              with that one and try again.
            </Text>
          </>
        )}
      </View>

      <View
        style={{
          paddingHorizontal: spacing.containerPadding,
          paddingBottom: spacing.stackLg + spacing.stackSm,
          gap: spacing.stackSm,
        }}
      >
        {status === 'nothing' ? (
          <>
            <Button
              label="Try again"
              onPress={() => setAttemptKey((k) => k + 1)}
              style={{ width: '100%' }}
            />
            <Button
              label="Back"
              variant="ghost"
              onPress={() => router.back()}
              style={{ width: '100%' }}
            />
          </>
        ) : (
          <Button
            label={status === 'restored' ? 'Done' : 'Cancel'}
            variant={status === 'restored' ? 'primary' : 'ghost'}
            onPress={() => router.back()}
            style={{ width: '100%' }}
          />
        )}
      </View>
    </SafeAreaView>
  );
}
