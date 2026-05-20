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
      // Reserved for future multi-select questions; no current usage.
      kind: 'multi';
      id: keyof AssessmentAnswers;
      prompt: string;
      help?: string;
      choices: Choice<unknown>[];
    };

// v1.2 lifestyle questions per Figma:
//   06 · age band (197:341)
//   07 · strength training days/week (199:443)
//   08 · cardio days/week (199:481)
//   09 · intimacy frequency (199:519)
// The two physical measurements (pulses, hold) come from screen 04/05
// via PelvicFloorMeasurements; this list is the AI plan generator's
// secondary inputs.
export const QUESTIONS: Question[] = [
  {
    kind: 'single',
    id: 'ageBand',
    prompt: 'How old are you?',
    help: 'We adjust the program intensity based on age.',
    choices: [
      { label: '18–25', value: '18-25' },
      { label: '26–35', value: '26-35' },
      { label: '36–45', value: '36-45' },
      { label: '46–55', value: '46-55' },
      { label: '56–65', value: '56-65' },
      { label: '66+', value: '66+' },
    ],
  },
  {
    kind: 'single',
    id: 'strengthDaysPerWeek',
    prompt: 'Days of strength training?',
    help: 'How many days per week do you train with intensity (weights, resistance, intense bodyweight)?',
    choices: [
      { label: '0', value: 0 },
      { label: '1', value: 1 },
      { label: '2', value: 2 },
      { label: '3', value: 3 },
      { label: '4', value: 4 },
      { label: '5', value: 5 },
      { label: '6', value: 6 },
      { label: '7', value: 7 },
    ],
  },
  {
    kind: 'single',
    id: 'cardioDaysPerWeek',
    prompt: 'Days of cardio?',
    help: 'Aerobic activity that gets your heart rate up: running, cycling, swimming, brisk walking.',
    choices: [
      { label: '0', value: 0 },
      { label: '1', value: 1 },
      { label: '2', value: 2 },
      { label: '3', value: 3 },
      { label: '4', value: 4 },
      { label: '5', value: 5 },
      { label: '6', value: 6 },
      { label: '7', value: 7 },
    ],
  },
  {
    kind: 'single',
    id: 'intimacyPerWeek',
    prompt: 'Intimacy frequency?',
    help: 'Roughly how often per week, on average. Honest answers help us tailor — never shared.',
    // Maps the 4-band Figma 09 UI to the 0-7 numeric type. Rarely=0,
    // Weekly=1, "A few times a week"=3, "Daily or more"=7.
    choices: [
      { label: 'Rarely', value: 0 },
      { label: 'Weekly', value: 1 },
      { label: 'A few times a week', value: 3 },
      { label: 'Daily or more', value: 7 },
    ],
  },
];

export function isAssessmentComplete(
  draft: Partial<AssessmentAnswers>,
): draft is AssessmentAnswers {
  return QUESTIONS.every((q) => draft[q.id] !== undefined);
}
