import React from 'react';
import Svg, { Path, Ellipse } from 'react-native-svg';

interface Props {
  fill: string;
  width?: number;
  height?: number;
}

/** Style 04 — High Ponytail */

export const HairStyle04Back = ({ fill, width = 48, height = 64 }: Props) => (
  <Svg width={width} height={height} viewBox="0 0 48 64" style={{ position: 'absolute' }}>
    {/* Main cap */}
    <Ellipse cx="24" cy="9" rx="9" ry="9.5" fill={fill} />
    {/* Ponytail bump above head */}
    <Ellipse cx="24" cy="3" rx="4" ry="4" fill={fill} />
    {/* Ponytail body draping down the back */}
    <Path d="M20,14 Q17,24 17,38 Q18,44 21,44 Q25,44 27,44 Q30,44 31,38 Q31,24 28,14 Z" fill={fill} />
  </Svg>
);

export const HairStyle04Front = ({ fill, width = 48, height = 64 }: Props) => (
  <Svg width={width} height={height} viewBox="0 0 48 64" style={{ position: 'absolute' }}>
    {/* Smooth pulled-back top */}
    <Path d="M16,5 Q24,2 32,5 L31,11 Q24,9 17,11 Z" fill={fill} />
  </Svg>
);
