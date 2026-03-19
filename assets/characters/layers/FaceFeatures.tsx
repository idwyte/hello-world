import React from 'react';
import Svg, { Circle, Ellipse, Rect, Path } from 'react-native-svg';
import { ExpressionType } from '../../../types/CustomerTypes';

interface Props {
  expression: ExpressionType;
  width?: number;
  height?: number;
}

const EYE_COLOR = '#3D2B1F';
const MOUTH_PINK = '#C87070';
const BLUSH = '#F0A0A0';

export const FaceFeatures = ({ expression, width = 48, height = 64 }: Props) => {
  const isHappy    = expression === 'happy' || expression === 'delighted' || expression === 'excited';
  const isNeutral  = expression === 'neutral' || expression === 'thinking';
  const isSad      = expression === 'impatient' || expression === 'disappointed';

  return (
    <Svg width={width} height={height} viewBox="0 0 48 64" style={{ position: 'absolute' }}>
      {/* Eyes */}
      <Circle cx="20" cy="14" r="1.5" fill={EYE_COLOR} />
      <Circle cx="28" cy="14" r="1.5" fill={EYE_COLOR} />

      {/* Blush — only on happy/excited expressions */}
      {isHappy && (
        <>
          <Ellipse cx="17" cy="17" rx="2.5" ry="1.2" fill={BLUSH} opacity="0.5" />
          <Ellipse cx="31" cy="17" rx="2.5" ry="1.2" fill={BLUSH} opacity="0.5" />
        </>
      )}

      {/* Mouth shape varies by expression */}
      {isHappy  && <Ellipse cx="24" cy="19" rx="3"   ry="1.5" fill={MOUTH_PINK} />}
      {isNeutral && <Ellipse cx="24" cy="19" rx="2.5" ry="1"   fill={MOUTH_PINK} />}
      {isSad    && <Rect    x="21"  y="19"  width="6" height="1.5" rx="1" fill={MOUTH_PINK} />}

      {/* Thinking — small pursed mouth */}
      {expression === 'thinking' && (
        <Ellipse cx="24" cy="19" rx="2" ry="1" fill={MOUTH_PINK} />
      )}

      {/* Excited — open mouth */}
      {expression === 'excited' && (
        <Ellipse cx="24" cy="19.5" rx="3" ry="2" fill={MOUTH_PINK} />
      )}
    </Svg>
  );
};
