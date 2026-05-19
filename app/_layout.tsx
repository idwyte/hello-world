import '../global.css';
import { QueryClientProvider } from '@tanstack/react-query';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useMemo } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { ErrorBoundary } from '@/components/ErrorBoundary';
import { BiometricGate } from '@/lib/biometric-gate';
import { registerAppIntents } from '@/lib/intents';
import { createQueryClient } from '@/lib/query';
import { useSettingsStore } from '@/stores/settings';

export default function RootLayout() {
  const queryClient = useMemo(() => createQueryClient(), []);
  const hydrate = useSettingsStore((s) => s.hydrate);
  const hydrated = useSettingsStore((s) => s.hydrated);

  // Register Siri / Spotlight shortcuts on cold start. The helper itself
  // no-ops on web, Expo Go, and any platform where AppIntents isn't
  // available, so this is always safe.
  useEffect(() => {
    void registerAppIntents();
  }, []);

  // Settings store needs to be hydrated before BiometricGate can read the
  // biometricLocked flag; otherwise the first paint would briefly skip
  // the lock screen even when enabled.
  useEffect(() => {
    if (!hydrated) void hydrate();
  }, [hydrate, hydrated]);

  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: '#0B0B0F' }}>
      <SafeAreaProvider>
        <ErrorBoundary>
          <QueryClientProvider client={queryClient}>
            <StatusBar style="light" />
            <BiometricGate>
              <Stack
                screenOptions={{
                  headerShown: false,
                  contentStyle: { backgroundColor: '#0B0B0F' },
                }}
              />
            </BiometricGate>
          </QueryClientProvider>
        </ErrorBoundary>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
