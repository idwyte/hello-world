import { Pressable, type PressableProps, View } from 'react-native';

import { Body } from './Body';

type Variant = 'primary' | 'secondary' | 'ghost' | 'destructive';
type Size = 'sm' | 'md' | 'lg';

type Props = Omit<PressableProps, 'children'> & {
  label: string;
  variant?: Variant;
  size?: Size;
  leadingIcon?: React.ReactNode;
  trailingIcon?: React.ReactNode;
  className?: string;
};

const VARIANT_BG: Record<Variant, string> = {
  primary: 'bg-interactive-primary active:bg-interactive-primary-pressed',
  secondary: 'bg-surface-raised border border-border-default active:bg-surface-sunken',
  ghost: 'bg-transparent active:bg-surface-raised',
  destructive: 'bg-feedback-danger active:opacity-80',
};

const VARIANT_TEXT_COLOR: Record<Variant, 'primary' | 'inverse' | 'accent' | 'danger'> = {
  primary: 'primary',
  secondary: 'primary',
  ghost: 'accent',
  destructive: 'primary',
};

const SIZE_HEIGHT: Record<Size, string> = {
  sm: 'h-9 px-3',
  md: 'h-12 px-4',
  lg: 'h-14 px-4',
};

const SIZE_TEXT: Record<Size, 'sm' | 'md' | 'lg'> = {
  sm: 'sm',
  md: 'md',
  lg: 'lg',
};

export function Button({
  label,
  variant = 'primary',
  size = 'lg',
  leadingIcon,
  trailingIcon,
  className = '',
  disabled,
  ...rest
}: Props) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      disabled={disabled}
      className={`${VARIANT_BG[variant]} ${SIZE_HEIGHT[size]} rounded-lg flex-row items-center justify-center ${disabled ? 'opacity-50' : ''} ${className}`}
      {...rest}
    >
      {leadingIcon ? <View className="mr-2">{leadingIcon}</View> : null}
      <Body
        size={SIZE_TEXT[size]}
        weight="semibold"
        color={VARIANT_TEXT_COLOR[variant]}
      >
        {label}
      </Body>
      {trailingIcon ? <View className="ml-2">{trailingIcon}</View> : null}
    </Pressable>
  );
}
