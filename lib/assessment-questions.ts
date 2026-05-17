import type { AssessmentAnswers } from './types';

type Choice<V> = { label: string; value: V };

export type Question =
  | {
      kind: 'single';
      id: keyof AssessmentAnswers;
      prompt: string;
      help?: string;
      choices: Choice<unknown>[];
    }
  | {
      kind: 'multi';
      id: keyof AssessmentAnswers;
      prompt: string;
      help?: string;
      choices: Choice<unknown>[];
    };

// v1.1 micro-quiz. Measured level comes from the Pelvic Floor Index
// (lib/pelvic-floor-index.ts); these three only capture preferences the
// Index can't infer. Q3 ("trainingEnvironment") seeds Stealth default.
export const QUESTIONS: Question[] = [
  {
    kind: 'single',
    id: 'goal',
    prompt: 'What matters most to you?',
    choices: [
      { label: 'Better control', value: 'control' },
      { label: 'More strength', value: 'strength' },
      { label: 'Longer stamina', value: 'stamina' },
      { label: 'General pelvic health', value: 'general' },
    ],
  },
  {
    kind: 'single',
    id: 'dailyMinutes',
    prompt: 'How much time can you commit each day?',
    choices: [
      { label: '3 minutes', value: 3 },
      { label: '5 minutes', value: 5 },
      { label: '8 minutes', value: 8 },
    ],
  },
  {
    kind: 'single',
    id: 'trainingEnvironment',
    prompt: 'Will you mostly train in private or in public?',
    help: 'This determines whether Stealth Mode is on by default.',
    choices: [
      { label: 'Almost always private', value: 'private' },
      { label: 'A mix of both', value: 'mixed' },
      { label: 'Often in public or around people', value: 'public' },
    ],
  },
];

export function isAssessmentComplete(
  draft: Partial<AssessmentAnswers>,
): draft is AssessmentAnswers {
  return QUESTIONS.every((q) => draft[q.id] !== undefined);
}
