import { EXERCISES } from './exercises';
import { hasSupabaseConfig } from './env';
import { levelFromComposite, type PelvicFloorIndex, type PelvicFloorMeasurements } from './pelvic-floor-index';
import { getSupabase } from './supabase';
import type {
  AssessmentAnswers,
  ExerciseTemplate,
  Level,
  ProgramDay,
} from './types';

export function recommendLevel(index: PelvicFloorIndex): Level {
  return levelFromComposite(index.composite);
}

// Local rule-based pool selection. Used as a dev-mode fallback when
// hasSupabaseConfig() is false (Phase C ships the Claude-API path via
// supabase/functions/generate-program). Driven only by `level` now —
// goal was removed from the assessment in the v1.2 pivot.
function pickExercisesFor(level: Level): string[] {
  if (level === 'beginner') {
    return ['short_holds', 'quick_flicks', 'long_holds'];
  }
  if (level === 'intermediate') {
    return ['short_holds', 'quick_flicks', 'long_holds', 'endurance_ladder'];
  }
  return ['quick_flicks', 'long_holds', 'endurance_ladder', 'short_holds'];
}

// Retest-adaptive bias. If the most recent Index improved by >10 points
// over the prior, bring endurance work to the front. If it regressed by
// >10, fall back one level so progressive overload doesn't reinforce a
// plateau. This stays in code as the "rule-based retest" path the plan
// explicitly chose — no Claude call on each retest.
function applyTrendBias(
  pool: string[],
  level: Level,
  history: PelvicFloorIndex[],
): { pool: string[]; level: Level } {
  if (history.length < 2) return { pool, level };
  const latest = history[history.length - 1].composite;
  const prior = history[history.length - 2].composite;
  const delta = latest - prior;

  if (delta > 10) {
    const front = pool.filter(
      (e) => e === 'endurance_ladder' || e === 'long_holds',
    );
    const rest = pool.filter(
      (e) => e !== 'endurance_ladder' && e !== 'long_holds',
    );
    return { pool: [...front, ...rest], level };
  }
  if (delta < -10) {
    const downshift: Level =
      level === 'advanced' ? 'intermediate' : 'beginner';
    return { pool, level: downshift };
  }
  return { pool, level };
}

function estimateExerciseDurationS(ex: ExerciseTemplate): number {
  const perRepMs = ex.phases.reduce((acc, p) => acc + p.durationMs, 0);
  const setMs = ex.reps * perRepMs;
  const totalMs = ex.sets * setMs + Math.max(0, ex.sets - 1) * ex.restBetweenSetsMs;
  return Math.ceil(totalMs / 1000);
}

function buildDay(
  dayIndex: number,
  pool: string[],
  targetSeconds: number,
): ProgramDay {
  const chosen: ExerciseTemplate[] = [];
  let acc = 0;
  for (const slug of pool) {
    const ex = EXERCISES[slug];
    const dur = estimateExerciseDurationS(ex);
    if (acc + dur > targetSeconds * 1.25 && chosen.length > 0) break;
    chosen.push(ex);
    acc += dur;
    if (acc >= targetSeconds) break;
  }
  return {
    dayIndex,
    exercises: chosen,
    targetDurationS: acc,
  };
}

// Default to 5 minutes for the rule-based fallback. Production uses the
// AI plan from the Edge Function which sets targetDurationS per-day.
const DEFAULT_DAILY_MINUTES = 5;

export type BuildProgramInput = {
  level: Level;
  measurements: PelvicFloorMeasurements;
  answers: AssessmentAnswers;
  indexHistory?: PelvicFloorIndex[];
  weeks?: number;
  dailyMinutes?: number;
};

// Output of buildProgram. `focuses` are 3 short program-emphasis strings
// surfaced on /plan-preview (Figma 11). The Edge Function generates them
// from the user's measurements + lifestyle; the rule-based fallback uses
// a generic per-level set.
export type GeneratedProgram = {
  days: ProgramDay[];
  focuses: string[];
};

