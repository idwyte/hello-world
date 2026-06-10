// Obsidian Kinetic — Price Card.
// Figma: Price Card [6] — Annual/Monthly/Lifetime × Selected/Default,
// set-level Badge bool for "BEST VALUE". Covers both pricing-experiment
// arms (subscription-only and +lifetime). Selection = lime border +
// lime period label; badge = lime pill clipped to the top edge.
import { Pressable, Text, View, type ViewStyle } from 'react-native';

import { fireHaptic } from '@/lib/obsidian/haptics';
import { color, glass, radius, spacing, type } from '@/lib/obsidian/tokens';

type Props = {
  /** "ANNUAL" / "MONTHLY" / "LIFETIME" — rendered in label-caps. */
  period: string;
  /** Headline price, e.g. "£29.99". */
  price: string;
  /** Under-price context, e.g. "£2.50 / month" or "one-time". */
  sublabel?: string;
  selected?: boolean;
  /** Set-level badge ("BEST VALUE"). */
  badge?: string;
  onPress: () => void;
  haptics?: boolean;
  style?: ViewStyle;
};

export function PriceCard({
  period,
  price,
  sublabel,
  selected = false,
  badge,
  onPress,
  haptics = true,
  style,
}: Props) {
  return (
    <Pressable
      onPress={() => {
        void fireHaptic('selection', haptics);
        onPress();
      }}
      accessibilityRole="radio"
      accessibilityState={{ selected }}
      accessibilityLabel={`${period}, ${price}${sublabel ? `, ${sublabel}` : ''}`}
      style={[{ paddingTop: badge ? 10 : 0 }, style]}
    >
      <View
        style={{
          backgroundColor: glass.fill,
          borderRadius: radius.xl,
          borderWidth: selected ? 1.5 : glass.borderWidth,
          borderColor: selected ? color.primaryContainer : glass.border,
          padding: spacing.stackMd,
        }}
      >
        <Text
          style={{
            ...type.labelCaps,
            color: selected ? color.primaryContainer : color.onSurfaceVariant,
          }}
        >
          {period}
        </Text>
        <Text
          style={{
            ...type.metricLg,
            fontSize: 28,
            lineHeight: 32,
            color: color.onSurface,
            marginTop: spacing.stackSm,
          }}
        >
          {price}
        </Text>
        {sublabel ? (
          <Text
            style={{
              ...type.bodyMd,
              fontSize: 14,
              lineHeight: 20,
              color: color.onSurfaceVariant,
              marginTop: 2,
            }}
          >
            {sublabel}
          </Text>
        ) : null}
      </View>
      {badge ? (
        <View
          style={{
            position: 'absolute',
            top: 0,
            alignSelf: 'center',
            backgroundColor: color.primaryContainer,
            borderRadius: radius.full,
            paddingHorizontal: 10,
            paddingVertical: 3,
          }}
        >
          <Text style={{ ...type.labelCaps, color: color.onPrimaryFixed }}>
            {badge}
          </Text>
        </View>
      ) : null}
    </Pressable>
  );
}
