// Figma: 18 · error state — node 104:327
// https://www.figma.com/design/qgY3Qcf7gP7w5V5A6uQTL4/?node-id=104-327
// Spec: docs/hone-roadmap-state.md line 96 (Figma-derived).
//
// Detail-header "Couldn't load program" + errorState instance (kind=retry)
// + "Contact support" muted text · escalation pattern for data-load
// failures. Distinct from components/ErrorBoundary.tsx (which is the
// generic crash fallback).
//
// FIGMA-DIFF (stub):
//   - 96 px error glyph (errorState component instance) rendered as emoji ⚠️.
//   - Retry callback hardcoded to router.replace('/home'); promote with
//     route params telling stub which screen failed + its fetch fn.
import { useRouter } from 'expo-router';
import { View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Body, Button } from '@/components/ui';
import { semantic } from '@/lib/theme';

export default function ErrorScreen() {
  const router = useRouter();
  return (
    <SafeAreaView className="flex-1 bg-surface-canvas">
      <View className="flex-1 items-center justify-center px-6">
        <View
          className="w-24 h-24 rounded-full items-center justify-center"
          style={{ backgroundColor: semantic.feedbackDanger + '33' }}
        >
          <Body weight="semibold" color="danger" style={{ fontSize: 42 }}>
            !
          </Body>
        </View>
        <Body
          weight="semibold"
          color="primary"
          className="mt-5 text-center"
          style={{ fontSize: 22, lineHeight: 28 }}
        >
          Couldn&rsquo;t load program
        </Body>
        <Body color="muted" className="mt-2 text-center" style={{ fontSize: 15, lineHeight: 22 }}>
          Check your connection and try again.
        </Body>

        <Button
          label="Try again"
          variant="primary"
          size="lg"
          radius="cta"
          className="mt-8 self-stretch"
          onPress={() => router.replace('/home')}
        />
        <Body size="sm" color="muted" className="mt-4">
          Still stuck? Contact support.
        </Body>
      </View>
    </SafeAreaView>
  );
}
