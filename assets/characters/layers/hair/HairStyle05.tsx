import React from 'react';
import Svg, { Path, Ellipse } from 'react-native-svg';

interface Props {
  fill: string;
  width?: number;
  height?: number;
}

/** Style 05 — Bun / Updo */

export const HairStyle05Back = ({ fill, width = 48, height = 64 }: Props) => (
  <Svg width={width} height={height} viewBox="0 0 48 64" style={{ position: 'absolute' }}>
    {/* Close-cropped back */}
    <Ellipse cx="24" cy="12" rx="8.5" ry="9" fill={fill} />
    {/* Bun mass at top back */}
    <Ellipse cx="24" cy="4" rx="6" ry="5" fill={fill} />
  </Svg>
);

export const HairStyle05Front = ({ fill, width = 48, height = 64 }: Props) => (
  <Svg width={width} height={height} viewBox="0 0 48 64" style={{ position: 'absolute' }}>
    {/* Hair swept upward */}
    <Path d="M16,5 Q24,1 32,5 L31,10 Q24,8 17,10 Z" fill={fill} />
    {/* Bun visible at top */}
    <Ellipse cx="24" cy="3" rx="5" ry="4" fill={fill} />
  </Svg>
);
