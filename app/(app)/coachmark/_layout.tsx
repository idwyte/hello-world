import { Stack } from 'expo-router';

import { color } from '@/lib/obsidian/tokens';

export default function CoachmarkLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: color.background },
      }}
    />
  );
}
