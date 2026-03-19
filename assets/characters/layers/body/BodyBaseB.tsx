import React from 'react';
import Svg, { Path, Ellipse, Rect } from 'react-native-svg';

interface Props {
  fill: string;
  nailFill?: string;
  width?: number;
  height?: number;
}

/** Archetype B — Average */
export const BodyBaseB = ({ fill, nailFill, width = 48, height = 64 }: Props) => {
  const nail = nailFill ?? fill;
  return (
    <Svg width={width} height={height} viewBox="0 0 48 64">
      {/* Head */}
      <Ellipse cx="24" cy="12" rx="8" ry="9.5" fill={fill} />
      {/* Neck */}
      <Rect x="21.5" y="20.5" width="5" height="7" rx="1" fill={fill} />
      {/* Torso — moderate trapezoid */}
      <Path d="M14,27 L34,27 L32,46 L16,46 Z" fill={fill} />
      {/* Left arm */}
      <Path d="M14,28 L8,29 L6,44 L11,44 L13,32 Z" fill={fill} />
      {/* Right arm */}
      <Path d="M34,28 L40,29 L42,44 L37,44 L35,32 Z" fill={fill} />
      {/* Left hand */}
      <Ellipse cx="8.5" cy="45" rx="3" ry="2" fill={fill} />
      {/* Right hand */}
      <Ellipse cx="39.5" cy="45" rx="3" ry="2" fill={fill} />
      {/* Left nails */}
      <Ellipse cx="7" cy="47" rx="1" ry="1.4" fill={nail} />
      <Ellipse cx="8.5" cy="47.5" rx="1" ry="1.4" fill={nail} />
      <Ellipse cx="10" cy="47" rx="1" ry="1.4" fill={nail} />
      {/* Right nails */}
      <Ellipse cx="38" cy="47" rx="1" ry="1.4" fill={nail} />
      <Ellipse cx="39.5" cy="47.5" rx="1" ry="1.4" fill={nail} />
      <Ellipse cx="41" cy="47" rx="1" ry="1.4" fill={nail} />
    </Svg>
  );
};
