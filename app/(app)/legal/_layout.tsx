import { Stack } from 'expo-router';

import { semantic } from '@/lib/theme';

export default function LegalLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: semantic.surfaceCanvas },
      }}
    />
  );
}
