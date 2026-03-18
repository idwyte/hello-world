import React from 'react';
import { Text, View, TouchableOpacity, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { OnboardingShell } from '../../components/character/OnboardingShell';
import { useOwnerStore } from '../../store/ownerStore';
import { BACKSTORY_OPTIONS } from '../../data/characterOptions';
import { BackstoryId } from '../../types/OwnerTypes';
import { UI, FONT, SPACING, RADIUS } from '../../constants/theme';

export default function BackstoryScreen() {
  const profile = useOwnerStore((s) => s.profile);
  const updateProfile = useOwnerStore((s) => s.updateProfile);

  const selected = (profile?.backstory ?? 'grandmother') as BackstoryId;

  return (
    <OnboardingShell
      step={9}
      title="How did you get here?"
      subtitle="Your backstory sets your starting conditions — money, reputation, and staff."
      onContinue={() => router.push('/onboarding/shop')}
    >
      {BACKSTORY_OPTIONS.map((b) => {
        const isSelected = selected === b.value;
        return (
          <TouchableOpacity
            key={b.value}
            style={[styles.card, isSelected && styles.cardSelected]}
            onPress={() => updateProfile({ backstory: b.value })}
            activeOpacity={0.75}
          >
            <Text style={[styles.cardTitle, isSelected && styles.cardTitleSelected]}>
              {b.label}
            </Text>
            <Text style={styles.quote}>{b.quote}</Text>

            <View style={styles.effectsRow}>
              {b.effects.map((e, i) => (
                <View key={i} style={styles.effectPill}>
                  <Text style={styles.effectText}>{e}</Text>
                </View>
              ))}
            </View>

            <View style={styles.statsRow}>
              <View style={styles.stat}>
                <Text style={styles.statValue}>${b.startingMoney}</Text>
                <Text style={styles.statLabel}>starting cash</Text>
              </View>
              <View style={styles.stat}>
                <Text style={styles.statValue}>{b.startingRep}</Text>
                <Text style={styles.statLabel}>starting rep</Text>
              </View>
              <View style={styles.stat}>
                <Text style={styles.statValue}>{b.staffPreHired ? '1' : '0'}</Text>
                <Text style={styles.statLabel}>pre-hired staff</Text>
              </View>
            </View>
          </TouchableOpacity>
        );
      })}
    </OnboardingShell>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: UI.panelBg,
    borderRadius: RADIUS.lg,
    borderWidth: 2,
    borderColor: UI.panelBorder,
    padding: SPACING.lg,
    gap: SPACING.sm,
  },
  cardSelected:      { borderColor: UI.btnActive, backgroundColor: '#FFF0F5' },
  cardTitle:         { fontSize: FONT.xl, fontWeight: '700', color: UI.textPrimary },
  cardTitleSelected: { color: UI.btnHover },
  quote:             { fontSize: FONT.md, color: UI.textSecondary, fontStyle: 'italic' },
  effectsRow:        { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.xs },
  effectPill: {
    backgroundColor: '#E8F0FF',
    borderRadius: RADIUS.full,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
  },
  effectText:  { fontSize: FONT.xs, color: '#4A6ABA', fontWeight: '600' },
  statsRow:    { flexDirection: 'row', gap: SPACING.md, marginTop: SPACING.xs },
  stat:        { alignItems: 'center', flex: 1 },
  statValue:   { fontSize: FONT.lg, fontWeight: '700', color: UI.textPrimary },
  statLabel:   { fontSize: FONT.xs, color: UI.textMuted },
});
