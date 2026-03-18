import React from 'react';
import { router } from 'expo-router';
import { OnboardingShell } from '../../components/character/OnboardingShell';
import { OptionGrid } from '../../components/character/OptionGrid';
import { useOwnerStore } from '../../store/ownerStore';
import { PRONOUNS_OPTIONS, AGE_RANGE_OPTIONS } from '../../data/characterOptions';
import { PronounsType, AgeRange } from '../../types/OwnerTypes';
import { Text, StyleSheet } from 'react-native';
import { UI, FONT } from '../../constants/theme';

export default function PronounsScreen() {
  const profile   = useOwnerStore((s) => s.profile);
  const updateProfile = useOwnerStore((s) => s.updateProfile);

  const pronouns  = (profile?.pronouns  ?? 'she/her') as PronounsType;
  const ageRange  = (profile?.ageRange  ?? '20s')     as AgeRange;

  return (
    <OnboardingShell
      step={2}
      title="A little about you"
      subtitle="Helps personalise your story — no wrong answers here."
      onContinue={() => router.push('/onboarding/appearance')}
    >
      <Text style={styles.label}>Pronouns</Text>
      <OptionGrid
        options={PRONOUNS_OPTIONS}
        selected={pronouns}
        onSelect={(v) => updateProfile({ pronouns: v as PronounsType })}
        columns={3}
      />

      <Text style={[styles.label, { marginTop: 16 }]}>Age range</Text>
      <OptionGrid
        options={AGE_RANGE_OPTIONS}
        selected={ageRange}
        onSelect={(v) => updateProfile({ ageRange: v as AgeRange })}
        columns={4}
      />
    </OnboardingShell>
  );
}

const styles = StyleSheet.create({
  label: { fontSize: FONT.sm, fontWeight: '700', color: UI.textSecondary },
});
