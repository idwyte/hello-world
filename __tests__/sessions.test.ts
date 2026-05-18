/**
 * Mocked-Supabase tests for the session persistence helpers.
 */

jest.mock('@/lib/env', () => ({
  env: {},
  hasSupabaseConfig: () => true,
  hasGoogleConfig: () => false,
}));

type Call = {
  table: string;
  op: string;
  payload?: unknown;
  filters: Array<[string, unknown]>;
};

const calls: Call[] = [];
const fakeSessions = [
  { id: 's1', started_at: '2024-01-03T08:00:00Z', ended_at: '2024-01-03T08:04:00Z', mode: 'normal', completed: true },
  { id: 's2', started_at: '2024-01-02T08:00:00Z', ended_at: '2024-01-02T08:04:00Z', mode: 'stealth', completed: true },
];
const fakeStreak = {
  current: 5,
  longest: 9,
  last_session_date: '2024-01-03',
  freezes: 1,
  last_freeze_earned_at: '2024-01-01',
};

function makeChain(table: string) {
  const filters: Array<[string, unknown]> = [];
  let selecting: string | null = null;
  let limitVal: number | null = null;
  let order: { col: string; asc: boolean } | null = null;
  const chain: any = {
    insert(payload: unknown) {
      calls.push({ table, op: 'insert', payload, filters });
      return { error: null };
    },
    update(payload: unknown) {
      return {
        eq(col: string, val: unknown) {
          filters.push([col, val]);
          calls.push({ table, op: 'update', payload, filters });
          return { error: null };
        },
      };
    },
    upsert(payload: unknown) {
      calls.push({ table, op: 'upsert', payload, filters });
      return { error: null };
    },
    select(cols?: string) {
      selecting = cols ?? null;
      return chain;
    },
    eq(col: string, val: unknown) {
      filters.push([col, val]);
      return chain;
    },
    order(col: string, opts: { ascending: boolean }) {
      order = { col, asc: opts.ascending };
      return chain;
    },
    limit(n: number) {
      limitVal = n;
      return chain;
    },
    maybeSingle: async () => {
      if (table === 'streaks') {
        return { data: fakeStreak, error: null };
      }
      return { data: null, error: null };
    },
    then: <R,>(onFulfilled: (v: { data: unknown; error: null }) => R) => {
      if (table === 'sessions') {
        return Promise.resolve(onFulfilled({ data: fakeSessions, error: null }));
      }
      return Promise.resolve(onFulfilled({ data: null, error: null }));
    },
  };
  void selecting;
  void limitVal;
  void order;
  return chain;
}

const mockSupabase = {
  auth: {
    getUser: async () => ({ data: { user: { id: 'u1' } }, error: null }),
  },
  from: (t: string) => makeChain(t),
};

jest.mock('@/lib/supabase', () => ({
  getSupabase: () => mockSupabase,
}));

import {
  fetchRecentSessions,
  fetchStreak,
  logCompletedSession,
} from '@/lib/sessions';

beforeEach(() => {
  calls.length = 0;
});

describe('logCompletedSession', () => {
  it('inserts into sessions with the correct payload', async () => {
    const started = new Date('2024-01-03T08:00:00Z');
    const ended = new Date('2024-01-03T08:04:00Z');
    await logCompletedSession({
      programDayId: 'pd1',
      startedAt: started,
      endedAt: ended,
      mode: 'normal',
      repsPlanned: 10,
      repsCompleted: 9,
      perceivedEffort: 3,
    });
    expect(calls).toHaveLength(1);
    expect(calls[0].table).toBe('sessions');
    expect(calls[0].op).toBe('insert');
    expect(calls[0].payload).toMatchObject({
      user_id: 'u1',
      program_day_id: 'pd1',
      started_at: started.toISOString(),
      ended_at: ended.toISOString(),
      completed: true,
      mode: 'normal',
      reps_planned: 10,
      reps_completed: 9,
      perceived_effort: 3,
    });
  });
});

describe('fetchRecentSessions', () => {
  it('maps Supabase rows to the FetchedSession shape', async () => {
    const result = await fetchRecentSessions(50);
    expect(result).toHaveLength(2);
    expect(result[0]).toMatchObject({
      id: 's1',
      startedAt: '2024-01-03T08:00:00Z',
      mode: 'normal',
      completed: true,
    });
  });
});

describe('fetchStreak', () => {
  it('returns the streak row when present, including freezes', async () => {
    const s = await fetchStreak();
    expect(s).toEqual({
      current: 5,
      longest: 9,
      lastDate: '2024-01-03',
      freezes: 1,
      lastFreezeEarnedAt: '2024-01-01',
    });
  });
});
