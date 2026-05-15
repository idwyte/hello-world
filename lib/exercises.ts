import type { ExerciseTemplate } from './types';

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
};

export function getExercise(slug: string): ExerciseTemplate {
  const ex = EXERCISES[slug];
  if (!ex) throw new Error(`Unknown exercise: ${slug}`);
  return ex;
}
