import { Stack } from 'expo-router';

import { semantic } from '@/lib/theme';

// Nests program/index.tsx + day/[dayId] + exercise/[exerciseId] +
// intro/[slug] under one Stack so the dynamic sub-routes don't auto-
// register as sibling tabs at the (app) layer.
export default function ProgramLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: semantic.surfaceCanvas },
      }}
    />
  );
}
