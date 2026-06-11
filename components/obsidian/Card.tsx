// Obsidian Kinetic — Card.
// Figma: Card — glass recipe: surface-container-low @85% + 1px 10%-white
// inner border, radius xl (12). Two uses:
//   · container (children)
//   · the stat-card pattern via `label` + `value` props (Label = mono
//     caps muted, Value = metric).
import type { ReactNode } from 'react';
import { Text, View, type ViewStyle } from 'react-native';

import { color, glass, radius, spacing, type } from '@/lib/obsidian/tokens';

type Props = {
  label?: string;
  value?: string;
  /** Smaller metric for dense stat rows. */
  compact?: boolean;
  children?: ReactNode;
  style?: ViewStyle;
};

export function Card({ label, value, compact = false, children, style }: Props) {
  return (
    <View
      style={[
        {
          backgroundColor: glass.fill,
          borderColor: glass.border,
          borderWidth: glass.borderWidth,
          borderRadius: radius.xl,
          padding: spacing.stackMd,
        },
        style,
      ]}
    >
      {label ? (
        <Text style={{ ...type.labelCaps, color: color.onSurfaceVariant }}>
          {label}
        </Text>
      ) : null}
      {value ? (
        <Text
          style={{
            ...type.metricLg,
            ...(compact ? { fontSize: 28, lineHeight: 32 } : null),
            color: color.onSurface,
            marginTop: label ? spacing.stackSm : 0,
          }}
        >
          {value}
        </Text>
      ) : null}
      {children}
    </View>
  );
}
