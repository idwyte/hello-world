import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { UI, SPACING, FONT, RADIUS } from '../../constants/theme';

export interface GridOption {
  value: string;
  label: string;
  emoji?: string;
  description?: string;
}

interface Props {
  options: GridOption[];
  selected: string | string[];      // string = single, string[] = multi
  onSelect: (value: string) => void;
  columns?: 2 | 3 | 4;
  chipMode?: boolean;               // compact horizontal chip row instead of grid
}

export const OptionGrid = ({ options, selected, onSelect, columns = 2, chipMode = false }: Props) => {
  const isSelected = (val: string) =>
    Array.isArray(selected) ? selected.includes(val) : selected === val;

  if (chipMode) {
    return (
      <View style={styles.chipRow}>
        {options.map((opt) => (
          <TouchableOpacity
            key={opt.value}
            style={[styles.chip, isSelected(opt.value) && styles.chipSelected]}
            onPress={() => onSelect(opt.value)}
            activeOpacity={0.7}
          >
            {opt.emoji ? <Text style={styles.chipEmoji}>{opt.emoji} </Text> : null}
            <Text style={[styles.chipLabel, isSelected(opt.value) && styles.chipLabelSelected]}>
              {opt.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    );
  }

  const colFlex = 1 / columns;

  return (
    <View style={styles.grid}>
      {options.map((opt) => (
        <TouchableOpacity
          key={opt.value}
          style={[
            styles.card,
            { width: `${colFlex * 100 - 2}%` },
            isSelected(opt.value) && styles.cardSelected,
          ]}
          onPress={() => onSelect(opt.value)}
          activeOpacity={0.7}
        >
          {opt.emoji ? <Text style={styles.cardEmoji}>{opt.emoji}</Text> : null}
          <Text style={[styles.cardLabel, isSelected(opt.value) && styles.cardLabelSelected]}>
            {opt.label}
          </Text>
          {opt.description ? (
            <Text style={styles.cardDesc}>{opt.description}</Text>
          ) : null}
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.xs,
  },
  card: {
    backgroundColor: UI.panelBg,
    borderRadius: RADIUS.md,
    borderWidth: 1.5,
    borderColor: UI.panelBorder,
    padding: SPACING.sm,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 60,
  },
  cardSelected: {
    borderColor: UI.btnActive,
    backgroundColor: '#FFE4EC',
  },
  cardEmoji:        { fontSize: 20, marginBottom: 4 },
  cardLabel:        { fontSize: FONT.sm, color: UI.textPrimary, textAlign: 'center', fontWeight: '500' },
  cardLabelSelected:{ color: UI.btnActive, fontWeight: '700' },
  cardDesc:         { fontSize: FONT.xs, color: UI.textMuted, textAlign: 'center', marginTop: 2 },

  // Chip mode
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.xs,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    backgroundColor: UI.panelBg,
    borderRadius: RADIUS.full,
    borderWidth: 1.5,
    borderColor: UI.panelBorder,
  },
  chipSelected: {
    borderColor: UI.btnActive,
    backgroundColor: '#FFE4EC',
  },
  chipEmoji:         { fontSize: FONT.sm },
  chipLabel:         { fontSize: FONT.sm, color: UI.textPrimary, fontWeight: '500' },
  chipLabelSelected: { color: UI.btnActive, fontWeight: '700' },
});
