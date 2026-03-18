import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { UI, SPACING, FONT, RADIUS } from '../../constants/theme';

interface Props {
  current: number;  // 1-based
  total: number;
  label?: string;
}

export const StepProgress = ({ current, total, label }: Props) => (
  <View style={styles.container}>
    <View style={styles.dotsRow}>
      {Array.from({ length: total }).map((_, i) => (
        <View
          key={i}
          style={[
            styles.dot,
            i < current ? styles.dotFilled : i === current - 1 ? styles.dotActive : styles.dotEmpty,
          ]}
        />
      ))}
    </View>
    <Text style={styles.label}>
      {label ?? `Step ${current} of ${total}`}
    </Text>
  </View>
);

const styles = StyleSheet.create({
  container:  { alignItems: 'center', paddingVertical: SPACING.sm },
  dotsRow:    { flexDirection: 'row', gap: 6, marginBottom: SPACING.xs },
  dot:        { width: 8, height: 8, borderRadius: 4 },
  dotFilled:  { backgroundColor: UI.btnActive },
  dotActive:  { backgroundColor: UI.btnActive, width: 16 },
  dotEmpty:   { backgroundColor: '#E0D4CC' },
  label:      { fontSize: FONT.xs, color: UI.textMuted },
});
