import React, { useCallback, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withRepeat,
  withSequence,
  withDelay,
  cancelAnimation,
  runOnJS,
} from 'react-native-reanimated';
import { CustomerConfig } from '../types/CustomerTypes';
import { CharacterAvatar } from '../assets/characters/CharacterAvatar';
import { useGameStore } from '../store/gameStore';
import { NPC_W, NPC_H, buildLayoutFromDimensions } from '../constants/sceneLayout';
import { UI, FONT, RADIUS, SPACING } from '../constants/theme';

interface Props {
  customer: CustomerConfig;
  targetX: number;
  targetY: number;
  onTap?: () => void;
}

const SPRING_WALK = { damping: 18, stiffness: 120 };
const SPRING_SEAT = { damping: 20, stiffness: 100 };
const SPRING_OUT  = { damping: 15, stiffness: 80 };

export const NpcSprite = ({ customer, targetX, targetY, onTap }: Props) => {
  const updateCustomer = useGameStore((s) => s.updateCustomer);

  const layout = buildLayoutFromDimensions();
  const EXIT_X = layout.EXIT.x;

  const x         = useSharedValue(layout.ENTRANCE.x);
  const y         = useSharedValue(layout.ENTRANCE.y);
  const bounce    = useSharedValue(0);
  const reactionS = useSharedValue(0);

  const markSeated = useCallback(() => {
    updateCustomer(customer.id, { animationState: 'SEATED_IDLE' });
  }, [customer.id, updateCustomer]);

  useEffect(() => {
    const state = customer.animationState;

    if (state === 'WALK_IN') {
      x.value = withSpring(targetX, SPRING_WALK);
      y.value = withSpring(targetY, SPRING_WALK);
    } else if (state === 'IDLE_WAITING') {
      bounce.value = withRepeat(
        withSequence(
          withTiming(-3, { duration: 600 }),
          withTiming(0,  { duration: 600 })
        ),
        -1,
        true
      );
    } else if (state === 'WALK_TO_SEAT') {
      cancelAnimation(bounce);
      bounce.value = withTiming(0, { duration: 100 });
      x.value = withSpring(targetX, SPRING_SEAT, () => {
        'worklet';
        runOnJS(markSeated)();
      });
      y.value = withSpring(targetY, SPRING_SEAT);
    } else if (state === 'SEATED_IDLE') {
      cancelAnimation(bounce);
      bounce.value = 0;
    } else if (state === 'REACTION_HAPPY' || state === 'REACTION_UNHAPPY') {
      reactionS.value = withSequence(
        withSpring(1.0, { damping: 8 }),
        withDelay(1200, withTiming(0, { duration: 300 }))
      );
    } else if (state === 'WALK_OUT') {
      cancelAnimation(bounce);
      x.value = withSpring(EXIT_X, SPRING_OUT);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [customer.animationState, targetX, targetY]);

  const spriteStyle = useAnimatedStyle(() => ({
    position: 'absolute',
    left: x.value,
    top: y.value + bounce.value,
    width: NPC_W,
    height: NPC_H + 28, // extra room for patience bar + name
  }));

  const reactionStyle = useAnimatedStyle(() => ({
    position: 'absolute',
    top: -24,
    left: NPC_W / 2 - 10,
    transform: [{ scale: reactionS.value }],
    opacity: reactionS.value,
  }));

  const patiencePct = customer.patience / customer.maxPatience;
  const showPatience = customer.animationState === 'IDLE_WAITING' || customer.animationState === 'WALK_IN';
  const patienceColor =
    patiencePct > 0.6 ? UI.success :
    patiencePct > 0.25 ? UI.warning :
    UI.danger;

  const reactionEmoji =
    customer.animationState === 'REACTION_HAPPY'   ? '✨' :
    customer.animationState === 'REACTION_UNHAPPY' ? '😤' : '';

  return (
    <Animated.View style={spriteStyle}>
      <TouchableOpacity onPress={onTap} activeOpacity={0.85} style={styles.touchable}>
        {/* Reaction emoji */}
        {reactionEmoji !== '' && (
          <Animated.Text style={[styles.reactionEmoji, reactionStyle]}>
            {reactionEmoji}
          </Animated.Text>
        )}

        {/* Patience bar */}
        {showPatience && (
          <View style={styles.patienceBg}>
            <View style={[styles.patienceFill, { width: `${patiencePct * 100}%` as any, backgroundColor: patienceColor }]} />
          </View>
        )}

        {/* Character */}
        <CharacterAvatar config={customer} width={NPC_W} height={NPC_H} />

        {/* VIP badge */}
        {customer.type === 'vip' && (
          <View style={styles.vipBadge}>
            <Text style={styles.vipText}>VIP</Text>
          </View>
        )}

        {/* Name label */}
        <Text style={styles.nameLabel} numberOfLines={1}>{customer.name}</Text>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  touchable: {
    alignItems: 'center',
  },
  reactionEmoji: {
    fontSize: 20,
    textAlign: 'center',
  },
  patienceBg: {
    width: NPC_W,
    height: 5,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: RADIUS.full,
    marginBottom: 2,
    overflow: 'hidden',
  },
  patienceFill: {
    height: 5,
    borderRadius: RADIUS.full,
  },
  vipBadge: {
    position: 'absolute',
    top: 6,
    right: -4,
    backgroundColor: UI.gold,
    borderRadius: RADIUS.sm,
    paddingHorizontal: 3,
    paddingVertical: 1,
  },
  vipText: {
    fontSize: FONT.xs,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  nameLabel: {
    fontSize: FONT.xs,
    color: UI.textPrimary,
    fontWeight: '600',
    backgroundColor: 'rgba(255,255,255,0.85)',
    borderRadius: RADIUS.sm,
    paddingHorizontal: SPACING.xs,
    marginTop: 1,
    maxWidth: NPC_W + 8,
    textAlign: 'center',
    overflow: 'hidden',
  },
});
