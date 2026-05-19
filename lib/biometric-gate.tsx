import { useEffect, useState, type ReactNode } from 'react';
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
 * aren't enrolled, the gate falls open after a single bypass (with a hint).
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

export function BiometricGate({ children }: { children: ReactNode }) {
  const { settings, hydrated } = useSettingsStore();
  const locked = hydrated && settings.biometricLocked;
  const [unlocked, setUnlocked] = useState(false);
  const [checking, setChecking] = useState(false);

  // Cold-launch prompt: when the gate first mounts in a locked state.
  useEffect(() => {
    if (!locked || unlocked) return;
    let cancelled = false;
    setChecking(true);
    void attemptAuth().then((ok) => {
      if (cancelled) return;
      setUnlocked(ok);
      setChecking(false);
    });
    return () => {
      cancelled = true;
    };
  }, [locked, unlocked]);

  // Re-lock on background → foreground transitions.
  useEffect(() => {
    if (!locked) return;
    const sub = AppState.addEventListener('change', (next) => {
      if (next === 'background' || next === 'inactive') {
        setUnlocked(false);
      }
    });
    return () => sub.remove();
  }, [locked]);

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
