// Figma: 29 · delete account — node 113:348
// https://www.figma.com/design/qgY3Qcf7gP7w5V5A6uQTL4/?node-id=113-348
// Spec: docs/hone-roadmap-state.md line 113 (Figma-derived).
//
// Detail header · 72 px danger badge + halo + exclamation · WHAT'S DELETED
// bullet card (4 danger × items) · purchase-preservation reassurance ·
// type-to-confirm Input showing DELETE with danger stroke · 50/50 Cancel /
// Delete forever buttons.
//
// FIGMA-DIFF (stub):
//   - 72 px danger badge + halo rendered as emoji ⚠️.
//   - Type-to-confirm Input not rendered; stub uses two buttons directly.
//   - No actual delete RPC fired — just navigates back.
import { useRouter } from 'expo-router';
import { ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Body, Button, Card, SectionLabel } from '@/components/ui';
import { semantic } from '@/lib/theme';

const DELETED = [
  'Your account and profile',
  'Your 8-week program and progress',
  'Your Pelvic Floor Index history',
  'Your saved preferences and reminders',
];

export default function DeleteAccount() {
  const router = useRouter();
  return (
    <SafeAreaView className="flex-1 bg-surface-canvas">
      <ScrollView className="flex-1" contentContainerClassName="px-6 pb-12">
        {/* Detail header */}
        <View className="h-14 flex-row items-center -mx-2">
          <Body color="primary" style={{ fontSize: 20 }} onPress={() => router.back()}>
            ←
          </Body>
          <View className="flex-1 items-center">
            <Body weight="semibold" color="primary" style={{ fontSize: 17, lineHeight: 24 }}>
              Delete account
            </Body>
          </View>
        </View>

        <View className="items-center mt-8">
          <View
            className="w-[72px] h-[72px] rounded-full items-center justify-center"
            style={{ backgroundColor: semantic.feedbackDanger + '33' }}
          >
            <Body weight="semibold" color="danger" style={{ fontSize: 36 }}>
              !
            </Body>
          </View>
          <Body
            weight="semibold"
            color="primary"
            className="mt-5 text-center"
            style={{ fontSize: 22, lineHeight: 28 }}
          >
            This can&rsquo;t be undone.
          </Body>
        </View>

        <Card padding="lg" radius="card" bordered className="mt-6">
          <SectionLabel tracking="tight">WHAT&rsquo;S DELETED</SectionLabel>
          <View className="gap-2 mt-3">
            {DELETED.map((d, i) => (
              <View key={i} className="flex-row items-start gap-3">
                <Body weight="semibold" color="danger">
                  ✕
                </Body>
                <Body color="primary" className="flex-1">
                  {d}
                </Body>
              </View>
            ))}
          </View>
        </Card>

        <Body size="sm" color="muted" className="mt-4 text-center px-4">
          Your in-app purchases stay attached to your Apple ID — you can
          restore them on any new account.
        </Body>

        <View className="flex-row gap-3 mt-10">
          <Button
            label="Cancel"
            variant="secondary"
            size="lg"
            radius="cta"
            className="flex-1"
            onPress={() => router.back()}
          />
          <Button
            label="Delete forever"
            variant="destructive"
            size="lg"
            radius="cta"
            className="flex-1"
            onPress={() => router.back()}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
