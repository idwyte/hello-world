import React from 'react';
import { Text, View, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { OnboardingShell } from '../../components/character/OnboardingShell';
import { OptionGrid } from '../../components/character/OptionGrid';
import { useOwnerStore } from '../../store/ownerStore';
import {
  PERSONAL_STYLE_OPTIONS, COLOR_PALETTE_OPTIONS, ACCESSORY_VIBE_OPTIONS,
} from '../../data/characterOptions';
import { PersonalStyle, ColorPalette, AccessoryVibe } from '../../types/OwnerTypes';
import { UI, FONT } from '../../constants/theme';

export default function FashionScreen() {
  const profile = useOwnerStore((s) => s.profile);
  const updateProfile = useOwnerStore((s) => s.updateProfile);

  const style    = (profile?.personalStyle  ?? 'minimalist')   as PersonalStyle;
  const palette  = (profile?.colorPalette   ?? 'warm_neutrals')as ColorPalette;
  const accVibe  = (profile?.accessoryVibe  ?? 'gold')         as AccessoryVibe;

  return (
    <OnboardingShell
      step={6}
      title="Your style"
      subtitle="Your fashion shapes which customers feel at home in your shop."
      onContinue={() => router.push('/onboarding/traits')}
    >
      <Text style={styles.label}>Personal style</Text>
      <OptionGrid
        options={PERSONAL_STYLE_OPTIONS}
        selected={style}
        onSelect={(v) => updateProfile({ personalStyle: v as PersonalStyle })}
        columns={2}
      />

      <Text style={styles.label}>Colour palette</Text>
      <OptionGrid
        options={COLOR_PALETTE_OPTIONS}
        selected={palette}
        onSelect={(v) => updateProfile({ colorPalette: v as ColorPalette })}
        columns={2}
      />

      <Text style={styles.label}>Accessory vibe</Text>
      <OptionGrid
        options={ACCESSORY_VIBE_OPTIONS}
        selected={accVibe}
        onSelect={(v) => updateProfile({ accessoryVibe: v as AccessoryVibe })}
        columns={3}
        chipMode
      />
    </OnboardingShell>
  );
}

const styles = StyleSheet.create({
  label: { fontSize: FONT.sm, fontWeight: '700', color: UI.textSecondary },
});
