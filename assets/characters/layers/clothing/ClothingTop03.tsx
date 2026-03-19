import React from 'react';
import Svg, { Path, Rect } from 'react-native-svg';

interface Props { fill: string; width?: number; height?: number; }

/** Top 03 — Long Sleeve */
export const ClothingTop03 = ({ fill, width = 48, height = 64 }: Props) => (
  <Svg width={width} height={height} viewBox="0 0 48 64" style={{ position: 'absolute' }}>
    <Rect x="14" y="26" width="20" height="18" rx="3" fill={fill} />
    <Path d="M14,27 L8,28 L6,44 L11,44 L13,30 Z"  fill={fill} />
    <Path d="M34,27 L40,28 L42,44 L37,44 L35,30 Z" fill={fill} />
  </Svg>
);
