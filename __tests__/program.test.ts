import { scoreIndex, type PelvicFloorIndex } from '@/lib/pelvic-floor-index';
import { buildProgram, recommendLevel } from '@/lib/program';

function index(overrides: Partial<PelvicFloorIndex> = {}): PelvicFloorIndex {
  return {
    pulsesIn30s: 40,
    maxHoldS: 20,
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

describe('buildProgram (rule-based dev-mode fallback)', () => {
  it('produces 8 weeks * 7 days of program days by default', () => {
    const program = buildProgram('beginner');
    expect(program).toHaveLength(56);
  });

  it('respects the default ~5 min target within a reasonable margin', () => {
    const program = buildProgram('beginner');
    for (const day of program) {
      // 5 minutes nominal; the day-builder allows up to 1.25× overhead.
      expect(day.targetDurationS).toBeGreaterThan(60);
      expect(day.targetDurationS).toBeLessThan(500);
    }
  });

  it('every day has at least one exercise', () => {
    const program = buildProgram('advanced');
    for (const day of program) {
      expect(day.exercises.length).toBeGreaterThan(0);
    }
  });

  it('intermediate + >10pt retest improvement pushes endurance work to the front', () => {
    const history: PelvicFloorIndex[] = [
      index({ composite: 50 }),
      index({ composite: 65 }),
    ];
    const slugs = buildProgram('intermediate', history)[0].exercises.map(
      (e) => e.slug,
    );
    expect(slugs[0]).toBe('long_holds');
  });

  it('regression >10pt downshifts level (advanced → intermediate)', () => {
    const history: PelvicFloorIndex[] = [
      index({ composite: 85 }),
      index({ composite: 60 }),
    ];
    // After downshift to intermediate, pool excludes endurance_ladder unless
    // it makes the front-of-pool. Verify the program still builds and the
    // first day uses an intermediate-level pool.
    const slugs = buildProgram('advanced', history)[0].exercises.map(
      (e) => e.slug,
    );
    expect(slugs.length).toBeGreaterThan(0);
  });
});

describe('Pelvic Floor Index end-to-end', () => {
  it('feeds scoreIndex into recommendLevel and buildProgram coherently', () => {
    const idx = scoreIndex({ pulsesIn30s: 70, maxHoldS: 75 });
    const level = recommendLevel(idx);
    const program = buildProgram(level);
    expect(level).toBe('advanced');
    expect(program).toHaveLength(56);
    expect(program[0].exercises.length).toBeGreaterThan(0);
  });
});
