// Obsidian Kinetic: 11 · AI Consent — Figma node 29:40.
// Explicit consent gate before assessment data leaves the device for
// Anthropic processing. Decline path stays first-class: rule-based plan,
// honest copy, non-punitive.
//
// Wiring unchanged: Agree → recordAiConsent() → /generating;
// Continue without AI → /generating (no consent recorded; the Edge
// Function's server-side ai_consent_at check keeps it honest).
import { useState } from 'react';
import { useRouter } from 'expo-router';
import { Alert, Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button, ScreenHeader } from '@/components/obsidian';
import { recordAiConsent } from '@/lib/persistence';
import { color, glass, radius, spacing, type } from '@/lib/obsidian/tokens';

const FACTS = [
  {
    kicker: 'WHAT IS SHARED',
    body: 'Your test measurements and assessment answers.',
  },
  {
    kicker: 'WHO PROCESSES IT',
    body: 'Anthropic, our AI provider, to build a program tailored to you.',
  },
  {
    kicker: 'YOUR CONTROL',
    body: 'Withdraw consent anytime in Settings.',
  },
];

export default function AiConsent() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function handleAgree() {
    if (busy) return;
    setBusy(true);
    try {
      await recordAiConsent();
      router.replace('/generating');
    } catch (e) {
      const msg =
        e instanceof Error ? e.message : "Couldn't record your choice.";
      Alert.alert('Save failed', msg);
      setBusy(false);
    }
  }

  function handleDecline() {
    // No consent recorded → buildProgram() falls back to the rule-based
    // generator; the archetype routing is deterministic either way.
    router.replace('/generating');
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: color.background }}>
      <ScreenHeader variant="back" onPress={() => router.back()} />
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
        <Text style={{ ...type.headlineLg, color: color.onSurface }}>
          Personalise my plan with AI
        </Text>

        {FACTS.map((f) => (
          <View
            key={f.kicker}
            style={{
              backgroundColor: color.surfaceContainerLow,
              borderColor: glass.border,
              borderWidth: glass.borderWidth,
              borderRadius: radius.xl,
              padding: spacing.stackMd,
              gap: 4,
            }}
          >
            <Text
              style={{ ...type.labelCaps, color: color.secondaryContainer }}
            >
              {f.kicker}
            </Text>
            <Text style={{ ...type.bodyMd, color: color.onSurface }}>
              {f.body}
            </Text>
          </View>
        ))}

        <View style={{ flexDirection: 'row', gap: 6 }}>
          <Pressable
            onPress={() => router.push('/legal/privacy')}
            accessibilityRole="link"
          >
            <Text
              style={{ ...type.bodyMd, color: color.secondaryContainer }}
            >
              Privacy Policy
            </Text>
          </Pressable>
          <Text style={{ ...type.bodyMd, color: color.onSurfaceVariant }}>
            ·
          </Text>
          <Pressable
            onPress={() => router.push('/legal/medical')}
            accessibilityRole="link"
          >
            <Text
              style={{ ...type.bodyMd, color: color.secondaryContainer }}
            >
              Medical Disclaimer
            </Text>
          </Pressable>
        </View>

        <View style={{ flex: 1 }} />

        <Button
          label={busy ? 'Saving…' : 'Agree and personalise'}
          disabled={busy}
          onPress={() => void handleAgree()}
          style={{ width: '100%' }}
        />
        <Button
          label="Continue without AI"
          variant="ghost"
          disabled={busy}
          onPress={handleDecline}
          style={{ width: '100%' }}
        />
        <Text
          style={{
            ...type.bodyMd,
            color: color.onSurfaceVariant,
            textAlign: 'center',
          }}
        >
          We&rsquo;ll build your plan with our standard rules instead —
          fully functional, just less personalised.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}
