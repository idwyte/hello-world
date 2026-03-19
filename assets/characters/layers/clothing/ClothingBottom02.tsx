import React from 'react';
import Svg, { Path } from 'react-native-svg';

interface Props { fill: string; width?: number; height?: number; }

/** Bottom 02 — Mini Skirt */
export const ClothingBottom02 = ({ fill, width = 48, height = 64 }: Props) => (
  <Svg width={width} height={height} viewBox="0 0 48 64" style={{ position: 'absolute' }}>
    <Path d="M13,42 L35,42 L37,54 L11,54 Z" fill={fill} />
  </Svg>
);
