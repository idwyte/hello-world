// Obsidian Kinetic — Screen Header.
// Figma: Screen Header [2] — Back / Close. Full width, 56 tall, title
// in label-button weight, leading 44×44 hit target, balancing trailing
// slot so the title is screen-centered.
import type { ReactNode } from 'react';
import { ChevronLeft, X } from 'lucide-react-native';
import { Pressable, Text, View } from 'react-native';

import { color, spacing, type } from '@/lib/obsidian/tokens';

type Props = {
  title?: string;
  variant?: 'back' | 'close';
  onPress: () => void;
  trailing?: ReactNode;
};

export function ScreenHeader({
  title,
  variant = 'back',
  onPress,
  trailing,
}: Props) {
  const Icon = variant === 'back' ? ChevronLeft : X;
  return (
    <View
      style={{
        height: 56,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: spacing.gutter,
      }}
    >
      <Pressable
        onPress={onPress}
        hitSlop={8}
        accessibilityRole="button"
        accessibilityLabel={variant === 'back' ? 'Back' : 'Close'}
        style={{
          width: 44,
          height: 44,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Icon size={24} color={color.onSurface} />
      </Pressable>
      <View style={{ flex: 1, alignItems: 'center' }}>
        {title ? (
          <Text style={{ ...type.labelButton, color: color.onSurface }}>
            {title}
          </Text>
        ) : null}
      </View>
      <View
        style={{
          width: 44,
          height: 44,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {trailing}
      </View>
    </View>
  );
}
