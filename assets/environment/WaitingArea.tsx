import React from 'react';
import { View } from 'react-native';
import Svg, { Rect, Line, G } from 'react-native-svg';
import { SALON } from '../../constants/theme';

interface Props {
  x: number;
  y: number;
  width: number;
}

const SOFA_H = 54;

export const WaitingArea = ({ x, y, width }: Props) => {
  const w = width;

  return (
    <View style={{ position: 'absolute', left: x, top: y }}>
      <Svg width={w + 36} height={SOFA_H + 16} viewBox={`0 0 ${w + 36} ${SOFA_H + 16}`}>

        {/* ── Sofa ────────────────────────────────────────────────────── */}
        {/* Back */}
        <Rect x={14} y={0} width={w - 28} height={20} rx={6} fill={SALON.accentLavender} />
        {/* Seat */}
        <Rect x={10} y={18} width={w - 20} height={24} rx={6}
          fill={SALON.accentLavender} stroke={SALON.furniture} strokeWidth={1}
        />

        {/* Seat cushion dividers */}
        <Line x1={w * 0.33} y1={20} x2={w * 0.33} y2={40} stroke={SALON.furniture} strokeWidth={1} opacity={0.3} />
        <Line x1={w * 0.66} y1={20} x2={w * 0.66} y2={40} stroke={SALON.furniture} strokeWidth={1} opacity={0.3} />

        {/* Left armrest */}
        <Rect x={0} y={10} width={14} height={30} rx={4} fill={SALON.furniture} />
        {/* Right armrest */}
        <Rect x={w - 14} y={10} width={14} height={30} rx={4} fill={SALON.furniture} />

        {/* Legs */}
        <Rect x={14}     y={40} width={6} height={10} rx={2} fill={SALON.furniture} />
        <Rect x={w - 20} y={40} width={6} height={10} rx={2} fill={SALON.furniture} />

        {/* ── Side table ──────────────────────────────────────────────── */}
        <G>
          {/* Table top */}
          <Rect x={w} y={22} width={28} height={14} rx={3}
            fill={SALON.furnitureLight} stroke={SALON.furniture} strokeWidth={1}
          />
          {/* Leg */}
          <Rect x={w + 11} y={34} width={6} height={8} rx={2} fill={SALON.furniture} />
          {/* Magazine stack */}
          <Rect x={w + 3} y={18} width={20} height={5} rx={1} fill={SALON.accentSage} opacity={0.8} />
          <Rect x={w + 5} y={15} width={16} height={5} rx={1} fill={SALON.accentLavender} opacity={0.8} />
        </G>
      </Svg>
    </View>
  );
};
