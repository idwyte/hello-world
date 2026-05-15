import { useRouter } from 'expo-router';
import { Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function StealthPreview() {
  const router = useRouter();
  return (
    <SafeAreaView className="flex-1 bg-bg">
      <View className="flex-1 items-center justify-center px-6">
        <Text className="text-muted text-xs uppercase tracking-wider">
          Stealth Haptic Mode
        </Text>
        <Text className="text-ink text-2xl font-semibold mt-3 text-center">
          Coming in M4
        </Text>
        <Text className="text-muted text-center mt-3 leading-6">
          Custom Core Haptics patterns, AirPods-only audio routing, and a
          podcast-decoy lockscreen. Requires a custom native module and a
          real-device dev-client build.
        </Text>
        <Pressable
          onPress={() => router.back()}
          className="bg-surface border border-border rounded-xl mt-8 py-3 px-6 active:opacity-80"
          accessibilityRole="button"
          accessibilityLabel="Back"
        >
          <Text className="text-ink">Back</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
