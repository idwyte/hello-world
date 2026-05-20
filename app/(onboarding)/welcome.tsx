import { useRouter } from 'expo-router';
import { Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function Welcome() {
  const router = useRouter();
  return (
    <SafeAreaView className="flex-1 bg-bg">
      <View className="flex-1 px-6 pt-10 pb-8">
        <View className="flex-1 justify-center">
          <Text className="text-muted text-xs uppercase tracking-wider">
            Welcome
          </Text>
          <Text className="text-ink text-4xl font-semibold mt-2 leading-10">
            A few questions to{'\n'}personalize your plan.
          </Text>
          <Text className="text-muted mt-3 leading-6">
            10 quick questions — about 60 seconds. Your answers stay private and
            shape the program you'll see next.
          </Text>
        </View>

        <Pressable
          onPress={() => router.push('/assessment-intro')}
          accessibilityRole="button"
          accessibilityLabel="Start assessment"
          className="bg-accent rounded-xl py-4 items-center active:opacity-80"
        >
          <Text className="text-ink font-semibold">Start assessment</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
