import React from 'react';
import Svg, { Rect } from 'react-native-svg';

interface Props { fill: string; width?: number; height?: number; }

/** Top 12 — Turtleneck */
export const ClothingTop12 = ({ fill, width = 48, height = 64 }: Props) => (
  <Svg width={width} height={height} viewBox="0 0 48 64" style={{ position: 'absolute' }}>
    {/* High collar going up to chin */}
    <Rect x="18" y="18" width="12" height="10" rx="4" fill={fill} />
    <Rect x="14" y="26" width="20" height="18" rx="2" fill={fill} />
    <Rect x="8"  y="27" width="6"  height="10" rx="3" fill={fill} />
    <Rect x="34" y="27" width="6"  height="10" rx="3" fill={fill} />
  </Svg>
);
