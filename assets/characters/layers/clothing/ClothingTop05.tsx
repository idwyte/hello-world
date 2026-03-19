import React from 'react';
import Svg, { Rect } from 'react-native-svg';

interface Props { fill: string; width?: number; height?: number; }

/** Top 05 — Blazer / Jacket (straight wide sleeves) */
export const ClothingTop05 = ({ fill, width = 48, height = 64 }: Props) => (
  <Svg width={width} height={height} viewBox="0 0 48 64" style={{ position: 'absolute' }}>
    <Rect x="12" y="26" width="24" height="18" rx="2" fill={fill} />
    {/* Straight business sleeves */}
    <Rect x="6"  y="26" width="6" height="14" rx="2" fill={fill} />
    <Rect x="36" y="26" width="6" height="14" rx="2" fill={fill} />
  </Svg>
);
