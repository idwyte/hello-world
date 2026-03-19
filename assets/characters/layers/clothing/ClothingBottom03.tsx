import React from 'react';
import Svg, { Path } from 'react-native-svg';

interface Props { fill: string; width?: number; height?: number; }

/** Bottom 03 — Midi Skirt */
export const ClothingBottom03 = ({ fill, width = 48, height = 64 }: Props) => (
  <Svg width={width} height={height} viewBox="0 0 48 64" style={{ position: 'absolute' }}>
    <Path d="M12,42 L36,42 L40,62 L8,62 Z" fill={fill} />
  </Svg>
);
