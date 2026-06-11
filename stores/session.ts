import { create } from 'zustand';

import { computeStreak, type StreakState, ZERO_STREAK } from '@/lib/streak';
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
  streak: StreakState;
  reset: () => void;
};

function recomputeStreak(history: CompletedSession[]): StreakState {
  const completed = history.filter((s) => s.completed);
  if (completed.length === 0) return ZERO_STREAK;
  return computeStreak(completed.map((s) => s.endedAt));
}

export const useSessionStore = create<SessionStore>((set) => ({
  history: [],
  streak: ZERO_STREAK,
  logSession: (s) =>
    set((state) => {
      const history = [...state.history, s];
      return { history, streak: recomputeStreak(history) };
    }),
  reset: () => set({ history: [], streak: ZERO_STREAK }),
}));

export { recomputeStreak as _recomputeStreakForTest };
