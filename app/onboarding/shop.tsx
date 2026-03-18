import React, { useState } from 'react';
import {
  Text, TextInput, View, TouchableOpacity,
  StyleSheet, KeyboardAvoidingView, Platform,
} from 'react-native';
import { router } from 'expo-router';
import { OnboardingShell } from '../../components/character/OnboardingShell';
import { useOwnerStore } from '../../store/ownerStore';
import { useGameStore } from '../../store/gameStore';
import { SHOP_VIBE_OPTIONS } from '../../data/characterOptions';
import { ShopVibe, OwnerProfile } from '../../types/OwnerTypes';
import { getStartingBonus } from '../../engine/traitEngine';
import { UI, FONT, SPACING, RADIUS } from '../../constants/theme';

export default function ShopScreen() {
  const profile       = useOwnerStore((s) => s.profile);
  const setProfile    = useOwnerStore((s) => s.setProfile);

  const [shopName, setShopName] = useState(profile?.shopName ?? '');
  const shopVibe = (profile?.shopVibe ?? 'warm_cozy') as ShopVibe;
  const [submitting, setSubmitting] = useState(false);

  const canOpen = shopName.trim().length > 0 && !submitting;

  const handleOpen = () => {
    if (submitting || !profile) return;
    setSubmitting(true);
    // Build final profile inline — avoids race between updateProfile setState and getState
    const final: OwnerProfile = { ...profile, shopName: shopName.trim(), shopVibe };
    setProfile(final);
    const bonus = getStartingBonus(final);
    useGameStore.getState().applyStartingBonus(bonus);
    router.replace('/');
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <OnboardingShell
        step={10}
        title="Name your shop"
        subtitle="The sign above the door. Choose something that feels like you."
        onContinue={handleOpen}
        canContinue={canOpen}
        continueLabel="Open My Shop ✦"
      >
        <TextInput
          style={styles.input}
          placeholder="e.g. Gloss & Gold, Studio Luxe…"
          placeholderTextColor={UI.textMuted}
          value={shopName}
          onChangeText={setShopName}
          autoFocus
          maxLength={32}
          returnKeyType="done"
        />
        <Text style={styles.hint}>{shopName.trim().length}/32</Text>

        <Text style={styles.label}>Vibe</Text>
        {SHOP_VIBE_OPTIONS.map((v) => {
          const isSelected = shopVibe === v.value;
          return (
            <TouchableOpacity
              key={v.value}
              style={[styles.vibeCard, isSelected && styles.vibeCardSelected]}
              onPress={() => updateProfile({ shopVibe: v.value as ShopVibe })}
              activeOpacity={0.75}
            >
              {/* Palette preview strip */}
              <View style={styles.paletteStrip}>
                {v.palette.map((hex, i) => (
                  <View key={i} style={[styles.paletteBlock, { backgroundColor: hex }]} />
                ))}
              </View>
              <View style={styles.vibeContent}>
                <Text style={[styles.vibeName, isSelected && styles.vibeNameSelected]}>
                  {v.emoji}  {v.label}
                </Text>
                <Text style={styles.vibeDesc}>{v.description}</Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </OnboardingShell>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  input: {
    fontSize: FONT.xl,
    fontWeight: '600',
    color: UI.textPrimary,
    borderBottomWidth: 2,
    borderBottomColor: UI.btnActive,
    paddingVertical: SPACING.md,
  },
  hint:  { fontSize: FONT.xs, color: UI.textMuted, textAlign: 'right', marginTop: SPACING.xs },
  label: { fontSize: FONT.sm, fontWeight: '700', color: UI.textSecondary, marginTop: SPACING.sm },
  vibeCard: {
    flexDirection: 'row',
    backgroundColor: UI.panelBg,
    borderRadius: RADIUS.md,
    borderWidth: 1.5,
    borderColor: UI.panelBorder,
    overflow: 'hidden',
  },
  vibeCardSelected: { borderColor: UI.btnActive },
  paletteStrip:     { width: 48, flexDirection: 'column' },
  paletteBlock:     { flex: 1 },
  vibeContent:      { flex: 1, padding: SPACING.sm, justifyContent: 'center' },
  vibeName:         { fontSize: FONT.md, fontWeight: '600', color: UI.textPrimary },
  vibeNameSelected: { color: UI.btnHover },
  vibeDesc:         { fontSize: FONT.xs, color: UI.textMuted, marginTop: 2 },
});
