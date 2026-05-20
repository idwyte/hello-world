/**
 * Mocked-Supabase test for the persistence helper. We intercept env reads and
 * `getSupabase()` to assert on the writes made by `saveAssessmentAndProgram`
 * and `markOnboarded` without touching a real backend.
 */

import { scoreIndex } from '@/lib/pelvic-floor-index';
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
  saveAssessmentAndProgram,
  saveIndexRetest,
} from '@/lib/persistence';

const sampleAnswers: AssessmentAnswers = {
  ageBand: '26-35',
  strengthDaysPerWeek: 3,
  cardioDaysPerWeek: 2,
  intimacyPerWeek: 3,
};

const sampleIndex = scoreIndex({
  pulsesIn30s: 45,
  maxHoldS: 25,
});

describe('saveAssessmentAndProgram', () => {
  beforeEach(() => {
    calls.length = 0;
  });

  it('writes assessment, index, deactivates prior programs, inserts program + days', async () => {
    const id = await saveAssessmentAndProgram({
      answers: sampleAnswers,
      index: sampleIndex,
      level: 'intermediate',
      program: [
        { dayIndex: 0, exercises: [], targetDurationS: 240 },
        { dayIndex: 1, exercises: [], targetDurationS: 240 },
      ],
    });
    expect(id).toBe('program-uuid-fake');

    expect(calls.map((c) => `${c.table}.${c.op}`)).toEqual([
      'assessments.insert',
      'pelvic_floor_assessments.insert',
      'programs.update',
      'programs.insert',
      'program_days.insert',
    ]);

    const assessment = calls[0];
    expect(assessment.payload).toMatchObject({
      user_id: 'user-uuid-fake',
      answers: sampleAnswers,
      score: null,
      recommended_level: 'intermediate',
    });

    const index = calls[1];
    expect(index.payload).toMatchObject({
      user_id: 'user-uuid-fake',
      pulses_in_30s: Math.round(sampleIndex.pulsesIn30s),
      max_hold_s: sampleIndex.maxHoldS,
      composite: sampleIndex.composite,
      level: sampleIndex.level,
    });

    const deactivate = calls[2];
    expect(deactivate.payload).toEqual({ active: false });
    expect(deactivate.eq).toEqual(
      expect.arrayContaining([
        ['user_id', 'user-uuid-fake'],
        ['active', true],
      ]),
    );

    const program = calls[3];
    expect(program.payload).toMatchObject({
      user_id: 'user-uuid-fake',
      level: 'intermediate',
      active: true,
    });

    const days = calls[4];
    expect(Array.isArray(days.payload)).toBe(true);
    expect((days.payload as unknown[]).length).toBe(2);
  });
});

describe('saveIndexRetest', () => {
  beforeEach(() => {
    calls.length = 0;
  });

  it('inserts a single row to pelvic_floor_assessments', async () => {
    await saveIndexRetest(sampleIndex);
    expect(calls).toHaveLength(1);
    expect(calls[0].table).toBe('pelvic_floor_assessments');
    expect(calls[0].op).toBe('insert');
    expect(calls[0].payload).toMatchObject({
      user_id: 'user-uuid-fake',
      composite: sampleIndex.composite,
      level: sampleIndex.level,
    });
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
