import { useRouter } from 'expo-router';
import { Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function StealthSettings() {
  const router = useRouter();
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

        <Text className="text-ink text-3xl font-semibold mt-2">
          Stealth Mode
        </Text>
        <Text className="text-muted mt-2 leading-6">
          Haptic intensity, audio cue style, decoy cover art, and
          AirPods-only enforcement will be configured here. M4 ships the
          underlying native Core Haptics engine and decoy player.
        </Text>

        <View className="bg-surface border border-border rounded-xl p-4 mt-6">
          <Text className="text-muted text-xs">
            Stealth Mode is the headline differentiator: run a Kegel session
            invisibly via haptics + AirPods behind a podcast-style lockscreen.
            Build target: M4.
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}
