import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, Pressable, Switch, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { hasSupabaseConfig } from '@/lib/env';
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
    <SafeAreaView className="flex-1 bg-bg">
      <View className="flex-1 px-6 pt-4">
        <Pressable
          onPress={() => router.back()}
          className="self-start py-3 px-3 -ml-3 active:opacity-60"
          hitSlop={12}
          accessibilityRole="button"
          accessibilityLabel="Back"
        >
          <Text className="text-muted">← Back</Text>
        </Pressable>

        <Text className="text-ink text-3xl font-semibold mt-2">Privacy</Text>
        <Text className="text-muted mt-2 leading-5">
          We never log your assessment answers, session content, or anything
          that could identify your training to a third party.
        </Text>

        <View className="bg-surface border border-border rounded-xl p-4 mt-6 flex-row items-center justify-between">
          <View className="flex-1 pr-4">
            <Text className="text-ink">Anonymous product analytics</Text>
            <Text className="text-muted text-xs mt-1 leading-5">
              Off by default. If on, we record only structural events
              (session_started, session_completed, duration_bucket) — never
              assessment answers or stealth-mode details. Scrubbed server-side.
            </Text>
          </View>
          <Switch
            value={optIn}
            disabled={updating || !hasSupabaseConfig()}
            onValueChange={toggle}
            trackColor={{ true: '#7C5CFF', false: '#2A2A36' }}
            accessibilityLabel="Anonymous product analytics"
          />
        </View>

        <Text className="text-muted text-xs mt-6 leading-5">
          Data export and account deletion are handled in Settings → Account.
          Stealth-mode preferences (haptic intensity, cue style, decoy cover)
          stay on this device and never sync.
        </Text>
      </View>
    </SafeAreaView>
  );
}
