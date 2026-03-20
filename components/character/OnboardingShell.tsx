import React from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StepProgress } from './StepProgress';
import { UI, FONT, SPACING, RADIUS } from '../../constants/theme';
import { soundManager } from '../../hooks/useSound';

interface Props {
  step: number;
  totalSteps?: number;
  title: string;
  subtitle?: string;
  onContinue: () => void;
  canContinue?: boolean;
  continueLabel?: string;
  children: React.ReactNode;
}

export const OnboardingShell = ({
  step,
  totalSteps = 10,
  title,
  subtitle,
  onContinue,
  canContinue = true,
  continueLabel = 'Continue',
  children,
}: Props) => (
  <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
    <View style={styles.header}>
      <StepProgress current={step} total={totalSteps} />
    </View>

    <ScrollView
      style={styles.scroll}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      <Text style={styles.title}>{title}</Text>
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      <View style={styles.body}>{children}</View>
    </ScrollView>

    <View style={styles.footer}>
      <TouchableOpacity
        style={[styles.btn, !canContinue && styles.btnDisabled]}
        onPress={() => { soundManager.play('button_tap'); onContinue(); }}
        disabled={!canContinue}
        activeOpacity={0.8}
      >
        <Text style={styles.btnText}>{continueLabel}</Text>
      </TouchableOpacity>
    </View>
  </SafeAreaView>
);

const styles = StyleSheet.create({
  safe:     { flex: 1, backgroundColor: '#FFF5F8' },
  header:   { paddingTop: Platform.OS === 'android' ? 12 : 0 },
  scroll:   { flex: 1 },
  content:  { padding: SPACING.xl, paddingTop: SPACING.md, paddingBottom: SPACING.xxl },
  title: {
    fontSize: FONT.heading,
    fontWeight: '700',
    color: UI.textPrimary,
    marginBottom: SPACING.xs,
  },
  subtitle: {
    fontSize: FONT.md,
    color: UI.textSecondary,
    marginBottom: SPACING.xl,
    lineHeight: 20,
  },
  body: { gap: SPACING.md },
  footer: {
    padding: SPACING.xl,
    paddingBottom: Platform.OS === 'ios' ? SPACING.xxl : SPACING.xl,
    backgroundColor: '#FFF5F8',
    borderTopWidth: 1,
    borderTopColor: UI.panelBorder,
  },
  btn: {
    backgroundColor: UI.btnActive,
    borderRadius: RADIUS.full,
    paddingVertical: SPACING.md,
    alignItems: 'center',
  },
  btnDisabled: { backgroundColor: UI.btnDisabled },
  btnText: { color: '#fff', fontSize: FONT.lg, fontWeight: '700' },
});
