import { EXERCISES } from './exercises';
import type {
  AssessmentAnswers,
  ExerciseTemplate,
  Goal,
  Level,
  ProgramDay,
} from './types';

export function recommendLevel(a: AssessmentAnswers): Level {
  const expScore =
    a.priorExperience === 'regularly' ? 2 : a.priorExperience === 'tried' ? 1 : 0;
  const holdScore =
    a.holdDuration === '>10s'
      ? 2
      : a.holdDuration === '5-10s'
        ? 1
        : a.holdDuration === '3-5s'
          ? 0
          : -1;
  const score = a.currentStrength + expScore + holdScore;
  if (score <= 3) return 'beginner';
  if (score <= 6) return 'intermediate';
  return 'advanced';
}

function pickExercisesFor(level: Level, goal: Goal): string[] {
  // Returns an ordered exercise pool. Goal weights the mix; beginners get
  // long_holds added when their goal is strength/stamina even though the
  // default beginner pool is shorter.
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
  // Greedy: include exercises in order until target hit.
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
  weeks = 8,
): ProgramDay[] {
  const pool = pickExercisesFor(level, goal);
  const targetSeconds = dailyMinutes * 60;
  const days: ProgramDay[] = [];
  for (let d = 0; d < weeks * 7; d++) {
    days.push(buildDay(d, pool, targetSeconds));
  }
  return days;
}

export function defaultStealthFromAnswers(a: AssessmentAnswers): boolean {
  return a.trainingEnvironment === 'public';
}
