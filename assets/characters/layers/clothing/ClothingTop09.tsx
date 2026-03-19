import React from 'react';
import Svg, { Rect } from 'react-native-svg';

interface Props { fill: string; width?: number; height?: number; }

/** Top 09 — Cardigan (open front) */
export const ClothingTop09 = ({ fill, width = 48, height = 64 }: Props) => (
  <Svg width={width} height={height} viewBox="0 0 48 64" style={{ position: 'absolute' }}>
    {/* Back fill */}
    <Rect x="16" y="26" width="16" height="18" fill={fill} />
    {/* Left front panel */}
    <Rect x="14" y="26" width="8" height="18" rx="2" fill={fill} />
    {/* Right front panel */}
    <Rect x="26" y="26" width="8" height="18" rx="2" fill={fill} />
    {/* Sleeves */}
    <Rect x="8"  y="27" width="6" height="14" rx="3" fill={fill} />
    <Rect x="34" y="27" width="6" height="14" rx="3" fill={fill} />
  </Svg>
);
