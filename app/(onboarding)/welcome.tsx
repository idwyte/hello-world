// Obsidian Kinetic: 01 · Welcome — Figma node 26:2.
// Centered lime H tile + HONE display + tagline; bottom CTA pair.
//
// Deferred auth (handoff Phase B): "Get started" silently creates an
// anonymous Supabase session before the funnel so persistence works at
// /generating; the user can link Apple/Google/email later in Settings →
// Security. "I already have an account" → /sign-in. In dev mode (no
// Supabase) the sign-in call no-ops and the funnel runs locally.
//
// NOTE: requires "Allow anonymous sign-ins" to be enabled in the
// Supabase dashboard (Authentication → Sign In / Up). If it's disabled
// the error surfaces in the alert below.
import { useState } from 'react';
import { useRouter } from 'expo-router';
import { Alert, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '@/components/obsidian';
import { signInAnonymously, useAuth } from '@/lib/auth';
import { hasSupabaseConfig } from '@/lib/env';
import { color, radius, spacing, type } from '@/lib/obsidian/tokens';

export default function Welcome() {
  const router = useRouter();
  const auth = useAuth();
  const [busy, setBusy] = useState(false);

  async function handleGetStarted() {
    if (busy) return;
    // Already signed in (returning user who hasn't onboarded, or a
    // guest resuming) — straight into the funnel.
    if (!hasSupabaseConfig() || auth.session) {
      router.push('/assessment-intro');
      return;
    }
    setBusy(true);
    try {
      await signInAnonymously();
      router.push('/assessment-intro');
    } catch (e) {
      Alert.alert(
        "Couldn't start",
        e instanceof Error
          ? e.message
          : 'Check your connection and try again.',
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: color.background }}>
      <View
        style={{
          flex: 1,
          paddingHorizontal: spacing.containerPadding,
          paddingTop: spacing.stackLg,
          paddingBottom: spacing.stackLg * 2,
        }}
      >
        <View style={{ flex: 1 }} />
        <View style={{ alignItems: 'center', gap: spacing.containerPadding }}>
          <View
            style={{
              width: 96,
              height: 96,
              borderRadius: 24,
              backgroundColor: color.primaryContainer,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Text style={{ ...type.display, color: color.onPrimaryFixed }}>
              H
            </Text>
          </View>
          <Text style={{ ...type.display, color: color.onSurface }}>HONE</Text>
          <Text
            style={{
              ...type.bodyLg,
              color: color.onSurfaceVariant,
              textAlign: 'center',
              width: 280,
            }}
          >
            Pelvic floor training that actually measures.
          </Text>
        </View>
        <View style={{ flex: 1 }} />
        <View style={{ gap: spacing.gutter }}>
          <Button
            label={busy ? 'Starting…' : 'Get started'}
            disabled={busy}
            onPress={() => void handleGetStarted()}
            style={{ width: '100%', borderRadius: radius.xl }}
          />
          <Button
            label="I already have an account"
            variant="ghost"
            disabled={busy}
            onPress={() => router.push('/sign-in')}
            style={{ width: '100%' }}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}
