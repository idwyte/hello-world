import React from 'react';
import Svg, { Path, Ellipse, Rect } from 'react-native-svg';

interface Props {
  fill: string;
  nailFill?: string;
  width?: number;
  height?: number;
}

/** Archetype A — Slender / Petite */
export const BodyBaseA = ({ fill, nailFill, width = 48, height = 64 }: Props) => {
  const nail = nailFill ?? fill;
  return (
    <Svg width={width} height={height} viewBox="0 0 48 64">
      {/* Head */}
      <Ellipse cx="24" cy="12" rx="7.5" ry="9" fill={fill} />
      {/* Neck */}
      <Rect x="22" y="20" width="4" height="7" rx="1" fill={fill} />
      {/* Torso — narrow trapezoid */}
      <Path d="M16,27 L32,27 L30,46 L18,46 Z" fill={fill} />
      {/* Left arm */}
      <Path d="M16,28 L10,29 L8,43 L13,43 L15,32 Z" fill={fill} />
      {/* Right arm */}
      <Path d="M32,28 L38,29 L40,43 L35,43 L33,32 Z" fill={fill} />
      {/* Left hand */}
      <Ellipse cx="10" cy="44" rx="2.5" ry="1.8" fill={fill} />
      {/* Right hand */}
      <Ellipse cx="38" cy="44" rx="2.5" ry="1.8" fill={fill} />
      {/* Left nails */}
      <Ellipse cx="8.5" cy="46" rx="0.9" ry="1.3" fill={nail} />
      <Ellipse cx="10" cy="46.5" rx="0.9" ry="1.3" fill={nail} />
      <Ellipse cx="11.5" cy="46" rx="0.9" ry="1.3" fill={nail} />
      {/* Right nails */}
      <Ellipse cx="36.5" cy="46" rx="0.9" ry="1.3" fill={nail} />
      <Ellipse cx="38" cy="46.5" rx="0.9" ry="1.3" fill={nail} />
      <Ellipse cx="39.5" cy="46" rx="0.9" ry="1.3" fill={nail} />
    </Svg>
  );
};
