import {
  levelFromComposite,
  scoreIndex,
  type PelvicFloorIndexInput,
} from '@/lib/pelvic-floor-index';

function baseline(overrides: Partial<PelvicFloorIndexInput> = {}): PelvicFloorIndexInput {
  return {
    reactionMs: 800,
    enduranceS: 8,
    rapidReps10s: 8,
    ...overrides,
  };
}

describe('levelFromComposite', () => {
  it('beginner below 40', () => {
    expect(levelFromComposite(0)).toBe('beginner');
    expect(levelFromComposite(39.9)).toBe('beginner');
  });
  it('intermediate between 40 and 70', () => {
    expect(levelFromComposite(40)).toBe('intermediate');
    expect(levelFromComposite(55)).toBe('intermediate');
    expect(levelFromComposite(69.9)).toBe('intermediate');
  });
  it('advanced at 70 and above', () => {
    expect(levelFromComposite(70)).toBe('advanced');
    expect(levelFromComposite(100)).toBe('advanced');
  });
});

describe('scoreIndex composite range', () => {
  it('clamps composite to 0 when every input is worst-case', () => {
    const result = scoreIndex({
      reactionMs: 2000,
      enduranceS: 0,
      rapidReps10s: 0,
    });
    expect(result.composite).toBe(0);
    expect(result.level).toBe('beginner');
  });

  it('returns composite ~100 when every input is best-case', () => {
    const result = scoreIndex({
      reactionMs: 200,
      enduranceS: 30,
      rapidReps10s: 20,
    });
    expect(result.composite).toBeGreaterThan(99);
    expect(result.level).toBe('advanced');
  });

  it('handles middling inputs in the intermediate band', () => {
    const result = scoreIndex(baseline());
    expect(result.composite).toBeGreaterThanOrEqual(30);
    expect(result.composite).toBeLessThanOrEqual(70);
  });

  it('passes through inputs verbatim', () => {
    const input = baseline({ reactionMs: 600, enduranceS: 12, rapidReps10s: 10 });
    const result = scoreIndex(input);
    expect(result.reactionMs).toBe(600);
    expect(result.enduranceS).toBe(12);
    expect(result.rapidReps10s).toBe(10);
  });
});

describe('scoreIndex determinism', () => {
  it('returns identical composite + level for identical inputs across 100 random samples', () => {
    let mismatches = 0;
    for (let i = 0; i < 100; i++) {
      const input = baseline({
        reactionMs: 200 + Math.floor(Math.random() * 1000),
        enduranceS: Math.random() * 30,
        rapidReps10s: Math.floor(Math.random() * 20),
      });
      const a = scoreIndex(input);
      const b = scoreIndex(input);
      if (a.composite !== b.composite || a.level !== b.level) mismatches += 1;
    }
    expect(mismatches).toBe(0);
  });
});

describe('scoreIndex monotonicity', () => {
  it('faster reaction at fixed endurance and reps does not decrease composite', () => {
    const slow = scoreIndex(baseline({ reactionMs: 1000 })).composite;
    const fast = scoreIndex(baseline({ reactionMs: 300 })).composite;
    expect(fast).toBeGreaterThanOrEqual(slow);
  });

  it('longer endurance at fixed reaction and reps does not decrease composite', () => {
    const lo = scoreIndex(baseline({ enduranceS: 4 })).composite;
    const hi = scoreIndex(baseline({ enduranceS: 25 })).composite;
    expect(hi).toBeGreaterThanOrEqual(lo);
  });

  it('more rapid reps at fixed reaction and endurance does not decrease composite', () => {
    const lo = scoreIndex(baseline({ rapidReps10s: 5 })).composite;
    const hi = scoreIndex(baseline({ rapidReps10s: 18 })).composite;
    expect(hi).toBeGreaterThanOrEqual(lo);
  });
});

describe('scoreIndex out-of-range clamping', () => {
  it('clamps reaction above worst band as worst-case (composite contribution 0)', () => {
    const a = scoreIndex(baseline({ reactionMs: 1200 }));
    const b = scoreIndex(baseline({ reactionMs: 5000 }));
    expect(a.composite).toBe(b.composite);
  });

  it('clamps endurance above best band as best-case', () => {
    const a = scoreIndex(baseline({ enduranceS: 30 }));
    const b = scoreIndex(baseline({ enduranceS: 60 }));
    expect(a.composite).toBe(b.composite);
  });
});
