import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { OnboardingShell } from '../../components/character/OnboardingShell';
import { SkinToneGrid } from '../../components/character/SkinToneGrid';
import { ColorSwatch } from '../../components/character/ColorSwatch';
import { OptionGrid } from '../../components/character/OptionGrid';
import { AvatarPreview } from '../../components/character/AvatarPreview';
import { useOwnerStore } from '../../store/ownerStore';
import {
  HAIR_TYPE_OPTIONS, HAIR_LENGTH_OPTIONS,
  HAIR_COLOR_PRESETS, EYE_COLOR_PRESETS,
  EYE_SHAPE_OPTIONS, BODY_TYPE_OPTIONS,
  ACCESSORY_OPTIONS,
} from '../../data/characterOptions';
import { UI, FONT, SPACING } from '../../constants/theme';

export default function AppearanceScreen() {
  const profile = useOwnerStore((s) => s.profile);
  const updateProfile = useOwnerStore((s) => s.updateProfile);

  const p = {
    skinTone:    profile?.skinTone    ?? 3,
    hairColor:   profile?.hairColor   ?? '#3B1F0D',
    hairType:    profile?.hairType    ?? 'straight',
    hairLength:  profile?.hairLength  ?? 'medium',
    eyeColor:    profile?.eyeColor    ?? '#5C3317',
    eyeShape:    profile?.eyeShape    ?? 'almond',
    bodyType:    profile?.bodyType    ?? 'average',
    accessories: profile?.accessories ?? [],
  };

  const toggleAccessory = (id: string) => {
    const current = p.accessories;
    const updated = current.includes(id)
      ? current.filter((a) => a !== id)
      : [...current, id];
    updateProfile({ accessories: updated });
  };

  return (
    <OnboardingShell
      step={3}
      title="Your look"
      subtitle="Build your character — tap to customise."
      onContinue={() => router.push('/onboarding/nails')}
    >
      {/* Live avatar preview */}
      <AvatarPreview
        config={{ skinToneIndex: p.skinTone, hairColor: p.hairColor, eyeColor: p.eyeColor }}
        size="lg"
        style={{ alignSelf: 'center', marginBottom: SPACING.lg }}
      />

      {/* Skin tone */}
      <Text style={styles.label}>Skin tone</Text>
      <SkinToneGrid selected={p.skinTone} onSelect={(i) => updateProfile({ skinTone: i })} />

      {/* Hair */}
      <Text style={styles.label}>Hair colour</Text>
      <ColorSwatch
        label=""
        presets={HAIR_COLOR_PRESETS}
        selected={p.hairColor}
        onSelect={(hex) => updateProfile({ hairColor: hex })}
      />

      <Text style={styles.label}>Hair type</Text>
      <OptionGrid
        options={HAIR_TYPE_OPTIONS}
        selected={p.hairType}
        onSelect={(v) => updateProfile({ hairType: v as any })}
        columns={4}
        chipMode
      />

      <Text style={styles.label}>Hair length</Text>
      <OptionGrid
        options={HAIR_LENGTH_OPTIONS}
        selected={p.hairLength}
        onSelect={(v) => updateProfile({ hairLength: v as any })}
        columns={4}
        chipMode
      />

      {/* Eyes */}
      <Text style={styles.label}>Eye colour</Text>
      <ColorSwatch
        label=""
        presets={EYE_COLOR_PRESETS}
        selected={p.eyeColor}
        onSelect={(hex) => updateProfile({ eyeColor: hex })}
      />

      <Text style={styles.label}>Eye shape</Text>
      <OptionGrid
        options={EYE_SHAPE_OPTIONS}
        selected={p.eyeShape}
        onSelect={(v) => updateProfile({ eyeShape: v as any })}
        columns={3}
        chipMode
      />

      {/* Body */}
      <Text style={styles.label}>Body type</Text>
      <OptionGrid
        options={BODY_TYPE_OPTIONS}
        selected={p.bodyType}
        onSelect={(v) => updateProfile({ bodyType: v as any })}
        columns={3}
        chipMode
      />

      {/* Accessories */}
      <Text style={styles.label}>Accessories  <Text style={styles.multi}>(pick any)</Text></Text>
      <OptionGrid
        options={ACCESSORY_OPTIONS.map((a) => ({ value: a.id, label: a.label, emoji: a.emoji }))}
        selected={p.accessories}
        onSelect={toggleAccessory}
        columns={3}
        chipMode
      />
    </OnboardingShell>
  );
}

const styles = StyleSheet.create({
  label: { fontSize: FONT.sm, fontWeight: '700', color: UI.textSecondary },
  multi: { fontSize: FONT.xs, fontWeight: '400', color: UI.textMuted },
});
