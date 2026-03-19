import React from 'react';
import Svg, { Path, Rect } from 'react-native-svg';

interface Props { fill: string; width?: number; height?: number; }

/** Bottom 09 — Wide-Leg Pants */
export const ClothingBottom09 = ({ fill, width = 48, height = 64 }: Props) => (
  <Svg width={width} height={height} viewBox="0 0 48 64" style={{ position: 'absolute' }}>
    <Rect x="14" y="42" width="20" height="3" fill={fill} />
    <Path d="M14,44 L10,63 L22,63 L22,44 Z" fill={fill} />
    <Path d="M26,44 L26,63 L38,63 L34,44 Z" fill={fill} />
  </Svg>
);
