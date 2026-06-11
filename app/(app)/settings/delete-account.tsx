// Obsidian Kinetic: Settings · Delete account.
// Originally Figma node 113:348 (legacy skin); re-skinned to the glass
// card + Input + error-palette patterns.
//
// Real wiring: type "DELETE" to enable the destructive button → confirm
// Alert → calls deleteAccount() (lib/auth.ts → delete-account Edge
// Function → auth.admin.deleteUser, cascades data per RLS) → signs out →
// routes to /welcome. Apple App Store guideline 5.1.1(v) compliance.
import { useState } from 'react';
import { useRouter } from 'expo-router';
import { Alert, Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button, Input, ScreenHeader } from '@/components/obsidian';
import { deleteAccount } from '@/lib/auth';
import { color, glass, radius, spacing, type } from '@/lib/obsidian/tokens';

const CONFIRM_PHRASE = 'DELETE';

const DELETED = [
  'Your account and profile',
  'Your 8-week program and progress',
  'Your Pelvic Floor Index history',
  'Your saved preferences and reminders',
];

export default function DeleteAccount() {
  const router = useRouter();
  const [typed, setTyped] = useState('');
  const [busy, setBusy] = useState(false);
  const armed = typed.trim().toUpperCase() === CONFIRM_PHRASE;

  function confirmAndDelete() {
    if (!armed || busy) return;
    Alert.alert(
      'Delete your account?',
      'This permanently removes your account and all training data. It cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete forever',
          style: 'destructive',
          onPress: () => {
            setBusy(true);
            deleteAccount()
              .then(() => {
                router.replace('/welcome');
              })
              .catch((e) => {
                setBusy(false);
                Alert.alert(
                  'Could not delete',
                  e instanceof Error
                    ? e.message
                    : 'Something went wrong. Try again or contact support.',
                );
              });
          },
        },
      ],
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: color.background }}>
      <ScreenHeader
        variant="back"
        title="Delete account"
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
        <View style={{ alignItems: 'center', gap: spacing.stackMd }}>
          <View
            style={{
              width: 72,
              height: 72,
              borderRadius: radius.full,
              borderWidth: 2,
              borderColor: color.error,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Text
              style={{ ...type.headlineLg, color: color.error, lineHeight: 36 }}
            >
              !
            </Text>
          </View>
          <Text
            style={{
              ...type.headlineMd,
              color: color.onSurface,
              textAlign: 'center',
            }}
          >
            This can&rsquo;t be undone.
          </Text>
        </View>

        <View
          style={{
            backgroundColor: color.surfaceContainerLow,
            borderColor: glass.border,
            borderWidth: glass.borderWidth,
            borderRadius: radius.xl,
            padding: spacing.stackMd,
            gap: spacing.gutter,
          }}
        >
          <Text style={{ ...type.labelCaps, color: color.onSurfaceVariant }}>
            WHAT&rsquo;S DELETED
          </Text>
          {DELETED.map((d, i) => (
            <View
              key={i}
              style={{
                flexDirection: 'row',
                alignItems: 'flex-start',
                gap: spacing.gutter,
              }}
            >
              <Text style={{ ...type.labelButton, color: color.error }}>✕</Text>
              <Text
                style={{ ...type.bodyMd, flex: 1, color: color.onSurface }}
              >
                {d}
              </Text>
            </View>
          ))}
        </View>

        <Text
          style={{
            ...type.bodyMd,
            fontSize: 14,
            lineHeight: 20,
            color: color.onSurfaceVariant,
            textAlign: 'center',
            paddingHorizontal: spacing.stackMd,
          }}
        >
          Your in-app purchases stay attached to your Apple ID or Google
          Account — you can restore them on any new account.
        </Text>

        <Input
          label={`TYPE “${CONFIRM_PHRASE}” TO CONFIRM`}
          error={armed ? 'Armed — this cannot be undone' : undefined}
          value={typed}
          onChangeText={setTyped}
          autoCapitalize="characters"
          autoCorrect={false}
          editable={!busy}
          placeholder={CONFIRM_PHRASE}
          accessibilityLabel="Type the word DELETE to confirm"
          containerStyle={{ marginTop: spacing.stackSm }}
        />

        <View
          style={{
            flexDirection: 'row',
            gap: spacing.gutter,
            marginTop: spacing.stackSm,
          }}
        >
          <Button
            label="Cancel"
            variant="ghost"
            disabled={busy}
            onPress={() => router.back()}
            style={{ flex: 1 }}
          />
          <Pressable
            onPress={confirmAndDelete}
            disabled={!armed || busy}
            accessibilityRole="button"
            accessibilityLabel={busy ? 'Deleting…' : 'Delete forever'}
            accessibilityState={{ disabled: !armed || busy }}
            style={({ pressed }) => ({
              flex: 1,
              height: 56,
              borderRadius: radius.xl,
              backgroundColor: color.errorContainer,
              alignItems: 'center',
              justifyContent: 'center',
              opacity: !armed || busy ? 0.4 : pressed ? 0.8 : 1,
            })}
          >
            <Text style={{ ...type.labelButton, color: color.onErrorContainer }}>
              {busy ? 'Deleting…' : 'Delete forever'}
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
