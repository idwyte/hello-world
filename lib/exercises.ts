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
