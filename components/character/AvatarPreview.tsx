import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import Svg, { Rect, Ellipse, Circle, Path } from 'react-native-svg';
import { SKIN_TONES } from '../../constants/theme';
import { SkinToneId } from '../../types/CustomerTypes';
import { UI, SPACING, FONT, RADIUS } from '../../constants/theme';

interface AvatarConfig {
  skinToneIndex: number;
  hairColor: string;
  eyeColor: string;
  clothingColor?: string;
}

interface Props {
  config: AvatarConfig;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  style?: ViewStyle;
}

const SIZES = { sm: 64, md: 100, lg: 140 } as const;

const TONE_IDS = Object.keys(SKIN_TONES) as SkinToneId[];

/**
 * AvatarPreview — live avatar that updates as the player builds their character.
 * Uses the same layered SVG approach as CharacterAvatar but with a taller
 * canvas to show more detail during onboarding.
 *
 * Canvas is always 60×80 (viewBox), scaled to `size` prop.
 */
export const AvatarPreview = ({ config, size = 'md', showLabel, style }: Props) => {
  const px = SIZES[size];
  const py = Math.round(px * (80 / 60));

  const skin = SKIN_TONES[TONE_IDS[Math.min(config.skinToneIndex, 11)]] ?? '#EBB882';
  const hair = config.hairColor;
  const eye  = config.eyeColor;
  const top  = config.clothingColor ?? '#E8748A';

  return (
    <View style={[styles.wrapper, style]}>
      <View style={[styles.frame, { width: px, height: py }]}>
        <Svg width={px} height={py} viewBox="0 0 60 80">

          {/* Body */}
          <Rect x="18" y="44" width="24" height="26" rx="5" fill={skin} />

          {/* Clothing top */}
          <Rect x="14" y="40" width="32" height="22" rx="6" fill={top} />

          {/* Neck */}
          <Rect x="25" y="34" width="10" height="12" fill={skin} />

          {/* Face */}
          <Ellipse cx="30" cy="26" rx="13" ry="15" fill={skin} />

          {/* Hair — back */}
          <Ellipse cx="30" cy="16" rx="14" ry="12" fill={hair} />

          {/* Eyes */}
          <Ellipse cx="25" cy="25" rx="2.5" ry="2" fill={eye} />
          <Ellipse cx="35" cy="25" rx="2.5" ry="2" fill={eye} />
          {/* Eye shine */}
          <Circle cx="26" cy="24" r="0.8" fill="white" />
          <Circle cx="36" cy="24" r="0.8" fill="white" />

          {/* Nose */}
          <Ellipse cx="30" cy="29" rx="1.2" ry="0.8" fill={skin} opacity={0.6} />

          {/* Mouth */}
          <Path d="M27 33 Q30 36 33 33" stroke="#C87070" strokeWidth="1.2" fill="none" strokeLinecap="round" />

          {/* Hair — front / side pieces */}
          <Ellipse cx="30" cy="12" rx="13" ry="9" fill={hair} />
          <Rect x="17" y="12" width="7" height="16" rx="4" fill={hair} />
          <Rect x="36" y="12" width="7" height="16" rx="4" fill={hair} />

          {/* Arms */}
          <Rect x="7" y="42" width="8" height="16" rx="4" fill={skin} />
          <Rect x="45" y="42" width="8" height="16" rx="4" fill={skin} />

        </Svg>
      </View>
      {showLabel && (
        <Text style={styles.label}>Your look</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper:  { alignItems: 'center' },
  frame: {
    borderRadius: RADIUS.md,
    backgroundColor: '#FFF0F5',
    borderWidth: 1.5,
    borderColor: '#E8B4C0',
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontSize: FONT.xs,
    color: UI.textMuted,
    marginTop: SPACING.xs,
  },
});
