import {
  buildProfileV2,
  deriveFiberBias,
  deriveRelaxation,
  routeArchetype,
  v2ToLegacyMeasurements,
  type AssessmentV2Answers,
} from '@/lib/assessment-v2';

const cleanAnswers: AssessmentV2Answers = {
  strengthOxford: 3,
  enduranceSeconds: 8,
  repCeiling: 6,
  fastCount: 12,
  coordinationFlags: [],
  release: 'easy',
  symptomFlags: [],
};

describe('routeArchetype — the safety branch', () => {
  it('routes possible_hypertonic to down_training regardless of strength', () => {
    expect(
      routeArchetype({
        relaxation: 'possible_hypertonic',
        coordination: 'clean',
        strengthOxford: 5,
      }),
    ).toBe('down_training');
  });

  it('routes compensating coordination to foundation', () => {
    expect(
      routeArchetype({
        relaxation: 'ok',
        coordination: 'compensating',
        strengthOxford: 3,
      }),
    ).toBe('foundation');
  });

  it('routes zero strength to foundation', () => {
    expect(
      routeArchetype({
        relaxation: 'ok',
        coordination: 'clean',
        strengthOxford: 0,
      }),
    ).toBe('foundation');
  });

  it('clean + capable → strengthening', () => {
    expect(
      routeArchetype({
        relaxation: 'ok',
        coordination: 'clean',
        strengthOxford: 3,
      }),
    ).toBe('strengthening');
  });

  it('down_training wins over foundation when both fire', () => {
    expect(
      routeArchetype({
        relaxation: 'possible_hypertonic',
        coordination: 'compensating',
        strengthOxford: 0,
      }),
    ).toBe('down_training');
  });
});

describe('deriveRelaxation — conservative by design', () => {
  it('tight release flags hypertonic with no symptoms', () => {
    expect(deriveRelaxation('tight', [])).toBe('possible_hypertonic');
  });

  it('ANY single symptom flag is sufficient', () => {
    expect(deriveRelaxation('easy', ['urgency'])).toBe('possible_hypertonic');
  });

  it('worse_after_kegels — the decisive flag — routes in', () => {
    expect(deriveRelaxation('easy', ['worse_after_kegels'])).toBe(
      'possible_hypertonic',
    );
  });

  it('easy release + no symptoms is ok', () => {
    expect(deriveRelaxation('easy', [])).toBe('ok');
  });

  it('partial release alone does not flag (it is common + benign)', () => {
    expect(deriveRelaxation('partial', [])).toBe('ok');
  });
});

describe('deriveFiberBias', () => {
  it('weak endurance + ok flicks → slow_deficit', () => {
    expect(
      deriveFiberBias({ enduranceSeconds: 3, repCeiling: 2, fastCount: 14 }),
    ).toBe('slow_deficit');
  });

  it('ok endurance + weak flicks → fast_deficit', () => {
    expect(
      deriveFiberBias({ enduranceSeconds: 9, repCeiling: 7, fastCount: 4 }),
    ).toBe('fast_deficit');
  });

  it('both weak → balanced (conservative volume)', () => {
    expect(
      deriveFiberBias({ enduranceSeconds: 2, repCeiling: 1, fastCount: 3 }),
    ).toBe('balanced');
  });

  it('both strong → advanced', () => {
    expect(
      deriveFiberBias({ enduranceSeconds: 11, repCeiling: 9, fastCount: 20 }),
    ).toBe('advanced');
  });
});

describe('buildProfileV2', () => {
  it('produces a complete vector with clamped values', () => {
    const p = buildProfileV2(
      { ...cleanAnswers, enduranceSeconds: 45, fastCount: 99 },
      { ageBand: '26-35', trainFreq: '3', flags: [] },
    );
    expect(p.endurance_seconds).toBe(12); // capped
    expect(p.fast_count).toBe(30); // capped
    expect(p.archetype).toBe('strengthening');
    expect(p.coordination).toBe('clean');
    expect(p.relaxation).toBe('ok');
    expect(p.context.age_band).toBe('26-35');
  });

  it('symptomatic answers produce a down_training vector', () => {
    const p = buildProfileV2({
      ...cleanAnswers,
      release: 'tight',
      symptomFlags: ['worse_after_kegels'],
    });
    expect(p.archetype).toBe('down_training');
    expect(p.relaxation).toBe('possible_hypertonic');
  });
});

describe('v2ToLegacyMeasurements — Index continuity', () => {
  it('doubles the 15s fast count into a 30s pulses equivalent', () => {
    expect(v2ToLegacyMeasurements({ fastCount: 12, enduranceSeconds: 8 }))
      .toEqual({ pulsesIn30s: 24, maxHoldS: 8 });
  });
});
