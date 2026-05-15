import { useQuery } from '@tanstack/react-query';
import { Redirect } from 'expo-router';
import { ActivityIndicator, View } from 'react-native';

import { useAuth } from '@/lib/auth';
import { hasSupabaseConfig } from '@/lib/env';
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
  // No backend wired up yet → run the M1 demo flow.
  if (!hasSupabaseConfig()) {
    return <Redirect href="/home" />;
  }

  return <Router />;
}

function Router() {
  const auth = useAuth();
  const onboarded = useOnboardingState(auth.user?.id ?? null);

  if (auth.loading || (auth.user && onboarded.isLoading)) {
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
  return <Redirect href="/home" />;
}
