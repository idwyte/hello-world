import {
  buildProgram,
  defaultStealthFromAnswers,
  recommendLevel,
} from '@/lib/program';
import type { AssessmentAnswers } from '@/lib/types';

function answers(overrides: Partial<AssessmentAnswers> = {}): AssessmentAnswers {
  return {
    ageBand: '25-34',
    currentStrength: 3,
    symptoms: ['none'],
    priorExperience: 'tried',
    holdDuration: '3-5s',
    goal: 'general',
    dailyMinutes: 5,
    preferredTime: 'evening',
    trainingEnvironment: 'private',
    recentMedical: false,
    ...overrides,
  };
}

describe('recommendLevel', () => {
  it('returns beginner for low scores', () => {
    expect(
      recommendLevel(
        answers({
          currentStrength: 1,
          priorExperience: 'never',
          holdDuration: '<3s',
        }),
      ),
    ).toBe('beginner');
  });

  it('returns intermediate for mid scores', () => {
    expect(
      recommendLevel(
        answers({
          currentStrength: 3,
          priorExperience: 'tried',
          holdDuration: '3-5s',
        }),
      ),
    ).toBe('intermediate');
  });

  it('returns advanced for high scores', () => {
    expect(
      recommendLevel(
        answers({
          currentStrength: 5,
          priorExperience: 'regularly',
          holdDuration: '>10s',
        }),
      ),
    ).toBe('advanced');
  });
});

describe('buildProgram', () => {
  it('produces 8 weeks * 7 days of program days by default', () => {
    const program = buildProgram('beginner', 5, 'general');
    expect(program).toHaveLength(56);
  });

  it('respects the daily minutes target within a reasonable margin', () => {
    const program = buildProgram('beginner', 3, 'general');
    for (const day of program) {
      // Each day's total est. duration should be in [60s, 300s] window
      expect(day.targetDurationS).toBeGreaterThan(60);
      expect(day.targetDurationS).toBeLessThan(300);
    }
  });

  it('every day has at least one exercise', () => {
    const program = buildProgram('advanced', 8, 'strength');
    for (const day of program) {
      expect(day.exercises.length).toBeGreaterThan(0);
    }
  });

  it('control goal prioritizes quick flicks', () => {
    const program = buildProgram('intermediate', 5, 'control');
    expect(program[0].exercises[0].slug).toBe('quick_flicks');
  });
});

describe('defaultStealthFromAnswers', () => {
  it('defaults stealth ON when user trains in public', () => {
    expect(defaultStealthFromAnswers(answers({ trainingEnvironment: 'public' }))).toBe(
      true,
    );
  });
  it('defaults stealth OFF when private or mixed', () => {
    expect(
      defaultStealthFromAnswers(answers({ trainingEnvironment: 'private' })),
    ).toBe(false);
    expect(
      defaultStealthFromAnswers(answers({ trainingEnvironment: 'mixed' })),
    ).toBe(false);
  });
});
