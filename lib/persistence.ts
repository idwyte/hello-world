import type {
  AssessmentAnswers,
  Level,
  ProgramDay,
} from './types';
import type { PelvicFloorIndex } from './pelvic-floor-index';
import { hasSupabaseConfig } from './env';
import { getSupabase } from './supabase';

/**
 * Persist a completed assessment + Pelvic Floor Index + generated program
 * in one logical step. Five sequential writes (assessment, index,
 * deactivate prior programs, new program, program_days); wrap in an
 * Edge Function later if we need transactional guarantees.
 *
 * Returns the new program id on success. No-op when Supabase isn't
 * configured.
 */
export async function saveAssessmentAndProgram(input: {
  answers: AssessmentAnswers;
  index: PelvicFloorIndex;
  level: Level;
  program: ProgramDay[];
}): Promise<string | null> {
  if (!hasSupabaseConfig()) return null;
  const supabase = getSupabase();
  const { data: userData, error: userErr } = await supabase.auth.getUser();
  if (userErr) throw userErr;
  const userId = userData.user?.id;
  if (!userId) throw new Error('Not signed in.');

  // 1. lifestyle answers (4-question v1.2 assessment: age band, strength
  //    days/week, cardio days/week, intimacy per week).
  const { error: aErr } = await supabase.from('assessments').insert({
    user_id: userId,
    answers: input.answers,
    score: null,
    recommended_level: input.level,
  });
  if (aErr) throw aErr;

  // 2. pelvic floor index
  const { error: iErr } = await supabase
    .from('pelvic_floor_assessments')
    .insert({
      user_id: userId,
      pulses_in_30s: Math.round(input.index.pulsesIn30s),
      max_hold_s: input.index.maxHoldS,
      composite: input.index.composite,
      level: input.index.level,
    });
  if (iErr) throw iErr;

  // 3. deactivate prior active program
  await supabase
    .from('programs')
    .update({ active: false })
    .eq('user_id', userId)
    .eq('active', true);

  // 4. new active program
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

  // 5. program_days
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

export async function saveIndexRetest(
  index: PelvicFloorIndex,
): Promise<void> {
  if (!hasSupabaseConfig()) return;
  const supabase = getSupabase();
  const { data, error } = await supabase.auth.getUser();
  if (error) throw error;
  const userId = data.user?.id;
  if (!userId) throw new Error('Not signed in.');
  const { error: iErr } = await supabase
    .from('pelvic_floor_assessments')
    .insert({
      user_id: userId,
      pulses_in_30s: Math.round(index.pulsesIn30s),
      max_hold_s: index.maxHoldS,
      composite: index.composite,
      level: index.level,
    });
  if (iErr) throw iErr;
}
