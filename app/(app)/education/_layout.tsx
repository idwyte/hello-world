import { Stack } from 'expo-router';

import { color } from '@/lib/obsidian/tokens';

export default function EducationLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: color.background },
      }}
    />
  );
}
