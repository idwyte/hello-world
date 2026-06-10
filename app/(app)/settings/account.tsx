// Obsidian Kinetic: Settings · Account. No dedicated Figma frame —
// derived from the glass card + Button patterns. Auth wiring unchanged.
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button, ScreenHeader } from '@/components/obsidian';
import { deleteAccount, signOut, useAuth } from '@/lib/auth';
import { hasSupabaseConfig } from '@/lib/env';
import { color, glass, radius, spacing, type } from '@/lib/obsidian/tokens';

export default function Account() {
  const router = useRouter();
  const { user } = useAuth();
  const [busy, setBusy] = useState(false);
  const configured = hasSupabaseConfig();

  // Retained: the underlying RPC chain the new /settings/delete-account stub
  // will call once promoted from stub to full screen.
  function _confirmDelete() {
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
    <SafeAreaView style={{ flex: 1, backgroundColor: color.background }}>
      <ScreenHeader
        variant="back"
        title="Account"
        onPress={() => router.back()}
      />
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          paddingHorizontal: spacing.containerPadding,
          paddingTop: spacing.stackMd,
          paddingBottom: 40,
          gap: spacing.stackMd,
        }}
      >
        {configured && user ? (
          <View
            style={{
              backgroundColor: color.surfaceContainerLow,
              borderColor: glass.border,
              borderWidth: glass.borderWidth,
              borderRadius: radius.xl,
              padding: spacing.stackMd,
              gap: spacing.stackSm,
            }}
          >
            <Text style={{ ...type.labelCaps, color: color.onSurfaceVariant }}>
              Signed in as
            </Text>
            <Text style={{ ...type.bodyLg, color: color.onSurface }}>
              {user.email ?? 'Anonymous'}
            </Text>
          </View>
        ) : null}

        <Button
          label="Sign out"
          variant="ghost"
          onPress={onSignOut}
          disabled={busy || !configured}
          accessibilityLabel="Sign out"
          style={{ width: '100%' }}
        />

        {/* Routes to /settings/delete-account (Figma 29) instead of an
            inline Alert — the stub provides the type-to-confirm flow that
            App Store policy requires. confirmDelete() retained as the
            underlying RPC for the stub to call once promoted. */}
        <Pressable
          onPress={() => router.push('/settings/delete-account')}
          disabled={busy || !configured}
          accessibilityRole="button"
          accessibilityLabel="Delete account"
          style={({ pressed }) => ({
            height: 56,
            borderRadius: radius.xl,
            borderWidth: 1.5,
            borderColor: color.error,
            alignItems: 'center',
            justifyContent: 'center',
            opacity: busy || !configured ? 0.4 : pressed ? 0.7 : 1,
          })}
        >
          <Text style={{ ...type.labelButton, color: color.error }}>
            Delete account
          </Text>
        </Pressable>

        <Text
          style={{
            ...type.bodyMd,
            fontSize: 14,
            lineHeight: 20,
            color: color.onSurfaceVariant,
            marginTop: spacing.stackSm,
          }}
        >
          Deletion is required by Apple&apos;s guidelines and removes all data
          associated with your account, including assessments and progress.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}
