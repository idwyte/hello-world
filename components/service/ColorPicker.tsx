import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { CollectionId, NailColorSelection } from '../../types/NailTypes';
import {
  COLLECTION_ORDER,
  COLLECTION_NAMES,
  getColorsByCollection,
} from '../../data/nailColors';
import { UI, FONT, SPACING, RADIUS } from '../../constants/theme';

interface Props {
  selectedColor: NailColorSelection | null;
  onSelect: (sel: NailColorSelection) => void;
}

export const ColorPicker = ({ selectedColor, onSelect }: Props) => {
  const [activeCollection, setActiveCollection] = useState<CollectionId>(
    selectedColor?.collectionId ?? COLLECTION_ORDER[0]
  );
  const colors = getColorsByCollection(activeCollection);

  return (
    <View style={styles.wrapper}>
      <Text style={styles.heading}>Choose a Color</Text>

      {/* Collection tabs */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.tabRow}
      >
        {COLLECTION_ORDER.map((colId) => {
          const active = activeCollection === colId;
          return (
            <TouchableOpacity
              key={colId}
              style={[styles.tab, active && styles.tabActive]}
              onPress={() => setActiveCollection(colId)}
              activeOpacity={0.75}
            >
              <Text style={[styles.tabLabel, active && styles.tabLabelActive]}>
                {COLLECTION_NAMES[colId].split(' ')[0]}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Color swatches grid */}
      <View style={styles.grid}>
        {colors.map((color, index) => {
          const isSelected =
            selectedColor?.collectionId === activeCollection &&
            selectedColor.colorIndex === index;
          return (
            <TouchableOpacity
              key={color.id}
              style={[
                styles.swatch,
                { backgroundColor: color.hex },
                isSelected && styles.swatchSelected,
              ]}
              onPress={() => onSelect({ collectionId: activeCollection, colorIndex: index })}
              activeOpacity={0.8}
            >
              {isSelected && <Text style={styles.checkmark}>✓</Text>}
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Selected color name */}
      {selectedColor?.collectionId === activeCollection && (
        <Text style={styles.colorName}>
          {colors[selectedColor.colorIndex]?.name ?? ''}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper:   { paddingVertical: SPACING.md },
  heading: {
    fontSize: FONT.sm,
    fontWeight: '700',
    color: UI.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 1,
    paddingHorizontal: SPACING.md,
    marginBottom: SPACING.sm,
  },
  tabRow: { paddingHorizontal: SPACING.md, gap: SPACING.xs, marginBottom: SPACING.md },
  tab: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: RADIUS.full,
    backgroundColor: UI.panelBg,
    borderWidth: 1,
    borderColor: UI.panelBorder,
  },
  tabActive:      { backgroundColor: UI.btnActive, borderColor: UI.btnActive },
  tabLabel:       { fontSize: FONT.xs, color: UI.textSecondary, fontWeight: '600' },
  tabLabelActive: { color: UI.btnText },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: SPACING.md,
    gap: SPACING.sm,
  },
  swatch: {
    width: 44,
    height: 44,
    borderRadius: RADIUS.sm,
    borderWidth: 2,
    borderColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
  },
  swatchSelected: { borderColor: UI.textPrimary, borderWidth: 3 },
  checkmark:      { color: '#fff', fontSize: FONT.md, fontWeight: '800', textShadowColor: '#000', textShadowRadius: 4 },
  colorName: {
    fontSize: FONT.sm,
    color: UI.textSecondary,
    paddingHorizontal: SPACING.md,
    marginTop: SPACING.sm,
    fontStyle: 'italic',
  },
});
