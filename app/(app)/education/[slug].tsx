// Figma: 33 · education — node 129:347
// https://www.figma.com/design/qgY3Qcf7gP7w5V5A6uQTL4/?node-id=129-347
// Spec: docs/hone-roadmap-state.md line 104 (Figma-derived).
//
// Detail header "Pelvic floor 101" · accent kicker "EDUCATION · 3 MIN
// READ" + 26/32 article title · 2 article sections with 17/24 heading +
// 14/22 body · accent-soft "1 in 4" key-fact callout between them · "Got
// it · keep training" CTA · parameterised shell for the whole education
// catalog.
//
// FIGMA-DIFF (stub):
//   - Article content hardcoded; promote with content lookup by slug.
//   - Accent-soft key-fact callout rendered as a plain Card.
//   - Read-time computation from content length not done.
import { useRouter } from 'expo-router';
import { ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Body, Button, Card, SectionLabel } from '@/components/ui';

export default function Education() {
  const router = useRouter();
  // TODO Phase 2: read params.slug and load content from a catalog
  // (Markdown, MDX, or DB). Hardcoded content for now.

  return (
    <SafeAreaView className="flex-1 bg-surface-canvas">
      <View className="h-14 flex-row items-center px-4">
        <Body color="primary" style={{ fontSize: 20 }} onPress={() => router.back()}>
          ←
        </Body>
        <View className="flex-1 items-center -ml-5">
          <Body weight="semibold" color="primary" style={{ fontSize: 17, lineHeight: 24 }}>
            Pelvic floor 101
          </Body>
        </View>
      </View>

      <ScrollView className="flex-1" contentContainerClassName="px-4 pb-32">
        <SectionLabel tracking="wide" className="text-interactive-primary mt-2">
          EDUCATION · 3 MIN READ
        </SectionLabel>
        <Body
          weight="semibold"
          color="primary"
          className="mt-2"
          style={{ fontSize: 26, lineHeight: 32 }}
        >
          What your pelvic floor actually does.
        </Body>

        <Body weight="semibold" color="primary" className="mt-6" style={{ fontSize: 17, lineHeight: 24 }}>
          The muscles you can&rsquo;t see
        </Body>
        <Body color="primary" className="mt-2" style={{ fontSize: 14, lineHeight: 22 }}>
          The pelvic floor is a sling of muscles supporting the bladder,
          bowel, and (for some) the uterus. They contract reflexively when
          you sneeze, cough, or lift — and weaken without use.
        </Body>

        <Card padding="lg" radius="card" className="mt-6 bg-interactive-primary-pressed">
          <Body
            weight="semibold"
            color="primary"
            style={{ fontSize: 28, lineHeight: 36 }}
          >
            1 in 4
          </Body>
          <Body size="sm" color="primary" className="mt-1">
            adults will experience pelvic-floor dysfunction in their lifetime.
          </Body>
        </Card>

        <Body weight="semibold" color="primary" className="mt-6" style={{ fontSize: 17, lineHeight: 24 }}>
          Why training works
        </Body>
        <Body color="primary" className="mt-2" style={{ fontSize: 14, lineHeight: 22 }}>
          Consistent contractions build both endurance and fast-twitch
          response. The 8-week program targets both at different ratios per
          phase, so you don&rsquo;t plateau.
        </Body>
      </ScrollView>

      <View className="absolute bottom-0 left-0 right-0 px-4 pb-8">
        <Button
          label="Got it · keep training"
          variant="primary"
          size="lg"
          radius="cta"
          onPress={() => router.back()}
        />
      </View>
    </SafeAreaView>
  );
}
