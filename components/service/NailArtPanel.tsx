import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, ScrollView, StyleSheet,
} from 'react-native';
import { NAIL_ART_DESIGNS, NailArtToolType } from '../../data/nailArtDesigns';
import { UI, FONT, SPACING, RADIUS } from '../../constants/theme';

const TOOLS: { id: NailArtToolType; label: string; emoji: string }[] = [
  { id: 'stamp',    label: 'Stamp',    emoji: '🔵' },
  { id: 'gem',      label: 'Gems',     emoji: '💎' },
  { id: 'freehand', label: 'Freehand', emoji: '✏️' },
];

interface Props {
  selectedDesignId: string | null;
  onSelect: (id: string) => void;
  onSkip: () => void;
  purchasedUpgradeIds: string[];
}

export const NailArtPanel = ({ selectedDesignId, onSelect, onSkip, purchasedUpgradeIds }: Props) => {
  const [activeTool, setActiveTool] = useState<NailArtToolType>('stamp');

  const filtered = NAIL_ART_DESIGNS.filter((d) => d.tool === activeTool);

  return (
    <View style={styles.wrapper}>
      <Text style={styles.heading}>Add Nail Art</Text>

      {/* Tool tabs */}
      <View style={styles.toolRow}>
        {TOOLS.map(({ id, label, emoji }) => (
          <TouchableOpacity
            key={id}
            style={[styles.toolTab, activeTool === id && styles.toolTabActive]}
            onPress={() => setActiveTool(id)}
            activeOpacity={0.75}
          >
            <Text style={styles.toolEmoji}>{emoji}</Text>
            <Text style={[styles.toolLabel, activeTool === id && styles.toolLabelActive]}>
              {label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Design tiles */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.designRow}
      >
        {filtered.map((design) => {
          const locked = design.requiresUpgrade && !purchasedUpgradeIds.includes(design.upgradeId ?? '');
          const selected = selectedDesignId === design.id;
          return (
            <TouchableOpacity
              key={design.id}
              style={[
                styles.designTile,
                selected && styles.designTileSelected,
                locked && styles.designTileLocked,
              ]}
              onPress={() => !locked && onSelect(design.id)}
              activeOpacity={locked ? 1 : 0.75}
            >
              <Text style={styles.designName}>{design.name}</Text>
              <Text style={styles.designBonus}>+${design.priceBonus}</Text>
              {locked && <Text style={styles.lockBadge}>🔒</Text>}
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Skip button */}
      <TouchableOpacity style={styles.skipBtn} onPress={onSkip} activeOpacity={0.75}>
        <Text style={styles.skipBtnText}>Skip — No Art</Text>
      </TouchableOpacity>
    </View>
  );
};

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
  toolRow: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.md,
    gap: SPACING.sm,
    marginBottom: SPACING.md,
  },
  toolTab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.md,
    backgroundColor: UI.panelBg,
    borderWidth: 1.5,
    borderColor: UI.panelBorder,
  },
  toolTabActive:  { borderColor: UI.btnActive, backgroundColor: '#FFF0F5' },
  toolEmoji:      { fontSize: 18 },
  toolLabel:      { fontSize: FONT.xs, color: UI.textSecondary, marginTop: 2 },
  toolLabelActive:{ color: UI.btnActive, fontWeight: '700' },
  designRow: { paddingHorizontal: SPACING.md, gap: SPACING.sm, paddingBottom: SPACING.sm },
  designTile: {
    width: 90,
    padding: SPACING.sm,
    backgroundColor: UI.panelBg,
    borderRadius: RADIUS.md,
    borderWidth: 1.5,
    borderColor: UI.panelBorder,
    alignItems: 'center',
  },
  designTileSelected: { borderColor: UI.btnActive, backgroundColor: '#FFF0F5' },
  designTileLocked:   { opacity: 0.45 },
  designName:         { fontSize: FONT.xs, fontWeight: '600', color: UI.textPrimary, textAlign: 'center' },
  designBonus:        { fontSize: FONT.xs, color: UI.success, marginTop: 2 },
  lockBadge:          { fontSize: 14, marginTop: SPACING.xs },
  skipBtn: {
    marginHorizontal: SPACING.md,
    marginTop: SPACING.sm,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: UI.panelBorder,
    alignItems: 'center',
  },
  skipBtnText: { fontSize: FONT.sm, color: UI.textMuted },
});
