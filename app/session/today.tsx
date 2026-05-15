import { Link, useRouter } from 'expo-router';
import { Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function SessionPreview() {
  const router = useRouter();
  return (
    <SafeAreaView className="flex-1 bg-bg">
      <View className="flex-1 px-6 pt-6">
        <Pressable onPress={() => router.back()} className="self-start py-2">
          <Text className="text-muted">← Back</Text>
        </Pressable>

        <Text className="text-ink text-3xl font-semibold mt-4">
          Foundation Day 1
        </Text>
        <Text className="text-muted mt-2">
          A short warm-up to find your pelvic floor, followed by two sets of
          short holds and quick flicks.
        </Text>

        <View className="bg-surface rounded-2xl p-5 mt-8 border border-border">
          <Text className="text-muted text-xs uppercase tracking-wider">
            Choose mode
          </Text>

          <Link href="/session/player" asChild>
            <Pressable className="bg-accent rounded-xl mt-4 py-4 px-5 active:opacity-80">
              <Text className="text-ink font-semibold text-lg">Normal</Text>
              <Text className="text-ink/70 text-sm mt-1">
                On-screen pacer + haptics
              </Text>
            </Pressable>
          </Link>

          <Link href="/session/stealth" asChild>
            <Pressable className="bg-surface2 border border-border rounded-xl mt-3 py-4 px-5 active:opacity-80">
              <Text className="text-ink font-semibold text-lg">
                Stealth (preview)
              </Text>
              <Text className="text-muted text-sm mt-1">
                AirPods + haptics, podcast-decoy lockscreen · M4
              </Text>
            </Pressable>
          </Link>
        </View>
      </View>
    </SafeAreaView>
  );
}
