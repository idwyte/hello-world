import { create } from 'zustand';

import type { AssessmentAnswers, Level, ProgramDay } from '@/lib/types';

export type Generated = {
  level: Level;
  program: ProgramDay[];
  stealthDefault: boolean;
};

type OnboardingStore = {
  step: number;
  draft: Partial<AssessmentAnswers>;
  generated: Generated | null;
  setAnswer: <K extends keyof AssessmentAnswers>(
    key: K,
    value: AssessmentAnswers[K],
  ) => void;
  setGenerated: (g: Generated) => void;
  next: () => void;
  prev: () => void;
  reset: () => void;
};

export const useOnboardingStore = create<OnboardingStore>((set) => ({
  step: 0,
  draft: {},
  generated: null,
  setAnswer: (key, value) =>
    set((state) => ({ draft: { ...state.draft, [key]: value } })),
  setGenerated: (g) => set({ generated: g }),
  next: () => set((state) => ({ step: state.step + 1 })),
  prev: () => set((state) => ({ step: Math.max(0, state.step - 1) })),
  reset: () => set({ step: 0, draft: {}, generated: null }),
}));
