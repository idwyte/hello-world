import React from 'react';
import Svg, { Path, Rect } from 'react-native-svg';

interface Props { fill: string; width?: number; height?: number; }

/** Top 11 — Ruffle / Flounce Top */
export const ClothingTop11 = ({ fill, width = 48, height = 64 }: Props) => (
  <Svg width={width} height={height} viewBox="0 0 48 64" style={{ position: 'absolute' }}>
    <Rect x="14" y="26" width="20" height="12" rx="3" fill={fill} />
    <Rect x="8"  y="27" width="6"  height="8"  rx="3" fill={fill} />
    <Rect x="34" y="27" width="6"  height="8"  rx="3" fill={fill} />
    {/* Ruffle layer at hem */}
    <Path d="M11,38 Q16,42 21,38 Q26,42 31,38 Q36,42 37,38 L37,44 Q32,47 27,44 Q22,47 17,44 Q12,47 11,44 Z" fill={fill} />
  </Svg>
);
