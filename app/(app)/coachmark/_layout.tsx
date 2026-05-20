import { Stack } from 'expo-router';

import { semantic } from '@/lib/theme';

export default function CoachmarkLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: semantic.surfaceCanvas },
      }}
    />
  );
}
