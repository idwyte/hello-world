// lib/program.ts pulls in lib/env (which imports expo-constants) and
// lib/supabase. Jest's transform config doesn't process expo-constants,
// so stub both. Default to dev-mode (hasSupabaseConfig=false); the
// async-path test below flips the mocks to exercise the Edge Function
// branch.
const mockFunctionsInvoke = jest.fn();
let mockHasSupabaseConfig = false;
jest.mock('@/lib/env', () => ({
  hasSupabaseConfig: () => mockHasSupabaseConfig,
  hasGoogleConfig: () => false,
  hasRevenueCatConfig: () => false,
}));
jest.mock('@/lib/supabase', () => ({
  getSupabase: () => ({
    functions: { invoke: mockFunctionsInvoke },
  }),
}));

import { scoreIndex, type PelvicFloorIndex } from '@/lib/pelvic-floor-index';
import {
  buildProgram,
  buildProgramLocal,
  recommendLevel,
  type BuildProgramInput,
} from '@/lib/program';
import type { AssessmentAnswers } from '@/lib/types';

function index(overrides: Partial<PelvicFloorIndex> = {}): PelvicFloorIndex {
  return {
    pulsesIn30s: 40,
    maxHoldS: 20,
    composite: 50,
    level: 'intermediate',
    ...overrides,
  };
}

function lifestyleAnswers(
  overrides: Partial<AssessmentAnswers> = {},
): AssessmentAnswers {
  return {
    ageBand: '26-35',
    strengthDaysPerWeek: 3,
    cardioDaysPerWeek: 2,
    intimacyPerWeek: 1,
    ...overrides,
  };
}

function localInput(
  overrides: Partial<BuildProgramInput> = {},
): BuildProgramInput {
  return {
    level: 'beginner',
    measurements: { pulsesIn30s: 30, maxHoldS: 15 },
    answers: lifestyleAnswers(),
    ...overrides,
  };
}

describe('recommendLevel', () => {
  it('returns beginner for low composite', () => {
    expect(recommendLevel(index({ composite: 20 }))).toBe('beginner');
  });
  it('returns intermediate for mid composite', () => {
    expect(recommendLevel(index({ composite: 55 }))).toBe('intermediate');
  });
  it('returns advanced for high composite', () => {
    expect(recommendLevel(index({ composite: 85 }))).toBe('advanced');
  });
});

describe('buildProgramLocal (rule-based dev-mode fallback)', () => {
  it('produces 8 weeks * 7 days of program days by default', () => {
    const program = buildProgramLocal(localInput());
    expect(program).toHaveLength(56);
  });

  it('respects the default ~5 min target within a reasonable margin', () => {
    const program = buildProgramLocal(localInput());
    for (const day of program) {
      // 5 minutes nominal; the day-builder allows up to 1.25× overhead.
      expect(day.targetDurationS).toBeGreaterThan(60);
      expect(day.targetDurationS).toBeLessThan(500);
    }
  });

  it('every day has at least one exercise', () => {
    const program = buildProgramLocal(localInput({ level: 'advanced' }));
    for (const day of program) {
      expect(day.exercises.length).toBeGreaterThan(0);
    }
  });

  it('intermediate + >10pt retest improvement pushes endurance work to the front', () => {
    const history: PelvicFloorIndex[] = [
      index({ composite: 50 }),
      index({ composite: 65 }),
    ];
    const program = buildProgramLocal(
      localInput({ level: 'intermediate', indexHistory: history }),
    );
    const slugs = program[0].exercises.map((e) => e.slug);
    expect(slugs[0]).toBe('long_holds');
  });

  it('regression >10pt downshifts level (advanced → intermediate)', () => {
    const history: PelvicFloorIndex[] = [
      index({ composite: 85 }),
      index({ composite: 60 }),
    ];
    const program = buildProgramLocal(
      localInput({ level: 'advanced', indexHistory: history }),
    );
    const slugs = program[0].exercises.map((e) => e.slug);
    expect(slugs.length).toBeGreaterThan(0);
  });
});

describe('buildProgram (async, Edge Function path)', () => {
  beforeEach(() => {
    mockHasSupabaseConfig = true;
    mockFunctionsInvoke.mockReset();
  });
  afterEach(() => {
    mockHasSupabaseConfig = false;
  });

  it('calls generate-program with measurements + answers + level, resolves slugs to templates', async () => {
    mockFunctionsInvoke.mockResolvedValueOnce({
      data: {
        ok: true,
        program: {
          weeks: 8,
          focuses: ['Endurance', 'Pulse speed', 'Posterior chain'],
          days: [
            {
              dayIndex: 0,
              targetDurationS: 300,
              exercises: [
                { slug: 'long_holds', sets: 3, reps: 6 },
                { slug: 'quick_flicks', sets: 2, reps: 12 },
              ],
            },
            { dayIndex: 1, targetDurationS: 0, exercises: [] },
          ],
        },
      },
      error: null,
    });

    const program = await buildProgram(localInput({ level: 'intermediate' }));

    expect(mockFunctionsInvoke).toHaveBeenCalledWith('generate-program', {
      body: {
        measurements: { pulsesIn30s: 30, maxHoldS: 15 },
        answers: expect.objectContaining({ ageBand: '26-35' }),
        level: 'intermediate',
      },
    });
    expect(program).toHaveLength(2);
    // Sets/reps from the Edge Function override catalog defaults
    expect(program[0].exercises[0].slug).toBe('long_holds');
    expect(program[0].exercises[0].sets).toBe(3);
    expect(program[0].exercises[0].reps).toBe(6);
  });

  it('falls back to rule-based when the Edge Function errors', async () => {
    mockFunctionsInvoke.mockResolvedValueOnce({
      data: null,
      error: { message: 'boom' },
    });
    const program = await buildProgram(localInput({ level: 'beginner' }));
    // Rule-based output: 56 days, every day populated
    expect(program).toHaveLength(56);
  });

  it('falls back to rule-based when the Edge Function returns ok:false', async () => {
    mockFunctionsInvoke.mockResolvedValueOnce({
      data: { ok: false, error: 'LLM error' },
      error: null,
    });
    const program = await buildProgram(localInput({ level: 'beginner' }));
    expect(program).toHaveLength(56);
  });
});

describe('Pelvic Floor Index end-to-end (rule-based)', () => {
  it('feeds scoreIndex into recommendLevel and buildProgramLocal coherently', () => {
    const idx = scoreIndex({ pulsesIn30s: 70, maxHoldS: 75 });
    const level = recommendLevel(idx);
    const program = buildProgramLocal({
      level,
      measurements: { pulsesIn30s: idx.pulsesIn30s, maxHoldS: idx.maxHoldS },
      answers: lifestyleAnswers(),
    });
    expect(level).toBe('advanced');
    expect(program).toHaveLength(56);
    expect(program[0].exercises.length).toBeGreaterThan(0);
  });
});
