// Assessment v2 — multi-dimensional profile + archetype routing.
// Spec: docs/hone-assessment-logic-v2.md (PERFECT scheme approximation)
// and docs/hone-down-training-track.md (safety-critical branch).
//
// The assessment produces a PROFILE VECTOR, not a single index. Routing
// runs BEFORE dosing and is fully deterministic, so the safe path works
// identically for users who decline AI consent.
//
// Standing rule (logic doc, skeptical-flag #2): route CONSERVATIVELY.
// A false positive (a fine user gets two weeks of breathing work) is
// cheap; a false negative (a pained pelvic floor told to strengthen)
// is harmful.

export type Archetype = 'strengthening' | 'foundation' | 'down_training';
export type FiberBias =
  | 'slow_deficit'
  | 'fast_deficit'
  | 'balanced'
  | 'advanced';
export type ReleaseAnswer = 'easy' | 'partial' | 'tight';

export type CoordinationFlag =
  | 'breath_hold'
  | 'abdominal_brace'
  | 'glute_clench'
  | 'bearing_down';

export type SymptomFlag =
  | 'pelvic_pain'
  | 'pain_with_sex'
  | 'urgency'
  | 'incomplete_emptying'
  | 'worse_after_kegels';

export type AssessmentV2Answers = {
  /** Modified-Oxford self-rating, 0–4 (option index; 0 = "couldn't feel"). */
  strengthOxford: number;
  /** Timed hold, seconds. Display-capped at ~12 s (logic doc). */
  enduranceSeconds: number;
  /** Quality-gated rep ceiling, 0–10+. */
  repCeiling: number;
  /** Quick-flick count in the 15 s window. */
  fastCount: number;
  /** Multi-select compensations; empty = clean lift. */
  coordinationFlags: CoordinationFlag[];
  /** Single-select release quality. */
  release: ReleaseAnswer;
  /** Multi-select symptom screen (Release step part 2). */
  symptomFlags: SymptomFlag[];
};

export type AssessmentProfileV2 = {
  archetype: Archetype;
  strength_oxford: number;
  endurance_seconds: number;
  rep_ceiling: number;
  fast_count: number;
  fiber_bias: FiberBias;
  coordination: 'clean' | 'compensating';
  relaxation: 'ok' | 'possible_hypertonic';
  context: {
    age_band?: string;
    train_freq?: string;
    flags: string[];
  };
};

// — Routing thresholds — reviewable in one place, per the logic doc's
// skeptical-flag #5 (no magic numbers buried in prompts).
export const HOLD_CAP_S = 12;
export const FAST_WINDOW_S = 15;
const SLOW_OK_ENDURANCE_S = 6; // Type I capacity considered "ok" at ≥6 s
const SLOW_OK_REPS = 5;
const FAST_OK_COUNT = 10; // ≥10 clean flicks in 15 s
const ADVANCED_ENDURANCE_S = 10;
const ADVANCED_REPS = 8;
const ADVANCED_FAST = 18;

/**
 * Relaxation screen → possible_hypertonic when the release answer is
 * "tight", OR any symptom flag fires. "worse_after_kegels" and pain
 * flags are decisive on their own per the literature; we treat every
 * flag as sufficient because the asymmetric-cost rule says lean in.
 */
export function deriveRelaxation(
  release: ReleaseAnswer,
  symptomFlags: SymptomFlag[],
): 'ok' | 'possible_hypertonic' {
  if (release === 'tight') return 'possible_hypertonic';
  if (symptomFlags.length > 0) return 'possible_hypertonic';
  return 'ok';
}

export function deriveCoordination(
  flags: CoordinationFlag[],
): 'clean' | 'compensating' {
  return flags.length === 0 ? 'clean' : 'compensating';
}

/**
 * Archetype routing — the branch a single index can't make.
 *
 *   possible_hypertonic OR pain flags        → down_training
 *   compensating coordination OR strength 0  → foundation
 *   otherwise                                → strengthening
 */
export function routeArchetype(input: {
  relaxation: 'ok' | 'possible_hypertonic';
  coordination: 'clean' | 'compensating';
  strengthOxford: number;
}): Archetype {
  if (input.relaxation === 'possible_hypertonic') return 'down_training';
  if (input.coordination === 'compensating' || input.strengthOxford === 0) {
    return 'foundation';
  }
  return 'strengthening';
}

