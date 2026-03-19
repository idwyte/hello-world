import React from 'react';
import Svg, { Path, Ellipse, Rect } from 'react-native-svg';

interface Props {
  fill: string;
  width?: number;
  height?: number;
}

/** Style 01 — Short Bob */

export const HairStyle01Back = ({ fill, width = 48, height = 64 }: Props) => (
  <Svg width={width} height={height} viewBox="0 0 48 64" style={{ position: 'absolute' }}>
    {/* Main cap */}
    <Ellipse cx="24" cy="10" rx="9.5" ry="10.5" fill={fill} />
    {/* Left bob side */}
    <Rect x="14.5" y="14" width="4" height="8" rx="2" fill={fill} />
    {/* Right bob side */}
    <Rect x="29.5" y="14" width="4" height="8" rx="2" fill={fill} />
  </Svg>
);

export const HairStyle01Front = ({ fill, width = 48, height = 64 }: Props) => (
  <Svg width={width} height={height} viewBox="0 0 48 64" style={{ position: 'absolute' }}>
    {/* Front fringe / bangs */}
    <Path d="M15,4 Q24,0 33,4 Q29,14 24,12 Q19,14 15,4 Z" fill={fill} />
  </Svg>
);
