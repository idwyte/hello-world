// Obsidian Kinetic — five-axis profile, Bars variant (Figma 37:151).
// Default profile visual per handoff §4 (most legible at phone size).
// Bars DRAW IN on mount (motion spec §3.3) with a small stagger;
// reduced motion collapses to a fade.
import { useEffect } from 'react';
import { Text, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';

import { color, easing, motion, radius, type } from '@/lib/obsidian/tokens';

export type AxisScore = { label: string; value: number }; // value 0–1

const drawEasing = Easing.bezier(...easing.inOut);

function Bar({ score, index }: { score: AxisScore; index: number }) {
  const reducedMotion = useReducedMotion();
  const progress = useSharedValue(reducedMotion ? 1 : 0);

  useEffect(() => {
    if (reducedMotion) return;
    progress.value = withDelay(
      index * 60,
      withTiming(1, { duration: motion.base, easing: drawEasing }),
    );
  }, [index, progress, reducedMotion]);

  const fillStyle = useAnimatedStyle(() => ({
    width: `${Math.max(0, Math.min(1, score.value)) * progress.value * 100}%`,
  }));

  return (
    <View style={{ gap: 6 }}>
      <Text style={{ ...type.labelCaps, color: color.onSurfaceVariant }}>
        {score.label}
      </Text>
      <View
        style={{
          height: 10,
          borderRadius: radius.full,
          backgroundColor: color.surfaceContainerHigh,
          overflow: 'hidden',
        }}
      >
        <Animated.View
          style={[
            {
              height: 10,
              borderRadius: radius.full,
              backgroundColor: color.primaryContainer,
            },
            fillStyle,
          ]}
        />
      </View>
    </View>
  );
}

export function AxisBars({ scores }: { scores: AxisScore[] }) {
  return (
    <View style={{ gap: 12, width: '100%' }}>
      {scores.map((s, i) => (
        <Bar key={s.label} score={s} index={i} />
      ))}
    </View>
  );
}
