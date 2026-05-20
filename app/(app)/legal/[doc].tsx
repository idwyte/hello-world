// Figma: 17 · legal viewer — node 104:278
// https://www.figma.com/design/qgY3Qcf7gP7w5V5A6uQTL4/?node-id=104-278
// Spec: docs/hone-roadmap-state.md line 95 (Figma-derived).
//
// Generic detail-header sub-page · "Last updated" line + 4 numbered
// sections (Acceptance · Account · Purchases · Medical disclaimer) ·
// parameterised route serves Terms / Privacy / Licenses.
//
// FIGMA-DIFF (stub):
//   - Body content is hardcoded placeholder; promote to MDX or markdown
//     content loaded by doc slug.
//   - "Last updated" timestamp hardcoded.
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Body } from '@/components/ui';

const TITLES: Record<string, string> = {
  terms: 'Terms of Service',
  privacy: 'Privacy Policy',
  licenses: 'Open-source Licenses',
};

const SECTIONS = [
  { heading: '1. Acceptance', body: 'By using Hone, you agree to these terms.' },
  { heading: '2. Account', body: 'You\'re responsible for your account and any activity under it.' },
  { heading: '3. Purchases', body: 'Lifetime purchase is non-refundable except where required by law.' },
  { heading: '4. Medical disclaimer', body: 'Hone is general wellness, not medical advice. Consult a clinician for pelvic-floor conditions.' },
];

export default function Legal() {
  const router = useRouter();
  const { doc } = useLocalSearchParams<{ doc: string }>();
  const title = TITLES[doc ?? 'terms'] ?? 'Document';

  return (
    <SafeAreaView className="flex-1 bg-surface-canvas">
      <View className="h-14 flex-row items-center px-4">
        <Body color="primary" style={{ fontSize: 20 }} onPress={() => router.back()}>
          ←
        </Body>
        <View className="flex-1 items-center -ml-5">
          <Body weight="semibold" color="primary" style={{ fontSize: 17, lineHeight: 24 }}>
            {title}
          </Body>
        </View>
      </View>

      <ScrollView className="flex-1" contentContainerClassName="px-6 pb-12">
        <Body size="xs" color="muted">
          Last updated 2026-05-20
        </Body>
        <View className="mt-4 gap-6">
          {SECTIONS.map((s) => (
            <View key={s.heading}>
              <Body weight="semibold" color="primary" style={{ fontSize: 17, lineHeight: 24 }}>
                {s.heading}
              </Body>
              <Body color="primary" className="mt-2" style={{ fontSize: 14, lineHeight: 22 }}>
                {s.body}
              </Body>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
