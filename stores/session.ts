import { create } from 'zustand';

import type { SessionMode } from '@/lib/types';

type CompletedSession = {
  id: string;
  startedAt: number;
  endedAt: number;
  mode: SessionMode;
  repsPlanned: number;
  repsCompleted: number;
  completed: boolean;
};

type SessionStore = {
  history: CompletedSession[];
  logSession: (s: CompletedSession) => void;
  streak: { current: number; longest: number; lastDate?: string };
  reset: () => void;
};

function dateKey(ts: number): string {
  const d = new Date(ts);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function recomputeStreak(history: CompletedSession[]): {
  current: number;
  longest: number;
  lastDate?: string;
} {
  const completed = history.filter((s) => s.completed);
  if (completed.length === 0) return { current: 0, longest: 0 };

  const dates = Array.from(new Set(completed.map((s) => dateKey(s.endedAt)))).sort();
  let longest = 0;
  let run = 0;
  let prev: Date | null = null;
  let current = 0;

  for (const ds of dates) {
    const d = new Date(ds);
    if (prev) {
      const diff = Math.round((d.getTime() - prev.getTime()) / 86_400_000);
      run = diff === 1 ? run + 1 : 1;
    } else {
      run = 1;
    }
    longest = Math.max(longest, run);
    prev = d;
  }
  current = run;
  return { current, longest, lastDate: dates[dates.length - 1] };
}

export const useSessionStore = create<SessionStore>((set) => ({
  history: [],
  streak: { current: 0, longest: 0 },
  logSession: (s) =>
    set((state) => {
      const history = [...state.history, s];
      return { history, streak: recomputeStreak(history) };
    }),
  reset: () => set({ history: [], streak: { current: 0, longest: 0 } }),
}));

export { recomputeStreak as _recomputeStreakForTest };
