import { Text, type TextProps } from 'react-native';

type Size = 'lg' | 'md' | 'sm' | 'xs';
type Color = 'primary' | 'muted' | 'inverse' | 'accent' | 'success' | 'danger';

type Props = TextProps & {
  size?: Size;
  color?: Color;
  weight?: 'regular' | 'medium' | 'semibold';
  className?: string;
};

const SIZE_CLASS: Record<Size, string> = {
  lg: 'text-body-lg',
  md: 'text-body-md',
  sm: 'text-body-sm',
  xs: 'text-body-xs',
};

const COLOR_CLASS: Record<Color, string> = {
  primary: 'text-text-primary',
  muted: 'text-text-muted',
  inverse: 'text-text-inverse',
  accent: 'text-interactive-primary',
  success: 'text-feedback-success',
  danger: 'text-feedback-danger',
};

const WEIGHT_CLASS = {
  regular: 'font-sans',
  medium: 'font-medium',
  semibold: 'font-semibold',
} as const;

export function Body({
  size = 'md',
  color = 'primary',
  weight,
  className = '',
  ...rest
}: Props) {
  // body-xs defaults to medium (500) per Figma; everything else to regular (400).
  const resolvedWeight = weight ?? (size === 'xs' ? 'medium' : 'regular');
  return (
    <Text
      className={`${WEIGHT_CLASS[resolvedWeight]} ${SIZE_CLASS[size]} ${COLOR_CLASS[color]} ${className}`}
      {...rest}
    />
  );
}
