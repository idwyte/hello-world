// Figma: 09b · ai consent (NEW) — node 247:2
// https://www.figma.com/design/qgY3Qcf7gP7w5V5A6uQTL4/?node-id=247-2
// Spec: docs/figma-node-map.md line 86 · sits between 09 (intimacy
// question) and 10 (generating AI).
//
// Purpose: explicit consent before lifestyle answers (incl. intimacy
// frequency) and pelvic-floor measurements leave the device for AI
// processing by Anthropic via the generate-program Edge Function.
// Without this gate, the Edge Function returns 403 consent_required —
// and the client falls back to the rule-based offline plan, so opting
// out still works.
//
// FIGMA-DIFF (verify on desktop):
//   - Card was drafted with 12 px row gap and 13/18 bullets; the spec
//     above is the source of truth for any drift.
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
      <ScrollView
        className="flex-1"
        contentContainerClassName="grow justify-center px-6 py-8"
      >
        <View>
          <Body
            weight="semibold"
            color="primary"
            style={{ fontSize: 28, lineHeight: 36 }}
          >
            One more thing
          </Body>
          <Body
            color="muted"
            className="mt-3"
            style={{ fontSize: 14, lineHeight: 20 }}
          >
            We can build a smarter, more personal program if you let us
            send your assessment data to our AI partner. Your choice.
          </Body>
        </View>

        <Card padding="xl" radius="card" className="mt-8">
          <SectionLabel tracking="wide">WHAT WE&rsquo;D SEND</SectionLabel>
          <View className="mt-3 gap-3">
            {SHARED.map((line) => (
              <Bullet key={line} text={line} dot={semantic.interactivePrimary} />
            ))}
          </View>

          <SectionLabel tracking="wide" className="mt-6">
            WHAT WE WOULDN&rsquo;T SEND
          </SectionLabel>
          <View className="mt-3 gap-3">
            {NOT_SHARED.map((line) => (
              <Bullet key={line} text={line} dot={semantic.textMuted} />
            ))}
          </View>
        </Card>

        <Body
          color="muted"
          className="mt-8 text-center"
          style={{ fontSize: 12, lineHeight: 18 }}
        >
          Data is sent to Anthropic (the makers of Claude) only for the
          purpose of generating your 8-week plan. We do not store it on
          their servers. See the Privacy Policy for details. You can
          revoke this any time in Settings.
        </Body>
      </ScrollView>

      <View className="px-6 pb-8 pt-3 gap-3">
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
