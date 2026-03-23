import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useGameStore } from '../store/gameStore';
import { UI, SPACING, FONT, RADIUS } from '../constants/theme';

export const HUD = () => {
  const { money, reputation, day, gameTick, isDayActive, startDay } = useGameStore();
  const DAY_LENGTH = 240;
  const timeProgress = isDayActive ? Math.min((gameTick / DAY_LENGTH) * 100, 100) : 0;

  return (
    <View style={styles.hud}>
      <Text style={styles.item}>💰 ${money}</Text>
      <Text style={styles.item}>⭐ {reputation}</Text>
      <Text style={styles.item}>📅 Day {day}</Text>

      {/* Progress bar — flex:1 fills gap */}
      <View style={styles.progressBg}>
        <View style={[styles.progressFill, { width: `${timeProgress}%` as any }]} />
      </View>

      {/* Open shop button — only when day not active */}
      {!isDayActive && (
        <TouchableOpacity style={styles.openBtn} onPress={startDay}>
          <Text style={styles.openBtnText}>Open 💅</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  hud: {
    height: 44,
    backgroundColor: UI.hudBg,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    gap: SPACING.md,
    // Subtle purple gradient feel via border
    borderBottomWidth: 1,
    borderBottomColor: '#2D1B69',
  },
  item: {
    color: UI.hudText,
    fontSize: FONT.sm,
    fontWeight: '600',
  },
  progressBg: {
    flex: 1,
    height: 6,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: RADIUS.full,
    overflow: 'hidden',
  },
  progressFill: {
    height: 6,
    backgroundColor: UI.btnActive,
    borderRadius: RADIUS.full,
  },
  openBtn: {
    backgroundColor: UI.btnActive,
    borderRadius: RADIUS.full,
    paddingHorizontal: SPACING.md,
    paddingVertical: 5,
    shadowColor: UI.btnActive,
    shadowOpacity: 0.5,
    shadowRadius: 6,
    elevation: 3,
  },
  openBtnText: {
    color: '#FFFFFF',
    fontSize: FONT.sm,
    fontWeight: '700',
    letterSpacing: 0.4,
  },
});
