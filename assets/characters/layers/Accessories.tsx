import React from 'react';
import Svg, { Circle, Ellipse, Rect, Path } from 'react-native-svg';

interface Props {
  items: string[];
  width?: number;
  height?: number;
}

const GOLD   = '#D4A847';
const SILVER = '#B8BCC2';

export const Accessories = ({ items, width = 48, height = 64 }: Props) => {
  if (!items || items.length === 0) return null;
  return (
    <Svg width={width} height={height} viewBox="0 0 48 64" style={{ position: 'absolute' }}>

      {/* Stud earrings */}
      {items.includes('earrings') && (
        <>
          <Circle cx="14.5" cy="17" r="1.2" fill={GOLD} />
          <Circle cx="33.5" cy="17" r="1.2" fill={GOLD} />
        </>
      )}

      {/* Hoop earrings */}
      {items.includes('hoops') && (
        <>
          <Circle cx="14.5" cy="18" r="2.5" fill="none" stroke={GOLD} strokeWidth="1.2" />
          <Circle cx="33.5" cy="18" r="2.5" fill="none" stroke={GOLD} strokeWidth="1.2" />
        </>
      )}

      {/* Necklace */}
      {items.includes('necklace') && (
        <Ellipse cx="24" cy="27" rx="5" ry="2" fill="none" stroke={GOLD} strokeWidth="1" />
      )}

      {/* Chain */}
      {items.includes('chains') && (
        <Path d="M18,27 Q24,31 30,27" fill="none" stroke={GOLD} strokeWidth="1.2" />
      )}

      {/* Glasses */}
      {items.includes('glasses') && (
        <>
          <Rect x="15" y="12" width="7" height="5" rx="2" fill="none" stroke={SILVER} strokeWidth="1" />
          <Rect x="26" y="12" width="7" height="5" rx="2" fill="none" stroke={SILVER} strokeWidth="1" />
          <Rect x="22" y="14" width="4" height="1"          fill={SILVER} />
        </>
      )}

      {/* Nose ring */}
      {items.includes('nose_ring') && (
        <Circle cx="24" cy="17.5" r="1" fill="none" stroke={GOLD} strokeWidth="0.8" />
      )}

      {/* Stacked rings (shown on hands as small dots) */}
      {items.includes('stacked_rings') && (
        <>
          <Circle cx="10" cy="44" r="1"    fill={GOLD} />
          <Circle cx="38" cy="44" r="1"    fill={GOLD} />
        </>
      )}
    </Svg>
  );
};
