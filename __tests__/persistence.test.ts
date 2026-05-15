/**
 * Mocked-Supabase test for the persistence helper. We intercept env reads and
 * `getSupabase()` to assert on the writes made by `saveAssessmentAndProgram`
 * and `markOnboarded` without touching a real backend.
 */

import type { AssessmentAnswers } from '@/lib/types';

jest.mock('@/lib/env', () => ({
  env: {},
  hasSupabaseConfig: () => true,
  hasGoogleConfig: () => false,
}));

type Call = { table: string; op: string; payload: unknown; eq?: [string, unknown][] };

const calls: Call[] = [];

function makeBuilder(table: string, op: string, payload: unknown) {
  const eq: [string, unknown][] = [];
  const builder: {
    eq: (col: string, val: unknown) => typeof builder;
    select: (cols?: string) => typeof builder;
    single: () => Promise<{ data: { id: string } | null; error: null }>;
    then: <R>(
      onFulfilled: (v: { data: null; error: null }) => R,
    ) => Promise<R>;
  } = {
    eq(col: string, val: unknown) {
      eq.push([col, val]);
      return builder;
    },
    select() {
      return builder;
    },
    async single() {
      calls.push({ table, op, payload, eq });
      return { data: { id: 'program-uuid-fake' }, error: null };
    },
    then(onFulfilled) {
      calls.push({ table, op, payload, eq });
      return Promise.resolve(onFulfilled({ data: null, error: null }));
    },
  };
  return builder;
}

const mockSupabase = {
  auth: {
    getUser: async () => ({
      data: { user: { id: 'user-uuid-fake' } },
      error: null,
    }),
  },
  from: (table: string) => ({
    insert: (payload: unknown) => makeBuilder(table, 'insert', payload),
    update: (payload: unknown) => makeBuilder(table, 'update', payload),
  }),
};

jest.mock('@/lib/supabase', () => ({
  getSupabase: () => mockSupabase,
}));

import {
  markOnboarded,
  rawAssessmentScore,
  saveAssessmentAndProgram,
} from '@/lib/persistence';

const sampleAnswers: AssessmentAnswers = {
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

describe('rawAssessmentScore', () => {
  it('handles all priorExperience and holdDuration values', () => {
    expect(rawAssessmentScore(sampleAnswers)).toBe(3 + 1 + 0);
    expect(
      rawAssessmentScore({
        ...sampleAnswers,
        priorExperience: 'regularly',
        holdDuration: '>10s',
      }),
    ).toBe(3 + 2 + 2);
    expect(
      rawAssessmentScore({
        ...sampleAnswers,
        priorExperience: 'never',
        holdDuration: '<3s',
      }),
    ).toBe(3 + 0 - 1);
  });
});

describe('saveAssessmentAndProgram', () => {
  beforeEach(() => {
    calls.length = 0;
  });

  it('writes assessment, deactivates prior programs, inserts program + days', async () => {
    const id = await saveAssessmentAndProgram({
      answers: sampleAnswers,
      level: 'beginner',
      rawScore: 4,
      program: [
        { dayIndex: 0, exercises: [], targetDurationS: 240 },
        { dayIndex: 1, exercises: [], targetDurationS: 240 },
      ],
    });
    expect(id).toBe('program-uuid-fake');

    expect(calls.map((c) => `${c.table}.${c.op}`)).toEqual([
      'assessments.insert',
      'programs.update',
      'programs.insert',
      'program_days.insert',
    ]);

    const assessment = calls[0];
    expect(assessment.payload).toMatchObject({
      user_id: 'user-uuid-fake',
      answers: sampleAnswers,
      score: 4,
      recommended_level: 'beginner',
    });

    const deactivate = calls[1];
    expect(deactivate.payload).toEqual({ active: false });
    expect(deactivate.eq).toEqual(
      expect.arrayContaining([
        ['user_id', 'user-uuid-fake'],
        ['active', true],
      ]),
    );

    const program = calls[2];
    expect(program.payload).toMatchObject({
      user_id: 'user-uuid-fake',
      level: 'beginner',
      active: true,
    });

    const days = calls[3];
    expect(Array.isArray(days.payload)).toBe(true);
    expect((days.payload as unknown[]).length).toBe(2);
  });
});

describe('markOnboarded', () => {
  beforeEach(() => {
    calls.length = 0;
  });

  it('updates profiles.onboarded_at for the current user', async () => {
    await markOnboarded();
    expect(calls).toHaveLength(1);
    const c = calls[0];
    expect(c.table).toBe('profiles');
    expect(c.op).toBe('update');
    expect(c.payload).toEqual({
      onboarded_at: expect.any(String),
    });
    expect(c.eq).toEqual([['id', 'user-uuid-fake']]);
  });
});
