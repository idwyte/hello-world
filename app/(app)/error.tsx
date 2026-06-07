// Figma: 18 · error state — node 104:327
//
// Generic data-load failure screen. Accepts route params so callers can
// pass `title`, `message`, and `retryHref` (the destination of "Try
// again"). Defaults are "Couldn't load program" / connection hint /
// /home, matching Figma's primary use case.
//
// Distinct from components/ErrorBoundary.tsx (which is the generic
// uncaught-render fallback).
import { useLocalSearchParams, useRouter } from 'expo-router';
import { AlertCircle } from 'lucide-react-native';
import { View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Body, Button } from '@/components/ui';
import { semantic } from '@/lib/theme';

export default function ErrorScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    title?: string;
    message?: string;
    retryHref?: string;
  }>();
  const title = params.title || "Couldn't load program";
  const message =
    params.message || 'Check your connection and try again.';
  const retryHref = params.retryHref || '/home';

  return (
    <SafeAreaView className="flex-1 bg-surface-canvas">
      <View className="flex-1 items-center justify-center px-6">
        <View
          className="w-24 h-24 rounded-full items-center justify-center"
          style={{ backgroundColor: semantic.feedbackDanger + '33' }}
        >
          <AlertCircle
            size={48}
            color={semantic.feedbackDanger}
            strokeWidth={2.5}
          />
        </View>
        <Body
          weight="semibold"
          color="primary"
          className="mt-5 text-center"
          style={{ fontSize: 22, lineHeight: 28 }}
        >
          {title}
        </Body>
        <Body
          color="muted"
          className="mt-2 text-center"
          style={{ fontSize: 15, lineHeight: 22 }}
        >
          {message}
        </Body>

        <Button
          label="Try again"
          variant="primary"
          size="lg"
          radius="cta"
          className="mt-8 self-stretch"
          onPress={() =>
            router.replace(retryHref as Parameters<typeof router.replace>[0])
          }
        />
        <Body size="sm" color="muted" className="mt-4">
          Still stuck? Contact support.
        </Body>
      </View>
    </SafeAreaView>
  );
}
