import React from 'react';
import Svg, { Path, Ellipse, Rect } from 'react-native-svg';

interface Props {
  fill: string;
  width?: number;
  height?: number;
}

/** Style 06 — Long Wavy */

export const HairStyle06Back = ({ fill, width = 48, height = 64 }: Props) => (
  <Svg width={width} height={height} viewBox="0 0 48 64" style={{ position: 'absolute' }}>
    {/* Main cap */}
    <Ellipse cx="24" cy="9" rx="9" ry="9.5" fill={fill} />
    {/* Back panel */}
    <Rect x="17" y="12" width="14" height="20" fill={fill} />
    {/* Left wavy fall */}
    <Path d="M15,13 Q11,22 14,30 Q11,38 13,46 Q15,50 17,48 Q15,42 17,34 Q15,26 17,18 Z" fill={fill} />
    {/* Right wavy fall */}
    <Path d="M33,13 Q37,22 34,30 Q37,38 35,46 Q33,50 31,48 Q33,42 31,34 Q33,26 31,18 Z" fill={fill} />
  </Svg>
);

export const HairStyle06Front = ({ fill, width = 48, height = 64 }: Props) => (
  <Svg width={width} height={height} viewBox="0 0 48 64" style={{ position: 'absolute' }}>
    {/* Wavy fringe */}
    <Path d="M16,5 Q24,2 32,5 Q29,13 24,11 Q19,13 16,5 Z" fill={fill} />
    {/* Left face-frame wave */}
    <Path d="M15,9 Q13,15 15,20 Q14,14 16,9 Z" fill={fill} />
    {/* Right face-frame wave */}
    <Path d="M33,9 Q35,15 33,20 Q34,14 32,9 Z" fill={fill} />
  </Svg>
);
