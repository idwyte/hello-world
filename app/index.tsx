import { useQuery } from '@tanstack/react-query';
import { Redirect } from 'expo-router';
import { useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';

import { useAuth } from '@/lib/auth';
import { hasSupabaseConfig } from '@/lib/env';
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
  // Dev / walk-through entry point — unconditional in __DEV__ so the user
  // can validate the Figma flow regardless of cached auth state or env
  // configuration. Switch DEV_ENTRY to '/welcome' to walk from screen 01,
  // or any other route to jump in mid-flow.
  if (__DEV__) {
    return <Redirect href={DEV_ENTRY} />;
  }
  // Production: no backend wired up yet → still demo flow, but enter at
  // /welcome (the persistence layer no-ops without Supabase).
  if (!hasSupabaseConfig()) {
    return <Redirect href="/welcome" />;
  }

  return <Router />;
}

// Edit this to change the dev launch destination. Examples:
//   '/welcome'           — Figma 01, full onboarding walk
//   '/assessment-intro'  — Figma 03 (NEW), 6-step preview before tests
//   '/index-test'        — Figma 04+05 (NEW), pulse + hold measurements
//   '/assessment'        — Figma 06-09 (NEW), 4 lifestyle questions
//   '/home'              — Figma 08, skip onboarding entirely
//   '/sign-in'           — Figma 02, validate auth screen
const DEV_ENTRY:
  | '/assessment-intro'
  | '/welcome'
  | '/index-test'
  | '/assessment'
  | '/home'
  | '/sign-in' = '/assessment-intro';

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
      <View className="flex-1 bg-bg items-center justify-center">
        <ActivityIndicator color="#7C5CFF" />
      </View>
    );
  }

  if (!auth.session) {
    return <Redirect href="/sign-in" />;
  }
  if (onboarded.data !== true) {
    return <Redirect href="/welcome" />;
  }
  if (hasRevenueCatConfig() && !entitlement.isPro) {
    return <Redirect href="/paywall" />;
  }
  return <Redirect href="/home" />;
}
