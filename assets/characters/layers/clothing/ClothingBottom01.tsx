import React from 'react';
import Svg, { Rect } from 'react-native-svg';

interface Props { fill: string; width?: number; height?: number; }

/** Bottom 01 — Jeans / Trousers */
export const ClothingBottom01 = ({ fill, width = 48, height = 64 }: Props) => (
  <Svg width={width} height={height} viewBox="0 0 48 64" style={{ position: 'absolute' }}>
    <Rect x="13" y="42" width="22" height="4"  rx="1" fill={fill} />
    <Rect x="14" y="45" width="9"  height="17" rx="2" fill={fill} />
    <Rect x="25" y="45" width="9"  height="17" rx="2" fill={fill} />
  </Svg>
);
