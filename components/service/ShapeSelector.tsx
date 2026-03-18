import React from 'react';
import { ScrollView, TouchableOpacity, Text, View, StyleSheet } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { NailShape } from '../../types/NailTypes';
import { UI, FONT, SPACING, RADIUS } from '../../constants/theme';

const SHAPES: { id: NailShape; label: string; path: string }[] = [
  { id: 'square',    label: 'Square',    path: 'M3,28 L3,6 Q3,4 5,4 L15,4 Q17,4 17,6 L17,28 Z' },
  { id: 'round',     label: 'Round',     path: 'M3,28 L3,14 Q3,4 10,4 Q17,4 17,14 L17,28 Z' },
  { id: 'oval',      label: 'Oval',      path: 'M4,28 L4,16 Q4,3 10,3 Q16,3 16,16 L16,28 Z' },
  { id: 'almond',    label: 'Almond',    path: 'M5,28 L5,16 Q5,4 10,2 Q15,4 15,16 L15,28 Z' },
  { id: 'coffin',    label: 'Coffin',    path: 'M3,28 L5,10 L8,6 L12,6 L15,10 L17,28 Z' },
  { id: 'stiletto',  label: 'Stiletto',  path: 'M5,28 L6,12 L10,2 L14,12 L15,28 Z' },
  { id: 'ballerina', label: 'Ballerina', path: 'M3,28 L5,8 L8,5 L12,5 L15,8 L17,28 Z' },
  { id: 'flare',     label: 'Flare',     path: 'M6,28 L1,5 L19,5 L14,28 Z' },
];

interface Props {
  selectedShape: NailShape | null;
  onSelect: (shape: NailShape) => void;
}

export const ShapeSelector = ({ selectedShape, onSelect }: Props) => (
  <View style={styles.wrapper}>
    <Text style={styles.heading}>Choose a Shape</Text>
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.row}
    >
      {SHAPES.map(({ id, label, path }) => {
        const selected = selectedShape === id;
        return (
          <TouchableOpacity
            key={id}
            style={[styles.tile, selected && styles.tileSelected]}
            onPress={() => onSelect(id)}
            activeOpacity={0.75}
          >
            <Svg width={40} height={56} viewBox="0 0 20 32">
              <Path
                d={path}
                fill={selected ? UI.btnActive : '#E0C8C8'}
                stroke={selected ? UI.btnHover : UI.panelBorder}
                strokeWidth={0.8}
              />
            </Svg>
            <Text style={[styles.label, selected && styles.labelSelected]}>{label}</Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  </View>
);

const styles = StyleSheet.create({
  wrapper: { paddingVertical: SPACING.md },
  heading: {
    fontSize: FONT.sm,
    fontWeight: '700',
    color: UI.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 1,
    paddingHorizontal: SPACING.md,
    marginBottom: SPACING.sm,
  },
  row: { paddingHorizontal: SPACING.md, gap: SPACING.sm },
  tile: {
    alignItems: 'center',
    backgroundColor: UI.panelBg,
    borderRadius: RADIUS.md,
    borderWidth: 1.5,
    borderColor: UI.panelBorder,
    padding: SPACING.sm,
    width: 72,
  },
  tileSelected: { borderColor: UI.btnActive, backgroundColor: '#FFF0F5' },
  label:         { fontSize: FONT.xs, color: UI.textSecondary, marginTop: SPACING.xs, textAlign: 'center' },
  labelSelected: { color: UI.btnActive, fontWeight: '700' },
});
