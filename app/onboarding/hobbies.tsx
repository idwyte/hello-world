import React from 'react';
import { Text, View, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { OnboardingShell } from '../../components/character/OnboardingShell';
import { useOwnerStore } from '../../store/ownerStore';
import { HOBBY_OPTIONS } from '../../data/characterOptions';
import { HobbyId } from '../../types/OwnerTypes';
import { UI, FONT, SPACING, RADIUS } from '../../constants/theme';
import { TouchableOpacity } from 'react-native';

const MAX_HOBBIES = 3;

export default function HobbiesScreen() {
  const profile = useOwnerStore((s) => s.profile);
  const updateProfile = useOwnerStore((s) => s.updateProfile);

  const selected = (profile?.hobbies ?? []) as HobbyId[];

  const toggle = (id: HobbyId) => {
    if (selected.includes(id)) {
      updateProfile({ hobbies: selected.filter((h) => h !== id) });
    } else if (selected.length < MAX_HOBBIES) {
      updateProfile({ hobbies: [...selected, id] });
    }
  };

  const remaining = MAX_HOBBIES - selected.length;
  const done = selected.length === MAX_HOBBIES;

  return (
    <OnboardingShell
      step={8}
      title="Outside the shop"
      subtitle="Pick 3 hobbies — each unlocks a unique perk or event."
      onContinue={() => router.push('/onboarding/backstory')}
      canContinue={selected.length === MAX_HOBBIES}
    >
      <View style={[styles.counter, done && styles.counterDone]}>
        <Text style={[styles.counterText, done && styles.counterTextDone]}>
          {done
            ? '✓ Three hobbies selected!'
            : `Choose ${remaining} more hobb${remaining === 1 ? 'y' : 'ies'}`}
        </Text>
      </View>

      <View style={styles.grid}>
        {HOBBY_OPTIONS.map((hobby) => {
          const isSelected = selected.includes(hobby.value);
          const isDisabled = !isSelected && selected.length >= MAX_HOBBIES;
          return (
            <TouchableOpacity
              key={hobby.value}
              style={[
                styles.card,
                isSelected && styles.cardSelected,
                isDisabled && styles.cardDisabled,
              ]}
              onPress={() => toggle(hobby.value)}
              activeOpacity={isDisabled ? 1 : 0.75}
            >
              <Text style={styles.emoji}>{hobby.emoji}</Text>
              <Text style={[styles.cardLabel, isSelected && styles.cardLabelSelected]}>
                {hobby.label}
              </Text>
              <Text style={styles.cardEffect}>{hobby.effect}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
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
  counterDone: { backgroundColor: '#E8F8E8', borderColor: '#7CB97C' },
  counterText:     { fontSize: FONT.sm, color: UI.textSecondary, textAlign: 'center', fontWeight: '600' },
  counterTextDone: { color: '#4A7C4A' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.xs },
  card: {
    width: '48%',
    backgroundColor: UI.panelBg,
    borderRadius: RADIUS.md,
    borderWidth: 1.5,
    borderColor: UI.panelBorder,
    padding: SPACING.sm,
    gap: 2,
  },
  cardSelected:      { borderColor: UI.btnActive, backgroundColor: '#FFE4EC' },
  cardDisabled:      { opacity: 0.4 },
  emoji:             { fontSize: 20 },
  cardLabel:         { fontSize: FONT.sm, fontWeight: '600', color: UI.textPrimary },
  cardLabelSelected: { color: UI.btnHover },
  cardEffect:        { fontSize: FONT.xs, color: UI.textMuted, lineHeight: 15 },
});
