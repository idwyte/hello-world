import { create } from 'zustand';

import type { AssessmentV2Answers } from '@/lib/assessment-v2';
import type { PelvicFloorIndex } from '@/lib/pelvic-floor-index';
import type { AssessmentAnswers, Level, ProgramDay } from '@/lib/types';

export type Generated = {
  level: Level;
  program: ProgramDay[];
  stealthDefault: boolean;
  // 3 short program-emphasis strings rendered on /plan-preview.
  // Populated by buildProgram() — AI-generated from measurements +
  // lifestyle, or a level-based fallback in dev mode.
  focuses: string[];
  /** Which generator produced the plan (drives preview variant copy). */
  source: 'ai' | 'rules';
};

type OnboardingStore = {
  step: number;
  draft: Partial<AssessmentAnswers>;
  /** v2 six-step measured battery (partial while in progress). */
  v2: Partial<AssessmentV2Answers>;
  index: PelvicFloorIndex | null;
  generated: Generated | null;
  setAnswer: <K extends keyof AssessmentAnswers>(
    key: K,
    value: AssessmentAnswers[K],
  ) => void;
  setV2: <K extends keyof AssessmentV2Answers>(
    key: K,
    value: AssessmentV2Answers[K],
  ) => void;
  setIndex: (index: PelvicFloorIndex) => void;
  setGenerated: (g: Generated) => void;
  next: () => void;
  prev: () => void;
  reset: () => void;
};

export const useOnboardingStore = create<OnboardingStore>((set) => ({
  step: 0,
  draft: {},
  v2: {},
  index: null,
  generated: null,
  setAnswer: (key, value) =>
    set((state) => ({ draft: { ...state.draft, [key]: value } })),
  setV2: (key, value) =>
    set((state) => ({ v2: { ...state.v2, [key]: value } })),
  setIndex: (index) => set({ index }),
  setGenerated: (g) => set({ generated: g }),
  next: () => set((state) => ({ step: state.step + 1 })),
  prev: () => set((state) => ({ step: Math.max(0, state.step - 1) })),
  reset: () => set({ step: 0, draft: {}, v2: {}, index: null, generated: null }),
}));
