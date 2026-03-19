import React from 'react';
import Svg, { Rect } from 'react-native-svg';

interface Props { fill: string; width?: number; height?: number; }

/** Top 01 — Crew-neck Tee */
export const ClothingTop01 = ({ fill, width = 48, height = 64 }: Props) => (
  <Svg width={width} height={height} viewBox="0 0 48 64" style={{ position: 'absolute' }}>
    <Rect x="14" y="26" width="20" height="18" rx="3" fill={fill} />
    <Rect x="8"  y="27" width="6"  height="10" rx="3" fill={fill} />
    <Rect x="34" y="27" width="6"  height="10" rx="3" fill={fill} />
  </Svg>
);
