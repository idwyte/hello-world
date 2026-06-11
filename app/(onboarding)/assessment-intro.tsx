// Obsidian Kinetic: 03 · Assessment Intro — Figma node 27:12 (layout).
// COPY IS V2 from docs/hone-assessment-copy-deck.md — the Figma frame
// itself is flagged "⚠needs v2 copy" and still says "2 tests"; per the
// handoff rule the doc wins for copy, Figma wins for layout.
import { useState } from 'react';
import { useRouter } from 'expo-router';
import { ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button, ScreenHeader } from '@/components/obsidian';
import { color, glass, radius, spacing, type } from '@/lib/obsidian/tokens';

export default function AssessmentIntro() {
  const router = useRouter();
  const [showHow, setShowHow] = useState(false);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: color.background }}>
      <ScreenHeader
        variant="back"
        title="Assessment"
        onPress={() => router.back()}
      />
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          flexGrow: 1,
          paddingHorizontal: spacing.containerPadding,
          paddingTop: spacing.stackLg,
          paddingBottom: spacing.stackLg + spacing.stackMd,
          gap: spacing.containerPadding,
        }}
      >
        <Text style={{ ...type.labelCaps, color: color.onSurfaceVariant }}>
          A FEW QUICK MEASUREMENTS · ~4 MIN
        </Text>
        <Text style={{ ...type.headlineLg, color: color.onSurface }}>
          Let&rsquo;s find your baseline
        </Text>
        <Text style={{ ...type.bodyLg, color: color.onSurfaceVariant }}>
          Pelvic floor training works best when it&rsquo;s built from where
          you actually are. We&rsquo;ll take a few quick measurements —
          strength, stamina, speed, control — and check how your muscles
          relax, not just contract.
        </Text>
        <Text style={{ ...type.bodyLg, color: color.onSurfaceVariant }}>
          Nothing here is a test you can pass or fail. It&rsquo;s the
          starting point we build your whole programme from, and
          you&rsquo;ll remeasure every 8 weeks to see what&rsquo;s changed.
        </Text>

        {showHow && (
          <View
            style={{
              backgroundColor: glass.fill,
              borderColor: glass.border,
              borderWidth: glass.borderWidth,
              borderRadius: radius.xl,
              padding: spacing.stackMd,
              gap: spacing.stackSm,
            }}
          >
            <Text style={{ ...type.labelCaps, color: color.primaryFixedDim }}>
              HOW THESE WORK
            </Text>
            <Text style={{ ...type.bodyMd, color: color.onSurfaceVariant }}>
              Six short steps, one action each: rate one squeeze, time one
              hold, count your quality reps, count quick squeezes for 15
              seconds, check your technique, and check your release.
              Everything is self-reported or timed on this screen — no
              equipment. Stop if anything hurts; pain isn&rsquo;t something
              to push through here.
            </Text>
          </View>
        )}

        <View style={{ flex: 1 }} />

        <Text
          style={{
            ...type.bodyMd,
            fontSize: 14,
            lineHeight: 20,
            color: color.onSurfaceVariant,
            textAlign: 'center',
          }}
        >
          This is a guided wellness assessment, not a medical diagnosis.
        </Text>
        <View style={{ gap: spacing.gutter }}>
          <Button
            label="Begin"
            onPress={() => router.push('/index-test')}
            style={{ width: '100%' }}
          />
          <Button
            label="How these work"
            variant="ghost"
            onPress={() => setShowHow((s) => !s)}
            style={{ width: '100%' }}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