/**
 * Fiber-balance within strengthening: rebalance toward the deficit
 * (specificity principle). slow = endurance+reps (Type I);
 * fast = quick-flick count (Type II).
 */
export function deriveFiberBias(input: {
  enduranceSeconds: number;
  repCeiling: number;
  fastCount: number;
}): FiberBias {
  const slowOk =
    input.enduranceSeconds >= SLOW_OK_ENDURANCE_S &&
    input.repCeiling >= SLOW_OK_REPS;
  const fastOk = input.fastCount >= FAST_OK_COUNT;
  const advanced =
    input.enduranceSeconds >= ADVANCED_ENDURANCE_S &&
    input.repCeiling >= ADVANCED_REPS &&
    input.fastCount >= ADVANCED_FAST;
  if (advanced) return 'advanced';
  if (!slowOk && fastOk) return 'slow_deficit';
  if (slowOk && !fastOk) return 'fast_deficit';
  return 'balanced';
}

/**
 * Assemble the full profile vector from raw answers + context. This is
 * what the generate-program Edge Function receives (input change
 * sanctioned by handoff §5) and what the rule-based path doses from.
 */
export function buildProfileV2(
  answers: AssessmentV2Answers,
  context: { ageBand?: string; trainFreq?: string; flags?: string[] } = {},
): AssessmentProfileV2 {
  const relaxation = deriveRelaxation(answers.release, answers.symptomFlags);
  const coordination = deriveCoordination(answers.coordinationFlags);
  const archetype = routeArchetype({
    relaxation,
    coordination,
    strengthOxford: answers.strengthOxford,
  });
  return {
    archetype,
    strength_oxford: Math.max(0, Math.min(5, answers.strengthOxford)),
    endurance_seconds: Math.max(
      0,
      Math.min(HOLD_CAP_S, Math.round(answers.enduranceSeconds)),
    ),
    rep_ceiling: Math.max(0, Math.min(10, answers.repCeiling)),
    fast_count: Math.max(0, Math.min(30, answers.fastCount)),
    fiber_bias: deriveFiberBias(answers),
    coordination,
    relaxation,
    context: {
      age_band: context.ageBand,
      train_freq: context.trainFreq,
      flags: context.flags ?? [],
    },
  };
}

/**
 * Five-axis profile scores (0–1) for the Bars/Radar visuals (Figma
 * 37:151 / 37:100). Honest-imprecision rule: these drive a VISUAL, not
 * a clinical claim — bands, not decimals. Control derives from how many
 * compensation flags fired (clean = strong, each flag knocks it down).
 */
export function axisScores(answers: {
  strengthOxford: number;
  enduranceSeconds: number;
  repCeiling: number;
  fastCount: number;
  coordinationFlags: CoordinationFlag[];
}): Array<{ label: string; value: number }> {
  const clamp = (v: number) => Math.max(0.06, Math.min(1, v));
  return [
    { label: 'STRENGTH', value: clamp(answers.strengthOxford / 4) },
    { label: 'STAMINA', value: clamp(answers.enduranceSeconds / HOLD_CAP_S) },
    { label: 'REPEAT', value: clamp(answers.repCeiling / 10) },
    { label: 'SPEED', value: clamp(answers.fastCount / 20) },
    {
      label: 'CONTROL',
      value: clamp(1 - answers.coordinationFlags.length * 0.22),
    },
  ];
}

/**
 * Continuity shim for the existing Hone Index: the v2 battery measures
 * a superset of the old 2-test battery, so the composite keeps working
 * by mapping fast_count (15 s) → pulses-equivalent (30 s, ×2) and the
 * endurance hold straight across. The Index trend on Home/Progress
 * stays comparable across the v1→v2 transition.
 */
export function v2ToLegacyMeasurements(answers: {
  fastCount: number;
  enduranceSeconds: number;
}): { pulsesIn30s: number; maxHoldS: number } {
  return {
    pulsesIn30s: Math.round(answers.fastCount * 2),
    maxHoldS: Math.round(answers.enduranceSeconds),
  };
}
