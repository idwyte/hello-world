// Obsidian Kinetic: education article shell. lib/education.ts lookup +
// read-time unchanged; key-fact callout is a cyan-stroked card.
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button, ScreenHeader } from '@/components/obsidian';
import { getArticle, readTimeMinutes } from '@/lib/education';
import { color, radius, spacing, type } from '@/lib/obsidian/tokens';

export default function Education() {
  const router = useRouter();
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const article = slug ? getArticle(slug) : null;

  if (!article) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: color.background }}>
        <ScreenHeader
          variant="back"
          title="Education"
          onPress={() => router.back()}
        />
        <View style={{ flex: 1, padding: spacing.containerPadding }}>
          <Text style={{ ...type.bodyMd, color: color.onSurfaceVariant }}>
            We don&rsquo;t have an article for that yet.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  const [first, ...rest] = article.sections;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: color.background }}>
      <ScreenHeader
        variant="back"
        title="Education"
        onPress={() => router.back()}
      />
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          flexGrow: 1,
          paddingHorizontal: spacing.containerPadding,
          paddingTop: spacing.stackMd,
          paddingBottom: spacing.stackLg + spacing.stackMd,
          gap: spacing.stackMd,
        }}
      >
        <Text style={{ ...type.labelCaps, color: color.primaryFixedDim }}>
          EDUCATION · {readTimeMinutes(article)} MIN READ
        </Text>
        <Text style={{ ...type.headlineLg, color: color.onSurface }}>
          {article.title}
        </Text>

        {first && (
          <ArticleSection heading={first.heading} body={first.body} />
        )}

        {article.keyFact && (
          <View
            style={{
              backgroundColor: color.surfaceContainerLow,
              borderColor: color.secondaryContainer,
              borderWidth: 1.5,
              borderRadius: radius.xl,
              padding: spacing.stackMd,
              gap: 4,
            }}
          >
            <Text
              style={{
                ...type.metricLg,
                fontSize: 32,
                lineHeight: 36,
                color: color.secondaryContainer,
              }}
            >
              {article.keyFact.headline}
            </Text>
            <Text style={{ ...type.bodyMd, color: color.onSurface }}>
              {article.keyFact.body}
            </Text>
          </View>
        )}

        {rest.map((section) => (
          <ArticleSection
            key={section.heading}
            heading={section.heading}
            body={section.body}
          />
        ))}

        <View style={{ flex: 1 }} />
        <Button
          label="Got it — keep training"
          onPress={() => router.back()}
          style={{ width: '100%' }}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

function ArticleSection({ heading, body }: { heading: string; body: string }) {
  return (
    <View style={{ gap: spacing.stackSm }}>
      <Text style={{ ...type.headlineMd, color: color.onSurface }}>
        {heading}
      </Text>
      <Text style={{ ...type.bodyMd, color: color.onSurfaceVariant }}>
        {body}
      </Text>
    </View>
  );
}
