import { useEffect, useRef, useState, type ReactNode } from 'react';
import { ActivityIndicator, AppState, Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useSettingsStore } from '@/stores/settings';

/**
 * Biometric lock wrapper. When `settings.biometricLocked` is true, intercept
 * the app on cold launch and any return-to-foreground and require Face ID /
 * Touch ID before showing the wrapped children.
 *
 * Lazy-imports `expo-local-authentication` so this file is safe to require
 * from web / Jest. On platforms where the module isn't linked or biometrics
 * aren't enrolled, the gate falls open after a single bypass.
 *
 * Hydration contract: while the settings store is hydrating we render a
 * neutral splash. This prevents a brief unprotected paint of `children`
 * between mount and hydration completion.
 */

async function loadAuthModule() {
  try {
    return await import('expo-local-authentication');
  } catch {
    return null;
  }
}

async function attemptAuth(): Promise<boolean> {
  const m = await loadAuthModule();
  if (!m) return true; // module not linked — fall open
  try {
    const compatible = await m.hasHardwareAsync();
    if (!compatible) return true;
    const enrolled = await m.isEnrolledAsync();
    if (!enrolled) return true;
    const res = await m.authenticateAsync({
      promptMessage: 'Unlock Hone',
      cancelLabel: 'Cancel',
      disableDeviceFallback: false,
    });
    return res.success;
  } catch {
    return false;
  }
}

function Splash() {
  return (
    <View
      className="flex-1 bg-bg items-center justify-center"
      accessibilityLabel="Loading"
      accessibilityRole="progressbar"
    >
      <ActivityIndicator color="#7C5CFF" />
    </View>
  );
}

export function BiometricGate({ children }: { children: ReactNode }) {
  const { settings, hydrated } = useSettingsStore();
  const locked = settings.biometricLocked;
  const [unlocked, setUnlocked] = useState(false);
  const [checking, setChecking] = useState(false);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  // Cold-launch prompt: fires once hydration completes and the gate is
  // armed. The hydrated flip drives the effect re-run so children never
  // paint before the lock screen.
  useEffect(() => {
    if (!hydrated || !locked || unlocked) return;
    let cancelled = false;
    setChecking(true);
    void attemptAuth().then((ok) => {
      if (cancelled || !mountedRef.current) return;
      setUnlocked(ok);
      setChecking(false);
    });
    return () => {
      cancelled = true;
    };
  }, [hydrated, locked, unlocked]);

  // Re-lock when the app goes to background. We deliberately ignore the
  // `inactive` AppState — iOS dispatches it for Control Center / Notification
  // Center pulls and brief incoming-call drawers, and re-prompting Face ID
  // every time the user swipes from the top would be hostile.
  useEffect(() => {
    if (!locked) return;
    const sub = AppState.addEventListener('change', (next) => {
      if (next === 'background') {
        setUnlocked(false);
      }
    });
    return () => sub.remove();
  }, [locked]);

  if (!hydrated) {
    return (
      <SafeAreaView className="flex-1 bg-bg">
        <Splash />
      </SafeAreaView>
    );
  }

  if (!locked || unlocked) {
    return <>{children}</>;
  }

  return (
    <SafeAreaView className="flex-1 bg-bg">
      <View className="flex-1 items-center justify-center px-8">
        <Text className="text-ink text-2xl font-semibold">Hone is locked</Text>
        <Text className="text-muted text-sm text-center mt-3 leading-5">
          Use Face ID, Touch ID, or your device passcode to continue.
        </Text>
        <Pressable
          onPress={async () => {
            setChecking(true);
            const ok = await attemptAuth();
            if (!mountedRef.current) return;
            setUnlocked(ok);
            setChecking(false);
          }}
          accessibilityRole="button"
          accessibilityLabel="Unlock Hone"
          className="bg-accent rounded-xl mt-10 py-4 px-10 active:opacity-80"
        >
          {checking ? (
            <ActivityIndicator color="#F5F5F7" />
          ) : (
            <Text className="text-ink font-semibold">Unlock</Text>
          )}
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
