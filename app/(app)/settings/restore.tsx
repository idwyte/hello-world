// Figma: 20 · restore purchase — node 104:479
// https://www.figma.com/design/qgY3Qcf7gP7w5V5A6uQTL4/?node-id=104-479
//
// 3 sub-states: looking → restored OR not-found.
// Entered from settings/subscription → Restore purchase, or paywall footer.
//
// FIGMA-DIFF (stub):
//   - Renders the "looking" state by default. Promote to real RC.restorePurchases
//     state machine in full build (3 states + ErrorState fallback for network
//     errors per Figma flow notes).
//   - 72×72 accentSoft hero with 3-dot loader rendered as ActivityIndicator.
//   - No actual restore call wired; "Try again" navigates back.
import { useRouter } from 'expo-router';
import { ActivityIndicator, Pressable, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Body, Button } from '@/components/ui';
import { semantic } from '@/lib/theme';

export default function Restore() {
  const router = useRouter();
  return (
    <SafeAreaView className="flex-1 bg-surface-canvas">
      {/* Detail header — Figma `I104:406;84:867` (back + centered title 17/24) */}
      <View className="h-14 flex-row items-center px-4">
        <Pressable
          onPress={() => router.back()}
          hitSlop={12}
          accessibilityLabel="Back"
          className="w-11 h-11 items-center justify-center"
        >
          <Body color="primary" style={{ fontSize: 20 }}>
            ←
          </Body>
        </Pressable>
        <View className="flex-1 items-center -ml-11">
          <Body
            weight="semibold"
            color="primary"
            style={{ fontSize: 17, lineHeight: 24 }}
          >
            Restore purchase
          </Body>
        </View>
      </View>

      <View className="flex-1 items-center justify-center px-6">
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
          Checking your Apple ID…
        </Body>
        <Body
          color="muted"
          className="mt-2 text-center"
          style={{ fontSize: 15, lineHeight: 22 }}
        >
          This takes a few seconds.
        </Body>
      </View>

      <View className="px-6 pb-8">
        <Button
          label="Cancel"
          variant="secondary"
          size="lg"
          radius="cta"
          onPress={() => router.back()}
        />
      </View>
    </SafeAreaView>
  );
}
