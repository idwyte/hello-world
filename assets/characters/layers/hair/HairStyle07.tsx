import React from 'react';
import Svg, { Path, Ellipse, Rect } from 'react-native-svg';

interface Props {
  fill: string;
  width?: number;
  height?: number;
}

/** Style 07 — Braids */

export const HairStyle07Back = ({ fill, width = 48, height = 64 }: Props) => (
  <Svg width={width} height={height} viewBox="0 0 48 64" style={{ position: 'absolute' }}>
    {/* Main cap */}
    <Ellipse cx="24" cy="9" rx="9" ry="9.5" fill={fill} />
    {/* Left braid hanging down */}
    <Path d="M17,15 L15,22 L13,32 L11,42 L12,48 L16,47 L15,39 L16,28 L17,20 Z" fill={fill} />
    {/* Right braid hanging down */}
    <Path d="M31,15 L33,22 L35,32 L37,42 L36,48 L32,47 L33,39 L32,28 L31,20 Z" fill={fill} />
  </Svg>
);

export const HairStyle07Front = ({ fill, width = 48, height = 64 }: Props) => (
  <Svg width={width} height={height} viewBox="0 0 48 64" style={{ position: 'absolute' }}>
    {/* Left braid top section */}
    <Rect x="17" y="4" width="4" height="13" rx="2" fill={fill} />
    {/* Right braid top section */}
    <Rect x="27" y="4" width="4" height="13" rx="2" fill={fill} />
    {/* Center parting strip */}
    <Rect x="21" y="4" width="6" height="4" fill={fill} />
  </Svg>
);
