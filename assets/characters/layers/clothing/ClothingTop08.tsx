import React from 'react';
import Svg, { Path, Rect } from 'react-native-svg';

interface Props { fill: string; width?: number; height?: number; }

/** Top 08 — Button-Down / Collar Shirt */
export const ClothingTop08 = ({ fill, width = 48, height = 64 }: Props) => (
  <Svg width={width} height={height} viewBox="0 0 48 64" style={{ position: 'absolute' }}>
    <Rect x="14" y="26" width="20" height="18" rx="2" fill={fill} />
    <Rect x="8"  y="27" width="6"  height="12" rx="3" fill={fill} />
    <Rect x="34" y="27" width="6"  height="12" rx="3" fill={fill} />
    {/* Small collar points */}
    <Path d="M20,26 L18,23 L24,27 L30,23 L28,26 Z" fill={fill} />
  </Svg>
);
