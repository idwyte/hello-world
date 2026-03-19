import React from 'react';
import Svg, { Rect } from 'react-native-svg';

interface Props { fill: string; width?: number; height?: number; }

/** Top 02 — Tank / Cami */
export const ClothingTop02 = ({ fill, width = 48, height = 64 }: Props) => (
  <Svg width={width} height={height} viewBox="0 0 48 64" style={{ position: 'absolute' }}>
    <Rect x="17" y="26" width="14" height="18" rx="2" fill={fill} />
    {/* Shoulder straps */}
    <Rect x="18" y="23" width="3" height="5" fill={fill} />
    <Rect x="27" y="23" width="3" height="5" fill={fill} />
  </Svg>
);
