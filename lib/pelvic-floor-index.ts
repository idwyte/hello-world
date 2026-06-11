import type { Level } from './types';

// Two real measurements collected on Figma 04 (quick pulse, node 199:387)
// and Figma 05 (max hold, node 199:415). These replace the v1.0
// reaction/endurance/rapid-reps inputs which had no mechanistic link to
// pelvic-floor function.
export type PelvicFloorMeasurements = {
  // Count of contract-release cycles in a 30 s window. Sedentary ≈ 10;
  // trained adult ≈ 60-80.
  pulsesIn30s: number;
  // Max sustained contraction in seconds. Untrained ≈ 3-5 s; trained ≈
  // 30-60 s; elite can hit 90 s+. We cap input at 90 s for scoring.
  maxHoldS: number;
};

export type PelvicFloorIndex = PelvicFloorMeasurements & {
  composite: number;
  level: Level;
};

// Norm bands are population-rough; replace with telemetry-driven
// calibration once we have ≥1000 retests in production. Endurance is
// weighted heavier than pulse speed per Bø & Sherburn 2005 — slow-twitch
// strength is a stronger predictor of function than fast-twitch speed.
const PULSE_BEST = 80;
const PULSE_WORST = 10;

const HOLD_BEST_S = 90;
const HOLD_WORST_S = 3;

const WEIGHT_PULSE = 0.4;
const WEIGHT_HOLD = 0.6;

function clamp01(x: number): number {
  if (x < 0) return 0;
  if (x > 1) return 1;
  return x;
}

function normalize(value: number, best: number, worst: number): number {
  if (best === worst) return 0.5;
  const lo = Math.min(best, worst);
  const hi = Math.max(best, worst);
  const clamped = Math.min(hi, Math.max(lo, value));
  const raw = (clamped - worst) / (best - worst);
  return clamp01(raw);
}

export function levelFromComposite(composite: number): Level {
  if (composite < 40) return 'beginner';
  if (composite < 70) return 'intermediate';
  return 'advanced';
}

export function scoreIndex(input: PelvicFloorMeasurements): PelvicFloorIndex {
  const pulseN = normalize(input.pulsesIn30s, PULSE_BEST, PULSE_WORST);
  const holdN = normalize(input.maxHoldS, HOLD_BEST_S, HOLD_WORST_S);
  const composite =
    Math.round(
      (pulseN * WEIGHT_PULSE + holdN * WEIGHT_HOLD) * 100 * 100,
    ) / 100;
  return {
    ...input,
    composite,
    level: levelFromComposite(composite),
  };
}
