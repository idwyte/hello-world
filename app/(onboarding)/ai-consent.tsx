// Figma: NOT YET MAPPED — Figma MCP was disconnected when this screen
// was authored, so it is composed from already-Figma-vetted primitives
// (Card · Button · Body · SectionLabel · semantic tokens) rather than
// a freshly-pulled node. Cross-reference against Figma + add a node ID
// to docs/figma-node-map.md before launch.
//
// Sits between /assessment and /generating. Purpose: explicit consent
// before lifestyle answers (incl. intimacy frequency) and pelvic-floor
// measurements leave the device for AI processing by Anthropic via the
// generate-program Edge Function. Without this gate, the Edge Function
// returns 403 consent_required — and the client falls back to the
// rule-based offline plan, so opting out still works.
//
// FIGMA-DIFF (pending):
//   - Type scale, exact paddings, and the "what we send / what we don't"
//     bullet style need cross-reference once Figma MCP is restored.
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Body, Button, Card, SectionLabel } from '@/components/ui';
import { recordAiConsent } from '@/lib/persistence';
import { semantic } from '@/lib/theme';

const SHARED = [
  'Your pulse count (30-second test)',
  'Your max hold duration',
  'Age band, weekly strength & cardio days, intimacy frequency',
] as const;

const NOT_SHARED = [
  'Your name, email, or any direct identifier',
  'Session history, streak data, or progress',
  'Anything outside this one program-generation request',
] as const;

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
    // No consent recorded → buildProgram() returns the rule-based plan
    // and the Edge Function is never called. User still gets a program.
    router.replace('/generating');
  }

  return (
    <SafeAreaView className="flex-1 bg-surface-canvas">
      <ScrollView className="flex-1" contentContainerClassName="px-4 pb-32">
        <View className="h-20 justify-end mb-4">
          <Body
            weight="semibold"
            color="primary"
            style={{ fontSize: 28, lineHeight: 36 }}
          >
            One more thing
          </Body>
          <Body
            color="muted"
            className="mt-2"
            style={{ fontSize: 14, lineHeight: 20 }}
          >
            We can build a smarter, more personal program if you let us
            send your assessment data to our AI partner. Your choice.
          </Body>
        </View>

        <Card padding="xl" radius="card">
          <SectionLabel tracking="wide">WHAT WE&rsquo;D SEND</SectionLabel>
          <View className="mt-3 gap-2">
            {SHARED.map((line) => (
              <Bullet key={line} text={line} dot={semantic.interactivePrimary} />
            ))}
          </View>

          <SectionLabel tracking="wide" className="mt-6">
            WHAT WE WOULDN&rsquo;T SEND
          </SectionLabel>
          <View className="mt-3 gap-2">
            {NOT_SHARED.map((line) => (
              <Bullet key={line} text={line} dot={semantic.textMuted} />
            ))}
          </View>
        </Card>

        <Body
          color="muted"
          className="mt-6 text-center"
          style={{ fontSize: 12, lineHeight: 18 }}
        >
          Data is sent to Anthropic (the makers of Claude) only for the
          purpose of generating your 8-week plan. We do not store it on
          their servers. See the Privacy Policy for details. You can
          revoke this any time in Settings.
        </Body>
      </ScrollView>

      <View className="absolute bottom-0 left-0 right-0 px-6 pb-8 gap-3">
        <Button
          label={busy ? '…' : 'I agree — build my AI plan'}
          variant="primary"
          size="lg"
          radius="cta"
          disabled={busy}
          onPress={handleAgree}
        />
        <Button
          label="No thanks, use the offline plan"
          variant="ghost"
          size="md"
          disabled={busy}
          onPress={handleDecline}
        />
      </View>
    </SafeAreaView>
  );
}

function Bullet({ text, dot }: { text: string; dot: string }) {
  return (
    <View className="flex-row items-start">
      <View
        className="w-1.5 h-1.5 rounded-full mr-3 mt-2"
        style={{ backgroundColor: dot }}
      />
      <Body
        color="primary"
        style={{ fontSize: 14, lineHeight: 20 }}
        className="flex-1"
      >
        {text}
      </Body>
    </View>
  );
}
