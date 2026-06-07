// Figma: 20 · restore purchase — node 104:479
//
// Real wiring: kicks `restorePurchases()` from RevenueCat on mount,
// transitions through 3 states — looking → restored / nothing-found.
// Errors collapse to "nothing-found" with a Try again CTA so the user
// always has a recovery path (Figma flow notes spec a separate
// ErrorState; we collapse it here to keep state count minimal).
import { useEffect, useState } from 'react';
import { useRouter } from 'expo-router';
import { ActivityIndicator, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Check, RotateCw } from 'lucide-react-native';

import { Body, Button, ScreenHeader } from '@/components/ui';
import { hasRevenueCatConfig, restorePurchases } from '@/lib/revenuecat';
import { semantic } from '@/lib/theme';

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
    <SafeAreaView className="flex-1 bg-surface-canvas">
      <ScreenHeader
        kind="detail"
        title="Restore purchase"
        onBack={() => router.back()}
      />

      <View className="flex-1 items-center justify-center px-6">
        {status === 'looking' && (
          <>
            <View
              className="w-[72px] h-[72px] rounded-full items-center justify-center"
              style={{ backgroundColor: semantic.interactivePrimaryPressed }}
            >
              <ActivityIndicator color={semantic.textPrimary} />
            </View>
            <Body
              weight="semibold"
              color="primary"
              className="mt-4 text-center"
              style={{ fontSize: 22, lineHeight: 28 }}
            >
              Checking your account…
            </Body>
            <Body
              color="muted"
              className="mt-2 text-center"
              style={{ fontSize: 15, lineHeight: 22 }}
            >
              This takes a few seconds.
            </Body>
          </>
        )}

        {status === 'restored' && (
          <>
            <View
              className="w-[72px] h-[72px] rounded-full items-center justify-center"
              style={{ backgroundColor: semantic.feedbackSuccess + '33' }}
            >
              <Check size={36} color={semantic.feedbackSuccess} strokeWidth={3} />
            </View>
            <Body
              weight="semibold"
              color="primary"
              className="mt-4 text-center"
              style={{ fontSize: 22, lineHeight: 28 }}
            >
              Purchase restored.
            </Body>
            <Body
              color="muted"
              className="mt-2 text-center"
              style={{ fontSize: 15, lineHeight: 22 }}
            >
              You&rsquo;re all set — every feature is unlocked.
            </Body>
          </>
        )}

        {status === 'nothing' && (
          <>
            <View
              className="w-[72px] h-[72px] rounded-full items-center justify-center"
              style={{ backgroundColor: semantic.surfaceRaised }}
            >
              <RotateCw size={32} color={semantic.textMuted} />
            </View>
            <Body
              weight="semibold"
              color="primary"
              className="mt-4 text-center"
              style={{ fontSize: 22, lineHeight: 28 }}
            >
              No purchases to restore.
            </Body>
            <Body
              color="muted"
              className="mt-2 text-center"
              style={{ fontSize: 15, lineHeight: 22 }}
            >
              We couldn&rsquo;t find a previous purchase tied to this
              account. If you bought with a different account, sign in
              with that one and try again.
            </Body>
          </>
        )}
      </View>

      <View className="px-6 pb-8">
        {status === 'nothing' ? (
          <>
            <Button
              label="Try again"
              variant="primary"
              size="lg"
              radius="cta"
              onPress={() => setAttemptKey((k) => k + 1)}
            />
            <Button
              label="Back"
              variant="ghost"
              size="md"
              className="mt-2"
              onPress={() => router.back()}
            />
          </>
        ) : (
          <Button
            label={status === 'restored' ? 'Done' : 'Cancel'}
            variant={status === 'restored' ? 'primary' : 'secondary'}
            size="lg"
            radius="cta"
            onPress={() => router.back()}
          />
        )}
      </View>
    </SafeAreaView>
  );
}
