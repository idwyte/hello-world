/**
 * Client-side mirror of the streak-freeze logic in
 * `supabase/migrations/0004_streak_freezes.sql`.
 *
 * Rules:
 *  - Consecutive days extend the run.
 *  - Earn 1 freeze every 7 consecutive run days, capped at 2 (only credit
 *    once per calendar day).
 *  - A single missed day (+2 gap) consumes 1 freeze if available and the
 *    run continues. Two-day gap with no freeze, or any +3+ gap, resets.
 *
 * Server is the source of truth once Supabase is configured; this exists
 * for the offline / Expo-Go path and so the UI can preview a freeze count
 * without round-tripping.
 */

export type StreakState = {
  current: number;
  longest: number;
  lastDate?: string;
  freezes: number;
  lastFreezeEarnedAt?: string;
};

export const ZERO_STREAK: StreakState = {
  current: 0,
  longest: 0,
  freezes: 0,
};

const MAX_FREEZES = 2;
const DAY_MS = 86_400_000;

function toDateKey(ts: number): string {
  const d = new Date(ts);
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

function parseDateKey(key: string): Date {
  const [y, m, d] = key.split('-').map(Number);
  return new Date(y, m - 1, d, 12, 0, 0);
}

function daysBetween(a: Date, b: Date): number {
  return Math.round((b.getTime() - a.getTime()) / DAY_MS);
}

/**
 * Recompute the streak from a list of session end timestamps. Multiple
 * sessions on the same day collapse to one. Pass `priorFreezes` to preserve
 * any freezes earned in earlier runs that haven't been consumed yet.
 */
export function computeStreak(
  endTimestamps: number[],
  priorFreezes = 0,
  priorLastEarned?: string,
): StreakState {
  if (endTimestamps.length === 0) {
    return {
      current: 0,
      longest: 0,
      freezes: Math.min(MAX_FREEZES, Math.max(0, priorFreezes)),
      lastFreezeEarnedAt: priorLastEarned,
    };
  }

  const dates = Array.from(new Set(endTimestamps.map(toDateKey))).sort();
  let run = 0;
  let longest = 0;
  let freezes = Math.min(MAX_FREEZES, Math.max(0, priorFreezes));
  let lastEarned = priorLastEarned;
  let prev: Date | null = null;

  for (const key of dates) {
    const d = parseDateKey(key);
    if (prev === null) {
      run = 1;
    } else {
      const diff = daysBetween(prev, d);
      if (diff === 1) {
        run += 1;
        if (run > 0 && run % 7 === 0 && freezes < MAX_FREEZES && lastEarned !== key) {
          freezes += 1;
          lastEarned = key;
        }
      } else if (diff === 2 && freezes > 0) {
        // Consume a freeze, bridge the gap.
        freezes -= 1;
        run += 1;
      } else {
        run = 1;
      }
    }
    if (run > longest) longest = run;
    prev = d;
  }

  return {
    current: run,
    longest,
    lastDate: dates[dates.length - 1],
    freezes,
    lastFreezeEarnedAt: lastEarned,
  };
}

export const _streakConstants = { MAX_FREEZES, DAY_MS };
