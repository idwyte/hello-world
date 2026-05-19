import '../global.css';
import { QueryClientProvider } from '@tanstack/react-query';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useMemo } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { ErrorBoundary } from '@/components/ErrorBoundary';
import { registerAppIntents } from '@/lib/intents';
import { createQueryClient } from '@/lib/query';

export default function RootLayout() {
  const queryClient = useMemo(() => createQueryClient(), []);

  // Register Siri / Spotlight shortcuts on cold start. The helper itself
  // no-ops on web, Expo Go, and any platform where AppIntents isn't
  // available, so this is always safe.
  useEffect(() => {
    void registerAppIntents();
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: '#0B0B0F' }}>
      <SafeAreaProvider>
        <ErrorBoundary>
          <QueryClientProvider client={queryClient}>
            <StatusBar style="light" />
            <Stack
              screenOptions={{
                headerShown: false,
                contentStyle: { backgroundColor: '#0B0B0F' },
              }}
            />
          </QueryClientProvider>
        </ErrorBoundary>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
