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
      // logCompletedSession chains .insert().select('id').single() to
      // get the inserted row id back, so return the chain — `single()`
      // resolves to a fake id and `error: null`.
      return chain;
    },
    single: async () => {
      if (table === 'sessions') {
        return { data: { id: 's_inserted_id' }, error: null };
      }
      return { data: null, error: null };
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
  daysSinceLastIndex,
  fetchRecentSessions,
  fetchStreak,
  logCompletedSession,
  RETEST_INTERVAL_DAYS,
  type FetchedIndex,
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

describe('daysSinceLastIndex', () => {
  function entry(createdAt: string): FetchedIndex {
    return {
      pulsesIn30s: 40,
      maxHoldS: 20,
      composite: 50,
      level: 'intermediate',
      createdAt,
    };
  }

  it('returns null for empty history', () => {
    expect(daysSinceLastIndex([])).toBeNull();
  });

  it('returns 0 for a measurement taken today', () => {
    const now = new Date('2026-05-20T12:00:00Z');
    const history = [entry('2026-05-20T08:00:00Z')];
    expect(daysSinceLastIndex(history, now)).toBe(0);
  });

  it('returns the floor of the day diff to the most recent (last) entry', () => {
    const now = new Date('2026-05-20T08:00:00Z');
    const history = [
      // fetchIndexHistory returns oldest-first, so this is the prior measurement
      entry('2026-04-01T08:00:00Z'),
      // and this is the most recent
      entry('2026-05-13T08:00:00Z'),
    ];
    expect(daysSinceLastIndex(history, now)).toBe(7);
  });

  it('flags an early retest (under the recommended interval)', () => {
    const now = new Date('2026-05-20T08:00:00Z');
    const history = [entry('2026-05-15T08:00:00Z')];
    const d = daysSinceLastIndex(history, now);
    expect(d).toBe(5);
    expect(d! < RETEST_INTERVAL_DAYS).toBe(true);
  });

  it('clamps negative diffs to 0 (defensive — should not happen)', () => {
    const now = new Date('2026-05-20T08:00:00Z');
    const history = [entry('2026-05-21T08:00:00Z')]; // future timestamp
    expect(daysSinceLastIndex(history, now)).toBe(0);
  });
});
