import type { Level } from './types';

export type PelvicFloorIndexInput = {
  reactionMs: number;
  enduranceS: number;
  rapidReps10s: number;
};

export type PelvicFloorIndex = PelvicFloorIndexInput & {
  composite: number;
  level: Level;
};

// Norm bands are population-rough; replace with telemetry-driven calibration
// once we have ≥1000 retests in production. Sources: Bø & Sherburn 2005
// (reaction & endurance), Cardenas-Trowers et al. 2018 (rapid contractions).
const REACTION_BEST_MS = 250;
const REACTION_WORST_MS = 1200;

const ENDURANCE_BEST_S = 30;
const ENDURANCE_WORST_S = 2;

const RAPID_BEST_REPS = 18;
const RAPID_WORST_REPS = 4;

const WEIGHT_REACTION = 0.35;
const WEIGHT_ENDURANCE = 0.4;
const WEIGHT_RAPID = 0.25;

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

export function scoreIndex(input: PelvicFloorIndexInput): PelvicFloorIndex {
  const rN = normalize(input.reactionMs, REACTION_BEST_MS, REACTION_WORST_MS);
  const eN = normalize(input.enduranceS, ENDURANCE_BEST_S, ENDURANCE_WORST_S);
  const pN = normalize(input.rapidReps10s, RAPID_BEST_REPS, RAPID_WORST_REPS);
  const composite =
    Math.round(
      (rN * WEIGHT_REACTION + eN * WEIGHT_ENDURANCE + pN * WEIGHT_RAPID) *
        100 *
        100,
    ) / 100;
  return {
    ...input,
    composite,
    level: levelFromComposite(composite),
  };
}
