import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { SkinToneId } from '../../types/CustomerTypes';
import { SKIN_TONES } from '../../constants/theme';
import { UI, SPACING, RADIUS } from '../../constants/theme';

interface Props {
  selected: number;           // index 0–11 (OwnerProfile.skinTone)
  onSelect: (index: number) => void;
}

const TONE_IDS = Object.keys(SKIN_TONES) as SkinToneId[];

export const SkinToneGrid = ({ selected, onSelect }: Props) => (
  <View style={styles.grid}>
    {TONE_IDS.map((id, i) => (
      <TouchableOpacity
        key={id}
        style={[
          styles.swatch,
          { backgroundColor: SKIN_TONES[id] },
          selected === i && styles.swatchSelected,
        ]}
        onPress={() => onSelect(i)}
        activeOpacity={0.8}
      />
    ))}
  </View>
);

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.xs,
  },
  swatch: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  swatchSelected: {
    borderColor: UI.btnActive,
    borderWidth: 3,
    transform: [{ scale: 1.15 }],
  },
});
