import { Stack } from 'expo-router';

export default function OnboardingLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: '#0B0B0F' },
        gestureEnabled: false,
      }}
    >
      <Stack.Screen name="welcome" />
      <Stack.Screen name="assessment" />
      <Stack.Screen name="index-test" />
      <Stack.Screen name="generating" />
      <Stack.Screen name="plan-preview" />
      <Stack.Screen name="paywall" />
    </Stack>
  );
}
