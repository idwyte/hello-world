import { View, type ViewProps } from 'react-native';

import { Body } from './Body';

// Figma tones. Names mirror the design-system swatch names so callers can
// look them up directly against the Figma source.
type Tone = 'surface' | 'surface2' | 'accent' | 'accentSoft';
type Size = 'xs' | 'sm' | 'md';
type TextColor = 'primary' | 'muted' | 'success' | 'danger';

type Props = ViewProps & {
  label: string;
  tone?: Tone;
  size?: Size;
  bordered?: boolean;
  leadingIcon?: React.ReactNode;
  textColor?: TextColor;
  className?: string;
};

const TONE_BG: Record<Tone, string> = {
  surface: 'bg-surface-raised',
  surface2: 'bg-surface-sunken',
  accent: 'bg-interactive-primary',
  accentSoft: 'bg-interactive-primary-pressed',
};

// Paddings from Figma chip catalog (08 home, 09 program, 10 progress).
const SIZE_PADDING: Record<Size, string> = {
  xs: 'px-2.5 py-1', // 10 / 4 — completion chip "3/7"
  sm: 'px-3 py-1.5', // 12 / 6 — level pill ("Intermediate"), delta chip ("+7")
  md: 'px-3.5 py-2', // 14 / 8 — streak chip, Retest CTA
};

const SIZE_GAP: Record<Size, string> = {
  xs: 'gap-1',
  sm: 'gap-1',
  md: 'gap-1.5',
};

// 13 / 18 is off-scale (Tailwind body-xs is 12/16, body-sm is 14/20).
// Render md pills at exact 13/18 via inline style.
const SIZE_TEXT_STYLE: Record<Size, { fontSize: number; lineHeight: number } | undefined> = {
  xs: undefined,
  sm: undefined,
  md: { fontSize: 13, lineHeight: 18 },
};

const SIZE_TEXT_BODY: Record<Size, 'xs' | 'sm'> = {
  xs: 'xs',
  sm: 'xs',
  md: 'sm',
};

export function Pill({
  label,
  tone = 'surface',
  size = 'md',
  bordered = false,
  leadingIcon,
  textColor = 'primary',
  className = '',
  ...rest
}: Props) {
  const borderClass = bordered ? 'border border-border-default' : '';
  return (
    <View
      className={`${TONE_BG[tone]} ${borderClass} ${SIZE_PADDING[size]} ${SIZE_GAP[size]} rounded-full flex-row items-center ${className}`}
      {...rest}
    >
      {leadingIcon}
      <Body
        size={SIZE_TEXT_BODY[size]}
        weight="semibold"
        color={textColor}
        style={SIZE_TEXT_STYLE[size]}
      >
        {label}
      </Body>
    </View>
  );
}
