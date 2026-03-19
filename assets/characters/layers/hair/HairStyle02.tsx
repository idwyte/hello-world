import React from 'react';
import Svg, { Path, Ellipse, Rect } from 'react-native-svg';

interface Props {
  fill: string;
  width?: number;
  height?: number;
}

/** Style 02 — Long Straight */

export const HairStyle02Back = ({ fill, width = 48, height = 64 }: Props) => (
  <Svg width={width} height={height} viewBox="0 0 48 64" style={{ position: 'absolute' }}>
    {/* Main cap */}
    <Ellipse cx="24" cy="9" rx="9" ry="9.5" fill={fill} />
    {/* Back panel */}
    <Rect x="17" y="12" width="14" height="22" fill={fill} />
    {/* Left panel extending down */}
    <Rect x="15" y="12" width="6" height="28" rx="3" fill={fill} />
    {/* Right panel extending down */}
    <Rect x="27" y="12" width="6" height="28" rx="3" fill={fill} />
  </Svg>
);

export const HairStyle02Front = ({ fill, width = 48, height = 64 }: Props) => (
  <Svg width={width} height={height} viewBox="0 0 48 64" style={{ position: 'absolute' }}>
    {/* Straight-cut bangs */}
    <Rect x="17" y="4" width="14" height="10" rx="1" fill={fill} />
    {/* Left face frame */}
    <Rect x="15" y="8" width="4" height="20" rx="2" fill={fill} />
    {/* Right face frame */}
    <Rect x="29" y="8" width="4" height="20" rx="2" fill={fill} />
  </Svg>
);
