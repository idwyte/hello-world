// Obsidian Kinetic — Phase Ring. The hero component (motion spec §3.1/§3.2).
//
// Two modes, one component, opposite tempo:
//   performance — lime arc sweeps with `progress`; glow (a state, not a
//     style) intensifies 30%→45% over the final 3s; on completion the
//     ring pulses 1.0→1.04→1.0 over motion-slow paired with impactMedium.
//   breathing — the anti-hero (down-training): soft cyan ring expands on
//     inhale (4s), holds (2s), contracts on exhale (6s), looping. No glow
//     pulse; at most a faint selectionClick at the top of each inhale.
//
// Reduced motion: scale animations collapse (breathing falls back to an
// opacity fade so the pacing function survives); glow-intensity changes
// are not movement and persist. Paused rings should pass glow={false} —
// glow off is the visible, felt "stopped".
import { useEffect, useRef } from 'react';
import { Text, View } from 'react-native';
import Animated, {
  Easing,
  cancelAnimation,
  runOnJS,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Circle } from 'react-native-svg';

import { fireHaptic } from '@/lib/obsidian/haptics';
import {
  breathingCycle,
  color,
  easing,
  glow as glowToken,
  motion,
  type,
} from '@/lib/obsidian/tokens';

const easeInOut = Easing.bezier(...easing.inOut);

type Props = {
  /** 0–1 phase progress. Ignored in breathing mode (ring renders full). */
  progress: number;
  mode?: 'performance' | 'breathing';
  /** Glow = "live / active / now". Pass false when paused. */
  glow?: boolean;
  /** Figma Time prop — metric-lg, centered. */
  time?: string;
  /** Figma Caption prop — label-caps, under the time. */
  caption?: string;
  size?: number;
  strokeWidth?: number;
  /** Phase length; used to place the "final 3s" glow ramp. */
  durationMs?: number;
  /** Haptics user setting. Default on. */
  haptics?: boolean;
};

export function PhaseRing({
  progress,
  mode = 'performance',
  glow = true,
  time,
  caption,
  size = 260,
  strokeWidth = 8,
  durationMs = 10_000,
  haptics = true,
}: Props) {
  const reducedMotion = useReducedMotion();
  const scale = useSharedValue(1);
  const breathOpacity = useSharedValue(1);
  const prevProgress = useRef(progress);

  const isBreathing = mode === 'breathing';

  // — Completion pulse (performance) — 1.0→1.04→1.0 over motion-slow,
  // paired with impactMedium (phase change). Fires once per crossing.
  useEffect(() => {
    if (isBreathing) return;
    const crossed = progress >= 1 && prevProgress.current < 1;
    prevProgress.current = progress;
    if (!crossed) return;
    void fireHaptic('phaseChange', haptics);
    if (reducedMotion) return;
    scale.value = withSequence(
      withTiming(1.04, { duration: motion.slow / 2, easing: easeInOut }),
      withTiming(1, { duration: motion.slow / 2, easing: easeInOut }),
    );
  }, [progress, isBreathing, reducedMotion, haptics, scale]);

  // — Breathing cycle — expand 4s · hold 2s · contract 6s, looping.
  // selectionClick at the top of each inhale. Reduced motion: the scale
  // loop collapses to an opacity fade so pacing survives.
  useEffect(() => {
    if (!isBreathing) return;
    const inhaleTopHaptic = () => void fireHaptic('selection', haptics);
    if (reducedMotion) {
      breathOpacity.value = withRepeat(
        withSequence(
          withTiming(1, { duration: breathingCycle.inhaleMs }, (done) => {
            if (done) runOnJS(inhaleTopHaptic)();
          }),
          withTiming(1, { duration: breathingCycle.holdMs }),
          withTiming(0.55, { duration: breathingCycle.exhaleMs }),
        ),
        -1,
      );
    } else {
      scale.value = withRepeat(
        withSequence(
          withTiming(
            1.08,
            { duration: breathingCycle.inhaleMs, easing: easeInOut },
            (done) => {
              if (done) runOnJS(inhaleTopHaptic)();
            },
          ),
          withTiming(1.08, { duration: breathingCycle.holdMs }),
          withTiming(1, {
            duration: breathingCycle.exhaleMs,
            easing: easeInOut,
          }),
        ),
        -1,
      );
    }
    return () => {
      cancelAnimation(scale);
      cancelAnimation(breathOpacity);
      scale.value = 1;
      breathOpacity.value = 1;
    };
  }, [isBreathing, reducedMotion, haptics, scale, breathOpacity]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: breathOpacity.value,
  }));

  // — Geometry — glow stroke is wider than the arc, so pad the radius.
  const glowStroke = strokeWidth * 2.5;
  const r = (size - glowStroke) / 2;
  const circumference = 2 * Math.PI * r;
  const clamped = isBreathing ? 1 : Math.min(1, Math.max(0, progress));
  const dashOffset = circumference * (1 - clamped);

  // Glow intensifies over the final 3s of the phase (spec §3.1). This is
  // an opacity change, not movement — it survives reduced motion.
  const rampStart = Math.max(0, 1 - 3000 / durationMs);
  const glowOpacity =
    glow && !isBreathing
      ? clamped <= rampStart
        ? glowToken.restingOpacity
        : glowToken.restingOpacity +
          ((clamped - rampStart) / (1 - rampStart)) *
            (glowToken.peakOpacity - glowToken.restingOpacity)
      : 0;

  const arcColor = isBreathing
    ? color.secondaryContainer
    : color.primaryContainer;

  return (
    <Animated.View
      style={[{ width: size, height: size }, animatedStyle]}
      accessibilityLabel={
        caption ? `${caption}${time ? `, ${time}` : ''}` : undefined
      }
    >
      <Svg width={size} height={size}>
        {/* Track */}
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke={color.outlineVariant}
          strokeWidth={strokeWidth}
          fill="none"
        />
        {/* Glow layer — same arc, fatter stroke, low opacity */}
        {glowOpacity > 0 && (
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            stroke={glowToken.primary}
            strokeWidth={glowStroke}
            strokeLinecap="round"
            fill="none"
            strokeDasharray={circumference}
            strokeDashoffset={dashOffset}
            opacity={glowOpacity}
            transform={`rotate(-90 ${size / 2} ${size / 2})`}
          />
        )}
        {/* Progress arc */}
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke={arcColor}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
          opacity={isBreathing ? 0.85 : 1}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </Svg>
      {(time || caption) && (
        <View
          pointerEvents="none"
          style={{
            position: 'absolute',
            top: 0,
            right: 0,
            bottom: 0,
            left: 0,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {time ? (
            <Text style={{ ...type.metricLg, color: color.onSurface }}>
              {time}
            </Text>
          ) : null}
          {caption ? (
            <Text
              style={{
                ...type.labelCaps,
                color: color.onSurfaceVariant,
                marginTop: 4,
              }}
            >
              {caption}
            </Text>
          ) : null}
        </View>
      )}
    </Animated.View>
  );
}
