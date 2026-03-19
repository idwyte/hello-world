import React from 'react';
import Svg, { Rect } from 'react-native-svg';

interface Props { fill: string; width?: number; height?: number; }

/** Bottom 08 — Denim Shorts (high-waist) */
export const ClothingBottom08 = ({ fill, width = 48, height = 64 }: Props) => (
  <Svg width={width} height={height} viewBox="0 0 48 64" style={{ position: 'absolute' }}>
    <Rect x="12" y="40" width="24" height="5" rx="1" fill={fill} />
    <Rect x="13" y="44" width="10" height="7" rx="2" fill={fill} />
    <Rect x="25" y="44" width="10" height="7" rx="2" fill={fill} />
  </Svg>
);
