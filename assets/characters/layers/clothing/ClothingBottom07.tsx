import React from 'react';
import Svg, { Rect } from 'react-native-svg';

interface Props { fill: string; width?: number; height?: number; }

/** Bottom 07 — Joggers (loose) */
export const ClothingBottom07 = ({ fill, width = 48, height = 64 }: Props) => (
  <Svg width={width} height={height} viewBox="0 0 48 64" style={{ position: 'absolute' }}>
    <Rect x="12" y="42" width="24" height="4"  rx="2" fill={fill} />
    <Rect x="12" y="45" width="10" height="16" rx="4" fill={fill} />
    <Rect x="26" y="45" width="10" height="16" rx="4" fill={fill} />
  </Svg>
);
