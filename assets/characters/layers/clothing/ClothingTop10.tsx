import React from 'react';
import Svg, { Rect } from 'react-native-svg';

interface Props { fill: string; width?: number; height?: number; }

/** Top 10 — Sports / Athletic Top */
export const ClothingTop10 = ({ fill, width = 48, height = 64 }: Props) => (
  <Svg width={width} height={height} viewBox="0 0 48 64" style={{ position: 'absolute' }}>
    <Rect x="16" y="26" width="16" height="16" rx="2" fill={fill} />
    {/* Racerback-style straps */}
    <Rect x="17" y="23" width="4" height="6" fill={fill} />
    <Rect x="27" y="23" width="4" height="6" fill={fill} />
  </Svg>
);
