// Figma: 29 · delete account — node 113:348
//
// Real wiring: type "DELETE" to enable the destructive button → confirm
// Alert → calls deleteAccount() (lib/auth.ts → delete-account Edge
// Function → auth.admin.deleteUser, cascades data per RLS) → signs out →
// routes to /welcome. Apple App Store guideline 5.1.1(v) compliance.
import { useState } from 'react';
import { useRouter } from 'expo-router';
import { Alert, ScrollView, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Body, Button, Card, ScreenHeader, SectionLabel } from '@/components/ui';
import { deleteAccount } from '@/lib/auth';
import { semantic } from '@/lib/theme';

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
    <SafeAreaView className="flex-1 bg-surface-canvas">
      <ScreenHeader
        kind="detail"
        title="Delete account"
        onBack={() => router.back()}
      />

      <ScrollView className="flex-1" contentContainerClassName="px-6 pb-12">
        <View className="items-center mt-6">
          <View
            className="w-[72px] h-[72px] rounded-full items-center justify-center"
            style={{ backgroundColor: semantic.feedbackDanger + '33' }}
          >
            <Body weight="semibold" color="danger" style={{ fontSize: 36 }}>
              !
            </Body>
          </View>
          <Body
            weight="semibold"
            color="primary"
            className="mt-5 text-center"
            style={{ fontSize: 22, lineHeight: 28 }}
          >
            This can&rsquo;t be undone.
          </Body>
        </View>

        <Card padding="lg" radius="card" bordered className="mt-6">
          <SectionLabel tracking="tight">WHAT&rsquo;S DELETED</SectionLabel>
          <View className="gap-2 mt-3">
            {DELETED.map((d, i) => (
              <View key={i} className="flex-row items-start gap-3">
                <Body weight="semibold" color="danger">
                  ✕
                </Body>
                <Body color="primary" className="flex-1">
                  {d}
                </Body>
              </View>
            ))}
          </View>
        </Card>

        <Body size="sm" color="muted" className="mt-4 text-center px-4">
          Your in-app purchases stay attached to your Apple ID or Google
          Account — you can restore them on any new account.
        </Body>

        <SectionLabel tracking="wide" className="mt-8">
          TYPE “{CONFIRM_PHRASE}” TO CONFIRM
        </SectionLabel>
        <TextInput
          value={typed}
          onChangeText={setTyped}
          autoCapitalize="characters"
          autoCorrect={false}
          editable={!busy}
          placeholder={CONFIRM_PHRASE}
          placeholderTextColor={semantic.textMuted}
          accessibilityLabel="Type the word DELETE to confirm"
          style={{
            marginTop: 12,
            paddingHorizontal: 16,
            paddingVertical: 14,
            borderRadius: 12,
            borderWidth: 1,
            borderColor: armed
              ? semantic.feedbackDanger
              : semantic.borderDefault,
            backgroundColor: semantic.surfaceRaised,
            color: semantic.textPrimary,
            fontSize: 16,
            letterSpacing: 1,
          }}
        />

        <View className="flex-row gap-3 mt-8">
          <Button
            label="Cancel"
            variant="secondary"
            size="lg"
            radius="cta"
            className="flex-1"
            disabled={busy}
            onPress={() => router.back()}
          />
          <Button
            label={busy ? 'Deleting…' : 'Delete forever'}
            variant="destructive"
            size="lg"
            radius="cta"
            className="flex-1"
            disabled={!armed || busy}
            onPress={confirmAndDelete}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
