import type { ExerciseTemplate, ProgramDay } from './types';

// Static catalog. In production this lives in Supabase `exercises` table;
// for M1 it's local.
export const EXERCISES: Record<string, ExerciseTemplate> = {
  quick_flicks: {
    slug: 'quick_flicks',
    name: 'Quick Flicks',
    description:
      'Short, fast contractions. Train the fast-twitch fibers responsible for control.',
    difficulty: 1,
    sets: 2,
    reps: 10,
    phases: [
      { kind: 'squeeze', durationMs: 1000 },
      { kind: 'release', durationMs: 1500 },
    ],
    restBetweenSetsMs: 20_000,
  },
  short_holds: {
    slug: 'short_holds',
    name: 'Short Holds',
    description:
      'Standard pelvic-floor contraction: squeeze, hold briefly, release fully.',
    difficulty: 1,
    sets: 2,
    reps: 8,
    phases: [
      { kind: 'squeeze', durationMs: 1000 },
      { kind: 'hold', durationMs: 3000 },
      { kind: 'release', durationMs: 3000 },
    ],
    restBetweenSetsMs: 30_000,
  },
  long_holds: {
    slug: 'long_holds',
    name: 'Long Holds',
    description: 'Build endurance with sustained contractions.',
    difficulty: 2,
    sets: 2,
    reps: 5,
    phases: [
      { kind: 'squeeze', durationMs: 1500 },
      { kind: 'hold', durationMs: 8000 },
      { kind: 'release', durationMs: 5000 },
    ],
    restBetweenSetsMs: 45_000,
  },
  endurance_ladder: {
    slug: 'endurance_ladder',
    name: 'Endurance Ladder',
    description: 'Progressive holds increasing each rep.',
    difficulty: 3,
    sets: 1,
    reps: 5,
    phases: [
      { kind: 'squeeze', durationMs: 1500 },
      { kind: 'hold', durationMs: 5000 },
      { kind: 'release', durationMs: 5000 },
    ],
    restBetweenSetsMs: 0,
  },
  // Phase 2 — Siri/App-Intents "Quick discreet" entry point. 3 min total,
  // light load, deliberately friendly to a phone-locked stealth invocation.
  quick_discreet: {
    slug: 'quick_discreet',
    name: 'Quick Discreet',
    description:
      'A short, low-effort routine designed for stealth contexts — five quick flicks plus a few short holds.',
    difficulty: 1,
    sets: 1,
    reps: 5,
    phases: [
      { kind: 'squeeze', durationMs: 1000 },
      { kind: 'release', durationMs: 1500 },
    ],
    restBetweenSetsMs: 0,
  },

  // === v1.2 catalog expansion (Phase D) ============================
  // Holistic palette for the AI plan generator. The first 5 entries
  // above are pure pelvic-floor work; these add a release/expansion
  // pattern (reverse_kegels), a hybrid (pulse_hold_combo), and four
  // synergist / stabiliser patterns that recruit adjacent musculature
  // (adductors, glutes, deep core) for a more holistic program.

  // Active downward release. Models the "bear-down" timing as squeeze +
  // hold (active expansion) + release (return) — phase kinds approximate
  // because the session engine has no native "release-downward" phase.
  reverse_kegels: {
    slug: 'reverse_kegels',
    name: 'Reverse Kegels',
    description:
      'Active downward release. Inhale and gently bear down (no strain) as if starting a bowel movement. Trains the opposite of a contraction — full relaxation + downward expansion.',
    difficulty: 2,
    sets: 2,
    reps: 5,
    phases: [
      { kind: 'squeeze', durationMs: 1500 },
      { kind: 'hold', durationMs: 5000 },
      { kind: 'release', durationMs: 3000 },
    ],
    restBetweenSetsMs: 30_000,
    position: 'supine',
  },

  // Hybrid endurance + speed. Models the pattern as a longer hold with
  // explicit squeeze/release framing on either side.
  pulse_hold_combo: {
    slug: 'pulse_hold_combo',
    name: 'Pulse + Hold Combo',
    description:
      'Five quick pulses, then a 4-second hold, then five more pulses. Trains both fast-twitch speed and slow-twitch endurance in one set.',
    difficulty: 2,
    sets: 2,
    reps: 6,
    phases: [
      { kind: 'squeeze', durationMs: 1000 },
      { kind: 'hold', durationMs: 4000 },
      { kind: 'release', durationMs: 2000 },
    ],
    restBetweenSetsMs: 30_000,
  },

  // Synergist work — adductors fire reflexively with the pelvic floor.
  adductor_squeeze: {
    slug: 'adductor_squeeze',
    name: 'Adductor Squeeze',
    description:
      'Lying down with knees bent, place a pillow between the knees. Squeeze the pillow firmly while co-contracting the pelvic floor. Recruits inner-thigh activation, which fires reflexively with the floor.',
    difficulty: 1,
    sets: 2,
    reps: 10,
    phases: [
      { kind: 'squeeze', durationMs: 1000 },
      { kind: 'hold', durationMs: 3000 },
      { kind: 'release', durationMs: 2000 },
    ],
    restBetweenSetsMs: 30_000,
    position: 'supine',
  },

  // Posterior-chain integration — bridge with floor activation at the top.
  glute_bridge: {
    slug: 'glute_bridge',
    name: 'Glute Bridge',
    description:
      'Lying on your back, knees bent, feet flat. Lift hips toward the ceiling, squeezing glutes + pelvic floor at the top. Slow lower. Builds posterior chain support for the floor.',
    difficulty: 2,
    sets: 2,
    reps: 8,
    phases: [
      { kind: 'squeeze', durationMs: 1500 },
      { kind: 'hold', durationMs: 5000 },
      { kind: 'release', durationMs: 2000 },
    ],
    restBetweenSetsMs: 30_000,
    position: 'supine',
  },

  // Deep-core stabiliser — cross-pattern with floor cue.
  bird_dog: {
    slug: 'bird_dog',
    name: 'Bird Dog',
    description:
      'On hands and knees, extend opposite arm and leg while bracing the deep core and lightly engaging the pelvic floor. Hold, then return. Alternate sides. Each "rep" is one side.',
    difficulty: 2,
    sets: 2,
    reps: 10,
    phases: [
      { kind: 'squeeze', durationMs: 1500 },
      { kind: 'hold', durationMs: 3000 },
      { kind: 'release', durationMs: 1500 },
    ],
    restBetweenSetsMs: 30_000,
    position: 'quadruped',
  },

  // Mobility + breath coordination — deep squat + diaphragmatic breath
  // with pelvic-floor downshift on exhale.
  deep_squat_breath: {
    slug: 'deep_squat_breath',
    name: 'Deep Squat + Breath',
    description:
      'Drop into a deep squat (heels down if possible). Breathe deeply into the belly. On each exhale, gently release downward through the pelvic floor — pairs mobility with active relaxation.',
    difficulty: 2,
    sets: 1,
    reps: 5,
    phases: [
      { kind: 'squeeze', durationMs: 1500 },
      { kind: 'hold', durationMs: 8000 },
      { kind: 'release', durationMs: 3000 },
    ],
    restBetweenSetsMs: 0,
    position: 'standing',
  },

  // Deep-core integration in supine. Each rep is one side.
  tabletop_marches: {
    slug: 'tabletop_marches',
    name: 'Tabletop Marches',
    description:
      'Lying on your back, lift both knees to tabletop position. Slowly lower one foot toward the floor while bracing the core and engaging the pelvic floor. Return and switch sides. Each rep is one side.',
    difficulty: 1,
    sets: 2,
    reps: 10,
    phases: [
      { kind: 'squeeze', durationMs: 1000 },
      { kind: 'hold', durationMs: 2000 },
      { kind: 'release', durationMs: 1500 },
    ],
    restBetweenSetsMs: 30_000,
    position: 'supine',
  },
};

/**
 * Synthetic single-day program used when a session is launched without a
 * persisted program day (e.g. the Siri Quick Discreet intent before
 * onboarding has run). Built from the `quick_discreet` preset.
 */
export const QUICK_DISCREET_PRESET: ProgramDay = {
  dayIndex: 0,
  exercises: [EXERCISES.quick_discreet, EXERCISES.short_holds],
  targetDurationS: 180,
};

export function getExercise(slug: string): ExerciseTemplate {
  const ex = EXERCISES[slug];
  if (!ex) throw new Error(`Unknown exercise: ${slug}`);
  return ex;
}
