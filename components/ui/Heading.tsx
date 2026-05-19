import { Text, type TextProps } from 'react-native';

type Level =
  | 'display-2xl'
  | 'display-xl'
  | 'display-lg'
  | 'heading-lg'
  | 'heading-md'
  | 'heading-sm';

type Color = 'primary' | 'muted';

type Props = TextProps & {
  level?: Level;
  color?: Color;
  className?: string;
};

const SIZE_CLASS: Record<Level, string> = {
  'display-2xl': 'text-display-2xl',
  'display-xl': 'text-display-xl',
  'display-lg': 'text-display-lg',
  'heading-lg': 'text-heading-lg',
  'heading-md': 'text-heading-md',
  'heading-sm': 'text-heading-sm',
};

const COLOR_CLASS: Record<Color, string> = {
  primary: 'text-text-primary',
  muted: 'text-text-muted',
};

export function Heading({
  level = 'heading-md',
  color = 'primary',
  className = '',
  ...rest
}: Props) {
  return (
    <Text
      className={`font-semibold ${SIZE_CLASS[level]} ${COLOR_CLASS[color]} ${className}`}
      {...rest}
    />
  );
}
