import { hasSupabaseConfig } from './env';
import type { PelvicFloorIndex } from './pelvic-floor-index';
import { getSupabase } from './supabase';
import type { Level, SessionMode } from './types';

export type CompletedSessionPayload = {
  programDayId: string | null;
  startedAt: Date;
  endedAt: Date;
  mode: SessionMode;
  repsPlanned: number;
  repsCompleted: number;
  perceivedEffort?: number;
};

/**
 * Persist a completed session to Supabase. The `streaks` table is maintained
 * by the AFTER INSERT trigger defined in `0002_streaks_fn.sql`.
 *
 * No-op when Supabase isn't configured (dev / M1 demo mode); the local
 * Zustand store is then the source of truth.
 */
export async function logCompletedSession(
  s: CompletedSessionPayload,
): Promise<void> {
  if (!hasSupabaseConfig()) return;
  const supabase = getSupabase();
  const { data, error: userErr } = await supabase.auth.getUser();
  if (userErr) throw userErr;
  const userId = data.user?.id;
  if (!userId) throw new Error('Not signed in.');
  const { error } = await supabase.from('sessions').insert({
    user_id: userId,
    program_day_id: s.programDayId,
    started_at: s.startedAt.toISOString(),
    ended_at: s.endedAt.toISOString(),
    completed: true,
    mode: s.mode,
    reps_planned: s.repsPlanned,
    reps_completed: s.repsCompleted,
    perceived_effort: s.perceivedEffort,
  });
  if (error) throw error;
}

export type FetchedSession = {
  id: string;
  startedAt: string;
  endedAt: string | null;
  mode: SessionMode;
  completed: boolean;
};

export async function fetchRecentSessions(
  limit = 60,
): Promise<FetchedSession[]> {
  if (!hasSupabaseConfig()) return [];
  const supabase = getSupabase();
  const { data: user } = await supabase.auth.getUser();
  if (!user.user) return [];
  const { data, error } = await supabase
    .from('sessions')
    .select('id, started_at, ended_at, mode, completed')
    .eq('user_id', user.user.id)
    .eq('completed', true)
    .order('started_at', { ascending: false })
    .limit(limit);
  if (error) throw error;
  return (data ?? []).map((r) => ({
    id: r.id as string,
    startedAt: r.started_at as string,
    endedAt: r.ended_at as string | null,
    mode: r.mode as SessionMode,
    completed: r.completed as boolean,
  }));
}

export type FetchedStreak = {
  current: number;
  longest: number;
  lastDate: string | null;
  freezes: number;
  lastFreezeEarnedAt: string | null;
};

export async function fetchStreak(): Promise<FetchedStreak> {
  const zero: FetchedStreak = {
    current: 0,
    longest: 0,
    lastDate: null,
    freezes: 0,
    lastFreezeEarnedAt: null,
  };
  if (!hasSupabaseConfig()) return zero;
  const supabase = getSupabase();
  const { data: user } = await supabase.auth.getUser();
  if (!user.user) return zero;
  const { data, error } = await supabase
    .from('streaks')
    .select('current, longest, last_session_date, freezes, last_freeze_earned_at')
    .eq('user_id', user.user.id)
    .maybeSingle();
  if (error) throw error;
  return {
    current: (data?.current as number) ?? 0,
    longest: (data?.longest as number) ?? 0,
    lastDate: (data?.last_session_date as string | null) ?? null,
    freezes: (data?.freezes as number) ?? 0,
    lastFreezeEarnedAt:
      (data?.last_freeze_earned_at as string | null) ?? null,
  };
}

export type FetchedIndex = PelvicFloorIndex & {
  createdAt: string;
};

// Recommended cadence between retests. Less than this and statistical
// noise (sleep, hydration, time of day) dominates the trend signal.
export const RETEST_INTERVAL_DAYS = 14;

/**
 * Days since the user's last Pelvic Floor Index measurement. Returns
 * null if there are no prior measurements (first-time user, or history
 * empty in dev mode). Used to gate the bi-weekly retest cadence — the
 * UX is soft: we warn if the user re-tests early, but never block it.
 */
export function daysSinceLastIndex(
  history: FetchedIndex[],
  now: Date = new Date(),
): number | null {
  if (history.length === 0) return null;
  // fetchIndexHistory returns oldest-first; the last entry is the most recent.
  const latest = history[history.length - 1];
  const last = new Date(latest.createdAt).getTime();
  const diffMs = now.getTime() - last;
  return Math.max(0, Math.floor(diffMs / 86_400_000));
}

export async function fetchIndexHistory(
  limit = 12,
): Promise<FetchedIndex[]> {
  if (!hasSupabaseConfig()) return [];
  const supabase = getSupabase();
  const { data: user } = await supabase.auth.getUser();
  if (!user.user) return [];
  const { data, error } = await supabase
    .from('pelvic_floor_assessments')
    .select('pulses_in_30s, max_hold_s, composite, level, created_at')
    .eq('user_id', user.user.id)
    .order('created_at', { ascending: false })
    .limit(limit);
  if (error) throw error;
  return (data ?? [])
    .map((r) => ({
      pulsesIn30s: Number(r.pulses_in_30s),
      maxHoldS: Number(r.max_hold_s),
      composite: Number(r.composite),
      level: r.level as Level,
      createdAt: r.created_at as string,
    }))
    .reverse();
}

export async function fetchTodayProgramDay(): Promise<{
  programDayId: string | null;
  dayNumber: number; // 1-indexed day within the 8-week program (1-56)
  weekNumber: number; // 1-8
  exercises: string[];
  targetDurationS: number;
} | null> {
  if (!hasSupabaseConfig()) return null;
  const supabase = getSupabase();
  const { data: user } = await supabase.auth.getUser();
  if (!user.user) return null;

  // Find active program
  const { data: program } = await supabase
    .from('programs')
    .select('id, created_at')
    .eq('user_id', user.user.id)
    .eq('active', true)
    .maybeSingle();
  if (!program) return null;

  // Day index = floor((today - program.created_at) / 1 day)
  const createdAt = new Date(program.created_at as string);
  const today = new Date();
  const dayIndex = Math.max(
    0,
    Math.floor((today.getTime() - createdAt.getTime()) / 86_400_000),
  );

  const { data: day } = await supabase
    .from('program_days')
    .select('id, exercises, target_duration_s')
    .eq('program_id', program.id as string)
    .eq('day_index', dayIndex)
    .maybeSingle();
  if (!day) return null;

  const exercises = Array.isArray(day.exercises)
    ? (day.exercises as Array<{ slug: string }>).map((e) => e.slug)
    : [];
  return {
    programDayId: day.id as string,
    dayNumber: dayIndex + 1,
    weekNumber: Math.floor(dayIndex / 7) + 1,
    exercises,
    targetDurationS: day.target_duration_s as number,
  };
}
