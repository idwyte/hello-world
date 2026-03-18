import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useGameStore } from '../store/gameStore';
import { UI, SPACING, FONT } from '../constants/theme';

export const HUD = () => {
  const { money, reputation, day, gameTick, isDayActive } = useGameStore();
  const DAY_LENGTH = 240;
  const timeProgress = isDayActive ? (gameTick / DAY_LENGTH) * 100 : 0;

  return (
    <View style={styles.hud}>
      <View style={styles.hudRow}>
        <Text style={styles.hudItem}>💰 ${money}</Text>
        <Text style={styles.hudItem}>⭐ {reputation}</Text>
        <Text style={styles.hudItem}>📅 Day {day}</Text>
      </View>
      {isDayActive && (
        <View style={styles.timeBg}>
          <View style={[styles.timeFill, { width: `${timeProgress}%` }]} />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  hud: {
    backgroundColor: UI.hudBg,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
  },
  hudRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  hudItem: {
    color: UI.hudText,
    fontSize: FONT.md,
    fontWeight: '600',
  },
  timeBg: {
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 2,
    marginTop: SPACING.xs,
  },
  timeFill: {
    height: 4,
    backgroundColor: UI.btnActive,
    borderRadius: 2,
  },
});
