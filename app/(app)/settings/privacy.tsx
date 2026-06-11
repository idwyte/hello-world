// Obsidian Kinetic: Settings · Privacy. No dedicated Figma frame —
// derived from the glass card pattern. Supabase settings query +
// analytics opt-in wiring unchanged.
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, ScrollView, Switch, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ScreenHeader } from '@/components/obsidian';
import { hasSupabaseConfig } from '@/lib/env';
import { color, glass, radius, spacing, type } from '@/lib/obsidian/tokens';
import { getSupabase } from '@/lib/supabase';

export default function Privacy() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [updating, setUpdating] = useState(false);

  const settingsQuery = useQuery({
    queryKey: ['settings'],
    enabled: hasSupabaseConfig(),
    queryFn: async () => {
      const supabase = getSupabase();
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) return null;
      const { data } = await supabase
        .from('settings')
        .select('analytics_opt_in')
        .eq('user_id', user.user.id)
        .maybeSingle();
      return { analyticsOptIn: (data?.analytics_opt_in as boolean) ?? false };
    },
  });

  async function toggle(next: boolean) {
    if (updating || !hasSupabaseConfig()) return;
    setUpdating(true);
    try {
      const supabase = getSupabase();
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('Not signed in.');
      const { error } = await supabase.from('settings').upsert({
        user_id: user.user.id,
        analytics_opt_in: next,
        updated_at: new Date().toISOString(),
      });
      if (error) throw error;
      await queryClient.invalidateQueries({ queryKey: ['settings'] });
    } catch (e) {
      Alert.alert(
        'Could not update',
        e instanceof Error ? e.message : 'Try again.',
      );
    } finally {
      setUpdating(false);
    }
  }

  const optIn = settingsQuery.data?.analyticsOptIn ?? false;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: color.background }}>
      <ScreenHeader
        variant="back"
        title="Privacy"
        onPress={() => router.back()}
      />
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          paddingHorizontal: spacing.containerPadding,
          paddingTop: spacing.stackMd,
          paddingBottom: 40,
          gap: spacing.stackMd,
        }}
      >
        <Text style={{ ...type.bodyMd, color: color.onSurfaceVariant }}>
          We never log your assessment answers, session content, or anything
          that could identify your training to a third party.
        </Text>

        <View
          style={{
            backgroundColor: color.surfaceContainerLow,
            borderColor: glass.border,
            borderWidth: glass.borderWidth,
            borderRadius: radius.xl,
            padding: spacing.stackMd,
            flexDirection: 'row',
            alignItems: 'center',
            gap: spacing.gutter,
          }}
        >
          <View style={{ flex: 1, gap: 2 }}>
            <Text style={{ ...type.bodyLg, color: color.onSurface }}>
              Anonymous product analytics
            </Text>
            <Text
              style={{
                ...type.bodyMd,
                fontSize: 14,
                lineHeight: 20,
                color: color.onSurfaceVariant,
              }}
            >
              Off by default. If on, we record only structural events
              (session_started, session_completed, duration_bucket) — never
              assessment answers or stealth-mode details. Scrubbed server-side.
            </Text>
          </View>
          <Switch
            value={optIn}
            disabled={updating || !hasSupabaseConfig()}
            onValueChange={toggle}
            trackColor={{
              true: color.primaryContainer,
              false: color.surfaceContainerHigh,
            }}
            thumbColor="#fff"
            accessibilityLabel="Anonymous product analytics"
          />
        </View>

        <Text
          style={{
            ...type.bodyMd,
            fontSize: 14,
            lineHeight: 20,
            color: color.onSurfaceVariant,
            marginTop: spacing.stackSm,
          }}
        >
          Data export and account deletion are handled in Settings → Account.
          Stealth-mode preferences (haptic intensity, cue style, decoy cover)
          stay on this device and never sync.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}
