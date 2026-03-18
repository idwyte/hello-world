import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Review } from '../types/GameStateTypes';
import { UI, SPACING, FONT, RADIUS } from '../constants/theme';

interface Props {
  reviews: Review[];
}

const STAR_COLORS: Record<number, string> = {
  5: UI.success,
  4: UI.success,
  3: UI.warning,
  2: UI.warning,
  1: UI.danger,
};

export const ReviewBoard = ({ reviews }: Props) => (
  <View style={styles.board}>
    <Text style={styles.boardTitle}>📋 Recent Reviews</Text>
    {reviews.map((review) => (
      <View key={review.id} style={styles.bubble}>
        <View style={styles.bubbleRow}>
          <Text style={styles.bubbleName}>{review.customerName}</Text>
          <Text style={[styles.stars, { color: STAR_COLORS[review.stars] ?? UI.textMuted }]}>
            {'⭐'.repeat(review.stars)}
          </Text>
        </View>
        <Text style={styles.bubbleText}>{review.text}</Text>
      </View>
    ))}
  </View>
);

const styles = StyleSheet.create({
  board: {
    backgroundColor: UI.panelBg,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: UI.panelBorder,
    padding: SPACING.sm,
    marginBottom: SPACING.md,
  },
  boardTitle: {
    fontSize: FONT.xs,
    fontWeight: '700',
    color: UI.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: SPACING.xs,
  },
  bubble: {
    backgroundColor: '#FFF8FB',
    borderRadius: RADIUS.sm,
    padding: SPACING.xs,
    marginBottom: SPACING.xs,
    borderLeftWidth: 3,
    borderLeftColor: UI.btnActive,
  },
  bubbleRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 2 },
  bubbleName: { fontSize: FONT.xs, fontWeight: '700', color: UI.textPrimary },
  stars:      { fontSize: FONT.xs },
  bubbleText: { fontSize: FONT.xs, color: UI.textSecondary },
});
