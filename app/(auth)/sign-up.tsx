// Obsidian Kinetic: sign-up teaser. Value props with lime checks, funnel
// to /sign-in (server treats first-auth as account creation).
import { useRouter } from 'expo-router';
import { Check } from 'lucide-react-native';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button, ScreenHeader } from '@/components/obsidian';
import { color, radius, spacing, type } from '@/lib/obsidian/tokens';

const VALUE_PROPS = [
  'AI-personalised 8-week program',
  'Five-axis measured baseline',
  'Train discreetly with Stealth Mode',
];

export default function SignUp() {
  const router = useRouter();
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: color.background }}>
      <ScreenHeader variant="back" onPress={() => router.back()} />
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          flexGrow: 1,
          paddingHorizontal: spacing.containerPadding,
          paddingTop: spacing.stackLg,
          paddingBottom: spacing.stackLg + spacing.stackMd,
          gap: spacing.stackMd,
        }}
      >
        <Text style={{ ...type.headlineLg, color: color.onSurface }}>
          Get started
        </Text>
        <Text style={{ ...type.bodyMd, color: color.onSurfaceVariant }}>
          Create your account in seconds.
        </Text>

        <View style={{ gap: spacing.gutter, marginTop: spacing.stackSm }}>
          {VALUE_PROPS.map((p) => (
            <View
              key={p}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: spacing.gutter,
              }}
            >
              <View
                style={{
                  width: 20,
                  height: 20,
                  borderRadius: radius.full,
                  backgroundColor: color.primaryContainer,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Check size={12} color={color.onPrimaryFixed} strokeWidth={3} />
              </View>
              <Text style={{ ...type.bodyLg, color: color.onSurface }}>
                {p}
              </Text>
            </View>
          ))}
        </View>

        <View style={{ flex: 1 }} />
        <Button
          label="Continue"
          onPress={() => router.replace('/sign-in')}
          style={{ width: '100%' }}
        />
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'center',
            gap: 6,
          }}
        >
          <Text style={{ ...type.bodyMd, color: color.onSurfaceVariant }}>
            Already have an account?
          </Text>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Sign in"
            onPress={() => router.replace('/sign-in')}
          >
            <Text
              style={{ ...type.bodyMd, color: color.secondaryContainer }}
            >
              Sign in
            </Text>
          </Pressable>
        </View>
        <Text
          style={{
            ...type.bodyMd,
            fontSize: 14,
            lineHeight: 20,
            color: color.onSurfaceVariant,
            textAlign: 'center',
          }}
        >
          By continuing, you agree to our Terms and Privacy Policy.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}
