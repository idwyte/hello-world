import { Text, type TextProps } from 'react-native';

type Props = TextProps & {
  className?: string;
};

// Uppercase tracking-wider label used as a kicker above cards
// ("TODAY · DAY 3", "THIS WEEK", "LATEST INDEX", "ACCOUNT" etc.)
export function SectionLabel({ className = '', children, ...rest }: Props) {
  const text = typeof children === 'string' ? children.toUpperCase() : children;
  return (
    <Text
      className={`font-medium text-body-xs text-text-muted tracking-widest ${className}`}
      {...rest}
    >
      {text}
    </Text>
  );
}
