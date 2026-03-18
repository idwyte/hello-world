import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { UI, SPACING, FONT, RADIUS } from '../../constants/theme';

interface Preset { label: string; hex: string }

interface Props {
  label: string;
  presets: Preset[];
  selected: string;           // hex string
  onSelect: (hex: string) => void;
}

export const ColorSwatch = ({ label, presets, selected, onSelect }: Props) => (
  <View style={styles.container}>
    <Text style={styles.label}>{label}</Text>
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
      {presets.map((p) => (
        <TouchableOpacity
          key={p.hex}
          style={[
            styles.swatch,
            { backgroundColor: p.hex },
            selected === p.hex && styles.swatchSelected,
          ]}
          onPress={() => onSelect(p.hex)}
          activeOpacity={0.8}
        />
      ))}
    </ScrollView>
    {/* Selected color preview */}
    <View style={styles.previewRow}>
      <View style={[styles.previewDot, { backgroundColor: selected }]} />
      <Text style={styles.previewHex}>{selected}</Text>
    </View>
  </View>
);

const styles = StyleSheet.create({
  container:    { marginBottom: SPACING.md },
  label:        { fontSize: FONT.sm, fontWeight: '600', color: UI.textSecondary, marginBottom: SPACING.xs },
  row:          { flexDirection: 'row', gap: SPACING.xs, paddingVertical: SPACING.xs },
  swatch: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  swatchSelected: {
    borderColor: UI.btnActive,
    borderWidth: 3,
    transform: [{ scale: 1.15 }],
  },
  previewRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    marginTop: SPACING.xs,
  },
  previewDot: { width: 16, height: 16, borderRadius: 8 },
  previewHex: { fontSize: FONT.xs, color: UI.textMuted },
});
