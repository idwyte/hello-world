import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { CustomerConfig } from '../../types/CustomerTypes';
import { NailShape, NailColorSelection } from '../../types/NailTypes';
import { getColorsByCollection } from '../../data/nailColors';
import { satisfactionToReview } from '../../engine/serviceEngine';
import { UI, FONT, SPACING, RADIUS } from '../../constants/theme';

const STAR_COLORS = ['', UI.danger, UI.warning, UI.warning, UI.success, UI.gold];

interface Props {
  customer: CustomerConfig;
  satisfactionScore: number;
  earnings: number;
  tip: number;
  selectedShape: NailShape | null;
  selectedColor: NailColorSelection | null;
  nailArtDesignId: string | null;
  onDone: () => void;
}

export const ServiceSummary = ({
  customer,
  satisfactionScore,
  earnings,
  tip,
  selectedShape,
  selectedColor,
  nailArtDesignId,
  onDone,
}: Props) => {
  const { text, stars } = satisfactionToReview(satisfactionScore, customer.name);

  const colorName = selectedColor
    ? getColorsByCollection(selectedColor.collectionId)[selectedColor.colorIndex]?.name
    : null;

  const shapeMatch  = selectedShape === customer.preferredNailShape;
  const colorMatch  = selectedColor
    ? getColorsByCollection(selectedColor.collectionId)[selectedColor.colorIndex]?.family === customer.preferredColorFamily
    : false;

  return (
    <View style={styles.container}>
      {/* Score header */}
      <View style={styles.scoreBlock}>
        <Text style={[styles.stars, { color: STAR_COLORS[stars] ?? UI.gold }]}>
          {'★'.repeat(stars)}{'☆'.repeat(5 - stars)}
        </Text>
        <Text style={styles.score}>{satisfactionScore}%</Text>
        <Text style={styles.reviewText}>{text}</Text>
      </View>

      {/* Breakdown */}
      <View style={styles.breakdownBlock}>
        <Text style={styles.breakdownTitle}>How'd you do?</Text>

        <View style={styles.breakdownRow}>
          <Text style={styles.breakdownLabel}>Shape</Text>
          <Text style={[styles.breakdownValue, shapeMatch && styles.match]}>
            {selectedShape ?? '—'} {shapeMatch ? '✓ Match!' : ''}
          </Text>
        </View>

        <View style={styles.breakdownRow}>
          <Text style={styles.breakdownLabel}>Color</Text>
          <Text style={[styles.breakdownValue, colorMatch && styles.match]}>
            {colorName ?? '—'} {colorMatch ? '✓ Match!' : ''}
          </Text>
        </View>

        {nailArtDesignId && (
          <View style={styles.breakdownRow}>
            <Text style={styles.breakdownLabel}>Nail Art</Text>
            <Text style={styles.breakdownValue}>+bonus 💅</Text>
          </View>
        )}
      </View>

      {/* Earnings */}
      <View style={styles.earningsBlock}>
        <View style={styles.earningsRow}>
          <Text style={styles.earningsLabel}>Service</Text>
          <Text style={styles.earningsValue}>${earnings.toFixed(0)}</Text>
        </View>
        <View style={styles.earningsRow}>
          <Text style={styles.earningsLabel}>Tip</Text>
          <Text style={[styles.earningsValue, styles.tip]}>+${tip.toFixed(0)}</Text>
        </View>
        <View style={[styles.earningsRow, styles.totalRow]}>
          <Text style={styles.totalLabel}>Total</Text>
          <Text style={styles.totalValue}>${(earnings + tip).toFixed(0)}</Text>
        </View>
      </View>

      <TouchableOpacity style={styles.doneBtn} onPress={onDone} activeOpacity={0.8}>
        <Text style={styles.doneBtnText}>Back to Shop 💅</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: SPACING.md },
  scoreBlock: {
    alignItems: 'center',
    backgroundColor: UI.panelBg,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: UI.panelBorder,
  },
  stars:       { fontSize: 28, letterSpacing: 2 },
  score:       { fontSize: FONT.heading, fontWeight: '800', color: UI.textPrimary, marginTop: SPACING.xs },
  reviewText:  { fontSize: FONT.md, color: UI.textSecondary, textAlign: 'center', marginTop: SPACING.xs },
  breakdownBlock: {
    backgroundColor: UI.panelBg,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: UI.panelBorder,
  },
  breakdownTitle: {
    fontSize: FONT.sm,
    fontWeight: '700',
    color: UI.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: SPACING.sm,
  },
  breakdownRow:   { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 3 },
  breakdownLabel: { fontSize: FONT.sm, color: UI.textMuted },
  breakdownValue: { fontSize: FONT.sm, color: UI.textPrimary, textTransform: 'capitalize' },
  match:          { color: UI.success, fontWeight: '700' },
  earningsBlock: {
    backgroundColor: UI.panelBg,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.lg,
    borderWidth: 1,
    borderColor: UI.panelBorder,
  },
  earningsRow:   { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 3 },
  earningsLabel: { fontSize: FONT.sm, color: UI.textMuted },
  earningsValue: { fontSize: FONT.sm, color: UI.textPrimary },
  tip:           { color: UI.success },
  totalRow:      { borderTopWidth: 1, borderTopColor: UI.panelBorder, marginTop: SPACING.xs, paddingTop: SPACING.xs },
  totalLabel:    { fontSize: FONT.md, fontWeight: '700', color: UI.textPrimary },
  totalValue:    { fontSize: FONT.md, fontWeight: '800', color: UI.gold },
  doneBtn: {
    backgroundColor: UI.btnActive,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    alignItems: 'center',
  },
  doneBtnText: { color: UI.btnText, fontSize: FONT.lg, fontWeight: '700' },
});
