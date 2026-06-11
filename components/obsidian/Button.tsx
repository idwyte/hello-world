// Obsidian Kinetic — Button.
// Figma: Button [4] — Primary/Ghost × Default/Disabled. 342×56, radius
// xl (12). Primary = Electric Lime fill / near-black label; Ghost =
// Cyan Pulse border + text on transparent.
//
// Motion: press feedback is a motion-instant (100ms, ease-out) scale to
// 0.98 + impactLight haptic (spec §2 "Primary button press"). Disabled
// swaps to a muted-surface fill (NOT opacity-dimming) so the label
// stays legible while the inactive state reads clearly.
import { useCallback } from 'react';
import { Pressable, Text, type ViewStyle } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import { fireHaptic } from '@/lib/obsidian/haptics';
import { color, easing, motion, radius, type } from '@/lib/obsidian/tokens';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const pressEasing = Easing.bezier(...easing.out);

type Props = {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'ghost';
  disabled?: boolean;
  /** Haptics user setting; pass from the settings store. Default on. */
  haptics?: boolean;
  /** Defaults to full width; pass e.g. { width: 342 } to match Figma fixed. */
  style?: ViewStyle;
  accessibilityLabel?: string;
};

export function Button({
  label,
  onPress,
  variant = 'primary',
  disabled = false,
  haptics = true,
  style,
  accessibilityLabel,
}: Props) {
  const reducedMotion = useReducedMotion();
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = useCallback(() => {
    if (disabled) return;
    if (!reducedMotion) {
      scale.value = withTiming(0.98, {
        duration: motion.instant,
        easing: pressEasing,
      });
    }
  }, [disabled, reducedMotion, scale]);

  const handlePressOut = useCallback(() => {
    scale.value = withTiming(1, {
      duration: motion.instant,
      easing: pressEasing,
    });
  }, [scale]);

  const handlePress = useCallback(() => {
    if (disabled) return;
    void fireHaptic('primaryPress', haptics);
    onPress();
  }, [disabled, haptics, onPress]);

  const isPrimary = variant === 'primary';

  // Disabled: muted surface fill, outline-variant border, muted label.
  // Active primary: Electric Lime fill, near-black label (onPrimaryFixed
  // per handoff §3 — DESIGN.md's onPrimaryContainer #556d00 is NOT a
  // text color for lime fills).
  // Active ghost: Cyan Pulse border + text on transparent.
  const backgroundColor = disabled
    ? color.surfaceContainerHigh
    : isPrimary
      ? color.primaryContainer
      : 'transparent';
  const borderWidth = disabled || !isPrimary ? 1.5 : 0;
  const borderColor = disabled
    ? color.outlineVariant
    : isPrimary
      ? undefined
      : color.secondaryContainer;
  const labelColor = disabled
    ? color.onSurfaceVariant
    : isPrimary
      ? color.onPrimaryFixed
      : color.secondaryContainer;

  return (
    <AnimatedPressable
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityState={{ disabled }}
      style={[
        {
          height: 56,
          borderRadius: radius.xl,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor,
          borderWidth,
          borderColor,
        },
        animatedStyle,
        style,
      ]}
    >
      <Text style={{ ...type.labelButton, color: labelColor }}>{label}</Text>
    </AnimatedPressable>
  );
}
