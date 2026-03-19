import React from 'react';
import { View, ViewStyle } from 'react-native';
import Svg, { Rect, Ellipse, Circle } from 'react-native-svg';
import { CustomerConfig } from '../../types/CustomerTypes';
import { SKIN_TONES } from '../../constants/theme';
import {
  BODY_COMPONENTS,
  HAIR_COMPONENTS,
  CLOTHING_TOP_COMPONENTS,
  CLOTHING_BOTTOM_COMPONENTS,
} from './characterIndex';

// FaceFeatures is imported only when the generated file exists.
// Uncomment once `node scripts/generate-character-assets.js --batch=face` has run.
// import { FaceFeatures } from './layers/FaceFeatures';

// Accessories is imported only when the generated file exists.
// import { Accessories } from './layers/Accessories';

interface Props {
  config: Pick<
    CustomerConfig,
    | 'skinTone'
    | 'hairColor'
    | 'hairStyle'
    | 'bodyArchetype'
    | 'clothingTopColor'
    | 'clothingTopStyle'
    | 'clothingBottomColor'
    | 'clothingBottomStyle'
    | 'accessories'
    | 'expression'
  >;
  /** Optional nail polish color — applied to finger tips on generated body components */
  nailColor?: string;
  width?: number;
  height?: number;
  style?: ViewStyle;
}

/**
 * CharacterAvatar
 *
 * Layered SVG character system.  Each layer is a separate component so skin
 * tone, hair color, and clothing color are controlled entirely via props —
 * no duplicate assets per color variant.
 *
 * Layer render order (bottom → top):
 *   0. BodyBase      (skin fill)
 *   1. ClothingBottom (clothing color)
 *   2. ClothingTop   (clothing color)
 *   3. HairBack      (hair color)  ← renders behind face
 *   4. FaceFeatures  (expression)
 *   5. HairFront     (hair color)  ← renders over face
 *   6. Accessories   (fixed paths)
 *
 * Generated components are used when available; placeholder shapes are shown
 * while generation is pending.  Run the generator once to replace all placeholders:
 *
 *   node scripts/generate-character-assets.js
 *
 * Then uncomment the imports in characterIndex.ts as each batch completes.
 */
export const CharacterAvatar = ({
  config,
  nailColor,
  width = 48,
  height = 64,
  style,
}: Props) => {
  const skin = SKIN_TONES[config.skinTone];
  const hair = config.hairColor;
  const top  = config.clothingTopColor;
  const bot  = config.clothingBottomColor;

  // ── Resolve generated components (undefined = use placeholder) ──────────
  const BodyComp        = BODY_COMPONENTS[config.bodyArchetype];
  const hairPair        = HAIR_COMPONENTS[config.hairStyle];
  const HairBackComp    = hairPair?.Back;
  const HairFrontComp   = hairPair?.Front;
  const TopComp         = CLOTHING_TOP_COMPONENTS[config.clothingTopStyle];
  const BottomComp      = CLOTHING_BOTTOM_COMPONENTS[config.clothingBottomStyle];

  return (
    <View style={[{ width, height }, style]}>

      {/* ── LAYER 0: Body base ─────────────────────────────────────────── */}
      {BodyComp ? (
        <BodyComp fill={skin} nailFill={nailColor ?? skin} width={width} height={height} />
      ) : (
        <Svg width={width} height={height} viewBox="0 0 48 64">
          <Rect x="14" y="28" width="20" height="22" rx="4" fill={skin} />
          <Rect x="20" y="20" width="8"  height="10" fill={skin} />
          {/* Arms */}
          <Rect x="8"  y="30" width="6"  height="12" rx="3" fill={skin} />
          <Rect x="34" y="30" width="6"  height="12" rx="3" fill={skin} />
        </Svg>
      )}

      {/* ── LAYER 1: Clothing bottom ───────────────────────────────────── */}
      {BottomComp ? (
        <BottomComp fill={bot} width={width} height={height} />
      ) : (
        <Svg width={width} height={height} viewBox="0 0 48 64" style={{ position: 'absolute' }}>
          <Rect x="13" y="42" width="22" height="14" rx="3" fill={bot} />
        </Svg>
      )}

      {/* ── LAYER 2: Clothing top ──────────────────────────────────────── */}
      {TopComp ? (
        <TopComp fill={top} width={width} height={height} />
      ) : (
        <Svg width={width} height={height} viewBox="0 0 48 64" style={{ position: 'absolute' }}>
          <Rect x="12" y="26" width="24" height="18" rx="4" fill={top} />
        </Svg>
      )}

      {/* ── LAYER 3: Face base (always placeholder; part of BodyBase in real art) */}
      {!BodyComp && (
        <Svg width={width} height={height} viewBox="0 0 48 64" style={{ position: 'absolute' }}>
          <Ellipse cx="24" cy="16" rx="10" ry="12" fill={skin} />
        </Svg>
      )}

      {/* ── LAYER 4: Hair back ─────────────────────────────────────────── */}
      {HairBackComp ? (
        <HairBackComp fill={hair} width={width} height={height} />
      ) : (
        <Svg width={width} height={height} viewBox="0 0 48 64" style={{ position: 'absolute' }}>
          <Ellipse cx="24" cy="10" rx="11" ry="9" fill={hair} />
        </Svg>
      )}

      {/* ── LAYER 5: Face features ─────────────────────────────────────── */}
      {/* Uncomment when generated: */}
      {/* <FaceFeatures expression={config.expression} width={width} height={height} /> */}
      <Svg width={width} height={height} viewBox="0 0 48 64" style={{ position: 'absolute' }}>
        {/* Placeholder eyes */}
        <Circle cx="20" cy="15" r="1.5" fill="#3D2B1F" />
        <Circle cx="28" cy="15" r="1.5" fill="#3D2B1F" />
        {/* Placeholder mouth — shape varies by expression */}
        {(config.expression === 'happy' || config.expression === 'delighted' || config.expression === 'excited') ? (
          <Ellipse cx="24" cy="19" rx="3" ry="1.5" fill="#C87070" />
        ) : (config.expression === 'impatient' || config.expression === 'disappointed') ? (
          <Rect x="21" y="19" width="6" height="1.5" rx="1" fill="#C87070" />
        ) : (
          <Ellipse cx="24" cy="19" rx="2.5" ry="1" fill="#C87070" />
        )}
      </Svg>

      {/* ── LAYER 6: Hair front ────────────────────────────────────────── */}
      {HairFrontComp ? (
        <HairFrontComp fill={hair} width={width} height={height} />
      ) : (
        <Svg width={width} height={height} viewBox="0 0 48 64" style={{ position: 'absolute' }}>
          <Ellipse cx="24" cy="6"  rx="10" ry="7"  fill={hair} />
          <Rect   x="14"  y="6"  width="6"  height="12" rx="3" fill={hair} />
          <Rect   x="28"  y="6"  width="6"  height="12" rx="3" fill={hair} />
        </Svg>
      )}

      {/* ── LAYER 7: Accessories ──────────────────────────────────────── */}
      {/* Uncomment when generated: */}
      {/* {config.accessories.length > 0 && (
        <Accessories items={config.accessories} width={width} height={height} />
      )} */}

    </View>
  );
};
