// Onboarding funnel chrome. Motion spec §3.5: funnel steps slide in
// horizontally (forward = in from right); obsidian background.
import { Stack } from 'expo-router';

import { color } from '@/lib/obsidian/tokens';

export default function OnboardingLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: color.background },
        gestureEnabled: false,
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="welcome" />
      <Stack.Screen name="assessment-intro" />
      <Stack.Screen name="index-test" />
      <Stack.Screen name="assessment" />
      <Stack.Screen name="ai-consent" />
      <Stack.Screen name="generating" options={{ animation: 'fade' }} />
      <Stack.Screen name="plan-preview" options={{ animation: 'fade' }} />
      <Stack.Screen name="healthkit-connect" />
      <Stack.Screen name="paywall" options={{ animation: 'slide_from_bottom' }} />
      <Stack.Screen name="resume" />
    </Stack>
  );
}
