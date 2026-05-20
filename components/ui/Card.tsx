import { View, type ViewProps } from 'react-native';

type Elevation = 0 | 1 | 2 | 3;
type Padding = 'none' | 'sm' | 'md' | 'lg' | 'xl';
// Foundations radii (md/lg/xl/2xl = 8/12/16/24) plus off-scale Figma literals
// observed across screens: card-tight=14 (group/week cards), card=16 (alias
// for xl, used as the in-app canonical), card-hero=20 (home today-session).
type Radius = 'md' | 'lg' | 'xl' | '2xl' | 'card-tight' | 'card' | 'card-hero';

type Props = ViewProps & {
  elevation?: Elevation;
  padding?: Padding;
  radius?: Radius;
  bordered?: boolean;
  surface?: 'raised' | 'sunken';
  className?: string;
};

const PADDING_CLASS: Record<Padding, string> = {
  none: '',
  sm: 'p-3', // 12
  md: 'p-4', // 16
  lg: 'p-6', // 24
  xl: 'p-5', // 20 — Figma progress index/streak cards
};

const RADIUS_CLASS: Record<Radius, string> = {
  md: 'rounded-md',
  lg: 'rounded-lg',
  xl: 'rounded-xl',
  '2xl': 'rounded-2xl',
  'card-tight': 'rounded-[14px]',
  card: 'rounded-[16px]',
  'card-hero': 'rounded-[20px]',
};

const ELEVATION_CLASS: Record<Elevation, string> = {
  0: '',
  1: 'shadow-elev-1',
  2: 'shadow-elev-2',
  3: 'shadow-elev-3',
};

export function Card({
  elevation = 0,
  padding = 'md',
  radius = 'xl',
  bordered = false,
  surface = 'raised',
  className = '',
  ...rest
}: Props) {
  const surfaceClass =
    surface === 'sunken' ? 'bg-surface-sunken' : 'bg-surface-raised';
  const borderClass = bordered ? 'border border-border-default' : '';
  return (
    <View
      className={`${surfaceClass} ${RADIUS_CLASS[radius]} ${PADDING_CLASS[padding]} ${ELEVATION_CLASS[elevation]} ${borderClass} ${className}`}
      {...rest}
    />
  );
}
