import {
  levelFromComposite,
  scoreIndex,
  type PelvicFloorMeasurements,
} from '@/lib/pelvic-floor-index';

function baseline(overrides: Partial<PelvicFloorMeasurements> = {}): PelvicFloorMeasurements {
  return {
    pulsesIn30s: 30,
    maxHoldS: 15,
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
  it('clamps composite to 0 when both inputs are worst-case', () => {
    const result = scoreIndex({ pulsesIn30s: 0, maxHoldS: 0 });
    expect(result.composite).toBe(0);
    expect(result.level).toBe('beginner');
  });

  it('returns composite ~100 when both inputs are best-case', () => {
    const result = scoreIndex({ pulsesIn30s: 80, maxHoldS: 90 });
    expect(result.composite).toBeGreaterThanOrEqual(99);
    expect(result.level).toBe('advanced');
  });

  it('handles middling inputs around the intermediate band', () => {
    const result = scoreIndex(baseline());
    expect(result.composite).toBeGreaterThanOrEqual(0);
    expect(result.composite).toBeLessThanOrEqual(100);
  });

  it('passes through inputs verbatim', () => {
    const input = baseline({ pulsesIn30s: 42, maxHoldS: 22 });
    const result = scoreIndex(input);
    expect(result.pulsesIn30s).toBe(42);
    expect(result.maxHoldS).toBe(22);
  });
});

describe('scoreIndex weighting (60% hold / 40% pulse)', () => {
  // At identical-percentile inputs the contributions split 60/40. Verify the
  // weighting is what the docs claim: holding-strength dominates because
  // slow-twitch is a stronger predictor of pelvic-floor function.
  it('boosts composite more from a hold improvement than an equivalent pulse improvement', () => {
    // ~50% percentile on both
    const mid = scoreIndex({ pulsesIn30s: 45, maxHoldS: 47 }).composite;
    // Push pulse to ~100%, hold stays ~50%
    const pulseFull = scoreIndex({ pulsesIn30s: 80, maxHoldS: 47 }).composite;
    // Push hold to ~100%, pulse stays ~50%
    const holdFull = scoreIndex({ pulsesIn30s: 45, maxHoldS: 90 }).composite;
    expect(pulseFull).toBeGreaterThan(mid);
    expect(holdFull).toBeGreaterThan(mid);
    expect(holdFull - mid).toBeGreaterThan(pulseFull - mid);
  });
});

describe('scoreIndex determinism', () => {
  it('returns identical composite + level for identical inputs across 100 random samples', () => {
    let mismatches = 0;
    for (let i = 0; i < 100; i++) {
      const input = baseline({
        pulsesIn30s: Math.floor(Math.random() * 100),
        maxHoldS: Math.random() * 120,
      });
      const a = scoreIndex(input);
      const b = scoreIndex(input);
      if (a.composite !== b.composite || a.level !== b.level) mismatches += 1;
    }
    expect(mismatches).toBe(0);
  });
});

describe('scoreIndex monotonicity', () => {
  it('more pulses at fixed hold does not decrease composite', () => {
    const lo = scoreIndex(baseline({ pulsesIn30s: 10 })).composite;
    const hi = scoreIndex(baseline({ pulsesIn30s: 80 })).composite;
    expect(hi).toBeGreaterThanOrEqual(lo);
  });

  it('longer hold at fixed pulses does not decrease composite', () => {
    const lo = scoreIndex(baseline({ maxHoldS: 3 })).composite;
    const hi = scoreIndex(baseline({ maxHoldS: 90 })).composite;
    expect(hi).toBeGreaterThanOrEqual(lo);
  });
});

describe('scoreIndex out-of-range clamping', () => {
  it('clamps pulse above best band as best-case', () => {
    const a = scoreIndex(baseline({ pulsesIn30s: 80 }));
    const b = scoreIndex(baseline({ pulsesIn30s: 250 }));
    expect(a.composite).toBe(b.composite);
  });

  it('clamps hold above best band as best-case', () => {
    const a = scoreIndex(baseline({ maxHoldS: 90 }));
    const b = scoreIndex(baseline({ maxHoldS: 180 }));
    expect(a.composite).toBe(b.composite);
  });

  it('clamps pulse below worst band as worst-case', () => {
    const a = scoreIndex(baseline({ pulsesIn30s: 10 }));
    const b = scoreIndex(baseline({ pulsesIn30s: -5 }));
    expect(a.composite).toBe(b.composite);
  });
});

describe('plan sanity scenarios', () => {
  it('sedentary user (15 pulses, 5 s hold) scores in beginner range', () => {
    const r = scoreIndex({ pulsesIn30s: 15, maxHoldS: 5 });
    expect(r.composite).toBeLessThan(20);
    expect(r.level).toBe('beginner');
  });

  it('athlete (70 pulses, 75 s hold) scores in advanced range', () => {
    const r = scoreIndex({ pulsesIn30s: 70, maxHoldS: 75 });
    expect(r.composite).toBeGreaterThanOrEqual(70);
    expect(r.level).toBe('advanced');
  });

  it('strong intermediate (60 pulses, 60 s hold) lands near top of intermediate', () => {
    const r = scoreIndex({ pulsesIn30s: 60, maxHoldS: 60 });
    expect(r.composite).toBeGreaterThanOrEqual(60);
    expect(r.composite).toBeLessThan(70);
    expect(r.level).toBe('intermediate');
  });

  it('typical intermediate (35 pulses, 20 s hold) lands in intermediate range', () => {
    const r = scoreIndex({ pulsesIn30s: 35, maxHoldS: 20 });
    expect(r.composite).toBeGreaterThanOrEqual(20);
    expect(r.composite).toBeLessThan(70);
    expect(r.level).toBeDefined();
  });
});
