import React from 'react';
import { Text, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { OnboardingShell } from '../../components/character/OnboardingShell';
import { OptionGrid } from '../../components/character/OptionGrid';
import { useOwnerStore } from '../../store/ownerStore';
import {
  NAIL_LENGTH_OPTIONS, NAIL_SHAPE_OPTIONS, NAIL_AESTHETIC_OPTIONS,
} from '../../data/characterOptions';
import { NailLength, NailShape, NailAesthetic } from '../../types/NailTypes';
import { UI, FONT } from '../../constants/theme';

export default function NailsScreen() {
  const profile = useOwnerStore((s) => s.profile);
  const updateProfile = useOwnerStore((s) => s.updateProfile);

  const nailLength    = (profile?.nailLength    ?? 'medium')     as NailLength;
  const nailShape     = (profile?.nailShape     ?? 'oval')       as NailShape;
  const nailAesthetic = (profile?.nailAesthetic ?? 'clean_nude') as NailAesthetic;

  return (
    <OnboardingShell
      step={4}
      title="Your nail vibe"
      subtitle="This shapes your owner's aesthetic — and hints at your shop's personality."
      onContinue={() => router.push('/onboarding/skincare')}
    >
      <Text style={styles.label}>Nail length</Text>
      <OptionGrid
        options={NAIL_LENGTH_OPTIONS}
        selected={nailLength}
        onSelect={(v) => updateProfile({ nailLength: v as NailLength })}
        columns={3}
        chipMode
      />

      <Text style={styles.label}>Nail shape</Text>
      <OptionGrid
        options={NAIL_SHAPE_OPTIONS}
        selected={nailShape}
        onSelect={(v) => updateProfile({ nailShape: v as NailShape })}
        columns={4}
        chipMode
      />

      <Text style={styles.label}>Aesthetic</Text>
      <OptionGrid
        options={NAIL_AESTHETIC_OPTIONS}
        selected={nailAesthetic}
        onSelect={(v) => updateProfile({ nailAesthetic: v as NailAesthetic })}
        columns={2}
      />
    </OnboardingShell>
  );
}

const styles = StyleSheet.create({
  label: { fontSize: FONT.sm, fontWeight: '700', color: UI.textSecondary },
});
