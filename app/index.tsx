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
  // No backend wired up yet → demo / walk-through mode. Enter at /welcome so
  // the entire onboarding chain is reachable on dev emulator without
  // configuring Supabase. The persistence layer no-ops cleanly when
  // hasSupabaseConfig() is false, so welcome → assessment → index-test →
  // generating → plan-preview → paywall → home works end-to-end.
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
