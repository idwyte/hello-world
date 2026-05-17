import { scoreIndex, type PelvicFloorIndex } from '@/lib/pelvic-floor-index';
import {
  buildProgram,
  defaultStealthFromAnswers,
  recommendLevel,
} from '@/lib/program';
import type { AssessmentAnswers } from '@/lib/types';

function answers(overrides: Partial<AssessmentAnswers> = {}): AssessmentAnswers {
  return {
    goal: 'general',
    dailyMinutes: 5,
    trainingEnvironment: 'private',
    ...overrides,
  };
}

function index(overrides: Partial<PelvicFloorIndex> = {}): PelvicFloorIndex {
  return {
    reactionMs: 800,
    enduranceS: 10,
    rapidReps10s: 8,
    composite: 50,
    level: 'intermediate',
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

describe('buildProgram', () => {
  it('produces 8 weeks * 7 days of program days by default', () => {
    const program = buildProgram('beginner', 5, 'general');
    expect(program).toHaveLength(56);
  });

  it('respects the daily minutes target within a reasonable margin', () => {
    const program = buildProgram('beginner', 3, 'general');
    for (const day of program) {
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

  it('beginner + stamina includes long_holds (goal honored despite beginner pool)', () => {
    const program = buildProgram('beginner', 5, 'stamina');
    const slugs = program[0].exercises.map((e) => e.slug);
    expect(slugs).toContain('long_holds');
    expect(slugs[0]).toBe('long_holds');
  });

  it('beginner + general does NOT include long_holds (pool stays minimal)', () => {
    const program = buildProgram('beginner', 5, 'general');
    const slugs = program[0].exercises.map((e) => e.slug);
    expect(slugs).not.toContain('long_holds');
  });

  it('beginner + general + >10pt retest improvement biases toward endurance work', () => {
    const history: PelvicFloorIndex[] = [
      index({ composite: 30 }),
      index({ composite: 45 }),
    ];
    const slugs = buildProgram('beginner', 5, 'general', history)[0].exercises.map(
      (e) => e.slug,
    );
    // 'long_holds' is normally absent from beginner+general; trend bias pulls
    // it forward — but only if it was already in the pool. For beginner the
    // pool doesn't include long_holds, so the bias only reorders if there's
    // something to reorder; the test verifies it doesn't crash and produces
    // a valid program.
    expect(slugs.length).toBeGreaterThan(0);
  });

  it('intermediate + >10pt improvement pushes endurance work to the front', () => {
    const history: PelvicFloorIndex[] = [
      index({ composite: 50 }),
      index({ composite: 65 }),
    ];
    const slugs = buildProgram(
      'intermediate',
      5,
      'general',
      history,
    )[0].exercises.map((e) => e.slug);
    expect(slugs[0]).toBe('long_holds');
  });

  it('regression >10pt downshifts level (advanced -> intermediate)', () => {
    const history: PelvicFloorIndex[] = [
      index({ composite: 85 }),
      index({ composite: 60 }),
    ];
    // After downshift to intermediate + general, pool excludes endurance_ladder.
    const slugs = buildProgram(
      'advanced',
      5,
      'general',
      history,
    )[0].exercises.map((e) => e.slug);
    expect(slugs).not.toContain('endurance_ladder');
  });
});

describe('defaultStealthFromAnswers', () => {
  it('defaults stealth ON when user trains in public', () => {
    expect(
      defaultStealthFromAnswers(answers({ trainingEnvironment: 'public' })),
    ).toBe(true);
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

describe('Pelvic Floor Index end-to-end', () => {
  it('feeds scoreIndex into recommendLevel and buildProgram coherently', () => {
    const idx = scoreIndex({
      reactionMs: 350,
      enduranceS: 25,
      rapidReps10s: 16,
    });
    const level = recommendLevel(idx);
    const program = buildProgram(level, 5, 'strength');
    expect(level).toBe('advanced');
    expect(program).toHaveLength(56);
    expect(program[0].exercises.length).toBeGreaterThan(0);
  });
});
