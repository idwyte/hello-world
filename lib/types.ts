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

export type Goal = 'control' | 'strength' | 'stamina' | 'general';

export type AssessmentAnswers = {
  ageBand: '18-24' | '25-34' | '35-44' | '45-54' | '55+';
  currentStrength: 1 | 2 | 3 | 4 | 5;
  symptoms: Array<'leaks' | 'control' | 'firmness' | 'none'>;
  priorExperience: 'never' | 'tried' | 'regularly';
  holdDuration: '<3s' | '3-5s' | '5-10s' | '>10s';
  goal: Goal;
  dailyMinutes: 3 | 5 | 8;
  preferredTime: 'morning' | 'midday' | 'evening' | 'late_night';
  trainingEnvironment: 'private' | 'mixed' | 'public';
  recentMedical: boolean;
};
