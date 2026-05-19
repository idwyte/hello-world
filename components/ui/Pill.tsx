import { View, type ViewProps } from 'react-native';

import { Body } from './Body';

type Tone = 'neutral' | 'accent' | 'success' | 'danger';

type Props = ViewProps & {
  label: string;
  tone?: Tone;
  leadingIcon?: React.ReactNode;
  className?: string;
};

const TONE_BG: Record<Tone, string> = {
  neutral: 'bg-surface-raised border border-border-default',
  accent: 'bg-interactive-primary',
  success: 'bg-feedback-success',
  danger: 'bg-feedback-danger',
};

const TONE_TEXT: Record<Tone, 'primary' | 'inverse' | 'accent'> = {
  neutral: 'primary',
  accent: 'primary',
  success: 'inverse',
  danger: 'primary',
};

export function Pill({
  label,
  tone = 'neutral',
  leadingIcon,
  className = '',
  ...rest
}: Props) {
  return (
    <View
      className={`${TONE_BG[tone]} rounded-full flex-row items-center px-3 py-2 ${className}`}
      {...rest}
    >
      {leadingIcon ? <View className="mr-1.5">{leadingIcon}</View> : null}
      <Body size="sm" weight="semibold" color={TONE_TEXT[tone]}>
        {label}
      </Body>
    </View>
  );
}
