import React from 'react';
import Svg, { Path, Rect } from 'react-native-svg';

interface Props { fill: string; width?: number; height?: number; }

/** Top 07 — Off-Shoulder */
export const ClothingTop07 = ({ fill, width = 48, height = 64 }: Props) => (
  <Svg width={width} height={height} viewBox="0 0 48 64" style={{ position: 'absolute' }}>
    {/* Wide shoulder band */}
    <Rect x="8" y="28" width="32" height="5" rx="1" fill={fill} />
    {/* Main body */}
    <Path d="M8,32 L40,32 L38,44 L10,44 Z" fill={fill} />
  </Svg>
);
