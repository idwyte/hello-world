import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { CustomerConfig } from '../types/CustomerTypes';
import { useGameStore } from '../store/gameStore';
import { useOwnerStore } from '../store/ownerStore';
import { SERVICES } from '../data/services';
import { UI, SPACING, FONT, RADIUS, SKIN_TONES } from '../constants/theme';
import { computeModifiers } from '../engine/traitEngine';
import { soundManager } from '../hooks/useSound';

interface Props {
  customer: CustomerConfig;
}

const EXPRESSION_EMOJI: Record<string, string> = {
  neutral:      '😐',
  happy:        '😊',
  excited:      '🤩',
  impatient:    '😤',
  disappointed: '😞',
  delighted:    '😍',
  thinking:     '🤔',
};

export const CustomerCard = ({ customer }: Props) => {
  const { stations, assignCustomerToStation } = useGameStore();
  const ownerProfile = useOwnerStore((s) => s.profile);
  const patienceAlwaysVisible = computeModifiers(ownerProfile?.traits ?? []).patienceAlwaysVisible;

  const freeStation = stations.find((s) => !s.activeCustomerId);
  const service = SERVICES[customer.requestedServiceId];
  const patiencePercent = (customer.patience / customer.maxPatience) * 100;

  const scale = useSharedValue(1);
  const animStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  const handlePress = () => {
    if (!freeStation) return;
    soundManager.play('button_tap');
    scale.value = withSpring(0.95, {}, () => { scale.value = withSpring(1); });
    assignCustomerToStation(customer.id, freeStation.id);
  };

  const patienceColor =
    patiencePercent > 60 ? UI.success :
    patiencePercent > 30 ? UI.warning : UI.danger;

  return (
    <Animated.View style={animStyle}>
      <TouchableOpacity
        onPress={handlePress}
        style={[styles.card, !freeStation && styles.cardDisabled]}
        activeOpacity={0.8}
      >
        <View style={styles.left}>
          {/* Character avatar placeholder */}
          <View style={[styles.avatar, { backgroundColor: SKIN_TONES[customer.skinTone] }]}>
            <Text style={styles.expression}>{EXPRESSION_EMOJI[customer.expression]}</Text>
          </View>
        </View>

        <View style={styles.middle}>
          <View style={styles.nameRow}>
            <Text style={styles.name}>{customer.name}</Text>
            {customer.type === 'vip' && <Text style={styles.vipBadge}>VIP</Text>}
            {customer.type === 'tutorial' && <Text style={styles.tutorialBadge}>★ First</Text>}
          </View>
          <Text style={styles.service}>{service?.name ?? customer.requestedServiceId}</Text>
          {/* Patience bar */}
          <View style={styles.patienceRow}>
            <View style={[styles.patienceBg, { flex: 1 }]}>
              <View style={[styles.patienceFill, { width: `${patiencePercent}%`, backgroundColor: patienceColor }]} />
            </View>
            {patienceAlwaysVisible && (
              <Text style={[styles.patiencePct, { color: patienceColor }]}>
                {Math.round(patiencePercent)}%
              </Text>
            )}
          </View>
        </View>

        <View style={styles.right}>
          <Text style={[styles.assignText, !freeStation && styles.assignTextDisabled]}>
            {freeStation ? 'Seat →' : 'Full'}
          </Text>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: UI.panelBg,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: UI.panelBorder,
    padding: SPACING.sm,
    marginBottom: SPACING.xs,
    gap: SPACING.sm,
  },
  cardDisabled: { opacity: 0.5 },
  left: {},
  avatar: {
    width: 44,
    height: 56,
    borderRadius: RADIUS.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  expression: { fontSize: 22 },
  middle: { flex: 1 },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.xs, marginBottom: 2 },
  name:  { fontSize: FONT.md, fontWeight: '600', color: UI.textPrimary },
  vipBadge: {
    fontSize: FONT.xs,
    fontWeight: '700',
    color: UI.gold,
    backgroundColor: '#FFF8DC',
    paddingHorizontal: 4,
    borderRadius: RADIUS.sm,
  },
  tutorialBadge: {
    fontSize: FONT.xs,
    fontWeight: '700',
    color: UI.btnActive,
    backgroundColor: '#FFE4EC',
    paddingHorizontal: 4,
    borderRadius: RADIUS.sm,
  },
  service: { fontSize: FONT.xs, color: UI.textSecondary, marginBottom: SPACING.xs },
  patienceRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.xs },
  patienceBg: {
    height: 4,
    backgroundColor: '#E0D4CC',
    borderRadius: RADIUS.full,
  },
  patienceFill: { height: 4, borderRadius: RADIUS.full },
  patiencePct: { fontSize: FONT.xs, fontWeight: '600', minWidth: 28, textAlign: 'right' },
  right: {},
  assignText: { fontSize: FONT.sm, fontWeight: '700', color: UI.btnActive },
  assignTextDisabled: { color: UI.textMuted },
});
