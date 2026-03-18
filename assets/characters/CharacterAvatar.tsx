import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import Svg, { Rect, Ellipse, Circle } from 'react-native-svg';
import { CustomerConfig } from '../../types/CustomerTypes';
import { SKIN_TONES } from '../../constants/theme';

interface Props {
  config: Pick<
    CustomerConfig,
    | 'skinTone'
    | 'hairColor'
    | 'clothingTopColor'
    | 'clothingBottomColor'
    | 'expression'
  >;
  width?: number;
  height?: number;
  style?: ViewStyle;
}

/**
 * CharacterAvatar — placeholder SVG character composed of layered shapes.
 * Replace each layer with AI-generated SVG components when art is ready.
 * Each layer accepts a `fill` prop for programmatic color control.
 */
export const CharacterAvatar = ({ config, width = 48, height = 64, style }: Props) => {
  const skin = SKIN_TONES[config.skinTone];
  const hair = config.hairColor;
  const top  = config.clothingTopColor;
  const bot  = config.clothingBottomColor;

  const vb = '0 0 48 64';

  return (
    <View style={[{ width, height }, style]}>
      <Svg width={width} height={height} viewBox={vb}>

        {/* LAYER 0: Body base */}
        <Rect x="14" y="28" width="20" height="22" rx="4" fill={skin} />

        {/* LAYER 1: Clothing bottom */}
        <Rect x="13" y="42" width="22" height="14" rx="3" fill={bot} />

        {/* LAYER 2: Clothing top */}
        <Rect x="12" y="26" width="24" height="18" rx="4" fill={top} />

        {/* LAYER 3: Neck */}
        <Rect x="20" y="20" width="8" height="10" fill={skin} />

        {/* LAYER 3: Face base */}
        <Ellipse cx="24" cy="16" rx="10" ry="12" fill={skin} />

        {/* LAYER 5: Hair back */}
        <Ellipse cx="24" cy="10" rx="11" ry="9" fill={hair} />

        {/* LAYER 4: Face features — expression */}
        {config.expression === 'happy' || config.expression === 'delighted' ? (
          <>
            <Circle cx="20" cy="15" r="1.5" fill="#3D2B1F" />
            <Circle cx="28" cy="15" r="1.5" fill="#3D2B1F" />
            <Ellipse cx="24" cy="19" rx="3" ry="1.5" fill="#C87070" />
          </>
        ) : config.expression === 'impatient' || config.expression === 'disappointed' ? (
          <>
            <Circle cx="20" cy="15" r="1.5" fill="#3D2B1F" />
            <Circle cx="28" cy="15" r="1.5" fill="#3D2B1F" />
            <Rect x="21" y="19" width="6" height="1.5" rx="1" fill="#C87070" />
          </>
        ) : (
          <>
            <Circle cx="20" cy="15" r="1.5" fill="#3D2B1F" />
            <Circle cx="28" cy="15" r="1.5" fill="#3D2B1F" />
            <Ellipse cx="24" cy="19" rx="2.5" ry="1" fill="#C87070" />
          </>
        )}

        {/* LAYER 6: Hair front */}
        <Ellipse cx="24" cy="6" rx="10" ry="7" fill={hair} />
        <Rect x="14" y="6" width="6" height="12" rx="3" fill={hair} />
        <Rect x="28" y="6" width="6" height="12" rx="3" fill={hair} />

        {/* LAYER 8: Nails (visible arms) */}
        <Rect x="8" y="30" width="6" height="12" rx="3" fill={skin} />
        <Rect x="34" y="30" width="6" height="12" rx="3" fill={skin} />

      </Svg>
    </View>
  );
};
