import React from 'react';
import Svg, {
  Rect, Line, Ellipse, Circle, G, Text as SvgText, Path,
} from 'react-native-svg';
import { SALON, UI } from '../../constants/theme';

interface Props {
  width: number;
  height: number;
}

export const ShopBackground = ({ width, height }: Props) => {
  const wallH = height * 0.72;
  const floorY = wallH;
  const floorH = height - wallH;

  // Window helper
  const Window = ({ cx, cy }: { cx: number; cy: number }) => {
    const ww = 70; const wh = 90;
    return (
      <G>
        <Rect x={cx - ww / 2 - 3} y={cy - wh / 2 - 3} width={ww + 6} height={wh + 6} rx={3} fill={SALON.furniture} />
        <Rect x={cx - ww / 2} y={cy - wh / 2} width={ww} height={wh} fill="#D6EAF8" />
        <Line x1={cx} y1={cy - wh / 2} x2={cx} y2={cy + wh / 2} stroke="white" strokeWidth={2} />
        <Line x1={cx - ww / 2} y1={cy} x2={cx + ww / 2} y2={cy} stroke="white" strokeWidth={2} />
        {/* Sill */}
        <Rect x={cx - ww / 2 - 4} y={cy + wh / 2 + 3} width={ww + 8} height={6} rx={2} fill={SALON.furniture} />
      </G>
    );
  };

  return (
    <Svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
      {/* ── Back wall ──────────────────────────────────────────────────── */}
      <Rect x={0} y={0} width={width} height={wallH} fill={SALON.wallRose} />

      {/* Ceiling cornice */}
      <Rect x={0} y={0} width={width} height={8} fill={SALON.floorGrout} opacity={0.5} />

      {/* Wall gradient tint strip (lower wall feels warmer) */}
      <Rect x={0} y={wallH - 30} width={width} height={30} fill="#F9A8D4" opacity={0.15} />

      {/* ── Decorative mirror ─────────────────────────────────────────── */}
      <Ellipse
        cx={width * 0.50} cy={height * 0.18}
        rx={38} ry={46}
        fill="none"
        stroke={SALON.furniture}
        strokeWidth={4}
      />
      <Ellipse
        cx={width * 0.50} cy={height * 0.18}
        rx={32} ry={40}
        fill="#F0E6FF"
        opacity={0.6}
      />
      {/* Mirror shine */}
      <Ellipse cx={width * 0.50 - 10} cy={height * 0.10} rx={6} ry={3} fill="white" opacity={0.5} />

      {/* ── Windows ───────────────────────────────────────────────────── */}
      <Window cx={width * 0.35} cy={height * 0.20} />
      <Window cx={width * 0.65} cy={height * 0.20} />

      {/* ── Floor ─────────────────────────────────────────────────────── */}
      <Rect x={0} y={floorY} width={width} height={floorH} fill={SALON.floorBlush} />

      {/* Baseboard */}
      <Rect x={0} y={floorY} width={width} height={5} fill={SALON.floorGrout} opacity={0.7} />

      {/* Floor grout — horizontal */}
      {[0.25, 0.55, 0.80].map((frac, i) => (
        <Line
          key={`hg${i}`}
          x1={0} y1={floorY + floorH * frac}
          x2={width} y2={floorY + floorH * frac}
          stroke={SALON.floorGrout}
          strokeWidth={1}
          opacity={0.45}
        />
      ))}

      {/* Floor grout — vertical */}
      {Array.from({ length: 8 }, (_, i) => (
        <Line
          key={`vg${i}`}
          x1={(width / 8) * i} y1={floorY}
          x2={(width / 8) * i} y2={height}
          stroke={SALON.floorGrout}
          strokeWidth={1}
          opacity={0.35}
        />
      ))}

      {/* ── Door (left wall) ──────────────────────────────────────────── */}
      {/* Frame */}
      <Rect x={0} y={height * 0.18} width={52} height={height * 0.58} fill={SALON.furniture} />
      {/* Door panel */}
      <Rect x={4} y={height * 0.20} width={42} height={height * 0.54} rx={2} fill={SALON.wallCream} />
      {/* Glass */}
      <Rect x={8} y={height * 0.22} width={34} height={height * 0.28} fill="#AED6F1" opacity={0.5} />
      {/* OPEN sign */}
      <Rect x={12} y={height * 0.27} width={26} height={14} rx={3} fill={UI.success} />
      <SvgText x={25} y={height * 0.27 + 10} fontSize={8} fill="white" textAnchor="middle" fontWeight="700">
        OPEN
      </SvgText>
      {/* Handle */}
      <Circle cx={43} cy={height * 0.47} r={4} fill={SALON.furniture} />
      <Rect x={41} y={height * 0.44} width={4} height={12} rx={2} fill={SALON.accentSage} />

      {/* ── Reception counter (right side) ──────────────────────────── */}
      <Rect
        x={width * 0.80} y={height * 0.15}
        width={width * 0.19} height={height * 0.50}
        rx={4} fill={SALON.furniture}
      />
      {/* Desktop surface */}
      <Rect
        x={width * 0.80 + 2} y={height * 0.15}
        width={width * 0.19 - 4} height={8}
        rx={2} fill={SALON.furnitureLight}
      />
      {/* Monitor */}
      <Rect
        x={width * 0.82} y={height * 0.18}
        width={28} height={22}
        rx={3} fill="#1E1B4B"
      />
      <Rect
        x={width * 0.82 + 2} y={height * 0.18 + 2}
        width={24} height={16}
        rx={1} fill="#6EE7B7"
        opacity={0.9}
      />
      {/* Flower vase */}
      <Rect
        x={width * 0.88} y={height * 0.28}
        width={10} height={18}
        rx={3} fill={SALON.accentLavender}
      />
      <Circle cx={width * 0.893} cy={height * 0.26} r={8} fill={SALON.accentSage} opacity={0.8} />
      <Circle cx={width * 0.893 - 5} cy={height * 0.25} r={5} fill={UI.btnActive} opacity={0.7} />
      <Circle cx={width * 0.893 + 5} cy={height * 0.25} r={5} fill={UI.btnActive} opacity={0.7} />

      {/* ── Pink accent strip along bottom of wall ───────────────────── */}
      <Rect x={52} y={wallH - 12} width={width * 0.78 - 52} height={12} fill={SALON.accentLavender} opacity={0.25} />
    </Svg>
  );
};
