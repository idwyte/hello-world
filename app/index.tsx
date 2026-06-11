import { useQuery } from '@tanstack/react-query';
import { Redirect } from 'expo-router';
import { useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';

import { useAuth } from '@/lib/auth';
import { hasSupabaseConfig } from '@/lib/env';
import { color } from '@/lib/obsidian/tokens';
import {
  configureRevenueCat,
  hasRevenueCatConfig,
  useEntitlement,
} from '@/lib/revenuecat';
import { getSupabase } from '@/lib/supabase';

function useOnboardingState(userId: string | null) {
  return useQuery({
    queryKey: ['profile', userId, 'onboarded'],
    enabled: !!userId && hasSupabaseConfig(),
    queryFn: async () => {
      const supabase = getSupabase();
      const { data, error } = await supabase
        .from('profiles')
        .select('onboarded_at')
        .eq('id', userId!)
        .maybeSingle();
      if (error) throw error;
      return data?.onboarded_at !== null && data?.onboarded_at !== undefined;
    },
  });
}

export default function Index() {
  // No backend configured (pure dev walkthrough): enter at /welcome —
  // every persistence call no-ops without Supabase.
  if (!hasSupabaseConfig()) {
    return <Redirect href="/welcome" />;
  }

  return <Router />;
}

function Router() {
  const auth = useAuth();
  const onboarded = useOnboardingState(auth.user?.id ?? null);
  const { loading: entLoading, entitlement } = useEntitlement();

  // Bind RC's anonymous ID to the Supabase user once signed in.
  useEffect(() => {
    void configureRevenueCat(auth.user?.id ?? null);
  }, [auth.user?.id]);

  if (
    auth.loading ||
    (auth.user && onboarded.isLoading) ||
    (auth.user && entLoading && hasRevenueCatConfig())
  ) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: color.background,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <ActivityIndicator color={color.primaryContainer} />
      </View>
    );
  }

  // No session → the brand entry (Figma 01 Welcome). Its "Get started"
  // creates an anonymous session before the funnel (deferred auth);
  // "I already have an account" routes to /sign-in.
  if (!auth.session) {
    return <Redirect href="/welcome" />;
  }
  if (onboarded.data !== true) {
    return <Redirect href="/welcome" />;
  }
  if (hasRevenueCatConfig() && !entitlement.isPro) {
    return <Redirect href="/paywall" />;
  }
  return <Redirect href="/home" />;
}
