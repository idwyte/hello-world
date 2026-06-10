// Obsidian Kinetic — Chip.
// Figma: Chip [3] — Active / Complete / Muted. Pill-shaped status badge
// using monochromatic variants of the primary color (DESIGN.md §Components).
import type { ReactNode } from 'react';
import { Text, View, type ViewStyle } from 'react-native';

import { color, radius, type } from '@/lib/obsidian/tokens';

type Variant = 'active' | 'complete' | 'muted';

const VARIANT: Record<
  Variant,
  { bg: string; fg: string; border?: string }
> = {
  // Live / now — lime on a lime-tinted field.
  active: { bg: 'rgba(195, 244, 0, 0.14)', fg: color.primaryContainer },
  // Done — the dimmed primary-fixed variant.
  complete: { bg: 'rgba(171, 214, 0, 0.10)', fg: color.primaryFixedDim },
  // Everything else.
  muted: {
    bg: color.surfaceContainerLow,
    fg: color.onSurfaceVariant,
    border: color.outlineVariant,
  },
};

type Props = {
  label: string;
  variant?: Variant;
  /** Optional leading element (e.g. a 12px lucide icon). */
  leading?: ReactNode;
  style?: ViewStyle;
};

export function Chip({ label, variant = 'muted', leading, style }: Props) {
  const v = VARIANT[variant];
  return (
    <View
      style={[
        {
          flexDirection: 'row',
          alignItems: 'center',
          alignSelf: 'flex-start',
          gap: 6,
          paddingHorizontal: 12,
          paddingVertical: 6,
          borderRadius: radius.full,
          backgroundColor: v.bg,
          borderWidth: v.border ? 1 : 0,
          borderColor: v.border,
        },
        style,
      ]}
    >
      {leading}
      <Text style={{ ...type.labelCaps, color: v.fg }}>{label}</Text>
    </View>
  );
}
