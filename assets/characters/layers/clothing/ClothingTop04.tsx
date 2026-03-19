import React from 'react';
import Svg, { Path, Rect } from 'react-native-svg';

interface Props { fill: string; width?: number; height?: number; }

/** Top 04 — Hoodie */
export const ClothingTop04 = ({ fill, width = 48, height = 64 }: Props) => (
  <Svg width={width} height={height} viewBox="0 0 48 64" style={{ position: 'absolute' }}>
    {/* Hood collar visible at neckline */}
    <Path d="M16,23 Q24,18 32,23 L32,28 Q24,25 16,28 Z" fill={fill} />
    <Rect x="12" y="26" width="24" height="18" rx="4" fill={fill} />
    <Path d="M12,27 L6,28 L4,44 L9,44 L11,30 Z"  fill={fill} />
    <Path d="M36,27 L42,28 L44,44 L39,44 L37,30 Z" fill={fill} />
  </Svg>
);
