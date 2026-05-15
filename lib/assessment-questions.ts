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

/**
 * 10-question assessment. Order maps to plan §7.
 * Q9 ("trainingEnvironment") seeds the default Stealth Mode setting.
 * Q10 ("recentMedical") triggers a medical disclaimer when "yes".
 */
export const QUESTIONS: Question[] = [
  {
    kind: 'single',
    id: 'ageBand',
    prompt: 'What is your age range?',
    choices: [
      { label: '18–24', value: '18-24' },
      { label: '25–34', value: '25-34' },
      { label: '35–44', value: '35-44' },
      { label: '45–54', value: '45-54' },
      { label: '55+', value: '55+' },
    ],
  },
  {
    kind: 'single',
    id: 'currentStrength',
    prompt: 'How would you rate your current pelvic floor strength?',
    help: '1 = very weak, 5 = very strong',
    choices: [1, 2, 3, 4, 5].map((n) => ({ label: String(n), value: n })),
  },
  {
    kind: 'multi',
    id: 'symptoms',
    prompt: 'Do you currently experience any of these?',
    help: 'Select all that apply. Skip if none.',
    choices: [
      { label: 'Occasional leaks', value: 'leaks' },
      { label: 'Trouble with control', value: 'control' },
      { label: 'Reduced firmness', value: 'firmness' },
      { label: 'None of the above', value: 'none' },
    ],
  },
  {
    kind: 'single',
    id: 'priorExperience',
    prompt: 'Have you done pelvic floor exercises before?',
    choices: [
      { label: 'Never', value: 'never' },
      { label: 'Tried a few times', value: 'tried' },
      { label: 'Regularly', value: 'regularly' },
    ],
  },
  {
    kind: 'single',
    id: 'holdDuration',
    prompt: 'How long can you currently hold a squeeze?',
    choices: [
      { label: 'Less than 3 seconds', value: '<3s' },
      { label: '3–5 seconds', value: '3-5s' },
      { label: '5–10 seconds', value: '5-10s' },
      { label: 'More than 10 seconds', value: '>10s' },
    ],
  },
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
    id: 'preferredTime',
    prompt: 'When do you usually want to train?',
    choices: [
      { label: 'Morning', value: 'morning' },
      { label: 'Midday', value: 'midday' },
      { label: 'Evening', value: 'evening' },
      { label: 'Late night', value: 'late_night' },
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
  {
    kind: 'single',
    id: 'recentMedical',
    prompt:
      'Any pelvic surgery, prolapse, or related medical condition in the last 12 months?',
    help: 'If yes, we recommend consulting a clinician before starting.',
    choices: [
      { label: 'No', value: false },
      { label: 'Yes', value: true },
    ],
  },
];

export function isAssessmentComplete(
  draft: Partial<AssessmentAnswers>,
): draft is AssessmentAnswers {
  return QUESTIONS.every((q) => draft[q.id] !== undefined);
}
