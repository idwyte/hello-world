import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { deleteAccount, signOut, useAuth } from '@/lib/auth';
import { hasSupabaseConfig } from '@/lib/env';

export default function Account() {
  const router = useRouter();
  const { user } = useAuth();
  const [busy, setBusy] = useState(false);
  const configured = hasSupabaseConfig();

  function confirmDelete() {
    Alert.alert(
      'Delete account?',
      'This permanently removes your account, assessments, programs, and session history. This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            if (busy) return;
            setBusy(true);
            try {
              await deleteAccount();
              router.replace('/');
            } catch (e) {
              Alert.alert(
                'Could not delete account',
                e instanceof Error ? e.message : 'Try again.',
              );
              setBusy(false);
            }
          },
        },
      ],
    );
  }

  async function onSignOut() {
    if (busy) return;
    setBusy(true);
    try {
      await signOut();
      router.replace('/');
    } catch (e) {
      Alert.alert(
        'Sign out failed',
        e instanceof Error ? e.message : 'Try again.',
      );
      setBusy(false);
    }
  }

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

        <Text className="text-ink text-3xl font-semibold mt-2">Account</Text>

        {configured && user ? (
          <View className="bg-surface rounded-xl p-4 border border-border mt-6">
            <Text className="text-muted text-xs uppercase tracking-wider">
              Signed in as
            </Text>
            <Text className="text-ink mt-1">{user.email ?? 'Anonymous'}</Text>
          </View>
        ) : null}

        <View className="mt-6 gap-3">
          <Pressable
            onPress={onSignOut}
            disabled={busy || !configured}
            accessibilityRole="button"
            accessibilityLabel="Sign out"
            className="bg-surface border border-border rounded-xl py-4 items-center active:opacity-80"
          >
            <Text className="text-ink">Sign out</Text>
          </Pressable>

          <Pressable
            onPress={confirmDelete}
            disabled={busy || !configured}
            accessibilityRole="button"
            accessibilityLabel="Delete account"
            className="border border-danger rounded-xl py-4 items-center active:opacity-80"
          >
            <Text className="text-danger">Delete account</Text>
          </Pressable>
        </View>

        <Text className="text-muted text-xs mt-6 leading-5">
          Deletion is required by Apple's guidelines and removes all data
          associated with your account, including assessments and progress.
        </Text>
      </View>
    </SafeAreaView>
  );
}
