import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useGameStore } from '../store/gameStore';
import { TUTORIAL_TOOLTIPS, TutorialStep, nextStep } from '../engine/tutorialEngine';
import { UI, SPACING, FONT, RADIUS } from '../constants/theme';

export const TutorialTooltip = () => {
  const { completeTutorial } = useGameStore();
  const [step, setStep] = useState<TutorialStep>('welcome');

  if (step === 'done') return null;

  const text = TUTORIAL_TOOLTIPS[step];

  const handleNext = () => {
    const next = nextStep(step);
    if (next === 'done') {
      completeTutorial();
    }
    setStep(next);
  };

  return (
    <View style={styles.tooltip}>
      <Text style={styles.text}>{text}</Text>
      <TouchableOpacity style={styles.btn} onPress={handleNext}>
        <Text style={styles.btnText}>{step === 'collect_tip' ? 'Got it! ✓' : 'Next →'}</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  tooltip: {
    backgroundColor: UI.hudBg,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  text: {
    flex: 1,
    color: UI.hudText,
    fontSize: FONT.sm,
  },
  btn: {
    backgroundColor: UI.btnActive,
    borderRadius: RADIUS.sm,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
  },
  btnText: {
    color: UI.btnText,
    fontSize: FONT.xs,
    fontWeight: '700',
  },
});
