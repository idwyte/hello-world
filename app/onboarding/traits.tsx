import React from 'react';
import { Text, View, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { OnboardingShell } from '../../components/character/OnboardingShell';
import { TraitChip } from '../../components/character/TraitChip';
import { useOwnerStore } from '../../store/ownerStore';
import { TRAIT_OPTIONS } from '../../data/characterOptions';
import { PersonalityTraitId } from '../../types/OwnerTypes';
import { UI, FONT, SPACING, RADIUS } from '../../constants/theme';

const MAX_TRAITS = 2;

export default function TraitsScreen() {
  const profile = useOwnerStore((s) => s.profile);
  const updateProfile = useOwnerStore((s) => s.updateProfile);

  const selected = (profile?.traits ?? []) as PersonalityTraitId[];

  const toggle = (id: PersonalityTraitId) => {
    if (selected.includes(id)) {
      updateProfile({ traits: selected.filter((t) => t !== id) });
    } else if (selected.length < MAX_TRAITS) {
      updateProfile({ traits: [...selected, id] });
    }
  };

  const remaining = MAX_TRAITS - selected.length;

  return (
    <OnboardingShell
      step={7}
      title="Your personality"
      subtitle="Pick 2 traits. These give you permanent gameplay bonuses."
      onContinue={() => router.push('/onboarding/hobbies')}
      canContinue={selected.length === MAX_TRAITS}
    >
      <View style={[styles.counter, selected.length === MAX_TRAITS && styles.counterDone]}>
        <Text style={[styles.counterText, selected.length === MAX_TRAITS && styles.counterTextDone]}>
          {selected.length === MAX_TRAITS
            ? '✓ Perfect! Two traits selected'
            : `Pick ${remaining} more trait${remaining === 1 ? '' : 's'}`}
        </Text>
      </View>

      {TRAIT_OPTIONS.map((trait) => (
        <TraitChip
          key={trait.value}
          trait={trait}
          selected={selected.includes(trait.value)}
          disabled={!selected.includes(trait.value) && selected.length >= MAX_TRAITS}
          onPress={() => toggle(trait.value)}
        />
      ))}
    </OnboardingShell>
  );
}

const styles = StyleSheet.create({
  counter: {
    backgroundColor: '#FFF0F5',
    borderRadius: RADIUS.md,
    padding: SPACING.sm,
    borderWidth: 1,
    borderColor: UI.panelBorder,
  },
  counterDone: {
    backgroundColor: '#E8F8E8',
    borderColor: '#7CB97C',
  },
  counterText:     { fontSize: FONT.sm, color: UI.textSecondary, textAlign: 'center', fontWeight: '600' },
  counterTextDone: { color: '#4A7C4A' },
});
