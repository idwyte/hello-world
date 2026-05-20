import { Stack } from 'expo-router';

import { semantic } from '@/lib/theme';

export default function EducationLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: semantic.surfaceCanvas },
      }}
    />
  );
}
