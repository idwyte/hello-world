import React from 'react';
import Svg, { Rect } from 'react-native-svg';

interface Props { fill: string; width?: number; height?: number; }

/** Top 06 — Crop Top */
export const ClothingTop06 = ({ fill, width = 48, height = 64 }: Props) => (
  <Svg width={width} height={height} viewBox="0 0 48 64" style={{ position: 'absolute' }}>
    <Rect x="16" y="26" width="16" height="12" rx="3" fill={fill} />
    <Rect x="10" y="27" width="6"  height="8"  rx="3" fill={fill} />
    <Rect x="32" y="27" width="6"  height="8"  rx="3" fill={fill} />
  </Svg>
);
