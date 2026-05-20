export type PhaseKind = 'prep' | 'squeeze' | 'hold' | 'release' | 'rest' | 'done';

export type Phase = {
  kind: PhaseKind;
  durationMs: number;
  repIndex: number;
  setIndex: number;
  exerciseIndex: number;
};

export type ExerciseTemplate = {
  slug: string;
  name: string;
  description: string;
  difficulty: 1 | 2 | 3;
  sets: number;
  reps: number;
  phases: Array<{ kind: Exclude<PhaseKind, 'prep' | 'done'>; durationMs: number }>;
  restBetweenSetsMs: number;
};

export type ProgramDay = {
  dayIndex: number;
  exercises: ExerciseTemplate[];
  targetDurationS: number;
};

export type SessionMode = 'normal' | 'stealth';

export type Level = 'beginner' | 'intermediate' | 'advanced';

// Age bands per Figma 06 · age question (node 197:341). Decade-grain
// resolution is enough for program calibration; bands also reduce friction
// vs an exact year picker on a sensitive question.
export type AgeBand = '18-25' | '26-35' | '36-45' | '46-55' | '56-65' | '66+';

// 0-7 day picker per Figma 07/08 · strength/cardio questions
// (nodes 199:443, 199:481).
export type DaysPerWeek = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7;

// Lifestyle context collected during onboarding. Feeds the AI plan
// generator alongside the two physical measurements.
export type AssessmentAnswers = {
  ageBand: AgeBand;
  strengthDaysPerWeek: DaysPerWeek;
  cardioDaysPerWeek: DaysPerWeek;
  intimacyPerWeek: DaysPerWeek;
};
