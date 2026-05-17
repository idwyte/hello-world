import { EXERCISES } from './exercises';
import { levelFromComposite, type PelvicFloorIndex } from './pelvic-floor-index';
import type {
  AssessmentAnswers,
  ExerciseTemplate,
  Goal,
  Level,
  ProgramDay,
} from './types';

export function recommendLevel(index: PelvicFloorIndex): Level {
  return levelFromComposite(index.composite);
}

function pickExercisesFor(level: Level, goal: Goal): string[] {
  const pool: string[] = [];
  if (level === 'beginner') {
    pool.push('short_holds', 'quick_flicks');
    if (goal === 'strength' || goal === 'stamina') {
      pool.push('long_holds');
    }
  } else if (level === 'intermediate') {
    pool.push('short_holds', 'quick_flicks', 'long_holds');
  } else {
    pool.push('quick_flicks', 'long_holds', 'endurance_ladder', 'short_holds');
  }
  if (goal === 'control') {
    return ['quick_flicks', ...pool.filter((e) => e !== 'quick_flicks')];
  }
  if (goal === 'strength' || goal === 'stamina') {
    return [
      ...pool.filter((e) => e === 'long_holds' || e === 'endurance_ladder'),
      ...pool.filter((e) => e !== 'long_holds' && e !== 'endurance_ladder'),
    ];
  }
  return pool;
}

// Retest-adaptive bias. If the most recent Index improved by >10 points
// over the prior, bring endurance work to the front. If it regressed by
// >10, fall back one level so progressive overload doesn't reinforce a
// plateau.
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
      level === 'advanced' ? 'intermediate' : level === 'intermediate' ? 'beginner' : 'beginner';
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

export function buildProgram(
  level: Level,
  dailyMinutes: 3 | 5 | 8,
  goal: Goal,
  indexHistory: PelvicFloorIndex[] = [],
  weeks = 8,
): ProgramDay[] {
  const initialPool = pickExercisesFor(level, goal);
  const adjusted = applyTrendBias(initialPool, level, indexHistory);
  const effectivePool =
    adjusted.level !== level ? pickExercisesFor(adjusted.level, goal) : adjusted.pool;
  const targetSeconds = dailyMinutes * 60;
  const days: ProgramDay[] = [];
  for (let d = 0; d < weeks * 7; d++) {
    days.push(buildDay(d, effectivePool, targetSeconds));
  }
  return days;
}

export function defaultStealthFromAnswers(a: AssessmentAnswers): boolean {
  return a.trainingEnvironment === 'public';
}
