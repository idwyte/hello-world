// Figma: 33 · education — node 129:347
//
// Article shell parameterised by slug. Content + read-time pulled from
// `lib/education.ts`; the accent-soft key-fact callout is rendered as a
// proper accent-pressed Card with an accent left border.
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Body, Button, Card, ScreenHeader, SectionLabel } from '@/components/ui';
import { getArticle, readTimeMinutes } from '@/lib/education';
import { semantic } from '@/lib/theme';

export default function Education() {
  const router = useRouter();
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const article = slug ? getArticle(slug) : null;

  if (!article) {
    return (
      <SafeAreaView className="flex-1 bg-surface-canvas">
        <ScreenHeader
          kind="detail"
          title="Education"
          onBack={() => router.back()}
        />
        <View className="flex-1 px-6 py-8">
          <Body color="muted">
            We don&rsquo;t have an article for that yet.
          </Body>
        </View>
      </SafeAreaView>
    );
  }

  const readMin = readTimeMinutes(article);

  // Splice the key-fact card between section 1 and section 2 if present,
  // matching the Figma layout (Body 1 → Callout → Body 2).
  const [first, ...rest] = article.sections;

  return (
    <SafeAreaView className="flex-1 bg-surface-canvas">
      <ScreenHeader
        kind="detail"
        title="Education"
        onBack={() => router.back()}
      />

      <ScrollView className="flex-1" contentContainerClassName="px-4 pb-32">
        <SectionLabel
          tracking="wide"
          className="text-interactive-primary mt-2"
        >
          EDUCATION · {readMin} MIN READ
        </SectionLabel>
        <Body
          weight="semibold"
          color="primary"
          className="mt-2"
          style={{ fontSize: 26, lineHeight: 32 }}
        >
          {article.title}
        </Body>

        {first && (
          <>
            <Body
              weight="semibold"
              color="primary"
              className="mt-6"
              style={{ fontSize: 17, lineHeight: 24 }}
            >
              {first.heading}
            </Body>
            <Body
              color="primary"
              className="mt-2"
              style={{ fontSize: 14, lineHeight: 22 }}
            >
              {first.body}
            </Body>
          </>
        )}

        {article.keyFact && (
          <Card
            padding="lg"
            radius="card"
            className="mt-6"
            style={{
              backgroundColor: semantic.interactivePrimaryPressed,
              borderLeftWidth: 3,
              borderLeftColor: semantic.interactivePrimary,
            }}
          >
            <Body
              weight="semibold"
              color="primary"
              style={{ fontSize: 28, lineHeight: 36 }}
            >
              {article.keyFact.headline}
            </Body>
            <Body size="sm" color="primary" className="mt-1">
              {article.keyFact.body}
            </Body>
          </Card>
        )}

        {rest.map((section) => (
          <View key={section.heading}>
            <Body
              weight="semibold"
              color="primary"
              className="mt-6"
              style={{ fontSize: 17, lineHeight: 24 }}
            >
              {section.heading}
            </Body>
            <Body
              color="primary"
              className="mt-2"
              style={{ fontSize: 14, lineHeight: 22 }}
            >
              {section.body}
            </Body>
          </View>
        ))}
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
