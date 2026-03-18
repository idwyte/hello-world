import React from 'react';
import { Text, View, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { OnboardingShell } from '../../components/character/OnboardingShell';
import { OptionGrid } from '../../components/character/OptionGrid';
import { useOwnerStore } from '../../store/ownerStore';
import {
  SKINCARE_ROUTINE_OPTIONS, SKIN_TYPE_OPTIONS, SKIN_CONCERN_OPTIONS,
  SKINCARE_PHILOSOPHY_OPTIONS, SIGNATURE_PRODUCT_OPTIONS,
} from '../../data/characterOptions';
import {
  SkincareRoutine, SkinType, SkinConcern, SkincarePhilosophy, SignatureProduct,
} from '../../types/OwnerTypes';
import { UI, FONT, SPACING, RADIUS } from '../../constants/theme';

export default function SkincareScreen() {
  const profile = useOwnerStore((s) => s.profile);
  const updateProfile = useOwnerStore((s) => s.updateProfile);

  const routine   = (profile?.skincareRoutine    ?? 'minimal')          as SkincareRoutine;
  const skinType  = (profile?.skinType           ?? 'normal')           as SkinType;
  const concern   = (profile?.skinConcern        ?? 'hydration')        as SkinConcern;
  const philosophy= (profile?.skincarePhilosophy ?? 'science_backed')   as SkincarePhilosophy;
  const product   = (profile?.signatureProduct   ?? 'hyaluronic_acid')  as SignatureProduct;

  // Show effect callout for chosen routine
  const routineEffect = SKINCARE_ROUTINE_OPTIONS.find((o) => o.value === routine)?.effect ?? '';

  return (
    <OnboardingShell
      step={5}
      title="Your skincare world"
      subtitle="A true nail artist takes care of the full look — skin included."
      onContinue={() => router.push('/onboarding/fashion')}
    >
      <Text style={styles.label}>
        Skincare routine  <Text style={styles.effectTag}>unlocks add-ons</Text>
      </Text>
      <OptionGrid
        options={SKINCARE_ROUTINE_OPTIONS}
        selected={routine}
        onSelect={(v) => updateProfile({ skincareRoutine: v as SkincareRoutine })}
        columns={2}
      />
      {routineEffect ? (
        <View style={styles.effectBadge}>
          <Text style={styles.effectText}>✦ {routineEffect}</Text>
        </View>
      ) : null}

      <Text style={styles.label}>Skin type</Text>
      <OptionGrid
        options={SKIN_TYPE_OPTIONS}
        selected={skinType}
        onSelect={(v) => updateProfile({ skinType: v as SkinType })}
        columns={3}
        chipMode
      />

      <Text style={styles.label}>Main concern</Text>
      <OptionGrid
        options={SKIN_CONCERN_OPTIONS}
        selected={concern}
        onSelect={(v) => updateProfile({ skinConcern: v as SkinConcern })}
        columns={3}
        chipMode
      />

      <Text style={styles.label}>Philosophy</Text>
      <OptionGrid
        options={SKINCARE_PHILOSOPHY_OPTIONS}
        selected={philosophy}
        onSelect={(v) => updateProfile({ skincarePhilosophy: v as SkincarePhilosophy })}
        columns={2}
        chipMode
      />

      <Text style={styles.label}>Signature product</Text>
      <OptionGrid
        options={SIGNATURE_PRODUCT_OPTIONS}
        selected={product}
        onSelect={(v) => updateProfile({ signatureProduct: v as SignatureProduct })}
        columns={3}
        chipMode
      />
    </OnboardingShell>
  );
}

const styles = StyleSheet.create({
  label:      { fontSize: FONT.sm, fontWeight: '700', color: UI.textSecondary },
  effectTag:  { fontSize: FONT.xs, fontWeight: '400', color: UI.btnActive },
  effectBadge: {
    backgroundColor: '#FFE4EC',
    borderRadius: RADIUS.md,
    padding: SPACING.sm,
  },
  effectText: { fontSize: FONT.sm, color: UI.btnHover, fontWeight: '600' },
});
