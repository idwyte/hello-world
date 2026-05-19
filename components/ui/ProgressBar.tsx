import { View, type ViewProps } from 'react-native';

type Props = ViewProps & {
  value: number; // 0..1
  tone?: 'accent' | 'success' | 'danger';
  className?: string;
};

const TONE_BG: Record<NonNullable<Props['tone']>, string> = {
  accent: 'bg-interactive-primary',
  success: 'bg-feedback-success',
  danger: 'bg-feedback-danger',
};

export function ProgressBar({
  value,
  tone = 'accent',
  className = '',
  ...rest
}: Props) {
  const clamped = Math.max(0, Math.min(1, value));
  return (
    <View
      className={`h-1.5 bg-surface-sunken rounded-full overflow-hidden ${className}`}
      accessibilityRole="progressbar"
      accessibilityValue={{ now: Math.round(clamped * 100), min: 0, max: 100 }}
      {...rest}
    >
      <View
        className={`h-full ${TONE_BG[tone]} rounded-full`}
        style={{ width: `${clamped * 100}%` }}
      />
    </View>
  );
}
