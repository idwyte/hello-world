import {
  QUESTIONS,
  isAssessmentComplete,
} from '@/lib/assessment-questions';
import type { AssessmentAnswers } from '@/lib/types';

describe('assessment questions', () => {
  it('has exactly 10 questions', () => {
    expect(QUESTIONS).toHaveLength(10);
  });

  it('every question id is unique', () => {
    const ids = QUESTIONS.map((q) => q.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('every question has at least 2 choices', () => {
    for (const q of QUESTIONS) {
      expect(q.choices.length).toBeGreaterThanOrEqual(2);
    }
  });

  it('question 9 is the trainingEnvironment seed for Stealth default', () => {
    expect(QUESTIONS[8].id).toBe('trainingEnvironment');
  });

  it('question 10 is recentMedical and triggers the disclaimer', () => {
    expect(QUESTIONS[9].id).toBe('recentMedical');
  });
});

describe('isAssessmentComplete', () => {
  it('false when draft is empty', () => {
    expect(isAssessmentComplete({})).toBe(false);
  });

  it('false when one field is missing', () => {
    const partial: Partial<AssessmentAnswers> = {
      ageBand: '25-34',
      currentStrength: 3,
      symptoms: ['none'],
      priorExperience: 'tried',
      holdDuration: '3-5s',
      goal: 'control',
      dailyMinutes: 5,
      preferredTime: 'evening',
      trainingEnvironment: 'private',
      // recentMedical missing
    };
    expect(isAssessmentComplete(partial)).toBe(false);
  });

  it('true when all fields present', () => {
    const full: AssessmentAnswers = {
      ageBand: '25-34',
      currentStrength: 3,
      symptoms: ['none'],
      priorExperience: 'tried',
      holdDuration: '3-5s',
      goal: 'control',
      dailyMinutes: 5,
      preferredTime: 'evening',
      trainingEnvironment: 'private',
      recentMedical: false,
    };
    expect(isAssessmentComplete(full)).toBe(true);
  });
});