const FALLBACK_FOCUSES_BY_LEVEL: Record<Level, string[]> = {
  beginner: [
    'Foundation — short holds + quick flicks',
    'Control — coordination before load',
    'Recovery — generous rest days',
  ],
  intermediate: [
    'Endurance — long holds + ladder builds',
    'Pulse speed — quick flicks 3×/week',
    'Posterior chain — glute bridges + bird dogs',
  ],
  advanced: [
    'Endurance ladders — progressive holds',
    'Combo work — pulse + hold patterns',
    'Holistic — adductors, glutes, mobility',
  ],
};

// Local rule-based fallback. Used when Supabase isn't configured (dev
// mode walkthrough) or when the Edge Function is unreachable. Ignores
// measurements/answers — only the level matters here. The AI path uses
// all inputs.
export function buildProgramLocal(input: BuildProgramInput): ProgramDay[] {
  const { level, indexHistory = [], weeks = 8, dailyMinutes = DEFAULT_DAILY_MINUTES } = input;
  const initialPool = pickExercisesFor(level);
  const adjusted = applyTrendBias(initialPool, level, indexHistory);
  const effectivePool =
    adjusted.level !== level ? pickExercisesFor(adjusted.level) : adjusted.pool;
  const targetSeconds = dailyMinutes * 60;
  const days: ProgramDay[] = [];
  for (let d = 0; d < weeks * 7; d++) {
    days.push(buildDay(d, effectivePool, targetSeconds));
  }
  return days;
}

// Edge-function-returned shape — slug + sets + reps per exercise rather
// than the full ExerciseTemplate. We resolve slugs to templates locally
// because the templates carry phase timing the session engine needs.
type EdgeProgramExercise = { slug: string; sets: number; reps: number };
type EdgeProgramDay = {
  dayIndex: number;
  targetDurationS: number;
  exercises: EdgeProgramExercise[];
};
type EdgeProgramResponse = {
  ok: boolean;
  program?: { weeks: number; focuses: string[]; days: EdgeProgramDay[] };
  error?: string;
};

function resolveEdgeProgram(edge: EdgeProgramResponse['program']): ProgramDay[] {
  if (!edge) return [];
  return edge.days.map((d) => ({
    dayIndex: d.dayIndex,
    targetDurationS: d.targetDurationS,
    // Resolve slugs to full ExerciseTemplate. Per-exercise sets/reps from
    // the AI override the catalog defaults — clone the template and
    // patch the fields the session engine reads.
    exercises: d.exercises
      .map((e) => {
        const template = EXERCISES[e.slug];
        if (!template) return null;
        return { ...template, sets: e.sets, reps: e.reps };
      })
      .filter((x): x is ExerciseTemplate => x !== null),
  }));
}

// Primary entry point. Calls the Supabase Edge Function (which calls
// Claude) when configured; falls back to the rule-based local generator
// in dev mode. Returns `days` + 3 `focuses` strings for /plan-preview.
export async function buildProgram(input: BuildProgramInput): Promise<GeneratedProgram> {
  if (!hasSupabaseConfig()) {
    return {
      days: buildProgramLocal(input),
      focuses: FALLBACK_FOCUSES_BY_LEVEL[input.level],
    };
  }

  const supabase = getSupabase();
  const { data, error } = await supabase.functions.invoke<EdgeProgramResponse>(
    'generate-program',
    {
      body: {
        measurements: input.measurements,
        answers: input.answers,
        level: input.level,
      },
    },
  );

  // On any Edge Function failure, fall back to the rule-based path
  // rather than blocking onboarding. The user gets a program either way.
  if (error || !data?.ok || !data.program) {
    console.warn(
      'generate-program · Edge Function failed, falling back to rule-based:',
      error ?? data?.error,
    );
    return {
      days: buildProgramLocal(input),
      focuses: FALLBACK_FOCUSES_BY_LEVEL[input.level],
    };
  }

  return {
    days: resolveEdgeProgram(data.program),
    focuses: data.program.focuses,
  };
}
