import React from 'react';
import Svg, { Rect } from 'react-native-svg';

interface Props { fill: string; width?: number; height?: number; }

/** Bottom 04 — Shorts */
export const ClothingBottom04 = ({ fill, width = 48, height = 64 }: Props) => (
  <Svg width={width} height={height} viewBox="0 0 48 64" style={{ position: 'absolute' }}>
    <Rect x="13" y="42" width="22" height="4"  rx="1" fill={fill} />
    <Rect x="14" y="45" width="9"  height="8"  rx="2" fill={fill} />
    <Rect x="25" y="45" width="9"  height="8"  rx="2" fill={fill} />
  </Svg>
);
