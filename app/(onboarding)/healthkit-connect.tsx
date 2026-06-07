// Figma: 19 · healthkit connect — node 104:379
// https://www.figma.com/design/qgY3Qcf7gP7w5V5A6uQTL4/?node-id=104-379
//
// Permission ask, shown after plan-preview on iOS. Skip + Connect.
//
// FIGMA-DIFF (stub):
//   - 96×96 heart glyph in surface card rendered as lucide Heart.
//   - Connect doesn't actually call HKHealthStore.requestAuthorization().
//   - Skip is a muted text button in top-right; styled as text Pressable here.
//
// Android: HealthKit doesn't exist there. If anything routes here from
// Android, fail-silently to /paywall — Health Connect is a Phase 3 item.
import { useEffect } from 'react';
import { useRouter } from 'expo-router';
import { Heart } from 'lucide-react-native';
import { Platform, Pressable, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Body, Button } from '@/components/ui';
import { semantic } from '@/lib/theme';

const VALUE_PROPS = [
  'Log each session as Mindful Minutes',
  'Track your pelvic-floor index over time',
  'Export your data anytime',
];

export default function HealthkitConnect() {
  const router = useRouter();
  const finish = () => router.replace('/paywall');

  useEffect(() => {
    if (Platform.OS === 'android') {
      router.replace('/paywall');
    }
  }, [router]);

  if (Platform.OS === 'android') return null;

  return (
    <SafeAreaView className="flex-1 bg-surface-canvas">
      {/* Top row — Figma `104:354`: empty left + Skip right */}
      <View className="h-11 flex-row items-center justify-end px-6">
        <Pressable
          onPress={finish}
          hitSlop={12}
          accessibilityRole="button"
          accessibilityLabel="Skip"
        >
          <Body weight="medium" color="muted" style={{ fontSize: 15, lineHeight: 22 }}>
            Skip
          </Body>
        </Pressable>
      </View>

      <ScrollView className="flex-1" contentContainerClassName="px-6 pb-8">
        {/* Heart hero — Figma `104:357` (96×96 in surface card, our own art) */}
        <View className="items-center mt-12">
          <View
            className="w-24 h-24 rounded-[22px] items-center justify-center"
            style={{ backgroundColor: semantic.surfaceRaised }}
          >
            <Heart
              size={48}
              color={semantic.feedbackDanger}
              fill={semantic.feedbackDanger}
            />
          </View>
        </View>

        <View className="items-center mt-7">
          <Body
            weight="semibold"
            color="primary"
            style={{ fontSize: 26, lineHeight: 32 }}
          >
            Connect to Apple Health
          </Body>
          <Body
            color="muted"
            className="mt-2 text-center px-6"
            style={{ fontSize: 15, lineHeight: 22 }}
          >
            Save your sessions to the Health app.
          </Body>
        </View>

        <View className="mt-10 gap-3.5 px-2">
          {VALUE_PROPS.map((p) => (
            <View key={p} className="flex-row items-center gap-3.5">
              <View
                className="w-6 h-6 rounded-full items-center justify-center"
                style={{ backgroundColor: semantic.feedbackSuccess + '33' }}
              >
                <Body size="xs" weight="semibold" color="success">
                  ✓
                </Body>
              </View>
              <Body color="primary" style={{ fontSize: 15, lineHeight: 22 }}>
                {p}
              </Body>
            </View>
          ))}
        </View>

        <Button
          label={Platform.OS === 'ios' ? 'Connect' : 'Not available on Android'}
          variant="primary"
          size="lg"
          radius="cta"
          className="mt-12"
          disabled={Platform.OS !== 'ios'}
          onPress={finish}
        />

        <Body size="xs" color="muted" className="text-center mt-4 px-6">
          We only write to Health — we never read your other data.
        </Body>
      </ScrollView>
    </SafeAreaView>
  );
}
