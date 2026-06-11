// Obsidian Kinetic — settings/list row. Derived from the Card +
// outline-variant hairline pattern (no dedicated Figma frame — the
// settings pages are "still to design" per handoff §4; this row keeps
// them token-faithful until those frames land).
import type { ReactNode } from 'react';
import { ChevronRight } from 'lucide-react-native';
import { Pressable, Text, View } from 'react-native';

import { fireHaptic } from '@/lib/obsidian/haptics';
import { color, spacing, type } from '@/lib/obsidian/tokens';

type Props = {
  label: string;
  /** Right-aligned value text (e.g. current setting). */
  value?: string;
  sub?: string;
  onPress?: () => void;
  /** Replaces the chevron (e.g. a Switch). */
  trailing?: ReactNode;
  destructive?: boolean;
  haptics?: boolean;
};

export function ListRow({
  label,
  value,
  sub,
  onPress,
  trailing,
  destructive = false,
  haptics = true,
}: Props) {
  const content = (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 14,
        gap: spacing.gutter,
      }}
    >
      <View style={{ flex: 1, gap: 2 }}>
        <Text
          style={{
            ...type.bodyLg,
            color: destructive ? color.error : color.onSurface,
          }}
        >
          {label}
        </Text>
        {sub ? (
          <Text
            style={{
              ...type.bodyMd,
              fontSize: 14,
              lineHeight: 20,
              color: color.onSurfaceVariant,
            }}
          >
            {sub}
          </Text>
        ) : null}
      </View>
      {value ? (
        <Text style={{ ...type.bodyMd, color: color.onSurfaceVariant }}>
          {value}
        </Text>
      ) : null}
      {trailing ??
        (onPress ? (
          <ChevronRight size={18} color={color.onSurfaceVariant} />
        ) : null)}
    </View>
  );

  if (!onPress) return content;
  return (
    <Pressable
      onPress={() => {
        void fireHaptic('selection', haptics);
        onPress();
      }}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
    >
      {content}
    </Pressable>
  );
}

/** Section wrapper: mono caps heading + hairline-separated rows. */
export function ListSection({
  title,
  children,
}: {
  title?: string;
  children: ReactNode;
}) {
  return (
    <View style={{ gap: 2 }}>
      {title ? (
        <Text
          style={{
            ...type.labelCaps,
            color: color.onSurfaceVariant,
            marginBottom: spacing.stackSm,
          }}
        >
          {title}
        </Text>
      ) : null}
      <View
        style={{
          backgroundColor: color.surfaceContainerLow,
          borderColor: 'rgba(255,255,255,0.1)',
          borderWidth: 1,
          borderRadius: 12,
          paddingHorizontal: spacing.stackMd,
        }}
      >
        {children}
      </View>
    </View>
  );
}
