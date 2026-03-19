import React from 'react';
import Svg, { Ellipse } from 'react-native-svg';

interface Props {
  fill: string;
  width?: number;
  height?: number;
}

/** Style 03 — Curly / Natural */

export const HairStyle03Back = ({ fill, width = 48, height = 64 }: Props) => (
  <Svg width={width} height={height} viewBox="0 0 48 64" style={{ position: 'absolute' }}>
    {/* Large rounded mass */}
    <Ellipse cx="24" cy="8" rx="12" ry="11" fill={fill} />
    {/* Left volume */}
    <Ellipse cx="14" cy="14" rx="5" ry="6" fill={fill} />
    {/* Right volume */}
    <Ellipse cx="34" cy="14" rx="5" ry="6" fill={fill} />
  </Svg>
);

export const HairStyle03Front = ({ fill, width = 48, height = 64 }: Props) => (
  <Svg width={width} height={height} viewBox="0 0 48 64" style={{ position: 'absolute' }}>
    {/* Curly front bumps */}
    <Ellipse cx="18" cy="5" rx="4.5" ry="4.5" fill={fill} />
    <Ellipse cx="24" cy="3" rx="4" ry="4" fill={fill} />
    <Ellipse cx="30" cy="5" rx="4.5" ry="4.5" fill={fill} />
    <Ellipse cx="15" cy="10" rx="3" ry="3.5" fill={fill} />
    <Ellipse cx="33" cy="10" rx="3" ry="3.5" fill={fill} />
  </Svg>
);
