import type { AssessmentProfileV2 } from './assessment-v2';
import { EXERCISES } from './exercises';
import { hasSupabaseConfig } from './env';
import { levelFromComposite, type PelvicFloorIndex, type PelvicFloorMeasurements } from './pelvic-floor-index';
import { hasAiConsent } from './persistence';
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

// Archetype + fiber-bias pool selection (assessment v2). Runs in the
// rule-based path so the SAFE routing works without any AI call — the
// decline path and the safety path share this code (handoff §5).
//
// Down-training prohibitions (down-training spec): no strengthening
// kegels, no progressive overload — content pool is release work only.
function applyProfileBias(
  pool: string[],
  profile: AssessmentProfileV2 | undefined,
): string[] {
  if (!profile) return pool;
  if (profile.archetype === 'down_training') {
    return ['deep_squat_breath', 'reverse_kegels'];
  }
  if (profile.archetype === 'foundation') {
    // Awareness + isolation + breath coordination before load.
    return ['short_holds', 'reverse_kegels', 'quick_flicks'];
  }
  // Strengthening: rebalance toward the fiber deficit.
  if (profile.fiber_bias === 'slow_deficit') {
    const front = pool.filter(
      (e) => e === 'long_holds' || e === 'endurance_ladder',
    );
    const rest = pool.filter(
      (e) => e !== 'long_holds' && e !== 'endurance_ladder',
    );
    return [...front, ...rest];
  }
  if (profile.fiber_bias === 'fast_deficit') {
    const fast = ['quick_flicks', 'pulse_hold_combo'];
    const front = pool.filter((e) => fast.includes(e));
    const rest = pool.filter((e) => !fast.includes(e));
    return [...new Set([...front, 'pulse_hold_combo', ...rest])];
  }
  if (profile.fiber_bias === 'advanced') {
    return [...new Set([...pool, 'pulse_hold_combo', 'glute_bridge'])];
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
  /**
   * Assessment v2 profile vector. When present, archetype routing +
   * fiber bias drive the pool in BOTH the rule-based and AI paths
   * (the Edge Function receives it verbatim — handoff §5).
   */
  profile?: AssessmentProfileV2;
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
  /** Which generator produced the plan — drives the plan-preview
   * "rule-based" variant copy (Figma 64:201). */
  source: 'ai' | 'rules';
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
  const trendPool =
    adjusted.level !== level ? pickExercisesFor(adjusted.level) : adjusted.pool;
  // Archetype routing runs LAST so down_training/foundation override any
  // level-based pool entirely (safety wins over dosing).
  const effectivePool = applyProfileBias(trendPool, input.profile);
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

const ARCHETYPE_FOCUSES: Record<string, string[]> = {
  down_training: [
    'Release — daily pelvic-floor breathing',
    'Lengthen — gentle reverse Kegels',
    'Ease — no loading, no pushing',
  ],
  foundation: [
    'Awareness — find the right muscles',
    'Isolation — no breath-holds or bracing',
    'Coordination before any load',
  ],
};

function fallbackFocuses(input: BuildProgramInput): string[] {
  const archetype = input.profile?.archetype;
  if (archetype && ARCHETYPE_FOCUSES[archetype]) {
    return ARCHETYPE_FOCUSES[archetype];
  }
  return FALLBACK_FOCUSES_BY_LEVEL[input.level];
}

// Primary entry point. Calls the Supabase Edge Function (which calls
// Claude) when configured; falls back to the rule-based local generator
// in dev mode. Returns `days` + 3 `focuses` strings for /plan-preview.
export async function buildProgram(input: BuildProgramInput): Promise<GeneratedProgram> {
  // Down-training is fully deterministic — prohibitions, not dosing
  // (down-training spec). No AI call: nothing to personalise, and the
  // safety path must not depend on a network round trip.
  if (input.profile?.archetype === 'down_training') {
    return {
      days: buildProgramLocal(input),
      focuses: fallbackFocuses(input),
      source: 'rules',
    };
  }

  if (!hasSupabaseConfig()) {
    return {
      days: buildProgramLocal(input),
      focuses: fallbackFocuses(input),
      source: 'rules',
    };
  }

  // No consent → never POST PII to Anthropic. The Edge Function also
  // enforces this server-side (returns 403 consent_required), but a
  // client-side gate avoids the round trip and gives the caller a clean
  // rule-based result.
  const consented = await hasAiConsent().catch(() => false);
  if (!consented) {
    return {
      days: buildProgramLocal(input),
      focuses: fallbackFocuses(input),
      source: 'rules',
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
        // Assessment v2 profile vector — archetype, raw axis values,
        // fiber bias, safety context (handoff §5 input change).
        profile: input.profile,
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
      focuses: fallbackFocuses(input),
      source: 'rules',
    };
  }

  return {
    days: resolveEdgeProgram(data.program),
    focuses: data.program.focuses,
    source: 'ai',
  };
}
