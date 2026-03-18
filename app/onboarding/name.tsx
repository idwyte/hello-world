import React, { useState } from 'react';
import {
  TextInput, KeyboardAvoidingView, Platform, StyleSheet, Text,
} from 'react-native';
import { router } from 'expo-router';
import { OnboardingShell } from '../../components/character/OnboardingShell';
import { useOwnerStore } from '../../store/ownerStore';
import { UI, FONT, SPACING, RADIUS } from '../../constants/theme';

export default function NameScreen() {
  const updateProfile = useOwnerStore((s) => s.updateProfile);
  const [name, setName] = useState('');

  const handleContinue = () => {
    updateProfile({ name: name.trim() });
    router.push('/onboarding/pronouns');
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <OnboardingShell
        step={1}
        title="What's your name?"
        subtitle="Your clients will see this above the door. Make it yours."
        onContinue={handleContinue}
        canContinue={name.trim().length > 0}
      >
        <TextInput
          style={styles.input}
          placeholder="e.g. Jade, Camille, Ren…"
          placeholderTextColor={UI.textMuted}
          value={name}
          onChangeText={setName}
          autoFocus
          maxLength={30}
          returnKeyType="done"
          onSubmitEditing={name.trim().length > 0 ? handleContinue : undefined}
        />
        <Text style={styles.hint}>{name.trim().length}/30</Text>
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
    marginTop: SPACING.sm,
  },
  hint: {
    fontSize: FONT.xs,
    color: UI.textMuted,
    textAlign: 'right',
    marginTop: SPACING.xs,
  },
});
