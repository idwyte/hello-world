import React from 'react';
import Svg, { Path, Rect } from 'react-native-svg';

interface Props { fill: string; width?: number; height?: number; }

/** Bottom 06 — Dress Pants (fitted) */
export const ClothingBottom06 = ({ fill, width = 48, height = 64 }: Props) => (
  <Svg width={width} height={height} viewBox="0 0 48 64" style={{ position: 'absolute' }}>
    <Rect x="14" y="42" width="20" height="3" fill={fill} />
    <Path d="M14,44 L16,63 L23,63 L22,44 Z" fill={fill} />
    <Path d="M26,44 L25,63 L32,63 L34,44 Z" fill={fill} />
  </Svg>
);
