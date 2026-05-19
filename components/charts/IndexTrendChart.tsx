import { View } from 'react-native';
import Svg, { Circle, Line, Polyline } from 'react-native-svg';

import { Body, Heading, SectionLabel } from '@/components/ui';
import type { FetchedIndex } from '@/lib/sessions';
import { semantic } from '@/lib/theme';

const W = 280;
const H = 96;
const PAD_X = 12;
const PAD_Y = 12;

/**
 * Pelvic Floor Index trend sparkline. Composite is 0–100; we map directly
 * to vertical pixels and connect samples chronologically.
 */
export function IndexTrendChart({ history }: { history: FetchedIndex[] }) {
  if (history.length === 0) {
    return (
      <Body size="sm" color="muted">
        Take your first retest to start a trend.
      </Body>
    );
  }

  const usable = history.slice(-12);
  const innerW = W - PAD_X * 2;
  const innerH = H - PAD_Y * 2;
  const stepX = usable.length > 1 ? innerW / (usable.length - 1) : 0;

  const points = usable.map((p, i) => {
    const x = PAD_X + i * stepX;
    const y = PAD_Y + innerH * (1 - p.composite / 100);
    return { x, y, composite: p.composite };
  });

  const polyline = points.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');
  const latest = usable[usable.length - 1];

  return (
    <View accessibilityRole="image" accessibilityLabel="Pelvic Floor Index trend">
      <View className="flex-row items-baseline justify-between">
        <Heading level="heading-lg">{latest.composite.toFixed(0)}</Heading>
        <SectionLabel>{latest.level}</SectionLabel>
      </View>
      <View className="mt-3">
        <Svg width={W} height={H}>
          <Line
            x1={PAD_X}
            y1={PAD_Y + innerH / 2}
            x2={W - PAD_X}
            y2={PAD_Y + innerH / 2}
            stroke={semantic.borderDefault}
            strokeDasharray="2,4"
            strokeWidth={1}
          />
          {usable.length > 1 ? (
            <Polyline
              points={polyline}
              stroke={semantic.interactivePrimary}
              strokeWidth={2}
              fill="none"
            />
          ) : null}
          {points.map((p, i) => (
            <Circle
              key={i}
              cx={p.x}
              cy={p.y}
              r={3.5}
              fill={semantic.interactivePrimary}
            />
          ))}
        </Svg>
      </View>
      <Body size="xs" color="muted" className="mt-2">
        {usable.length === 1
          ? '1 measurement'
          : `Last ${usable.length} measurements`}
      </Body>
    </View>
  );
}
