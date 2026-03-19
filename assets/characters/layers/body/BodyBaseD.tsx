import React from 'react';
import Svg, { Path, Ellipse, Rect } from 'react-native-svg';

interface Props {
  fill: string;
  nailFill?: string;
  width?: number;
  height?: number;
}

/** Archetype D — Athletic / Broad */
export const BodyBaseD = ({ fill, nailFill, width = 48, height = 64 }: Props) => {
  const nail = nailFill ?? fill;
  return (
    <Svg width={width} height={height} viewBox="0 0 48 64">
      {/* Head — slightly larger, strong neck */}
      <Ellipse cx="24" cy="11" rx="8.5" ry="10" fill={fill} />
      {/* Neck — wider */}
      <Rect x="21" y="20" width="6" height="7" rx="1.5" fill={fill} />
      {/* Torso — broad shoulders tapering to hips (V-shape) */}
      <Path d="M11,27 L37,27 L33,46 L15,46 Z" fill={fill} />
      {/* Left arm — thick */}
      <Path d="M11,28 L5,28 L4,43 L9,43 L10,32 Z" fill={fill} />
      {/* Right arm — thick */}
      <Path d="M37,28 L43,28 L44,43 L39,43 L38,32 Z" fill={fill} />
      {/* Left hand */}
      <Ellipse cx="6.5" cy="44" rx="3.5" ry="2.2" fill={fill} />
      {/* Right hand */}
      <Ellipse cx="41.5" cy="44" rx="3.5" ry="2.2" fill={fill} />
      {/* Left nails */}
      <Ellipse cx="5" cy="46.2" rx="1.1" ry="1.5" fill={nail} />
      <Ellipse cx="6.5" cy="47" rx="1.1" ry="1.5" fill={nail} />
      <Ellipse cx="8" cy="46.2" rx="1.1" ry="1.5" fill={nail} />
      {/* Right nails */}
      <Ellipse cx="40" cy="46.2" rx="1.1" ry="1.5" fill={nail} />
      <Ellipse cx="41.5" cy="47" rx="1.1" ry="1.5" fill={nail} />
      <Ellipse cx="43" cy="46.2" rx="1.1" ry="1.5" fill={nail} />
    </Svg>
  );
};
