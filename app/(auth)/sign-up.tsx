// Figma: 16 · sign-up — node 103:294
// https://www.figma.com/design/qgY3Qcf7gP7w5V5A6uQTL4/?node-id=103-294
//
// First-time account creation. Distinguished from /sign-in by the 3-row
// value-prop list above the auth options. Same OAuth + magic-link options
// underneath — server treats first-auth as user creation either way.
//
// Magic-link / OAuth all live in /sign-in (server treats first-auth as
// account creation either way). This screen is the value-prop teaser
// that funnels there; the dedicated split-out exists so future paid
// up-sell variants have a place to attach.
import { useRouter } from 'expo-router';
import { Check } from 'lucide-react-native';
import { Pressable, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Body, Button, ScreenHeader } from '@/components/ui';
import { semantic } from '@/lib/theme';

const VALUE_PROPS = [
  'Personalised 8-week program',
  'Measured Pelvic Floor Index',
  'Train discreetly with Stealth Mode',
];

export default function SignUp() {
  const router = useRouter();
  return (
    <SafeAreaView className="flex-1 bg-surface-canvas">
      <ScreenHeader
        kind="large-title"
        trailing={null}
      />
      <ScrollView
        className="flex-1"
        contentContainerClassName="px-6 pb-12"
      >
        <View>
          <Body
            weight="semibold"
            color="primary"
            style={{ fontSize: 32, lineHeight: 40 }}
          >
            Get started
          </Body>
          <Body size="md" color="muted" className="mt-2">
            Create your account in seconds.
          </Body>
        </View>

        <View className="mt-8 gap-3">
          {VALUE_PROPS.map((p) => (
            <View key={p} className="flex-row items-center gap-3">
              <View
                className="w-5 h-5 rounded-full items-center justify-center"
                style={{ backgroundColor: semantic.feedbackSuccess + '33' }}
              >
                <Check
                  size={12}
                  color={semantic.feedbackSuccess}
                  strokeWidth={3}
                />
              </View>
              <Body size="md" color="primary" style={{ fontSize: 15, lineHeight: 22 }}>
                {p}
              </Body>
            </View>
          ))}
        </View>

        {/* Stub forwards to /sign-in which has the real Apple/Google/email options. */}
        <Button
          label="Continue with sign-in options"
          variant="primary"
          size="lg"
          radius="cta"
          className="mt-10"
          onPress={() => router.replace('/sign-in')}
        />

        <View className="flex-row items-center justify-center mt-6 gap-1.5">
          <Body size="sm" color="muted">
            Already have an account?
          </Body>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Sign in"
            onPress={() => router.replace('/sign-in')}
          >
            <Body size="sm" weight="semibold" color="accent">
              Sign in
            </Body>
          </Pressable>
        </View>

        <Body size="xs" color="muted" className="text-center mt-6 px-6">
          By continuing, you agree to our Terms and Privacy Policy.
        </Body>
      </ScrollView>
    </SafeAreaView>
  );
}
