import React from 'react';
import Svg, { Path, Ellipse, Rect } from 'react-native-svg';

interface Props {
  fill: string;
  nailFill?: string;
  width?: number;
  height?: number;
}

/** Archetype C — Curvy / Hourglass */
export const BodyBaseC = ({ fill, nailFill, width = 48, height = 64 }: Props) => {
  const nail = nailFill ?? fill;
  return (
    <Svg width={width} height={height} viewBox="0 0 48 64">
      {/* Head */}
      <Ellipse cx="24" cy="12" rx="8" ry="9.5" fill={fill} />
      {/* Neck */}
      <Rect x="21" y="20.5" width="6" height="7" rx="1" fill={fill} />
      {/* Torso — hourglass: wide shoulders, narrow waist, wide hips */}
      <Path d="M13,27 L18,37 L12,46 L36,46 L30,37 L35,27 Z" fill={fill} />
      {/* Left arm */}
      <Path d="M13,28 L7,29 L5,44 L10,44 L12,32 Z" fill={fill} />
      {/* Right arm */}
      <Path d="M35,28 L41,29 L43,44 L38,44 L36,32 Z" fill={fill} />
      {/* Left hand */}
      <Ellipse cx="7" cy="45" rx="3" ry="2" fill={fill} />
      {/* Right hand */}
      <Ellipse cx="41" cy="45" rx="3" ry="2" fill={fill} />
      {/* Left nails */}
      <Ellipse cx="5.5" cy="47" rx="1" ry="1.4" fill={nail} />
      <Ellipse cx="7" cy="47.5" rx="1" ry="1.4" fill={nail} />
      <Ellipse cx="8.5" cy="47" rx="1" ry="1.4" fill={nail} />
      {/* Right nails */}
      <Ellipse cx="39.5" cy="47" rx="1" ry="1.4" fill={nail} />
      <Ellipse cx="41" cy="47.5" rx="1" ry="1.4" fill={nail} />
      <Ellipse cx="42.5" cy="47" rx="1" ry="1.4" fill={nail} />
    </Svg>
  );
};
