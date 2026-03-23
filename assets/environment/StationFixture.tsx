import React from 'react';
import { View } from 'react-native';
import Svg, { Rect, Ellipse, Circle, Polygon, G } from 'react-native-svg';
import { SALON, UI } from '../../constants/theme';

interface Props {
  x: number;
  y: number;
  fixtureWidth: number;
  tier: 1 | 2 | 3;
}

const FIXTURE_H = 110;

export const StationFixture = ({ x, y, fixtureWidth, tier }: Props) => {
  const fw = fixtureWidth;
  const tableTop = 22;
  const tableH = 28;
  const chairY = tableTop + tableH + 10;
  const chairW = fw * 0.5;
  const chairX = (fw - chairW) / 2;

  return (
    <View style={{ position: 'absolute', left: x, top: y }}>
      <Svg width={fw} height={FIXTURE_H} viewBox={`0 0 ${fw} ${FIXTURE_H}`}>

        {/* ── Table ──────────────────────────────────────────────────── */}
        {/* Legs */}
        <Rect x={6}      y={tableTop + tableH} width={6} height={16} rx={2} fill={SALON.furniture} />
        <Rect x={fw - 12} y={tableTop + tableH} width={6} height={16} rx={2} fill={SALON.furniture} />

        {/* Tabletop */}
        <Rect x={2} y={tableTop} width={fw - 4} height={tableH} rx={4}
          fill={SALON.furnitureLight} stroke={SALON.furniture} strokeWidth={1.5}
        />

        {/* Tier 2+: UV lamp */}
        {tier >= 2 && (
          <G>
            <Rect x={fw * 0.10} y={tableTop + 6} width={fw * 0.22} height={12} rx={3} fill="#85C1E9" />
            <Ellipse cx={fw * 0.21} cy={tableTop + 12} rx={7} ry={4} fill="white" opacity={0.4} />
          </G>
        )}

        {/* Tier 2+: polish bottle */}
        {tier >= 2 && (
          <G>
            <Rect x={fw * 0.40} y={tableTop + 8} width={8} height={14} rx={2} fill={UI.btnActive} />
            <Ellipse cx={fw * 0.40 + 4} cy={tableTop + 7} rx={3} ry={3} fill={UI.btnHover} />
          </G>
        )}

        {/* Tier 3: nail drill */}
        {tier >= 3 && (
          <G>
            <Rect x={fw * 0.60} y={tableTop + 7} width={fw * 0.20} height={10} rx={3} fill="#AEB6BF" />
            <Circle cx={fw * 0.60 + 4} cy={tableTop + 12} r={4} fill="#7F8C8D" />
          </G>
        )}

        {/* Tier 3: gold star */}
        {tier >= 3 && (
          <Polygon
            points={`${fw * 0.85},${tableTop + 4} ${fw * 0.87},${tableTop + 10} ${fw * 0.92},${tableTop + 10} ${fw * 0.88},${tableTop + 14} ${fw * 0.90},${tableTop + 20} ${fw * 0.85},${tableTop + 16} ${fw * 0.80},${tableTop + 20} ${fw * 0.82},${tableTop + 14} ${fw * 0.78},${tableTop + 10} ${fw * 0.83},${tableTop + 10}`}
            fill={UI.gold}
          />
        )}

        {/* ── Client chair ───────────────────────────────────────────── */}
        {/* Chair back */}
        <Rect x={chairX} y={chairY} width={chairW} height={14} rx={5} fill={SALON.accentLavender} />
        {/* Seat */}
        <Rect x={chairX - 4} y={chairY + 12} width={chairW + 8} height={16} rx={5}
          fill={SALON.accentLavender} stroke={SALON.furniture} strokeWidth={1}
        />
        {/* Chair legs */}
        <Rect x={chairX}           y={chairY + 26} width={5} height={8} rx={2} fill={SALON.furniture} />
        <Rect x={chairX + chairW - 5} y={chairY + 26} width={5} height={8} rx={2} fill={SALON.furniture} />

        {/* VIP border glow for tier 3 */}
        {tier === 3 && (
          <Rect x={0} y={0} width={fw} height={FIXTURE_H}
            fill="none" stroke={UI.gold} strokeWidth={1.5} rx={4} opacity={0.5}
          />
        )}
      </Svg>
    </View>
  );
};
