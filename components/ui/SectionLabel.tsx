import { Text, type TextProps, type TextStyle } from 'react-native';

// 'tight' (1.2 px) matches Figma group labels (settings ACCOUNT/TRAINING) and
// stat-card kickers (home THIS WEEK). 'wide' (1.4 px) matches hero/decorative
// kickers (home TODAY · DAY 3, progress PELVIC FLOOR INDEX).
type Tracking = 'tight' | 'wide';

type Props = TextProps & {
  tracking?: Tracking;
  className?: string;
};

const TRACKING_CLASS: Record<Tracking, string> = {
  tight: 'tracking-[1.2px]',
  wide: 'tracking-[1.4px]',
};

// 11 / 14 Medium muted uppercase. Off-scale (Tailwind body-xs is 12 / 16),
// so size is set inline.
export function SectionLabel({
  tracking = 'tight',
  className = '',
  children,
  style,
  ...rest
}: Props) {
  const text = typeof children === 'string' ? children.toUpperCase() : children;
  return (
    <Text
      className={`font-medium text-text-muted ${TRACKING_CLASS[tracking]} ${className}`}
      style={[{ fontSize: 11, lineHeight: 14 } satisfies TextStyle, style]}
      {...rest}
    >
      {text}
    </Text>
  );
}
