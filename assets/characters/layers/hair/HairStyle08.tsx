import React from 'react';
import Svg, { Path, Ellipse } from 'react-native-svg';

interface Props {
  fill: string;
  width?: number;
  height?: number;
}

/** Style 08 — Pixie Cut */

export const HairStyle08Back = ({ fill, width = 48, height = 64 }: Props) => (
  <Svg width={width} height={height} viewBox="0 0 48 64" style={{ position: 'absolute' }}>
    {/* Close-cropped cap */}
    <Ellipse cx="24" cy="12" rx="9" ry="9" fill={fill} />
    {/* Left side close crop */}
    <Ellipse cx="16" cy="16" rx="3.5" ry="4" fill={fill} />
    {/* Right side close crop */}
    <Ellipse cx="32" cy="16" rx="3.5" ry="4" fill={fill} />
  </Svg>
);

export const HairStyle08Front = ({ fill, width = 48, height = 64 }: Props) => (
  <Svg width={width} height={height} viewBox="0 0 48 64" style={{ position: 'absolute' }}>
    {/* Short textured fringe with side part */}
    <Path d="M15,4 Q24,1 33,4 Q31,10 26,11 Q24,12 22,11 Q17,10 15,4 Z" fill={fill} />
    {/* Top of pixie */}
    <Ellipse cx="24" cy="4" rx="7" ry="4" fill={fill} />
  </Svg>
);
