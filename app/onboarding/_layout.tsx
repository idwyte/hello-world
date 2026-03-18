import { Stack } from 'expo-router';

export default function OnboardingLayout() {
  return (
    <Stack screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
      <Stack.Screen name="name" />
      <Stack.Screen name="pronouns" />
      <Stack.Screen name="appearance" />
      <Stack.Screen name="nails" />
      <Stack.Screen name="skincare" />
      <Stack.Screen name="fashion" />
      <Stack.Screen name="traits" />
      <Stack.Screen name="hobbies" />
      <Stack.Screen name="backstory" />
      <Stack.Screen name="shop" />
    </Stack>
  );
}
