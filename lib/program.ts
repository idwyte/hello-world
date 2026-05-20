import { EXERCISES } from './exercises';
import { levelFromComposite, type PelvicFloorIndex } from './pelvic-floor-index';
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

// Default to 5 minutes — the AI plan chooses per-user in Phase C; this
// is only the dev-mode fallback path.
const DEFAULT_DAILY_MINUTES = 5;

export function buildProgram(
  level: Level,
  indexHistory: PelvicFloorIndex[] = [],
  weeks = 8,
  dailyMinutes: number = DEFAULT_DAILY_MINUTES,
): ProgramDay[] {
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

// Stealth Mode default. v1.0 derived this from the
// `trainingEnvironment` question; v1.2 removed that question, so the
// default is now `false` — user opts in from settings.
// AssessmentAnswers parameter kept so the signature still represents
// where this used to derive from.
export function defaultStealthFromAnswers(_a: AssessmentAnswers): boolean {
  return false;
}
