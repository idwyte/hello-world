// Obsidian Kinetic: 01 · Welcome — Figma node 26:2.
// Centered lime H tile + HONE display + tagline; bottom CTA pair.
import { useRouter } from 'expo-router';
import { Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '@/components/obsidian';
import { color, radius, spacing, type } from '@/lib/obsidian/tokens';

export default function Welcome() {
  const router = useRouter();
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: color.background }}>
      <View
        style={{
          flex: 1,
          paddingHorizontal: spacing.containerPadding,
          paddingTop: spacing.stackLg,
          paddingBottom: spacing.stackLg * 2,
        }}
      >
        <View style={{ flex: 1 }} />
        <View style={{ alignItems: 'center', gap: spacing.containerPadding }}>
          <View
            style={{
              width: 96,
              height: 96,
              borderRadius: 24,
              backgroundColor: color.primaryContainer,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Text style={{ ...type.display, color: color.onPrimaryFixed }}>
              H
            </Text>
          </View>
          <Text style={{ ...type.display, color: color.onSurface }}>HONE</Text>
          <Text
            style={{
              ...type.bodyLg,
              color: color.onSurfaceVariant,
              textAlign: 'center',
              width: 280,
            }}
          >
            Pelvic floor training that actually measures.
          </Text>
        </View>
        <View style={{ flex: 1 }} />
        <View style={{ gap: spacing.gutter }}>
          <Button
            label="Get started"
            onPress={() => router.push('/assessment-intro')}
            style={{ width: '100%', borderRadius: radius.xl }}
          />
          <Button
            label="I already have an account"
            variant="ghost"
            onPress={() => router.push('/sign-in')}
            style={{ width: '100%' }}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}
