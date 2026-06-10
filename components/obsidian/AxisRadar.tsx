// Obsidian Kinetic — five-axis profile, Radar variant (Figma 37:100).
// Kept for the retest before/after moment (handoff §4: "the single most
// important 'look what changed' beat"). Pass `compare` to overlay a
// second (prior) polygon in muted outline.
// Draw-in: the polygon scales from the centre over motion-slow;
// reduced motion collapses to a fade (motion spec §1).
import { useEffect } from 'react';
import { Text, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Circle, Line, Polygon } from 'react-native-svg';

import { color, easing, motion, type } from '@/lib/obsidian/tokens';

import type { AxisScore } from './AxisBars';

const drawEasing = Easing.bezier(...easing.inOut);

function polygonPoints(
  scores: number[],
  cx: number,
  cy: number,
  r: number,
): string {
  return scores
    .map((v, i) => {
      const angle = -Math.PI / 2 + (i * 2 * Math.PI) / scores.length;
      const rr = r * Math.max(0.04, Math.min(1, v));
      return `${cx + rr * Math.cos(angle)},${cy + rr * Math.sin(angle)}`;
    })
    .join(' ');
}

export function AxisRadar({
  scores,
  compare,
  size = 280,
}: {
  scores: AxisScore[];
  /** Optional prior measurement, drawn as a muted outline underneath. */
  compare?: AxisScore[];
  size?: number;
}) {
  const reducedMotion = useReducedMotion();
  const reveal = useSharedValue(reducedMotion ? 1 : 0);

  useEffect(() => {
    if (reducedMotion) return;
    reveal.value = withTiming(1, {
      duration: motion.slow,
      easing: drawEasing,
    });
  }, [reveal, reducedMotion]);

  const animatedStyle = useAnimatedStyle(() =>
    reducedMotion
      ? { opacity: reveal.value }
      : { transform: [{ scale: reveal.value }], opacity: reveal.value },
  );

  const cx = size / 2;
  const cy = size / 2;
  const labelPad = 36;
  const r = size / 2 - labelPad;
  const n = scores.length;

  const gridLevels = [0.25, 0.5, 0.75, 1];
  const values = scores.map((s) => s.value);
  const points = polygonPoints(values, cx, cy, r);
  const comparePoints = compare
    ? polygonPoints(
        compare.map((s) => s.value),
        cx,
        cy,
        r,
      )
    : null;

  return (
    <View style={{ width: size, height: size }}>
      <Svg width={size} height={size}>
        {/* Grid rings + spokes */}
        {gridLevels.map((level) => (
          <Polygon
            key={level}
            points={polygonPoints(
              Array(n).fill(level),
              cx,
              cy,
              r,
            )}
            stroke={color.outlineVariant}
            strokeWidth={1}
            fill="none"
            opacity={0.6}
          />
        ))}
        {scores.map((_, i) => {
          const angle = -Math.PI / 2 + (i * 2 * Math.PI) / n;
          return (
            <Line
              key={i}
              x1={cx}
              y1={cy}
              x2={cx + r * Math.cos(angle)}
              y2={cy + r * Math.sin(angle)}
              stroke={color.outlineVariant}
              strokeWidth={1}
              opacity={0.6}
            />
          );
        })}
        {comparePoints && (
          <Polygon
            points={comparePoints}
            stroke={color.outline}
            strokeWidth={1.5}
            strokeDasharray="4 4"
            fill="none"
          />
        )}
      </Svg>
      {/* Animated value polygon overlays the static grid */}
      <Animated.View
        style={[
          { position: 'absolute', top: 0, left: 0 },
          animatedStyle,
        ]}
      >
        <Svg width={size} height={size}>
          <Polygon
            points={points}
            stroke={color.primaryContainer}
            strokeWidth={2}
            fill="rgba(195, 244, 0, 0.16)"
          />
          {values.map((v, i) => {
            const angle = -Math.PI / 2 + (i * 2 * Math.PI) / n;
            const rr = r * Math.max(0.04, Math.min(1, v));
            return (
              <Circle
                key={i}
                cx={cx + rr * Math.cos(angle)}
                cy={cy + rr * Math.sin(angle)}
                r={4}
                fill={color.primaryContainer}
              />
            );
          })}
        </Svg>
      </Animated.View>
      {/* Axis labels */}
      {scores.map((s, i) => {
        const angle = -Math.PI / 2 + (i * 2 * Math.PI) / n;
        const lx = cx + (r + 20) * Math.cos(angle);
        const ly = cy + (r + 20) * Math.sin(angle);
        return (
          <Text
            key={s.label}
            style={{
              ...type.labelCaps,
              fontSize: 9,
              letterSpacing: 0.9,
              color: color.onSurfaceVariant,
              position: 'absolute',
              left: lx - 40,
              top: ly - 8,
              width: 80,
              textAlign: 'center',
            }}
          >
            {s.label}
          </Text>
        );
      })}
    </View>
  );
}
