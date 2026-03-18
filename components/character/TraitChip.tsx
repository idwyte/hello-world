import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { TraitOption } from '../../data/characterOptions';
import { UI, SPACING, FONT, RADIUS } from '../../constants/theme';

interface Props {
  trait: TraitOption;
  selected: boolean;
  disabled: boolean;   // max selections reached and this one isn't selected
  onPress: () => void;
}

export const TraitChip = ({ trait, selected, disabled, onPress }: Props) => (
  <TouchableOpacity
    style={[
      styles.row,
      selected && styles.rowSelected,
      disabled && styles.rowDisabled,
    ]}
    onPress={onPress}
    activeOpacity={disabled ? 1 : 0.75}
  >
    <View style={[styles.checkbox, selected && styles.checkboxSelected]}>
      {selected && <Text style={styles.checkmark}>✓</Text>}
    </View>
    <View style={styles.content}>
      <Text style={[styles.name, selected && styles.nameSelected]}>{trait.label}</Text>
      <Text style={styles.effect}>{trait.effect}</Text>
    </View>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: UI.panelBg,
    borderRadius: RADIUS.md,
    borderWidth: 1.5,
    borderColor: UI.panelBorder,
    padding: SPACING.sm,
    marginBottom: SPACING.xs,
    gap: SPACING.sm,
  },
  rowSelected: {
    borderColor: UI.btnActive,
    backgroundColor: '#FFE4EC',
  },
  rowDisabled: {
    opacity: 0.45,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: UI.panelBorder,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  checkboxSelected: {
    backgroundColor: UI.btnActive,
    borderColor: UI.btnActive,
  },
  checkmark:    { color: '#fff', fontSize: 13, fontWeight: '700' },
  content:      { flex: 1 },
  name:         { fontSize: FONT.md, fontWeight: '600', color: UI.textPrimary },
  nameSelected: { color: UI.btnHover },
  effect:       { fontSize: FONT.xs, color: UI.textSecondary, marginTop: 2 },
});
