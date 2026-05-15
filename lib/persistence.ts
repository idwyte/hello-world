import type {
  AssessmentAnswers,
  Level,
  ProgramDay,
} from './types';
import { hasSupabaseConfig } from './env';
import { getSupabase } from './supabase';

export type AssessmentScore = {
  level: Level;
  rawScore: number;
};

/**
 * Persist a completed assessment + generated program in one logical step.
 *
 * Returns the new program id on success. If Supabase isn't configured this
 * is a no-op (local-only dev mode) and returns `null`.
 *
 * NOTE: This issues four sequential writes (assessment, program, program_days,
 * profile update). Wrap in an Edge Function later if we need transactional
 * guarantees; for v1 the failure mode (orphan rows) is recoverable on next
 * onboarding attempt.
 */
export async function saveAssessmentAndProgram(input: {
  answers: AssessmentAnswers;
  level: Level;
  rawScore: number;
  program: ProgramDay[];
}): Promise<string | null> {
  if (!hasSupabaseConfig()) return null;
  const supabase = getSupabase();
  const { data: userData, error: userErr } = await supabase.auth.getUser();
  if (userErr) throw userErr;
  const userId = userData.user?.id;
  if (!userId) throw new Error('Not signed in.');

  // 1. assessment
  const { error: aErr } = await supabase.from('assessments').insert({
    user_id: userId,
    answers: input.answers,
    score: input.rawScore,
    recommended_level: input.level,
  });
  if (aErr) throw aErr;

  // 2. deactivate any prior active program (partial unique index allows
  //    only one active per user)
  await supabase
    .from('programs')
    .update({ active: false })
    .eq('user_id', userId)
    .eq('active', true);

  // 3. new active program
  const { data: programRow, error: pErr } = await supabase
    .from('programs')
    .insert({
      user_id: userId,
      level: input.level,
      weeks: Math.ceil(input.program.length / 7),
      active: true,
    })
    .select('id')
    .single();
  if (pErr) throw pErr;

  // 4. program_days
  const dayRows = input.program.map((d) => ({
    program_id: programRow.id,
    user_id: userId,
    day_index: d.dayIndex,
    exercises: d.exercises.map((e) => ({ slug: e.slug })),
    target_duration_s: d.targetDurationS,
  }));
  const { error: dErr } = await supabase.from('program_days').insert(dayRows);
  if (dErr) throw dErr;

  return programRow.id;
}

export async function markOnboarded(): Promise<void> {
  if (!hasSupabaseConfig()) return;
  const supabase = getSupabase();
  const { data, error } = await supabase.auth.getUser();
  if (error) throw error;
  const userId = data.user?.id;
  if (!userId) throw new Error('Not signed in.');
  const { error: upErr } = await supabase
    .from('profiles')
    .update({ onboarded_at: new Date().toISOString() })
    .eq('id', userId);
  if (upErr) throw upErr;
}

/**
 * Compute the raw score used to derive the recommended level. Kept here for
 * persistence symmetry; the level itself is computed by `lib/program.recommendLevel`.
 */
export function rawAssessmentScore(a: AssessmentAnswers): number {
  const exp =
    a.priorExperience === 'regularly' ? 2 : a.priorExperience === 'tried' ? 1 : 0;
  const hold =
    a.holdDuration === '>10s'
      ? 2
      : a.holdDuration === '5-10s'
        ? 1
        : a.holdDuration === '3-5s'
          ? 0
          : -1;
  return a.currentStrength + exp + hold;
}
