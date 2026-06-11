import { Component, type ReactNode } from 'react';
import { Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type Props = { children: ReactNode };
type State = { error: Error | null };

export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(_error: Error) {
    // We deliberately don't ship a crash reporter (Sentry, etc.) by default
    // for privacy reasons. Add one here behind the user's analytics opt-in
    // when M6 wires PostHog / Sentry through the Edge Function.
  }

  reset = () => {
    this.setState({ error: null });
  };

  render() {
    if (!this.state.error) return this.props.children;
    return (
      <SafeAreaView className="flex-1 bg-bg">
        <View className="flex-1 items-center justify-center px-6">
          <Text className="text-ink text-2xl font-semibold">
            Something went wrong
          </Text>
          <Text className="text-muted text-center mt-3 leading-6">
            {this.state.error.message ||
              'An unexpected error stopped the app. Try again.'}
          </Text>
          <Pressable
            onPress={this.reset}
            accessibilityRole="button"
            accessibilityLabel="Try again"
            className="bg-accent rounded-xl mt-8 py-4 px-8 active:opacity-80"
          >
            <Text className="text-ink font-semibold">Try again</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }
}
